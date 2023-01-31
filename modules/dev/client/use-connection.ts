import { useMemo } from "react";
import { createChannel } from "./api";



export function useConnection(uid: string) {
    const connection = useMemo(() => createChannel(uid), [uid]);
    return connection;
}