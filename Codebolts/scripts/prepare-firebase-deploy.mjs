#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const deployRoot = path.join(projectRoot, "deploy");
const sourceEntries = ["index.html", "steel", "units"];

function shouldCopy(sourcePath) {
  return !path.basename(sourcePath).startsWith(".");
}

async function copyEntry(entry) {
  const sourcePath = path.join(projectRoot, entry);
  const destinationPath = path.join(deployRoot, entry);

  await fs.access(sourcePath);
  await fs.cp(sourcePath, destinationPath, { recursive: true, filter: shouldCopy });
}

async function main() {
  await fs.rm(deployRoot, { recursive: true, force: true });
  await fs.mkdir(deployRoot, { recursive: true });

  for (const entry of sourceEntries) {
    await copyEntry(entry);
  }

  console.log(`Prepared ${deployRoot} with source files copied as-is (no obfuscation).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
