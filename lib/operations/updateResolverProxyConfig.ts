// SPDX-License-Identifier: Apache-2.0

/**
 * Update an already deployed ResolverProxy (Diamond pattern proxy) by calling
 * DiamondCutFacet functions via the proxy's fallback mechanism. This differs
 * from TUP (Transparent Upgradeable Proxy) upgrades, which change
 * implementations.
 *
 * Three update strategies, from narrowest to widest:
 * 1. updateResolverProxyVersion()  → updateConfigVersion(version)
 * 2. updateResolverProxyConfig()   → updateConfig(configId, version)
 * 3. updateResolverProxyResolver() → updateResolver(blr, configId, version)
 *
 * The signer must hold DEFAULT_ADMIN_ROLE on the proxy. All throw on failure.
 */

import { ContractTransactionResponse, Overrides, Provider, Signer } from "ethers";
import { DiamondFacet, DiamondFacet__factory } from "@contract-types";
import { DEFAULT_TRANSACTION_TIMEOUT } from "./constants";
import { extractRevertReason, waitForTransaction } from "./utils/transaction";
import { validateAddress } from "./utils/validation";

export interface ResolverProxyUpdateOptions {
  /** Transaction overrides */
  overrides?: Overrides;
}

export interface ResolverProxyConfigInfo {
  /** Current BusinessLogicResolver address */
  resolver: string;

  version: number;

  /** Current configuration ID */
  configurationId: string;

  /** Current version */
  configurationVersion: number;

  replacementEnabled: boolean;
}

export interface ResolverProxyUpdateResult {
  proxyAddress: string;
  /** Configuration before the update */
  previousConfig: ResolverProxyConfigInfo;
  /** Configuration after the update */
  newConfig: ResolverProxyConfigInfo;
  transactionHash: string;
}

/** Read the current ResolverProxy configuration via DiamondCutFacet.getConfigInfo(). */
export async function getResolverProxyConfigInfo(
  signerOrProvider: Signer | Provider,
  proxyAddress: string,
): Promise<ResolverProxyConfigInfo> {
  validateAddress(proxyAddress, "ResolverProxy address");

  const diamondCutFacet = DiamondFacet__factory.connect(proxyAddress, signerOrProvider);
  const [resolver, version, configId, configurationVersion, replacementEnabled] = await diamondCutFacet.getConfigInfo();

  return {
    resolver,
    version: Number(version),
    configurationId: configId,
    configurationVersion: Number(configurationVersion),
    replacementEnabled,
  };
}

/** Update only the version pointer, keeping the same BLR and configuration ID. */
export async function updateResolverProxyVersion(
  signer: Signer,
  proxyAddress: string,
  newVersion: number,
  options?: ResolverProxyUpdateOptions,
): Promise<ResolverProxyUpdateResult> {
  return applyUpdate(signer, proxyAddress, options, (facet, overrides) =>
    facet.updateConfigVersion(newVersion, overrides),
  );
}

/** Update the configuration ID and version, keeping the same BLR. */
export async function updateResolverProxyConfig(
  signer: Signer,
  proxyAddress: string,
  newConfigurationId: string,
  newVersion: number,
  options?: ResolverProxyUpdateOptions,
): Promise<ResolverProxyUpdateResult> {
  return applyUpdate(signer, proxyAddress, options, (facet, overrides) =>
    facet.updateConfig(newConfigurationId, newVersion, overrides),
  );
}

/** Full update: BLR address, configuration ID and version. */
export async function updateResolverProxyResolver(
  signer: Signer,
  proxyAddress: string,
  newBlrAddress: string,
  newConfigurationId: string,
  newVersion: number,
  options?: ResolverProxyUpdateOptions,
): Promise<ResolverProxyUpdateResult> {
  validateAddress(newBlrAddress, "new BLR address");
  return applyUpdate(signer, proxyAddress, options, (facet, overrides) =>
    // replacementEnabled=false matches what issued tokens use
    facet.updateResolver(newBlrAddress, newConfigurationId, newVersion, false, overrides),
  );
}

/** Shared flow: read config before, send the update, wait, read config after. */
async function applyUpdate(
  signer: Signer,
  proxyAddress: string,
  options: ResolverProxyUpdateOptions | undefined,
  send: (facet: DiamondFacet, overrides: Overrides) => Promise<ContractTransactionResponse>,
): Promise<ResolverProxyUpdateResult> {
  const { overrides = {} } = options ?? {};

  validateAddress(proxyAddress, "ResolverProxy address");
  const previousConfig = await getResolverProxyConfigInfo(signer, proxyAddress);

  const diamondCutFacet = DiamondFacet__factory.connect(proxyAddress, signer);
  let tx: ContractTransactionResponse;
  try {
    tx = await send(diamondCutFacet, overrides);
  } catch (err) {
    // Surface the decoded revert reason (custom errors like AccountHasNoRole)
    throw new Error(`ResolverProxy update failed: ${extractRevertReason(err)}`);
  }
  const receipt = await waitForTransaction(tx, DEFAULT_TRANSACTION_TIMEOUT);

  const newConfig = await getResolverProxyConfigInfo(signer, proxyAddress);
  return { proxyAddress, previousConfig, newConfig, transactionHash: receipt.hash };
}
