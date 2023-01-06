import { serve, createSessionHandler } from "./server";
import { hostClientBundles, createHostClientBundlesMiddleware } from "./http";
import { Server as HTTPServer } from "http";
import * as build from "../compiler/build";
import {
  CompiledServerModules,
  ServerModule,
  ServerModules,
} from "../types/module";
import { GlobalAppServeOptions, RequestServeOptions } from "./types";
import * as React from "react";
import { getServerComponentMap } from "./module";
import { PRIVATE_FREEACT_SET_MODULES, createFreeactProxy } from "./freeactProxy";

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
      const api = apiWithModules(compiledModules);
      return withReact<Modules, typeof api>(
        api,
        compiledModules
      )
    },
  };
}

export function apiWithModules<Modules extends ServerModules>(
  modules: Promise<CompiledServerModules>
) {
  return {
    serve<T>(render: (resolve?: (value: T) => void) => JSX.Element,
    options: Partial<GlobalAppServeOptions & RequestServeOptions> = {}
    ) {
      return serve(render, modules, options);
    },
    createSessionHandler(options: RequestServeOptions) {
      return createSessionHandler<Modules>(options, modules);
    },
    hostStatics(server: HTTPServer, mountPath?: string) {
      return hostClientBundles(server,  modules, mountPath);
    },
    createHostClientBundlesMiddleware(mountPath?: string) {
      return createHostClientBundlesMiddleware(modules, mountPath);
    }
  }
}

export async function compileModules<Modules extends ServerModules>(
  modules: Modules
): Promise<CompiledServerModules> {
  return Object.entries(modules).reduce(async (acc, [key, module]) => {
    const [compiledServerModule, components, ssrComponents] = await Promise.all(
      [
        build.module(module.clientPath),
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
        clientBundle: compiledServerModule,
        api: module.api,
      },
    };
  }, Promise.resolve({}) as Promise<CompiledServerModules>);
}

export function withReact<Modules extends ServerModules, T extends Record<string, any>>(
  base: T,
  modules: Promise<CompiledServerModules>
) {
  const freeact = createFreeactProxy<Modules, T & typeof React>({
    ...React,
    ...base,
  });
  modules.then((modules) => {
    (freeact as any)[PRIVATE_FREEACT_SET_MODULES](getServerComponentMap(modules));
  });
  return freeact;
}