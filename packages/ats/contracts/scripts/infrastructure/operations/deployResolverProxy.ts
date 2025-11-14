// SPDX-License-Identifier: Apache-2.0

/**
 * ResolverProxy deployment operation.
 *
 * Deploys Diamond pattern proxies using BusinessLogicResolver for facet routing.
 * Provides standardized deployment workflow with logging, error handling, and
 * optional Hedera Contract ID extraction.
 *
 * @module infrastructure/operations/deployResolverProxy
 */

import { Contract, ContractReceipt, Overrides, Signer } from "ethers";
import {
  DEFAULT_TRANSACTION_TIMEOUT,
  debug,
  error as logError,
  formatGasUsage,
  info,
  LATEST_VERSION,
  section,
  success,
  validateAddress,
  waitForTransaction,
  GAS_LIMIT,
} from "@scripts/infrastructure";

/**
 * RBAC configuration for ResolverProxy.
 */
export interface ResolverProxyRbac {
  /** Role identifier (bytes32) */
  role: string;
  /** Array of addresses to grant this role */
  members: string[];
}

/**
 * Options for deploying a ResolverProxy.
 */
export interface DeployResolverProxyOptions {
  /** BusinessLogicResolver address */
  blrAddress: string;

  /** Configuration ID in BLR */
  configurationId: string;

  /**
   * Configuration version to use.
   * - Use `0` or omit for auto-updating proxy (always resolves to latest version)
   * - Use specific version number (1, 2, 3...) for pinned proxy
   *
   * **Auto-updating (version: 0 or undefined)** (default):
   * - Proxy automatically uses the latest registered configuration version
   * - Ideal for development environments and testing
   * - Version resolution happens at runtime on every call
   *
   * **Pinned (version: 1, 2, 3...)**:
   * - Proxy uses a specific configuration version
   * - Recommended for production deployments
   * - Provides predictable behavior and upgrade control
   *
   * @default LATEST_VERSION (0)
   */
  version?: number;

  /** RBAC configuration (optional, defaults to empty array) */
  rbac?: ResolverProxyRbac[];

  /** Network */
  network?: string;

  /** Transaction overrides */
  overrides?: Overrides;

  /** Number of confirmations to wait for */
  confirmations?: number;
}

/**
 * Result of ResolverProxy deployment.
 */
export interface DeployResolverProxyResult {
  /** Whether deployment succeeded */
  success: boolean;

  /** Deployed ResolverProxy contract instance */
  contract?: Contract;

  /** ResolverProxy address */
  proxyAddress?: string;

  /** Hedera Contract ID (if Hedera network) */
  contractId?: string;

  /** Configuration ID used */
  configurationId?: string;

  /** Version used */
  version?: number;

  /** Deployment transaction receipt */
  receipt?: ContractReceipt;

  /** Error type if failed */
  error?: string;

  /** Detailed error message */
  message?: string;
}

/**
 * Deploy a ResolverProxy (Diamond pattern proxy).
 *
 * Creates a new ResolverProxy instance that uses the BusinessLogicResolver
 * for facet routing. This is the standard deployment method for Diamond
 * pattern contracts in the ATS ecosystem.
 *
 * **Version Resolution**:
 * - `version: 0` - Auto-updating proxy (always uses latest configuration version)
 * - `version: N` - Pinned proxy (uses specific configuration version N)
 *
 * The version resolution is handled by the smart contract's `_resolveVersion()`
 * function, which queries the BusinessLogicResolver at runtime.
 *
 * @param signer - Ethers signer for deploying the contract
 * @param options - Deployment options
 * @returns Deployment result with proxy address and metadata
 *
 * @example
 * ```typescript
 * import { deployResolverProxy, LATEST_VERSION } from '@scripts/infrastructure'
 *
 * // Auto-updating proxy (development/testing)
 * const devProxy = await deployResolverProxy(signer, {
 *     blrAddress: '0x123...',
 *     configurationId: EQUITY_CONFIG_ID,
 *     version: LATEST_VERSION, // or version: 0
 *     rbac: [],
 * })
 * // This proxy automatically uses the latest configuration version
 * // Ideal for development where you want automatic updates
 *
 * // Pinned proxy (production)
 * const prodProxy = await deployResolverProxy(signer, {
 *     blrAddress: '0x123...',
 *     configurationId: EQUITY_CONFIG_ID,
 *     version: 1, // Pin to specific version
 *     rbac: [],
 * })
 * // This proxy uses version 1 and won't auto-update
 * // Recommended for production deployments
 * ```
 */
export async function deployResolverProxy(
  signer: Signer,
  options: DeployResolverProxyOptions,
): Promise<DeployResolverProxyResult> {
  const {
    blrAddress,
    configurationId,
    version = LATEST_VERSION,
    rbac = [],
    network: _network,
    overrides = { gasLimit: GAS_LIMIT.default },
    confirmations = 1,
  } = options;

  section("Deploying ResolverProxy");

  try {
    info(`BLR Address: ${blrAddress}`);
    info(`Config ID: ${configurationId}`);
    info(`Version: ${version}`);
    info(`RBAC Rules: ${rbac.length}`);

    validateAddress(blrAddress, "BLR address");

    // Get ResolverProxy factory from TypeChain
    const { ResolverProxy__factory } = await import("@contract-types");
    const ResolverProxyFactory = new ResolverProxy__factory(signer);

    // Deploy ResolverProxy
    info("Deploying ResolverProxy contract...");
    const resolverProxy = await ResolverProxyFactory.deploy(blrAddress, configurationId, version, rbac, overrides);

    info(`Transaction sent: ${resolverProxy.deployTransaction.hash}`);

    // Wait for deployment with proper timeout and confirmations
    const receipt = await waitForTransaction(
      resolverProxy.deployTransaction,
      confirmations,
      DEFAULT_TRANSACTION_TIMEOUT,
    );

    const proxyAddress = resolverProxy.address;

    validateAddress(proxyAddress, "ResolverProxy address");

    const gasUsed = formatGasUsage(receipt, resolverProxy.deployTransaction.gasLimit);
    debug(gasUsed);

    success("ResolverProxy deployment complete");
    info(`  ResolverProxy: ${proxyAddress}`);

    return {
      success: true,
      contract: resolverProxy,
      proxyAddress,
      configurationId,
      version,
      receipt,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logError(`ResolverProxy deployment failed: ${errorMessage}`);

    throw new Error(`ResolverProxy deployment failed: ${errorMessage}`);
  }
}
