var fs = require('fs');
var path = require('path');
var http = require('http');

var staticServe = function (req, res) {
    var fileLoc = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
    if (fileLoc == '/')
        fileLoc = '/index.html';

    /*const csvFilePath='./housing.csv'
    const csv=require('csvtojson')
    csv()
        .fromFile(csvFilePath)
        .then((jsonObj)=>{
            console.log(jsonObj.slice(0,1000));
            
        })*/

    fs.readFile(__dirname + fileLoc, function (err, data) {
        if (err) {
            res.writeHead(404, 'Not Found');
            res.write('404: File Not Found!');
            return res.end();
        }

        res.statusCode = 200;

        res.write(data);
        return res.end();
    });
};

var httpServer = http.createServer(staticServe);

httpServer.listen(process.env.PORT || 8080);
