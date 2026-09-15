// SPDX-License-Identifier: Apache-2.0

/**
 * Orchestrator library address management for external library linking.
 *
 * External orchestrator libraries (TokenCoreOps, HoldOps, ClearingOps, ClearingLifecycleOps,
 * ClearingReadOps, ClearingProtectedOps) use Solidity `public` functions, which means they
 * are deployed as separate contracts and their addresses must be linked into facet bytecode
 * at deployment time.
 *
 * This module provides:
 * - Address storage/retrieval for deployed orchestrator libraries
 * - `getLibLinks()` helper that returns TypeChain-format link addresses for factory constructors
 * - `deployOrchestratorLibraries()` to deploy all libraries in correct dependency order
 *
 * @module domain/orchestratorLibraries
 */

import { Signer } from "ethers";
import {
  GAS_LIMIT,
  gasLimitOverride,
  hederaGasOverrides,
  info,
  retryTransaction,
  RetryOptions,
  withNonceReset,
} from "@scripts/infrastructure";

/**
 * Deployed addresses of all orchestrator libraries.
 */
export interface OrchestratorLibraryAddresses {
  tokenCoreOps: string;
  holdOps: string;
  clearingOps: string;
  clearingLifecycleOps: string;
  clearingReadOps: string;
  clearingProtectedOps: string;
  scheduledTasksOps: string;
  scheduledTasksDispatchOps: string;
}

/**
 * Library key constants matching TypeChain's linkBytecode format.
 * These are the keys used in Hardhat artifact `linkReferences` and TypeChain `LibraryAddresses` interfaces.
 */
export const LIBRARY_KEYS = {
  tokenCoreOps: "contracts/domain/orchestrator/TokenCoreOps.sol:TokenCoreOps",
  holdOps: "contracts/domain/orchestrator/HoldOps.sol:HoldOps",
  clearingOps: "contracts/domain/orchestrator/ClearingOps.sol:ClearingOps",
  clearingLifecycleOps: "contracts/domain/orchestrator/ClearingLifecycleOps.sol:ClearingLifecycleOps",
  clearingReadOps: "contracts/domain/orchestrator/ClearingReadOps.sol:ClearingReadOps",
  clearingProtectedOps: "contracts/domain/orchestrator/ClearingProtectedOps.sol:ClearingProtectedOps",
  scheduledTasksOps: "contracts/domain/orchestrator/ScheduledTasksOps.sol:ScheduledTasksOps",
  scheduledTasksDispatchOps: "contracts/domain/orchestrator/ScheduledTasksDispatchOps.sol:ScheduledTasksDispatchOps",
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
 * getFacetRequiredLibraries("ClearingByPartitionFacet") // returns ["clearingOps", "clearingReadOps"]
 * getFacetRequiredLibraries("AccessControlFacet") // returns []
 * ```
 */
export function getFacetRequiredLibraries(facetName: string): Array<keyof typeof LIBRARY_KEYS> {
  return LIBRARY_DEPENDENT_FACETS[facetName] || [];
}

export const LIBRARY_DEPENDENT_FACETS: Record<string, Array<keyof typeof LIBRARY_KEYS>> = {
  // TokenCoreOps dependencies - ERC20 and ERC1410 token operations
  TransferFacet: ["tokenCoreOps"],
  ERC20ReadFacet: ["tokenCoreOps"],
  ERC20VotesFacet: ["clearingReadOps", "scheduledTasksOps", "scheduledTasksDispatchOps"],
  ProtectedByPartitionFacet: ["tokenCoreOps"],
  ControllerByPartitionFacet: ["tokenCoreOps"],
  TransferByPartitionFacet: ["tokenCoreOps"],
  TransferAndLockFacet: ["tokenCoreOps", "scheduledTasksOps"],
  TransferAndLockByPartitionFacet: ["tokenCoreOps", "scheduledTasksOps"],
  ERC1410IssuerFacet: ["tokenCoreOps"],
  MintByPartitionFacet: ["tokenCoreOps"],
  BurnByPartitionFacet: ["tokenCoreOps"],
  ERC1594Facet: ["tokenCoreOps"],
  ControllerFacet: ["tokenCoreOps"],
  BatchControllerFacet: ["tokenCoreOps"],
  BatchBurnFacet: ["tokenCoreOps"],
  BatchMintFacet: ["tokenCoreOps"],
  BatchTransferFacet: ["tokenCoreOps"],
  MintFacet: ["tokenCoreOps"],
  BurnFacet: ["tokenCoreOps"],
  AdjustBalancesFacet: ["tokenCoreOps", "scheduledTasksDispatchOps"],
  AllowanceFacet: ["tokenCoreOps", "scheduledTasksOps"],
  MaturityFacet: ["tokenCoreOps", "scheduledTasksOps"],
  MaturityByPartitionFacet: ["tokenCoreOps", "scheduledTasksOps"],
  // HoldOps dependencies - hold/lock operations
  OperatorHoldByPartitionFacet: ["holdOps", "scheduledTasksOps"],
  ControllerHoldByPartitionFacet: ["holdOps", "scheduledTasksOps"],
  ProtectedHoldByPartitionFacet: ["holdOps", "scheduledTasksOps"],
  HoldFacet: ["holdOps"],
  HoldByPartitionFacet: ["holdOps", "scheduledTasksOps"],
  // ClearingOps dependencies - clearing transfer operations
  ProtectedClearingHoldByPartitionFacet: ["clearingProtectedOps"],
  ClearingHoldByPartitionFacet: ["clearingOps", "clearingReadOps"],
  OperatorClearingHoldByPartitionFacet: ["clearingOps"],
  ClearingByPartitionFacet: ["clearingOps", "clearingLifecycleOps", "clearingReadOps"],
  ClearingFacet: ["clearingReadOps"],
  ProtectedClearingByPartitionFacet: ["clearingProtectedOps"],
  // BalanceTrackerFacet + BalanceTrackerByPartitionFacet depend on SnapshotsStorageWrapper which uses ClearingReadOps
  CoreAtSnapshotFacet: ["clearingReadOps"],
  BalanceTrackerFacet: ["clearingReadOps"],
  BalanceTrackerByPartitionFacet: ["clearingReadOps"],
  BalanceTrackerAdjustedFacet: ["clearingReadOps"],
  BalanceTrackerAtSnapshotFacet: ["clearingReadOps"],
  BalanceTrackerAtSnapshotByPartitionFacet: ["clearingReadOps"],
  ClearingAtSnapshotFacet: ["clearingReadOps"],
  ClearingAtSnapshotByPartitionFacet: ["clearingReadOps"],
  // Layer 2 facet families — coupon/dividend/voting/amortization reach ClearingReadOps
  AmortizationFacet: ["clearingReadOps", "scheduledTasksOps"],
  CouponFacet: ["clearingReadOps"],
  DividendFacet: ["clearingReadOps"],
  VotingFacet: ["clearingReadOps"],
  // ScheduledTasksDispatchOps dependencies — ScheduledTasksStorageWrapper uses try/catch delegatecall to this lib
  SnapshotsFacet: ["scheduledTasksDispatchOps"],
  ScheduledCrossOrderedTasksFacet: ["scheduledTasksDispatchOps"],
  // Additional facets with ScheduledTasksOps dependencies
  BatchFreezeFacet: ["scheduledTasksOps"],
  FreezeFacet: ["scheduledTasksOps"],
  KpiLinkedRateFacet: ["scheduledTasksOps"],
  LockByPartitionFacet: ["scheduledTasksOps"],
  LockFacet: ["scheduledTasksOps"],
  NominalValueFacet: ["scheduledTasksOps"],
  ProceedRecipientsFacet: ["scheduledTasksOps"],
  RecoveryFacet: ["scheduledTasksOps"],
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
    [LIBRARY_KEYS.clearingLifecycleOps]: addrs.clearingLifecycleOps,
    [LIBRARY_KEYS.clearingReadOps]: addrs.clearingReadOps,
    [LIBRARY_KEYS.clearingProtectedOps]: addrs.clearingProtectedOps,
    [LIBRARY_KEYS.scheduledTasksOps]: addrs.scheduledTasksOps,
    [LIBRARY_KEYS.scheduledTasksDispatchOps]: addrs.scheduledTasksDispatchOps,
  };
}

/**
 * Options for `deployOrchestratorLibraries`.
 */
export interface DeployOrchestratorLibrariesOptions {
  /**
   * Retry configuration for individual library deployments.
   *
   * On Hedera testnet, transient 502 / SERVER_ERROR responses from the JSON-RPC relay
   * can abort a library deployment mid-sequence and force a full re-run from scratch.
   * Passing the network's `retryOptions` here wraps every library deploy individually so
   * a single 502 does not kill the entire deployment.
   *
   * Default: no retries (`maxRetries: 0`).
   */
  retryOptions?: RetryOptions;
}

/**
 * Deploy all orchestrator libraries in correct dependency order.
 *
 * Deployment order:
 * 1. ScheduledTasksDispatchOps, ClearingReadOps (no dependencies)
 * 2. ScheduledTasksOps (depends on ScheduledTasksDispatchOps via ScheduledTasksStorageWrapper)
 * 3. TokenCoreOps and HoldOps (depend on ClearingReadOps + ScheduledTasksOps)
 * 4. ClearingOps (depends on TokenCoreOps, HoldOps, ClearingReadOps, ScheduledTasksOps)
 * 5. ClearingLifecycleOps (depends on TokenCoreOps, HoldOps, ClearingReadOps, ScheduledTasksOps)
 * 6. ClearingProtectedOps (depends on ClearingOps)
 *
 * After deployment, automatically calls `setOrchestratorLibraryAddresses()`.
 *
 * @param signer - Ethers.js signer for deploying contracts
 * @param options - Deployment options (retry configuration)
 * @returns Deployed library addresses
 */
export async function deployOrchestratorLibraries(
  signer: Signer,
  options?: DeployOrchestratorLibrariesOptions,
): Promise<OrchestratorLibraryAddresses> {
  // After a 502, the NonceManager's internal counter is already incremented even though
  // Hedera never received the tx.  Reset before each retry so the confirmed nonce is
  // re-fetched from the network rather than using a stale internal value.
  const retryOpts: RetryOptions = withNonceReset(signer, options?.retryOptions ?? { maxRetries: 0 });

  // Dynamic import to avoid eager loading of typechain
  const {
    TokenCoreOps__factory,
    HoldOps__factory,
    ClearingReadOps__factory,
    ClearingOps__factory,
    ClearingLifecycleOps__factory,
    ClearingProtectedOps__factory,
    ScheduledTasksOps__factory,
    ScheduledTasksDispatchOps__factory,
  } = await import("@contract-types");

  info("   Deploying orchestrator libraries...");

  // Deploy sequentially. Parallel deployment via Promise.all causes nonce collisions
  // on the Hiero Solo JSON-RPC relay: concurrent deploy() calls fetch
  // eth_getTransactionCount before any transaction lands, so they all receive the
  // same nonce and stall indefinitely waiting for a receipt that never arrives.

  const deployLib = (name: string, fn: () => Promise<string>): Promise<string> =>
    retryTransaction(fn, retryOpts).then((addr) => {
      info(`   ✓ ${name} deployed at ${addr}`);
      return addr;
    });

  // Phase 1: ScheduledTasksDispatchOps and ClearingReadOps have no library dependencies.
  const gasOverrides = { ...hederaGasOverrides(), ...gasLimitOverride(GAS_LIMIT.max) };
  const scheduledTasksDispatchOpsAddr = await deployLib("ScheduledTasksDispatchOps", () =>
    new ScheduledTasksDispatchOps__factory(signer)
      .deploy(gasOverrides)
      .then((c) => c.waitForDeployment())
      .then((c) => c.getAddress()),
  );

  const clearingReadOpsAddr = await deployLib("ClearingReadOps", () =>
    new ClearingReadOps__factory(signer)
      .deploy(gasOverrides)
      .then((c) => c.waitForDeployment())
      .then((c) => c.getAddress()),
  );

  // Phase 2: ScheduledTasksOps inlines ScheduledTasksStorageWrapper which calls ScheduledTasksDispatchOps.
  const scheduledTasksOpsAddr = await deployLib("ScheduledTasksOps", () =>
    new ScheduledTasksOps__factory(
      { [LIBRARY_KEYS.scheduledTasksDispatchOps]: scheduledTasksDispatchOpsAddr } as any,
      signer,
    )
      .deploy(gasOverrides)
      .then((c) => c.waitForDeployment())
      .then((c) => c.getAddress()),
  );

  // Phase 3: TokenCoreOps and HoldOps depend on ClearingReadOps + ScheduledTasksOps.
  const phase3Links = {
    [LIBRARY_KEYS.clearingReadOps]: clearingReadOpsAddr,
    [LIBRARY_KEYS.scheduledTasksOps]: scheduledTasksOpsAddr,
  } as any;

  const tokenCoreOpsAddr = await deployLib("TokenCoreOps", () =>
    new TokenCoreOps__factory(phase3Links, signer)
      .deploy(gasOverrides)
      .then((c) => c.waitForDeployment())
      .then((c) => c.getAddress()),
  );

  const holdOpsAddr = await deployLib("HoldOps", () =>
    new HoldOps__factory(phase3Links, signer)
      .deploy(gasOverrides)
      .then((c) => c.waitForDeployment())
      .then((c) => c.getAddress()),
  );

  // Phase 4: ClearingOps depends on TokenCoreOps, HoldOps, ClearingReadOps + ScheduledTasksOps.
  const phase4Links = {
    [LIBRARY_KEYS.tokenCoreOps]: tokenCoreOpsAddr,
    [LIBRARY_KEYS.holdOps]: holdOpsAddr,
    [LIBRARY_KEYS.clearingReadOps]: clearingReadOpsAddr,
    [LIBRARY_KEYS.scheduledTasksOps]: scheduledTasksOpsAddr,
  } as any;

  const clearingOpsAddr = await deployLib("ClearingOps", () =>
    new ClearingOps__factory(phase4Links, signer)
      .deploy(gasOverrides)
      .then((c) => c.waitForDeployment())
      .then((c) => c.getAddress()),
  );

  // Phase 5: ClearingLifecycleOps owns the post-creation lifecycle (approve/cancel/reclaim).
  // It calls ClearingOps.beforeClearingOperation as an `internal` cross-library call which
  // the compiler inlines, so no ClearingOps link is required. It does however use
  // TokenCoreOps, HoldOps, ClearingReadOps, and ScheduledTasksOps.
  const clearingLifecycleOpsAddr = await deployLib("ClearingLifecycleOps", () =>
    new ClearingLifecycleOps__factory(phase4Links, signer)
      .deploy(gasOverrides)
      .then((c) => c.waitForDeployment())
      .then((c) => c.getAddress()),
  );

  // Phase 6: ClearingProtectedOps depends on ClearingOps via internal calls.
  const clearingProtectedOpsAddr = await deployLib("ClearingProtectedOps", () =>
    new ClearingProtectedOps__factory({ [LIBRARY_KEYS.clearingOps]: clearingOpsAddr } as any, signer)
      .deploy(gasOverrides)
      .then((c) => c.waitForDeployment())
      .then((c) => c.getAddress()),
  );

  const addresses: OrchestratorLibraryAddresses = {
    tokenCoreOps: tokenCoreOpsAddr,
    holdOps: holdOpsAddr,
    clearingOps: clearingOpsAddr,
    clearingLifecycleOps: clearingLifecycleOpsAddr,
    clearingReadOps: clearingReadOpsAddr,
    clearingProtectedOps: clearingProtectedOpsAddr,
    scheduledTasksOps: scheduledTasksOpsAddr,
    scheduledTasksDispatchOps: scheduledTasksDispatchOpsAddr,
  };

  setOrchestratorLibraryAddresses(addresses);
  info("   ✅ All orchestrator libraries deployed and addresses set");

  return addresses;
}
