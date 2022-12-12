export type ClientConnection = {
      type: "SOCKET" | "HTTP-SOCKET";
      host?: string;
      port?: number;
      path?: string;
      namespace?: string;
    };
