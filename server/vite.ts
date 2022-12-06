import path from "path";
import { createServer, build } from "vite";
import { ServeOptions } from "./types";
import reactVitePlugin from "@vitejs/plugin-react";
import { getClientsGlobals } from "./utils";
import { IncomingMessage, ServerResponse } from "http";

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
  options: ServeOptions,
  serverPath: string
) {
  const basePath = options.customConnection?.basePath;
  const vite = await createServer({
    root: path.join(__dirname, ".."),
    define: processDefined(getClientsGlobals(options, serverPath)),
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
    if (req.url?.startsWith(serverPath)) {
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

export async function buildViteClient(): Promise<void> {
  await build({
    root: path.join(__dirname, ".."),
    plugins: [reactVitePlugin()],
    build: {
      outDir: path.join(__dirname, "..", "dist/client"),
    },
    envPrefix: "VITE_",
  });
}
