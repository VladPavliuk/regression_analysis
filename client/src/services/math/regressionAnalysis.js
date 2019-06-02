import linearAlgebra from "./linearAlgebra";

let regression = {};

regression.polynomial = (points, degree) => {
    let sum = new Array(degree + 1).fill(new Array(degree + 2).fill(0));
    let differentiations = new Array(degree + 1).fill([]);

    points.forEach(point => {
        let data = [];

        for (let i = 0; i <= degree; i++) {
            data.push(Math.pow(point.x, i));
        }

        data.push(-point.y);

        for (let i = 0; i <= degree; i++) {
            differentiations[i] = data.map(item => 2 * data[i] * item);
        }

        for (let i = 0; i < differentiations.length; i++) {
            sum[i] = sum[i].map((x, index) => x + differentiations[i][index]);
        }
    });

    let vector = [];
    for (let i = 0; i < sum.length; i++) {
        vector.push(-sum[i][sum[i].length - 1]);
    }

    let matrix = [];
    for (let i = 0; i < sum.length; i++) {
        matrix.push(sum[i].slice(0, sum[i].length - 1));
    }

    return linearAlgebra.solveSystem(matrix, vector);
}

export default regression;