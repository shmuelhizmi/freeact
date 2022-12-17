import { clientDependencies } from "../package.json";
import fs from "fs/promises";
import path from "path";

function importAsGlobals(mapping: Record<string, string>) {
  // https://stackoverflow.com/a/3561711/153718
  const escRe = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const filter = new RegExp(
    Object.keys(mapping)
      .map((mod) => `^${escRe(mod)}$`)
      .join("|")
  );

  return {
    name: "global-imports",
    setup(build) {
      build.onResolve({ filter }, (args) => {
        if (!mapping[args.path]) {
          throw new Error("Unknown global: " + args.path);
        }
        return {
          path: args.path,
          namespace: "external-global",
        };
      });

      build.onLoad(
        {
          filter,
          namespace: "external-global",
        },
        async (args) => {
          const global = mapping[args.path];
          return {
            contents: `module.exports = ${global};`,
            loader: "js",
          };
        }
      );
    },
  };
}

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

export const externals = importAsGlobals(
  clientDependencies.reduce((acc, dep) => {
    acc[dep] = `globals["${dep}"]`;
    return acc;
  }, {})
);
