import esbuild from "esbuild";
import { replaceImport, withoutModules } from "../plugins/withoutModules";
import { replaceDirNameWithImportMetaUrl } from "../plugins/esm";

/**
 * this will bundle the library without the modules
 * and will generate both cjs and mjs files
 */
export async function bundleLib(
  entryPoint: string,
  outFile: string,
  clientPath?: [string, string]
) {
  const options: esbuild.BuildOptions = {
    platform: "neutral",
    target: "es2020",
    bundle: true,
    plugins: [
      withoutModules,
      ...(clientPath ? [replaceImport(...clientPath)] : []),
    ],
    entryPoints: [entryPoint],
  };
  await esbuild.build(
    replaceDirNameWithImportMetaUrl({
      ...options,
      format: "cjs",
      outfile: outFile,
    })
  );
  await esbuild.build({
    ...options,
    format: "esm",
    outfile: outFile.replace(".js", ".mjs"),
  });
}
