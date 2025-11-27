// SPDX-License-Identifier: Apache-2.0

/**
 * TransparentUpgradeableProxy deployment module.
 *
 * High-level operation for deploying TransparentUpgradeableProxy using TypeChain.
 *
 * @module core/operations/transparentProxyDeployment
 */

import { Signer } from "ethers";
import { TransparentUpgradeableProxy, TransparentUpgradeableProxy__factory } from "@contract-types";
import { error as logError, info, section, success, validateAddress, GAS_LIMIT } from "@scripts/infrastructure";

/**
 * Deploy TransparentUpgradeableProxy contract.
 *
 * Returns typed TransparentUpgradeableProxy contract instance.
 * Always uses GAS_LIMIT.default (3M gas) for deployment.
 *
 * @param signer - Ethers.js signer
 * @param implementationAddress - Implementation contract address
 * @param proxyAdminAddress - ProxyAdmin contract address
 * @param initData - Initialization data (encoded function call or '0x')
 * @returns Typed TransparentUpgradeableProxy contract instance
 *
 * @example
 * ```typescript
 * import { ethers } from 'hardhat'
 * import { deployTransparentProxy } from '@scripts/infrastructure'
 *
 * const signer = (await ethers.getSigners())[0]
 * const proxy = await deployTransparentProxy(
 *   signer,
 *   implementationAddress,
 *   proxyAdminAddress,
 *   '0x'
 * )
 *
 * console.log(`Proxy: ${proxy.address}`)
 * ```
 */
export async function deployTransparentProxy(
  signer: Signer,
  implementationAddress: string,
  proxyAdminAddress: string,
  initData: string,
): Promise<TransparentUpgradeableProxy> {
  section("Deploying TransparentUpgradeableProxy");

  try {
    validateAddress(implementationAddress, "implementation address");
    validateAddress(proxyAdminAddress, "proxy admin address");

    info("Deploying TransparentUpgradeableProxy...");
    info(`  Implementation: ${implementationAddress}`);
    info(`  ProxyAdmin: ${proxyAdminAddress}`);
    info(`  Init Data: ${initData}`);

    const proxy = await new TransparentUpgradeableProxy__factory(signer).deploy(
      implementationAddress,
      proxyAdminAddress,
      initData,
      {
        gasLimit: GAS_LIMIT.default,
      },
    );
    await proxy.deployed();

    success("TransparentUpgradeableProxy deployment complete");
    info(`  Proxy: ${proxy.address}`);

    return proxy;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logError(`TransparentUpgradeableProxy deployment failed: ${errorMessage}`);

    throw new Error(`TransparentUpgradeableProxy deployment failed: ${errorMessage}`);
  }
}
