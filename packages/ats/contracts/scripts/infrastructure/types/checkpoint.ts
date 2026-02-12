// SPDX-License-Identifier: Apache-2.0

/**
 * Checkpoint types for deployment resumability.
 *
 * These types enable saving and resuming deployment state at granular steps,
 * allowing automatic recovery from failures without re-deploying completed contracts.
 *
 * @module infrastructure/types/checkpoint
 */

/**
 * Current checkpoint schema version.
 *
 * Increment this when making breaking changes to checkpoint structure.
 * CheckpointManager will validate and migrate older schemas.
 *
 * Version History:
 * - v1: Initial schema (implicit, pre-versioning)
 * - v2: Added schemaVersion field for forward compatibility
 */
export const CHECKPOINT_SCHEMA_VERSION = 2;

/**
 * Deployed contract information for checkpoint tracking.
 */
export interface DeployedContract {
  /** Contract address */
  address: string;

  /** Hedera Contract ID (if deployed on Hedera network) */
  contractId?: string;

  /** Transaction hash of deployment */
  txHash: string;

  /** Gas used for deployment */
  gasUsed?: string;

  /** Deployment timestamp (ISO 8601) */
  deployedAt: string;
}

/**
 * Configuration creation result for checkpoint tracking.
 */
export interface ConfigurationResult {
  /** Configuration ID (bytes32) */
  configId: string;

  /** Configuration version number */
  version: number;

  /** Number of facets in configuration */
  facetCount: number;

  /** Transaction hash of configuration creation */
  txHash: string;

  /** Gas used for configuration */
  gasUsed?: string;
}

/**
 * Checkpoint status values.
 */
export type CheckpointStatus = "in-progress" | "completed" | "failed";

/**
 * Core ATS workflow types.
 *
 * These are the official workflows provided by ATS.
 * Downstream projects can extend WorkflowType with custom workflows.
 */
export type AtsWorkflowType = "newBlr" | "existingBlr" | "upgradeConfigurations" | "upgradeTupProxies";

/**
 * Extensible workflow type for checkpoint tracking.
 *
 * Allows downstream projects to add custom workflows while preserving
 * autocomplete for core ATS workflows.
 *
 * @example Extending with custom workflows
 * ```typescript
 * // In downstream project (e.g., GBP)
 * import type { AtsWorkflowType } from '@hashgraph/asset-tokenization-contracts/scripts'
 *
 * type GbpWorkflowType = AtsWorkflowType | 'gbpInfrastructure' | 'gbpUpgrade'
 *
 * await saveDeploymentOutput({
 *   network: 'hedera-testnet',
 *   workflow: 'gbpInfrastructure',  // No type assertion needed
 *   data: output
 * })
 * ```
 */
export type WorkflowType = AtsWorkflowType | string;

/**
 * Deployment checkpoint for state tracking and resumability.
 *
 * Checkpoints are saved after each major deployment step, enabling
 * automatic resume from the exact point of failure.
 */
export interface DeploymentCheckpoint {
  // ============================================================================
  // Schema Version (for forward compatibility)
  // ============================================================================

  /**
   * Schema version for forward compatibility.
   *
   * Used to detect and migrate older checkpoint formats.
   * If undefined, treated as v1 (legacy pre-versioned checkpoint).
   */
  schemaVersion?: number;

  // ============================================================================
  // Identity
  // ============================================================================

  /** Unique checkpoint ID (timestamp-based) */
  checkpointId: string;

  /** Network name (hedera-testnet, hedera-mainnet, etc.) */
  network: string;

  /** Address of deployer */
  deployer: string;

  // ============================================================================
  // Status Tracking
  // ============================================================================

  /** Current checkpoint status */
  status: CheckpointStatus;

  /** Current step number (0-indexed) */
  currentStep: number;

  /** Workflow type */
  workflowType: WorkflowType;

  // ============================================================================
  // Metadata
  // ============================================================================

  /** Deployment start time (ISO 8601) */
  startTime: string;

  /** Last checkpoint update time (ISO 8601) */
  lastUpdate: string;

  // ============================================================================
  // Deployment State (incremental tracking)
  // ============================================================================

  steps: {
    /** ProxyAdmin deployment (step 0) */
    proxyAdmin?: DeployedContract;

    /** BLR deployment (step 1) */
    blr?: DeployedContract & {
      /** Implementation address */
      implementation: string;
      /** Hedera Contract ID for implementation (if deployed on Hedera network) */
      implementationContractId?: string;
      /** Proxy address */
      proxy: string;
      /** Hedera Contract ID for proxy (if deployed on Hedera network) */
      proxyContractId?: string;
      /** Whether BLR is external (existingBlr workflow) */
      isExternal?: boolean;
    };

    /**
     * Facets deployment (step 2) - INCREMENTAL
     * Saved after EACH facet deployment for fine-grained resumability
     */
    facets?: Map<string, DeployedContract>;

    /** Facets registered in BLR (step 3) */
    facetsRegistered?: boolean;

    /** Configurations (steps 4-5) */
    configurations?: {
      /** Equity configuration */
      equity?: ConfigurationResult;
      /** Bond configuration */
      bond?: ConfigurationResult;
      /** Bond Fixed Rate configuration */
      bondFixedRate?: ConfigurationResult;
      /** Bond KpiLinked Rate configuration */
      bondKpiLinkedRate?: ConfigurationResult;
      /** Bond Sustainability Performance Target Rate configuration */
      bondSustainabilityPerformanceTargetRate?: ConfigurationResult;
    };

    /** Factory deployment (step 6) */
    factory?: DeployedContract & {
      /** Implementation address */
      implementation: string;
      /** Hedera Contract ID for implementation (if deployed on Hedera network) */
      implementationContractId?: string;
      /** Proxy address */
      proxy: string;
      /** Hedera Contract ID for proxy (if deployed on Hedera network) */
      proxyContractId?: string;
    };

    /**
     * Proxy updates tracking (upgradeConfigurations workflow)
     * Tracks which ResolverProxies have been updated to the new version
     */
    proxyUpdates?: Map<
      string,
      {
        /** Whether update succeeded */
        success: boolean;
        /** Transaction hash of update */
        transactionHash?: string;
        /** Error message if failed */
        error?: string;
        /** Previous version before update */
        previousVersion?: number;
        /** New version after update */
        newVersion?: number;
      }
    >;
  };

  // ============================================================================
  // Options Preservation (for resume)
  // ============================================================================

  /** Original deployment options */
  options: {
    useTimeTravel?: boolean;
    confirmations?: number;
    enableRetry?: boolean;
    verifyDeployment?: boolean;
    saveOutput?: boolean;
    outputPath?: string;
    partialBatchDeploy?: boolean;
    /** Number of facets per batch (default: DEFAULT_BATCH_SIZE) */
    batchSize?: number;

    // existingBlr workflow options
    deployFacets?: boolean;
    deployFactory?: boolean;
    createConfigurations?: boolean;
    existingProxyAdminAddress?: string;

    // upgradeConfigurations workflow options
    /** BLR address for upgrade workflow */
    blrAddress?: string;
    /** Which configurations to upgrade: 'equity', 'bond', or 'both' */
    configurations?: "equity" | "bond" | "both";
    /** Proxy addresses to update after configuration upgrade */
    proxyAddresses?: string[];
  };

  // ============================================================================
  // Failure Information (if status='failed')
  // ============================================================================

  failure?: {
    /** Step number where failure occurred */
    step: number;

    /** Step name (human-readable) */
    stepName: string;

    /** Error message */
    error: string;

    /** Failure timestamp (ISO 8601) */
    timestamp: string;

    /** Stack trace (optional) */
    stackTrace?: string;
  };
}

/**
 * Options for resuming deployments from checkpoints.
 */
export interface ResumeOptions {
  /**
   * Explicit checkpoint ID to resume from.
   * Overrides auto-detection.
   *
   * @example 'hedera-testnet-1731085200000'
   */
  resumeFrom?: string;

  /**
   * Automatically resume incomplete deployments if detected.
   * - In interactive mode (TTY): prompts user for confirmation
   * - In CI/non-interactive mode: auto-resumes without prompt
   *
   * @default true
   */
  autoResume?: boolean;

  /**
   * Force fresh deployment, ignore checkpoints.
   * Useful when you want to start clean despite incomplete deployments.
   *
   * @default false
   */
  ignoreCheckpoint?: boolean;

  /**
   * Delete checkpoint after successful completion.
   * Set to true for CI environments to avoid checkpoint accumulation.
   *
   * @default false (keep for historical reference)
   */
  deleteOnSuccess?: boolean;

  /**
   * Custom checkpoint directory path.
   *
   * By default, checkpoints are saved in node_modules which gets wiped on npm install/ci.
   * Specify a persistent directory to preserve checkpoints across installations.
   *
   * Recommended: './deployments/.checkpoints' at project root (not inside node_modules)
   *
   * ⚠️ WARNING: Directories inside node_modules will be deleted on npm install.
   *
   * @default '{cwd}/deployments/{network}/.checkpoints'
   * @example './deployments/.checkpoints'
   * @example '/tmp/ats-deployments/.checkpoints'
   */
  checkpointDir?: string;
}

// ============================================================================
// Type Guards
// ============================================================================

import type { SaveResult } from "./core";

/**
 * Type guard for SaveResult success case.
 *
 * Enables type narrowing for discriminated union results.
 *
 * @param result - Save result to check
 * @returns True if result is success case
 *
 * @example
 * ```typescript
 * import { saveDeploymentOutput, isSaveSuccess } from '@hashgraph/asset-tokenization-contracts/scripts'
 *
 * const result = await saveDeploymentOutput(options)
 *
 * if (isSaveSuccess(result)) {
 *   console.log(`Saved to: ${result.filepath}`)
 * } else {
 *   console.error(`Failed: ${result.error}`)
 * }
 * ```
 */
export function isSaveSuccess(result: SaveResult): result is { success: true; filepath: string; filename: string } {
  return result.success === true;
}

/**
 * Type guard for SaveResult failure case.
 *
 * Enables type narrowing for discriminated union results.
 *
 * @param result - Save result to check
 * @returns True if result is failure case
 *
 * @example
 * ```typescript
 * import { saveDeploymentOutput, isSaveFailure } from '@hashgraph/asset-tokenization-contracts/scripts'
 *
 * const result = await saveDeploymentOutput(options)
 *
 * if (isSaveFailure(result)) {
 *   console.error(`Save failed: ${result.error}`)
 * }
 * ```
 */
export function isSaveFailure(result: SaveResult): result is { success: false; error: string } {
  return result.success === false;
}

/**
 * Type guard for ATS core workflow types.
 *
 * Checks if a workflow string is one of the official ATS workflows.
 *
 * @param workflow - Workflow string to check
 * @returns True if workflow is a core ATS workflow
 *
 * @example
 * ```typescript
 * import { isAtsWorkflow } from '@hashgraph/asset-tokenization-contracts/scripts'
 *
 * if (isAtsWorkflow('newBlr')) {
 *   console.log('Core ATS workflow')
 * }
 *
 * if (!isAtsWorkflow('customWorkflow')) {
 *   console.log('Custom downstream workflow')
 * }
 * ```
 */
export function isAtsWorkflow(workflow: string): workflow is AtsWorkflowType {
  return ["newBlr", "existingBlr", "upgradeConfigurations", "upgradeTupProxies"].includes(workflow);
}
