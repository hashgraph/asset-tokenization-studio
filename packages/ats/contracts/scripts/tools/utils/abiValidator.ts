// SPDX-License-Identifier: Apache-2.0

/**
 * ABI validation utilities.
 *
 * Loads compiled ABIs from Hardhat artifacts and validates/merges with
 * regex-extracted method signatures.
 *
 * @module tools/utils/abiValidator
 */
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import { MethodDefinition } from "../../infrastructure/types";

/**
 * Load compiled ABI from Hardhat artifacts.
 *
 * @param contractName - Contract name (e.g., "AccessControl")
 * @param contractsDir - Root contracts directory
 * @returns ABI array or undefined if not found
 */
export function loadABI(contractName: string, contractsDir: string): any[] | undefined {
  // Hardhat artifacts path pattern:
  // build/artifacts/contracts/.../ContractName.sol/ContractName.json

  const artifactsDir = path.join(contractsDir, "../build/artifacts/contracts");

  try {
    // Search for artifact file recursively
    const artifactPath = findArtifactPath(artifactsDir, contractName);
    if (!artifactPath) {
      return undefined;
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    return artifact.abi;
  } catch (error) {
    return undefined;
  }
}

/**
 * Find artifact file path recursively.
 */
function findArtifactPath(dir: string, contractName: string): string | undefined {
  if (!fs.existsSync(dir)) {
    return undefined;
  }

  const targetFile = `${contractName}.json`;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const found = findArtifactPath(fullPath, contractName);
      if (found) return found;
    } else if (entry.name === targetFile) {
      return fullPath;
    }
  }

  return undefined;
}

/**
 * Extract method signatures from ABI.
 *
 * @param abi - Contract ABI
 * @returns Map of method name to signature details
 */
export function extractMethodsFromABI(abi: any[]): MethodDefinition[] {
  const STATIC_METHODS_TO_EXCLUDE = new Set([
    "getStaticFunctionSelectors",
    "getStaticInterfaceIds",
    "getStaticResolverKey",
  ]);

  const methods: MethodDefinition[] = [];
  const iface = new ethers.Interface(abi);
  const functions = iface.fragments.filter((f): f is ethers.FunctionFragment => f.type === "function");
  for (const item of functions) {
    if (!STATIC_METHODS_TO_EXCLUDE.has(item.name)) {
      const name = item.name;
      const signature = item.format("full");
      const selector = item.selector;

      methods.push({ name, signature, selector });
    }
  }

  return methods;
}

/**
 * Validate and merge regex-extracted methods with ABI methods.
 *
 * Strategy:
 * - If ABI available: Use ABI as source of truth
 * - If ABI missing: Use regex results
 * - Log warnings for mismatches
 *
 * @param regexMethods - Methods extracted from source with regex
 * @param abiMethods - Methods extracted from ABI
 * @param contractName - Contract name for logging
 * @returns Validated method definitions
 */
export function validateAndMerge(abiMethods: Map<string, { signature: string; selector: string }>): MethodDefinition[] {
  const result: MethodDefinition[] = [];
  for (const [name, abiMethod] of abiMethods.entries()) {
    result.push({
      name,
      signature: abiMethod.signature,
      selector: abiMethod.selector,
    });
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}
