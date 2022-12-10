import type { Server } from "@react-fullstack/fullstack/server";
import type { Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io";
import React from "react";

export type ServerTransport = Parameters<typeof Server>[0]["transport"];
export interface GlobalAppServeOptions extends ServeOptionsBase {
  runFrom?: "chrome-app" | "browser" | "none";
  windowDimensions?: { width: number; height: number };
  title?: string;
  connection?: ServeOptionsBase["connection"] & {
    basePath: string;
  };
}

export interface RequestServeOptions extends ServeOptionsBase {
  staticsBasePath: string;
}

export interface ServeOptionsBase {
  logger?: (message: string) => void;
  connection?: {
    httpServer?: HTTPServer;
    port?: number;
    socket?: {
      io?: SocketServer;
      /**
       * the path in the http server that should be used for socket.io.
       * only relevant if socket.io is not provided
       */
      path?: string;
    };
  };
  additionalComponents?: {
    bundles?: string[];
    ssrViews: Record<string, React.ComponentType>;
  };
}
