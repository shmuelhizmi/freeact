import getPort from "get-port";
import { IncomingMessage, ServerResponse } from "http";
import path from "path";
import { ServeOptions } from "./types";
import fs from "fs/promises";
import { getClientsGlobals } from "./utils";
import mime from "mime-types";
import { renderToString } from "react-dom/server";
import React from "react";
import { SSRHeadViews, Views, BaseWrapper } from "../views/views";
const isProd = __filename.endsWith("dist/server/index.js");

const withFallbackComp = <T extends Record<string, any>>(
  obj: T,
): T => {
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

export async function httpServe(
  options: ServeOptions,
  serverPath: string,
  ssrFunction: (views: Record<string, React.ComponentType>) => JSX.Element
) {
  const {
    additionalComponentsBundles: additionalComponents = [],
    customConnection,
  } = options;
  const { basePath } = customConnection || {};
  const statics = isProd
    ? path.join(__dirname, "..", "client")
    : path.join(__dirname, "..", "dist", "client");
  const globals = getClientsGlobals(options, serverPath);
  const additionalJsBundle = Array(additionalComponents.length || 0)
    .fill("")
    .map((_, i) => {
      return `additional-${i}.js`;
    });
  const handler = async (req: IncomingMessage, res: ServerResponse) => {
    try {
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
                bundles: additionalJsBundle,
              })};
              for (const key in toInject) {
                window[key] = toInject[key];
              }
              window.process = { env: { NODE_ENV: "${process.env.NODE_ENV}" } };
            `,
              }}
            ></script>
            <script type="module" crossOrigin="" src="/freeact.mjs"></script>
            <link rel="stylesheet" href="/freeact.css" />
            {ssrFunction ? ssrFunction(withFallbackComp(SSRHeadViews)) : null}
            <title>{options.title}</title>
          </head>
          <body>
            <div id="root">
              <BaseWrapper>
                {ssrFunction ? ssrFunction(Views) : null}
              </BaseWrapper>
            </div>
          </body>
        </html>
      );
      let url = req.url!;
      const queryIndex = url.indexOf("?");
      if (!url.startsWith(basePath || "/")) {
        return;
      }
      if (basePath) {
        url = url.slice(basePath.length);
      }
      const pathname = queryIndex === -1 ? url : url.slice(0, queryIndex);
      if (pathname === "/" || pathname === "/index.html") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(index);
        return;
      }
      const filename = pathname.slice(1);
      if (additionalJsBundle.includes(filename)) {
        res.writeHead(200, { "Content-Type": "text/javascript" });
        res.end(additionalComponents?.[additionalJsBundle.indexOf(filename)]);
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
  return {
    handler: (req: IncomingMessage, res: ServerResponse) => {
      handler(req, res);
    },
  };
}

export async function createClient(
  options: ServeOptions,
  serverPath: string,
  ssrFunction: (views: Record<string, React.ComponentType>) => JSX.Element
) {
  if (true) {
    // isProd
    return (await httpServe(options, serverPath, ssrFunction)).handler;
  }
  const { startViteServer } = await import("./vite");
  return await (
    await startViteServer(options, serverPath)
  ).handle;
}
