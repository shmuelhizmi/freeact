#!/usr/bin/env tsx
import childProcess from "child_process";
import { esbuild } from "freeact";
import fs from "fs/promises";
import path from "path";
import esbuildReal from "esbuild";

const cwd = process.cwd();

const build = async () => {
  const packageJson = JSON.parse(
    await fs.readFile(path.join(cwd, "package.json"), "utf-8")
  );
  const { freeact } = packageJson;
  const server = path.join(cwd, freeact.server);
  const client = path.join(cwd, freeact.client);
  const react = freeact.react && path.join(cwd, freeact.react);
  await childProcess.execSync("tsc --emitDeclarationOnly --noEmit false --outDir ./dist/types --project tsconfig.json");
  await esbuild.module(client, {
    outdir: path.join(cwd, "dist", "client"),
    write: true,
  });
  const options: esbuildReal.BuildOptions = {
    bundle: true,
    write: true,
    platform: "node",
    target: "es2019",
  };
  const tasks: Promise<any>[] = [];
  tasks.push(
    esbuildReal.build({
      entryPoints: [server],
      ...options,
      format: "cjs",
      outfile: path.join(cwd, "dist", "server", "index.js"),
    })
  );
  tasks.push(
    esbuildReal.build({
      entryPoints: [server],
      ...options,
      format: "esm",
      outfile: path.join(cwd, "dist", "server", "index.mjs"),
    })
  );
  if (react) {
    tasks.push(
      esbuildReal.build({
        entryPoints: [react],
        ...options,
        format: "cjs",
        outfile: path.join(cwd, "dist", "server", "react.js"),
      })
    );
    tasks.push(
      esbuildReal.build({
        entryPoints: [react],
        ...options,
        format: "esm",
        outfile: path.join(cwd, "dist", "server", "react.mjs"),
      })
    );
  }
  await Promise.all(tasks);
};
