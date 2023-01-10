/*
esbuild plugin for defining modules as global
this will allow adding node modules to the window object
or consuming them
*/
import esbuild from "esbuild";
import { writeFileSync, rmSync } from "fs";
import path from "path";

export const GLOBAL_MODULES_PATH = "__modules__";

export const GLOBAL_MODULES = [
  "react",
  "react/jsx-runtime",
  "react-dom",
  "@react-fullstack/fullstack",
  "@react-fullstack/fullstack-socket-client",
  "freeact/client"
];

export function globalModules() {
  const pluginConsume: esbuild.Plugin = {
    name: "global-modules",
    setup(build) {
      build.onResolve({ filter: /./ }, (args) => {
        if (GLOBAL_MODULES.includes(args.path)) {
          return {
            path: args.path,
            namespace: "global-modules",
          };
        }
        return null;
      });
      build.onLoad({ namespace: "global-modules", filter: /.*/ }, (args) => {
        return {
          contents: `module.exports = window.${GLOBAL_MODULES_PATH}["${args.path}"]`,
          loader: "js",
        };
      });
    },
  };
  const inject = (entryPoint: string) => {
    const content = `${GLOBAL_MODULES.map((module, index) => {
      return `import * as _${index} from "${module}";\n`;
    }).join("")}
        window.${GLOBAL_MODULES_PATH} = {
            ${GLOBAL_MODULES.map((module, index) => {
              return `"${module}": _${index},\n`;
            }).join("")}
        }`;
    const filename = path.join(path.dirname(entryPoint), `./__module__${Math.random()}.js`);
    writeFileSync(filename, content);
    return {
        filename: filename,
        clean() {
            rmSync(filename);
        }
    };
  };

  return {
    pluginConsume,
    inject,
  };
}
