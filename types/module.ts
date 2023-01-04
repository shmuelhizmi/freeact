import { APIClientImplementation, APIServerImplementation } from "./api";
import { MaybePromise } from "./utils";

export interface UIModule<Comps extends CompNameCompPropsMap> {
  api?: APIClientImplementation;
  components: ComponentImplementor<Comps>;
//   wrappedExternalComponent: WrappedExternalComponent<GlobalProps>;
}

export type CompNameCompPropsMap = Record<string, any>;
export type Components <Comps extends CompNameCompPropsMap> = {
  [key in keyof Comps]: React.ComponentType<Comps[key]>;
};

export type ComponentImplementor<Comps extends CompNameCompPropsMap> = () => MaybePromise<Components<Comps>>;

export interface ServerModule<Namespace extends string, Comps extends CompNameCompPropsMap, APIInterface> {
  components: ComponentImplementor<Comps>;
  ssrComponents: ComponentImplementor<Partial<Comps>>;
  api: APIServerImplementation<APIInterface>;
  namespace: Namespace;
}