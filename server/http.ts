import http from "http";
import path from "path";
import { Server as SocketServer, Namespace, Socket } from "socket.io";
import { EventEmitter } from "stream";
import {
  GlobalAppServeOptions,
  RequestServeOptions,
  ServeOptionsBase,
  ServerTransport,
} from "./types";
import { v4 } from "uuid";
import { hostStatics } from "./client";
import { CompiledServerModules } from "../types/module";

export function getServers(options: ServeOptionsBase | GlobalAppServeOptions | RequestServeOptions) {
  const { connection } = options;
  const {
    httpServer,
    socket,
    basePath,
    timeout: initialTimeout,
  } = {
    basePath: "/",
    ...(connection || {}),
  };
  let server = httpServer!;
  let timeout = initialTimeout || httpServer?.timeout || 30 * 1000;
  if (!httpServer) {
    server = http.createServer();
    server.keepAliveTimeout = timeout || 30 * 1000;
    server.headersTimeout = timeout || 30 * 1000;
    server.setTimeout(timeout || 30 * 1000);
  }

  let serverPath = socket?.path;
  let io = socket?.io;
  const maxTimeForClientToInitConnection = (options as RequestServeOptions).connection?.socket?.maxTimeForClientToInitConnection || 90 * 1000;
  if (!io) {
    serverPath ||= path.join(basePath, v4());
    io = new SocketServer({
      path: serverPath,
      transports: ["websocket"],
    });
    io.attach(server);
  } else {
    serverPath ||= io.path();
  }
  return {
    server,
    serverPath,
    io,
    maxTimeForClientToInitConnection,
    timeout,
    makeNamespace: () => path.join(basePath, v4()),
    basePath,
    destry: () => {
      if (!httpServer) {
        server.close();
      }
      if (!socket?.io && io) {
        io.close();
      }
    },
  };
}

export type Servers = ReturnType<typeof getServers>;

export function createNamespaceTransport(namespace: Namespace) {
  return {
    on: (event, callback) => {
      if (event === "connection") {
        namespace.on(event, callback);
      } else {
        namespace.sockets.forEach((socket) => socket.on(event, callback));
      }
    },
    emit: (event, ...args) => {
      namespace.sockets.forEach((socket) => socket.emit(event, ...args));
    },
    off: (event, callback) => {
      if (event === "connection") {
        namespace.off(event, callback);
      } else {
        namespace.sockets.forEach((socket) => socket.off(event, callback));
      }
    },
  };
}

export type RouterOptions = {
  serveOptions: ServeOptionsBase;
  servers?: Servers;
};
export type SocketConnection = {
  namespace: string;
  path: string;
  io: SocketServer;
};
export type HTTPRequestHandler<T = void> = (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => T;
export type Router = {
  handle: (handler: HTTPRequestHandler, only?: string[]) => void;
  transport: ServerTransport;
  listen: typeof http.Server.prototype.listen;
  socket: SocketConnection;
  destroy: () => void;
};

export function createRouter({ serveOptions, servers }: RouterOptions): Router {
  const { basePath, io, makeNamespace, server, serverPath, destry } =
    servers || getServers(serveOptions);
  const namespace = makeNamespace();
  const namespaceSocket = io.of(namespace);
  const handleEmitter = new EventEmitter();
  const transport = createNamespaceTransport(namespaceSocket);
  server.on("request", (req, res) => {
    const url = new URL(req.url! || "", "http://localhost");
    const basePathWithoutSlash = basePath.slice(0, -1);
    if (url.pathname === basePathWithoutSlash) {
      // redirect to the base path
      res.writeHead(302, {
        Location: basePath,
      });
      res.end();
      return;
    }
    if (url.pathname.startsWith(basePath)) {
      req.url = url.pathname.slice(basePath.length);
      handleEmitter.emit("request", req, res);
    }
  });
  return {
    handle: (
      handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
      only?: string[]
    ) => {
      handleEmitter!.on("request", (req, res) => {
        if (only) {
          const url = new URL(req.url! || "", "http://localhost");
          if (only.includes(url.pathname)) {
            handler(req, res);
          }
        } else {
          handler(req, res);
        }
      });
    },
    transport,
    listen: server!.listen.bind(server!) as typeof server.listen,
    socket: {
      namespace,
      path: serverPath,
      io,
    },
    destroy: () => {
      handleEmitter.removeAllListeners();
      destry();
    },
  };
}

export type RequestHandler = {
  socket: SocketConnection;
  transport: ServerTransport;
  destroy: () => void;
  awaitDisconnection: Promise<void>;
};
export type RequestHandlerOptions = { servers: Servers };
export function createRequestHandler({
  servers,
}: RequestHandlerOptions): RequestHandler {
  const { io, makeNamespace, serverPath, maxTimeForClientToInitConnection } = servers;
  const namespace = makeNamespace();
  const namespaceSocket = io.of(namespace);
  const transport = createNamespaceTransport(namespaceSocket);
  const awaitDisconnection = new Promise<void>(async (resolve) => {
    const connection = new Promise<Socket>((resolve) => {
      namespaceSocket.on("connection", (socket) => {
        resolve(socket);
      });
    });
    const timeout = new Promise<void>((resolve) => {
      setTimeout(resolve, maxTimeForClientToInitConnection);
    });
    const socket = await Promise.race([connection, timeout]);
    if (!socket) {
      resolve();
      return;
    }
    socket.on("disconnect", () => {
      resolve();
    });
  });
  const destroy = () => {
    namespaceSocket.disconnectSockets();
    namespaceSocket.removeAllListeners();
    delete io._nsps[namespace];
  };
  awaitDisconnection.then(destroy);
  return {
    socket: {
      namespace,
      path: serverPath,
      io,
    },
    transport,
    destroy,
    awaitDisconnection,
  };
}

export function hostClientBundles(
  server: http.Server,
  /**
   * The base path to host static bundles from, defaults to random long generated path
   */
  modules: Promise<CompiledServerModules>,
  basePath?: string,
) {
  const handlerBase = modules.then((modules) => hostStatics(modules));
  const path = basePath || "/" + v4() + "/";
  const handler = (req: http.IncomingMessage, res: http.ServerResponse) => {
    const url = new URL(req.url! || "", "http://localhost");
    if (url.pathname.startsWith(path)) {
      req.url = url.pathname.slice(path.length - 1);
      handlerBase.then((handler) => handler(req, res));
    }
  };
  server.on("request", handler);
  return {
    path,
    destroy: () => {
      server.off("request", handler);
    },
  };
}

export function createHostClientBundlesMiddleware(
  modules: Promise<CompiledServerModules>,
  basePath?: string,
) {
  const handlerBase = modules.then((modules) => hostStatics(modules));
  const path = basePath || "/" + v4() + "/";
  const middleware = (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: () => void
  ) => {
    const url = new URL(req.url! || "", "http://localhost");
    if (url.pathname.startsWith(path)) {
      req.url = url.pathname.slice(path.length - 1);
      handlerBase.then((handler) => handler(req, res));
    } else {
      next();
    }
  };
  return { middleware, path };
}
