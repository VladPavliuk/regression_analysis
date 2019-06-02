import helper from '../helper';

let linearAlgebra = {};

linearAlgebra.getSwappsAmount = list => {
    list = helper.copy(list);
    let swapps = 0;
    let isOrderedFlag = false;

    if (!Array.isArray(list) || list.filter(item => typeof item != 'number').length > 0)
        return false;

    while (!isOrderedFlag) {
        isOrderedFlag = true;
        for (let i = 0; i < list.length - 1; i++) {
            if (list[i] > list[i + 1]) {
                let tmp = list[i];
                list[i] = list[i + 1];
                list[i + 1] = tmp;
                swapps++;
                isOrderedFlag = false;
            }
        }
    }

    return swapps;
};

linearAlgebra.getCombinations = list => {
    list = helper.copy(list);
    let combinations = [];

    for (let j = 0; j < list.length; j++) {
        for (let i = 0; i < list.length - 1; i++) {
            combinations.push(list.slice(0, list.length));
            let tmp = list[i];
            list[i] = list[i + 1];
            list[i + 1] = tmp;
        }
    }

    return combinations;
};

linearAlgebra.getMatrixDeterminant = matrix => {
    let indexes = (new Array(matrix.length)).fill(0).map((item, index) => index);
    let indexesCombinations = linearAlgebra.getCombinations(indexes);
    let sum = 0;

    for (let i = 0; i < indexesCombinations.length; i++) {
        let sign = Math.pow(-1, linearAlgebra.getSwappsAmount(indexesCombinations[i]));

        let product = 1;
        for (let j = 0; j < indexesCombinations[i].length; j++) {
            product *= matrix[j][indexesCombinations[i][j]];
        }

        sum += sign * product;
    }

    return sum;
};

linearAlgebra.getMatrixVectorCombinations = (matrix, vector) => {
    matrix = helper.copy(matrix);
    let res = [];
    let matrixCopy = helper.copy(matrix);

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < vector.length; j++) {
            matrix[j][i] = vector[j];
        }
        res.push(matrix);

        matrix = helper.copy(matrixCopy);
    }

    return res;
};

linearAlgebra.solveSystem = (matrix, vector) => {
    let matrixVectorCombinations = linearAlgebra.getMatrixVectorCombinations(matrix, vector);
    let solution = [];
    let delta = linearAlgebra.getMatrixDeterminant(matrix);

    for (let i = 0; i < matrixVectorCombinations.length; i++) {
        solution.push(linearAlgebra.getMatrixDeterminant(matrixVectorCombinations[i]) / delta);
    }

    return solution;
};

export default linearAlgebra;