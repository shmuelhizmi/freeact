import { createServer } from "vite";
import * as CompOverride from "./components";
import { Server } from "@react-fullstack/fullstack-socket-server";
import { Render } from "@react-fullstack/render";
import path from "path";
import { Components, Views, ExposedComponents } from "../types";
import _chromePaths from "chrome-paths";
import { ViewsProvider } from "@react-fullstack/fullstack";
import React from "react";
import { exec } from "child_process";
import { getPort } from "./utils/getPort";
import reactVitePlugin from "@vitejs/plugin-react";
import os from "os";

const chromePaths = _chromePaths as unknown as {
  chrome: string;
  chromium: string;
  chromeCanary: string;
};

interface ServeOptions {
  runFrom: "chrome-app" | "browser" | "none";
  windowDimensions?: { width: number; height: number };
  logger?: (message: string) => void;
}

function runChromeApp(clientPort: number) {
  const chromePath =
    chromePaths.chrome || chromePaths.chromium || chromePaths.chromeCanary;
  if (chromePath) {
    // run in app mode
    exec(`"${chromePath}" --app=http://127.0.0.1:${clientPort}`);
  }
}

function openBrowser(clientPort: number) {
  const url = `http://localhost:${clientPort}`;
  switch (os.platform()) {
    case "darwin":
      exec(`open ${url}`);
      break;
    case "win32":
      exec(`start ${url}`);
      break;
    case "linux":
    case "freebsd":
    case "openbsd":
    case "sunos":
      exec(`xdg-open ${url}`);
      break;
    case "android":
      exec(`am start -a android.intent.action.VIEW -d ${url}`);
      break;
    default:
      break;
  }
}

async function serve<T>(
  render: (resolve: (value: T) => void) => JSX.Element,
  options: ServeOptions = { runFrom: "chrome-app", logger: console.log }
) {
  const clientPort = await getPort({ port: 3000 });
  const serverPort = await getPort({ port: 3001 });

  process.env.VITE_SERVER_PORT = serverPort.toString();

  const clientServer = await createServer({
    root: path.join(__dirname, ".."),
    server: {
      port: clientPort,
    },
    plugins: [reactVitePlugin()],
    envPrefix: "VITE_",
    logLevel: process.env.NODE_ENV === "production" ? "error" : "info",
  });
  const logger = options.logger || console.log;
  logger(`Server running at http://127.0.0.1:${serverPort}`);
  const [result] = await Promise.all([
    new Promise<T>((resolve) => {
      Render(
        <Server<Components> singleInstance port={serverPort} views={Views}>
          {() => render(resolve)}
        </Server>
      );
    }),
    clientServer.listen().then(() => {
      logger(`Client server running at http://127.0.0.1:${clientPort}`);
    }),
  ]);
  if (options.runFrom === "chrome-app") {
    runChromeApp(clientPort);
  }
  if (options.runFrom === "browser") {
    openBrowser(clientPort);
  }

  return { clientPort, serverPort, result };
}

export default new Proxy(CompOverride, {
  get: (target, prop) => {
    if (typeof prop !== "string") {
      throw new Error("Invalid prop");
    }
    if (prop === "serve") {
      return serve;
    }
    if (!target[prop]) {
      target[prop] = (props: any) => {
        return (
          <ViewsProvider<Components>>
            {(Comps) => {
              const Comp = Comps[prop];
              if (!Comp) {
                throw new Error(`Component ${prop} not found`);
              }
              return <Comp {...props} />;
            }}
          </ViewsProvider>
        );
      };
    }
    return target[prop];
  },
}) as unknown as ExposedComponents & { serve: typeof serve };
