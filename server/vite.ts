import path from "path";
import { createServer, build } from "vite";
import { ServeOptions } from "./types";
import reactVitePlugin from "@vitejs/plugin-react";
import getPort from "get-port";
import { getClientsGlobals } from "./utils";

export async function startViteServer(
  options: ServeOptions,
  port: number,
  serverPort?: number
): Promise<string> {
  const vite = await createServer({
    root: path.join(__dirname, ".."),
    server: {
      port,
    },
    define: getClientsGlobals(options, serverPort),
    plugins: [reactVitePlugin()],
    envPrefix: "VITE_",
    logLevel: process.env.NODE_ENV === "production" ? "error" : "info",
  });
  await vite.listen();
  return `http://127.0.0.1:${port}`;
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