import { Transport } from "@react-fullstack/fullstack/shared";
import {
  APIEventsMapBase,
  ConnectionTypedClient,
  CreateAPIServerImplementation,
} from "@freeact/types";
import { CompiledServerModules, ModulesApi, ServerModules } from "@freeact/types";
import { apiTransport } from "./shared/api";

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