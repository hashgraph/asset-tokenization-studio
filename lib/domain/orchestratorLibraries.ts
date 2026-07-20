// SPDX-License-Identifier: Apache-2.0

/**
 * Orchestrator library address management for external library linking.
 *
 * External orchestrator libraries (TokenCoreOps, HoldOps, ClearingOps, ClearingLifecycleOps,
 * ClearingReadOps, ClearingProtectedOps) use Solidity `public` functions, which means they
 * are deployed as separate contracts and their addresses must be linked into facet bytecode
 * at deployment time.
 */

import { existsSync, readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { Signer } from "ethers";
import { gasLimitOverride, retryTransaction, RetryOptions, withNonceReset } from "@lib/operations";

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

let _addresses: OrchestratorLibraryAddresses | undefined;

/**
 * Set deployed orchestrator library addresses.
 * Must be called before any factory that requires library linking is constructed.
 */
export function setOrchestratorLibraryAddresses(addresses: OrchestratorLibraryAddresses): void {
  _addresses = addresses;
}

/**
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

export function hasOrchestratorLibraryAddresses(): boolean {
  return _addresses !== undefined;
}

// The compiler is the single source of truth for which facets need which
// libraries: every Hardhat artifact carries `linkReferences` describing the
// address placeholders left in its bytecode. The map is computed lazily,
// because this module is imported by codegen tooling that may run before
// `artifacts/` exists.

/** Locate the package's `artifacts/` directory (works from src and build/ output). */
function findArtifactsRoot(): string {
  let dir = __dirname;
  for (let i = 0; i < 6; i++) {
    const candidate = join(dir, "artifacts", "contracts");
    if (existsSync(candidate)) return join(dir, "artifacts");
    dir = dirname(dir);
  }
  throw new Error(
    "artifacts/contracts not found — run `npx hardhat compile` before querying facet library dependencies.",
  );
}

let _facetLibraryIndex: Record<string, Array<keyof typeof LIBRARY_KEYS>> | undefined;

/**
 * Walk `artifacts/contracts` once and index every contract's linked libraries
 * (by short orchestrator-library name). Memoized after the first call.
 *
 * @throws Error if a contract links a library missing from LIBRARY_KEYS —
 *   that means a new external library exists and must be added there.
 */
function facetLibraryIndex(): Record<string, Array<keyof typeof LIBRARY_KEYS>> {
  if (_facetLibraryIndex) return _facetLibraryIndex;

  const index: Record<string, Array<keyof typeof LIBRARY_KEYS>> = {};
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.name.endsWith(".json") || entry.name.endsWith(".dbg.json")) continue;

      const artifact = JSON.parse(readFileSync(fullPath, "utf8")) as {
        contractName?: string;
        bytecode?: string;
        linkReferences?: Record<string, Record<string, unknown>>;
      };
      // Interfaces and abstract contracts have no deployable bytecode.
      if (!artifact.contractName || !artifact.bytecode || artifact.bytecode === "0x") continue;

      const libs: Array<keyof typeof LIBRARY_KEYS> = [];
      for (const [sourceName, libraries] of Object.entries(artifact.linkReferences ?? {})) {
        for (const libName of Object.keys(libraries)) {
          const shortName = REVERSE_LIBRARY_KEYS[`${sourceName}:${libName}`];
          if (!shortName) {
            throw new Error(
              `${artifact.contractName} links unknown library ${sourceName}:${libName} — add it to LIBRARY_KEYS.`,
            );
          }
          libs.push(shortName);
        }
      }
      if (libs.length > 0) index[artifact.contractName] = libs;
    }
  };
  walk(join(findArtifactsRoot(), "contracts"));

  _facetLibraryIndex = index;
  return index;
}

/**
 * Determine which orchestrator libraries a facet requires for TypeChain linking.
 *
 * Returns an array of library names that must be linked when deploying the facet,
 * derived from the compiled artifact's `linkReferences` (never out of date).
 */
export function getFacetRequiredLibraries(facetName: string): Array<keyof typeof LIBRARY_KEYS> {
  return facetLibraryIndex()[facetName] ?? [];
}

/**
 * Get library link addresses in TypeChain format for factory construction.
 *
 * Returns a Record with TypeChain-format keys mapped to deployed library addresses.
 * This can be passed directly to TypeChain factory constructors.
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
 */
export function getFacetLibraryLinks(facetName: string): Record<string, string> {
  const requiredLibs = getFacetRequiredLibraries(facetName);
  if (requiredLibs.length === 0) {
    return {};
  }
  return getLibLinks(...requiredLibs);
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
 */
export async function deployOrchestratorLibraries(signer: Signer): Promise<OrchestratorLibraryAddresses> {
  // After a 502, the NonceManager's internal counter is already incremented even though
  // Hedera never received the tx.  Reset before each retry so the confirmed nonce is
  // re-fetched from the network rather than using a stale internal value.
  const retryOpts: RetryOptions = withNonceReset(signer, { maxRetries: 0 });

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

  // Deploy sequentially. Parallel deployment via Promise.all causes nonce collisions
  // on the Hiero Solo JSON-RPC relay: concurrent deploy() calls fetch
  // eth_getTransactionCount before any transaction lands, so they all receive the
  // same nonce and stall indefinitely waiting for a receipt that never arrives.

  const deployLib = (_name: string, fn: () => Promise<string>): Promise<string> => retryTransaction(fn, retryOpts);

  // Phase 1: ScheduledTasksDispatchOps and ClearingReadOps have no library dependencies.
  const gasOverrides = gasLimitOverride();
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

  return addresses;
}
