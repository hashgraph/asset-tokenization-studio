// SPDX-License-Identifier: Apache-2.0

/**
 * Contract file discovery for registry generation.
 *
 * @module tools/scanner/contractFinder
 */

import * as path from "path";
import { findSolidityFiles, readFile, getRelativePath } from "../utils/fileUtils";
import { extractContractNames, isFacetName, isTimeTravelVariant, getBaseName } from "../utils/solidityUtils";

/**
 * Discovered contract file information.
 */
export interface ContractFile {
  /** Absolute path to .sol file */
  filePath: string;

  /** Relative path from contracts directory */
  relativePath: string;

  /** Directory containing the file */
  directory: string;

  /** Filename without extension */
  fileName: string;

  /** All contract names defined in this file */
  contractNames: string[];

  /** Primary contract name (usually matches filename) */
  primaryContract: string;

  /** Source code content */
  source: string;
}

/**
 * Categorized contracts by type.
 */
export interface CategorizedContracts {
  /** Facet contracts (ends with 'Facet') */
  facets: ContractFile[];

  /** TimeTravel variant facets */
  timeTravelFacets: ContractFile[];

  /** Infrastructure contracts (BLR, Factory, etc.) */
  infrastructure: ContractFile[];

  /** Test/mock contracts */
  test: ContractFile[];

  /** Interface definitions */
  interfaces: ContractFile[];

  /** Library contracts */
  libraries: ContractFile[];

  /** Other contracts */
  other: ContractFile[];
}

/**
 * Find all contract files in contracts directory.
 *
 * @param contractsDir - Absolute path to contracts directory
 * @returns Array of discovered contract files
 */
export function findAllContracts(contractsDir: string): ContractFile[] {
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

    // Primary contract usually matches filename
    const primaryContract = contractNames.find((name) => name === fileName) || contractNames[0];

    contracts.push({
      filePath,
      relativePath,
      directory,
      fileName,
      contractNames,
      primaryContract,
      source,
    });
  }

  return contracts;
}

/**
 * Categorize contracts by type.
 *
 * @param contracts - Array of contract files
 * @returns Categorized contracts
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
 * @param contract - Contract file
 * @returns true if test contract
 */
function isTestContract(contract: ContractFile): boolean {
  const name = contract.primaryContract;
  const path = contract.relativePath.toLowerCase();

  // Check name patterns
  if (name.includes("Mock") || name.includes("Test") || name.startsWith("Mocked")) {
    return true;
  }

  // Check file path
  if (path.includes("/test/") || path.includes("/mocks/")) {
    return true;
  }

  return false;
}

/**
 * Find TimeTravel pair for a base facet.
 *
 * @param baseFacetName - Base facet name
 * @param allContracts - All discovered contracts
 * @returns TimeTravel variant contract file or null
 */
export function findTimeTravelPair(baseFacetName: string, allContracts: ContractFile[]): ContractFile | null {
  const timeTravelName = `${baseFacetName}TimeTravel`;

  return allContracts.find((c) => c.primaryContract === timeTravelName) || null;
}

/**
 * Group TimeTravel variants with their base facets.
 *
 * @param facets - Base facet contracts
 * @param timeTravelFacets - TimeTravel variant contracts
 * @returns Map of base facet name to TimeTravel variant
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
