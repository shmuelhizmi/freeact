export function run<T extends () => any>(func: T): ReturnType<T> {
  return func();
}