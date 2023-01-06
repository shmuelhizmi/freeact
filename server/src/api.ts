import { Transport, randomId } from "@react-fullstack/fullstack/shared";
import {
  APIEventsMapBase,
  createAPIServerImplementation,
  API_PREFIX,
  API_REJECT,
} from "@freeact/types";
import { CompiledServerModules, ModulesApi, ServerModules } from "@freeact/types";
import { socketToGlobalTransport } from "./transport";
import { Server as SocketServer } from "socket.io";

export function createApiServerInterface<APIEventsMap extends APIEventsMapBase, T>(
  implementor: (connection: {
    on: <T extends keyof APIEventsMap>(
      event: T,
      handler: APIEventsMap[T]
    ) => void;
    emit: <T extends keyof APIEventsMap>(
      event: T,
      ...args: Parameters<APIEventsMap[T]>
    ) => Promise<ReturnType<APIEventsMap[T]>>;
  }) => T
) {
  return ((socket: Transport<any>, apiId: string): T =>
    implementor({
      on: on.bind(null, socket, apiId) as any,
      emit: emit.bind(null, socket, apiId) as any,
    })) as createAPIServerImplementation<T>;
}

export function emit<
  APIEventsMap extends APIEventsMapBase,
  T extends keyof APIEventsMap
>(
  socket: Transport<any>,
  apiId: string,
  event: T,
  ...args: Parameters<APIEventsMap[T]>
): Promise<ReturnType<APIEventsMap[T]>> {
  const uid = randomId();
  socket.emit(`${API_PREFIX}_${apiId}`, [event, uid, args]);
  return new Promise((resolve, reject) => {
    socket.on(
      `${API_PREFIX}_${apiId}`,
      ([eventIn, uidIn, args]: [T, string, any]) => {
        if (event !== eventIn || uid !== uidIn) return;
        resolve(args);
      }
    );
    socket.on(`${API_REJECT}_${apiId}`, ([eventIn, uidIn, error]) => {
      if (event !== eventIn || uid !== uidIn) return;
      reject(error);
    });
  });
}

export function on<
  APIEventsMap extends APIEventsMapBase,
  T extends keyof APIEventsMap
>(
  socket: Transport<any>,
  apiId: string,
  event: T,
  listener: (
    ...args: Parameters<APIEventsMap[T]>
  ) => ReturnType<APIEventsMap[T]> | Promise<ReturnType<APIEventsMap[T]>>
): void {
  socket.on(API_PREFIX, ([eventIn, uid, args]: [T, string, any]) => {
    if (event !== eventIn) return;
    try {
      const out = listener(...args);
      if (out instanceof Promise) {
        out
          .then((result) => {
            socket.emit(`${API_PREFIX}_${apiId}`, [event, uid, result]);
          })
          .catch((error) => {
            socket.emit(`${API_REJECT}_${apiId}`, [event, uid, error]);
          });
        return;
      }
      socket.emit(`${API_PREFIX}_${apiId}`, [event, uid, out]);
    } catch (error) {
      socket.emit(`${API_REJECT}_${apiId}`, [event, uid, error]);
    }
  });
}



export function createModulesApi<Modules extends ServerModules>(
  transport: SocketServer,
  compiledServerModules: CompiledServerModules
): ModulesApi<Modules> {
  return Object.entries(compiledServerModules).reduce(
    (prev, [namespace, module]) => {
      return {
        ...prev,
        [namespace]: module.api(
          socketToGlobalTransport(transport),
          namespace
        ),
      };
    },
    {} as ModulesApi<Modules> 
  );
}