import { createCompiler } from "freeact";
import dom from ".";

export default createCompiler().addModule(dom).compile();
