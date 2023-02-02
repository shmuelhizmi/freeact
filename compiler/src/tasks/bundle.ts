import esbuild from "esbuild";
import { replaceImport, withoutModules } from "../plugins/withoutModules";
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
    target: "esnext",
    bundle: true,
    treeShaking: true,
    plugins: [
      withoutModules,
      ...(clientPath ? [replaceImport(...clientPath)] : []),
    ],
    entryPoints: [entryPoint],
  };
  await esbuild.build(
    {
      ...options,
      format: "cjs",
      outfile: outFile,
    }
  );
}
