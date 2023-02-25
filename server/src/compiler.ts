import { serve, createSessionHandler } from "./server";
import { hostClientBundles, createHostClientBundlesMiddleware } from "./http";
import { Server as HTTPServer } from "http";
import {
  CompiledServerModules,
  CompilerAppProvider,
  ModuleComponents,
  ModulesComponents,
  ServerModule,
  ServerModules,
} from "@freeact/types";
import { GlobalAppServeOptions, RequestServeOptions } from "./types";
import * as React from "react";
import { getServerComponentMap } from "./module";
import { parsePath } from "./utils/parsePath";
import { proxyWithCache } from "./utils/proxy";

export function createCompiler() {
  return createCompilerBase({});
}
function createCompilerBase<Modules extends ServerModules>(modules: Modules) {
  return {
    addModule<
      Name extends string,
      Comps extends Record<string, any>,
      APIInterface
    >(module: ServerModule<Name, Comps, APIInterface>) {
      return createCompilerBase<
        Modules & {
          [key in Name]: ServerModule<Name, Comps, APIInterface>;
        }
      >({
        ...modules,
        [module.namespace]: module,
      });
    },
    compile() {
      const compiledModules = compileModules(modules);
      const dummyModules = createDummyModules(Object.keys(modules));
      const api = apiWithModules<Modules>(compiledModules, dummyModules);
      compiledModules.then((modules) => {
        const componentMap = getServerComponentMap(modules);
        dummyModules.update(componentMap as ModulesComponents<Modules>);
      });
      return api;
    },
  };
}

export function apiWithModules<Modules extends ServerModules>(
  modules: Promise<CompiledServerModules>,
  dummyModules: DummyModules
) {
  const compilerAppProvider: CompilerAppProvider = (props) => {
    return React.createElement(
      UIContext.Provider,
      {
        value: dummyModules.dummy,
      },
      props.children
    );
  };
  return {
    serve<T>(
      render: (resolve?: (value: T) => void) => JSX.Element,
      options: Partial<GlobalAppServeOptions & RequestServeOptions> = {}
    ) {
      return serve(render, modules, options, compilerAppProvider);
    },
    createSessionHandler(options: RequestServeOptions) {
      return createSessionHandler<Modules>(
        options,
        modules,
        compilerAppProvider
      );
    },
    hostStatics(server: HTTPServer, mountPath?: string) {
      return hostClientBundles(server, modules, mountPath);
    },
    createHostClientBundlesMiddleware(mountPath?: string) {
      return createHostClientBundlesMiddleware(modules, mountPath);
    },
  };
}

export async function compileModules<Modules extends ServerModules>(
  modules: Modules
): Promise<CompiledServerModules> {
  return Object.entries(modules).reduce(async (acc, [key, module]) => {
    const [compiledServerModule, components, ssrComponents] = await Promise.all(
      [
        Promise.resolve(module.getClientPath()).then(async (path) => {
          const { runtimeBundle } = await import("@freeact/compiler");
          return runtimeBundle(parsePath(path));
        }),
        module.components(),
        module.ssrComponents(),
      ]
    );
    return {
      ...(await acc),
      [key]: {
        components,
        ssrComponents,
        namespace: module.namespace,
        clientBundle: compiledServerModule!,
        api: module.api,
      },
    };
  }, Promise.resolve({}) as Promise<CompiledServerModules>);
}

/**
 * this hack is used so module components can be used before they are compiled
 */
function createDummyModules<Modules extends ServerModules>(names: string[]) {
  const modules = {} as ModulesComponents<Modules>;
  return {
    update(newModules: ModulesComponents<Modules>) {
      Object.assign(modules, newModules);
    },
    dummy: names.reduce((acc, key) => {
      return {
        ...acc,
        [key]: new Proxy({} as any, {
          get(target, prop) {
            const func =
              target[prop as string] ||
              ((props: any) => {
                if (modules[key]) {
                  return React.createElement(
                    modules[key][prop as string],
                    props
                  );
                }
                throw new Error(
                  `${
                    prop as string
                  } of Module ${key} has not been compiled yet. Use the compiler to compile your modules.`
                );
              });
            target[prop] = func;
            return func;
          },
        }),
      };
    }, {} as ModulesComponents<Modules>),
    dummyCombined: proxyWithCache<any>((prop) => {
      return (props: any) => {
        const module = Object.values(modules).find(
          (module) => module[prop as string]
        );
        if (!module) {
          throw new Error(
            `${
              prop as string
            } has not been compiled yet. Use the compiler to compile your modules.`
          );
        }
        return React.createElement(module[prop as string], props);
      };
    }) as CombinedComponents<Modules>,
  };
}

export type DummyModules = ReturnType<typeof createDummyModules>;

type UnionToType<U extends Record<string, unknown>> = {
  [K in U extends unknown ? keyof U : never]: U extends unknown
    ? K extends keyof U
      ? U[K]
      : never
    : never;
};

type CombinedComponents<Modules extends ServerModules> = UnionToType<
  ModulesComponents<Modules>[keyof ModulesComponents<Modules>]
>;

export const UIContext = React.createContext<
  Record<string, ModuleComponents<any>>
>({});

export function exportModuleUI<SM extends ServerModule<any, any, any>>(
  module: SM
): ModuleComponents<SM> {
  return proxyWithCache<any>((prop) => {
    return (props: any) => {
      const context = React.useContext(UIContext);
      const Component =
        context[module.namespace as keyof typeof context][prop as string];
      return React.createElement(Component, props);
    };
  }) as ModuleComponents<SM>;
}
