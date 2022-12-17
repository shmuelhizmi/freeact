import React from "react";
import { AdditionalComponentsExportBase } from "../types/additionalComponents";
import { serve, createSessionHandler } from "./server";
import { hostClientBundles, createHostClientBundlesMiddleware } from "./http";
import { Server as HTTPServer } from "http";
import { createViewProxy } from "./view";
import { Base } from "../views/ui/Base";
import { createAwaitProxy } from "./awaitProxy";
import * as build from "../compiler/build";

export type OmitClassNames<T extends AdditionalComponentsExportBase> = {
  [K in keyof T]: T[K] extends React.FunctionComponent<infer P>
    ? React.FunctionComponent<Omit<P, "className">>
    : never;
};

export async function buildAdditionalComponents(path: string) {
  return build.components(path);
}

function createCompilerBase<TBase extends AdditionalComponentsExportBase>(
  bundles: Promise<string>[] = [],
  ssrViewsBase: TBase = {} as TBase
) {
  return {
    withComponents<T extends AdditionalComponentsExportBase>(
      entryPoint: string,
      ssrViews: T
    ) {
      bundles.push(buildAdditionalComponents(entryPoint));
      return createCompilerBase<TBase & OmitClassNames<T>>(bundles, {
        ...ssrViewsBase,
        ...Object.entries(ssrViews).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: Base(value),
          }),
          {} as TBase & OmitClassNames<T>
        ),
      });
    },
    compile() {
      return createViewProxy<
        {
          serve: typeof serve;
          createSessionHandler: typeof createSessionHandler;
          hostStatics: (
            server: HTTPServer,
            mountPath?: string
          ) => Promise<ReturnType<typeof hostClientBundles>>;
          createHostClientBundlesMiddleware: typeof createHostClientBundlesMiddleware;
        },
        TBase
      >({
        serve: async (render, options) => {
          const additionalComponents = await Promise.all(bundles);
          return serve(render, {
            ...options,
            additionalComponents: {
              ssrViews: {
                ...ssrViewsBase,
                ...(options?.additionalComponents?.ssrViews ?? {}),
              },
              bundles: [
                ...additionalComponents,
                ...(options?.additionalComponents?.bundles ?? []),
              ],
            },
          });
        },
        createSessionHandler: <T>(options) => {
          return createAwaitProxy(async () => {
            return createSessionHandler({
              ...options,
              additionalComponents: {
                ssrViews: {
                  ...ssrViewsBase,
                  ...(options?.additionalComponents?.ssrViews ?? {}),
                },
                bundles: [
                  ...(await Promise.all(bundles)),
                  ...(options?.additionalComponents?.bundles ?? []),
                ],
              },
            });
          });
        },
        hostStatics(server, mountPath) {
          return Promise.all(bundles).then((bundles) =>
            hostClientBundles(server, mountPath, bundles)
          );
        },
        createHostClientBundlesMiddleware(mountPath) {
          const initialMiddleware = createHostClientBundlesMiddleware(
            mountPath,
            []
          );
          let middleware: typeof initialMiddleware.middleware;
          Promise.all(bundles).then((bundles) => {
            middleware = createHostClientBundlesMiddleware(
              initialMiddleware.path,
              bundles
            ).middleware;
          });
          return {
            path: initialMiddleware.path,
            middleware: (req, res, next) => {
              if (middleware) {
                return middleware(req, res, next);
              }
              return next();
            },
          };
        },
      });
    },
  };
}

export function createCompiler() {
  return createCompilerBase();
}
