// SPDX-License-Identifier: Apache-2.0

/**
 * Registry Generator - Public API Exports
 *
 * This module exports the registry generation pipeline and types for use
 * by downstream projects that want to generate their own contract registries.
 *
 * @module registry-generator
 *
 * @example
 * ```typescript
 * import {
 *   generateRegistryPipeline,
 *   DEFAULT_CONFIG,
 *   type RegistryConfig,
 *   type RegistryResult,
 * } from '@hashgraph/asset-tokenization-contracts/scripts';
 *
 * // Generate registry for your contracts
 * const result = await generateRegistryPipeline({
 *   contractsPath: './contracts',
 *   artifactPath: './artifacts/contracts',
 *   outputPath: './src/registry.data.ts',
 *   moduleName: '@my-project/infrastructure',
 *   typechainModuleName: '@my-project/typechain',
 * });
 *
 * console.log(`Generated ${result.stats.totalFacets} facets`);
 * ```
 */

// ============================================================================
// Main Pipeline
// ============================================================================

export { generateRegistryPipeline, DEFAULT_CONFIG } from "./pipeline";

// ============================================================================
// Types
// ============================================================================

export type {
  RegistryConfig,
  RegistryResult,
  ContractFile,
  ContractMetadata,
  CategorizedContracts,
  MethodDefinition,
  EventDefinition,
  ErrorDefinition,
  RoleDefinition,
  ResolverKeyDefinition,
  CacheEntry,
  RegistryCache,
} from "./types";

// ============================================================================
// Cache Manager (for advanced use cases)
// ============================================================================

export { CacheManager } from "./cache/manager";

// ============================================================================
// Core Components (for custom pipelines)
// ============================================================================

// Scanner
export { findAllContracts, categorizeContracts, pairTimeTravelVariants } from "./core/scanner";

// Extractor
export { extractMetadata } from "./core/extractor";

// Generator
export { generateRegistry, generateSummary } from "./core/generator";

// ============================================================================
// Utilities (for custom implementations)
// ============================================================================

// File utilities
export { findSolidityFiles, readFile, writeFile, hashFile, getRelativePath } from "./utils/fileUtils";

// Solidity parsing
export {
  extractContractNames,
  extractRoles,
  extractResolverKeys,
  extractImports,
  extractInheritance,
  extractNatspecDescription,
  isFacetName,
  isTimeTravelVariant,
  getBaseName,
} from "./utils/solidityParser";

// Logging
export { LogLevel, configureLogger } from "./utils/logging";
