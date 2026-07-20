// SPDX-License-Identifier: Apache-2.0

// TEST-ONLY FILE: AssetMock domain configuration. Registers the full IAsset facet
// union (all 7 asset-class facet sets, deduplicated) with DiamondFacet → MockDiamondCut
//
// The facet list is built dynamically by the caller and passed in as facetNames.
//
// The config is consumed by MockFactory.deployAssetMock() which force-readies every
// facet (skipping real initialisers) and marks the proxy operational.

import { ConfigurationData, createBatchConfiguration } from "@lib/operations";
import { BusinessLogicResolver } from "@contract-types";
import { atsRegistry } from "@lib/domain";
import { getMockFacetDefinition } from "@lib/domain";

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
 * Registers the union of all asset-class facets (replacing DiamondFacet with
 * MockDiamondCut) under ASSET_MOCK_CONFIG_ID so a single diamond proxy exposes
 * every IAsset function plus the mock testing controls.
 *
 * @param blrContract        BusinessLogicResolver contract instance.
 * @param facetNames         Names of the facets to include in this configuration.
 * @param facetAddresses     Map of facet contract name → deployed address.
 */
export async function createAssetMockConfiguration(
  blrContract: BusinessLogicResolver,
  facetNames: string[],
  facetAddresses: Record<string, string>,
): Promise<ConfigurationData> {
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
  });
}
