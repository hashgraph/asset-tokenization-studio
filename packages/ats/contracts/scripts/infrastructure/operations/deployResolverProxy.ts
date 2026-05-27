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

import { Contract, ContractTransactionReceipt, Overrides, Signer } from "ethers";
import {
  debug,
  error as logError,
  formatGasUsage,
  info,
  section,
  success,
  validateAddress,
  GAS_LIMIT,
  DEFAULT_TRANSACTION_TIMEOUT,
  hederaGasOverrides,
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
   * Configuration version to pin the proxy to. Must be `>= 1`; the diamond cut
   * manager reverts with `VersionZero` on `0`. Callers that want the most recent
   * registered version read it via
   * `DiamondCutManager.getLatestVersionByConfiguration(configurationId)`
   * and pass the resolved number here.
   */
  version: number;

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
  receipt?: ContractTransactionReceipt;

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
 * - `version: N` (N >= 1) - Pinned proxy targeting configuration version N.
 *
 * The diamond cut manager rejects `version == 0` with `VersionZero`. Callers
 * that want the most recent registered version must read it first via
 * `DiamondCutManager.getLatestVersionByConfiguration(configurationId)` and
 * pass the resolved number into `options.version`.
 *
 * @param signer - Ethers signer for deploying the contract
 * @param options - Deployment options
 * @returns Deployment result with proxy address and metadata
 *
 * @example
 * ```typescript
 * import { deployResolverProxy } from '@scripts/infrastructure'
 *
 * // Pinned proxy (production)
 * const prodProxy = await deployResolverProxy(signer, {
 *     blrAddress: '0x123...',
 *     configurationId: EQUITY_CONFIG_ID,
 *     version: 1, // Pin to specific version (>= 1)
 *     rbac: [],
 * })
 *
 * // Resolve "latest" explicitly when needed
 * const blr = DiamondCutManager__factory.connect(blrAddress, signer)
 * const latest = await blr.getLatestVersionByConfiguration(EQUITY_CONFIG_ID)
 * const proxy = await deployResolverProxy(signer, {
 *     blrAddress, configurationId: EQUITY_CONFIG_ID, version: Number(latest), rbac: [],
 * })
 * ```
 */
export async function deployResolverProxy(
  signer: Signer,
  options: DeployResolverProxyOptions,
): Promise<DeployResolverProxyResult> {
  const {
    blrAddress,
    configurationId,
    version,
    rbac = [],
    network: _network,
    overrides = { gasLimit: GAS_LIMIT.default, ...hederaGasOverrides() },
    confirmations = 1,
  } = options;

  if (!Number.isInteger(version) || version < 1) {
    throw new Error(
      `deployResolverProxy: 'version' must be an integer >= 1, got ${version}. ` +
        "Call DiamondCutManager.getLatestVersionByConfiguration(configurationId) " +
        "first when targeting the latest registered version.",
    );
  }

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
    const resolverProxy = await ResolverProxyFactory.deploy(
      blrAddress,
      configurationId,
      version,
      rbac,
      overrides as any,
    );
    const deployTimeout = DEFAULT_TRANSACTION_TIMEOUT * 3;
    await Promise.race([
      resolverProxy.waitForDeployment(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`waitForDeployment timed out after ${deployTimeout}ms`)), deployTimeout),
      ),
    ]);

    const deployTx = resolverProxy.deploymentTransaction();
    if (deployTx) {
      info(`Transaction sent: ${deployTx.hash}`);
    }

    // Wait for deployment with proper timeout and confirmations
    let receipt: ContractTransactionReceipt | null = null;
    if (deployTx) {
      receipt = await deployTx.wait(confirmations);
    }

    const proxyAddress = await resolverProxy.getAddress();

    validateAddress(proxyAddress, "ResolverProxy address");

    if (receipt && deployTx) {
      const gasUsed = formatGasUsage(receipt, deployTx.gasLimit);
      debug(gasUsed);
    }

    success("ResolverProxy deployment complete");
    info(`  ResolverProxy: ${proxyAddress}`);

    return {
      success: true,
      contract: resolverProxy as unknown as Contract,
      proxyAddress,
      configurationId,
      version,
      receipt: receipt ?? undefined,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logError(`ResolverProxy deployment failed: ${errorMessage}`);

    throw new Error(`ResolverProxy deployment failed: ${errorMessage}`);
  }
}
