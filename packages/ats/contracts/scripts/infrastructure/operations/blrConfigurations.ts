// SPDX-License-Identifier: Apache-2.0

/**
 * BLR Configuration operations.
 *
 * Atomic operations for creating and querying configurations in BusinessLogicResolver (BLR)
 * that define which facets are used for different token types.
 *
 * These are generic operations that work with any configuration ID and facet set.
 * Domain-specific configuration creation (equity, bond) is handled by modules.
 *
 * ## Performance Note: Dynamic Imports
 *
 * This file uses dynamic imports (`await import()`) for some `@scripts/infrastructure`
 * modules instead of static imports. This is intentional for parallel test performance.
 *
 * **Why:** The barrel export (`@scripts/infrastructure/index.ts`) re-exports from files
 * that import `@contract-types` (typechain). When Node.js loads the barrel, it eagerly
 * loads ALL re-exported modules, triggering typechain loading (~400 generated files).
 *
 * In parallel tests, each worker loads modules independently:
 * - Static imports: N workers × full module graph = 4x+ slowdown
 * - Dynamic imports: Modules loaded only when functions are called (lazy)
 *
 * **Measured impact:** Static imports caused tests to run in 8+ minutes vs 2 minutes.
 *
 * @see README.md "Troubleshooting > Parallel Tests Running Slowly" for details
 * @module core/operations/blrConfigurations
 */

import { BusinessLogicResolver } from "@contract-types";
import {
  DEFAULT_TRANSACTION_TIMEOUT,
  DEFAULT_BATCH_SIZE,
  OperationResult,
  validateBytes32,
  extractRevertReason,
  info,
  success,
  debug,
  error as logError,
  formatGasUsage,
  waitForTransaction,
  isInstantMiningNetwork,
  hederaGasOverrides,
  warn,
  GAS_LIMIT,
  retryTransaction,
  RetryOptions,
  withNonceReset,
} from "@scripts/infrastructure";

// Types imported from centralized types module
import type { BatchFacetConfiguration, ConfigurationData, ConfigurationError, FacetConfigurationData } from "../types";

/**
 * Get the latest configuration version for a configuration ID.
 *
 * Uses the correct contract method `getLatestVersionByConfiguration` from IDiamondCutManager.
 *
 * @param blr - Typed BusinessLogicResolver contract instance
 * @param configurationId - Configuration ID
 * @returns Latest version number
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@contract-types'
 *
 * const blr = BusinessLogicResolver__factory.connect('0x123...', signer)
 * const version = await getConfigurationVersion(blr, '0x00...01')
 * console.log(`Latest config version: ${version}`)
 * ```
 */
export async function getConfigurationVersion(blr: BusinessLogicResolver, configurationId: string): Promise<number> {
  try {
    validateBytes32(configurationId, "configuration ID");

    const version = await blr.getLatestVersionByConfiguration(configurationId);
    return Number(version);
  } catch (err) {
    logError(`Error getting configuration version: ${extractRevertReason(err)}`);
    throw err;
  }
}

/**
 * Check if a configuration exists in BLR.
 *
 * @param blr - Typed BusinessLogicResolver contract instance
 * @param configurationId - Configuration ID
 * @returns true if configuration exists
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@contract-types'
 *
 * const blr = BusinessLogicResolver__factory.connect('0x123...', signer)
 * const exists = await configurationExists(blr, '0x00...01')
 * ```
 */
export async function configurationExists(blr: BusinessLogicResolver, configurationId: string): Promise<boolean> {
  try {
    const version = await getConfigurationVersion(blr, configurationId);
    return version > 0;
  } catch {
    return false;
  }
}

// ============================================================================
// Batch Processing Functions
// ============================================================================

/**
 * Helper function to create batch facet configurations from IDs and versions.
 *
 * @param facetIdList - Array of facet IDs (keccak256 hashes)
 * @param facetVersionList - Array of facet versions
 * @returns Array of BatchFacetConfiguration objects
 */
function createBatchFacetConfigurations(facetIdList: string[], facetVersionList: number[]): BatchFacetConfiguration[] {
  return facetIdList.map((facetId, index) => ({
    id: facetId,
    version: facetVersionList[index],
  }));
}

/**
 * Process facet lists in batches with support for partial batch deployment.
 *
 * This function takes arrays of facet IDs and versions, splits them into batches,
 * and sends each batch to the BusinessLogicResolver. The partialBatchDeploy flag
 * controls whether this is a partial deployment (where isFinalBatch is always false)
 * or a complete deployment (where the last batch is marked as final).
 *
 * @param configId - Configuration ID for the batch
 * @param facetIdList - Array of facet IDs to process
 * @param facetVersionList - Array of corresponding facet versions
 * @param blrContract - BusinessLogicResolver contract instance
 * @param partialBatchDeploy - If true, all batches are marked as non-final
 * @param batchSize - Number of facets per batch (default: DEFAULT_BATCH_SIZE). Smaller batches = lower gas per transaction.
 * @param gasLimit - Optional gas limit override
 * @param confirmations - Number of confirmations to wait for (default: 0 for test environments)
 * @returns Promise that resolves when all batches are processed
 *
 * @example
 * ```typescript
 * // Use default batch size (DEFAULT_BATCH_SIZE)
 * await processFacetLists(
 *   '0x123...', // config ID
 *   facetIds, // 44 facet IDs
 *   versions, // versions
 *   blrContract, // contract instance
 *   false // complete deployment
 * )
 * // Results in: 3 batches of 15, 15, 14 facets
 *
 * // Override batch size
 * await processFacetLists(
 *   '0x123...', configIds, versions, blrContract, false, 20
 * )
 * // Results in: 3 batches of 20, 20, 4 facets
 * ```
 */
export async function processFacetLists(
  configId: string,
  facetIdList: string[],
  facetVersionList: number[],
  blrContract: BusinessLogicResolver,
  partialBatchDeploy: boolean,
  batchSize: number = DEFAULT_BATCH_SIZE,
  gasLimit?: number,
  confirmations: number = 0,
  retryOptions?: RetryOptions,
): Promise<void> {
  // Get network name for instant mining check
  let networkName = "unknown";
  try {
    const hre = require("hardhat");
    networkName = hre?.network?.name || "unknown";
  } catch {
    // Not in Hardhat context
  }

  // On instant-mining networks, use larger batches but cap at 20 to avoid gas limit issues
  // On real networks, use configured batch size (default 15)
  const MAX_INSTANT_BATCH_SIZE = 20;
  const effectiveBatchSize = isInstantMiningNetwork(networkName)
    ? Math.min(facetIdList.length, MAX_INSTANT_BATCH_SIZE)
    : batchSize;

  if (facetIdList.length !== facetVersionList.length) {
    throw new Error("facetIdList and facetVersionList must have the same length");
  }

  // Use effectiveBatchSize as "facets per batch"
  const chunkSize = effectiveBatchSize;

  for (let i = 0; i < facetIdList.length; i += chunkSize) {
    // Add delay between batches to prevent RPC node overload (skip first batch and instant networks)
    if (i > 0 && !isInstantMiningNetwork(networkName)) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const batchIds = facetIdList.slice(i, i + chunkSize);
    const batchVersions = facetVersionList.slice(i, i + chunkSize);
    const batch = createBatchFacetConfigurations(batchIds, batchVersions);

    // Always mark the last batch of THIS configuration as final
    // partialBatchDeploy only indicates if more configurations follow after this one
    const isLastBatch = i + chunkSize >= facetIdList.length;

    await sendBatchConfiguration(configId, batch, isLastBatch, blrContract, gasLimit, confirmations, retryOptions);
  }
}

/**
 * Send a batch configuration to the BusinessLogicResolver contract.
 *
 * This function creates a batch configuration on the BLR contract. The isFinalBatch
 * parameter is determined by the partialBatchDeploy flag and whether this is the
 * last batch in the sequence.
 *
 * @param configId - Configuration ID for the batch
 * @param configurations - Array of batch facet configurations for this batch
 * @param isFinalBatch - Whether this is the final batch in the sequence
 * @param blrContract - BusinessLogicResolver contract instance
 * @param gasLimit - Optional gas limit override
 * @param confirmations - Number of confirmations to wait for (default: 0 for test environments)
 * @returns Promise that resolves when the transaction is confirmed
 *
 * @example
 * ```typescript
 * const batch = [
 *   { id: '0x123...', version: 1 }
 * ]
 *
 * await sendBatchConfiguration(
 *   '0x123...', // config ID
 *   batch,
 *   true, // is final batch
 *   blrContract, // contract instance
 *   5000000, // gas limit
 *   0 // confirmations for testing
 * )
 * ```
 */
export async function sendBatchConfiguration(
  configId: string,
  configurations: BatchFacetConfiguration[],
  isFinalBatch: boolean,
  blrContract: BusinessLogicResolver,
  gasLimit?: number,
  confirmations: number = 0,
  retryOptions?: RetryOptions,
): Promise<void> {
  const finalBatch = isFinalBatch;

  info(`Sending batch configuration for config ${configId}`);
  info(`  Configurations: ${configurations.length}`);
  info(`  Is final batch: ${finalBatch}`);
  info(`  Confirmations to wait: ${confirmations}`);

  // After a 502 the NonceManager's internal delta may be ahead of what Hedera received.
  // Reset before each retry so the next attempt re-fetches the confirmed nonce.
  // Only retry the send — once a tx hash is returned, the batch is committed on success;
  // re-submitting would create a duplicate configuration version.
  const effectiveRetryOptions: RetryOptions = withNonceReset(blrContract.runner, retryOptions);

  try {
    // Dynamic import for parallel test performance (see module JSDoc for explanation)
    const { GAS_LIMIT: GL } = await import("@scripts/infrastructure");

    const txResponse = await retryTransaction(async () => {
      const sentTx = await blrContract.createBatchConfiguration(configId, configurations, finalBatch, {
        gasLimit: gasLimit || GL.businessLogicResolver.createConfiguration,
        ...hederaGasOverrides(),
      });
      info(`Batch configuration transaction sent: ${sentTx.hash}`);
      return sentTx;
    }, effectiveRetryOptions);

    // Wait for transaction confirmation with configurable confirmations
    const receipt = await waitForTransaction(txResponse, confirmations, DEFAULT_TRANSACTION_TIMEOUT);

    const gasUsed = formatGasUsage(receipt, txResponse.gasLimit);
    debug(gasUsed);

    success(`Batch configuration ${finalBatch ? "(final)" : "(partial)"} completed successfully`);
    info(`  Transaction: ${receipt.hash}`);
    info(`  Block: ${receipt.blockNumber}`);
  } catch (err) {
    // Re-simulate with staticCall to surface the decoded revert reason (custom
    // errors, panic codes, etc.) that status=0 receipts don't carry.
    try {
      await blrContract.createBatchConfiguration.staticCall(configId, configurations, finalBatch, {
        gasLimit: gasLimit || GAS_LIMIT.businessLogicResolver.createConfiguration,
      });
    } catch (simErr) {
      const simMessage = simErr instanceof Error ? simErr.message : String(simErr);
      logError(`Failed to send batch configuration: ${simMessage}`);
      throw new Error(simMessage);
    }
    const errorMessage = extractRevertReason(err);
    logError(`Failed to send batch configuration: ${errorMessage}`);
    throw err;
  }
}

/**
 * Create a batch configuration in BusinessLogicResolver with partial deployment support.
 *
 * This function splits facets into batches and processes each batch with the specified
 * partial deployment behavior.
 *
 * **Note:** Caller must provide facets with resolver keys already looked up from registry.
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param options - Batch configuration options (includes resolver keys)
 * @returns Operation result with configuration data or error
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@contract-types'
 * import { atsRegistry } from '@scripts/domain'
 *
 * const blr = BusinessLogicResolver__factory.connect(blrAddress, signer)
 *
 * // Caller looks up resolver keys from registry
 * const facetsWithKeys = [
 *   {
 *     facetName: 'AccessControlFacet',
 *     address: '0xabc...',
 *     resolverKey: atsRegistry.getFacetDefinition('AccessControlFacet').resolverKey.value
 *   },
 *   {
 *     facetName: 'KycFacet',
 *     address: '0xdef...',
 *     resolverKey: atsRegistry.getFacetDefinition('KycFacet').resolverKey.value
 *   }
 * ]
 *
 * // Create batch configuration
 * const result = await createBatchConfiguration(blr, {
 *   configurationId: '0x123...',
 *   facets: facetsWithKeys,
 *   partialBatchDeploy: true  // All batches marked as non-final
 * })
 * ```
 */
export async function createBatchConfiguration(
  blrContract: BusinessLogicResolver,
  options: {
    /** Configuration ID (bytes32) */
    configurationId: string;

    /** Facets to include in configuration (with resolver keys) */
    facets: FacetConfigurationData[];

    /** Whether this is a partial batch deployment (all batches marked as non-final) */
    partialBatchDeploy?: boolean;

    /** Number of facets per batch (default: DEFAULT_BATCH_SIZE) */
    batchSize?: number;

    /** Optional gas limit override */
    gasLimit?: number;

    /** Number of confirmations to wait for (default: 0 for test environments) */
    confirmations?: number;

    /**
     * Optional map of facet name -> explicit BLR version to pin in the
     * configuration. When provided, every facet in `facets` must have an entry,
     * and these versions are used instead of `getLatestVersions`. This is the
     * escape hatch for test fixtures (notably InitializeMock) that need a
     * configuration referencing earlier facet versions rather than the latest.
     */
    facetVersions?: Record<string, number>;

    /**
     * Retry configuration for each `createBatchConfiguration` transaction.
     * On Hedera testnet, transient 502 responses can abort a batch mid-sequence.
     * Default: no retries.
     */
    retryOptions?: RetryOptions;
  },
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  const {
    configurationId,
    facets,
    partialBatchDeploy = false,
    batchSize = DEFAULT_BATCH_SIZE,
    gasLimit,
    confirmations = 0,
    facetVersions,
    retryOptions,
  } = options;

  // Dynamic imports for parallel test performance (see module JSDoc for explanation)
  const { info } = await import("@scripts/infrastructure");
  const { ok, err } = await import("@scripts/infrastructure");

  if (facets.length === 0) {
    return err("EMPTY_FACET_LIST", "At least one facet is required for configuration");
  }

  try {
    const blrAddress = await blrContract.getAddress();

    info("Creating Batch BLR Configuration", {
      blrAddress,
      configurationId,
      facetCount: facets.length,
      partialBatchDeploy,
    });

    // Use provided facet data directly (resolver keys already included)
    const facetKeys = facets.map((facet) => {
      //TODO: add check values are not undefined
      return {
        facetName: facet.facetName,
        key: facet.resolverKey,
        address: facet.address,
      };
    });

    if (facetKeys.length === 0) {
      return err("FACET_NOT_FOUND", "No valid facets found in provided addresses");
    }

    info(`Resolved ${facetKeys.length} facets with addresses`, {});

    const facetIdList = facetKeys.map((f) => f.key);
    let versions: number[];
    if (facetVersions) {
      // Caller pinned explicit per-facet versions — every facet in the
      // configuration must have a corresponding entry. We do not fall back to
      // the latest version, otherwise a typo in the map would silently end up
      // pinning whichever version happens to be latest in the BLR.
      versions = facetKeys.map((f) => {
        const pinned = facetVersions[f.facetName];
        if (pinned === undefined) {
          throw new Error(
            `facetVersions provided to createBatchConfiguration but missing entry for facet: ${f.facetName}`,
          );
        }
        return pinned;
      });
    } else {
      const latestVersions = await blrContract.getLatestVersions(facetIdList);
      versions = latestVersions.map((v) => Number(v));
    }

    // Guard: version=0 means the facet was never registered in the BLR.
    // Passing version=0 to createBatchConfiguration causes an arithmetic
    // underflow panic in _resolveBusinessLogicByVersion (_version - 1 on
    // uint256(0)), which surfaces only as a silent status=0 revert.
    const unregistered = facetKeys.filter((_, i) => versions[i] === 0);
    if (unregistered.length > 0) {
      throw new Error(
        `Cannot create configuration: ${unregistered.length} facet(s) have version 0 ` +
          `(not registered in BLR): ${unregistered.map((f) => f.facetName).join(", ")}`,
      );
    }

    // Recover from a partial batch left by a previous crashed run.
    // A non-zero batchVersion is detectable by querying version currentVersion+1:
    // every read helper in DiamondCutManager requires an explicit non-zero
    // version (it reverts `VersionZero` on 0), so if any facets were written to
    // that slot the array will be non-empty.
    const currentVersion = await getConfigurationVersion(blrContract, configurationId);
    const ongoingBatchFacets = await blrContract.getFacetIdsByConfigurationIdAndVersion(
      configurationId,
      currentVersion + 1,
      0,
      1,
    );
    if (ongoingBatchFacets.length > 0) {
      warn(
        `Detected uncommitted batch for config ${configurationId} (version ${currentVersion + 1}). ` +
          `Cancelling to allow clean retry...`,
      );
      const cancelTx = await blrContract.cancelBatchConfiguration(configurationId, {
        gasLimit: GAS_LIMIT.businessLogicResolver.createConfiguration,
        ...hederaGasOverrides(),
      });
      await cancelTx.wait(confirmations);
    }

    info("Processing facets in batches", {
      facetCount: facetIdList.length,
      partialBatchDeploy,
      confirmations,
    });

    await processFacetLists(
      configurationId,
      facetIdList,
      versions,
      blrContract,
      partialBatchDeploy,
      batchSize,
      gasLimit,
      confirmations,
      retryOptions,
    );

    // Query the actual configuration-specific version after batch processing
    const configVersion = await blrContract.getLatestVersionByConfiguration(configurationId);
    const actualVersion = Number(configVersion);

    // Dynamic import for parallel test performance (see module JSDoc)
    const { success: logSuccess } = await import("../utils/logging");
    logSuccess("Batch configuration completed successfully", {
      configurationId,
      facets: facetKeys.length,
      partialDeploy: partialBatchDeploy,
      version: actualVersion,
    });

    return ok({
      configurationId,
      version: actualVersion,
      facetKeys,
      transactionHash: "",
      blockNumber: 0,
    });
  } catch (error) {
    // Dynamic import for parallel test performance (see module JSDoc)
    const { error: logError } = await import("../utils/logging");
    const errorMessage = error instanceof Error ? error.message : String(error);

    logError("Failed to create batch configuration", {
      error: errorMessage,
    });

    return err("TRANSACTION_FAILED", errorMessage, error);
  }
}
