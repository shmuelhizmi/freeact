export type ClientConnection =
  | {
      type: "URL";
      url: string;
    }
  | {
      type: "SOCKET" | "HTTP-SOCKET";
      host?: string;
      port?: number;
      path?: string;
      namespace?: string;
    };
