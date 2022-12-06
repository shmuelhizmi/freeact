import React from "react";
import { Render } from "@react-fullstack/render";
import getPort from "get-port";
import { ServeOptions, ServerTransport } from "./types";
import { Server, createInstanceRenderHandler } from "@react-fullstack/fullstack/server";
import { Server as SocketIOserver } from "socket.io";
import { openBrowserOnHost, runChromeApp } from "./utils";
import { createClient } from "./client";
import { createRouter, redirect } from "./http";
import path from "path";

export function socketIoToTransport(io: SocketIOserver): ServerTransport {
  return {
    on: (event: string, callback: (...args: any[]) => void) => {
      if (event === "connection") {
        io.on(event, callback);
      }
    },
    emit: (event: string, ...args: any[]) => {
      io.sockets.emit(event, ...args);
    },
    off: (event: string, callback: (...args: any[]) => void) => {
      io.sockets.removeListener(event, callback);
      if (event === "connection") {
        io.off(event, callback);
      }
    },
  } as ServerTransport;
}

export async function serve<T>(
  render: (resolve?: (value: T) => void) => JSX.Element,
  options: ServeOptions = {}
) {
  const logger = options.logger || console.log;
  const { basePath, httpServer } = options.customConnection || {};
  if (basePath && (!basePath.startsWith("/") || !basePath.endsWith("/"))) {
    throw new Error(
      `customConnection.basePath must start with a slash and not end with a slash. basePath: ${basePath}`
    );
  }
  const serverPath = path.join(basePath || "/", "server");
  const server = createRouter(httpServer, serverPath);
  const ssrHandler = createInstanceRenderHandler();
  const client = await createClient(options, serverPath, ssrHandler.render);
  server.handle(client);
  const result = new Promise<T>((resolve) => {
    Render(
      <Server singleInstance instanceRenderHandler={ssrHandler} transport={server.transport}>
        {() => render(resolve)}
      </Server>
    );
  });
  if (basePath) {
    server.handle(redirect(basePath.slice(0, basePath.length - 1), basePath));
  }
  if (!httpServer) {
    const port = await getPort({ port: options.port || 3000 });
    const url = `http://localhost:${port}`;
    server.listen(port, () => {
      logger(`Server running at ${url}`);
    });
    switch (options.runFrom) {
      case "chrome-app":
        runChromeApp(`${url}`);
        break;
      case "browser":
        openBrowserOnHost(`${url}`);
        break;
    }

    return {
      serverPort: port,
      await: result,
    };
  }

  return {
    await: result,
  };
}
