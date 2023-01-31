import {
  APIEventsMapBase,
  API_PREFIX,
  API_REJECT,
  ConnectionTypedClient,
} from "@freeact/types";
import { randomId, Transport } from "@react-fullstack/fullstack/shared";

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
  socket.on(
    `${API_PREFIX}_${apiId}`,
    ([eventIn, uid, args]: [T, string, any]) => {
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
    }
  );
}

export function apiTransport<APIEventsMap extends APIEventsMapBase>(
  apiName: string,
  transport: Transport<any>
) {
  return {
    on: on.bind(null, transport, apiName) as any,
    emit: emit.bind(null, transport, apiName) as any,
  } as ConnectionTypedClient<APIEventsMap>;
}
