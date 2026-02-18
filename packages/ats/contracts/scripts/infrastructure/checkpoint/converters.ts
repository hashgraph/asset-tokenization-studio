// SPDX-License-Identifier: Apache-2.0

/**
 * Type converters for checkpoint resumability.
 *
 * Converts simplified checkpoint types (optimized for JSON serialization)
 * to full operation result types (used by workflow files).
 *
 * These converters enable resuming deployments from checkpoints by reconstructing
 * the full operation result objects that workflows expect, filling in missing
 * fields with sensible defaults or placeholder values.
 *
 * @module infrastructure/checkpoint/converters
 *
 * @example
 * ```typescript
 * import { CheckpointManager } from '@scripts/infrastructure'
 * import {
 *   toDeploymentResult,
 *   toDeployBlrResult,
 *   toConfigurationData,
 *   convertCheckpointFacets
 * } from '@scripts/infrastructure/checkpoint/converters'
 *
 * const manager = new CheckpointManager()
 * const checkpoint = await manager.loadCheckpoint(checkpointId)
 *
 * if (checkpoint?.steps.blr) {
 *   const blrResult = toDeployBlrResult(checkpoint.steps.blr)
 *   // Now use blrResult in workflow logic
 * }
 *
 * if (checkpoint?.steps.facets) {
 *   const facetsMap = convertCheckpointFacets(checkpoint.steps.facets)
 *   // Map<string, DeploymentResult> ready for workflow
 * }
 * ```
 */

import type { Contract } from "ethers";
import type { DeploymentResult, OperationResult } from "@scripts/infrastructure";
import type { DeployedContract, ConfigurationResult, DeploymentCheckpoint } from "@scripts/infrastructure";
import type { DeployBlrResult } from "@scripts/infrastructure";
import type { DeployProxyResult } from "@scripts/infrastructure";
import type { DeployResolverProxyResult } from "@scripts/infrastructure";
import type { ConfigurationData } from "@scripts/infrastructure";

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a result is successful.
 *
 * Useful for filtering and type narrowing in checkpoint recovery logic.
 *
 * @template T - Success data type
 * @template E - Error code type
 * @param result - Operation result to check
 * @returns true if result.success is true
 *
 * @example
 * ```typescript
 * const results: OperationResult<unknown>[] = [...]
 * const successful = results.filter(isSuccess)
 * // TypeScript now knows successful contains only success results
 * ```
 */
export function isSuccess<T, E extends string>(
  result: OperationResult<T, E>,
): result is OperationResult<T, E> & { success: true } {
  return result.success === true;
}

/**
 * Type guard to check if a result is a failure.
 *
 * Useful for filtering and type narrowing in checkpoint recovery logic.
 *
 * @template T - Success data type
 * @template E - Error code type
 * @param result - Operation result to check
 * @returns true if result.success is false
 *
 * @example
 * ```typescript
 * const results: OperationResult<unknown>[] = [...]
 * const failures = results.filter(isFailure)
 * // TypeScript now knows failures contains only error results
 * ```
 */
export function isFailure<T, E extends string>(
  result: OperationResult<T, E>,
): result is OperationResult<T, E> & { success: false } {
  return result.success === false;
}

// ============================================================================
// Contract Deployment Converters
// ============================================================================

/**
 * Convert a checkpoint DeployedContract to a DeploymentResult.
 *
 * Reconstructs the full DeploymentResult type from the simplified checkpoint
 * data. The contract instance field is set to a placeholder object since
 * the actual contract is not persisted in checkpoints.
 *
 * **Data Mapping:**
 * - `address` → `address`
 * - `txHash` → `transactionHash`
 * - `gasUsed` → `gasUsed` (parsed from string if present)
 * - Missing fields:
 *   - `contract`: Placeholder object (actual instance not available from checkpoint)
 *   - `blockNumber`: 0 (not persisted in checkpoint)
 *
 * @param deployed - Checkpoint deployed contract data
 * @returns Full DeploymentResult for workflow use
 *
 * @example
 * ```typescript
 * const checkpoint = await manager.loadCheckpoint(checkpointId)
 * if (checkpoint?.steps.proxyAdmin) {
 *   const result = toDeploymentResult(checkpoint.steps.proxyAdmin)
 *   // result.success = true
 *   // result.address = checkpoint.steps.proxyAdmin.address
 *   // result.transactionHash = checkpoint.steps.proxyAdmin.txHash
 * }
 * ```
 */
export function toDeploymentResult(deployed: DeployedContract): DeploymentResult {
  return {
    success: true,
    address: deployed.address,
    transactionHash: deployed.txHash,
    blockNumber: 0, // TODO: Not persisted in checkpoint, would need enhanced DeployedContract type
    gasUsed: deployed.gasUsed ? parseInt(deployed.gasUsed, 10) : undefined,
    // TODO: contract is not available from checkpoint data
    // The actual Contract instance would need to be reconnected separately
    contract: {
      address: deployed.address,
    } as unknown as Contract,
  };
}

/**
 * Convert a checkpoint BLR deployment to a full DeployBlrResult.
 *
 * Reconstructs the DeployBlrResult including the nested DeployProxyResult.
 * The BLR checkpoint stores proxy and implementation addresses separately,
 * which are mapped to the DeployProxyResult structure expected by workflows.
 *
 * **Data Mapping:**
 * - `proxy` → `proxyAddress`
 * - `implementation` → `implementationAddress`
 * - `address` → `proxyAdminAddress` (assumed to be ProxyAdmin based on context)
 * - `isExternal` flag preserved for workflow differentiation
 *
 * **Missing Fields:**
 * - `contract`: Placeholder contract object
 * - `receipt`: null (not persisted)
 * - `blockNumber`: 0 (not persisted)
 * - `gasUsed`: undefined (not persisted)
 *
 * @param blrCheckpoint - BLR-specific checkpoint data
 * @param proxyAdminAddress - Optional ProxyAdmin address override
 * @returns Full DeployBlrResult for workflow use
 *
 * @example
 * ```typescript
 * const checkpoint = await manager.loadCheckpoint(checkpointId)
 * if (checkpoint?.steps.blr) {
 *   const blrResult = toDeployBlrResult(
 *     checkpoint.steps.blr,
 *     checkpoint.steps.proxyAdmin?.address
 *   )
 *   // Use blrResult in configuration workflows
 * }
 * ```
 */
export function toDeployBlrResult(
  blrCheckpoint: DeployedContract & {
    implementation: string;
    proxy: string;
    isExternal?: boolean;
  },
  proxyAdminAddress?: string,
): DeployBlrResult {
  const proxyResult: DeployProxyResult = {
    // TODO: These are minimal reconstructions - actual instances not available from checkpoint
    implementation: {
      address: blrCheckpoint.implementation,
    } as unknown as Contract,
    implementationAddress: blrCheckpoint.implementation,
    proxy: {
      address: blrCheckpoint.proxy,
    } as any,
    proxyAddress: blrCheckpoint.proxy,
    proxyAdmin: {
      address: proxyAdminAddress || blrCheckpoint.address,
    } as any,
    proxyAdminAddress: proxyAdminAddress || blrCheckpoint.address,
    receipts: {
      // TODO: Receipts not persisted in checkpoint
    },
  };

  return {
    success: true,
    proxyResult,
    blrAddress: blrCheckpoint.proxy,
    implementationAddress: blrCheckpoint.implementation,
    proxyAdminAddress: proxyAdminAddress || blrCheckpoint.address,
    initialized: true, // TODO: Not persisted, assume initialized if checkpoint saved
  };
}

/**
 * Convert a checkpoint Factory deployment to a full DeployResolverProxyResult.
 *
 * Reconstructs the DeployResolverProxyResult from simplified checkpoint data.
 * Maps the Factory's proxy and implementation addresses to the result structure.
 *
 * **Data Mapping:**
 * - `proxy` → `proxyAddress`
 * - `implementation` → implementation data (used for logging/reference)
 * - `address` → proxy address (from context)
 *
 * **Missing Fields:**
 * - `contract`: Placeholder contract object
 * - `receipt`: null (not persisted)
 * - `blockNumber`: 0 (not persisted)
 * - `configurationId`: undefined (not persisted)
 * - `version`: undefined (not persisted)
 *
 * @param factoryCheckpoint - Factory-specific checkpoint data
 * @returns Full DeployResolverProxyResult for workflow use
 *
 * @example
 * ```typescript
 * const checkpoint = await manager.loadCheckpoint(checkpointId)
 * if (checkpoint?.steps.factory) {
 *   const factoryResult = toDeployFactoryResult(checkpoint.steps.factory)
 *   // Use in downstream workflows
 * }
 * ```
 */
export function toDeployFactoryResult(
  factoryCheckpoint: DeployedContract & {
    implementation: string;
    proxy: string;
  },
): DeployResolverProxyResult {
  return {
    success: true,
    proxyAddress: factoryCheckpoint.proxy,
    // TODO: contract not available from checkpoint
    contract: {
      address: factoryCheckpoint.proxy,
    } as unknown as Contract,
    // TODO: receipt not persisted in checkpoint
    receipt: undefined,
    // TODO: Configuration metadata not persisted in checkpoint
    configurationId: undefined,
    version: undefined,
  };
}

// ============================================================================
// Configuration Converters
// ============================================================================

/**
 * Convert a checkpoint ConfigurationResult to full ConfigurationData.
 *
 * Reconstructs the OperationResult<ConfigurationData> from simplified checkpoint
 * data. Maps configuration metadata from checkpoint to the full structure.
 *
 * **Data Mapping:**
 * - `configId` → `configurationId`
 * - `version` → `version`
 * - `txHash` → `transactionHash`
 * - `gasUsed` → included in return (parsed from string)
 *
 * **Missing Fields:**
 * - `facetKeys`: Empty array (details not persisted in checkpoint)
 * - `blockNumber`: 0 (not persisted)
 *
 * **TODO: Data Loss**
 * - Facet details (names, addresses) not persisted in ConfigurationResult
 * - This affects the complete facetKeys array, which is empty on resume
 * - Could enhance checkpoint structure to persist this data if needed
 *
 * @param configCheckpoint - Configuration checkpoint data
 * @returns OperationResult with full ConfigurationData
 *
 * @example
 * ```typescript
 * const checkpoint = await manager.loadCheckpoint(checkpointId)
 * if (checkpoint?.steps.configurations?.equity) {
 *   const result = toConfigurationData(checkpoint.steps.configurations.equity)
 *   if (result.success) {
 *     console.log(`Config ${result.data.configurationId} version ${result.data.version}`)
 *   }
 * }
 * ```
 */
export function toConfigurationData(configCheckpoint: ConfigurationResult): OperationResult<ConfigurationData, never> {
  return {
    success: true,
    data: {
      configurationId: configCheckpoint.configId,
      version: configCheckpoint.version,
      facetKeys: [], // TODO: Facet details not persisted in checkpoint - empty on resume
      transactionHash: configCheckpoint.txHash,
      blockNumber: 0, // TODO: Not persisted
    },
  };
}

// ============================================================================
// Map Conversion Helpers
// ============================================================================

/**
 * Convert a checkpoint facets Map to a Map of DeploymentResults.
 *
 * Maps the simplified checkpoint facet data to full DeploymentResult objects.
 * Preserves the Map structure and facet names as keys.
 *
 * Each facet is converted using toDeploymentResult, which reconstructs
 * the full structure from checkpoint data.
 *
 * @param checkpointFacets - Map of facet names to DeployedContract checkpoints
 * @returns Map of facet names to full DeploymentResults
 *
 * @example
 * ```typescript
 * const checkpoint = await manager.loadCheckpoint(checkpointId)
 * if (checkpoint?.steps.facets) {
 *   const facetResults = convertCheckpointFacets(checkpoint.steps.facets)
 *   // Map<string, DeploymentResult> ready for workflow use
 *   facetResults.forEach((result, facetName) => {
 *     console.log(`${facetName}: ${result.address}`)
 *   })
 * }
 * ```
 */
export function convertCheckpointFacets(
  checkpointFacets: Map<string, DeployedContract>,
): Map<string, DeploymentResult> {
  const results = new Map<string, DeploymentResult>();

  checkpointFacets.forEach((deployed, facetName) => {
    results.set(facetName, toDeploymentResult(deployed));
  });

  return results;
}

// ============================================================================
// Checkpoint Recovery Helpers
// ============================================================================

/**
 * Extract deployment results from a complete checkpoint.
 *
 * Convenience function that converts all checkpoint deployment data to
 * operation results in a single call. Returns undefined for steps that
 * are not present in the checkpoint.
 *
 * Useful for recovery workflows that need quick access to all deployment data.
 *
 * @param checkpoint - Deployment checkpoint to extract from
 * @returns Object with optional results for each deployment step
 *
 * @example
 * ```typescript
 * const checkpoint = await manager.loadCheckpoint(checkpointId)
 * const recovered = extractCheckpointResults(checkpoint)
 *
 * if (recovered.proxyAdmin) {
 *   console.log(`ProxyAdmin at ${recovered.proxyAdmin.address}`)
 * }
 * if (recovered.blr) {
 *   console.log(`BLR at ${recovered.blr.blrAddress}`)
 * }
 * if (recovered.facets) {
 *   recovered.facets.forEach((result, name) => {
 *     console.log(`${name}: ${result.address}`)
 *   })
 * }
 * ```
 */
export function extractCheckpointResults(checkpoint: DeploymentCheckpoint) {
  return {
    proxyAdmin: checkpoint.steps.proxyAdmin ? toDeploymentResult(checkpoint.steps.proxyAdmin) : undefined,
    blr: checkpoint.steps.blr ? toDeployBlrResult(checkpoint.steps.blr) : undefined,
    facets: checkpoint.steps.facets ? convertCheckpointFacets(checkpoint.steps.facets) : undefined,
    factory: checkpoint.steps.factory ? toDeployFactoryResult(checkpoint.steps.factory) : undefined,
    configurations: checkpoint.steps.configurations
      ? {
          equity: checkpoint.steps.configurations.equity
            ? toConfigurationData(checkpoint.steps.configurations.equity)
            : undefined,
          bond: checkpoint.steps.configurations.bond
            ? toConfigurationData(checkpoint.steps.configurations.bond)
            : undefined,
        }
      : undefined,
  };
}

// ============================================================================
// Data Loss Documentation
// ============================================================================

/**
 * CHECKPOINT RECOVERY - DATA LOSS ANALYSIS
 *
 * When resuming from a checkpoint, certain fields are not available because
 * they are not persisted in the checkpoint data structure. This analysis
 * documents what data is lost and reasonable default strategies.
 *
 * **ALWAYS AVAILABLE (from checkpoint):**
 * - address/proxy address
 * - transactionHash (txHash)
 * - gasUsed (if set by operation)
 * - configurationId, version (for configurations)
 *
 * **NOT AVAILABLE (set to defaults):**
 * - contract: Placeholder Contract object with address (actual instance lost)
 * - blockNumber: Set to 0 (not persisted - could enhance checkpoint if needed)
 * - receipt: Set to null (not persisted - could enhance if needed for verification)
 * - facetKeys[].details: Empty array (facet names/addresses lost)
 *
 * **WORKAROUND STRATEGIES:**
 * 1. If actual contract instances needed: Reconnect using ContractFactory
 *    ```typescript
 *    const blr = BusinessLogicResolver__factory.connect(blrAddress, signer)
 *    ```
 *
 * 2. If facet details needed: Reconstruct from operations
 *    ```typescript
 *    const facets = await Promise.all(
 *      facetNames.map(name => lookupFacetInRegistry(name))
 *    )
 *    ```
 *
 * 3. If blockNumber needed: Query from transaction receipt
 *    ```typescript
 *    const receipt = await provider.getTransactionReceipt(transactionHash)
 *    const blockNumber = receipt.blockNumber
 *    ```
 *
 * **ENHANCEMENT OPTIONS:**
 * If more complete recovery is needed, consider enhancing the checkpoint
 * structure to persist additional fields that are currently lost:
 * - blockNumber (small integer, no storage cost)
 * - facetKeys (already returned, add to checkpoint)
 * - receipt (much larger, only if verification needed on resume)
 */
