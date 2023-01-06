import { createCompiler } from "../../server";
import dom from ".";

export default createCompiler().addModule(dom).compile();
