import { APIEventsMapBase, APIClientImplementation,ConnectionTypedClient  } from "../types/api";

export function implementApi<APIEventsMap extends APIEventsMapBase>(
    implementor: (connection: ConnectionTypedClient<APIEventsMap>) => any
): APIClientImplementation {
    return implementor as APIClientImplementation;
}
