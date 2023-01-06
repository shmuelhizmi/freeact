import { ComponentImplementor } from "../types/module";

export function implementClientComponents<
  CompNameCompPropsMap extends Record<string, any>
>(
  implementor: ComponentImplementor<CompNameCompPropsMap>,
): ComponentImplementor<CompNameCompPropsMap> {
  return implementor;
}
