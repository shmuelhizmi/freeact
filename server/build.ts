import { mainViews } from "@freeact/compiler";
import path from "path";

mainViews(
  path.join(__dirname, "./views-core/main.tsx"),
  path.join(__dirname, "./dist/views/freeact.mjs")
);
