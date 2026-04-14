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
 * This script:
 *  1. Walks artifacts/ and rewrites every artifact whose ABI contains such
 *     non-canonical enum types, replacing them with "uint8".
 *  2. Walks typechain-types/ and applies the same fix directly to the
 *     hardcoded _abi objects inside the generated factory .ts files, so
 *     the TypeChain cache cannot serve stale data.
 */

const fs = require("fs");
const path = require("path");

const ARTIFACTS_DIR = path.resolve(__dirname, "../artifacts");
const TYPECHAIN_DIR = path.resolve(__dirname, "../typechain-types");

// ---------------------------------------------------------------------------
// Artifact JSON patching
// ---------------------------------------------------------------------------

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
function collectJsonArtifacts(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "build-info") continue;
      results.push(...collectJsonArtifacts(full));
    } else if (entry.isFile() && entry.name.endsWith(".json") && !entry.name.endsWith(".dbg.json")) {
      results.push(full);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// TypeChain .ts factory patching
// ---------------------------------------------------------------------------

/**
 * Match an ABI param object inside a TypeChain factory TypeScript source where
 * internalType is an enum but type is not "uint8", e.g.:
 *
 *   internalType: "enum IClearingTypes.ClearingOperationType",
 *   name: "clearingOperationType",
 *   type: "IClearingTypes.ClearingOperationType",
 *
 * The regex captures everything up to and including the bad type value so we
 * can replace only the type field while keeping the surrounding text intact.
 *
 * Breakdown:
 *   internalType: "enum [^"]+"  — the internalType with "enum " prefix
 *   ,\s*\n                      — trailing comma + newline
 *   (?:[ \t]+\w+: "[^"]*",\s*\n)* — zero or more intermediate string props
 *   [ \t]+type: "              — the type field indent + key
 *   (?!uint8")                 — negative lookahead: skip already-correct values
 *   ([^"]+)"                   — capture the wrong type name
 */
const TYPECHAIN_ENUM_PATTERN =
  /(internalType: "enum [^"]+",\s*\n(?:[ \t]+\w+: "[^"]*",\s*\n)*[ \t]+type: ")(?!uint8")([^"]+)"/g;

/**
 * Recursively collect all .ts files under a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function collectTsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTsFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      results.push(full);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let artifactPatched = 0;
let typechainPatched = 0;

// Pass 1: patch artifact JSON files
if (fs.existsSync(ARTIFACTS_DIR)) {
  for (const artifactPath of collectJsonArtifacts(ARTIFACTS_DIR)) {
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
    console.log(`[fix-enum-abi-types] Patched artifact: ${path.relative(ARTIFACTS_DIR, artifactPath)}`);
    artifactPatched++;
  }
}

// Pass 2: patch TypeChain factory .ts files (bypasses TypeChain cache)
for (const tsPath of collectTsFiles(TYPECHAIN_DIR)) {
  const content = fs.readFileSync(tsPath, "utf8");
  const fixed = content.replace(TYPECHAIN_ENUM_PATTERN, '$1uint8"');
  if (fixed === content) continue;

  fs.writeFileSync(tsPath, fixed, "utf8");
  console.log(`[fix-enum-abi-types] Patched typechain: ${path.relative(TYPECHAIN_DIR, tsPath)}`);
  typechainPatched++;
}

console.log(
  `[fix-enum-abi-types] Done. ${artifactPatched} artifact(s) patched, ${typechainPatched} typechain file(s) patched.`,
);
