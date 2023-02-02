const { default: mod } = require("./python.py");
const { Calculator, hello, sum } = mod;



(async () => {
    console.log(await sum(1, 2).catch(console.error));
    await hello();
    const calc = new Calculator([1, 2, 3]);
    console.log(await calc.multiply(2, [
        1, 2, 3
    ]));
})()