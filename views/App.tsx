import { Client } from "@react-fullstack/fullstack-socket-client"
import { Components } from "../types";
import { ViewsToComponents } from "@react-fullstack/fullstack";
import * as Customs from "./customs"
import * as UIs from "./ui"
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT || 9382;
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';


const Views = new Proxy({
  ...UIs,
  ...Customs,
} as any, {
  get: (target, key) => {
    if (key in target) {
      return (props: any) => {
        let children = props.children;
        const text = props.$;
        if (Array.isArray(children) && text) {
          children = [...children, text];
        }
        if (!children && text) {
          children = text;
        }
        const Comp = target[key];
        return <Comp {...props}>{children}</Comp>;
      }
    }
  }
})

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
