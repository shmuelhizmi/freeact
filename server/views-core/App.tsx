import { useEffect, useState } from "react";
import { ClientConnection, UIModule } from "../../types/dist";
import { Client } from "@react-fullstack/fullstack/client";
import { emit, Events } from "@react-fullstack/fullstack/shared";
import { io, Socket } from "socket.io-client";
import { apiTransport } from "../src/shared/api"

declare global {
  interface Window {
    server: ClientConnection;
    winSize: [number, number];
    winTitle: string;
    modules: Record<string, string>;
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

function useLoadAdditionalBundles(socket: Socket) {
  const [comps, setComps] = useState<Record<string, any>>({});
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (loaded) return;
    const promises = Object.entries(window.modules || {}).map(
      ([name, modulePath]) =>
        import(modulePath).then((mod) => {
          (mod as UIModule<any>).api?.(apiTransport(name, socket as any) as any);
          return Promise.resolve((mod as UIModule<any>).components()).then(
            (comps) => ({ name, module: mod, comps })
          );
        })
    );
    Promise.all(promises).then((modules) => {
      const comps = modules.reduce((acc, mod) => {
        // mod.api?.(socket);
        return {
          ...acc,
          ...Object.entries(mod.comps).reduce((acc, [name, comp]) => {
            return {
              ...acc,
              [`${mod.name}_${name}`]: comp,
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

const socket = io(
  `http://${SERVER_HOST.host}:${SERVER_HOST.port}${
    SERVER_HOST?.namespace ?? ""
  }`,
  {
    transports: window.server.type === "SOCKET" ? ["websocket"] : undefined,
    path: SERVER_HOST.path,
  }
);

function App({ onLoad }: { onLoad(): void }) {
  const comps = useLoadAdditionalBundles(socket);
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
    <Client<any>
      transport={socket as any}
      requestViewTreeOnMount
      views={{
        ...comps,
      }}
    />
  );
}

export default App;
