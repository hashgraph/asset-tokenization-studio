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
 * // Import from tools layer
 * import {
 *   findAllContracts,
 *   categorizeContracts,
 *   extractMetadata,
 *   generateRegistry,
 *   extractRoles,
 *   extractResolverKeys
 * } from '@scripts/tools'
 * ```
 */

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

// ============================================================================
// Registry Generator
// ============================================================================

export { generateRegistry, generateSummary } from "./generators/registryGenerator";

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
