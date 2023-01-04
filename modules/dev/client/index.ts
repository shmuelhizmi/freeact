import { implementClientComponents } from "../../../views/components";
import { ClientComps } from "../types";
import Terminal from "./Terminal";

export const components = implementClientComponents<ClientComps>(() => ({
  Terminal,
}));
