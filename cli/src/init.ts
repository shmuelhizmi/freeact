const cliJSON = require("../package.json");
import fs from "fs/promises";
import path from "path";
import freeactPackageJSON from "freeact/package.json";

const freeactVersion = cliJSON.dependencies.freeact;
const typescriptVersion = cliJSON.dependencies.typescript;
const nodeMainVersion = process.versions.node.split(".")[0];

let cwd = process.cwd();

const tsconfig = {
  compilerOptions: {
    useDefineForClassFields: true,
    lib: ["DOM", "DOM.Iterable", "ESNext"],
    allowJs: false,
    skipLibCheck: true,
    esModuleInterop: true,
    declaration: true,
    allowSyntheticDefaultImports: true,
    strict: true,
    forceConsistentCasingInFileNames: true,
    module: "ESNext",
    moduleResolution: "Node",
    resolveJsonModule: true,
    isolatedModules: true,
    declarationOnly: true,
    noImplicitAny: false,
    jsx: "react-jsx",
    target: "ESNext",
  },
  include: ["server/**/*", "types/**/*", "client/**/*"],
};

let packageName = process.argv[2];
let shouldCreateDirectory = true;

if (!packageName) {
  // use current directory name
  packageName = path.basename(cwd);
  shouldCreateDirectory = false;
}


const packageJson = {
  name: packageName,
  version: "0.0.1",
  exports: {
    ".": {
      import: "./dist/server/index.mjs",
      require: "./dist/server/index.js",
      types: "./dist/types/server/index.d.ts",
    },
    react: {
      import: "./dist/server/react.mjs",
      require: "./dist/server/react.js",
      types: "./dist/types/server/react.d.ts",
    },
  },
  dependencies: {
    freeact: freeactVersion,
  },
  devDependencies: {
    typescript: typescriptVersion,
    "@types/node": `^${nodeMainVersion}`,
    "@freeact/cli": cliJSON.version,
    "react": freeactPackageJSON.devDependencies.react,
    "@types/react": freeactPackageJSON.devDependencies["@types/react"],
  },
  scripts: {
    build: "freeact build",
    start: "freeact start",
  },
  freeact: {
    server: "./server/index.tsx",
    react: "./server/react.tsx",
    client: "./client/index.tsx",
  },
};

const camelCase = (str: string) =>
  str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

const camelPackageName = camelCase(packageName);

// templateFiles = "../template/**.template";

const stringsToReplace = {
  ["$packageName$"]: camelPackageName,
};

export function readTemplateFile(path: string) {
  return fs.readFile(path, "utf8").then((data) => {
    for (const [key, value] of Object.entries(stringsToReplace)) {
      data = data.replace(key, value);
    }
    return data;
  });
}

export async function readTemplateFiles() {
  const templateFiles = {} as Record<string, string>;
  const filesPaths = await readDirectoryRecursive(
    path.join(__dirname, "../template")
  );
  for (const filePath of filesPaths) {
    const fileContents = await readTemplateFile(filePath);
    templateFiles[filePath] = fileContents;
  }
  return templateFiles;
}

export async function readDirectoryRecursive(dir: string) {
  const files = [] as string[];
  const dirFiles = await fs.readdir(dir);
  for (const file of dirFiles) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      const subFiles = await readDirectoryRecursive(filePath);
      files.push(...subFiles.map((subFile) => path.join(file, subFile)));
    } else {
      files.push(file);
    }
  }
  return files;
}

export async function writeFiles() {
  if (shouldCreateDirectory) {
    await fs.mkdir(packageName);
    cwd = path.join(cwd, packageName);
  }
  if (
    await fs
      .access(path.join(cwd, "tsconfig.json"))
      .then(() => false)
      .catch(() => true)
  ) {
    await fs.writeFile(
      path.join(cwd, "tsconfig.json"),
      JSON.stringify(tsconfig, null, 2)
    );
  }
  // if src or server dir exists, exit
  const dirs = ["src", "server", "client", "types", "package.json"];
  for (const dir of dirs) {
    if (
      await fs
        .access(path.join(cwd, dir))
        .then(() => true)
        .catch(() => false)
    ) {
      console.error(
        `Directory ${dir} already exists. The init command is for new projects only.`
      );
      process.exit(1);
    }
  }
  // read template files
  const templateFiles = await readTemplateFiles();
  // write template files
  for (const [filePath, fileContents] of Object.entries(templateFiles)) {
    await fs.mkdir(path.join(cwd, path.dirname(filePath)), { recursive: true });
    await fs.writeFile(
      path.join(cwd, filePath.replace(".template", "")),
      fileContents
    );
  }
  // write package.json
  await fs.writeFile(
    path.join(cwd, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );
}
