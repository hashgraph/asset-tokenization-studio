// SPDX-License-Identifier: Apache-2.0

/**
 * Deploys the Factory entry point as a ResolverProxy parameterized with
 * CONFIG_IDS.factory. The BLR config MUST be registered before calling this
 * function — the Ignition FactoryConfiguration module or ats:blr:deploy-system
 * create it. Throws on failure.
 *
 * Off-chain callers continue to interact via the IFactory ABI on the returned
 * proxy address. The proxy mechanism is transparent to consumers.
 */

import { Signer } from "ethers";
import { ResolverProxy__factory } from "@contract-types";
import { CONFIG_IDS } from "@lib/domain";
import { gasLimitOverride } from "@lib/operations";

export interface DeployFactoryOptions {
  /** BLR address (required — FactoryProxy uses BLR for resolver dispatch) */
  blrAddress: string;

  /** Version of the factory configuration registered in the BLR (required) */
  factoryVersion: number;
}

export interface DeployFactoryResult {
  /** Factory proxy address (ResolverProxy instance) */
  factoryAddress: string;
}

/**
 * Deploy Factory as a ResolverProxy.
 *
 * Constructs `new ResolverProxy(blrAddress, CONFIG_IDS.factory, factoryVersion, [])`.
 * The FactoryProxy constructor validates that the config exists in BLR and reverts
 * if it does not — ensuring deployment order is enforced at the EVM level.
 */
export async function deployFactory(signer: Signer, options: DeployFactoryOptions): Promise<DeployFactoryResult> {
  const { blrAddress, factoryVersion } = options;

  if (!blrAddress) {
    throw new Error("deployFactory: blrAddress is required");
  }
  if (!factoryVersion) {
    throw new Error("deployFactory: factoryVersion is required");
  }

  const factoryProxy = await new ResolverProxy__factory(signer).deploy(
    blrAddress,
    { configurationId: CONFIG_IDS.factory, configurationVersion: factoryVersion, replacementEnabled: true },
    [], // empty rbacs — Factory is permissionless in v1
    gasLimitOverride(),
  );
  await factoryProxy.waitForDeployment();

  return { factoryAddress: await factoryProxy.getAddress() };
}
