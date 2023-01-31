import Favicon from "./Favicon";
import { implementComponents } from "freeact/client"
import { DomComponents } from "../../types";

export const components = implementComponents<DomComponents>(() => ({
  Favicon,
}));
