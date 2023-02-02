import "../src/register";
import { as } from "./python.py";

interface Mod {
    sum(a: number, b: number): number;
    hello: () => void;
    Calculator: new (vector: number[]) => {
        vector: number[];
        multiply(scalar: number, vector: number[]): number[];
        add(vector1: number[], vector2: number[]): number[];
        subtract(vector1: number[], vector2: number[]): number[];
    };
}

const { Calculator, hello, sum } = as<Mod>();

(async () => {
    console.log(await sum(1, 2).catch(console.error));
    await hello();
    const calc = new Calculator([1, 2, 3]);
    console.log(await calc.multiply(2, [
        1, 2, 3
    ]));
})()