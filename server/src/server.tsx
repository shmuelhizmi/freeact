import getPort from "get-port";
import { GlobalAppServeOptions, RequestServeOptions } from "./types";
import { createInstanceRenderHandler } from "@react-fullstack/fullstack/server";
import { log, openBrowserOnHost, runChromeApp } from "./utils";
import { createSsr, hostStatics } from "./client";
import {
  createRequestHandler,
  createRouter,
  getServers,
  Servers,
} from "./http";
import {
  CompiledServerModules,
  CompilerAppProvider,
  ModulesApi,
  ServerModules,
} from "@freeact/types";
import { APIProvider, createModulesApi } from "./api";
import { IncomingMessage, ServerResponse } from "http";
import { renderApp } from "./renderer";
import { run } from "./utils/run";

export async function serve<T>(
  render: (resolve?: (value: T) => void) => JSX.Element,
  modules: Promise<CompiledServerModules>,
  options: Partial<GlobalAppServeOptions & RequestServeOptions> = {},
  compilerAppProvider: CompilerAppProvider
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
    {...options, logger},
    awaitedModules,
    basePath,
    router.socket,
    ssrHandler.render
  );
  router.handle(ssr, ["/index.html", "/"]);
  const statics = hostStatics(awaitedModules, logger);
  router.handle(statics);
  const result = renderApp(
    render,
    ssrHandler,
    router.transport,
    compilerAppProvider
  ).promise as Promise<T>;
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

export function createSessionHandler<Modules extends ServerModules>(
  options: RequestServeOptions,
  modules: Promise<CompiledServerModules>,
  compilerAppProvider: CompilerAppProvider
) {
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
    const handleHttp = async (
      req: IncomingMessage,
      res: ServerResponse
    ): Promise<T | undefined> => {
      const awaitedModules = await modules;
      const { result, router, ssrHandler } = createConnection<T, Modules>(
        render,
        servers,
        modules,
        compilerAppProvider
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
      const { router, result } = createConnection(
        render,
        servers,
        modules,
        compilerAppProvider
      );
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
  modules: Promise<CompiledServerModules>,
  compilerAppProvider: CompilerAppProvider
) {
  const router = createRequestHandler({ servers });
  const ssrHandler = createInstanceRenderHandler();
  const result = run(async () => {
    const awaitedModules = await modules;
    const apis = createModulesApi<Modules>(router.transport, awaitedModules);
    const { stop, promise } = renderApp(
      (res, rej) => render(apis, res, rej),
      ssrHandler,
      router.transport,
      compilerAppProvider,
      apis
    );
    router.awaitDisconnection.then(() => {
      stop();
    });

    promise.then(() => router.destroy());
    return promise;
  });
  return {
    result,
    router,
    ssrHandler,
  };
}
