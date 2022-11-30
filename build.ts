import { buildViteClient } from "./server/vite";
import esbuild from "esbuild";
import { spawn } from "child_process";
buildViteClient();

esbuild
  .build({
    entryPoints: ["./server/index.tsx"],
    outdir: "dist/server",
    bundle: true,
    sourcemap: true,
    minify: false,
    format: "cjs",
    platform: "node",
    external: ["fsevents", "node-pty", "esbuild", "eiows", "vite", "@vitejs/*"],
    tsconfig: "./tsconfig.server.json",
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
