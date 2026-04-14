#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * Post-compile ABI normalizer.
 *
 * Solidity 0.8.x has a known bug where library `public` functions that take
 * or return structs with enum fields emit the qualified enum name (e.g.
 * "IClearingTypes.ClearingOperationType") in the ABI `type` field instead of
 * the canonical "uint8".  ethers.js v6 rejects these as invalid fragments.
 *
 * This script walks all artifact JSON files and replaces any component whose
 * `internalType` starts with "enum " but whose `type` is not "uint8" with
 * the correct "uint8".
 *
 * Run after `hardhat compile`, before `hardhat typechain` and `tsc`.
 */

const fs = require("fs");
const path = require("path");

const ARTIFACTS_DIR = path.join(__dirname, "..", "artifacts");
const CHANGED = [];

function fixParams(params) {
  if (!Array.isArray(params)) return params;
  return params.map((p) => {
    const fixed = { ...p };
    if (fixed.components) {
      fixed.components = fixParams(fixed.components);
    }
    if (typeof fixed.internalType === "string" && fixed.internalType.startsWith("enum ") && fixed.type !== "uint8") {
      fixed.type = "uint8";
    }
    return fixed;
  });
}

function fixABI(abi) {
  if (!Array.isArray(abi)) return abi;
  return abi.map((fragment) => {
    const fixed = { ...fragment };
    if (fixed.inputs) fixed.inputs = fixParams(fixed.inputs);
    if (fixed.outputs) fixed.outputs = fixParams(fixed.outputs);
    return fixed;
  });
}

function processFile(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    return;
  }

  let artifact;
  try {
    artifact = JSON.parse(raw);
  } catch {
    return;
  }

  if (!Array.isArray(artifact.abi)) return;

  const fixed = fixABI(artifact.abi);
  const fixedStr = JSON.stringify(fixed);
  const origStr = JSON.stringify(artifact.abi);

  if (fixedStr !== origStr) {
    artifact.abi = fixed;
    fs.writeFileSync(filePath, JSON.stringify(artifact, null, 2));
    CHANGED.push(path.relative(ARTIFACTS_DIR, filePath));
  }
}

function walkDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "build-info") continue;
      walkDir(full);
    } else if (entry.isFile() && entry.name.endsWith(".json") && !entry.name.endsWith(".dbg.json")) {
      processFile(full);
    }
  }
}

if (!fs.existsSync(ARTIFACTS_DIR)) {
  console.error("[fix-enum-abi-types] artifacts/ directory not found — run hardhat compile first");
  process.exit(1);
}

walkDir(ARTIFACTS_DIR);

if (CHANGED.length > 0) {
  console.log(`[fix-enum-abi-types] Fixed enum types in ${CHANGED.length} artifact(s):`);
  CHANGED.forEach((f) => console.log(`  - ${f}`));
} else {
  console.log("[fix-enum-abi-types] No non-canonical enum types found.");
}
