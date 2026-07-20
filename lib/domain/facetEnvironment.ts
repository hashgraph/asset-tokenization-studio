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
 */

// Facets swapped for a test-specific variant when useTimeTravel=true.
// Key = production facet name, value = test facet name (used verbatim, no suffix).
const TEST_REPLACEMENTS: Record<string, string> = {
  DiamondFacet: "MockDiamondCut",
  FactoryFacet: "MockFactoryFacet",
};

// Facets appended to every configuration when useTimeTravel=true (unless the
// caller opts out via `{ extras: false }` — see `BuildFacetListOptions`).
const TEST_ONLY_EXTRAS = ["TimeTravelFacet"] as const;

/** Options for {@link buildFacetList}. */
export interface BuildFacetListOptions {
  /**
   * Whether to append {@link TEST_ONLY_EXTRAS} in test mode. Defaults to `true`.
   * The factory configuration sets this to `false`: it has never carried
   * `TimeTravelFacet` (a single-facet ResolverProxy with nothing that reads
   * TimeTravel-overridden EVM context), and adding it would change its
   * deployed facet list.
   */
  extras?: boolean;
}

/** Build the final facet name list for a given environment. */
export function buildFacetList(
  productionFacets: readonly string[],
  useTimeTravel: boolean,
  options: BuildFacetListOptions = {},
): string[] {
  if (!useTimeTravel) return [...productionFacets];

  const { extras = true } = options;
  const replaced = productionFacets.map((name) => TEST_REPLACEMENTS[name] ?? name);
  return extras ? [...replaced, ...TEST_ONLY_EXTRAS] : replaced;
}
