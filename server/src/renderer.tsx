import {
  Server,
  ServerInstanceRenderHandler,
} from "@react-fullstack/fullstack/server";
import { Render } from "@react-fullstack/render";
import {
  ServerModules,
  ModuleApi,
  ModulesApi,
  CompilerAppProvider,
} from "./exports/types";
import { APIProvider } from "./api";
import React from "react";
import { ServerTransport } from "./types";

export function renderApp<Modules extends ServerModules, T>(
  render: (
    resolve: (value: T | undefined) => void,
    reject: (error: any) => void
  ) => JSX.Element,
  ssrHandler: ServerInstanceRenderHandler,
  transport: ServerTransport,
  CompilerAppProvider: CompilerAppProvider,
  apis?: ModulesApi<Modules>
) {
  let resolve: (value: T | undefined) => void;
  let reject: (error: any) => void;
  const promise = new Promise<T>((res, rej) => {
    let resolvedOrRejected = false;
    const APIP = apis ? APIProvider : (props: any) => props.children;
    const { stop } = Render(
      <CompilerAppProvider>
        <APIP value={apis}>
          <Server
            singleInstance
            instanceRenderHandler={ssrHandler}
            transport={transport}
          >
            {() =>
              render(
                (value) => {
                  resolve(value);
                },
                (e) => {
                  reject(e);
                }
              )
            }
          </Server>
        </APIP>
      </CompilerAppProvider>
    );
    resolve = (value) => {
      if (resolvedOrRejected) return;
      res(value as T);
      stop();
      resolvedOrRejected = true;
    };
    reject = (error) => {
      if (resolvedOrRejected) return;
      rej(error);
      stop();
      resolvedOrRejected = true;
    };
  });
  return {
    promise,
    stop: () => {
      resolve(undefined);
    },
  };
}
