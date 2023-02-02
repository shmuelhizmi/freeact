declare module "*.py" {
  export function as<M>(): import("./types").PromisifyDeep<M>;
  const mod: any;
  export default mod;
}