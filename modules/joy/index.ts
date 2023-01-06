import { createServerModule } from "../../server/module";
import { createTypography } from "./server/components/Typography";
import { ClientComponents, ServerComponents } from "./types";

export default createServerModule<ClientComponents>(
  import("./client"),
  require.resolve("./client")
)
  .overrideWithServerComponents((comps) => ({
    Typography: createTypography(comps),
  }))
  .done("JOY");
