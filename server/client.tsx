import path from "path";
import { GlobalAppServeOptions, RequestServeOptions } from "./types";
import fs from "fs/promises";
import { getClientsGlobals } from "./utils";
import mime from "mime-types";
import { renderToString } from "react-dom/server";
import React from "react";
import { SSRHeadViews, Views, BaseWrapper } from "../views/views";
import { HTTPRequestHandler, SocketConnection } from "./http";

const isProd = __filename.endsWith("dist/server/index.js");

const withFallbackComp = <T extends Record<string, any>>(obj: T): T => {
  const fallback = ({ children }: { children: any }) => children;
  return new Proxy(obj, {
    get: (target, prop) => {
      if (prop in target) {
        return target[prop as keyof T];
      }
      return fallback;
    },
  });
};

const makeBundles = (bundles: string[], staticsBasePath?: string) => {
  const additionalJsBundle = Array(bundles.length || 0)
    .fill("")
    .map((_, i) => {
      return `additional-${i}.js`;
    });
  return {
    additionalJsBundlePath: additionalJsBundle.map((filename) =>
      path.join(staticsBasePath || '/', filename)
    ),
    getBundle(filename: string) {
      return bundles[additionalJsBundle.indexOf(filename)];
    },
  };
};

export function hostStatics(additionalComponentsBundles: string[]) {
  const statics = isProd
    ? path.join(__dirname, "..", "client")
    : path.join(__dirname, "..", "dist", "client");

  const { getBundle } = makeBundles(additionalComponentsBundles);
  const handler: HTTPRequestHandler<Promise<void>> = async (req, res) => {
    try {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const pathname = url.pathname;
      if (pathname === "/" || pathname === "/index.html") {
        return;
      }
      const filename = pathname.slice(1);
      const bundle = getBundle(filename);
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
      res.end();
    }
  };
  return handler;
}

export function createSsr(
  options: Partial<
    Pick<
      GlobalAppServeOptions,
      "title" | "windowDimensions" | "additionalComponents"
    > &
      Pick<RequestServeOptions, "staticsBasePath">
  >,
  staticsBase: string,
  socket: SocketConnection,
  ssrFunction: (views: Record<string, React.ComponentType>) => JSX.Element
) {
  const { additionalComponents, staticsBasePath } = options;
  const { ssrViews } = additionalComponents || {};
  const globals = getClientsGlobals(options, socket);
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
                  bundles: makeBundles(
                    options.additionalComponents?.bundles || [],
                    staticsBasePath
                  ).additionalJsBundlePath,
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
            {ssrFunction ? ssrFunction(withFallbackComp(SSRHeadViews)) : null}
            <title>{options.title}</title>
          </head>
          <body>
            <div id="root">
              <BaseWrapper>
                {ssrFunction ? ssrFunction({ ...Views, ...ssrViews }) : null}
              </BaseWrapper>
            </div>
          </body>
        </html>
      );
      res.end(index);
      return;
    } catch (e) {
      res.writeHead(404);
      res.end();
    }
  };
  return handler;
}
