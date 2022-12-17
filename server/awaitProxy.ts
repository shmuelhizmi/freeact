export function createAwaitProxy<T>(handler: () => Promise<T>): T {
  const value = handler();
  return new Proxy(
    () => {},
    {
      get: (target, prop) => {
        if (prop === "then") return value.then.bind(value);
        return createAwaitProxy(async () => {
          const v = await value;
          return v[prop];
        });
      },
      apply: (target, thisArg, args) => {
        const exec = value.then((v) => (v as any).apply(thisArg, args));
        return createAwaitProxy(async () => exec);
      },
    }
  ) as any;
}
