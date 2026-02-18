// SPDX-License-Identifier: Apache-2.0

/**
 * Deploy proxy operation.
 *
 * Atomic operation for deploying transparent upgradeable proxies with
 * implementation contracts and ProxyAdmin using TypeChain.
 *
 * @module core/operations/deployProxy
 */

import {
  Contract,
  ContractFactory,
  ContractTransactionReceipt,
  Overrides,
  Signer,
  Provider,
  TransactionReceipt,
} from "ethers";
import { ProxyAdmin, TransparentUpgradeableProxy } from "@contract-types";
import {
  DEFAULT_TRANSACTION_TIMEOUT,
  debug,
  deployContract,
  deployProxyAdmin,
  deployTransparentProxy,
  error as logError,
  extractRevertReason,
  formatGasUsage,
  GAS_LIMIT,
  info,
  section,
  success,
  validateAddress,
  waitForTransaction,
} from "@scripts/infrastructure";

/**
 * Options for deploying a transparent upgradeable proxy.
 */
export interface DeployProxyOptions {
  /** Implementation contract factory (from TypeChain or ethers) */
  implementationFactory: ContractFactory;
  /** Constructor arguments for implementation */
  implementationArgs?: unknown[];
  /** Optional existing implementation contract instance (skips deployment) */
  existingImplementation?: Contract;
  /** Optional existing ProxyAdmin contract instance (skips deployment) */
  existingProxyAdmin?: ProxyAdmin;
  /** Initialization data to pass to proxy */
  initData?: string;
  /** Transaction overrides (applies only to implementation deployment) */
  overrides?: Overrides;
  /** Number of confirmations to wait for (default: 1) */
  confirmations?: number;
  /** Enable post-deployment verification (default: true) */
  verifyDeployment?: boolean;
}

/**
 * Result of proxy deployment.
 */
export interface DeployProxyResult {
  /** Implementation contract instance */
  implementation: Contract;
  /** Implementation address */
  implementationAddress: string;
  /** Proxy contract instance (typed as TransparentUpgradeableProxy) */
  proxy: TransparentUpgradeableProxy;
  /** Proxy address */
  proxyAddress: string;
  /** ProxyAdmin contract instance (typed) */
  proxyAdmin: ProxyAdmin;
  /** ProxyAdmin address */
  proxyAdminAddress: string;
  /** Transaction receipts */
  receipts: {
    implementation?: TransactionReceipt | null;
    proxyAdmin?: TransactionReceipt | null;
    proxy?: ContractTransactionReceipt | null;
  };
}

/**
 * Deploy a transparent upgradeable proxy with implementation and ProxyAdmin.
 *
 * This operation handles three deployments:
 * 1. Implementation contract (or uses existing instance)
 * 2. ProxyAdmin contract (or uses existing instance) - always uses GAS_LIMIT.default
 * 3. TransparentUpgradeableProxy pointing to implementation - always uses GAS_LIMIT.default
 *
 * **Gas Limit Strategy**:
 * - Implementation: Uses custom `overrides` parameter for complex contracts
 * - ProxyAdmin: Always uses GAS_LIMIT.default (3M gas)
 * - TransparentUpgradeableProxy: Always uses GAS_LIMIT.default (3M gas)
 *
 * @param signer - Ethers.js signer
 * @param options - Proxy deployment options
 * @returns Deployment result with all contract instances
 * @throws Error if any deployment fails
 *
 * @example
 * ```typescript
 * import { ethers } from 'hardhat'
 * import { BusinessLogicResolver__factory } from '@contract-types'
 * import { deployProxy } from '@scripts/infrastructure'
 *
 * const signer = (await ethers.getSigners())[0]
 * const factory = new BusinessLogicResolver__factory(signer)
 *
 * // Deploy new proxy with all new contracts
 * const result = await deployProxy(signer, {
 *   implementationFactory: factory,
 *   implementationArgs: [],
 *   initData: '0x',
 *   overrides: { gasLimit: 10_000_000 } // Only affects implementation
 * })
 *
 * // Reuse existing contracts
 * const result2 = await deployProxy(signer, {
 *   implementationFactory: factory,
 *   existingImplementation: result.implementation,
 *   existingProxyAdmin: result.proxyAdmin,
 *   initData: '0x',
 * })
 *
 * console.log(`Proxy: ${result.proxyAddress}`)
 * console.log(`Implementation: ${result.implementationAddress}`)
 * console.log(`ProxyAdmin: ${result.proxyAdminAddress}`)
 * ```
 */
export async function deployProxy(signer: Signer, options: DeployProxyOptions): Promise<DeployProxyResult> {
  const {
    implementationFactory,
    implementationArgs = [],
    existingImplementation,
    existingProxyAdmin,
    initData = "0x",
    overrides = {},
    confirmations = 1,
    verifyDeployment = true,
  } = options;

  const deployOverrides: Overrides = { ...overrides };
  const receipts: DeployProxyResult["receipts"] = {};

  // Get contract name from factory for logging
  const implementationContract = implementationFactory.constructor.name.replace("__factory", "") || "Contract";

  try {
    section(`Deploying Proxy for ${implementationContract}`);

    // Step 1: Deploy or use existing implementation
    let implementationAddress: string;
    let implementation: Contract;

    if (existingImplementation) {
      implementation = existingImplementation;
      implementationAddress = await existingImplementation.getAddress();
      info(`Using existing implementation at ${implementationAddress}`);
    } else {
      info(`Deploying implementation: ${implementationContract}`);
      const implResult = await deployContract(implementationFactory, {
        args: implementationArgs,
        overrides: deployOverrides,
        confirmations,
        verifyDeployment,
      });

      if (!implResult.success || !implResult.contract || !implResult.address) {
        throw new Error(`Implementation deployment failed: ${implResult.error || "Unknown error"}`);
      }

      implementation = implResult.contract;
      implementationAddress = implResult.address;

      if (implResult.transactionHash && signer.provider) {
        receipts.implementation = await signer.provider.getTransactionReceipt(implResult.transactionHash);
      }
    }

    validateAddress(implementationAddress, "implementation address");

    // Step 2: Deploy or use existing ProxyAdmin
    let proxyAdminAddress: string;
    let proxyAdmin: ProxyAdmin;

    if (existingProxyAdmin) {
      proxyAdmin = existingProxyAdmin;
      proxyAdminAddress = await existingProxyAdmin.getAddress();
      info(`Using existing ProxyAdmin at ${proxyAdminAddress}`);
    } else {
      info("Deploying ProxyAdmin");
      proxyAdmin = await deployProxyAdmin(signer, {
        gasLimit: GAS_LIMIT.default,
      });
      proxyAdminAddress = await proxyAdmin.getAddress();

      // Get receipt if available
      const proxyAdminDeployTx = proxyAdmin.deploymentTransaction();
      if (proxyAdminDeployTx && signer.provider) {
        receipts.proxyAdmin = await signer.provider.getTransactionReceipt(proxyAdminDeployTx.hash);
      }
    }

    validateAddress(proxyAdminAddress, "ProxyAdmin address");

    // Step 3: Deploy TransparentUpgradeableProxy
    const proxy = await deployTransparentProxy(signer, implementationAddress, proxyAdminAddress, initData);
    const proxyAddress = await proxy.getAddress();

    // Get receipt if available
    const proxyDeployTx = proxy.deploymentTransaction();
    if (proxyDeployTx) {
      const proxyReceipt = await waitForTransaction(proxyDeployTx, confirmations, DEFAULT_TRANSACTION_TIMEOUT);

      receipts.proxy = proxyReceipt;

      const gasUsed = formatGasUsage(proxyReceipt, proxyDeployTx.gasLimit);
      debug(gasUsed);
    }

    success(`Proxy deployment complete`);
    info(`  Proxy:          ${proxyAddress}`);
    info(`  Implementation: ${implementationAddress}`);
    info(`  ProxyAdmin:     ${proxyAdminAddress}`);

    return {
      implementation,
      implementationAddress,
      proxy,
      proxyAddress,
      proxyAdmin,
      proxyAdminAddress,
      receipts,
    };
  } catch (err) {
    const errorMessage = extractRevertReason(err);
    logError(`Proxy deployment failed: ${errorMessage}`);
    throw err;
  }
}

/**
 * Deploy multiple proxies with shared ProxyAdmin.
 *
 * Deploys one ProxyAdmin and multiple proxies, reusing the ProxyAdmin
 * for all proxies to save gas and simplify management.
 *
 * @param signer - Ethers.js signer
 * @param proxies - Array of proxy deployment options (without existingProxyAdmin)
 * @param sharedProxyAdmin - Optional existing ProxyAdmin instance to reuse
 * @returns Array of deployment results
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory, Factory__factory } from '@contract-types'
 * import { deployMultipleProxies } from '@scripts/infrastructure'
 *
 * const signer = (await ethers.getSigners())[0]
 * const results = await deployMultipleProxies(signer, [
 *   { implementationFactory: new BusinessLogicResolver__factory(signer), initData: '0x' },
 *   { implementationFactory: new Factory__factory(signer), initData: '0x' }
 * ])
 * ```
 */
export async function deployMultipleProxies(
  signer: Signer,
  proxies: Omit<DeployProxyOptions, "existingProxyAdmin">[],
  sharedProxyAdmin?: ProxyAdmin,
): Promise<DeployProxyResult[]> {
  const results: DeployProxyResult[] = [];

  // Deploy or use shared ProxyAdmin
  let proxyAdmin: ProxyAdmin;

  if (sharedProxyAdmin) {
    proxyAdmin = sharedProxyAdmin;
    info(`Using shared ProxyAdmin at ${await proxyAdmin.getAddress()}`);
  } else {
    info("Deploying shared ProxyAdmin for all proxies");
    proxyAdmin = await deployProxyAdmin(signer, {
      gasLimit: GAS_LIMIT.default,
    });
    success(`Shared ProxyAdmin deployed at ${await proxyAdmin.getAddress()}`);
  }

  // Deploy all proxies with shared ProxyAdmin
  for (const proxyOptions of proxies) {
    const result = await deployProxy(signer, {
      ...proxyOptions,
      existingProxyAdmin: proxyAdmin,
    });
    results.push(result);
  }

  return results;
}

/**
 * Get the implementation address from a deployed proxy.
 *
 * @param provider - Ethers.js provider
 * @param proxyAddress - Address of the proxy
 * @returns Implementation address
 *
 * @example
 * ```typescript
 * const provider = new ethers.JsonRpcProvider(rpcUrl)
 * const implAddress = await getProxyImplementation(provider, '0x123...')
 * console.log(`Current implementation: ${implAddress}`)
 * ```
 */
export async function getProxyImplementation(provider: Provider, proxyAddress: string): Promise<string> {
  try {
    validateAddress(proxyAddress, "proxy address");

    // Read implementation from EIP-1967 storage slot
    // keccak256("eip1967.proxy.implementation") - 1
    const implSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

    const implBytes = await provider.getStorage(proxyAddress, implSlot);

    // Convert bytes32 to address (take last 20 bytes)
    const implementationAddress = "0x" + implBytes.slice(-40);

    validateAddress(implementationAddress, "implementation address from proxy");

    return implementationAddress;
  } catch (err) {
    const errorMessage = extractRevertReason(err);
    logError(`Failed to get implementation from proxy ${proxyAddress}: ${errorMessage}`);
    throw err;
  }
}

/**
 * Get the ProxyAdmin address from a deployed proxy.
 *
 * @param provider - Ethers.js provider
 * @param proxyAddress - Address of the proxy
 * @returns ProxyAdmin address
 *
 * @example
 * ```typescript
 * const provider = new ethers.JsonRpcProvider(rpcUrl)
 * const adminAddress = await getProxyAdmin(provider, '0x123...')
 * console.log(`ProxyAdmin: ${adminAddress}`)
 * ```
 */
export async function getProxyAdmin(provider: Provider, proxyAddress: string): Promise<string> {
  try {
    validateAddress(proxyAddress, "proxy address");

    // Read admin from EIP-1967 storage slot
    // keccak256("eip1967.proxy.admin") - 1
    const adminSlot = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

    const adminBytes = await provider.getStorage(proxyAddress, adminSlot);

    // Convert bytes32 to address (take last 20 bytes)
    const proxyAdminAddress = "0x" + adminBytes.slice(-40);

    validateAddress(proxyAdminAddress, "ProxyAdmin address from proxy");

    return proxyAdminAddress;
  } catch (err) {
    const errorMessage = extractRevertReason(err);
    logError(`Failed to get ProxyAdmin from proxy ${proxyAddress}: ${errorMessage}`);
    throw err;
  }
}
