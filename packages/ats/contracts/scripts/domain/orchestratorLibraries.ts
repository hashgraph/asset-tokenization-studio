// SPDX-License-Identifier: Apache-2.0

/**
 * Orchestrator library address management for external library linking.
 *
 * External orchestrator libraries (TokenCoreOps, HoldOps, ClearingOps, ClearingReadOps)
 * use Solidity `public` functions, which means they are deployed as separate contracts
 * and their addresses must be linked into facet bytecode at deployment time.
 *
 * This module provides:
 * - Address storage/retrieval for deployed orchestrator libraries
 * - `getLibLinks()` helper that returns TypeChain-format link addresses for factory constructors
 * - `deployOrchestratorLibraries()` to deploy all 4 libraries in correct dependency order
 *
 * @module domain/orchestratorLibraries
 */

import { Signer } from "ethers";
import { info } from "@scripts/infrastructure";

/**
 * Deployed addresses of all orchestrator libraries.
 */
export interface OrchestratorLibraryAddresses {
  tokenCoreOps: string;
  holdOps: string;
  clearingOps: string;
  clearingReadOps: string;
}

/**
 * Library key constants matching TypeChain's linkBytecode format.
 * These are the keys used in Hardhat artifact `linkReferences` and TypeChain `LibraryAddresses` interfaces.
 */
export const LIBRARY_KEYS = {
  tokenCoreOps: "contracts/lib/orchestrator/TokenCoreOps.sol:TokenCoreOps",
  holdOps: "contracts/lib/orchestrator/HoldOps.sol:HoldOps",
  clearingOps: "contracts/lib/orchestrator/ClearingOps.sol:ClearingOps",
  clearingReadOps: "contracts/lib/orchestrator/ClearingReadOps.sol:ClearingReadOps",
} as const;

/**
 * Reverse mapping from TypeChain link key to short library name.
 */
export const REVERSE_LIBRARY_KEYS: Record<string, keyof typeof LIBRARY_KEYS> = Object.fromEntries(
  Object.entries(LIBRARY_KEYS).map(([k, v]) => [v, k as keyof typeof LIBRARY_KEYS]),
) as Record<string, keyof typeof LIBRARY_KEYS>;

// Module-level state
let _addresses: OrchestratorLibraryAddresses | undefined;

/**
 * Set deployed orchestrator library addresses.
 * Must be called before any factory that requires library linking is constructed.
 */
export function setOrchestratorLibraryAddresses(addresses: OrchestratorLibraryAddresses): void {
  _addresses = addresses;
}

/**
 * Get deployed orchestrator library addresses.
 * @throws Error if addresses have not been set via `setOrchestratorLibraryAddresses()`
 */
export function getOrchestratorLibraryAddresses(): OrchestratorLibraryAddresses {
  if (!_addresses) {
    throw new Error(
      "Orchestrator library addresses not set. " +
        "Call setOrchestratorLibraryAddresses() or deployOrchestratorLibraries() before constructing facet factories.",
    );
  }
  return _addresses;
}

/**
 * Check if orchestrator library addresses have been set.
 */
export function hasOrchestratorLibraryAddresses(): boolean {
  return _addresses !== undefined;
}

/**
 * Get library link addresses in TypeChain format for factory construction.
 *
 * Returns a Record with TypeChain-format keys (e.g., "contracts/lib/orchestrator/TokenCoreOps.sol:TokenCoreOps")
 * mapped to deployed library addresses. This can be passed directly to TypeChain factory constructors.
 *
 * @param libs - Library names to include
 * @returns Record with TypeChain-format keys and deployed addresses
 *
 * @example
 * ```typescript
 * // For a facet that needs TokenCoreOps:
 * new BondUSAFacet__factory(getLibLinks("tokenCoreOps") as any, signer)
 *
 * // For a facet that needs ClearingOps + ClearingReadOps:
 * new ClearingActionsFacet__factory(getLibLinks("clearingOps", "clearingReadOps") as any, signer)
 * ```
 */
export function getLibLinks(...libs: (keyof typeof LIBRARY_KEYS)[]): Record<string, string> {
  const addrs = getOrchestratorLibraryAddresses();
  const result: Record<string, string> = {};
  for (const lib of libs) {
    result[LIBRARY_KEYS[lib]] = addrs[lib];
  }
  return result;
}

/**
 * Deploy all orchestrator libraries in correct dependency order.
 *
 * Deployment order:
 * 1. TokenCoreOps, HoldOps, ClearingReadOps (no dependencies)
 * 2. ClearingOps (depends on HoldOps + ClearingReadOps)
 *
 * After deployment, automatically calls `setOrchestratorLibraryAddresses()`.
 *
 * @param signer - Ethers.js signer for deploying contracts
 * @returns Deployed library addresses
 */
export async function deployOrchestratorLibraries(signer: Signer): Promise<OrchestratorLibraryAddresses> {
  // Dynamic import to avoid eager loading of typechain
  const { TokenCoreOps__factory, HoldOps__factory, ClearingReadOps__factory, ClearingOps__factory } = await import(
    "@contract-types"
  );

  info("   Deploying orchestrator libraries...");

  // Phase 1: Deploy libraries with no dependencies (in parallel)
  const [tokenCoreOps, holdOps, clearingReadOps] = await Promise.all([
    new TokenCoreOps__factory(signer).deploy(),
    new HoldOps__factory(signer).deploy(),
    new ClearingReadOps__factory(signer).deploy(),
  ]);

  await Promise.all([
    tokenCoreOps.waitForDeployment(),
    holdOps.waitForDeployment(),
    clearingReadOps.waitForDeployment(),
  ]);

  const holdOpsAddr = await holdOps.getAddress();
  const clearingReadOpsAddr = await clearingReadOps.getAddress();

  info(`   ✓ TokenCoreOps deployed at ${await tokenCoreOps.getAddress()}`);
  info(`   ✓ HoldOps deployed at ${holdOpsAddr}`);
  info(`   ✓ ClearingReadOps deployed at ${clearingReadOpsAddr}`);

  // Phase 2: Deploy ClearingOps (depends on HoldOps + ClearingReadOps)
  const clearingOps = await new ClearingOps__factory(
    {
      [LIBRARY_KEYS.holdOps]: holdOpsAddr,
      [LIBRARY_KEYS.clearingReadOps]: clearingReadOpsAddr,
    } as any,
    signer,
  ).deploy();
  await clearingOps.waitForDeployment();

  info(`   ✓ ClearingOps deployed at ${await clearingOps.getAddress()}`);

  const addresses: OrchestratorLibraryAddresses = {
    tokenCoreOps: await tokenCoreOps.getAddress(),
    holdOps: holdOpsAddr,
    clearingOps: await clearingOps.getAddress(),
    clearingReadOps: clearingReadOpsAddr,
  };

  setOrchestratorLibraryAddresses(addresses);
  info("   ✅ All orchestrator libraries deployed and addresses set");

  return addresses;
}
