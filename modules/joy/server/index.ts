import { createModule } from "freeact/module";
import { createTypography } from "../server/components/Typography";
import { ClientComponents } from "../types";

export = createModule<ClientComponents>(import("../client"))
  .overrideWithServerComponents((comps) => ({
    Typography: createTypography(comps),
  }))
  .done("JOY");
