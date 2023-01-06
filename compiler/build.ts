import esbuild from "esbuild";
import path from "path";
import { externals, injectGlobals } from "./globals";


export async function views() {
  await injectGlobals();
  return esbuild
    .build({
      entryPoints: [path.join(__dirname, "../views/main.tsx")],
      // outdir: "",
      bundle: true,
      sourcemap: true,
      minify: true,
      format: "esm",
      platform: "browser",
      outfile: "dist/client/freeact.mjs",
      target: "es2019",
      external: ["crypto"],
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

export function server() {
  return esbuild.build({
    entryPoints: ["./server/index.tsx"],
    outdir: "dist/server",
    bundle: true,
    sourcemap: true,
    minify: true,
    format: "cjs",
    platform: "node",
    external: ["fsevents", "node-pty", "esbuild", "eiows", "vite", "@vitejs/*"],
    tsconfig: "./tsconfig.server.json",
    target: "node14",
  });
}

export async function module(path: string) {
  const outPut = await esbuild.build({
    entryPoints: [path],
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    plugins: [externals],
    target: "es2019",
  });
  if (outPut.errors.length) {
    throw new Error(outPut.errors[0].text);
  }
  const code = outPut.outputFiles?.[0].text;
  return code;
}
