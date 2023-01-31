import { implementComponents } from "freeact/client";
import { ClientComps } from "../types";
import Terminal from "./Terminal";
import { apiImp } from "./api";

export const components = implementComponents<ClientComps>(() => ({
  Terminal,
}));


export const api = apiImp;

export const filename = __filename;