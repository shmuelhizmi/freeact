import { createServerModule } from "freeact";
import { api } from "./api";
import { createFavicon } from "./components/Favicon";
import { Favicon as FaviconSsr } from "./components/Favicon.ssr";

export default createServerModule(
  import("./client"),
  require.resolve("./client")
)
  .implementApi(api)
  .overrideWithSsrComponents(() => ({
    Favicon: FaviconSsr,
  }))
  .overrideWithServerComponents((comps) => ({
    Favicon: createFavicon(comps),
  }))
  .done("DOM");
