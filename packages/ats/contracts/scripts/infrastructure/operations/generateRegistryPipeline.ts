// SPDX-License-Identifier: Apache-2.0

/**
 * Configurable registry generation pipeline for smart contracts.
 *
 * This module provides a reusable, framework-agnostic pipeline for generating
 * TypeScript contract registries from Solidity source files. Downstream projects
 * can use this to auto-generate their own registries with minimal configuration.
 *
 * @module infrastructure/operations/generateRegistryPipeline
 *
 * @example
 * ```typescript
 * // Generate registry with defaults
 * const result = await generateRegistryPipeline({
 *     contractsPath: './contracts'
 * })
 *
 * // Generate with custom configuration
 * const result = await generateRegistryPipeline({
 *     contractsPath: './contracts',
 *     outputPath: './src/generated/registry.ts',
 *     resolverKeyPaths: ['**\/config/keys.sol'],
 *     rolesPaths: ['**\/config/roles.sol'],
 *     logLevel: 'DEBUG'
 * })
 * ```
 */

import * as path from "path";
import {
  ContractFile,
  ContractMetadata,
  findAllContracts,
  categorizeContracts,
  pairTimeTravelVariants,
  extractMetadata,
  detectCategory,
  detectLayer,
  generateRegistry,
  generateSummary,
  extractRoles,
  extractResolverKeys,
  writeFile as writeToFileFn,
  readFile,
  findSolidityFiles,
} from "@scripts/tools";
import { LogLevel, configureLogger, section, info, success, warn, table } from "@scripts/infrastructure";

/**
 * Configuration for registry generation pipeline.
 */
export interface RegistryGenerationConfig {
  /** Path to contracts directory (required) */
  contractsPath: string;

  /** Path to artifacts directory (required) */
  artifactPath: string;

  /** Glob patterns to include (default: ['**\/*.sol']) */
  includePaths?: string[];

  /** Glob patterns to exclude (default: test/mock patterns) */
  excludePaths?: string[];

  /** Paths to search for resolver keys (default: ['**\/constants/resolverKeys.sol']) */
  resolverKeyPaths?: string[];

  /** Paths to search for roles (default: ['**\/constants/roles.sol']) */
  rolesPaths?: string[];

  /** Include storage wrappers in registry (default: true) */
  includeStorageWrappers?: boolean;

  /** Include TimeTravel variant pairing (default: true) */
  includeTimeTravel?: boolean;

  /** Extract natspec descriptions from contracts (default: true) */
  extractNatspec?: boolean;

  /** Output file path (default: './generated/registry.data.ts') */
  outputPath?: string;

  /** Module name for imports in generated code (default: '@scripts/infrastructure') */
  moduleName?: string;

  /** TypeChain factory import path (default: '@contract-types') */
  typechainModuleName?: string;

  /** Logging level (default: 'INFO') */
  logLevel?: "DEBUG" | "INFO" | "WARN" | "ERROR" | "SILENT";

  /** Custom category detector function */
  categoryDetector?: (contract: ContractFile, layer: number) => string;

  /** Custom layer detector function */
  layerDetector?: (contract: ContractFile) => number;

  /** Only generate facets, skip infrastructure contracts (default: false) */
  facetsOnly?: boolean;

  /**
   * Include mock contracts in registry generation.
   * When enabled, scans mockContractPaths for contracts and includes them
   * in a separate MOCK_CONTRACTS registry.
   * @default false
   */
  includeMocksInRegistry?: boolean;

  /**
   * Glob patterns to find mock contracts.
   * Only used if includeMocksInRegistry=true.
   * Mock contracts should follow standard patterns (use constants files for resolver keys).
   * @default ['**\/mocks/**\/*.sol', '**\/test/**\/*Mock*.sol']
   */
  mockContractPaths?: string[];
}

/**
 * Statistics from registry generation.
 */
export interface RegistryGenerationStats {
  /** Total number of facets in registry */
  totalFacets: number;

  /** Total number of infrastructure contracts in registry */
  totalInfrastructure: number;

  /** Total number of storage wrappers in registry */
  totalStorageWrappers: number;

  /** Total number of mock contracts in registry */
  totalMocks: number;

  /** Total number of unique roles found */
  totalRoles: number;

  /** Total number of unique resolver keys found */
  totalResolverKeys: number;

  /** Number of facets with TimeTravel variants */
  withTimeTravel: number;

  /** Number of contracts with role definitions */
  withRoles: number;

  /** Facets grouped by category */
  byCategory: Record<string, number>;

  /** Facets grouped by layer */
  byLayer: Record<number, number>;

  /** Number of lines in generated code */
  generatedLines: number;

  /** Time taken to generate (milliseconds) */
  durationMs: number;
}

/**
 * Result from registry generation pipeline.
 */
export interface RegistryGenerationResult {
  /** Generated TypeScript code */
  code: string;

  /** Generation statistics */
  stats: RegistryGenerationStats;

  /** Output file path (if written to disk) */
  outputPath?: string;

  /** Warnings encountered during generation */
  warnings: string[];
}

/**
 * Default configuration for registry generation.
 */
export const DEFAULT_REGISTRY_CONFIG: Required<
  Omit<RegistryGenerationConfig, "categoryDetector" | "layerDetector" | "mockContractPaths">
> & { mockContractPaths: string[] } = {
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
};

/**
 * Generate a complete contract registry from Solidity source files.
 *
 * This is the main entry point for downstream projects to auto-generate
 * their own contract registries. It handles the full pipeline:
 *
 * 1. Scan contracts directory for Solidity files
 * 2. Categorize contracts (facets, infrastructure, test, etc.)
 * 3. Extract resolver keys and roles from constants files
 * 4. Extract metadata from each contract (methods, events, errors, natspec)
 * 5. Generate TypeScript registry code
 * 6. Optionally write to file
 *
 * The function is highly configurable and can adapt to different project
 * structures and naming conventions.
 *
 * @param config - Configuration options (uses defaults for omitted values)
 * @param writeFile - Whether to write generated code to file (default: true)
 * @returns Registry generation result with code, statistics, and warnings
 *
 * @example
 * ```typescript
 * // Simple usage with defaults
 * const result = await generateRegistryPipeline({
 *     contractsPath: './contracts'
 * })
 * console.log(`Generated ${result.stats.totalFacets} facets`)
 *
 * // Custom configuration for different project structure
 * const result = await generateRegistryPipeline({
 *     contractsPath: './src/contracts',
 *     outputPath: './scripts/registry.ts',
 *     resolverKeyPaths: ['**\/config/keys.sol'],
 *     rolesPaths: ['**\/config/roles.sol'],
 *     includeStorageWrappers: false,
 *     moduleName: '@my-company/contracts'
 * })
 *
 * // Dry run (don't write file)
 * const result = await generateRegistryPipeline(
 *     { contractsPath: './contracts' },
 *     false
 * )
 * console.log(result.code)  // View generated TypeScript
 * ```
 */
export async function generateRegistryPipeline(
  config: RegistryGenerationConfig,
  writeToFile: boolean = true,
): Promise<RegistryGenerationResult> {
  const startTime = Date.now();

  // Merge with defaults
  const fullConfig: Required<RegistryGenerationConfig> = {
    ...DEFAULT_REGISTRY_CONFIG,
    ...config,
    categoryDetector: config.categoryDetector || detectCategory,
    layerDetector: config.layerDetector || detectLayer,
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

  section("Registry Generation Pipeline");
  info(`Scanning: ${fullConfig.contractsPath}`);

  // Resolve absolute path
  const contractsDir = path.isAbsolute(fullConfig.contractsPath)
    ? fullConfig.contractsPath
    : path.resolve(process.cwd(), fullConfig.contractsPath);

  info(`Scanning: ${fullConfig.artifactPath}`);
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

  // Step 3: Pair TimeTravel variants (if enabled)
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

  // Find resolver key files using configured patterns
  const resolverKeyFiles = allSolidityFiles.filter((filePath) =>
    fullConfig.resolverKeyPaths.some((pattern) => {
      // Convert glob pattern to regex
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

  // Create contracts map for inheritance resolution
  const contractsMap = new Map<string, ContractFile>();
  for (const contract of allContracts) {
    for (const contractName of contract.contractNames) {
      contractsMap.set(contractName, contract);
    }
  }

  // Extract facet metadata
  const facetMetadata = categorized.facets.map((contract) => {
    const hasTimeTravel = fullConfig.includeTimeTravel ? timeTravelPairs.get(contract.primaryContract) !== null : false;
    return extractMetadata(contract, hasTimeTravel, allResolverKeys, contractsMap);
  });

  // Extract infrastructure metadata (unless facetsOnly)
  const infrastructureMetadata = fullConfig.facetsOnly
    ? []
    : categorized.infrastructure.map((contract) => extractMetadata(contract, false, allResolverKeys, contractsMap));

  info(`  Extracted metadata for ${facetMetadata.length} facets`);
  if (!fullConfig.facetsOnly) {
    info(`  Extracted metadata for ${infrastructureMetadata.length} infrastructure contracts`);
  }

  // Validate resolver keys
  const facetsWithResolverKeys = facetMetadata.filter((f) => f.resolverKey);
  const facetsWithoutResolverKeys = facetMetadata.filter((f) => !f.resolverKey);
  info(
    `  Resolver keys: ${facetsWithResolverKeys.length} facets with keys, ${facetsWithoutResolverKeys.length} without`,
  );

  // Step 5.5: Extract Storage Wrapper metadata (if enabled)
  let storageWrapperMetadata: ContractMetadata[] = [];

  if (fullConfig.includeStorageWrappers) {
    info("Step 5.5: Extracting Storage Wrapper metadata...");
    const storageWrapperContracts = allContracts
      .filter((contract) => contract.filePath.endsWith("StorageWrapper.sol"))
      .filter((c): c is NonNullable<typeof c> => c !== null);

    storageWrapperMetadata = storageWrapperContracts.map((contract) =>
      extractMetadata(contract, false, allResolverKeys, contractsMap),
    );

    info(`  Extracted metadata for ${storageWrapperMetadata.length} storage wrappers`);
  } else {
    info("Step 5.5: Skipping Storage Wrapper extraction (disabled)");
  }

  // Step 5.6: Extract mock contracts metadata (if enabled)
  let mockMetadata: ContractMetadata[] = [];

  if (fullConfig.includeMocksInRegistry) {
    info("Step 5.6: Extracting mock contracts metadata...");

    // Use already-categorized test contracts
    // These were properly categorized in Step 2 (categorizeContracts)
    // which now checks for test/mock BEFORE checking for facets
    const mockContracts = categorized.test;

    info(`  Found ${mockContracts.length} mock/test contract files`);

    // Extract metadata for mock contracts
    mockMetadata = mockContracts.map((contract) => extractMetadata(contract, false, allResolverKeys, contractsMap));

    info(`  Extracted metadata for ${mockMetadata.length} mock contracts`);

    // Warn about mocks without resolver keys (may be intentional)
    const missingKeys = mockMetadata.filter((m) => !m.resolverKey);
    if (missingKeys.length > 0) {
      warn(`${missingKeys.length} mock contracts without resolver keys: ${missingKeys.map((m) => m.name).join(", ")}`);
      warnings.push(`Mock contracts without resolver keys: ${missingKeys.map((m) => m.name).join(", ")}`);
    }
  } else {
    info("Step 5.6: Skipping mock contract extraction (disabled)");
  }

  // Step 6: Scan standalone constant files for roles
  info("Step 6: Scanning standalone role constants...");

  const allRoles = new Map<string, string>();

  // Collect roles from facets and infrastructure
  for (const metadata of [...facetMetadata, ...infrastructureMetadata]) {
    for (const role of metadata.roles) {
      if (!allRoles.has(role.name)) {
        allRoles.set(role.name, role.value);
      }
    }
  }

  // Find and scan standalone roles files using configured patterns
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

  // Step 9: Format the generated code with Prettier
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

  // Step 10: Write output (if requested)
  let outputPath: string | undefined;

  if (writeToFile) {
    const resolvedOutputPath = path.isAbsolute(fullConfig.outputPath)
      ? fullConfig.outputPath
      : path.resolve(process.cwd(), fullConfig.outputPath);

    // Smart file writing: only write if content changed (excluding timestamp)
    let shouldWrite = true;
    try {
      const existingContent = readFile(resolvedOutputPath);

      // Normalize content by removing timestamp line for comparison
      const normalizeContent = (content: string) => {
        return content.replace(/\n \* Generated: .*\n/, "\n * Generated: TIMESTAMP\n");
      };

      const normalizedExisting = normalizeContent(existingContent);
      const normalizedNew = normalizeContent(formattedCode);

      if (normalizedExisting === normalizedNew) {
        shouldWrite = false;
        info("Registry content unchanged - preserving existing file and timestamp");
      }
    } catch (error) {
      // File doesn't exist or can't be read - write new file
      shouldWrite = true;
    }

    if (shouldWrite) {
      writeToFileFn(resolvedOutputPath, formattedCode);
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
