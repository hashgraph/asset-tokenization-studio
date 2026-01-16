// SPDX-License-Identifier: Apache-2.0

/**
 * Update ResolverProxy configuration operation.
 *
 * Updates an already deployed ResolverProxy (Diamond pattern proxy) by calling
 * DiamondCutFacet functions via the proxy's fallback mechanism. This differs from
 * TUP (Transparent Upgradeable Proxy) upgrades which change implementations.
 *
 * Supports three update strategies via explicit methods:
 * 1. **Version Only** - updateResolverProxyVersion() calls updateConfigVersion()
 * 2. **Config + Version** - updateResolverProxyConfig() calls updateConfig()
 * 3. **Full Update** - updateResolverProxyResolver() calls updateResolver()
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
 * Type of ResolverProxy update operation.
 */
export type ResolverProxyUpdateType = "version" | "config" | "resolver";

/**
 * Base options for ResolverProxy update operations.
 */
export interface ResolverProxyUpdateOptions {
  /** Transaction overrides */
  overrides?: Overrides;
  /** Number of confirmations to wait for (default: 1) */
  confirmations?: number;
}

/** Options for updating ResolverProxy version only. */
export type UpdateResolverProxyVersionOptions = ResolverProxyUpdateOptions;

/** Options for updating ResolverProxy configuration (config ID + version). */
export type UpdateResolverProxyConfigOptions = ResolverProxyUpdateOptions;

/** Options for full ResolverProxy update (resolver + config ID + version). */
export type UpdateResolverProxyResolverOptions = ResolverProxyUpdateOptions;

/**
 * Internal options for shared update implementation.
 * @internal
 */
interface InternalUpdateOptions {
  /** Address of the ResolverProxy */
  proxyAddress: string;
  /** Update type (pre-determined by public method) */
  updateType: ResolverProxyUpdateType;
  /** New version number */
  newVersion: number;
  /** New configuration ID (required for 'config' and 'resolver' types) */
  newConfigurationId?: string;
  /** New BLR address (required for 'resolver' type) */
  newBlrAddress?: string;
  /** Transaction overrides */
  overrides?: Overrides;
  /** Number of confirmations */
  confirmations: number;
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
  updateType: ResolverProxyUpdateType;

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

    const diamondCutFacet = DiamondCutFacet__factory.connect(proxyAddress, signerOrProvider);
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
 * Update ResolverProxy configuration version.
 *
 * Updates only the version pointer in the ResolverProxy, keeping the same
 * BusinessLogicResolver and configuration ID. This is the most common update
 * operation when facet implementations are updated within the same configuration.
 *
 * Calls DiamondCutFacet.updateConfigVersion(newVersion) via the proxy's fallback mechanism.
 *
 * @param signer - Ethers signer connected to the network (must have DEFAULT_ADMIN_ROLE)
 * @param proxyAddress - Address of the ResolverProxy to update
 * @param newVersion - New version number to update to
 * @param options - Optional transaction parameters
 * @returns Update result with previous/new config and transaction details
 *
 * @example
 * ```typescript
 * import { updateResolverProxyVersion } from '@scripts/infrastructure'
 *
 * // Update version from 1 to 2
 * const result = await updateResolverProxyVersion(
 *   signer,
 *   '0x123...',  // proxy address
 *   2,           // new version
 *   { confirmations: 0 }
 * )
 *
 * if (result.success) {
 *   console.log(`Updated version from ${result.previousConfig?.version} to ${result.newConfig?.version}`)
 * }
 * ```
 */
export async function updateResolverProxyVersion(
  signer: Signer,
  proxyAddress: string,
  newVersion: number,
  options?: UpdateResolverProxyVersionOptions,
): Promise<UpdateResolverProxyConfigResult> {
  const { overrides, confirmations } = options || {};
  return _updateResolverProxyInternal(signer, {
    proxyAddress,
    updateType: "version",
    newVersion,
    overrides,
    confirmations: confirmations ?? 1,
  });
}

/**
 * Update ResolverProxy configuration ID and version.
 *
 * Updates both the configuration ID and version in the ResolverProxy, keeping
 * the same BusinessLogicResolver. Use this when switching between different
 * token configurations (e.g., EQUITY to BOND) within the same BLR.
 *
 * Calls DiamondCutFacet.updateConfig(newConfigurationId, newVersion) via the proxy's fallback mechanism.
 *
 * @param signer - Ethers signer connected to the network (must have DEFAULT_ADMIN_ROLE)
 * @param proxyAddress - Address of the ResolverProxy to update
 * @param newConfigurationId - New configuration ID (must be registered in BLR)
 * @param newVersion - New version number to update to
 * @param options - Optional transaction parameters
 * @returns Update result with previous/new config and transaction details
 *
 * @example
 * ```typescript
 * import { updateResolverProxyConfig } from '@scripts/infrastructure'
 *
 * // Switch from EQUITY to BOND configuration
 * const result = await updateResolverProxyConfig(
 *   signer,
 *   '0x123...',            // proxy address
 *   BOND_CONFIG_ID,        // new config ID
 *   2,                     // new version
 *   { confirmations: 0 }
 * )
 *
 * console.log(`Update type: ${result.updateType}`)  // 'config'
 * ```
 */
export async function updateResolverProxyConfig(
  signer: Signer,
  proxyAddress: string,
  newConfigurationId: string,
  newVersion: number,
  options?: UpdateResolverProxyConfigOptions,
): Promise<UpdateResolverProxyConfigResult> {
  const { overrides, confirmations } = options || {};
  return _updateResolverProxyInternal(signer, {
    proxyAddress,
    updateType: "config",
    newVersion,
    newConfigurationId,
    overrides,
    confirmations: confirmations ?? 1,
  });
}

/**
 * Update ResolverProxy resolver, configuration ID, and version.
 *
 * Performs a full update of the ResolverProxy by changing the BusinessLogicResolver
 * address, configuration ID, and version. This is the most significant update,
 * typically used when deploying a new BLR with different facet implementations.
 *
 * Calls DiamondCutFacet.updateResolver(newBlrAddress, newConfigurationId, newVersion) via the proxy's fallback mechanism.
 *
 * @param signer - Ethers signer connected to the network (must have DEFAULT_ADMIN_ROLE)
 * @param proxyAddress - Address of the ResolverProxy to update
 * @param newBlrAddress - New BusinessLogicResolver address
 * @param newConfigurationId - New configuration ID (must be registered in new BLR)
 * @param newVersion - New version number to update to
 * @param options - Optional transaction parameters
 * @returns Update result with previous/new config and transaction details
 *
 * @example
 * ```typescript
 * import { updateResolverProxyResolver } from '@scripts/infrastructure'
 *
 * // Full update to new BLR
 * const result = await updateResolverProxyResolver(
 *   signer,
 *   '0x123...',            // proxy address
 *   '0xNewBLR...',         // new BLR address
 *   EQUITY_CONFIG_ID,      // new config ID
 *   1,                     // new version
 *   { confirmations: 0 }
 * )
 *
 * console.log(`Update type: ${result.updateType}`)  // 'resolver'
 * ```
 */
export async function updateResolverProxyResolver(
  signer: Signer,
  proxyAddress: string,
  newBlrAddress: string,
  newConfigurationId: string,
  newVersion: number,
  options?: UpdateResolverProxyResolverOptions,
): Promise<UpdateResolverProxyConfigResult> {
  const { overrides, confirmations } = options || {};
  return _updateResolverProxyInternal(signer, {
    proxyAddress,
    updateType: "resolver",
    newVersion,
    newConfigurationId,
    newBlrAddress,
    overrides,
    confirmations: confirmations ?? 1,
  });
}

/**
 * Internal implementation for ResolverProxy configuration updates.
 *
 * Shared implementation used by all three public update methods. Handles transaction
 * sending via appropriate DiamondCutFacet method, pre/post state verification, error
 * handling, and gas usage reporting.
 *
 * @internal
 * @param signer - Ethers signer connected to the network
 * @param options - Pre-determined internal options
 * @returns Update result with previous/new config and transaction details
 */
async function _updateResolverProxyInternal(
  signer: Signer,
  options: InternalUpdateOptions,
): Promise<UpdateResolverProxyConfigResult> {
  const {
    proxyAddress,
    updateType,
    newVersion,
    newConfigurationId,
    newBlrAddress,
    overrides = {},
    confirmations,
  } = options;

  section("Updating ResolverProxy Configuration");

  try {
    validateAddress(proxyAddress, "ResolverProxy address");

    if (newBlrAddress) {
      validateAddress(newBlrAddress, "new BLR address");
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

    info("Fetching current configuration...");
    const previousConfig = await getResolverProxyConfigInfo(signer, proxyAddress);
    debug(
      `Previous config: resolver=${previousConfig.resolver}, configId=${previousConfig.configurationId}, version=${previousConfig.version}`,
    );

    const diamondCutFacet = DiamondCutFacet__factory.connect(proxyAddress, signer);

    let updateTx;
    info("Sending update transaction...");

    try {
      switch (updateType) {
        case "resolver":
          debug("Calling updateResolver()");
          updateTx = await diamondCutFacet.updateResolver(newBlrAddress!, newConfigurationId!, newVersion, overrides);
          break;
        case "config":
          debug("Calling updateConfig()");
          updateTx = await diamondCutFacet.updateConfig(newConfigurationId!, newVersion, overrides);
          break;
        case "version":
          debug("Calling updateConfigVersion()");
          updateTx = await diamondCutFacet.updateConfigVersion(newVersion, overrides);
          break;
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
      // Update may have succeeded even though config verification failed
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
      updateType,
      error: errorMessage,
    };
  }
}
