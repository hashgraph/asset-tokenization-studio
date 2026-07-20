// SPDX-License-Identifier: Apache-2.0

/**
 * Pure data and helpers shared by the Ignition modules. Not a module itself.
 */

import { readdirSync, readFileSync } from "fs";
import { join } from "path";

import { getResolverKey, PRODUCTION_DEPLOY_FACETS, RESOLVER_KEYS_BY_FACET } from "../../lib/domain/facetKeys";
import { getAllMockFacets } from "../../lib/domain/initializeMock/mockFacetsRegistry";
import type { FacetDefinition } from "../../lib/operations/types";

/** Build the slim {@link FacetDefinition} for a facet known to the registry. */
function toFacetDefinition(name: string): FacetDefinition {
  const value = RESOLVER_KEYS_BY_FACET[name];
  return value ? { name, resolverKey: { name, value } } : { name };
}

/**
 * Deployment mode: "production" is the real system; "timetravel" is the test
 * mode used by the integration fixtures (adds TimeTravelFacet and the mocks).
 */
export const PRODUCTION_MODE = "production";
export const TIMETRAVEL_MODE = "timetravel";
export type DeploymentMode = typeof PRODUCTION_MODE | typeof TIMETRAVEL_MODE;

/** Split a list into chunks of N (registering ~104 facets in one tx would run out of gas). */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size) as T[]);
  }
  return result;
}

/**
 * Facets to deploy (and register, for those with a resolver key), IN
 * REGISTRATION ORDER — the order defines the version each key gets in the
 * BLR. Production is {@link PRODUCTION_DEPLOY_FACETS}; timetravel re-inserts
 * TimeTravelFacet sorted by name and appends the mocks.
 */
export function facetDeployList(mode: DeploymentMode): FacetDefinition[] {
  if (mode === PRODUCTION_MODE) {
    return PRODUCTION_DEPLOY_FACETS.map(toFacetDefinition);
  }
  const withTimeTravel = [...PRODUCTION_DEPLOY_FACETS, "TimeTravelFacet"].sort((a, b) => a.localeCompare(b));
  return [...withTimeTravel.map(toFacetDefinition), ...getAllMockFacets()];
}

/** Resolver key of a facet, looked up in `facetKeys.ts` and the test-only mocks. */
export function resolverKeyOf(name: string): string {
  return getResolverKey(name);
}

/**
 * Version the BLR assigns to each facet during genesis registration,
 * computed by simulating the registration sequence (+1 per key). Everything
 * lands at 1 in production; in timetravel the two mocks that share a key
 * with a production facet (MockDiamondCut, MockFactoryFacet) land at 2.
 */
export function registrationVersions(mode: DeploymentMode): Map<string, number> {
  const keyCount = new Map<string, number>();
  const versions = new Map<string, number>();
  for (const facet of facetDeployList(mode)) {
    const key = facet.resolverKey?.value;
    if (!key) continue;
    const version = (keyCount.get(key) ?? 0) + 1;
    keyCount.set(key, version);
    versions.set(facet.name, version);
  }
  return versions;
}

/** Walk `artifacts/contracts/` once and index `contractName -> linked libraries` (compiler truth). */
function indexArtifactLinkReferences(artifactsRoot: string): Map<string, string[]> {
  const index = new Map<string, string[]>();
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(path);
      } else if (entry.name.endsWith(".json") && !entry.name.endsWith(".dbg.json")) {
        const artifact = JSON.parse(readFileSync(path, "utf8"));
        if (!artifact.contractName || artifact.bytecode === "0x") continue; // interfaces/abstract
        const libraries = Object.values(artifact.linkReferences ?? {}).flatMap((bySource) =>
          Object.keys(bySource as Record<string, unknown>),
        );
        if (index.has(artifact.contractName)) {
          throw new Error(`Ambiguous artifact name: ${artifact.contractName}`);
        }
        index.set(artifact.contractName, libraries);
      }
    }
  };
  walk(join(artifactsRoot, "contracts"));
  return index;
}

const LINK_REFERENCES = indexArtifactLinkReferences(join(__dirname, "..", "..", "artifacts"));

/** Libraries a contract needs linked, with a clear error if the artifact is missing. */
export function linkedLibraryNames(contractName: string): string[] {
  const libraries = LINK_REFERENCES.get(contractName);
  if (libraries === undefined) {
    throw new Error(`No artifact found for contract: ${contractName}`);
  }
  return libraries;
}
