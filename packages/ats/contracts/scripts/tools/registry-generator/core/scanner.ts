// SPDX-License-Identifier: Apache-2.0

/**
 * Contract file discovery for registry generation.
 *
 * Scans the contracts directory and categorizes contracts. Self-contained with no
 * external infrastructure dependencies.
 *
 * @module registry-generator/core/scanner
 */

import * as path from "path";
import { findSolidityFiles, readFile, getRelativePath } from "../utils/fileUtils";
import { extractContractNames, isFacetName } from "../utils/solidityParser";
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
          contractNames,
          primaryContract: contractName,
          source,
          artifactData,
        });
      } catch (_error) {
        continue;
      }
    }
  }

  return contracts;
}

/**
 * Categorize contracts by type.
 *
 * Organizes contracts into facets, infrastructure, tests, etc. Ensures test
 * contracts are detected before facet detection to avoid misclassification.
 *
 * @param contracts - Array of contract files
 * @returns Categorized contracts grouped by type
 */
export function categorizeContracts(contracts: ContractFile[]): CategorizedContracts {
  const result: CategorizedContracts = {
    facets: [],
    infrastructure: [],
    test: [],
    interfaces: [],
    libraries: [],
    other: [],
  };

  for (const contract of contracts) {
    const name = contract.primaryContract;

    if (isTestContract(contract)) {
      result.test.push(contract);
      continue;
    }

    if (isFacetName(name)) {
      result.facets.push(contract);
      continue;
    }

    if (isInfrastructure(name)) {
      result.infrastructure.push(contract);
      continue;
    }

    if (name.startsWith("I") && name.length > 1) {
      result.interfaces.push(contract);
      continue;
    }

    if (contract.source.includes(`library ${name}`)) {
      result.libraries.push(contract);
      continue;
    }

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
 */
function isInfrastructure(contractName: string): boolean {
  const infrastructureNames = ["BusinessLogicResolver", "Factory"];
  return infrastructureNames.includes(contractName);
}

/**
 * Check if contract is a test/mock contract.
 */
function isTestContract(contract: ContractFile): boolean {
  const name = contract.primaryContract;
  const pathLower = contract.relativePath.toLowerCase();

  if (name.includes("Mock") || name.includes("Test") || name.startsWith("Mocked")) {
    return true;
  }

  if (pathLower.includes("/test/") || pathLower.includes("/mocks/")) {
    return true;
  }

  return false;
}
