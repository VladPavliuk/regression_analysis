let basic = {};

basic.getFactorial = number => {
    if (number === 0)
        return 1;
    return number * this.getFactorial(number - 1);
};

basic.getAverage = numbers => numbers.reduce((accumulator, number) => accumulator + number, 0) / numbers.length;

basic.round = (number, decimals) => Math.round(Math.pow(10, decimals) * number) / Math.pow(10, decimals);

export default basic;