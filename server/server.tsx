import React from 'react';
import { Render } from "@react-fullstack/render";
import getPort from "get-port";
import { ServeOptions, ServerTransport } from "./types";
import { createSocketServer } from "@react-fullstack/fullstack-socket-server";
import { Server } from "@react-fullstack/fullstack/server";
import { Server as SocketIOserver } from "socket.io";
import { openBrowserOnHost, runChromeApp } from './utils';
import { startClient } from './client';

const SocketServer = createSocketServer(Server);


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
  } as ServerTransport
}

export async function serve<T>(
  render: (resolve: (value: T) => void) => JSX.Element,
  options: ServeOptions = { runFrom: "chrome-app", logger: console.log }
) {
  const isUsingCustomConnection = options.customConnection !== undefined;
  const serverPort = !isUsingCustomConnection ? await getPort({ port: options.serverPort || 3001 }) : undefined;


  const logger = options.logger || console.log;
  if (serverPort) {
    logger(`Server running at http://127.0.0.1:${serverPort}`);
  }
  const [result, clientPort] = await Promise.all([
    new Promise<T>((resolve) => {
      if (!isUsingCustomConnection) {
        Render(
          <SocketServer singleInstance port={serverPort!}>
            {() => render(resolve)}
          </SocketServer>
        );
      } else {
        Render(
          <Server singleInstance transport={options.customConnection!.server.customTransport}>
            {() => render(resolve)}
          </Server>
        );
      }
    }),
    startClient(
      options,
      serverPort
    ).then(({ url, port }) => {
      logger(`Client server running at ${url}`);
      if (options.runFrom === "chrome-app") {
        runChromeApp(url, options.windowDimensions);
      }
      if (options.runFrom === "browser") {
        openBrowserOnHost(url, options.windowDimensions);
      }
      return port;
    }),
  ]);

  return { serverPort, result, clientPort };
}