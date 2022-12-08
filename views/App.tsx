import React, { useEffect, useState } from "react";
import { Client } from "@react-fullstack/fullstack-socket-client";
import { Components } from "../types";
import { ClientConnection } from "../types/connection";
import { ViewsToComponents } from "@react-fullstack/fullstack/client";
import AppWrapper from "./baseWrapper";
import { Base } from "./ui/Base";
import { StyleEnabled } from "../types/ui/base";
import { Views } from "./views";

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
        port: window.server.port || Number(window.location.port),
        path: window.server.path,
        namespace: window.server.namespace,
      }
    : undefined;

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
            return {
              ...acc,
              [k]: Base(v as React.FunctionComponent<StyleEnabled>),
            };
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
    <AppWrapper>
      <Client<Components>
        host={SERVER_HOST.host}
        port={
          (SERVER_HOST.port +
            (SERVER_HOST.namespace ?? "")) as unknown as number
        }
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
    </AppWrapper>
  );
}

export default App;
