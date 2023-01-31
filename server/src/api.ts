import { Transport } from "@react-fullstack/fullstack/shared";
import {
  APIEventsMapBase,
  ConnectionTypedClient,
  CreateAPIServerImplementation,
} from "@freeact/types";
import { CompiledServerModules, ModulesApi, ServerModules } from "@freeact/types";
import { apiTransport } from "./shared/api";
import { createContext, useContext } from "react";

export function createApiServerInterface<APIEventsMap extends APIEventsMapBase, T>(
  implementor: (connection: ConnectionTypedClient<APIEventsMap>) => T
) {
  return ((socket: Transport<any>, apiId: string): T =>
    implementor(apiTransport(apiId, socket))) as CreateAPIServerImplementation<T>;
}


export function createModulesApi<Modules extends ServerModules>(
  transport: Transport<any>,
  compiledServerModules: CompiledServerModules
): ModulesApi<Modules> {
  return Object.entries(compiledServerModules).reduce(
    (prev, [namespace, module]) => {
      return {
        ...prev,
        [namespace]: module.api(
          transport,
          namespace
        ),
      };
    },
    {} as ModulesApi<Modules> 
  );
}


const APIContext = createContext<any>(null);

export const APIProvider = APIContext.Provider;

export function useAPI<API>(module: string) {
  const api = useContext(APIContext);
  if (!api) {
    throw new Error("can not use API in global serve - use createSessionHandler instead");
  }
  if (!api[module]) {
    throw new Error(`can not find API module ${module}, available modules are ${Object.keys(api).join(", ")}`);
  }
  return api[module] as API;
}