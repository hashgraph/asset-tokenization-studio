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
  clearingProtectedOps: string;
}

/**
 * Library key constants matching TypeChain's linkBytecode format.
 * These are the keys used in Hardhat artifact `linkReferences` and TypeChain `LibraryAddresses` interfaces.
 */
export const LIBRARY_KEYS = {
  tokenCoreOps: "contracts/domain/orchestrator/TokenCoreOps.sol:TokenCoreOps",
  holdOps: "contracts/domain/orchestrator/HoldOps.sol:HoldOps",
  clearingOps: "contracts/domain/orchestrator/ClearingOps.sol:ClearingOps",
  clearingReadOps: "contracts/domain/orchestrator/ClearingReadOps.sol:ClearingReadOps",
  clearingProtectedOps: "contracts/domain/orchestrator/ClearingProtectedOps.sol:ClearingProtectedOps",
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
 * Determine which orchestrator libraries a facet requires for TypeChain linking.
 *
 * Returns an array of library names that must be linked when deploying the facet.
 * Library-dependent facets use `public` functions from external libraries,
 * so their addresses must be provided to the TypeChain factory constructor.
 *
 * @param facetName - Name of the facet contract
 * @returns Array of library names (e.g., ["tokenCoreOps"], ["clearingOps", "clearingReadOps"])
 *
 * @example
 * ```typescript
 * getFacetRequiredLibraries("ClearingActionsFacet") // returns ["clearingOps", "clearingReadOps"]
 * getFacetRequiredLibraries("AccessControlFacet") // returns []
 * ```
 */
export function getFacetRequiredLibraries(facetName: string): Array<keyof typeof LIBRARY_KEYS> {
  return LIBRARY_DEPENDENT_FACETS[facetName] || [];
}

export const LIBRARY_DEPENDENT_FACETS: Record<string, Array<keyof typeof LIBRARY_KEYS>> = {
  // TokenCoreOps dependencies - ERC20 and ERC1410 token operations
  ERC20Facet: ["tokenCoreOps"],
  ERC20ReadFacet: ["tokenCoreOps"],
  ERC20VotesFacet: ["clearingReadOps"],
  ERC1410ManagementFacet: ["tokenCoreOps"],
  ERC1410TokenHolderFacet: ["tokenCoreOps"],
  ERC1410ReadFacet: ["tokenCoreOps"],
  ERC1410IssuerFacet: ["tokenCoreOps"],
  ERC1594Facet: ["tokenCoreOps"],
  ControllerFacet: ["tokenCoreOps"],
  ERC3643BatchFacet: ["tokenCoreOps"],
  BatchBurnFacet: ["tokenCoreOps"],
  ERC3643OperationsFacet: ["tokenCoreOps"],
  // HoldOps dependencies - hold/lock operations
  HoldManagementFacet: ["holdOps"],
  HoldFacet: ["holdOps"],
  HoldByPartitionFacet: ["holdOps"],
  // ClearingOps dependencies - clearing transfer operations
  ClearingActionsFacet: ["clearingOps"],
  ClearingTransferFacet: ["clearingOps", "clearingProtectedOps"],
  ClearingRedeemFacet: ["clearingOps", "clearingProtectedOps"],
  ClearingHoldCreationFacet: ["clearingOps", "clearingProtectedOps"],
  // ClearingReadOps dependencies - clearing read operations
  ClearingReadFacet: ["clearingReadOps"],
  // SnapshotsFacet + TotalBalanceFacet + BalanceTrackerFacet depend on SnapshotsStorageWrapper which uses ClearingReadOps
  SnapshotsFacet: ["clearingReadOps"],
  TotalBalanceFacet: ["clearingReadOps"],
  BalanceTrackerFacet: ["clearingReadOps"],
  // Layer 2/3 Bond read facets transitively reach ClearingReadOps via SnapshotsStorageWrapper
  BondUSAReadFacet: ["clearingReadOps"],
  BondUSAReadFixedRateFacet: ["clearingReadOps"],
  BondUSAReadKpiLinkedRateFacet: ["clearingReadOps"],
  BondUSAReadSustainabilityPerformanceTargetRateFacet: ["clearingReadOps"],
  // Layer 3 EquityUSA — same transitive dependency
  EquityUSAFacet: ["clearingReadOps"],
  // Layer 2 facet families — coupon/dividend/voting/amortization reach ClearingReadOps
  AmortizationFacet: ["clearingReadOps"],
  CouponFacet: ["clearingReadOps"],
  CouponFixedRateFacet: ["clearingReadOps"],
  CouponKpiLinkedRateFacet: ["clearingReadOps"],
  CouponSustainabilityPerformanceTargetRateFacet: ["clearingReadOps"],
  DividendFacet: ["clearingReadOps"],
  VotingFacet: ["clearingReadOps"],
};

/**
 * Get library link addresses in TypeChain format for factory construction.
 *
 * Returns a Record with TypeChain-format keys mapped to deployed library addresses.
 * This can be passed directly to TypeChain factory constructors.
 *
 * @param libs - Library names to include
 * @returns Record with TypeChain-format keys and deployed addresses
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
 * Get library links for a specific facet.
 *
 * This function determines which libraries a facet requires and returns them
 * in TypeChain-compatible format for contract factory linking.
 *
 * @param facetName - Name of the facet contract
 * @returns Record with TypeChain-format library keys and addresses for the specific facet
 */
export function getFacetLibraryLinks(facetName: string): Record<string, string> {
  const requiredLibs = getFacetRequiredLibraries(facetName);
  if (requiredLibs.length === 0) {
    return {};
  }
  return getLibLinks(...requiredLibs);
}

/**
 * Convert OrchestratorLibraryAddresses to TypeChain library format.
 *
 * This is an alias for getLibLinks with all libraries included, useful when
 * you need all orchestrator library addresses in TypeChain format.
 *
 * @param addresses - Orchestrator library addresses (optional, uses cached addresses if not provided)
 * @returns Record with TypeChain-format library keys and addresses
 *
 * @example
 * ```typescript
 * const libAddresses = await deployOrchestratorLibraries(signer);
 * const factory = new ERC20Facet__factory(
 *   toTypeChainLibraryAddresses(libAddresses),
 *   signer
 * );
 * ```
 */
export function toTypeChainLibraryAddresses(addresses?: OrchestratorLibraryAddresses): Record<string, string> {
  const addrs = addresses ?? getOrchestratorLibraryAddresses();
  return {
    [LIBRARY_KEYS.tokenCoreOps]: addrs.tokenCoreOps,
    [LIBRARY_KEYS.holdOps]: addrs.holdOps,
    [LIBRARY_KEYS.clearingOps]: addrs.clearingOps,
    [LIBRARY_KEYS.clearingReadOps]: addrs.clearingReadOps,
    [LIBRARY_KEYS.clearingProtectedOps]: addrs.clearingProtectedOps,
  };
}

/**
 * Deploy all orchestrator libraries in correct dependency order.
 *
 * Deployment order:
 * 1. TokenCoreOps, HoldOps, ClearingReadOps (no dependencies)
 * 2. ClearingOps (depends on TokenCoreOps)
 *
 * After deployment, automatically calls `setOrchestratorLibraryAddresses()`.
 *
 * @param signer - Ethers.js signer for deploying contracts
 * @returns Deployed library addresses
 */
export async function deployOrchestratorLibraries(signer: Signer): Promise<OrchestratorLibraryAddresses> {
  // Dynamic import to avoid eager loading of typechain
  const {
    TokenCoreOps__factory,
    HoldOps__factory,
    ClearingReadOps__factory,
    ClearingOps__factory,
    ClearingProtectedOps__factory,
  } = await import("@contract-types");

  info("   Deploying orchestrator libraries...");

  // Phase 1: Deploy libraries with no dependencies sequentially.
  // Parallel deployment via Promise.all causes nonce collisions on the Hiero Solo
  // JSON-RPC relay: all three deploy() calls fetch eth_getTransactionCount before
  // any transaction lands, so they all receive the same nonce and two of them stall
  // indefinitely waiting for a receipt that never arrives.
  const tokenCoreOps = await (await new TokenCoreOps__factory(signer).deploy()).waitForDeployment();
  const tokenCoreOpsAddr = await tokenCoreOps.getAddress();
  info(`   ✓ TokenCoreOps deployed at ${tokenCoreOpsAddr}`);

  const holdOps = await (await new HoldOps__factory(signer).deploy()).waitForDeployment();
  const holdOpsAddr = await holdOps.getAddress();
  info(`   ✓ HoldOps deployed at ${holdOpsAddr}`);

  const clearingReadOps = await (await new ClearingReadOps__factory(signer).deploy()).waitForDeployment();
  const clearingReadOpsAddr = await clearingReadOps.getAddress();
  info(`   ✓ ClearingReadOps deployed at ${clearingReadOpsAddr}`);

  // Phase 2: Deploy ClearingOps (depends on TokenCoreOps and HoldOps)
  const clearingOps = await new ClearingOps__factory(
    {
      [LIBRARY_KEYS.tokenCoreOps]: tokenCoreOpsAddr,
      [LIBRARY_KEYS.holdOps]: holdOpsAddr,
    } as any,
    signer,
  ).deploy();
  await clearingOps.waitForDeployment();

  const clearingOpsAddr = await clearingOps.getAddress();
  info(`   ✓ ClearingOps deployed at ${clearingOpsAddr}`);

  // Phase 3: Deploy ClearingProtectedOps (depends on ClearingOps via internal calls)
  const clearingProtectedOps = await new ClearingProtectedOps__factory(
    {
      [LIBRARY_KEYS.clearingOps]: clearingOpsAddr,
    } as any,
    signer,
  ).deploy();
  await clearingProtectedOps.waitForDeployment();

  const clearingProtectedOpsAddr = await clearingProtectedOps.getAddress();
  info(`   ✓ ClearingProtectedOps deployed at ${clearingProtectedOpsAddr}`);

  const addresses: OrchestratorLibraryAddresses = {
    tokenCoreOps: tokenCoreOpsAddr,
    holdOps: holdOpsAddr,
    clearingOps: clearingOpsAddr,
    clearingReadOps: clearingReadOpsAddr,
    clearingProtectedOps: clearingProtectedOpsAddr,
  };

  setOrchestratorLibraryAddresses(addresses);
  info("   ✅ All orchestrator libraries deployed and addresses set");

  return addresses;
}
