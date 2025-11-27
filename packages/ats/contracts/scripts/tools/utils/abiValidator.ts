// SPDX-License-Identifier: Apache-2.0

/**
 * ABI validation utilities.
 *
 * Loads compiled ABIs from Hardhat artifacts and validates/merges with
 * regex-extracted method signatures.
 *
 * @module tools/utils/abiValidator
 */

import * as fs from "fs";
import * as path from "path";
import { MethodDefinition } from "../../infrastructure/types";
import { calculateSelector } from "./solidityUtils";

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
export function extractMethodsFromABI(abi: any[]): Map<string, { signature: string; selector: string }> {
  const methods = new Map<string, { signature: string; selector: string }>();

  for (const item of abi) {
    if (item.type === "function") {
      const name = item.name;
      const inputs = item.inputs || [];

      // Build canonical signature
      const types = inputs.map((input: any) => input.type);
      const signature = `${name}(${types.join(",")})`;
      const selector = calculateSelector(signature);

      methods.set(name, { signature, selector });
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
export function validateAndMerge(
  regexMethods: MethodDefinition[],
  abiMethods: Map<string, { signature: string; selector: string }> | undefined,
  contractName: string,
): MethodDefinition[] {
  // If no ABI, return regex results as-is
  if (!abiMethods || abiMethods.size === 0) {
    return regexMethods;
  }

  // Use ABI as source of truth
  const result: MethodDefinition[] = [];
  const regexMethodMap = new Map(regexMethods.map((m) => [m.name, m]));

  for (const [name, abiMethod] of abiMethods.entries()) {
    const regexMethod = regexMethodMap.get(name);

    // Warn if signatures mismatch
    if (regexMethod && regexMethod.signature !== abiMethod.signature) {
      console.warn(`[ABI Validation] Signature mismatch for ${contractName}.${name}:`);
      console.warn(`  Regex:  ${regexMethod.signature}`);
      console.warn(`  ABI:    ${abiMethod.signature}`);
    }

    result.push({
      name,
      signature: abiMethod.signature,
      selector: abiMethod.selector,
    });
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}
