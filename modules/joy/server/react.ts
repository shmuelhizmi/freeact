import { createCompiler } from "freeact/compiler";
import JOY from "./index";
import DOM from "@freeact/dom";

export = createCompiler().addModule(JOY).addModule(DOM).compile();