import React from "react";
import { createAPIServerImplementation } from "@freeact/types";
import type {
  CompNameCompPropsMap,
  CompiledServerModules,
  Components,
  ServerModule,
  UIModule,
  MaybePromise,
} from "@freeact/types";
import { ViewsProvider } from "@react-fullstack/fullstack/server";
import { createApiServerInterface } from "./api";

export type Compiler<
  Comps extends CompNameCompPropsMap,
  APIInterface,
  ServerComps extends CompNameCompPropsMap
> = {
  implementApi<APIInterface>(
    api: createAPIServerImplementation<APIInterface>
  ): Compiler<Comps, APIInterface, ServerComps>;
  overrideWithServerComponents<
    ServerOverrides extends Partial<Record<keyof Comps, any>>
  >(
    override: (clientComponents: Components<Comps>) => MaybePromise<{
      [K in keyof ServerOverrides]: React.ComponentType<
        React.PropsWithChildren<ServerOverrides[K]>
      >;
    }>
  ): Compiler<
    Comps,
    APIInterface,
    Omit<Comps, keyof ServerOverrides> & ServerOverrides
  >;
  overrideWithSsrComponents<SsrOverrides extends Partial<Components<Comps>>>(
    override: () => MaybePromise<SsrOverrides>
  ): Compiler<Comps, APIInterface, ServerComps>;
  done<Namespace extends string>(
    name: Namespace
  ): ServerModule<Namespace, ServerComps, APIInterface>;
};

/**
 *
 * @example
 * createServerModule(
 *  import("../client"),
 *  require("./client"),
 * )
 */
export function createServerModule<Comps extends CompNameCompPropsMap>(
  client: MaybePromise<UIModule<Comps>>
): Compiler<Comps, {}, Comps> {
  return createServerModuleBase<Comps, {}, Comps>(
    client,
    createApiServerInterface(() => ({})),
    [],
    []
  );
}
function createServerModuleBase<
  Comps extends CompNameCompPropsMap,
  APIInterface,
  ServerComps extends CompNameCompPropsMap
>(
  client: MaybePromise<UIModule<Comps>>,
  _api: createAPIServerImplementation<APIInterface>,
  _serverOverrides: Array<(comps: any) => MaybePromise<any>>,
  _ssrOverrides: Array<() => MaybePromise<any>>
): Compiler<Comps, APIInterface, ServerComps> {
  return {
    implementApi<APIInterface>(
      api: createAPIServerImplementation<APIInterface>
    ) {
      const withApi = createServerModuleBase<Comps, APIInterface, ServerComps>(
        client,
        api,
        _serverOverrides,
        _ssrOverrides
      );
      return withApi;
    },
    overrideWithServerComponents<
      ServerOverrides extends Partial<Record<keyof Comps, any>>
    >(
      override: (clientComponents: Components<Comps>) => MaybePromise<{
        [K in keyof ServerOverrides]: React.ComponentType<
          React.PropsWithChildren<ServerOverrides[K]>
        >;
      }>
    ) {
      const withServerComponents = createServerModuleBase<
        Comps,
        APIInterface,
        Omit<Comps, keyof ServerOverrides> & ServerOverrides
      >(client, _api, [..._serverOverrides, override], _ssrOverrides);
      return withServerComponents;
    },
    overrideWithSsrComponents<SsrOverrides extends Partial<Components<Comps>>>(
      override: () => MaybePromise<
        Omit<Comps, keyof SsrOverrides> & SsrOverrides
      >
    ) {
      const withSsrComponents = createServerModuleBase<
        Comps,
        APIInterface,
        ServerComps
      >(client, _api, _serverOverrides, [..._ssrOverrides, override]);
      return withSsrComponents;
    },
    done: ((namespace) => {
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
        getClientPath: () => {
          return Promise.resolve(
            client
          ).then((client) => client.filename);
        }
      } as ServerModule<any, ServerComps, APIInterface>;
    }),
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
