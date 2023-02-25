import { createCompiler } from "freeact/compiler";
import Joy from "@freeact/joy";
import Dom from "@freeact/dom";

export const Freeact = createCompiler()
  .addModule(Joy)
  .addModule(Dom)
  .compile();
