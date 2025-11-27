// SPDX-License-Identifier: Apache-2.0

/**
 * Upgrade proxy operation.
 *
 * Atomic operation for upgrading transparent proxy implementations
 * with validation and verification.
 *
 * @module core/operations/upgradeProxy
 */

import { ContractFactory, Overrides, providers } from "ethers";
import { ProxyAdmin } from "@contract-types";
import {
  DEFAULT_TRANSACTION_TIMEOUT,
  UpgradeProxyOptions,
  UpgradeProxyResult,
  debug,
  deployContract,
  error as logError,
  extractRevertReason,
  formatGasUsage,
  getProxyImplementation,
  info,
  section,
  success,
  validateAddress,
  waitForTransaction,
  warn,
} from "@scripts/infrastructure";

/**
 * Upgrade a transparent proxy to a new implementation.
 *
 * This operation:
 * 1. Deploys new implementation (if factory provided) OR uses existing address
 * 2. Verifies ProxyAdmin ownership
 * 3. Upgrades proxy to new implementation via ProxyAdmin
 * 4. Optionally calls initialization function on proxy (upgradeAndCall)
 *
 * **Two Upgrade Patterns:**
 *
 * Pattern A - Deploy and Upgrade (one-step):
 * ```typescript
 * const result = await upgradeProxy(proxyAdmin, {
 *   proxyAddress: '0x123...',
 *   newImplementationFactory: BusinessLogicResolverV2__factory.connect(signer),
 *   newImplementationArgs: [],  // Constructor args for new implementation
 *   initData: encodedInitCall    // Optional: reinitialize after upgrade
 * })
 * ```
 *
 * Pattern B - Prepare then Upgrade (two-step, safer):
 * ```typescript
 * // Step 1: Deploy and test new implementation first
 * const newImplAddress = await prepareUpgrade(factory, args)
 * // ... test new implementation ...
 *
 * // Step 2: Upgrade to tested implementation
 * const result = await upgradeProxy(proxyAdmin, {
 *   proxyAddress: '0x123...',
 *   newImplementationAddress: newImplAddress,  // Use existing deployment
 *   initData: encodedInitCall                   // Optional: reinitialize
 * })
 * ```
 *
 * @param proxyAdmin - ProxyAdmin contract instance (MUST be connected to signer)
 * @param options - Upgrade options
 * @returns Upgrade result with old and new implementations
 * @throws Error if upgrade fails or if neither factory nor address provided
 *
 * @example Deploy new implementation and upgrade
 * ```typescript
 * import { ProxyAdmin__factory, BusinessLogicResolverV2__factory } from '@contract-types'
 *
 * const proxyAdmin = ProxyAdmin__factory.connect('0xAdmin...', signer)
 * const newImplFactory = BusinessLogicResolverV2__factory.connect(signer)
 *
 * const result = await upgradeProxy(proxyAdmin, {
 *   proxyAddress: '0x123...',
 *   newImplementationFactory: newImplFactory,
 *   newImplementationArgs: []  // Constructor params for implementation
 * })
 * ```
 *
 * @example Upgrade with reinitialization
 * ```typescript
 * // Encode initialization call
 * const initData = blrV2Interface.encodeFunctionData('initializeV2', [newParam])
 *
 * const result = await upgradeProxy(proxyAdmin, {
 *   proxyAddress: '0x123...',
 *   newImplementationFactory: BLRV2__factory.connect(signer),
 *   initData  // Will call upgradeAndCall instead of upgrade
 * })
 * ```
 */
export async function upgradeProxy<F extends ContractFactory = ContractFactory>(
  proxyAdmin: ProxyAdmin,
  options: UpgradeProxyOptions<F>,
): Promise<UpgradeProxyResult> {
  const {
    proxyAddress,
    newImplementationFactory,
    newImplementationArgs = [],
    newImplementationAddress: existingNewImplAddress,
    initData,
    overrides = {},
    verify = true,
  } = options;

  const deployOverrides: Overrides = { ...overrides };
  let oldImplementationAddress: string | undefined;
  const proxyAdminAddress = proxyAdmin.address;

  try {
    section(`Upgrading Proxy at ${proxyAddress}`);

    // Get provider from ProxyAdmin contract (must be connected to signer with provider)
    if (!proxyAdmin.provider) {
      throw new Error(
        "ProxyAdmin must be connected to a signer with a provider. " +
          "Use ProxyAdmin__factory.connect(address, signer) where signer has a provider.",
      );
    }

    const provider = proxyAdmin.provider;

    // Step 1: Validate proxy exists
    validateAddress(proxyAddress, "proxy address");
    const proxyCode = await provider.getCode(proxyAddress);
    if (proxyCode === "0x") {
      throw new Error(`No contract found at proxy address ${proxyAddress}`);
    }

    // Step 2: Get current implementation
    oldImplementationAddress = await getProxyImplementation(provider, proxyAddress);
    info(`Current implementation: ${oldImplementationAddress}`);

    // Step 3: Verify ProxyAdmin
    info(`Using ProxyAdmin: ${proxyAdminAddress}`);
    validateAddress(proxyAdminAddress, "ProxyAdmin address");

    // Verify ProxyAdmin has code
    const adminCode = await provider.getCode(proxyAdminAddress);
    if (adminCode === "0x") {
      throw new Error(`No contract found at ProxyAdmin address ${proxyAdminAddress}`);
    }

    // Step 4: Deploy or get new implementation
    let newImplementationAddress: string;

    if (existingNewImplAddress) {
      info(`Using existing implementation: ${existingNewImplAddress}`);
      newImplementationAddress = existingNewImplAddress;

      if (verify) {
        const implCode = await provider.getCode(newImplementationAddress);
        if (implCode === "0x") {
          throw new Error(`No contract found at new implementation address ${newImplementationAddress}`);
        }
      }
    } else {
      if (!newImplementationFactory) {
        throw new Error("Either newImplementationFactory or newImplementationAddress must be provided");
      }

      const contractName = newImplementationFactory.constructor.name.replace("__factory", "") || "Implementation";
      info(`Deploying new implementation: ${contractName}`);

      const implResult = await deployContract(newImplementationFactory, {
        args: newImplementationArgs,
        overrides: deployOverrides,
      });

      if (!implResult.success || !implResult.address) {
        throw new Error(`New implementation deployment failed: ${implResult.error || "Unknown error"}`);
      }

      newImplementationAddress = implResult.address;
    }

    validateAddress(newImplementationAddress, "new implementation address");

    // Check if already at this implementation
    if (oldImplementationAddress.toLowerCase() === newImplementationAddress.toLowerCase()) {
      warn("Proxy is already using this implementation");
      return {
        success: true,
        proxyAddress,
        oldImplementation: oldImplementationAddress,
        newImplementation: newImplementationAddress,
        upgraded: false,
      };
    }

    // Step 5: Perform upgrade
    let upgradeTx;

    if (initData && initData !== "0x") {
      info("Upgrading proxy with initialization...");
      debug(`Init data: ${initData}`);

      upgradeTx = await proxyAdmin.upgradeAndCall(proxyAddress, newImplementationAddress, initData, deployOverrides);
    } else {
      info("Upgrading proxy...");

      upgradeTx = await proxyAdmin.upgrade(proxyAddress, newImplementationAddress, deployOverrides);
    }

    info(`Upgrade transaction sent: ${upgradeTx.hash}`);

    const receipt = await waitForTransaction(upgradeTx, 1, DEFAULT_TRANSACTION_TIMEOUT);

    const gasUsed = formatGasUsage(receipt, upgradeTx.gasLimit);
    debug(gasUsed);

    // Step 6: Verify upgrade
    if (verify && provider) {
      const currentImplementation = await getProxyImplementation(provider, proxyAddress);

      if (currentImplementation.toLowerCase() !== newImplementationAddress.toLowerCase()) {
        throw new Error(`Upgrade verification failed: proxy still points to ${currentImplementation}`);
      }

      debug("Upgrade verified successfully");
    }

    success("Proxy upgraded successfully");
    info(`  Old implementation: ${oldImplementationAddress}`);
    info(`  New implementation: ${newImplementationAddress}`);

    return {
      success: true,
      proxyAddress,
      oldImplementation: oldImplementationAddress,
      newImplementation: newImplementationAddress,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toNumber(),
      upgraded: true,
    };
  } catch (err) {
    const errorMessage = extractRevertReason(err);
    logError(`Proxy upgrade failed: ${errorMessage}`);

    return {
      success: false,
      proxyAddress,
      oldImplementation: oldImplementationAddress || "unknown",
      newImplementation: existingNewImplAddress || "unknown",
      error: errorMessage,
      upgraded: false,
    };
  }
}

/**
 * Upgrade multiple proxies to new implementations.
 *
 * Useful for upgrading a suite of related contracts in sequence.
 *
 * @param proxyAdmin - Typed ProxyAdmin contract instance
 * @param upgrades - Array of upgrade options
 * @returns Map of proxy addresses to upgrade results
 *
 * @example
 * ```typescript
 * import { ProxyAdmin__factory, BLRV2__factory, FactoryV2__factory } from '@contract-types'
 *
 * const proxyAdmin = ProxyAdmin__factory.connect('0xAdmin...', signer)
 *
 * const results = await upgradeMultipleProxies(proxyAdmin, [
 *   { proxyAddress: '0x123...', newImplementationFactory: BLRV2__factory.connect(signer) },
 *   { proxyAddress: '0x456...', newImplementationFactory: FactoryV2__factory.connect(signer) }
 * ])
 *
 * for (const [address, result] of results) {
 *   if (result.success && result.upgraded) {
 *     console.log(`${address} upgraded`)
 *   }
 * }
 * ```
 */
export async function upgradeMultipleProxies(
  proxyAdmin: ProxyAdmin,
  upgrades: UpgradeProxyOptions[],
): Promise<Map<string, UpgradeProxyResult>> {
  const results = new Map<string, UpgradeProxyResult>();

  for (const upgradeOptions of upgrades) {
    const result = await upgradeProxy(proxyAdmin, upgradeOptions);
    results.set(upgradeOptions.proxyAddress, result);

    // Continue on failure but log
    if (!result.success) {
      logError(`Upgrade failed for ${upgradeOptions.proxyAddress}, continuing with remaining upgrades`);
    }
  }

  return results;
}

/**
 * Check if a proxy needs an upgrade by comparing implementations.
 *
 * @param provider - Ethers.js provider
 * @param proxyAddress - Address of the proxy
 * @param expectedImplementation - Expected implementation address
 * @returns true if proxy needs upgrade (current != expected)
 *
 * @example
 * ```typescript
 * const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
 * const needsUpgrade = await proxyNeedsUpgrade(
 *   provider,
 *   '0x123...',
 *   '0xNewImpl...'
 * )
 * if (needsUpgrade) {
 *   await upgradeProxy(proxyAdmin, { ... })
 * }
 * ```
 */
export async function proxyNeedsUpgrade(
  provider: providers.Provider,
  proxyAddress: string,
  expectedImplementation: string,
): Promise<boolean> {
  try {
    validateAddress(proxyAddress, "proxy address");
    validateAddress(expectedImplementation, "expected implementation address");

    const currentImplementation = await getProxyImplementation(provider, proxyAddress);

    return currentImplementation.toLowerCase() !== expectedImplementation.toLowerCase();
  } catch (err) {
    const errorMessage = extractRevertReason(err);
    logError(`Error checking if proxy needs upgrade: ${errorMessage}`);
    // Return true to be safe - better to attempt upgrade than skip it
    return true;
  }
}

/**
 * Prepare upgrade by deploying new implementation without upgrading proxy.
 *
 * Useful for testing new implementation before actual upgrade.
 *
 * @param implementationFactory - Contract factory for new implementation
 * @param implementationArgs - Constructor arguments
 * @param overrides - Transaction overrides
 * @returns Deployed implementation address
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolverV2__factory } from '@contract-types'
 *
 * // Deploy and test new implementation
 * const factory = BusinessLogicResolverV2__factory.connect(signer)
 * const newImplAddress = await prepareUpgrade(
 *   factory,
 *   []
 * )
 *
 * // ... test the new implementation ...
 *
 * // Then upgrade when ready
 * await upgradeProxy(proxyAdmin, {
 *   proxyAddress: '0x123...',
 *   newImplementationAddress: newImplAddress
 * })
 * ```
 */
export async function prepareUpgrade(
  implementationFactory: ContractFactory,
  implementationArgs: unknown[] = [],
  overrides: Overrides = {},
): Promise<string> {
  try {
    const contractName = implementationFactory.constructor.name.replace("__factory", "") || "Implementation";
    info(`Preparing upgrade: deploying ${contractName}`);

    const result = await deployContract(implementationFactory, {
      args: implementationArgs,
      overrides,
    });

    if (!result.success || !result.address) {
      throw new Error(`Failed to prepare upgrade: ${result.error || "Unknown error"}`);
    }

    success(`Implementation deployed at ${result.address}`);
    info("Ready for upgrade - use this address in upgradeProxy()");

    return result.address;
  } catch (err) {
    const errorMessage = extractRevertReason(err);
    logError(`Failed to prepare upgrade: ${errorMessage}`);
    throw err;
  }
}
