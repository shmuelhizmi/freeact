import esbuild from "esbuild";
import path from "path";
import { injectGlobals } from "./globals";

export async function views() {
  await injectGlobals();
  return esbuild
    .build({
      entryPoints: [path.join(__dirname, "../views-core/main.tsx")],
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
  const cjs = esbuild.build({
    entryPoints: [path.join(__dirname, "../server/src/index.tsx")],
    outdir: "dist/server",
    bundle: true,
    sourcemap: true,
    minify: true,
    format: "cjs",
    platform: "node",
    external: ["fsevents", "esbuild", "vite", "@vitejs/*"],
    tsconfig: "./tsconfig.json",
    target: "node14",
  });
  const esm = esbuild.build({
    entryPoints: [path.join(__dirname, "../server/src/index.tsx")],
    bundle: true,
    minify: true,
    format: "esm",
    platform: "node",
    external: ["fsevents", "esbuild", "vite", "@vitejs/*"],
    tsconfig: "./tsconfig.json",
    target: "node14",
    outExtension: { ".js": ".mjs" },
    sourcemap: true,
    outfile: "dist/server/index.mjs",
  });
  return Promise.all([cjs, esm]);
}
