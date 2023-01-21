import childProcess from "child_process";
import fs from "fs/promises";
import path from "path";
import { bundleLib } from "@freeact/compiler";

const cwd = process.cwd();

const build = async () => {
  const packageJson = JSON.parse(
    await fs.readFile(path.join(cwd, "package.json"), "utf-8")
  );
  const { freeact } = packageJson;
  const server = path.join(cwd, freeact.server);
  const client = path.join(cwd, freeact.client);
  const react = freeact.react && path.join(cwd, freeact.react);
  console.log(cwd);
  await childProcess.execSync(
    "tsc --emitDeclarationOnly --outDir ./dist/types --project ./tsconfig.json",
    {
      stdio: "inherit",
      cwd,
    }
  );

  await bundleLib(client, path.join(cwd, "dist/client/index.js"));
  await bundleLib(server, path.join(cwd, "dist", "server/index.js"), [
    client,
    "../client/index",
  ]);
  if (react) {
    await bundleLib(react, path.join(cwd, "dist", "server/react.js"), [
      client,
      "../client/index",
    ]);
  }
};

build();
