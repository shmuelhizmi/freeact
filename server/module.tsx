import React from "react";
import { createAPIServerImplementation } from "../types/api";
import {
  CompNameCompPropsMap,
  CompiledServerModules,
  Components,
  ServerModule,
  UIModule,
} from "../types/module";
import { MaybePromise } from "../types/utils";
import { ViewsProvider } from "@react-fullstack/fullstack/server";
import { createApiServerInterface } from "./api";

/**
 *
 * @example
 * createServerModule(
 *  import("../client"),
 *  require("./client"),
 * )
 */
export function createServerModule<Comps extends CompNameCompPropsMap>(
  client: MaybePromise<UIModule<Comps>>,
  clientPath: string
) {
  return createServerModuleBase(
    client,
    clientPath,
    createApiServerInterface(() => ({})),
    [],
    []
  );
}

function createServerModuleBase<
  Comps extends CompNameCompPropsMap,
  APIInterface
>(
  client: MaybePromise<UIModule<Comps>>,
  clientPath: string,
  _api: createAPIServerImplementation<APIInterface>,
  _serverOverrides: Array<(comps: any) => MaybePromise<any>>,
  _ssrOverrides: Array<() => MaybePromise<any>>
) {
  return {
    implementApi<APIInterface>(
      api: createAPIServerImplementation<APIInterface>
    ) {
      const withApi = createServerModuleBase(
        client,
        clientPath,
        api,
        _serverOverrides,
        _ssrOverrides
      );
      return withApi;
    },
    overrideWithServerComponents<
      ServerOverrides extends Record<keyof Comps, any>
    >(
      override: (
        clientComponents: Components<Comps>
      ) => MaybePromise<Omit<Comps, keyof ServerOverrides> & ServerOverrides>
    ) {
      const withServerComponents = createServerModuleBase(
        client,
        clientPath,
        _api,
        [..._serverOverrides, override],
        _ssrOverrides
      );
      return withServerComponents;
    },
    overrideWithSsrComponents<SsrOverrides extends Partial<Components<Comps>>>(
      override: () => MaybePromise<
        Omit<Comps, keyof SsrOverrides> & SsrOverrides
      >
    ) {
      const withSsrComponents = createServerModuleBase(
        client,
        clientPath,
        _api,
        _serverOverrides,
        [..._ssrOverrides, override]
      );
      return withSsrComponents;
    },
    done<Namespace extends string>(namespace: Namespace) {
      const getComponents = async () => {
        const { components: unwaitedClientComponents } = await client;
        const clientComponents = Object.keys(
          await unwaitedClientComponents()
        ).reduce((prev, key) => {
          const curr = (props: any) => (
            <ViewsProvider<Record<string, any>>>
              {({ [`${namespace}_${key}`]: Comp }) => {
                // const children = replaceTextWithTypography(props.children);
                return <Comp {...props} />;
              }}
            </ViewsProvider>
          );
          return { ...prev, [key]: curr };
        }, {});
        const serverComponents = await _serverOverrides.reduce(
          async (prev, override) => {
            return {
              ...(await prev),
              ...(await override(await prev)),
            };
          },
          Promise.resolve(clientComponents)
        );
        const ssrComponents = await _ssrOverrides.reduce(
          async (prev, override) => {
            const comps = await prev;
            return {
              ...comps,
              ...(await override()),
            };
          },
          Promise.resolve(unwaitedClientComponents())
        );
        return { serverComponents, ssrComponents };
      };
      return {
        api: _api,
        components: () =>
          getComponents().then(({ serverComponents }) => serverComponents),
        ssrComponents: () =>
          getComponents().then(({ ssrComponents }) => ssrComponents),
        namespace,
        clientPath,
      } as ServerModule<Namespace, Comps, APIInterface>;
    },
  };
}

export function getSsrComponentMap(compiledModules: CompiledServerModules) {
  return Object.entries(compiledModules).reduce((prev, [namespace, module]) => {
    return {
      ...prev,
      ...Object.entries(module.ssrComponents).reduce((prev, [key, Comp]) => {
        return {
          ...prev,
          [`${namespace}_${key}`]: Comp,
        };
      }, {}),
    };
  }, {} as Record<string, React.ComponentType<any>>);
}
export function getServerComponentMap(compiledModules: CompiledServerModules) {
  return Object.entries(compiledModules).reduce((prev, [namespace, module]) => {
    return {
      ...prev,
      [namespace]: module.components,
    };
  }, {} as Record<string, Record<string, React.ComponentType<any>>>);
}
