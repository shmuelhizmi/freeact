import lazy from "../gen/globals";
import React, { useEffect, useState } from "react";
import { Components } from "../types";
import { ClientConnection } from "../types/connection";
import { ViewsToComponents, Client } from "@react-fullstack/fullstack/client";
import { emit, Events } from "@react-fullstack/fullstack/shared";
import AppWrapper from "./baseWrapper";
import { Base } from "./ui/Base";
import { StyleEnabled } from "../types/ui/base";
import { Views } from "./views";
import { io } from "socket.io-client";
import { registerAPI } from "./api";

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

const SERVER_HOST = {
  host: window.server.host || window.location.hostname,
  port: window.server.port || Number(window.location.port),
  path: window.server.path,
  namespace: window.server.namespace,
};

function useLoadAdditionalBundles() {
  const [comps, setComps] = useState<Record<string, any>>({});
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (loaded) return;
    const promises = (window.bundles || []).map((bundle) => import(bundle));
    lazy.then(() => {
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
    });
  }, [loaded]);
  return loaded ? comps : undefined;
}

const socket = io(
  `http://${SERVER_HOST.host}:${SERVER_HOST.port}${
    SERVER_HOST?.namespace ?? ""
  }`,
  {
    transports: window.server.type === "SOCKET" ? ["websocket"] : undefined,
    path: SERVER_HOST.path,
  }
);

registerAPI(socket);

function App({ onLoad }: { onLoad(): void }) {
  const comps = useLoadAdditionalBundles();
  useEffect(() => {
    socket.on(String(Events.UpdateViewsTree), onLoad);
    emit.request_views_tree(socket as any);
  }, [comps]);
  if (!comps) return null;
  if (!SERVER_HOST) {
    document.body.innerHTML = "No server host found";
    throw new Error("Server host not found");
  }
  return (
    <AppWrapper>
      <Client<Components>
        transport={socket as any}
        requestViewTreeOnMount
        views={{
          ...(Views as unknown as ViewsToComponents<Components>),
          ...comps,
        }}
      />
    </AppWrapper>
  );
}

export default App;
