// SPDX-License-Identifier: Apache-2.0

/**
 * ATS-specific contract registry — thin facade over `facetKeys.ts`.
 */

import type { FacetDefinition, RegistryProvider } from "../operations";
import { getFacetRequiredLibraries } from "./orchestratorLibraries";
import { ALL_FACETS, getResolverKey, RESOLVER_KEYS, RESOLVER_KEYS_BY_FACET, type FacetName } from "./facetKeys";

/** ROLES live in a small, audit-visible, hand-maintained file checked into git. */
export { ROLES } from "./roles";

export { RESOLVER_KEYS, getResolverKey };

export function getFacetDefinition(name: string): FacetDefinition | undefined {
  if (!hasFacet(name)) return undefined;
  const value = RESOLVER_KEYS_BY_FACET[name];
  return value ? { name, resolverKey: { name, value } } : { name };
}

export function getAllFacets(): FacetDefinition[] {
  return ALL_FACETS.map((name) => getFacetDefinition(name)!);
}

export function hasFacet(name: string): boolean {
  return (ALL_FACETS as readonly string[]).includes(name);
}

/**
 * ATS Registry Provider.
 *
 * @remarks
 * Pre-configured registry provider implementing the `RegistryProvider`
 * interface. Use this when you need to pass a registry to operations like
 * `registerFacets`, `registerAdditionalFacets`, or `createBatchConfiguration`.
 */
export const atsRegistry: RegistryProvider = {
  getFacetDefinition,
  getAllFacets,
};

export function isLibraryDependentFacet(facetName: string): boolean {
  return getFacetRequiredLibraries(facetName).length > 0;
}

export type { FacetName };
