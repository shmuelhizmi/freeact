import { Favicon as FaviconSsr } from "./Favicon.ssr";
import { createFavicon } from "./Favicon";
import { implementClientComponents } from "../../../views/components";
import { DomComponents } from "../../types";

export const components = implementClientComponents<DomComponents>(() => ({
  Favicon,
}));

