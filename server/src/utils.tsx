import os from "os";
import { exec } from "child_process";
// @ts-ignore
import chromePaths from "chrome-paths";
import { SocketConnection } from "./http";
import { GlobalAppServeOptions, ServeOptionsBase } from "./types";

const appendQuery = (url: string, query: Record<string, string>) => {
  const urlObj = new URL(url);
  Object.entries(query).forEach(([key, value]) => {
    urlObj.searchParams.append(key, value);
  });
  return urlObj.toString();
};

const dimensionsStr = (dimensions?: { width: number; height: number }) =>
  `${dimensions?.width || 500},${dimensions?.height || 700}`;

const appendDimensions = (
  url: string,
  dimensions?: { width: number; height: number }
) => {
  return appendQuery(url, {
    size: dimensionsStr(dimensions),
  });
};

export function runChromeApp(
  client: string,
  dimensions?: { width: number; height: number }
) {
  const chromePath =
    chromePaths.chrome || chromePaths.chromium || chromePaths.chromeCanary;
  if (chromePath) {
    // run in app mode
    const app = exec(
      [
        `"${chromePath}"`,
        `--incognito`,
        `--app=${appendDimensions(client, dimensions)}`,
        `--window-size=${dimensionsStr(dimensions)}`,
      ].join(" ")
    );
    process.on("exit", () => {
      app.kill();
    });
  }
}

export function openBrowserOnHost(
  url: string,
  dimensions?: { width: number; height: number }
) {
  const withDimensions = appendDimensions(url, dimensions);
  switch (os.platform()) {
    case "darwin":
      exec(`open ${withDimensions}`);
      break;
    case "win32":
      exec(`start ${withDimensions}`);
      break;
    case "linux":
    case "freebsd":
    case "openbsd":
    case "sunos":
      exec(`xdg-open ${withDimensions}`);
      break;
    case "android":
      exec(`am start -a android.intent.action.VIEW -d ${withDimensions}`);
      break;
    default:
      break;
  }
}

export function getClientsGlobals(
  options: Pick<GlobalAppServeOptions, "title" | "windowDimensions">,
  socket: SocketConnection
) {
  return {
    winTitle: options.title,
    winSize: options.windowDimensions && [
      options.windowDimensions.width || 800,
      options.windowDimensions.height || 600,
    ],
    server: {
      type: "SOCKET",
      path: socket.path,
      namespace: socket.namespace,
    },
  };
}

// export function replaceTextWithTypography<T>(node: T, i: number = 0) {
//   if (typeof node === "string") {
//     return (
//       <ViewsProvider<Components> key={i + node}>
//         {({ Typography }) => <Typography type="none" txt={node} />}
//       </ViewsProvider>
//     );
//   }
//   if (Array.isArray(node)) {
//     return node.map(replaceTextWithTypography);
//   }
//   return node;
// }

export function log(
  option: Pick<ServeOptionsBase, "logger"> | undefined,
  type: "info" | "warn" | "error",
  msg: string
) {
  const logger = option?.logger || console[type];
  logger(`[${type.toUpperCase()}] ${msg}`);
}
