import fs from "fs/promises";
import path from "path";
import { clientDependencies } from "../server/package.json";


export async function injectGlobals() {
  const script = `
  let globals = {} as any;
    window.globals = globals;
  const lazy = Promise.all([${clientDependencies.map(
    (dep) => `import("${dep}").then((m) => (globals["${dep}"] = m))`
  )}]);
    export default lazy;
  `;
  const genDir = path.join(__dirname, "..", "gen");
  await fs.mkdir(genDir, { recursive: true });
  await fs.writeFile(path.join(genDir, "globals.ts"), script);
}
