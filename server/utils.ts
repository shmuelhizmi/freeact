import { exec } from "child_process";
import chromePaths from "chrome-paths";
import os from "os";
import { ServeOptions } from "./types";

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
  if (!dimensions) {
    return url;
  }
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
        `--user-data-dir=${os.tmpdir()}`,
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

export function getClientsGlobals(options: ServeOptions, serverPort?: number) {
  return {
    winTitle: JSON.stringify(options.title),
    winSize: options.windowDimensions && [
      options.windowDimensions.width || 800,
      options.windowDimensions.height || 600,
    ],
    server: serverPort
      ? {
          type: "SOCKET",
          port: serverPort,
        }
      : options.customConnection?.client,
  };
}
