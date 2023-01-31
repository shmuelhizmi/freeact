import { serve, createSessionHandler } from "./server";
import { hostClientBundles, createHostClientBundlesMiddleware } from "./http";
import { Server as HTTPServer } from "http";
import {
  CompiledServerModules,
  ModulesComponents,
  ServerModule,
  ServerModules,
} from "@freeact/types";
import { GlobalAppServeOptions, RequestServeOptions } from "./types";
import * as React from "react";
import { getServerComponentMap } from "./module";
import { parsePath } from "./utils/parsePath";

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
      const api = apiWithModules<Modules>(compiledModules);
      return withReact<Modules, typeof api>(
        api,
        compiledModules,
        Object.keys(modules)
      );
    },
  };
}

export function apiWithModules<Modules extends ServerModules>(
  modules: Promise<CompiledServerModules>
) {
  return {
    serve<T>(
      render: (resolve?: (value: T) => void) => JSX.Element,
      options: Partial<GlobalAppServeOptions & RequestServeOptions> = {}
    ) {
      return serve(render, modules, options);
    },
    createSessionHandler(options: RequestServeOptions) {
      return createSessionHandler<Modules>(options, modules);
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

/**
 * this hack is used so module components can be used before they are compiled
 */
function dummyModules<Modules extends ServerModules>(names: string[]) {
  const modules = {} as ModulesComponents<Modules>;
  return {
    update(newModules: ModulesComponents<Modules>) {
      Object.assign(modules, newModules);
    },
    dummy: names.reduce((acc, key) => {
      return {
        ...acc,
        [key]: new Proxy(
          {},
          {
            get(_, prop) {
              return (props: any) => {
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
              };
            },
          }
        ),
      };
    }, {} as ModulesComponents<Modules>),
    dummyCombined: new Proxy(
      {},
      {
        get(_, prop) {
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
        },
      }
    ) as CombinedComponents<Modules>,
  };
}

export function withReact<
  Modules extends ServerModules,
  T extends Record<string, any>
>(base: T, modules: Promise<CompiledServerModules>, moduleNames: string[]) {
  const { dummy, update, dummyCombined } = dummyModules<Modules>(moduleNames);
  const freeact = {
    ...base,
    ...React,
    /**
     * All your compiled Freeact modules
     * @example
     * import React from '@freeact/lib/react'
     * <React.$.MyModule.MyComponent />
     */
    $: dummy,
    $$: dummyCombined,
  };
  modules.then((modules) => {
    const componentMap = getServerComponentMap(modules);
    update(componentMap as ModulesComponents<Modules>);
    freeact.$ = componentMap as ModulesComponents<Modules>;
    freeact.$$ = Object.values(componentMap).reduce(
      (acc, module) => ({ ...acc, ...module }),
      {} as CombinedComponents<Modules>
    ) as CombinedComponents<Modules>;
  });
  return freeact;
}
