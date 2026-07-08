// SPDX-License-Identifier: Apache-2.0

/**
 * Centralises the test-environment facet substitution logic that all
 * createConfiguration modules share.
 *
 * In production (`useTimeTravel = false`) the facet list is returned as-is.
 * In test mode (`useTimeTravel = true`):
 *   - every production facet listed in `TEST_REPLACEMENTS` is swapped for its
 *     test counterpart verbatim;
 *   - all remaining facets pass through unchanged, since EVM-context
 *     overrides (timestamp, block number, sender, origin, chain ID) are read
 *     directly from shared storage-slot libraries by the production facets —
 *     no per-domain TimeTravel variant is needed;
 *   - the facets listed in `TEST_ONLY_EXTRAS` are appended.
 *
 * To add a new test-environment substitution, edit this file only —
 * no individual createConfiguration file needs to change.
 *
 * @module domain/facetEnvironment
 */

// Facets swapped for a test-specific variant when useTimeTravel=true.
// Key = production facet name, value = test facet name (used verbatim, no suffix).
// Edit this map in one place to affect all configurations.
const TEST_REPLACEMENTS: Record<string, string> = {
  DiamondFacet: "MockDiamondCut",
};

// Facets appended to every configuration when useTimeTravel=true.
// Edit this list in one place to affect all configurations.
const TEST_ONLY_EXTRAS = ["TimeTravelFacet"] as const;

/**
 * Build the final facet name list for a given environment.
 *
 * @param productionFacets  The canonical production facet list for a token type.
 * @param useTimeTravel     True in test environments; false in production.
 */
export function buildFacetList(productionFacets: readonly string[], useTimeTravel: boolean): string[] {
  if (!useTimeTravel) return [...productionFacets];

  return [...productionFacets.map((name) => TEST_REPLACEMENTS[name] ?? name), ...TEST_ONLY_EXTRAS];
}
