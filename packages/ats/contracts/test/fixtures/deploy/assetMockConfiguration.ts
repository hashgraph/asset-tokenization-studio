// SPDX-License-Identifier: Apache-2.0

// TEST-ONLY FILE: AssetMock domain configuration. Registers the full IAsset facet
// union (all 7 asset-class facet sets, deduplicated) alongside the real DiamondFacet
// and the standalone MockDiamondCutHelpers test-controls facet.
//
// The facet list is built dynamically by the caller and passed in as facetNames,
// replacing the old hardcoded per-type arrays that lived under scripts/domain/assetMock/.
// This module was relocated from scripts/ to test/ because it is test-only.
//
// The config is consumed by MockFactory.deployAssetMock() which force-readies every
// facet (skipping real initialisers) and marks the proxy operational.

import {
  ConfigurationData,
  ConfigurationError,
  OperationResult,
  createBatchConfiguration,
  DEFAULT_BATCH_SIZE,
  RetryOptions,
} from "@scripts/infrastructure";
import { BusinessLogicResolver } from "@contract-types";
import { atsRegistry } from "@scripts/domain";
import { getMockFacetDefinition } from "@scripts/domain";

export const ASSET_MOCK_CONFIG_ID = "0x000000000000000000000000000000000000000000000000000000000000000a";

let assetMockFacetNames: string[] = [];

export function getAssetMockFacets(): string[] {
  return [...assetMockFacetNames];
}

export function setAssetMockFacets(names: string[]): void {
  assetMockFacetNames = [...names];
}

/**
 * TEST-ONLY: create the AssetMock configuration in BusinessLogicResolver.
 *
 * Registers the union of all asset-class facets (including the real DiamondFacet plus
 * the standalone MockDiamondCutHelpers) under ASSET_MOCK_CONFIG_ID so a single diamond
 * proxy exposes every IAsset function plus the mock testing controls.
 *
 * @param blrContract        BusinessLogicResolver contract instance.
 * @param facetNames         Names of the facets to include in this configuration.
 * @param facetAddresses     Map of facet contract name → deployed address.
 * @param partialBatchDeploy Whether to mark batches as non-final.
 * @param batchSize          Number of facets per batch.
 * @param confirmations      Number of confirmations to wait for.
 */
export async function createAssetMockConfiguration(
  blrContract: BusinessLogicResolver,
  facetNames: string[],
  facetAddresses: Record<string, string>,
  partialBatchDeploy: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
  retryOptions?: RetryOptions,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  setAssetMockFacets(facetNames);

  const facets = facetNames.map((name) => {
    // Strip "TimeTravel" suffix to get base name for registry lookup
    const baseName = name.replace(/TimeTravel$/, "");

    const facetDef = atsRegistry.getFacetDefinition(baseName) ?? getMockFacetDefinition(baseName);
    if (!facetDef?.resolverKey?.value) {
      throw new Error(`No resolver key found for facet: ${baseName}`);
    }
    return {
      facetName: name,
      resolverKey: facetDef.resolverKey.value,
      address: facetAddresses[name],
    };
  });

  return createBatchConfiguration(blrContract, {
    configurationId: ASSET_MOCK_CONFIG_ID,
    facets,
    partialBatchDeploy,
    batchSize,
    confirmations,
    retryOptions,
  });
}
