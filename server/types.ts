import type { Server } from "@react-fullstack/fullstack/server";
import { ClientConnection } from "../types/connection";

export type ServerTransport = Parameters<typeof Server>[0]['transport'];
export interface ServeOptions {
    runFrom?: "chrome-app" | "browser" | "none";
    windowDimensions?: { width: number; height: number };
    title?: string;
    logger?: (message: string) => void;
    serverPort?: number;
    clientPort?: number;
    customConnection?: {
      server: {
        customTransport: ServerTransport;
      };
      client: ClientConnection;
    };
    additionalComponentsBundles?: string[];
  }