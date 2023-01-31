import { createModule } from "freeact/module";
import { createTerminal } from "./Terminal";
import { apiImp } from "./api";

export = createModule(import("../client"))
  .overrideWithServerComponents((comps) => ({
    Terminal: createTerminal(comps),
  }))
  .implementApi(apiImp)
  .done("Dev");
