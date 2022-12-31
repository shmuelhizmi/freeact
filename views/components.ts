import { ComponentImplementor } from "../types/module";
import { MaybePromise } from "../types/utils";

export function implementClientComponents<
  CompNameCompPropsMap extends Record<string, any>
>(
  implementor: ComponentImplementor<CompNameCompPropsMap>,
): ComponentImplementor<CompNameCompPropsMap> {
  return implementor;
}
