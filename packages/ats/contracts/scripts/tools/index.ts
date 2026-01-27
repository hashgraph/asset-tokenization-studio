// SPDX-License-Identifier: Apache-2.0

/**
 * Tools layer exports for contract registry generation.
 *
 * This module provides utilities for scanning Solidity contracts,
 * extracting metadata, and generating TypeScript registries.
 *
 * @module tools
 *
 * @example
 * ```typescript
 * // Import the fast standalone registry generator (recommended)
 * import {
 *   generateRegistryPipeline,
 *   DEFAULT_CONFIG,
 *   type RegistryConfig,
 *   type RegistryResult,
 * } from '@scripts/tools'
 *
 * // Generate your own registry
 * const result = await generateRegistryPipeline({
 *   contractsPath: './contracts',
 *   outputPath: './src/registry.data.ts',
 * });
 * ```
 */

// ============================================================================
// Standalone Registry Generator (Fast, No TypeChain Dependencies)
// ============================================================================

export {
  // Main pipeline
  generateRegistryPipeline,
  DEFAULT_CONFIG,
  // Cache
  CacheManager,
  // Core components
  findAllContracts as standalonesFindAllContracts,
  categorizeContracts as standaloneCategorizeContracts,
  pairTimeTravelVariants as standalonePairTimeTravelVariants,
  extractMetadata as standaloneExtractMetadata,
  generateRegistry as standaloneGenerateRegistry,
  generateSummary as standaloneGenerateSummary,
  // Utilities
  findSolidityFiles as standaloneFindSolidityFiles,
  readFile as standaloneReadFile,
  writeFile as standaloneWriteFile,
  hashFile,
  getRelativePath as standaloneGetRelativePath,
  // Logging
  LogLevel,
  configureLogger,
} from "./registry-generator/exports";

export type { RegistryConfig, RegistryResult, CacheEntry, RegistryCache } from "./registry-generator/exports";

// ============================================================================
// Contract Scanner
// ============================================================================

export type { ContractFile, CategorizedContracts } from "./scanner/contractFinder";

export {
  findAllContracts,
  categorizeContracts,
  pairTimeTravelVariants,
  findTimeTravelPair,
} from "./scanner/contractFinder";

// ============================================================================
// Metadata Extractor
// ============================================================================

export type { ContractMetadata } from "./scanner/metadataExtractor";

export {
  extractMetadata,
  detectLayer,
  detectCategory,
  generateDescription,
  inferDependencies,
} from "./scanner/metadataExtractor";

// NOTE: Registry generator (./generators/registryGenerator.ts) removed
// Use standaloneGenerateRegistry and standaloneGenerateSummary from the standalone module above

// ============================================================================
// File Utilities
// ============================================================================

export {
  findFiles,
  findSolidityFiles,
  readFile,
  writeFile,
  getRelativePath,
  getPathSegment,
  fileExists,
} from "./utils/fileUtils";

// ============================================================================
// ABI Validator (Internal utilities, exported for advanced use cases)
// ============================================================================

export { loadABI, extractMethodsFromABI, validateAndMerge } from "./utils/abiValidator";

// ============================================================================
// Solidity Utilities
// ============================================================================

export type { RoleDefinition, ResolverKeyDefinition } from "./utils/solidityUtils";

export {
  // Contract structure
  extractContractNames,
  extractInheritance,
  extractImports,
  extractSolidityVersion,
  implementsInterface,
  // Naming utilities
  isFacetName,
  isTimeTravelVariant,
  getBaseName,
  // Roles and keys
  extractRoles,
  extractResolverKeys,
  extractFacetResolverKeyImport,
  // Methods
  extractPublicMethods,
  extractAllMethods,
  extractPublicMethodsWithInheritance,
  extractFunctionSignature,
  // Events
  extractEvents,
  extractEventsWithInheritance,
  extractEventSignature,
  // Errors
  extractErrors,
  extractErrorsWithInheritance,
  extractErrorSignature,
  // Signatures and selectors
  normalizeType,
  parseParameterTypes,
  calculateSelector,
  calculateTopic0,
  // Natspec
  extractNatspecDescription,
} from "./utils/solidityUtils";
