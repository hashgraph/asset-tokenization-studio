// SPDX-License-Identifier: Apache-2.0

/**
 * Main entry point for ATS contracts deployment scripts.
 *
 * This module provides a comprehensive, framework-agnostic deployment system
 * for the Asset Tokenization Studio smart contracts.
 *
 * @module scripts
 *
 * @example
 * ```typescript
 * // Import everything
 * import * as ats from '@hashgraph/asset-tokenization-contracts/scripts'
 *
 * // Import specific modules
 * import {
 *   deploySystemWithNewBlr,
 *   deployFacets,
 *   createEquityConfiguration
 * } from '@hashgraph/asset-tokenization-contracts/scripts'
 *
 * // Import types
 * import type {
 *   DeploymentOutput,
 *   DeploymentResult
 * } from '@hashgraph/asset-tokenization-contracts/scripts'
 * ```
 */

// ========================================
// Infrastructure (Generic, Reusable)
// ========================================

// Infrastructure types and core
export * from "./infrastructure/types";
export * from "./infrastructure/registryFactory";
export * from "./infrastructure/combineRegistries";
export * from "./infrastructure/config";
export * from "./infrastructure/constants";
export * from "./infrastructure/networkConfig";

// Infrastructure operations
export * from "./infrastructure/operations/deployContract";
export * from "./infrastructure/operations/deployProxy";
export * from "./infrastructure/operations/transparentProxyDeployment";
export * from "./infrastructure/operations/upgradeProxy";
export * from "./infrastructure/operations/registerFacets";
export * from "./infrastructure/operations/registerAdditionalFacets";
export * from "./infrastructure/operations/blrConfigurations";
export * from "./infrastructure/operations/blrDeployment";
export * from "./infrastructure/operations/proxyAdminDeployment";
export * from "./infrastructure/operations/facetDeployment";
export * from "./infrastructure/operations/deployResolverProxy";
export * from "./infrastructure/operations/updateResolverProxyConfig";
// NOTE: generateRegistryPipeline moved to standalone module (./tools/registry-generator/)

// Infrastructure paths
export {
  getDeploymentsDir,
  getCheckpointsDir,
  getTestCheckpointsDir,
  getTestDeploymentsDir,
} from "./infrastructure/paths";

// Infrastructure utilities
export * from "./infrastructure/utils/validation";
export * from "./infrastructure/utils/deploymentFiles";
export * from "./infrastructure/utils/verification";
export * from "./infrastructure/utils/transaction";
export * from "./infrastructure/utils/logging";
export * from "./infrastructure/utils/naming";
export * from "./infrastructure/utils/hedera";
export * from "./infrastructure/utils/selector";
export * from "./infrastructure/utils/time";

// Infrastructure checkpoint system (deployment resumability)
export type {
  DeploymentCheckpoint,
  DeployedContract,
  ConfigurationResult,
  CheckpointStatus,
  WorkflowType,
  AtsWorkflowType,
  ResumeOptions,
} from "./infrastructure/types/checkpoint";
export { isSaveSuccess, isSaveFailure, isAtsWorkflow } from "./infrastructure/types/checkpoint";
export { CheckpointManager } from "./infrastructure/checkpoint/CheckpointManager";
export { NullCheckpointManager } from "./infrastructure/checkpoint/NullCheckpointManager";
export type { CreateCheckpointParams } from "./infrastructure/checkpoint/CheckpointManager";
export {
  checkpointToDeploymentOutput,
  getStepName,
  getTotalSteps,
  formatCheckpointStatus,
  formatDuration,
  formatTimestamp,
} from "./infrastructure/checkpoint/utils";
export {
  toDeploymentResult,
  toDeployBlrResult,
  toDeployFactoryResult,
  toConfigurationData,
  convertCheckpointFacets,
  extractCheckpointResults,
  isSuccess,
  isFailure,
} from "./infrastructure/checkpoint/converters";

// ========================================
// Domain (ATS-Specific)
// ========================================

// Domain constants
export * from "./domain/constants";

// Domain registry (ATS-specific contract registry with helpers)
export * from "./domain/atsRegistry";

// Equity configuration
export * from "./domain/equity/createConfiguration";

// Bond configuration
export * from "./domain/bond/createConfiguration";

// Factory deployment
export * from "./domain/factory/deploy";

// Token deployment from factory
export * from "./domain/factory/deployEquityToken";
export * from "./domain/factory/deployBondToken";

// ========================================
// Workflows
// ========================================

// Complete deployment workflows
export * from "./workflows/deploySystemWithNewBlr";
export * from "./workflows/deploySystemWithExistingBlr";
export * from "./workflows/upgradeConfigurations";
export * from "./workflows/upgradeTupProxies";

// ========================================
// Registry Generation Tools (for extending ATS)
// ========================================

// Standalone Registry Generator (Fast, Recommended for downstream projects)
export {
  generateRegistryPipeline,
  DEFAULT_CONFIG,
  CacheManager,
  LogLevel,
  configureLogger,
} from "./tools/registry-generator/exports";

export type { RegistryConfig, RegistryResult, CacheEntry, RegistryCache } from "./tools/registry-generator/exports";

// NOTE: Legacy registryGenerator.ts removed - use the standalone generator above

// Contract scanning
export * from "./tools/scanner/contractFinder";
export * from "./tools/scanner/metadataExtractor";

// Utilities
export * from "./tools/utils/fileUtils";

// Solidity utilities (selective export to avoid conflicts with infrastructure/utils/naming)
export {
  extractContractNames,
  extractRoles,
  extractResolverKeys,
  extractNatspecDescription,
  extractImports,
  isFacetName,
  getBaseName,
  extractSolidityVersion,
  implementsInterface,
  extractInheritance,
  // Note: isTimeTravelVariant already exported from infrastructure/utils/naming
} from "./tools/utils/solidityUtils";
