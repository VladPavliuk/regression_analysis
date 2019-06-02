let getMath = () => {
    let math = {};

    math.getAverage = numbers => numbers.reduce((accumulator, number) => accumulator + number, 0) / numbers.length;
    math.round = (number, decimals) => Math.round(Math.pow(10, decimals) * number) / Math.pow(10, decimals);

    let copy = toCopy => {
        if (Array.isArray(toCopy)) {
            return JSON.parse(JSON.stringify(toCopy));
        }
    };

    let getFactorial = number => {
        if (number === 0)
            return 1;
        return number * getFactorial(number - 1);
    };

    math.linearAlgebra = {};

    math.linearAlgebra.getSwappsAmount = list => {
        list = copy(list);
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

    math.linearAlgebra.getCombinations = list => {
        list = copy(list);
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

    math.linearAlgebra.getMatrixDeterminant = matrix => {
        return mathLib.det(matrix);
        let indexes = (new Array(matrix.length)).fill(0).map((item, index) => index);
        let indexesCombinations = math.linearAlgebra.getCombinations(indexes);
        let sum = 0;

        for (let i = 0; i < indexesCombinations.length; i++) {
            let sign = Math.pow(-1, math.linearAlgebra.getSwappsAmount(indexesCombinations[i]));

            let product = 1;
            for (let j = 0; j < indexesCombinations[i].length; j++) {
                product *= matrix[j][indexesCombinations[i][j]];
            }

            sum += sign * product;
        }

        return sum;
    };

    math.linearAlgebra.getMatrixVectorCombinations = (matrix, vector) => {
        matrix = copy(matrix);
        let res = [];
        let matrixCopy = copy(matrix);

        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < vector.length; j++) {
                matrix[j][i] = vector[j];
            }
            res.push(matrix);

            matrix = copy(matrixCopy);
        }

        return res;
    };

    math.equations = {};

    math.equations.solveSystem = (matrix, vector) => {
        let matrixVectorCombinations = math.linearAlgebra.getMatrixVectorCombinations(matrix, vector);
        let solution = [];
        let delta = math.linearAlgebra.getMatrixDeterminant(matrix);

        for (let i = 0; i < matrixVectorCombinations.length; i++) {
            solution.push(math.linearAlgebra.getMatrixDeterminant(matrixVectorCombinations[i]) / delta);
        }

        return solution;
    };

    math.calculatePolynomialFunction = (coefficients, x) => coefficients.reduce((acc, coef, i) => acc + coef * Math.pow(x, i), 0);

    math.taylorSeries = (derivatives, a) => {
        let taylorPolynomial = [];

        derivatives.forEach((derivative, index) => taylorPolynomial.push(
            x => derivative(a) * Math.pow(x - a, index) / getFactorial(index)));

        return x => taylorPolynomial.reduce((acc, polynomialItem) => acc + polynomialItem(x), 0);
    };

    math.regressions = {
        polynomial(points, degree) {
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
    
            return math.equations.solveSystem(matrix, vector);
        },
        linear(dots) {
            let xAverage = math.getAverage(dots.map(dot => dot.x));
            let yAverage = math.getAverage(dots.map(dot => dot.y));

            let lineData = dots.map(dot => ({
                xDistance: dot.x - xAverage,
                yDistance: dot.y - yAverage,
            }));

            lineData = lineData.map(dot => Object.assign(dot, {
                xDistanceSquared: Math.pow(dot.xDistance, 2)
            }));

            lineData = lineData.map(dot => Object.assign(dot, {
                dimensionsDistanceMultiplied: dot.xDistance * dot.yDistance
            }));

            let sumOfXDistances = lineData.reduce((accumulator, dot) => accumulator + dot.xDistanceSquared, 0);
            let sumOfDimensionsDistanceMultiplied = lineData.reduce((accumulator, dot) => accumulator + dot.dimensionsDistanceMultiplied, 0);

            if (sumOfXDistances === 0)
                return false;

            let slope = sumOfDimensionsDistanceMultiplied / sumOfXDistances;
            let intercept = yAverage - slope * xAverage;

            return {
                slope,
                intercept
            }
        }
    };

    math.regressions.exponential = dots => {
        dots = dots.map(dot => ({
            x: dot.x,
            y: Math.log(dot.y)
        }));

        let {slope, intercept} = math.regressions.linear(dots);

        return {
            alpha: Math.exp(intercept),
            beta: slope
        }
    };

    math.regressions.standardError = (dots, regressionFunction) => {
        if (dots.length <= 2) return false;

        let errorsSum = 0;

        dots.forEach(dot => errorsSum += Math.pow(regressionFunction(dot.x) - dot.y, 2));

        return Math.sqrt(errorsSum / (dots.length - 2));
    };

    math.regressions.rSquare = (dots, regressionFunction) => {
        if (dots.length <= 1) return false;

        let meanOfRealValues = dots.reduce((acc, current) => acc + current.y, 0) / dots.length;
        let meanAndRealValuesDifference = dots.reduce((acc, current) => acc + Math.pow(current.y - meanOfRealValues, 2), 0);

        let meanOfPredictedValues = dots.reduce((acc, current) => acc + regressionFunction(current.x), 0) / dots.length;
        let meanAndPredictedValuesDifference
            = dots.reduce((acc, current) => acc + Math.pow(regressionFunction(current.x) - meanOfPredictedValues, 2), 0);

        return meanAndPredictedValuesDifference / meanAndRealValuesDifference;
    };

    return math;
};