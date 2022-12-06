import http from "http";
import { Server } from "socket.io";

export function createRouter(server?: http.Server, serverBasePath = "/server") {
  if (!server) {
    server = http.createServer();
    server.keepAliveTimeout = 30 * 1000;
    server.headersTimeout = 30 * 1000;
    server.setTimeout(90 * 1000);
  }
  const io = new Server(server, {
    path: serverBasePath,
    transports: ["websocket"],
  });
  const transport = {
    on: (event, callback) => {
      if (event === "connection") {
        io.on(event, callback);
      }
    },
    emit: (event, ...args) => {
      io.sockets.emit(event, ...args);
    },
    off: (event, callback) => {
      io.sockets.removeListener(event, callback);
      if (event === "connection") {
        io.off(event, callback);
      }
    },
  };
  return {
    handle: (
      handler: (req: http.IncomingMessage, res: http.ServerResponse) => void
    ) => {
      server!.on("request", handler);
    },
    transport,
    listen: server!.listen.bind(server!) as typeof server.listen,
  };
}

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
