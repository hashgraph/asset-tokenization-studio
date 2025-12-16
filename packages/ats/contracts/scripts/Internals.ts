import * as fs from "fs";
import * as path from "path";

/**
 * CONFIG
 */
const LAYER_0_DIR = path.resolve("contracts/layer_0");
const OUTPUT_FILE = path.join(LAYER_0_DIR, "Internals_2.sol");

/**
 * Recursively walk a directory and return all .sol files
 */
function getSolFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(getSolFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".sol")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extract internal function declarations from Solidity source
 */
function extractInternalFunctions(source: string): string[] {
  /**
   * Matches:
   * function name(args) internal [view|pure|payable] [returns(...)] { ... }
   */
  const functionRegex = /function\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s+internal\b[^;{]*\{/gms;

  const matches = [...source.matchAll(functionRegex)];

  return matches.map((match) => {
    let declaration = match[0];

    // Remove function body
    declaration = declaration.replace(/\{[\s\S]*$/, "");

    // Ensure `virtual` is present
    if (!/\bvirtual\b/.test(declaration)) {
      declaration = declaration.replace(/\binternal\b/, "internal virtual");
    }

    return declaration.trim() + ";";
  });
}

/**
 * MAIN
 */
function main() {
  if (!fs.existsSync(LAYER_0_DIR)) {
    throw new Error(`Directory not found: ${LAYER_0_DIR}`);
  }

  const solFiles = getSolFiles(LAYER_0_DIR);
  const collectedFunctions = new Set<string>();

  for (const file of solFiles) {
    const content = fs.readFileSync(file, "utf8");
    const internals = extractInternalFunctions(content);

    internals.forEach((fn) => collectedFunctions.add(fn));
  }

  const output = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Internals_2
 * @notice Auto-generated internal function declarations
 * @dev DO NOT EDIT MANUALLY
 */

${[...collectedFunctions].sort().join("\n")}
`;

  fs.writeFileSync(OUTPUT_FILE, output, "utf8");

  console.log(`✔ Extracted ${collectedFunctions.size} internal functions into ${OUTPUT_FILE}`);
}

main();
