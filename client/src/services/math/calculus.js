import basic from "./basic";

let calculus = {};

calculus.calculatePolynomialFunction = (coefficients, x) => coefficients.reduce((acc, coef, i) => acc + coef * Math.pow(x, i), 0);

calculus.taylorSeries = (derivatives, a) => {
    let taylorPolynomial = [];

    derivatives.forEach((derivative, index) => taylorPolynomial.push(
        x => derivative(a) * Math.pow(x - a, index) / basic.getFactorial(index)));

    return x => taylorPolynomial.reduce((acc, polynomialItem) => acc + polynomialItem(x), 0);
};

export default calculus;