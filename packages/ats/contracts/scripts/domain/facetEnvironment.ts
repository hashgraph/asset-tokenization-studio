// SPDX-License-Identifier: Apache-2.0

/**
 * Centralises the test-environment facet substitution shared by every
 * createConfiguration module.
 *
 * In production the facet list is returned unchanged. In test mode — driven by
 * `isTestMode()` (the `ATS_TEST_MODE` env var, defaulting on for the `test` /
 * `coverage` Hardhat tasks) — the list is transformed by:
 *   - swapping every production facet listed in `TEST_REPLACEMENTS` for its
 *     test counterpart;
 *   - appending the facets listed in `TEST_ONLY_EXTRAS`.
 *
 * To add a test-environment substitution, edit this file only — no individual
 * createConfiguration module needs to change.
 *
 * @module domain/facetEnvironment
 */

import { isTestMode } from "@scripts/infrastructure";
import { EVM_ACCESSORS_FACET_NAME } from "./constants";

// Production facets swapped for a test-specific counterpart in test mode.
const TEST_REPLACEMENTS: Record<string, string> = {
  DiamondFacet: "MockDiamondCut",
};

// Facets appended to every configuration in test mode; excluded from production source paths.
const TEST_ONLY_EXTRAS = [EVM_ACCESSORS_FACET_NAME] as const;

/**
 * Build the final facet name list for the active environment.
 *
 * @param productionFacets The canonical production facet list for a token type.
 * @returns The production list unchanged in production; the substituted list plus
 *          the test-only extras when `isTestMode()` is true.
 */
export function buildFacetList(productionFacets: readonly string[]): string[] {
  if (!isTestMode()) return [...productionFacets];

  return [...productionFacets.map((name) => TEST_REPLACEMENTS[name] ?? name), ...TEST_ONLY_EXTRAS];
}
