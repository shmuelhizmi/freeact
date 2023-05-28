import path from "path";
import { GlobalAppServeOptions, RequestServeOptions } from "./types";
import fs from "fs/promises";
import { getClientsGlobals } from "./utils";
import mime from "mime-types";
import { renderToString } from "react-dom/server";
import * as React from "react";
import { HTTPRequestHandler, SocketConnection } from "./http";
import { CompiledServerModules } from "@freeact/types";
import { getSsrComponentMap } from "./module";
import { URL } from "url";


const makeBundles = (
  modules: CompiledServerModules,
  staticsBasePath?: string
) => {
  const files = Object.values(modules).map((module) => ({
    file: `${staticsBasePath || '/'}modules/${module.namespace}.js`,
    async getBundle() {
      return module.clientBundle;
    },
    namespace: module.namespace,
  }));
  return {
    filesMap: files.reduce((acc, cur) => {
      acc[cur.file] = cur;
      return acc;
    }, {} as Record<string, { file: string; getBundle: () => Promise<string> }>),
    nameMap: files.reduce((acc, cur) => {
      acc[cur.namespace] = cur.file;
      return acc;
    }, {} as Record<string, string>),
  };
};



export function hostStatics(modules: CompiledServerModules, logger: (message: string) => void) {
  const statics = path.join(__dirname, "../", "views");

  const bundles = makeBundles(modules).filesMap;
  const handler: HTTPRequestHandler<Promise<void>> = async (req, res) => {
    try {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const pathname = url.pathname;
      if (pathname === "/" || pathname === "/index.html") {
        return;
      }
      const bundle = await bundles[pathname]?.getBundle();
      if (bundle) {
        res.writeHead(200, { "Content-Type": "text/javascript" });
        res.end(bundle);
        return;
      }
      const type = mime.lookup(pathname);
      const file = path.join(statics, pathname);
      const content = await fs.readFile(file);
      res.writeHead(200, { "Content-Type": type || "text/plain" });
      res.end(content);
      return;
    } catch (e) {
      res.writeHead(404);
      logger(`404: ${req.url}`);
      logger(String(e));
      res.end();
    }
  };
  return handler;
}

export function createSsr(
  options: Partial<
    Pick<GlobalAppServeOptions, "title" | "windowDimensions" | 'connection' | 'logger'> &
      Pick<RequestServeOptions, "staticsBasePath">
  >,
  modules: CompiledServerModules,
  staticsBase: string,
  socket: SocketConnection,
  ssrFunction: (views: Record<string, React.ComponentType>) => JSX.Element
) {
  const { staticsBasePath, connection: { basePath } = {} } = options;
  const ssrViews = getSsrComponentMap(modules);
  const globals = getClientsGlobals(options, socket);
  let modulesBasePath = staticsBasePath || basePath || '/';
  if (!modulesBasePath.endsWith("/")) {
    modulesBasePath += "/";
  }
  const handler: HTTPRequestHandler<Promise<void>> = async (req, res) => {
    try {
      res.writeHead(200, { "Content-Type": "text/html" });
      const index = renderToString(
        <html>
          <head>
            <meta charSet="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                const toInject = ${JSON.stringify({
                  ...globals,
                  modules: makeBundles(modules, staticsBasePath || basePath).nameMap,
                })};
                for (const key in toInject) {
                  window[key] = toInject[key];
                }
                window.process = { env: { NODE_ENV: "${
                  process.env.NODE_ENV
                }" } };
              `,
              }}
            ></script>
            <script
              type="module"
              crossOrigin=""
              src={path.join(staticsBase, "./freeact.mjs")}
            ></script>
            <link
              rel="stylesheet"
              href={path.join(staticsBase, "./freeact.css")}
            />
            {/* {ssrFunction ? ssrFunction(ssrViews) : null} */}
            {/* implement later */}
            <title>{options.title}</title>
          </head>
          <body>
            <div id="root">{ssrFunction ? ssrFunction(ssrViews) : null}</div>
          </body>
        </html>
      );
      res.end(index);
      return;
    } catch (e) {
      res.writeHead(404);
      options.logger?.(`404: ${req.url}`);
      options.logger?.(String(e));
      res.end();
    }
  };
  return handler;
}
