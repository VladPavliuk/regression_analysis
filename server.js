var fs = require('fs');
var path = require('path');
var http = require('http');

var staticServe = function (req, res) {
    var fileLoc = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
    console.log(fileLoc);
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