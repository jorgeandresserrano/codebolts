#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";
import JavaScriptObfuscator from "javascript-obfuscator";
import CleanCSS from "clean-css";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const deployRoot = path.join(projectRoot, "deploy");

const excludedRootDirectories = new Set([
  ".firebase",
  ".git",
  "deploy",
  "scripts"
]);

const excludedDirectoriesAnywhere = new Set(["node_modules"]);

const excludedRootFiles = new Set([
  ".firebaserc",
  ".gitignore",
  "firebase.json",
  "package-lock.json",
  "package.json"
]);

const LARGE_JS_FILE_THRESHOLD_BYTES = 500_000;

const standardJsObfuscationOptions = {
  compact: true,
  identifierNamesGenerator: "hexadecimal",
  renameGlobals: false,
  simplify: true,
  stringArray: true,
  stringArrayEncoding: ["base64"],
  stringArrayShuffle: true,
  stringArrayThreshold: 1,
  target: "browser",
  transformObjectKeys: true
};

const largeJsObfuscationOptions = {
  compact: true,
  identifierNamesGenerator: "hexadecimal",
  renameGlobals: false,
  simplify: true,
  stringArray: true,
  stringArrayEncoding: ["base64"],
  stringArrayShuffle: true,
  stringArrayThreshold: 0.35,
  target: "browser"
};

function shouldCopy(sourcePath) {
  const relativePath = path.relative(projectRoot, sourcePath);
  if (relativePath === "") {
    return true;
  }

  const segments = relativePath.split(path.sep);
  const [rootSegment] = segments;

  if (excludedRootDirectories.has(rootSegment)) {
    return false;
  }

  for (const segment of segments.slice(1)) {
    if (excludedDirectoriesAnywhere.has(segment)) {
      return false;
    }
  }

  if (segments.length === 1 && excludedRootFiles.has(segments[0])) {
    return false;
  }

  if (path.basename(sourcePath).startsWith(".")) {
    return false;
  }

  return true;
}

function shouldCopyRootEntry(entryName) {
  if (excludedRootDirectories.has(entryName) || excludedDirectoriesAnywhere.has(entryName)) {
    return false;
  }

  if (excludedRootFiles.has(entryName)) {
    return false;
  }

  if (entryName.startsWith(".")) {
    return false;
  }

  return true;
}

async function copyProjectToDeploy() {
  const entries = await fs.readdir(projectRoot, { withFileTypes: true });

  await fs.mkdir(deployRoot, { recursive: true });

  for (const entry of entries) {
    if (!shouldCopyRootEntry(entry.name)) {
      continue;
    }

    const sourcePath = path.join(projectRoot, entry.name);
    const destinationPath = path.join(deployRoot, entry.name);

    await fs.cp(sourcePath, destinationPath, { recursive: true, filter: shouldCopy });
  }
}

async function collectFilesByExtension(directory, extensions, collector = []) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await collectFilesByExtension(fullPath, extensions, collector);
      continue;
    }

    if (extensions.has(path.extname(entry.name))) {
      collector.push(fullPath);
    }
  }

  return collector;
}

async function obfuscateJavaScriptFiles(files) {
  let largeFileCount = 0;

  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    const isLargeFile = Buffer.byteLength(source, "utf8") > LARGE_JS_FILE_THRESHOLD_BYTES;
    const obfuscationOptions = isLargeFile
      ? largeJsObfuscationOptions
      : standardJsObfuscationOptions;

    if (isLargeFile) {
      largeFileCount += 1;
    }

    const result = JavaScriptObfuscator.obfuscate(source, obfuscationOptions);
    await fs.writeFile(file, result.getObfuscatedCode(), "utf8");
  }

  return { total: files.length, large: largeFileCount };
}

async function minifyCssFiles(files) {
  const minifier = new CleanCSS({ level: 2 });

  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    const output = minifier.minify(source);

    if (output.errors.length > 0) {
      throw new Error(`CSS minification failed for ${file}: ${output.errors.join("; ")}`);
    }

    await fs.writeFile(file, output.styles, "utf8");
  }
}

async function main() {
  await fs.rm(deployRoot, { recursive: true, force: true });
  await copyProjectToDeploy();

  const jsFiles = await collectFilesByExtension(deployRoot, new Set([".js"]));
  const cssFiles = await collectFilesByExtension(deployRoot, new Set([".css"]));

  const jsStats = await obfuscateJavaScriptFiles(jsFiles);
  await minifyCssFiles(cssFiles);

  console.log(
    `Prepared ${deployRoot} with ${jsStats.total} obfuscated JS files (${jsStats.large} large-file profile) and ${cssFiles.length} minified CSS files.`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
