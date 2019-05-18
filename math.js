let getMath = () => {
    let math = {};

    math.getAverage = numbers => numbers.reduce((accumulator, number) => accumulator + number, 0) / numbers.length;
    math.round = (number, decimals) => Math.round(Math.pow(10, decimals) * number) / Math.pow(10, decimals);

    math.regressions = {
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

    math.regressions.rSquare = dots => {
        let regressionLine = math.regressions.linear(dots);

        if (regressionLine === false)
            return false;

        let yAverage = math.getAverage(dots.map(dot => dot.y));

        let dotsData = dots.map(dot => Object.assign(dot, {
            yDistance: dot.y - yAverage,
        }));

        dotsData = dotsData.map(dot => Object.assign(dot, {
            yDistanceSquared: Math.pow(dot.yDistance, 2)
        }));

        let sumOfYDistancesSquared = dotsData.reduce((accumulator, dot) => accumulator + dot.yDistanceSquared, 0);

        dotsData = dotsData.map(dot => Object.assign(dot, {
            functionValue: dot.x * regressionLine.slope + regressionLine.intercept
        }));

        dotsData = dotsData.map(dot => Object.assign(dot, {
            functionValueYAndYDistance: dot.functionValue - yAverage
        }));

        dotsData = dotsData.map(dot => Object.assign(dot, {
            functionValueYAndYDistanceSquared: Math.pow(dot.functionValueYAndYDistance, 2)
        }));

        let sumOfFunctionValueYAndYDistanceSquared = dotsData.reduce((accumulator, dot) => accumulator + dot.functionValueYAndYDistanceSquared, 0);

        return sumOfFunctionValueYAndYDistanceSquared / sumOfYDistancesSquared;
    };

    return math;
};