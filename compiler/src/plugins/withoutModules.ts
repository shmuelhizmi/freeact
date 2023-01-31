import esbuild from "esbuild";
import path from "path";

export const withoutModules: esbuild.Plugin = {
  name: "do not bundle node_modules",
  setup(build) {
    let filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/; // Must not start with "/" or "./" or "../"
    build.onResolve({ filter }, (args) => ({
      path: args.path,
      external: true,
    }));
  },
};


export const replaceImport = (from: string, to: string): esbuild.Plugin => {
  return {
    name: "replace import",
    setup(build) {
    build.onResolve({ filter: /./ }, (args) => {
      const file = path.join(args.resolveDir, args.path);
        if (doesResolve(file, from)) {
          return {
            path: to,
            external: true,
          };
        }
        return undefined;
      });
    },
  };
}

/**
 * tests if importing the target could resolve to the file
 * @param file 
 * @param from 
 */
function doesResolve(file: string, target: string) {
  const fileWithoutExt = file.replace(/\.[^/.]+$/, "");
  const targetWithoutExt = target.replace(/\.[^/.]+$/, "");
  const fileWithoutIndex = fileWithoutExt.endsWith("/index") ? fileWithoutExt.slice(0, -6) : fileWithoutExt;
  const targetWithoutIndex = targetWithoutExt.endsWith("/index") ? targetWithoutExt.slice(0, -6) : targetWithoutExt;
  return fileWithoutIndex === targetWithoutIndex;
}