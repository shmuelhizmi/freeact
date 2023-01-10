import { createModule } from "freeact/module";
import { createTypography } from "../server/components/Typography";
import { ClientComponents } from "../types";

export default createModule<ClientComponents>(import("../client"))
  .overrideWithServerComponents((comps) => ({
    Typography: createTypography(comps),
  }))
  .done("JOY");
