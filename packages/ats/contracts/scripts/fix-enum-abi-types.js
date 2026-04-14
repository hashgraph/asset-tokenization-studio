// @ts-check
"use strict";

/**
 * Post-compile ABI normalizer.
 *
 * Solidity library public functions emit the qualified Solidity enum type name
 * (e.g. "IClearingTypes.ClearingOperationType") in the ABI "type" field instead
 * of the canonical ABI type "uint8".  ethers.js v6 strictly validates ABI types
 * and rejects these fragments as invalid, breaking deployments.
 *
 * This script walks the artifacts/ directory and rewrites every artifact whose
 * ABI contains such non-canonical enum types, replacing them with "uint8".
 * It then exits so that "npx hardhat typechain" can regenerate types from the
 * corrected artifacts.
 */

const fs = require("fs");
const path = require("path");

const ARTIFACTS_DIR = path.resolve(__dirname, "../artifacts");

/**
 * Recursively fix param descriptors: wherever internalType starts with "enum "
 * but type is not "uint8", set type = "uint8".
 * @param {any[]} params
 * @returns {any[]}
 */
function fixParams(params) {
  if (!Array.isArray(params)) return params;
  return params.map((p) => {
    const fixed = { ...p };
    if (Array.isArray(fixed.components)) {
      fixed.components = fixParams(fixed.components);
    }
    if (typeof fixed.internalType === "string" && fixed.internalType.startsWith("enum ") && fixed.type !== "uint8") {
      fixed.type = "uint8";
    }
    return fixed;
  });
}

/**
 * Fix all fragments in an ABI array.
 * @param {any[]} abi
 * @returns {{ abi: any[]; changed: boolean }}
 */
function fixAbi(abi) {
  if (!Array.isArray(abi)) return { abi, changed: false };
  let changed = false;
  const fixed = abi.map((fragment) => {
    const f = { ...fragment };
    if (Array.isArray(f.inputs)) {
      const newInputs = fixParams(f.inputs);
      if (JSON.stringify(newInputs) !== JSON.stringify(f.inputs)) changed = true;
      f.inputs = newInputs;
    }
    if (Array.isArray(f.outputs)) {
      const newOutputs = fixParams(f.outputs);
      if (JSON.stringify(newOutputs) !== JSON.stringify(f.outputs)) changed = true;
      f.outputs = newOutputs;
    }
    return f;
  });
  return { abi: fixed, changed };
}

/**
 * Recursively walk a directory and collect all .json file paths,
 * excluding build-info/ subdirectories and *.dbg.json files.
 * @param {string} dir
 * @returns {string[]}
 */
function collectArtifacts(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "build-info") continue;
      results.push(...collectArtifacts(full));
    } else if (entry.isFile() && entry.name.endsWith(".json") && !entry.name.endsWith(".dbg.json")) {
      results.push(full);
    }
  }
  return results;
}

let patchedCount = 0;

for (const artifactPath of collectArtifacts(ARTIFACTS_DIR)) {
  let artifact;
  try {
    artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  } catch {
    continue;
  }
  if (!Array.isArray(artifact.abi)) continue;

  const { abi, changed } = fixAbi(artifact.abi);
  if (!changed) continue;

  artifact.abi = abi;
  fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2) + "\n", "utf8");
  console.log(`[fix-enum-abi-types] Patched: ${path.relative(ARTIFACTS_DIR, artifactPath)}`);
  patchedCount++;
}

console.log(`[fix-enum-abi-types] Done. ${patchedCount} artifact(s) patched.`);
