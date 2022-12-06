import getPort from "get-port";
import { IncomingMessage, ServerResponse } from "http";
import path from "path";
import { ServeOptions } from "./types";
import fs from "fs/promises";
import { getClientsGlobals } from "./utils";
import mime from "mime-types";

const isProd = __filename.endsWith("dist/server/index.js");

export async function httpServe(
  options: ServeOptions,
  serverPath: string
) {
  const { additionalComponentsBundles: additionalComponents = [], customConnection } = options;
  const { basePath } = customConnection || {};
  const statics = path.join(__dirname, "..", "client");
  const globals = getClientsGlobals(options, serverPath);
  let index = await fs.readFile(path.join(statics, "index.html"), "utf-8");
  const additionalJsBundle = Array(additionalComponents.length || 0)
    .fill("")
    .map((_, i) => {
      return `additional-${i}.js`;
    });
  index = index.replace(
    `<head>`,
    `<head><script>
    const toInject = ${JSON.stringify({
      ...globals,
      bundles: additionalJsBundle,
    })};
    for (const key in toInject) {
      window[key] = toInject[key];
    }
  </script>`
  );
  const handler = async (req: IncomingMessage, res: ServerResponse) => {
    try {
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
    }
  }
}

export async function createClient(
  options: ServeOptions,
  serverPath: string
) {
  if (isProd) {
    return (await httpServe(options, serverPath)).handler;
  }
  const { startViteServer } = await import("./vite");
  return await (await startViteServer(options, serverPath)).handle;
}
