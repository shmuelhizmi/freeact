import { Client } from "@react-fullstack/fullstack-socket-client"
import { Components } from "../types";
import { ClientConnection } from "../types/connection";
import { ViewsToComponents } from "@react-fullstack/fullstack/client";
import * as Customs from "./customs"
import * as UIs from "./ui"
import { CssVarsProvider } from '@mui/joy/styles';

declare global {
  interface Window {
    server: ClientConnection;
    winSize: [number, number];
    winTitle: string;
  }
}


try {
  window.resizeTo(...window.winSize);
  window.document.title = window.winTitle;
} catch (e) {
}

const SERVER_HOST = (window.server.type === "SOCKET" || window.server.type === "HTTP-SOCKET") ? {
  host: window.server.host || window.location.hostname,
  port: window.server.port,
  path: window.server.path
} : undefined;

const Views = {
  ...UIs,
  ...Customs,
} as any;

function App() {
  if (!SERVER_HOST) {
    document.body.innerHTML = "No server host found";
    throw new Error("Server host not found");
  }
  return (
    <CssVarsProvider defaultColorScheme={"dark"} defaultMode="dark">
      <Client<Components> host={SERVER_HOST.host} port={SERVER_HOST.port} socketOptions={{
        transports: window.server.type === "SOCKET" ? ["websocket"] : undefined,
        path: SERVER_HOST.path,
      }} views={Views as unknown as ViewsToComponents<Components>} />
    </CssVarsProvider>
  )
}

export default App
