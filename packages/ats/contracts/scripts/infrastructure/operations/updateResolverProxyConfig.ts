// SPDX-License-Identifier: Apache-2.0

/**
 * Update ResolverProxy configuration operation.
 *
 * Updates an already deployed ResolverProxy (Diamond pattern proxy) by calling
 * DiamondCutFacet functions via the proxy's fallback mechanism. This differs from
 * TUP (Transparent Upgradeable Proxy) upgrades which change implementations.
 *
 * Supports three update strategies:
 * 1. **Version Only** - Update configuration version (updateConfigVersion)
 * 2. **Config + Version** - Update config ID and version (updateConfig)
 * 3. **Full Update** - Update resolver, config ID, and version (updateResolver)
 *
 * @module infrastructure/operations/updateResolverProxyConfig
 */

import { ContractReceipt, Overrides, Signer, providers } from "ethers";
import {
  DEFAULT_TRANSACTION_TIMEOUT,
  debug,
  error as logError,
  formatGasUsage,
  info,
  section,
  success,
  validateAddress,
  waitForTransaction,
  extractRevertReason,
} from "@scripts/infrastructure";
import { DiamondCutFacet__factory } from "@contract-types";

/**
 * Options for updating ResolverProxy configuration.
 *
 * Parameter-based action detection:
 * - If `newBlrAddress` AND `newConfigurationId` provided → call `updateResolver()`
 * - Else if `newConfigurationId` provided → call `updateConfig()`
 * - Else → call `updateConfigVersion()` (requires at least `newVersion`)
 */
export interface UpdateResolverProxyConfigOptions {
  /** Address of the already deployed ResolverProxy (Diamond pattern proxy) */
  proxyAddress: string;

  /** New configuration version number */
  newVersion: number;

  /**
   * New configuration ID (optional).
   * If provided with newBlrAddress, triggers updateResolver().
   * If provided alone, triggers updateConfig().
   */
  newConfigurationId?: string;

  /**
   * New BusinessLogicResolver address (optional).
   * Must be provided together with newConfigurationId for updateResolver().
   */
  newBlrAddress?: string;

  /** Transaction overrides */
  overrides?: Overrides;

  /** Number of confirmations to wait for */
  confirmations?: number;
}

/**
 * Current ResolverProxy configuration information.
 */
export interface ResolverProxyConfigInfo {
  /** Current BusinessLogicResolver address */
  resolver: string;

  /** Current configuration ID */
  configurationId: string;

  /** Current version */
  version: number;
}

/**
 * Result of updating ResolverProxy configuration.
 */
export interface UpdateResolverProxyConfigResult {
  /** Whether update succeeded */
  success: boolean;

  /** ResolverProxy address that was updated */
  proxyAddress: string;

  /**
   * Type of update performed:
   * - 'version' - Only version was updated
   * - 'config' - Config ID and version were updated
   * - 'resolver' - Resolver, config ID, and version were updated
   */
  updateType: "version" | "config" | "resolver";

  /** Previous configuration before update */
  previousConfig?: ResolverProxyConfigInfo;

  /** New configuration after update */
  newConfig?: ResolverProxyConfigInfo;

  /** Transaction hash of the update */
  transactionHash?: string;

  /** Block number where update was mined */
  blockNumber?: number;

  /** Gas used for the update transaction */
  gasUsed?: number;

  /** Error message (only if success=false) */
  error?: string;
}

/**
 * Get current ResolverProxy configuration information.
 *
 * Calls the getConfigInfo() function on DiamondCutFacet to retrieve
 * the current resolver address, configuration ID, and version.
 *
 * @param signerOrProvider - Ethers signer or provider
 * @param proxyAddress - Address of the ResolverProxy
 * @returns Current configuration info
 * @throws Error if proxy address is invalid or query fails
 *
 * @example
 * ```typescript
 * import { getResolverProxyConfigInfo } from '@scripts/infrastructure'
 *
 * const config = await getResolverProxyConfigInfo(provider, '0x123...')
 * console.log(`Current resolver: ${config.resolver}`)
 * console.log(`Current config ID: ${config.configurationId}`)
 * console.log(`Current version: ${config.version}`)
 * ```
 */
export async function getResolverProxyConfigInfo(
  signerOrProvider: Signer | providers.Provider,
  proxyAddress: string,
): Promise<ResolverProxyConfigInfo> {
  try {
    validateAddress(proxyAddress, "ResolverProxy address");

    // Connect to DiamondCutFacet interface at proxy address
    const diamondCutFacet = DiamondCutFacet__factory.connect(proxyAddress, signerOrProvider);

    // Call getConfigInfo() which returns [resolver, configId, version]
    const [resolver, configId, version] = await diamondCutFacet.getConfigInfo();

    return {
      resolver,
      configurationId: configId,
      version: version.toNumber(),
    };
  } catch (err) {
    const errorMessage = extractRevertReason(err);
    logError(`Failed to get ResolverProxy config info: ${errorMessage}`);
    throw err;
  }
}

/**
 * Update ResolverProxy configuration.
 *
 * Updates an already deployed ResolverProxy by calling DiamondCutFacet functions
 * via the proxy's fallback mechanism. The update method is determined by the
 * parameters provided:
 *
 * **Update Strategies:**
 * 1. **Version Only** (updateConfigVersion):
 *    - Required: `newVersion`
 *    - Optional: none
 *    - When: Only newVersion provided
 *
 * 2. **Config + Version** (updateConfig):
 *    - Required: `newConfigurationId`, `newVersion`
 *    - When: newConfigurationId provided without newBlrAddress
 *
 * 3. **Full Update** (updateResolver):
 *    - Required: `newBlrAddress`, `newConfigurationId`, `newVersion`
 *    - When: Both newBlrAddress and newConfigurationId provided
 *
 * **Pre/Post State Verification:**
 * - Fetches configuration BEFORE update
 * - Fetches configuration AFTER update
 * - Returns both for comparison and verification
 *
 * @param signer - Ethers signer connected to the network
 * @param options - Update options
 * @returns Update result with previous/new config and transaction details
 *
 * @example Update version only
 * ```typescript
 * import { updateResolverProxyConfig } from '@scripts/infrastructure'
 *
 * // Update only the version
 * const result = await updateResolverProxyConfig(signer, {
 *   proxyAddress: '0x123...',
 *   newVersion: 2
 * })
 *
 * if (result.success) {
 *   console.log(`Updated version from ${result.previousConfig?.version} to ${result.newConfig?.version}`)
 * }
 * ```
 *
 * @example Update configuration
 * ```typescript
 * // Update both config ID and version
 * const result = await updateResolverProxyConfig(signer, {
 *   proxyAddress: '0x123...',
 *   newConfigurationId: '0xNewConfigID...',
 *   newVersion: 2
 * })
 *
 * console.log(`Update type: ${result.updateType}`) // 'config'
 * ```
 *
 * @example Full resolver update
 * ```typescript
 * // Update resolver, config ID, and version (full update)
 * const result = await updateResolverProxyConfig(signer, {
 *   proxyAddress: '0x123...',
 *   newBlrAddress: '0xNewResolver...',
 *   newConfigurationId: '0xNewConfigID...',
 *   newVersion: 2
 * })
 *
 * console.log(`Update type: ${result.updateType}`) // 'resolver'
 * ```
 */
export async function updateResolverProxyConfig(
  signer: Signer,
  options: UpdateResolverProxyConfigOptions,
): Promise<UpdateResolverProxyConfigResult> {
  const { proxyAddress, newVersion, newConfigurationId, newBlrAddress, overrides = {}, confirmations = 1 } = options;

  section("Updating ResolverProxy Configuration");

  try {
    // Validate proxy address
    validateAddress(proxyAddress, "ResolverProxy address");

    // Determine update type based on parameters
    let updateType: "version" | "config" | "resolver";
    if (newBlrAddress && newConfigurationId) {
      updateType = "resolver";
      validateAddress(newBlrAddress, "new BLR address");
    } else if (newConfigurationId) {
      updateType = "config";
    } else {
      updateType = "version";
    }

    info(`Proxy Address: ${proxyAddress}`);
    info(`Update Type: ${updateType}`);
    info(`New Version: ${newVersion}`);

    if (newBlrAddress) {
      info(`New BLR Address: ${newBlrAddress}`);
    }
    if (newConfigurationId) {
      info(`New Config ID: ${newConfigurationId}`);
    }

    // Get current config before update
    info("Fetching current configuration...");
    const previousConfig = await getResolverProxyConfigInfo(signer, proxyAddress);
    debug(
      `Previous config: resolver=${previousConfig.resolver}, configId=${previousConfig.configurationId}, version=${previousConfig.version}`,
    );

    // Connect to DiamondCutFacet at proxy address
    const diamondCutFacet = DiamondCutFacet__factory.connect(proxyAddress, signer);

    // Perform update based on type
    let updateTx;
    info("Sending update transaction...");

    try {
      if (updateType === "resolver") {
        // Full update: updateResolver(address, bytes32, uint256)
        debug("Calling updateResolver()");
        updateTx = await diamondCutFacet.updateResolver(newBlrAddress!, newConfigurationId!, newVersion, overrides);
      } else if (updateType === "config") {
        // Config update: updateConfig(bytes32, uint256)
        debug("Calling updateConfig()");
        updateTx = await diamondCutFacet.updateConfig(newConfigurationId!, newVersion, overrides);
      } else {
        // Version only: updateConfigVersion(uint256)
        debug("Calling updateConfigVersion()");
        updateTx = await diamondCutFacet.updateConfigVersion(newVersion, overrides);
      }
    } catch (txErr) {
      const errorMessage = extractRevertReason(txErr);
      logError(`Update transaction failed: ${errorMessage}`);
      return {
        success: false,
        proxyAddress,
        updateType,
        previousConfig,
        error: errorMessage,
      };
    }

    info(`Transaction sent: ${updateTx.hash}`);

    // Wait for transaction confirmation
    let receipt: ContractReceipt;
    try {
      receipt = await waitForTransaction(updateTx, confirmations, DEFAULT_TRANSACTION_TIMEOUT);
    } catch (waitErr) {
      const errorMessage = extractRevertReason(waitErr);
      logError(`Transaction confirmation failed: ${errorMessage}`);
      return {
        success: false,
        proxyAddress,
        updateType,
        previousConfig,
        transactionHash: updateTx.hash,
        error: errorMessage,
      };
    }

    const gasUsed = formatGasUsage(receipt, updateTx.gasLimit);
    debug(gasUsed);

    // Get new config after update
    info("Fetching updated configuration...");
    let newConfig: ResolverProxyConfigInfo;
    try {
      newConfig = await getResolverProxyConfigInfo(signer, proxyAddress);
      debug(
        `New config: resolver=${newConfig.resolver}, configId=${newConfig.configurationId}, version=${newConfig.version}`,
      );
    } catch (configErr) {
      const errorMessage = extractRevertReason(configErr);
      logError(`Failed to fetch updated config: ${errorMessage}`);
      // Return success but with error in newConfig fetch - update may have succeeded
      return {
        success: true,
        proxyAddress,
        updateType,
        previousConfig,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toNumber(),
        error: `Update succeeded but config verification failed: ${errorMessage}`,
      };
    }

    success("ResolverProxy configuration updated successfully");
    info(`  Previous version: ${previousConfig.version}`);
    info(`  New version: ${newConfig.version}`);
    if (previousConfig.configurationId !== newConfig.configurationId) {
      info(`  Previous config ID: ${previousConfig.configurationId}`);
      info(`  New config ID: ${newConfig.configurationId}`);
    }
    if (previousConfig.resolver !== newConfig.resolver) {
      info(`  Previous resolver: ${previousConfig.resolver}`);
      info(`  New resolver: ${newConfig.resolver}`);
    }

    return {
      success: true,
      proxyAddress,
      updateType,
      previousConfig,
      newConfig,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toNumber(),
    };
  } catch (err) {
    const errorMessage = extractRevertReason(err);
    logError(`ResolverProxy configuration update failed: ${errorMessage}`);

    return {
      success: false,
      proxyAddress,
      updateType: "version", // Default if we can't determine
      error: errorMessage,
    };
  }
}
