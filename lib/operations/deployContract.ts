// SPDX-License-Identifier: Apache-2.0

/** Atomic operation: deploy a single contract. Throws if the deploy fails or times out. */

import { Contract, ContractFactory, Overrides } from "ethers";
import { DEFAULT_TRANSACTION_TIMEOUT } from "./constants";
import { gasLimitOverride } from "./utils/transaction";

export interface DeployedContract {
  contract: Contract;
  address: string;
}

/**
 * Deploy a single contract using a ContractFactory (TypeChain or ethers).
 *
 * Gas is auto-estimated by the provider (fixed limit only under coverage —
 * see gasLimitOverride). The wait is bounded because the Hedera relay can hang.
 */
export async function deployContract(
  factory: ContractFactory,
  args: unknown[] = [],
  overrides: Overrides = {},
): Promise<DeployedContract> {
  const contract = await factory.deploy(...args, { ...gasLimitOverride(), ...overrides });

  const timeout = DEFAULT_TRANSACTION_TIMEOUT * 3;
  await Promise.race([
    contract.waitForDeployment(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`waitForDeployment timed out after ${timeout}ms`)), timeout).unref?.(),
    ),
  ]);

  return { contract: contract as unknown as Contract, address: await contract.getAddress() };
}
