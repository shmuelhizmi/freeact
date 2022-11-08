import { Client } from "@react-fullstack/fullstack-socket-client"
import { Components } from "../types";
import { ViewsToComponents } from "@react-fullstack/fullstack";
import * as Customs from "./customs"
import * as UIs from "./ui"
import { CssVarsProvider } from '@mui/joy/styles';

declare global {
  interface Window {
    serverPort: number;
    winSize: [number, number];
    winTitle: string;
  }
}


try {
  window.resizeTo(...window.winSize);
  window.document.title = window.winTitle;
} catch (e) {
}

const SERVER_PORT = window.serverPort;


const Views = {
  ...UIs,
  ...Customs,
} as any;

function App() {

  return (
    <CssVarsProvider defaultColorScheme={"dark"} defaultMode="dark">
      <Client<Components> host="127.0.0.1" port={SERVER_PORT} socketOptions={{
        transports: ["websocket"],
      }} views={Views as unknown as ViewsToComponents<Components>} />
    </CssVarsProvider>
  )
}

export default App
