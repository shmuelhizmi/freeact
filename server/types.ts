import type { Server } from "@react-fullstack/fullstack/server";
import type { Server as HTTPServer } from "http";

export type ServerTransport = Parameters<typeof Server>[0]["transport"];
export interface ServeOptions {
  runFrom?: "chrome-app" | "browser" | "none";
  windowDimensions?: { width: number; height: number };
  title?: string;
  logger?: (message: string) => void;
  port?: number;
  customConnection?: {
    httpServer: HTTPServer;
    basePath: string;
  };
  additionalComponentsBundles?: string[];
}
