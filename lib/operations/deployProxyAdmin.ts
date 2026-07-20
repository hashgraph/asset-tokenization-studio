// SPDX-License-Identifier: Apache-2.0

/** Deploy the ProxyAdmin contract and return its typed instance. Throws on failure. */

import { Overrides, Signer } from "ethers";
import { ProxyAdmin, ProxyAdmin__factory } from "@contract-types";
import { DEFAULT_TRANSACTION_TIMEOUT } from "./constants";
import { gasLimitOverride } from "./utils/transaction";

export async function deployProxyAdmin(signer: Signer, overrides?: Overrides): Promise<ProxyAdmin> {
  const proxyAdmin = await new ProxyAdmin__factory(signer).deploy({
    ...gasLimitOverride(),
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  // Bounded wait — the Hedera relay can hang indefinitely
  const timeout = DEFAULT_TRANSACTION_TIMEOUT * 3;
  await Promise.race([
    proxyAdmin.waitForDeployment(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`waitForDeployment timed out after ${timeout}ms`)), timeout).unref?.(),
    ),
  ]);

  return proxyAdmin;
}
