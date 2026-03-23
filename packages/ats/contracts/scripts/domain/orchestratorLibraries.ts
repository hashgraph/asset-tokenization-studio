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
  tokenCoreOps: "contracts/domain/orchestrator/TokenCoreOps.sol:TokenCoreOps",
  holdOps: "contracts/domain/orchestrator/HoldOps.sol:HoldOps",
  clearingOps: "contracts/domain/orchestrator/ClearingOps.sol:ClearingOps",
  clearingReadOps: "contracts/domain/orchestrator/ClearingReadOps.sol:ClearingReadOps",
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
  };
}
