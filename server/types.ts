import type { Server } from "@react-fullstack/fullstack/server";
import type { Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io"
import React from "react";

export type ServerTransport = Parameters<typeof Server>[0]["transport"];
export interface ServeOptions {
  runFrom?: "chrome-app" | "browser" | "none";
  windowDimensions?: { width: number; height: number };
  title?: string;
  logger?: (message: string) => void;
  port?: number;
  customConnection?: {
    basePath: string;
    httpServer: HTTPServer;
    socket?: {
      io: SocketServer;
      /**
       * The path to the socket.io server. Defaults to "/socket.io" incase a io server is provided or customConnection.basePath + '/server' if not
       */
      path?: string;
      /**
       * socket.io namespace to use. Defaults to customConnection.basePath
       */
      namespace?: string;
    }
  };
  additionalComponents?: {
    bundles?: string[];
    ssrViews: Record<string, React.ComponentType>;
  };
}
