import * as esbuild from "esbuild";
import { clientDependencies } from "../package.json";

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

export const externals = importAsGlobals(
  clientDependencies.reduce((acc, dep) => {
    acc[dep] = `globals["${dep}"]`;
    return acc;
  }, {})
);
export async function module(path: string, options: esbuild.BuildOptions = {}) {
  const outPut = await esbuild.build({
    entryPoints: [path],
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    plugins: [externals],
    target: "es2019",
    ...options,
  });
  if (outPut.errors.length) {
    throw new Error(outPut.errors[0].text);
  }
  const code = outPut.outputFiles?.[0].text;
  return code;
}
