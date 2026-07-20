// SPDX-License-Identifier: Apache-2.0

/**
 * Deploy a transparent upgradeable proxy: implementation + ProxyAdmin + proxy.
 * Any of the three pieces can be reused via the `existing*` options. Throws on
 * failure.
 */

import {
  Contract,
  ContractFactory,
  ContractTransactionReceipt,
  Overrides,
  Provider,
  Signer,
  TransactionReceipt,
} from "ethers";
import { ProxyAdmin, TransparentUpgradeableProxy } from "@contract-types";
import { DEFAULT_TRANSACTION_TIMEOUT } from "./constants";
import { waitForTransaction } from "./utils/transaction";
import { validateAddress } from "./utils/validation";
import { deployContract } from "./deployContract";
import { deployProxyAdmin } from "./deployProxyAdmin";
import { deployTransparentProxy } from "./deployTransparentProxy";

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
}

export interface DeployProxyResult {
  implementation: Contract;
  implementationAddress: string;
  proxy: TransparentUpgradeableProxy;
  proxyAddress: string;
  proxyAdmin: ProxyAdmin;
  proxyAdminAddress: string;
  /** Receipts of the pieces actually deployed (absent for reused instances) */
  receipts: {
    implementation?: TransactionReceipt | null;
    proxyAdmin?: TransactionReceipt | null;
    proxy?: ContractTransactionReceipt | null;
  };
}

export async function deployProxy(signer: Signer, options: DeployProxyOptions): Promise<DeployProxyResult> {
  const {
    implementationFactory,
    implementationArgs = [],
    existingImplementation,
    existingProxyAdmin,
    initData = "0x",
    overrides = {},
  } = options;

  const receipts: DeployProxyResult["receipts"] = {};

  // 1. Implementation (custom overrides allowed — some implementations are large)
  let implementation: Contract;
  let implementationAddress: string;
  if (existingImplementation) {
    implementation = existingImplementation;
    implementationAddress = await existingImplementation.getAddress();
  } else {
    const implResult = await deployContract(implementationFactory, implementationArgs, overrides);
    implementation = implResult.contract;
    implementationAddress = implResult.address;
    const implDeployTx = implementation.deploymentTransaction();
    if (implDeployTx && signer.provider) {
      receipts.implementation = await signer.provider.getTransactionReceipt(implDeployTx.hash);
    }
  }

  // 2. ProxyAdmin
  let proxyAdmin: ProxyAdmin;
  let proxyAdminAddress: string;
  if (existingProxyAdmin) {
    proxyAdmin = existingProxyAdmin;
    proxyAdminAddress = await existingProxyAdmin.getAddress();
  } else {
    proxyAdmin = await deployProxyAdmin(signer);
    proxyAdminAddress = await proxyAdmin.getAddress();
    const proxyAdminDeployTx = proxyAdmin.deploymentTransaction();
    if (proxyAdminDeployTx && signer.provider) {
      receipts.proxyAdmin = await signer.provider.getTransactionReceipt(proxyAdminDeployTx.hash);
    }
  }

  // 3. TransparentUpgradeableProxy
  const proxy = await deployTransparentProxy(signer, implementationAddress, proxyAdminAddress, initData);
  const proxyAddress = await proxy.getAddress();
  const proxyDeployTx = proxy.deploymentTransaction();
  if (proxyDeployTx) {
    receipts.proxy = await waitForTransaction(proxyDeployTx, DEFAULT_TRANSACTION_TIMEOUT);
  }

  return { implementation, implementationAddress, proxy, proxyAddress, proxyAdmin, proxyAdminAddress, receipts };
}

/** Read the implementation address from a proxy's EIP-1967 storage slot. */
export async function getProxyImplementation(provider: Provider, proxyAddress: string): Promise<string> {
  validateAddress(proxyAddress, "proxy address");

  // keccak256("eip1967.proxy.implementation") - 1
  const implSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  const implBytes = await provider.getStorage(proxyAddress, implSlot);

  const implementationAddress = "0x" + implBytes.slice(-40);
  validateAddress(implementationAddress, "implementation address from proxy");
  return implementationAddress;
}
