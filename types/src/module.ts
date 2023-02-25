import * as React from "react";
import { APIClientImplementation, CreateAPIServerImplementation } from "./api";
import { MaybePromise } from "./utils";

export interface UIModule<Comps extends CompNameCompPropsMap> {
  api?: APIClientImplementation;
  components: ComponentImplementor<Comps>;
  //   wrappedExternalComponent: WrappedExternalComponent<GlobalProps>;
  filename: string;
}

export type CompNameCompPropsMap = Record<string, any>;
export type Components<Comps extends CompNameCompPropsMap> = {
  [key in keyof Comps]: React.ComponentType<
    React.PropsWithChildren<Comps[key]>
  >;
};

export type ComponentImplementor<Comps extends CompNameCompPropsMap> =
  () => MaybePromise<Components<Comps>>;

export interface ServerModule<
  Namespace extends string,
  Comps extends CompNameCompPropsMap,
  APIInterface
> {
  components: ComponentImplementor<Comps>;
  ssrComponents: ComponentImplementor<Partial<Comps>>;
  api: CreateAPIServerImplementation<APIInterface>;
  namespace: Namespace;
  getClientPath: () => MaybePromise<string>;
}
export type ModuleApi<Module extends ServerModule<any, any, any>> =
  Module extends ServerModule<any, any, infer APIInterface>
    ? APIInterface
    : never;
export type ServerModules = Record<string, ServerModule<any, any, any>>;

export type ModulesApi<Modules extends ServerModules> = {
  [key in keyof Modules]: ModuleApi<Modules[key]>;
};

export type ModuleComponents<Module extends ServerModule<any, any, any>> =
  Module extends ServerModule<any, infer Comps, any>
    ? Components<Comps>
    : never;

export interface ServerModuleWithClientCompiled {
  components: Record<string, React.ComponentType<any>>;
  ssrComponents: Record<string, React.ComponentType<any>>;
  api: CreateAPIServerImplementation<any>;
  namespace: string;
  clientBundle: string;
}

export type CompiledServerModules = Record<
  string,
  ServerModuleWithClientCompiled
>;

export type ModulesComponents<Modules extends ServerModules> = {
  [key in keyof Modules]: ModuleComponents<Modules[key]>;
};
