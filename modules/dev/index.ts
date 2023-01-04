import { createServerModule } from "../../server/module";
import { createTerminal } from "./server/Terminal";

export default createServerModule(
  import("./client"),
  require.resolve("./client")
)
  .overrideWithServerComponents((comps) => ({
    Terminal: createTerminal(comps),
  }))
  .done("Dev");
