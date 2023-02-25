export function proxyWithCache<T extends Record<string, any>>(
  get: (name: keyof T) => T[keyof T]
): T {
  return new Proxy({} as T, {
    get: (target, _prop) => {
      const prop = _prop as keyof T;
      return target[prop] || (target[prop] = get(prop));
    },
  });
}
