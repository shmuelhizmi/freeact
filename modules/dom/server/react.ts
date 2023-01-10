import { createCompiler } from "freeact/compiler";
import dom from ".";

export default createCompiler().addModule(dom).compile();
