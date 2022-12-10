import esbuild from "esbuild";

esbuild
  .build({
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
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

esbuild
  .build({
    entryPoints: ["./views/main.tsx"],
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
