import React from "react";
import { Render } from "@react-fullstack/render";
import getPort from "get-port";
import {
  GlobalAppServeOptions,
  RequestServeOptions,
} from "./types";
import {
  Server,
  createInstanceRenderHandler,
} from "@react-fullstack/fullstack/server";
import { Server as SocketIOserver } from "socket.io";
import { log, openBrowserOnHost, runChromeApp } from "./utils";
import { createSsr, hostStatics } from "./client";
import {
  createRequestHandler,
  createRouter,
  getServers,
  Servers,
} from "./http";
import { API } from "../types";
import { createAPI } from "./api";


export async function serve<T>(
  render: (resolve?: (value: T) => void) => JSX.Element,
  options: Partial<GlobalAppServeOptions & RequestServeOptions> = {}
) {
  const logger = options.logger || console.log;
  const { basePath = "/", httpServer } = options.connection || {};
  if (!basePath.startsWith("/") || !basePath.endsWith("/")) {
    throw new Error(
      `customConnection.basePath must start with a slash and not end with a slash. basePath: ${basePath}`
    );
  }
  const router = createRouter({ serveOptions: options });
  const ssrHandler = createInstanceRenderHandler();
  const ssr = createSsr(options, basePath, router.socket, ssrHandler.render);
  router.handle(ssr, ["/index.html", "/"]);
  const statics = hostStatics(options.additionalComponents?.bundles || []);
  router.handle(statics);
  const result = new Promise<T>((resolve) => {
    const { stop } = Render(
      <Server
        singleInstance
        instanceRenderHandler={ssrHandler}
        transport={router.transport}
      >
        {() =>
          render((value) => {
            resolve(value);
            stop();
          })
        }
      </Server>
    );
  });
  if (!httpServer) {
    const port = await getPort({ port: options.connection?.port || 3000 });
    const url = `http://localhost:${port}`;
    router.listen(port, () => {
      logger(`Server running at ${url}`);
    });
    switch (options.runFrom) {
      case "chrome-app":
        runChromeApp(`${url}`);
        break;
      case "browser":
        openBrowserOnHost(`${url}`);
        break;
    }

    return {
      serverPort: port,
      await: result,
    };
  }

  return {
    await: result,
  };
}

export function createSessionHandler(options: RequestServeOptions) {
  const servers = getServers(options);
  function handle<T>(
    render: (
      api: API.API,
      resolve: (value: T) => void,
      reject: (error: any) => void
    ) => JSX.Element,
    configuration?: Pick<
      GlobalAppServeOptions,
      "title" | "windowDimensions" | "logger"
    >
  ) {
    const { title, windowDimensions } = configuration || {};
    const handleHttp = async (req, res): Promise<T | undefined> => {
      const url = new URL(req.url || "/", `http://${req.headers.host}`);
      if (!url.pathname.endsWith("/")) {
        log(
          configuration,
          "error",
          'can only handle requests with a path that ends with a slash. e.g. "/sessions/"'
        );
        throw new Error(
          'can only handle requests with a path that ends with a slash. e.g. "/sessions/'
        );
      }
      const { result, router, ssrHandler } = createConnection<T>(
        render,
        servers
      );
      const ssr = createSsr(
        {
          title,
          windowDimensions,
          additionalComponents: options.additionalComponents,
          staticsBasePath: options.staticsBasePath,
        },
        options.staticsBasePath,
        router.socket,
        ssrHandler.render
      );
      // wait for initial render to complete
      await new Promise<void>((resolve) => setTimeout(resolve));
      ssr(req, res);
      return result as Promise<T>;
    };

    const createSocketConnection = () => {
      const { router, result } = createConnection(render, servers);
      return {
        result: result as Promise<T>,
        socket: router.socket,
      };
    };
    return {
      http: handleHttp,
      createSocketConnection,
    };
  }
  return {
    handle,
  };
}

function createConnection<T>(
  render: (
    api: API.API,
    resolve: (value: T) => void,
    reject: (error: any) => void
  ) => JSX.Element,
  servers: Servers
) {
  const router = createRequestHandler({ servers });
  const ssrHandler = createInstanceRenderHandler();
  const api = createAPI(router.transport);
  const result = new Promise((resolve, reject) => {
    let resolvedOrRejected = false;
    const { stop } = Render(
      <Server
        singleInstance
        instanceRenderHandler={ssrHandler}
        transport={router.transport}
      >
        {() =>
          render(
            api,
            (value) => {
              if (resolvedOrRejected) return;
              resolve(value);
              stop();
              resolvedOrRejected = true;
            },
            (error) => {
              if (resolvedOrRejected) return;
              reject(error);
              stop();
              resolvedOrRejected = true;
            }
          )
        }
      </Server>
    );
    router.awaitDisconnection.then(() => {
      if (resolvedOrRejected) return;
      resolve(undefined);
      stop();
      resolvedOrRejected = true;
    });
  });
  result.then(() => router.destroy());
  return {
    result,
    router,
    ssrHandler,
  };
}
