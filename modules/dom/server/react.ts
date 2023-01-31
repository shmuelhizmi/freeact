import { createCompiler } from "freeact/compiler";
import dom from ".";

export = createCompiler().addModule(dom).compile();
