import http from "http";
import path from "path";
import { Server as Socket } from "socket.io";
import { EventEmitter } from "stream";
import { ServeOptions } from "./types";

export function createRouter(serveOptions: ServeOptions) {
  const { customConnection } = serveOptions;
  const { basePath = "/", httpServer, socket } = customConnection || {};
  let server = httpServer!;
  if (!httpServer) {
    server = http.createServer();
    server.keepAliveTimeout = 30 * 1000;
    server.headersTimeout = 30 * 1000;
    server.setTimeout(90 * 1000);
  }
  let io = socket?.io;
  const namespace = socket?.namespace || basePath;
  let serverPath = socket?.path;
  if (!io) {
    serverPath ||= path.join(basePath, "/server");
    io = new Socket({
      path: serverPath,
      transports: ["websocket"],
    });
    io.attach(server);
  } else {
    serverPath ||= "/socket.io";
  }
  const namespaceSocket = io.of(namespace);
  const handleEmitter = new EventEmitter();
  const transport = {
    on: (event, callback) => {
      if (event === "connection") {
        namespaceSocket.on(event, callback);
      }
    },
    emit: (event, ...args) => {
      namespaceSocket.emit(event, ...args);
    },
    off: (event, callback) => {
      namespaceSocket.removeListener(event, callback);
      if (event === "connection") {
        namespaceSocket.off(event, callback);
      }
    },
  };
  server.on("request", (req, res) => {
    if (req.url?.startsWith(basePath.slice(0, -1))) {
      handleEmitter.emit("request", req, res);
    }
  });
  return {
    handle: (
      handler: (req: http.IncomingMessage, res: http.ServerResponse) => void
    ) => {
      handleEmitter!.on("request", handler);
    },
    transport,
    listen: server!.listen.bind(server!) as typeof server.listen,
    socket: {
      namespace,
      path: serverPath,
      io,
    },
  };
}

export type Router = ReturnType<typeof createRouter>;

export function redirect(from: string, to: string) {
  return (req: http.IncomingMessage, res: http.ServerResponse) => {
    if (req.url === from) {
      res.writeHead(301, {
        Location: to,
      });
      res.end();
    }
  };
}
