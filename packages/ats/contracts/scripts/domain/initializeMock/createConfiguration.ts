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
} from "@scripts/infrastructure";
import { BusinessLogicResolver } from "@contract-types";
import { atsRegistry } from "../atsRegistry";
import { INITIALIZE_MOCK_CONFIG_ID } from "../constants";
import { getMockFacetDefinition } from "./mockFacetsRegistry";

// TEST-ONLY: facet set for the InitializeMock domain — the real InitializerFacet
// followed by the three mock facets. `InitializerFacet` is resolved from
// `atsRegistry`; the mocks are resolved from the local mock registry since they
// are excluded from the auto-generated atsRegistry.
const INITIALIZE_MOCK_FACETS = ["InitializerFacet", "MockFacet1", "MockFacet2", "MockFacet3"] as const;

/**
 * TEST-ONLY: create the InitializeMock configuration in BusinessLogicResolver.
 *
 * Behaves like `createBondConfiguration` and friends but:
 * - skips the TimeTravel branching (mocks have no TimeTravel variants);
 * - resolves the three mock facets through `getMockFacetDefinition` instead of
 *   the auto-generated atsRegistry.
 *
 * Call this function more than once with the same `configurationId` to mint
 * additional versions in the BLR — each call increments the configId's version.
 *
 * @param blrContract        BusinessLogicResolver contract instance.
 * @param facetAddresses     Map of facet contract name → deployed address.
 *                           Must include `InitializerFacet` and `MockFacetN`.
 * @param partialBatchDeploy Whether to mark batches as non-final.
 * @param batchSize          Number of facets per batch.
 * @param confirmations      Number of confirmations to wait for.
 */
export async function createInitializeMockConfiguration(
  blrContract: BusinessLogicResolver,
  facetAddresses: Record<string, string>,
  partialBatchDeploy: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
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
  });
}
