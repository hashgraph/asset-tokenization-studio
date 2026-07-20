// SPDX-License-Identifier: Apache-2.0

/**
 * Upgrade a transparent proxy's implementation via its ProxyAdmin. Throws on
 * failure; returns `upgraded: false` when the proxy already points to the
 * target implementation.
 */

import { ContractFactory, Overrides, Provider } from "ethers";
import { ProxyAdmin } from "@contract-types";
import { DEFAULT_TRANSACTION_TIMEOUT } from "./constants";
import { waitForTransaction } from "./utils/transaction";
import { validateAddress } from "./utils/validation";
import { deployContract } from "./deployContract";
import { getProxyImplementation } from "./deployProxy";

export interface UpgradeProxyOptions<F extends ContractFactory = ContractFactory> {
  /** Address of the proxy contract to upgrade */
  proxyAddress: string;

  /**
   * Factory for the new implementation (deploy-and-upgrade). Mutually
   * exclusive with `newImplementationAddress`.
   */
  newImplementationFactory?: F;

  /** Constructor arguments when deploying via `newImplementationFactory` */
  newImplementationArgs?: unknown[];

  /**
   * Address of an already-deployed implementation (prepare-then-upgrade).
   * Mutually exclusive with `newImplementationFactory`.
   */
  newImplementationAddress?: string;

  /**
   * ABI-encoded initialization calldata. When set, upgradeAndCall() runs it on
   * the proxy after the upgrade (e.g. `encodeFunctionData('initializeV2', [x])`).
   */
  initData?: string;

  /** Transaction overrides (gas limit, gas price, etc.) */
  overrides?: Overrides;
}

export interface UpgradeProxyResult {
  proxyAddress: string;
  oldImplementation: string;
  newImplementation: string;
  /** false when the proxy already pointed to the target implementation */
  upgraded: boolean;
  transactionHash?: string;
}

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
  } = options;

  const provider = proxyAdmin.runner?.provider as Provider | undefined;
  if (!provider) {
    throw new Error(
      "ProxyAdmin must be connected to a signer with a provider. " +
        "Use ProxyAdmin__factory.connect(address, signer) where signer has a provider.",
    );
  }

  validateAddress(proxyAddress, "proxy address");
  if ((await provider.getCode(proxyAddress)) === "0x") {
    throw new Error(`No contract found at proxy address ${proxyAddress}`);
  }
  const proxyAdminAddress = await proxyAdmin.getAddress();
  if ((await provider.getCode(proxyAdminAddress)) === "0x") {
    throw new Error(`No contract found at ProxyAdmin address ${proxyAdminAddress}`);
  }

  const oldImplementation = await getProxyImplementation(provider, proxyAddress);

  // Resolve the new implementation: reuse the given address or deploy fresh
  let newImplementation: string;
  if (existingNewImplAddress) {
    if ((await provider.getCode(existingNewImplAddress)) === "0x") {
      throw new Error(`No contract found at new implementation address ${existingNewImplAddress}`);
    }
    newImplementation = existingNewImplAddress;
  } else {
    if (!newImplementationFactory) {
      throw new Error("Either newImplementationFactory or newImplementationAddress must be provided");
    }
    newImplementation = (await deployContract(newImplementationFactory, newImplementationArgs, overrides)).address;
  }

  if (oldImplementation.toLowerCase() === newImplementation.toLowerCase()) {
    return { proxyAddress, oldImplementation, newImplementation, upgraded: false };
  }

  const upgradeTx =
    initData && initData !== "0x"
      ? await proxyAdmin.upgradeAndCall(proxyAddress, newImplementation, initData, overrides)
      : await proxyAdmin.upgrade(proxyAddress, newImplementation, overrides);
  const receipt = await waitForTransaction(upgradeTx, DEFAULT_TRANSACTION_TIMEOUT);

  // The upgrade tx succeeding does not prove the slot changed — verify it did
  const currentImplementation = await getProxyImplementation(provider, proxyAddress);
  if (currentImplementation.toLowerCase() !== newImplementation.toLowerCase()) {
    throw new Error(`Upgrade verification failed: proxy still points to ${currentImplementation}`);
  }

  return { proxyAddress, oldImplementation, newImplementation, upgraded: true, transactionHash: receipt.hash };
}

/**
 * Check if a proxy needs an upgrade by comparing implementations.
 * On read errors it returns true — better to attempt an upgrade than skip it.
 */
export async function proxyNeedsUpgrade(
  provider: Provider,
  proxyAddress: string,
  expectedImplementation: string,
): Promise<boolean> {
  try {
    validateAddress(proxyAddress, "proxy address");
    validateAddress(expectedImplementation, "expected implementation address");
    const currentImplementation = await getProxyImplementation(provider, proxyAddress);
    return currentImplementation.toLowerCase() !== expectedImplementation.toLowerCase();
  } catch {
    return true;
  }
}

/**
 * Deploy the new implementation WITHOUT upgrading the proxy, and return its
 * address. Useful to test an implementation before the actual upgrade.
 */
export async function prepareUpgrade(
  implementationFactory: ContractFactory,
  implementationArgs: unknown[] = [],
  overrides: Overrides = {},
): Promise<string> {
  return (await deployContract(implementationFactory, implementationArgs, overrides)).address;
}
