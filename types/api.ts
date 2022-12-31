export const API_PREFIX: number = 0xfade;
export const API_REJECT: number = 0xfade + 0xdead;

export type APIEventsMapBase = Record<string | number, (...args: any) => any>;

export type ConnectionUnTyped = {
    readonly on: (event: string | number, handler: (...args: any) => void) => void;
    readonly emit: (event: string | number, ...args: any) => Promise<any>;
}

export type ConnectionTypedClient<APIEventsMap extends APIEventsMapBase> = {
    on: <T extends keyof APIEventsMap>(event: T, handler: AllowSyncFunction<APIEventsMap[T]>) => void;
    emit: <T extends keyof APIEventsMap>(event: T, ...args: Parameters<APIEventsMap[T]>) => Promise<ReturnType<APIEventsMap[T]>>;
}

export type AllowSyncFunction<F extends (...args: any) => any> = F extends (...args: infer Args) => infer Return ? (...args: Args) => AllowSync<Return> : never;
export type AllowSync<T> = T extends Promise<infer U> ? (U | Promise<U>) : (T | Promise<T>);

export type APIClientImplementation = (connection: ConnectionUnTyped) => any;
export type APIServerImplementation <Interface>= (connection: ConnectionUnTyped, apiId: string) => Interface;