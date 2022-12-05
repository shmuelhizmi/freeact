import getPort from "get-port";
import { createServer } from "http";
import path from "path";
import { ServeOptions } from "./types";
import fs from "fs/promises";
import { getClientsGlobals } from "./utils";
import mime from "mime-types";

const isProd = __filename.endsWith("dist/server/index.js");

export async function httpServe(
  options: ServeOptions,
  port: number,
  serverPort: number,
  additionalComponents?: string[]
) {
  const statics = path.join(__dirname, "..", "client");
  const globals = getClientsGlobals(options, serverPort);
  let index = await fs.readFile(path.join(statics, "index.html"), "utf-8");
  const additionalJsBundle = Array(additionalComponents?.length || 0)
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
  const server = createServer(async (req, res) => {
    try {
      const url = req.url!;
      const queryIndex = url.indexOf("?");
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
  });
  await new Promise<void>((resolve) => server.listen(port, resolve));
}

export async function startClient(
  options: ServeOptions,
  serverPort?: number,
  additionalBundles?: string[]
): Promise<{ url: string; port?: number }> {
  if (options.customConnection?.client.type === "URL") {
    return { url: options.customConnection.client.url };
  }
  const port = await getPort({ port: options.clientPort || 3000 });
  if (isProd) {
    await httpServe(options, port, serverPort!, additionalBundles);
    return {
      url: `http://127.0.0.1:${port}`,
      port,
    };
  }
  const { startViteServer } = await import("./vite");
  return {
    url: await startViteServer(options, port, serverPort),
    port,
  };
}
