// SPDX-License-Identifier: Apache-2.0

/**
 * Self-contained types for registry generation.
 *
 * CRITICAL: This file must have NO external imports from @scripts/infrastructure
 * to avoid pulling in the TypeChain barrel export (which causes 6+ second delays).
 *
 * @module registry-generator/types
 */

/**
 * Hardhat artifact structure from compilation output.
 */
export interface HardhatArtifact {
  contractName: string;
  sourceName: string;
  abi: any[];
  bytecode: string;
  deployedBytecode: string;
  metadata?: string;
}

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
  /** Compiled artifact data */
  artifactData: HardhatArtifact;
}

/**
 * Categorized contracts by type.
 */
export interface CategorizedContracts {
  facets: ContractFile[];
  timeTravelFacets: ContractFile[];
  infrastructure: ContractFile[];
  test: ContractFile[];
  interfaces: ContractFile[];
  libraries: ContractFile[];
  other: ContractFile[];
}

/**
 * Method definition with full signature and selector.
 */
export interface MethodDefinition {
  name: string;
  signature: string;
  selector: string;
}

/**
 * Event definition with full signature and topic0 hash.
 */
export interface EventDefinition {
  name: string;
  signature: string;
  topic0: string;
}

/**
 * Error definition with full signature and selector.
 */
export interface ErrorDefinition {
  name: string;
  signature: string;
  selector: string;
}

/**
 * Role definition with name and value.
 */
export interface RoleDefinition {
  name: string;
  value: string;
}

/**
 * Resolver key definition with name and value.
 */
export interface ResolverKeyDefinition {
  name: string;
  value: string;
}

/**
 * Extracted contract metadata.
 */
export interface ContractMetadata {
  name: string;
  contractName: string;
  sourceFile: string;
  layer: number;
  category: string;
  hasTimeTravel: boolean;
  roles: RoleDefinition[];
  resolverKey?: { name: string; value: string };
  methods: MethodDefinition[];
  events: EventDefinition[];
  errors: ErrorDefinition[];
  imports: string[];
  inheritance: string[];
  solidityVersion: string | null;
  upgradeable: boolean;
  description?: string;
}

/**
 * Configuration for registry generation pipeline.
 */
export interface RegistryConfig {
  /** Path to contracts directory (required) */
  contractsPath: string;
  /** Path to artifacts directory (required) */
  artifactPath: string;
  /** Glob patterns to include */
  includePaths?: string[];
  /** Glob patterns to exclude */
  excludePaths?: string[];
  /** Paths to search for resolver keys */
  resolverKeyPaths?: string[];
  /** Paths to search for roles */
  rolesPaths?: string[];
  /** Include storage wrappers in registry */
  includeStorageWrappers?: boolean;
  /** Include TimeTravel variant pairing */
  includeTimeTravel?: boolean;
  /** Extract natspec descriptions from contracts */
  extractNatspec?: boolean;
  /** Output file path */
  outputPath?: string;
  /** Module name for imports in generated code */
  moduleName?: string;
  /** TypeChain factory import path */
  typechainModuleName?: string;
  /** Path to TypeChain generated types directory (for factory existence checks) */
  typechainPath?: string;
  /** Logging level */
  logLevel?: "DEBUG" | "INFO" | "WARN" | "ERROR" | "SILENT";
  /** Only generate facets, skip infrastructure contracts */
  facetsOnly?: boolean;
  /** Include mock contracts in registry generation */
  includeMocksInRegistry?: boolean;
  /** Glob patterns to find mock contracts */
  mockContractPaths?: string[];
  /** Use caching for incremental updates */
  useCache?: boolean;
  /** Custom cache directory */
  cacheDir?: string;
}

/**
 * Statistics from registry generation.
 */
export interface RegistryStats {
  totalFacets: number;
  totalInfrastructure: number;
  totalStorageWrappers: number;
  totalMocks: number;
  totalRoles: number;
  totalResolverKeys: number;
  withTimeTravel: number;
  withRoles: number;
  byCategory: Record<string, number>;
  byLayer: Record<number, number>;
  generatedLines: number;
  durationMs: number;
  cacheHits?: number;
  cacheMisses?: number;
}

/**
 * Result from registry generation pipeline.
 */
export interface RegistryResult {
  code: string;
  stats: RegistryStats;
  outputPath?: string;
  warnings: string[];
}

/**
 * Cache entry for a single contract file.
 */
export interface CacheEntry {
  /** File path */
  filePath: string;
  /** SHA-256 hash of file content */
  fileHash: string;
  /** Extracted metadata */
  metadata: ContractMetadata;
  /** Timestamp when entry was created */
  timestamp: number;
}

/**
 * Registry cache structure.
 */
export interface RegistryCache {
  version: string;
  created: number;
  entries: Record<string, CacheEntry>;
}
