// SPDX-License-Identifier: Apache-2.0

// TEST-ONLY FILE: InitializeMock domain configuration. Mirrors the production
// domain configurations (e.g. `bond/createConfiguration.ts`) but for a stub
// configuration used by initializer-versioning tests. The configuration contains
// the real `InitializerFacet` plus the three `MockFacetN` test facets, and is
// designed to be created multiple times against the same configId so the
// BusinessLogicResolver bumps the version on each call.

import {
  ConfigurationData,
  ConfigurationError,
  createBatchConfiguration,
  OperationResult,
  DEFAULT_BATCH_SIZE,
  RetryOptions,
} from "@scripts/infrastructure";
import { BusinessLogicResolver } from "@contract-types";
import { atsRegistry } from "../atsRegistry";
import type { FacetName } from "../atsRegistry";
import { getMockFacetDefinition, INITIALIZE_MOCK_CONFIG_ID } from "./mockFacetsRegistry";
import type { MockFacetName } from "./mockFacetsRegistry";

// TEST-ONLY: facet set for the InitializeMock domain — the real InitializerFacet
// followed by `MockDiamondCut` (a mock variant of `DiamondFacet` that exposes
// the same diamond-cut/loupe surface plus an `initializeDiamondCut()` hook so
// it can participate in the initializer flow) and the three mock facets.
// `InitializerFacet` is resolved from `atsRegistry`; the mocks are resolved
// from the local mock registry since they are excluded from the auto-generated
// atsRegistry.
export const INITIALIZE_MOCK_FACETS: readonly (FacetName | MockFacetName)[] = [
  "InitializerFacet",
  "MockDiamondCut",
  "MockFacet1",
  "MockFacet2",
  "MockFacet3",
];

/**
 * TEST-ONLY: create the InitializeMock configuration in BusinessLogicResolver.
 *
 * Behaves like `createBondConfiguration` and friends but:
 * - skips the TimeTravel branching (mocks have no TimeTravel variants);
 * - resolves the three mock facets through `getMockFacetDefinition` instead of
 *   the auto-generated atsRegistry;
 * - accepts an explicit per-facet BLR version map so a single configId can
 *   mint distinct versions that combine different facet versions (e.g.
 *   v1 → MockFacet1 v1 / MockFacet2 v2, v2 → MockFacet1 v3 / MockFacet2 v3).
 *
 * Call this function more than once with the same `configurationId` to mint
 * additional versions in the BLR — each call increments the configId's version.
 *
 * @param blrContract        BusinessLogicResolver contract instance.
 * @param facetAddresses     Map of facet contract name → deployed address.
 *                           Must include `InitializerFacet` and `MockFacetN`.
 *                           The address is only used as a marker in the batch
 *                           payload; the BLR resolves the actual facet code
 *                           through the (facetKey, version) tuple.
 * @param facetVersions      Optional map of facet name → explicit BLR version
 *                           to pin. When supplied, every facet in
 *                           `INITIALIZE_MOCK_FACETS` must have an entry. When
 *                           omitted, the latest BLR version of each facet is
 *                           used (legacy behaviour).
 * @param partialBatchDeploy Whether to mark batches as non-final.
 * @param batchSize          Number of facets per batch.
 * @param confirmations      Number of confirmations to wait for.
 */
export async function createInitializeMockConfiguration(
  blrContract: BusinessLogicResolver,
  facetAddresses: Record<string, string>,
  facetVersions?: Record<string, number>,
  partialBatchDeploy: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
  retryOptions?: RetryOptions,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  // TEST-ONLY: build the facet list, pulling InitializerFacet from atsRegistry
  // and the three mocks from the local mock registry.
  const facets = INITIALIZE_MOCK_FACETS.map((name) => {
    const facetDef = atsRegistry.getFacetDefinition(name) ?? getMockFacetDefinition(name);
    if (!facetDef?.resolverKey?.value) {
      throw new Error(`No resolver key found for facet: ${name}`);
    }
    return {
      facetName: name,
      resolverKey: facetDef.resolverKey.value,
      address: facetAddresses[name],
    };
  });

  return createBatchConfiguration(blrContract, {
    configurationId: INITIALIZE_MOCK_CONFIG_ID,
    facets,
    partialBatchDeploy,
    batchSize,
    confirmations,
    facetVersions,
    retryOptions,
  });
}
