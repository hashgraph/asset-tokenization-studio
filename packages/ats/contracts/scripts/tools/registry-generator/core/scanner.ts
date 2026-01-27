// SPDX-License-Identifier: Apache-2.0

/**
 * Contract file discovery for registry generation.
 *
 * Scans the contracts directory, categorizes contracts, and pairs TimeTravel variants.
 * Self-contained with no external infrastructure dependencies.
 *
 * @module registry-generator/core/scanner
 */

import * as path from "path";
import { findSolidityFiles, readFile, getRelativePath } from "../utils/fileUtils";
import { extractContractNames, isFacetName, isTimeTravelVariant, getBaseName } from "../utils/solidityParser";
import type { ContractFile, CategorizedContracts } from "../types";

/**
 * Find all contract files in contracts directory.
 *
 * Scans for all .sol files, extracts contract names, and loads compiled artifacts.
 *
 * @param contractsDir - Absolute path to contracts directory
 * @param artifactDir - Absolute path to artifacts directory
 * @returns Array of discovered contract files with metadata
 */
export function findAllContracts(contractsDir: string, artifactDir: string): ContractFile[] {
  const solidityFiles = findSolidityFiles(contractsDir);
  const contracts: ContractFile[] = [];

  for (const filePath of solidityFiles) {
    const source = readFile(filePath);
    const contractNames = extractContractNames(source);

    if (contractNames.length === 0) {
      // Skip files with no contracts
      continue;
    }

    const relativePath = getRelativePath(filePath, contractsDir);
    const directory = path.dirname(filePath);
    const fileName = path.basename(filePath, ".sol");

    for (const contractName of contractNames) {
      const artifactPath = path.join(artifactDir, relativePath, `${contractName}.json`);

      try {
        const artifactData = JSON.parse(readFile(artifactPath));

        contracts.push({
          filePath,
          relativePath,
          directory,
          fileName,
          contractNames, // Keep all contract names for context
          primaryContract: contractName, // Each contract is its own primary
          source,
          artifactData,
        });
      } catch (error) {
        // Skip if artifact doesn't exist or is malformed
        continue;
      }
    }
  }

  return contracts;
}

/**
 * Categorize contracts by type.
 *
 * Organizes contracts into facets, TimeTravel variants, infrastructure, tests, etc.
 * Ensures test contracts are detected before facet detection to avoid misclassification.
 *
 * @param contracts - Array of contract files
 * @returns Categorized contracts grouped by type
 */
export function categorizeContracts(contracts: ContractFile[]): CategorizedContracts {
  const result: CategorizedContracts = {
    facets: [],
    timeTravelFacets: [],
    infrastructure: [],
    test: [],
    interfaces: [],
    libraries: [],
    other: [],
  };

  for (const contract of contracts) {
    const name = contract.primaryContract;

    // Test/Mock contracts (CHECK FIRST before facets!)
    // This ensures MockTreasuryFacet goes to test category, not facets
    if (isTestContract(contract)) {
      result.test.push(contract);
      continue;
    }

    // TimeTravel variants
    if (isTimeTravelVariant(name)) {
      result.timeTravelFacets.push(contract);
      continue;
    }

    // Facets
    if (isFacetName(name)) {
      result.facets.push(contract);
      continue;
    }

    // Infrastructure
    if (isInfrastructure(name)) {
      result.infrastructure.push(contract);
      continue;
    }

    // Interfaces
    if (name.startsWith("I") && name.length > 1) {
      result.interfaces.push(contract);
      continue;
    }

    // Libraries
    if (contract.source.includes(`library ${name}`)) {
      result.libraries.push(contract);
      continue;
    }

    // Everything else
    result.other.push(contract);
  }

  return result;
}

/**
 * Check if contract is infrastructure.
 *
 * Infrastructure includes only ATS-owned infrastructure contracts:
 * - BusinessLogicResolver (BLR) - facet registry and diamond proxy
 * - Factory - token deployment factory
 *
 * Note: We don't include OpenZeppelin library contracts (ProxyAdmin, TUP) as they
 * are dependencies, not our infrastructure contracts.
 *
 * @param contractName - Contract name
 * @returns true if infrastructure contract
 */
function isInfrastructure(contractName: string): boolean {
  const infrastructureNames = ["BusinessLogicResolver", "Factory"];
  return infrastructureNames.includes(contractName);
}

/**
 * Check if contract is a test/mock contract.
 *
 * Detects test contracts by name patterns and directory location.
 *
 * @param contract - Contract file
 * @returns true if test contract
 */
function isTestContract(contract: ContractFile): boolean {
  const name = contract.primaryContract;
  const pathLower = contract.relativePath.toLowerCase();

  // Check name patterns
  if (name.includes("Mock") || name.includes("Test") || name.startsWith("Mocked")) {
    return true;
  }

  // Check file path
  if (pathLower.includes("/test/") || pathLower.includes("/mocks/")) {
    return true;
  }

  return false;
}

/**
 * Find TimeTravel pair for a base facet.
 *
 * Searches for a TimeTravel variant with the naming pattern: BaseFacetNameTimeTravel
 *
 * @param baseFacetName - Base facet name
 * @param allContracts - All discovered contracts
 * @returns TimeTravel variant contract file or null if not found
 */
export function findTimeTravelPair(baseFacetName: string, allContracts: ContractFile[]): ContractFile | null {
  const timeTravelName = `${baseFacetName}TimeTravel`;
  return allContracts.find((c) => c.primaryContract === timeTravelName) || null;
}

/**
 * Group TimeTravel variants with their base facets.
 *
 * Creates a mapping of base facet names to their TimeTravel variants,
 * using null for facets without TimeTravel variants.
 *
 * @param facets - Base facet contracts
 * @param timeTravelFacets - TimeTravel variant contracts
 * @returns Map of base facet name to TimeTravel variant (or null)
 */
export function pairTimeTravelVariants(
  facets: ContractFile[],
  timeTravelFacets: ContractFile[],
): Map<string, ContractFile | null> {
  const pairs = new Map<string, ContractFile | null>();

  for (const facet of facets) {
    const baseName = facet.primaryContract;
    const timeTravelVariant = timeTravelFacets.find((tt) => getBaseName(tt.primaryContract) === baseName);

    pairs.set(baseName, timeTravelVariant || null);
  }

  return pairs;
}
