import { Client } from "@react-fullstack/fullstack-socket-client";
import { Components } from "../types";
import { ClientConnection } from "../types/connection";
import { ViewsToComponents } from "@react-fullstack/fullstack/client";
import * as Customs from "./customs";
import * as UIs from "./ui";
import { CssVarsProvider } from "@mui/joy/styles";
import React, { useEffect, useState } from "react";
import { Base } from "./ui/Base";
import { StyleEnabled } from "../types/ui/base";

declare global {
  interface Window {
    server: ClientConnection;
    winSize: [number, number];
    winTitle: string;
    bundles: string[];
  }
}

try {
  window.document.title = window.winTitle;
  window.resizeTo(...window.winSize);
} catch (e) {}

const SERVER_HOST =
  window.server.type === "SOCKET" || window.server.type === "HTTP-SOCKET"
    ? {
        host: window.server.host || window.location.hostname,
        port: window.server.port,
        path: window.server.path,
      }
    : undefined;

const Views = {
  ...UIs,
  ...Customs,
} as any;

function useLoadAdditionalBundles() {
  const [comps, setComps] = useState<Record<string, any>>({});
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (loaded) return;
    const promises = (window.bundles || []).map(
      (bundle) => import("/" + bundle)
    );
    Promise.all(promises).then((modules) => {
      const comps = modules.reduce((acc, mod) => {
        return {
          ...acc,
          ...Object.entries(mod).reduce((acc, [k, v]) => {
            return { ...acc, [k]: Base(v as React.FunctionComponent<StyleEnabled>) };
          }, {}),
        };
      }, {});
      setComps(comps);
      setLoaded(true);
    });
  }, [loaded]);
  return loaded ? comps : undefined;
}

function App() {
  const comps = useLoadAdditionalBundles();
  if (!comps) return null;
  if (!SERVER_HOST) {
    document.body.innerHTML = "No server host found";
    throw new Error("Server host not found");
  }
  return (
    <CssVarsProvider defaultColorScheme={"dark"} defaultMode="dark">
      <Client<Components>
        host={SERVER_HOST.host}
        port={SERVER_HOST.port}
        socketOptions={{
          transports:
            window.server.type === "SOCKET" ? ["websocket"] : undefined,
          path: SERVER_HOST.path,
        }}
        views={{
          ...(Views as unknown as ViewsToComponents<Components>),
          ...comps,
        }}
      />
    </CssVarsProvider>
  );
}

export default App;
