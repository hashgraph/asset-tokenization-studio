// SPDX-License-Identifier: Apache-2.0

/**
 * Infrastructure layer exports for smart contract deployment.
 *
 * This module provides generic, domain-agnostic deployment infrastructure
 * that can be used for any smart contract project. It contains no knowledge
 * of ATS-specific concepts (equities, bonds, Factory, etc.).
 *
 * @module infrastructure
 *
 * @example
 * ```typescript
 * // Import from infrastructure layer
 * import {
 *   deployContract,
 *   deployProxy,
 *   deployFacets,
 *   getNetworkConfig,
 *   info,
 *   validateAddress
 * } from '@scripts/infrastructure'
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export type {
  RegistryProvider,
  FacetDefinition,
  ContractDefinition,
  StorageWrapperDefinition,
  NetworkConfig,
  DeploymentResult,
  UpgradeProxyOptions,
  UpgradeProxyResult,
  CreateConfigOptions,
  CreateConfigResult,
  OperationResult,
  SignerOptions,
} from "./types";

export { ok, err, createSigner, createSignerFromEnv } from "./types";

// Checkpoint types
export type {
  DeploymentCheckpoint,
  DeployedContract,
  ConfigurationResult,
  CheckpointStatus,
  WorkflowType,
  ResumeOptions,
} from "./types/checkpoint";

// ============================================================================
// Constants
// ============================================================================

export {
  NETWORKS,
  CHAIN_IDS,
  DEFAULT_ENDPOINTS,
  DEFAULT_GAS_MULTIPLIER,
  DEFAULT_DEPLOYMENT_TIMEOUT,
  DEFAULT_TRANSACTION_TIMEOUT,
  DEFAULT_CONFIRMATIONS,
  MAX_RETRIES,
  RETRY_DELAY,
  DEFAULT_BATCH_SIZE,
  GAS_LIMIT,
  LATEST_VERSION,
  DEFAULT_PARTITION,
  INFRASTRUCTURE_CONTRACT_NAMES,
  PROXY_CONTRACTS,
  ENV_VAR_PATTERNS,
  DEPLOYMENT_OUTPUT_DIR,
  DEPLOYMENT_OUTPUT_PATTERN,
} from "./constants";

export type { Network } from "./constants";

// ============================================================================
// Registry Factory
// ============================================================================

export { createRegistryHelpers } from "./registryFactory";
export {
  combineRegistries,
  getRegistryConflicts,
  type ConflictStrategy,
  type CombineRegistriesOptions,
} from "./combineRegistries";

// ============================================================================
// Configuration
// ============================================================================

export { getNetworkConfig, getAllNetworks } from "./config";

export { getDeploymentConfig, isLocalNetwork, isInstantMiningNetwork, DEPLOYMENT_CONFIGS } from "./networkConfig";
export type { DeploymentConfig } from "./networkConfig";

// ============================================================================
// Operations
// ============================================================================

export { deployContract } from "./operations/deployContract";
export type { DeployContractOptions } from "./operations/deployContract";

export { deployProxy, deployMultipleProxies, getProxyImplementation, getProxyAdmin } from "./operations/deployProxy";
export type { DeployProxyOptions, DeployProxyResult } from "./operations/deployProxy";

export { deployTransparentProxy } from "./operations/transparentProxyDeployment";

export { upgradeProxy, upgradeMultipleProxies, proxyNeedsUpgrade, prepareUpgrade } from "./operations/upgradeProxy";

export { registerFacets, type RegisterFacetsOptions, type RegisterFacetsResult } from "./operations/registerFacets";

export { registerAdditionalFacets, type RegisterAdditionalFacetsOptions } from "./operations/registerAdditionalFacets";

export {
  createBatchConfiguration,
  type FacetConfiguration,
  type CreateBlrConfigurationResult,
  type ConfigurationData,
  type ConfigurationError,
} from "./operations/blrConfigurations";

export { deployBlr, type DeployBlrOptions, type DeployBlrResult } from "./operations/blrDeployment";

export {
  deployProxyAdmin,
  transferProxyAdmin,
  transferProxyAdminOwnership,
  verifyProxyAdminControls,
} from "./operations/proxyAdminDeployment";

export { deployFacets, type DeployFacetsOptions, type DeployFacetsResult } from "./operations/facetDeployment";

export {
  deployResolverProxy,
  type DeployResolverProxyOptions,
  type DeployResolverProxyResult,
  type ResolverProxyRbac,
} from "./operations/deployResolverProxy";

export {
  ResolverProxyUpdateType,
  ResolverProxyUpdateOptions,
  updateResolverProxyVersion,
  updateResolverProxyConfig,
  updateResolverProxyResolver,
  getResolverProxyConfigInfo,
  type UpdateResolverProxyVersionOptions,
  type UpdateResolverProxyConfigOptions,
  type UpdateResolverProxyResolverOptions,
  type UpdateResolverProxyConfigResult,
  type ResolverProxyConfigInfo,
} from "./operations/updateResolverProxyConfig";

export {
  generateRegistryPipeline,
  DEFAULT_REGISTRY_CONFIG,
  type RegistryGenerationConfig,
  type RegistryGenerationStats,
  type RegistryGenerationResult,
} from "./operations/generateRegistryPipeline";

// ============================================================================
// Utilities
// ============================================================================

export { validateAddress, validateBytes32 } from "./utils/validation";

export { loadDeployment, findLatestDeployment, listDeploymentFiles } from "./utils/deploymentFiles";

export {
  waitForTransaction,
  extractRevertReason,
  getGasPrice,
  estimateGasLimit,
  formatGasUsage,
  retryTransaction,
  isNonceTooLowError,
  isGasError,
  isNetworkError,
  DEFAULT_TRANSACTION_CONFIRMATIONS,
  DEFAULT_RETRY_OPTIONS,
} from "./utils/transaction";

export type { RetryOptions } from "./utils/transaction";

export {
  verifyContractCode,
  verifyContractInterface,
  verifyContract,
  DEFAULT_VERIFICATION_OPTIONS,
} from "./utils/verification";

export type { VerificationOptions, VerificationResult } from "./utils/verification";

export { info, success, error, warn, section, debug, table, configureLogger, LogLevel } from "./utils/logging";
export type { LoggerConfig } from "./utils/logging";

export {
  resolveContractName,
  getTimeTravelVariant,
  hasTimeTravelVariant,
  getBaseContractName,
  isTimeTravelVariant,
} from "./utils/naming";

export { fetchHederaContractId, getMirrorNodeUrl, isHederaNetwork } from "./utils/hedera";

export { getSelector } from "./utils/selector";

// ============================================================================
// Checkpoint System
// ============================================================================

export { CheckpointManager } from "./checkpoint/CheckpointManager";
export { NullCheckpointManager } from "./checkpoint/NullCheckpointManager";
export type { CreateCheckpointParams } from "./checkpoint/CheckpointManager";

export {
  checkpointToDeploymentOutput,
  getStepName,
  getTotalSteps,
  formatCheckpointStatus,
  formatDuration,
  formatTimestamp,
} from "./checkpoint/utils";

// Checkpoint converters for resumability
export {
  toDeploymentResult,
  toDeployBlrResult,
  toDeployFactoryResult,
  toConfigurationData,
  convertCheckpointFacets,
  extractCheckpointResults,
  isSuccess,
  isFailure,
} from "./checkpoint/converters";
