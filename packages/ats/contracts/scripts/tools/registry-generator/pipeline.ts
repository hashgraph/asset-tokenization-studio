// SPDX-License-Identifier: Apache-2.0

/**
 * Registry generation pipeline - main orchestration.
 *
 * This module provides a reusable, framework-agnostic pipeline for generating
 * TypeScript contract registries from Solidity source files.
 *
 * CRITICAL: This module has NO dependencies on @scripts/infrastructure to avoid
 * TypeChain barrel import overhead (which causes 6+ second delays).
 *
 * @module registry-generator/pipeline
 */

import * as path from "path";
import type { RegistryConfig, RegistryResult, ContractFile, ContractMetadata } from "./types";
import { findSolidityFiles, readFile, writeFile } from "./utils/fileUtils";
import { extractResolverKeys, extractRoles } from "./utils/solidityParser";
import { LogLevel, configureLogger, section, info, success, warn, debug, table } from "./utils/logging";
import { findAllContracts, categorizeContracts, pairTimeTravelVariants } from "./core/scanner";
import { extractMetadata } from "./core/extractor";
import { generateRegistry, generateSummary } from "./core/generator";
import { CacheManager } from "./cache/manager";

/**
 * Default configuration for registry generation.
 */
export const DEFAULT_CONFIG: Required<Omit<RegistryConfig, "mockContractPaths">> & { mockContractPaths: string[] } = {
  contractsPath: "./contracts",
  artifactPath: "./artifacts/contracts",
  includePaths: ["**/*.sol"],
  excludePaths: ["**/test/**", "**/tests/**", "**/mocks/**", "**/mock/**", "**/*.t.sol", "**/*.s.sol"],
  resolverKeyPaths: ["**/constants/resolverKeys.sol", "**/layer_*/constants/resolverKeys.sol"],
  rolesPaths: ["**/constants/roles.sol", "**/interfaces/roles.sol"],
  includeStorageWrappers: true,
  includeTimeTravel: true,
  extractNatspec: true,
  outputPath: "./generated/registry.data.ts",
  moduleName: "@scripts/infrastructure",
  typechainModuleName: "@contract-types",
  logLevel: "INFO",
  facetsOnly: false,
  includeMocksInRegistry: false,
  mockContractPaths: ["**/mocks/**/*.sol", "**/test/**/*Mock*.sol", "**/test/**/*mock*.sol"],
  useCache: false,
  cacheDir: process.cwd(),
};

/**
 * Generate a complete contract registry from Solidity source files.
 *
 * @param config - Configuration options
 * @param writeToFile - Whether to write generated code to file
 * @returns Registry generation result
 */
export async function generateRegistryPipeline(
  config: RegistryConfig,
  writeToFile: boolean = true,
): Promise<RegistryResult> {
  const startTime = Date.now();

  // Merge with defaults
  const fullConfig: Required<RegistryConfig> = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  // Configure logger
  const logLevelMap: Record<string, LogLevel> = {
    DEBUG: LogLevel.DEBUG,
    INFO: LogLevel.INFO,
    WARN: LogLevel.WARN,
    ERROR: LogLevel.ERROR,
    SILENT: LogLevel.SILENT,
  };
  configureLogger({ level: logLevelMap[fullConfig.logLevel] });

  const warnings: string[] = [];

  // Initialize cache if enabled
  let cache: CacheManager | null = null;
  if (fullConfig.useCache) {
    cache = new CacheManager(fullConfig.cacheDir);
    const stats = cache.getStats();
    debug(`Cache initialized with ${stats.totalEntries} entries`);
  }

  section("Registry Generation Pipeline");
  info(`Scanning: ${fullConfig.contractsPath}`);

  // Resolve absolute paths
  const contractsDir = path.isAbsolute(fullConfig.contractsPath)
    ? fullConfig.contractsPath
    : path.resolve(process.cwd(), fullConfig.contractsPath);

  info(`Artifacts: ${fullConfig.artifactPath}`);
  const artifactDir = path.isAbsolute(fullConfig.artifactPath)
    ? fullConfig.artifactPath
    : path.resolve(process.cwd(), fullConfig.artifactPath);

  // Step 1: Find all contracts
  info("Step 1: Discovering contracts...");
  const allContracts = findAllContracts(contractsDir, artifactDir);
  info(`  Found ${allContracts.length} contract files`);

  // Step 2: Categorize contracts
  info("Step 2: Categorizing contracts...");
  const categorized = categorizeContracts(allContracts);
  const categorizationTable: string[][] = [
    ["Facets", categorized.facets.length.toString()],
    ["TimeTravel variants", categorized.timeTravelFacets.length.toString()],
    ["Infrastructure", categorized.infrastructure.length.toString()],
    ["Test/Mock", categorized.test.length.toString()],
    ["Interfaces", categorized.interfaces.length.toString()],
    ["Libraries", categorized.libraries.length.toString()],
    ["Other", categorized.other.length.toString()],
  ];
  table(["Type", "Count"], categorizationTable);

  // Step 3: Pair TimeTravel variants
  let timeTravelPairs = new Map<string, ContractFile | null>();
  let withTimeTravel = 0;

  if (fullConfig.includeTimeTravel) {
    info("Step 3: Pairing TimeTravel variants...");
    timeTravelPairs = pairTimeTravelVariants(categorized.facets, categorized.timeTravelFacets);
    withTimeTravel = Array.from(timeTravelPairs.values()).filter((v) => v !== null).length;
    info(`  ${withTimeTravel} facets have TimeTravel variants`);
  } else {
    info("Step 3: Skipping TimeTravel variant pairing (disabled)");
  }

  // Step 4: Extract resolver keys from constants files
  info("Step 4: Scanning resolver key constants...");
  const allResolverKeys = new Map<string, string>();
  const allSolidityFiles = findSolidityFiles(contractsDir);

  const resolverKeyFiles = allSolidityFiles.filter((filePath) =>
    fullConfig.resolverKeyPaths.some((pattern) => {
      const regexPattern = pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*");
      return new RegExp(regexPattern).test(filePath);
    }),
  );

  for (const keyFile of resolverKeyFiles) {
    const source = readFile(keyFile);
    const extractedKeys = extractResolverKeys(source);
    for (const key of extractedKeys) {
      if (!allResolverKeys.has(key.name)) {
        allResolverKeys.set(key.name, key.value);
      }
    }
  }

  info(`  Found ${resolverKeyFiles.length} resolver key files`);
  info(`  Total unique resolver keys: ${allResolverKeys.size}`);

  // Step 5: Extract metadata
  info("Step 5: Extracting contract metadata...");

  const contractsMap = new Map<string, ContractFile>();
  for (const contract of allContracts) {
    for (const contractName of contract.contractNames) {
      contractsMap.set(contractName, contract);
    }
  }

  // Helper function to extract metadata with caching
  let cacheHits = 0;
  let cacheMisses = 0;

  const extractWithCache = (contract: ContractFile, hasTimeTravel: boolean): ContractMetadata => {
    // Check cache first if enabled
    if (cache && !cache.shouldReprocess(contract.filePath)) {
      const cached = cache.getCached(contract.filePath);
      if (cached) {
        cacheHits++;
        // Update hasTimeTravel since it may have changed based on config
        return { ...cached, hasTimeTravel };
      }
    }

    // Extract fresh metadata
    cacheMisses++;
    const metadata = extractMetadata(contract, hasTimeTravel, allResolverKeys, contractsMap);

    // Cache the result
    if (cache) {
      cache.set(contract.filePath, metadata);
    }

    return metadata;
  };

  const facetMetadata = categorized.facets.map((contract) => {
    const hasTimeTravel = fullConfig.includeTimeTravel ? timeTravelPairs.get(contract.primaryContract) !== null : false;
    return extractWithCache(contract, hasTimeTravel);
  });

  const infrastructureMetadata = fullConfig.facetsOnly
    ? []
    : categorized.infrastructure.map((contract) => extractWithCache(contract, false));

  info(`  Extracted metadata for ${facetMetadata.length} facets`);
  if (!fullConfig.facetsOnly) {
    info(`  Extracted metadata for ${infrastructureMetadata.length} infrastructure contracts`);
  }

  // Log cache statistics
  if (cache) {
    info(
      `  Cache: ${cacheHits} hits, ${cacheMisses} misses (${Math.round((cacheHits / (cacheHits + cacheMisses || 1)) * 100)}% hit rate)`,
    );
  }

  const facetsWithResolverKeys = facetMetadata.filter((f) => f.resolverKey);
  const facetsWithoutResolverKeys = facetMetadata.filter((f) => !f.resolverKey);
  info(
    `  Resolver keys: ${facetsWithResolverKeys.length} facets with keys, ${facetsWithoutResolverKeys.length} without`,
  );

  // Step 5.5: Extract Storage Wrapper metadata
  let storageWrapperMetadata: ContractMetadata[] = [];

  if (fullConfig.includeStorageWrappers) {
    info("Step 5.5: Extracting Storage Wrapper metadata...");
    const storageWrapperContracts = allContracts
      .filter((contract) => contract.filePath.endsWith("StorageWrapper.sol"))
      .filter((c): c is NonNullable<typeof c> => c !== null);

    storageWrapperMetadata = storageWrapperContracts.map((contract) => extractWithCache(contract, false));

    info(`  Extracted metadata for ${storageWrapperMetadata.length} storage wrappers`);
  }

  // Step 5.6: Extract mock contracts metadata
  let mockMetadata: ContractMetadata[] = [];

  if (fullConfig.includeMocksInRegistry) {
    info("Step 5.6: Extracting mock contracts metadata...");
    const mockContracts = categorized.test;
    info(`  Found ${mockContracts.length} mock/test contract files`);
    mockMetadata = mockContracts.map((contract) => extractWithCache(contract, false));
    info(`  Extracted metadata for ${mockMetadata.length} mock contracts`);

    const missingKeys = mockMetadata.filter((m) => !m.resolverKey);
    if (missingKeys.length > 0) {
      warn(`${missingKeys.length} mock contracts without resolver keys: ${missingKeys.map((m) => m.name).join(", ")}`);
      warnings.push(`Mock contracts without resolver keys: ${missingKeys.map((m) => m.name).join(", ")}`);
    }
  }

  // Step 6: Scan standalone constant files for roles
  info("Step 6: Scanning standalone role constants...");

  const allRoles = new Map<string, string>();

  for (const metadata of [...facetMetadata, ...infrastructureMetadata]) {
    for (const role of metadata.roles) {
      if (!allRoles.has(role.name)) {
        allRoles.set(role.name, role.value);
      }
    }
  }

  const rolesFiles = allSolidityFiles.filter((filePath) =>
    fullConfig.rolesPaths.some((pattern) => {
      const regexPattern = pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*");
      return new RegExp(regexPattern).test(filePath);
    }),
  );

  for (const rolesFile of rolesFiles) {
    const source = readFile(rolesFile);
    const extractedRoles = extractRoles(source);
    for (const role of extractedRoles) {
      if (!allRoles.has(role.name)) {
        allRoles.set(role.name, role.value);
      }
    }
  }

  info(`  Found ${rolesFiles.length} standalone role files`);
  info(`  Total unique roles: ${allRoles.size}`);

  // Step 7: Generate registry code
  info("Step 7: Generating TypeScript registry code...");
  const registryCode = generateRegistry(
    facetMetadata,
    infrastructureMetadata,
    allRoles,
    storageWrapperMetadata,
    mockMetadata,
    fullConfig.moduleName,
    fullConfig.typechainModuleName,
  );
  info(`  Generated ${registryCode.split("\n").length} lines of code`);

  // Step 8: Generate summary
  section("Generation Summary");
  const summary = generateSummary(facetMetadata, infrastructureMetadata);

  const summaryTable: string[][] = [
    ["Total facets", summary.totalFacets.toString()],
    ["Total infrastructure", summary.totalInfrastructure.toString()],
    ["Total mocks", mockMetadata.length.toString()],
    ["With TimeTravel", summary.withTimeTravel.toString()],
    ["With roles", summary.withRoles.toString()],
  ];
  table(["Metric", "Count"], summaryTable);

  // Category breakdown
  if (Object.keys(summary.byCategory).length > 0) {
    const categoryTable: string[][] = Object.entries(summary.byCategory).map(([category, count]) => [
      category,
      count.toString(),
    ]);
    info("\nBy category:");
    table(["Category", "Count"], categoryTable);
  }

  // Layer breakdown
  if (Object.keys(summary.byLayer).length > 0) {
    const layerTable: string[][] = Object.entries(summary.byLayer).map(([layer, count]) => [
      `Layer ${layer}`,
      count.toString(),
    ]);
    info("\nBy layer:");
    table(["Layer", "Count"], layerTable);
  }

  // Step 9: Format with Prettier
  let formattedCode = registryCode;
  try {
    const prettier = await import("prettier");
    const resolvedOutputPath = path.isAbsolute(fullConfig.outputPath)
      ? fullConfig.outputPath
      : path.resolve(process.cwd(), fullConfig.outputPath);
    const prettierConfig = await prettier.resolveConfig(resolvedOutputPath);
    formattedCode = await prettier.format(registryCode, {
      ...prettierConfig,
      parser: "typescript",
      filepath: resolvedOutputPath,
    });
  } catch (error) {
    warn(`Could not apply Prettier formatting: ${error}`);
  }

  // Step 10: Write output
  let outputPath: string | undefined;

  if (writeToFile) {
    const resolvedOutputPath = path.isAbsolute(fullConfig.outputPath)
      ? fullConfig.outputPath
      : path.resolve(process.cwd(), fullConfig.outputPath);

    let shouldWrite = true;
    try {
      const existingContent = readFile(resolvedOutputPath);
      const normalizeContent = (content: string) => {
        return content.replace(/\n \* Generated: .*\n/, "\n * Generated: TIMESTAMP\n");
      };

      if (normalizeContent(existingContent) === normalizeContent(formattedCode)) {
        shouldWrite = false;
        info("Registry content unchanged - preserving existing file and timestamp");
      }
    } catch {
      shouldWrite = true;
    }

    if (shouldWrite) {
      writeFile(resolvedOutputPath, formattedCode);
      success("Registry generated successfully!");
      info(`Written to: ${resolvedOutputPath}`);
    }

    outputPath = resolvedOutputPath;
  } else {
    info("Skipping file write (writeToFile = false)");
  }

  // Collect warnings
  const missingResolverKeys = facetsWithoutResolverKeys.filter((f) => f.name !== "TimeTravelFacet");
  if (missingResolverKeys.length > 0) {
    const warningMsg = `${missingResolverKeys.length} facets missing resolver keys: ${missingResolverKeys.map((f) => f.name).join(", ")}`;
    warnings.push(warningMsg);
    warn(warningMsg);
  }

  const withoutTimeTravel = facetMetadata.filter((f) => !f.hasTimeTravel && f.name !== "TimeTravelFacet");
  if (fullConfig.includeTimeTravel && withoutTimeTravel.length > 0 && withoutTimeTravel.length < 10) {
    const warningMsg = `${withoutTimeTravel.length} facets don't have TimeTravel variants: ${withoutTimeTravel.map((f) => f.name).join(", ")}`;
    warnings.push(warningMsg);
    warn(warningMsg);
  }

  // Save cache if enabled
  if (cache) {
    const pruned = cache.prune();
    if (pruned > 0) {
      debug(`Pruned ${pruned} stale cache entries`);
    }
    cache.save();
    debug("Cache saved");
  }

  const durationMs = Date.now() - startTime;
  success(`Done in ${durationMs}ms!`);

  return {
    code: formattedCode,
    stats: {
      totalFacets: facetMetadata.length,
      totalInfrastructure: infrastructureMetadata.length,
      totalStorageWrappers: storageWrapperMetadata.length,
      totalMocks: mockMetadata.length,
      totalRoles: allRoles.size,
      totalResolverKeys: allResolverKeys.size,
      withTimeTravel,
      withRoles: summary.withRoles,
      byCategory: summary.byCategory,
      byLayer: summary.byLayer,
      generatedLines: formattedCode.split("\n").length,
      durationMs,
    },
    outputPath,
    warnings,
  };
}
