import esbuild from "esbuild";
import { globalModules } from "../plugins/globalModules";
import fs from "fs/promises";

export async function mainViews(entryPoint: string, outFile: string) {
  const { filename, clean } = globalModules().inject(entryPoint);
  return esbuild.build({
    entryPoints: [entryPoint],
    inject: [filename],
    bundle: true,
    sourcemap: true,
    minify: true,
    format: "esm",
    platform: "browser",
    outfile: outFile,
    target: "es2019",
    external: ["crypto"]
  }).then(() => {
    clean();
  });
}

export async function runtimeBundle(entryPoint: string) {
    let betterEntryPoint = entryPoint;
    if (entryPoint.endsWith('.js')) {
      if (await exists(entryPoint.replace('.js', '.mjs'))) {
        betterEntryPoint = entryPoint.replace('.js', '.mjs');
      } 
    }
    const outPut = await esbuild.build({
        entryPoints: [betterEntryPoint],
        bundle: true,
        write: false,
        format: "esm",
        platform: "browser",
        plugins: [globalModules().pluginConsume],
        target: "es2019",
      });
      if (outPut.errors.length) {
        throw new Error(outPut.errors[0].text);
      }
      const code = outPut.outputFiles?.[0].text;
      return code;
}

function exists(path: string) {
  return fs.stat(path).then(() => true).catch(() => false);
}