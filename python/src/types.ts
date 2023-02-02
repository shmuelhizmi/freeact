export type PromisifyDeep<T> = T extends new (...args: infer A) => infer R
  ? new (...args: A) => PromisifyDeep<R>
  : T extends (...args: infer A) => infer R
  ? (...args: A) => Promise<R>
  : T extends Array<any> | number | string | boolean
  ? null
  : T extends Record<string, any>
  ? {
      [K in keyof T]: PromisifyDeep<T[K]>;
    }
  : null;

export type PyModule = symbol & { __pyModule: true };
export type PyObject = symbol & { __pyObject: true };
export interface Interpreter {
  import: (filename: string) => Promise<PyModule>;
  importSync: (filename: string) => PyModule;

  create: (
    module: PyModule,
    className: string,
    ...args: any[]
  ) => Promise<PyObject>;
  createSync: (module: PyModule, className: string, ...args: any[]) => PyObject;

  call: (
    module: PyModule | PyObject,
    functionName: string,
    ...args: any[]
  ) => Promise<unknown>;
  callSync: (
    module: PyModule | PyObject,
    functionName: string,
    ...args: any[]
  ) => unknown;

  exec: (module: PyModule | PyObject, codeToRun: string) => Promise<unknown>;
  execSync: (module: PyModule | PyObject, codeToRun: string) => unknown;

  eval: (module: PyModule | PyObject, codeToRun: string) => Promise<unknown>;
  evalSync: (module: PyModule | PyObject, codeToRun: string) => unknown;

  fixlink: (fileName: string) => void;

  addImportPath: (path: string) => void;
}
