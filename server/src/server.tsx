import React from "react";
import { Render } from "@react-fullstack/render";
import getPort from "get-port";
import { GlobalAppServeOptions, RequestServeOptions, ServerTransport } from "./types";
import {
  Server,
  createInstanceRenderHandler,
} from "@react-fullstack/fullstack/server";
import { log, openBrowserOnHost, runChromeApp } from "./utils";
import { createSsr, hostStatics } from "./client";
import {
  createRequestHandler,
  createRouter,
  getServers,
  Servers,
} from "./http";
import { CompiledServerModules, ModulesApi, ServerModules } from "@freeact/types";
import { createModulesApi } from "./api";

export async function serve<T>(
  render: (resolve?: (value: T) => void) => JSX.Element,
  modules: Promise<CompiledServerModules>,
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
  const awaitedModules = await modules;
  const ssr = createSsr(
    options,
    awaitedModules,
    basePath,
    router.socket,
    ssrHandler.render
  );
  router.handle(ssr, ["/index.html", "/"]);
  const statics = hostStatics(awaitedModules);
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

export function createSessionHandler<Modules extends ServerModules>(options: RequestServeOptions, modules: Promise<CompiledServerModules>) {
  const servers = getServers(options);
  function handle<T>(
    render: (
      api: ModulesApi<Modules>,
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
      const awaitedModules = await modules;
      const { result, router, ssrHandler } = createConnection<T, Modules>(
        render,
        servers,
        modules
      );
      const ssr = createSsr(
        {
          title,
          windowDimensions,
          staticsBasePath: options.staticsBasePath,
        },
        awaitedModules,
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
      const { router, result } = createConnection(render, servers, modules);
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

function createConnection<T, Modules extends ServerModules>(
  render: (
    api: ModulesApi<Modules>,
    resolve: (value: T) => void,
    reject: (error: any) => void
  ) => JSX.Element,
  servers: Servers,
  modules: Promise<CompiledServerModules>
) {
  const router = createRequestHandler({ servers });
  const ssrHandler = createInstanceRenderHandler();
  const result = new Promise(async (resolve, reject) => {
    let resolvedOrRejected = false;
    const awaitedModules = await modules;
    const { stop } = Render(
      <Server
        singleInstance
        instanceRenderHandler={ssrHandler}
        transport={router.transport}
      >
        {() =>
          render(
            createModulesApi<Modules>(router.socket.io, awaitedModules),
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
