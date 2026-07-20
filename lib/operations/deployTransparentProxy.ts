// SPDX-License-Identifier: Apache-2.0

/**
 * Deploy a TransparentUpgradeableProxy and return its typed instance.
 * Gas is auto-estimated. `initData` is an encoded call or '0x'.
 * Throws on failure.
 */

import { Signer } from "ethers";
import { TransparentUpgradeableProxy, TransparentUpgradeableProxy__factory } from "@contract-types";
import { DEFAULT_TRANSACTION_TIMEOUT } from "./constants";
import { gasLimitOverride } from "./utils/transaction";

export async function deployTransparentProxy(
  signer: Signer,
  implementationAddress: string,
  proxyAdminAddress: string,
  initData: string,
): Promise<TransparentUpgradeableProxy> {
  const proxy = await new TransparentUpgradeableProxy__factory(signer).deploy(
    implementationAddress,
    proxyAdminAddress,
    initData,
    gasLimitOverride(),
  );

  // Bounded wait — the Hedera relay can hang indefinitely
  const timeout = DEFAULT_TRANSACTION_TIMEOUT * 3;
  await Promise.race([
    proxy.waitForDeployment(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`waitForDeployment timed out after ${timeout}ms`)), timeout).unref?.(),
    ),
  ]);

  return proxy;
}
