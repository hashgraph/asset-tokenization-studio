// SPDX-License-Identifier: Apache-2.0

/**
 * Deploy a ResolverProxy (Diamond pattern proxy) routed through a
 * BusinessLogicResolver. Throws on failure.
 */

import { Contract, ContractTransactionReceipt, Overrides, Signer } from "ethers";
import { DEFAULT_TRANSACTION_TIMEOUT } from "./constants";
import { gasLimitOverride } from "./utils/transaction";
import { validateAddress } from "./utils/validation";

export interface ResolverProxyRbac {
  /** Role identifier (bytes32) */
  role: string;
  /** Array of addresses to grant this role */
  members: string[];
}

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

  /**
   * Whether selector replacement is permitted for the proxy's configuration
   * (the `replacementEnabled` flag of `ResolverProxyConfiguration`). Defaults
   * to `false`, the value issued tokens use; the Factory is deployed with
   * `true`, matching genesis.
   */
  replacementEnabled?: boolean;

  /** Transaction overrides */
  overrides?: Overrides;
}

export interface DeployResolverProxyResult {
  contract: Contract;
  proxyAddress: string;
  receipt?: ContractTransactionReceipt;
}

export async function deployResolverProxy(
  signer: Signer,
  options: DeployResolverProxyOptions,
): Promise<DeployResolverProxyResult> {
  const {
    blrAddress,
    configurationId,
    version,
    rbac = [],
    replacementEnabled = false,
    overrides = gasLimitOverride(),
  } = options;

  if (!Number.isInteger(version) || version < 1) {
    throw new Error(
      `deployResolverProxy: 'version' must be an integer >= 1, got ${version}. ` +
        "Call DiamondCutManager.getLatestVersionByConfiguration(configurationId) " +
        "first when targeting the latest registered version.",
    );
  }
  validateAddress(blrAddress, "BLR address");

  // Dynamic import keeps the typechain graph out of module load (parallel-test cost)
  const { ResolverProxy__factory } = await import("@contract-types");
  const resolverProxy = await new ResolverProxy__factory(signer).deploy(
    blrAddress,
    { configurationId, configurationVersion: version, replacementEnabled },
    rbac,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    overrides as any,
  );

  // Bounded wait — the Hedera relay can hang indefinitely
  const timeout = DEFAULT_TRANSACTION_TIMEOUT * 3;
  await Promise.race([
    resolverProxy.waitForDeployment(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`waitForDeployment timed out after ${timeout}ms`)), timeout).unref?.(),
    ),
  ]);

  const receipt = await resolverProxy.deploymentTransaction()?.wait(1);
  return {
    contract: resolverProxy as unknown as Contract,
    proxyAddress: await resolverProxy.getAddress(),
    receipt: receipt ?? undefined,
  };
}
