// SPDX-License-Identifier: Apache-2.0

/**
 * Metadata extraction from contract files.
 *
 * Extracts comprehensive metadata from contracts including methods, events, errors,
 * and inheritance information. Self-contained with no external dependencies.
 *
 * @module registry-generator/core/extractor
 */

import * as path from "path";
import type { ContractFile, ContractMetadata } from "../types";
import {
  extractRoles,
  extractImports,
  extractInheritance,
  extractSolidityVersion,
  extractFacetResolverKeyImport,
  extractEvents,
  extractEventsWithInheritance,
  extractErrors,
  extractErrorsWithInheritance,
  extractNatspecDescription,
} from "../utils/solidityParser";
import { extractMethodsFromABI } from "../utils/abiExtractor";

/**
 * Extract metadata from a contract file.
 *
 * Collects comprehensive information including methods, events, errors, roles,
 * resolver keys, inheritance chain, and more.
 *
 * @param contract - Contract file information
 * @param hasTimeTravel - Whether TimeTravel variant exists
 * @param allResolverKeys - Optional map of all resolver keys (name -> value)
 * @param allContracts - Optional map of all contracts (for inheritance extraction)
 * @returns Extracted metadata
 */
export function extractMetadata(
  contract: ContractFile,
  hasTimeTravel: boolean,
  allResolverKeys?: Map<string, string>,
  allContracts?: Map<string, ContractFile>,
): ContractMetadata {
  const name = contract.primaryContract;
  const layer = detectLayer(contract);
  const category = detectCategory(contract, layer);
  const roles = extractRoles(contract.source);
  const imports = extractImports(contract.source);
  const inheritance = extractInheritance(contract.source, name);
  const solidityVersion = extractSolidityVersion(contract.source);
  const upgradeable = detectUpgradeable(contract);
  const description = extractNatspecDescription(contract.source, name);

  // Extract methods from ABI (most accurate - compiled output)
  const methods = extractMethodsFromABI(contract.artifactData.abi);

  // Extract events based on contract type:
  // - Facets: Extract from entire inheritance chain
  // - Other contracts: Extract only from current contract
  let events = [];
  if (name.endsWith("Facet") && allContracts) {
    events = extractEventsWithInheritance(contract.source, name, allContracts);
  } else {
    events = extractEvents(contract.source);
  }

  // Extract errors based on contract type:
  // - Facets: Extract from entire inheritance chain
  // - Other contracts: Extract only from current contract
  let errors = [];
  if (name.endsWith("Facet") && allContracts) {
    errors = extractErrorsWithInheritance(contract.source, name, allContracts);
  } else {
    errors = extractErrors(contract.source);
  }

  // Extract resolver key for facets
  let resolverKey: { name: string; value: string } | undefined;
  if (name.endsWith("Facet")) {
    const keyName = extractFacetResolverKeyImport(contract.source);
    if (keyName && allResolverKeys) {
      const keyValue = allResolverKeys.get(keyName);
      if (keyValue) {
        resolverKey = { name: keyName, value: keyValue };
      }
    }
  }

  return {
    name,
    contractName: name,
    sourceFile: contract.relativePath,
    layer,
    category,
    hasTimeTravel,
    roles,
    resolverKey,
    methods,
    events,
    errors,
    imports,
    inheritance,
    solidityVersion,
    upgradeable,
    description,
  };
}

/**
 * Detect layer from file path.
 *
 * Checks for:
 * - contracts/facets/layer_N/ → layer N
 * - Defaults based on category
 *
 * @param contract - Contract file
 * @returns Detected layer (0-3)
 */
export function detectLayer(contract: ContractFile): number {
  const pathParts = contract.relativePath.split(path.sep);

  // Look for layer_N in path
  for (const part of pathParts) {
    const layerMatch = part.match(/layer[_-]?(\d)/i);
    if (layerMatch) {
      return parseInt(layerMatch[1], 10);
    }
  }

  // Default layer based on contract type
  const name = contract.primaryContract;

  // Infrastructure is layer 0
  if (name === "BusinessLogicResolver" || name === "Factory" || name === "ProxyAdmin") {
    return 0;
  }

  // Core facets are typically layer 1
  if (name.includes("ERC20") || name.includes("AccessControl") || name.includes("Pause")) {
    return 1;
  }

  // Business logic layer 2
  if (name.includes("CorporateAction") || name.includes("Scheduled")) {
    return 2;
  }

  // Jurisdiction-specific layer 3
  if (name.includes("USA") || name.includes("EU")) {
    return 3;
  }

  // Default to layer 1 for facets
  return 1;
}

/**
 * Detect category from contract name and path.
 *
 * @param contract - Contract file
 * @param layer - Detected layer
 * @returns Category string
 */
export function detectCategory(contract: ContractFile, layer: number): string {
  const name = contract.primaryContract;
  const pathLower = contract.relativePath.toLowerCase();

  // Check path for hints
  if (pathLower.includes("/compliance/")) return "compliance";
  if (pathLower.includes("/clearing/")) return "clearing";
  if (pathLower.includes("/asset/")) return "asset";

  // Check name patterns
  if (name.includes("Kyc") || name.includes("ControlList") || name.includes("ERC3643") || name.includes("Compliance")) {
    return "compliance";
  }

  if (name.includes("Clearing") || name.includes("Hold") || name.includes("Redeem")) {
    return "clearing";
  }

  if (name.includes("Equity") || name.includes("Bond")) {
    return "asset";
  }

  if (
    name.includes("ERC20") ||
    name.includes("ERC1410") ||
    name.includes("ERC1594") ||
    name.includes("ERC1643") ||
    name.includes("ERC1644") ||
    name.includes("AccessControl") ||
    name.includes("Pause") ||
    name.includes("Diamond") ||
    name.includes("Cap") ||
    name.includes("Freeze")
  ) {
    return "core";
  }

  // Layer 3 is often jurisdiction-specific
  if (layer === 3) {
    return "asset";
  }

  // Default
  return "core";
}

/**
 * Detect if contract is upgradeable (uses proxy pattern).
 *
 * @param contract - Contract file
 * @returns true if upgradeable
 */
function detectUpgradeable(contract: ContractFile): boolean {
  const source = contract.source;

  // Check for upgradeable patterns
  if (source.includes("Initializable")) return true;
  if (source.includes("UUPSUpgradeable")) return true;
  if (source.includes("TransparentUpgradeableProxy")) return true;
  if (source.includes("@openzeppelin/contracts-upgradeable")) return true;

  // BusinessLogicResolver and Factory are upgradeable
  const name = contract.primaryContract;
  if (name === "BusinessLogicResolver" || name === "Factory") {
    return true;
  }

  return false;
}

/**
 * Extract dependencies from imports.
 *
 * @param imports - Import paths
 * @param allFacetNames - Names of all known facets
 * @returns Array of dependency facet names
 */
export function inferDependencies(imports: string[], allFacetNames: string[]): string[] {
  const dependencies: string[] = [];

  for (const importPath of imports) {
    // Extract filename from import path
    const fileName = path.basename(importPath, ".sol");

    // Check if it's a known facet
    if (allFacetNames.includes(fileName)) {
      dependencies.push(fileName);
    }
  }

  return dependencies;
}
