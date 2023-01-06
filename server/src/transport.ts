import { Transport } from "@react-fullstack/fullstack/shared";
import { Server } from "socket.io";

export function socketToGlobalTransport(transport: Server): Transport<any> {
    return transport.sockets as Transport<any>;
  }