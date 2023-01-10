import { APIEventsMapBase, APIClientImplementation,ConnectionTypedClient  } from "@freeact/types";

export function implementClientApi<APIEventsMap extends APIEventsMapBase>(
    implementor: (connection: ConnectionTypedClient<APIEventsMap>) => any
): APIClientImplementation {
    return implementor as APIClientImplementation;
}
