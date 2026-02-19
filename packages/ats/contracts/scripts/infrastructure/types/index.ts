// SPDX-License-Identifier: Apache-2.0

/**
 * Unified type exports for infrastructure layer.
 *
 * This module re-exports all types from the types/ folder, providing a single
 * entry point for type imports.
 *
 * @module infrastructure/types
 *
 * @example
 * ```typescript
 * // Import from types barrel
 * import { OperationResult, ConfigurationData, DeploymentCheckpoint } from '@scripts/infrastructure/types'
 *
 * // Or through infrastructure barrel (recommended)
 * import { OperationResult, ConfigurationData, DeploymentCheckpoint } from '@scripts/infrastructure'
 * ```
 */

// ============================================================================
// Core Types
// ============================================================================

export type {
  MethodDefinition,
  EventDefinition,
  ErrorDefinition,
  FacetDefinition,
  RegistryProvider,
  ContractDefinition,
  StorageWrapperDefinition,
  NetworkConfig,
  DeploymentResult,
  UpgradeProxyOptions,
  UpgradeProxyResult,
  OperationResult,
  DeepPartial,
  SignerOptions,
  FacetMetadata,
  ConfigurationMetadata,
  ProxyUpdateMetadata,
  DeployedContractMetadata,
  DeploymentOutputType,
  DeploymentWithExistingBlrOutputType,
  UpgradeConfigurationsOutputType,
  UpgradeTupProxiesOutputType,
  AnyDeploymentOutput,
  SaveDeploymentOptions,
  SaveResult,
  LoadDeploymentOptions,
} from "./core";

export { ok, err, createSigner, createSignerFromEnv } from "./core";

// ============================================================================
// Checkpoint Types
// ============================================================================

export type {
  DeployedContract,
  ConfigurationResult,
  CheckpointStatus,
  AtsWorkflowType,
  WorkflowType,
  DeploymentCheckpoint,
  ResumeOptions,
} from "./checkpoint";

export { isSaveSuccess, isSaveFailure, isAtsWorkflow, CHECKPOINT_SCHEMA_VERSION } from "./checkpoint";

// ============================================================================
// BLR Configuration Types
// ============================================================================

export type {
  FacetConfiguration,
  BatchFacetConfiguration,
  CreateBlrConfigurationResult,
  ConfigurationError,
  ConfigurationData,
  FacetConfigurationData,
} from "./blr";
