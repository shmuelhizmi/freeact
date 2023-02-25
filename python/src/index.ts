/// <reference types="./declare" />
import { Interpreter, PromisifyDeep, PyModule, PyObject } from "./types";
const interpreter = require("node-calls-python").interpreter as Interpreter;

export function requirePythonModule<Mod extends Record<string, any>>(
  path: string
) {
  const module = interpreter.import(path);
  return proxy<Mod>(module);
}

function proxy<Mod extends Record<string, any>>(
  module: Promise<PyModule | PyObject>
): PromisifyDeep<Mod> {
  return new Proxy({} as PromisifyDeep<Mod>, {
    get: (target, prop) => {
      return new Proxy(
        function () {},
        {
          apply: (target, thisArg, args) => {
            return module.then((mod) => {
              return interpreter.call(mod, prop as string, ...args);
            });
          },
          construct: (target, args, newTarget): any => {
            const objectPromise = module.then((mod) => {
              return interpreter.create(mod as PyModule, prop as string, ...args);
            });
            return proxy(objectPromise);
          },
          get: (target, prop) => {
            return null;
          },
        }
      );
    },
  });
}


export function register() {
    require.extensions[".py"] = (module, filename) => {
        const mod = requirePythonModule(filename);
        module.exports.default = mod;
        module.exports.as = <M>() => mod as PromisifyDeep<M>;
    }
}
