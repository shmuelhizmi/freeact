import path from "path";
import { createServer } from "vite";
import { GlobalAppServeOptions } from "./types";
import reactVitePlugin from "@vitejs/plugin-react";
import { getClientsGlobals } from "./utils";
import { IncomingMessage, ServerResponse } from "http";
import esbuild from "esbuild";
import { SocketConnection } from "./http";

const processDefined = <T extends object>(obj: T) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (typeof value === "string") {
      acc[key] = JSON.stringify(value);
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as T);
};

export async function startViteServer(
  options: GlobalAppServeOptions,
  socket: SocketConnection,
) {
  const basePath = options.connection?.basePath;
  const vite = await createServer({
    root: path.join(__dirname, ".."),
    define: processDefined(getClientsGlobals(options, socket)),
    plugins: [reactVitePlugin()],
    envPrefix: "VITE_",
    base: basePath || "/",
    logLevel: process.env.NODE_ENV === "production" ? "error" : "info",
  });
  await vite.listen();
  const handler = (req: IncomingMessage, res: ServerResponse) => {
    if (basePath && !req.url?.startsWith(basePath)) {
      return;
    }
    if (req.url?.startsWith(socket.path)) {
      return;
    }
    vite.middlewares.handle(req, res, () => {
      res.statusCode = 404;
      res.end("Not found");
    });
  };
  return {
    handle: handler,
  };
}