import { createModule } from "freeact/module";
import { api } from "./api";
import { createFavicon } from "./components/Favicon";
import { Favicon as FaviconSsr } from "./components/Favicon.ssr";

export = createModule(import("../client"))
  .implementApi(api)
  .overrideWithSsrComponents(() => ({
    Favicon: FaviconSsr,
  }))
  .overrideWithServerComponents((comps) => ({
    Favicon: createFavicon(comps),
  }))
  .done("DOM");

