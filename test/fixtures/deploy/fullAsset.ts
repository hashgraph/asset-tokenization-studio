// SPDX-License-Identifier: Apache-2.0

/**
 * Test-only full-asset deployment fixture.
 *
 * Deploys the complete ATS infrastructure via the Ignition-based
 * `deployAtsInfrastructureFixture` (TimeTravel mode) and then registers the
 * ASSET_MOCK_CONFIG_ID on top, so shared-fixture tests can deploy a single
 * diamond exposing every IAsset facet function.
 *
 * The production module tree is kept clean of any assetMock references —
 * this module is the sole place where the mock configuration is created
 * outside the per-test inline path.
 *
 * @see openspec/changes/test-optimization-shared-fixtures
 */

import { deployAtsInfrastructureFixture } from "../infrastructure.fixture";
import { createAssetMockConfiguration } from "./assetMockConfiguration";
import { ALL_ASSET_FACETS, buildFacetList } from "@lib/domain";
import type { IMockFactory } from "@contract-types";

/**
 * Fixture: deploy full ATS infrastructure *with* AssetMock configuration.
 *
 * Matches the return shape of `deployAtsInfrastructureFixture` from the base
 * infrastructure module, with the assetMock config added to the deployment
 * metadata (`configurations.assetMock`, `helpers.getAssetMockFacets()`).
 *
 * Use this in tests that need to interact with assets deployed via
 * `ASSET_MOCK_CONFIG_ID` — e.g. `assetMockCtx.test.ts` and
 * `assetMockConfiguration.test.ts`.
 *
 * Zero-param named function required for `loadFixture` caching.
 */
export async function deployAtsInfrastructureFullAssetFixture() {
  // 1. Base infrastructure via Ignition (TimeTravel mode, so the Factory
  //    configuration is built from MockFacetFactory and mocks are registered).
  const base = await deployAtsInfrastructureFixture(true);

  // 2. Build facetAddresses map from the deployment facet list.
  const facetAddresses: Record<string, string> = {};
  for (const facet of base.deployment.facets) {
    facetAddresses[facet.name] = facet.address;
  }

  // 3. Resolve the full IAsset facet union from the compile-checked ALL_ASSET_FACETS
  //    constant, then run it through buildFacetList — the same helper every production
  //    config uses — which (in test mode) swaps DiamondFacet→MockDiamondCut and appends
  //    the test-only EvmAccessorsFacet. No hardcoded facet names live here.
  const allFacetNames = buildFacetList(ALL_ASSET_FACETS, true);

  // 4. Create the assetMock configuration on the deployed BLR.
  const assetMockConfig = await createAssetMockConfiguration(base.blr, allFacetNames, facetAddresses);

  // 5. Augment the deployment metadata with the assetMock info.
  const assetMockKeys = new Set(assetMockConfig.facetKeys.map((f) => f.key));
  const getAssetMockFacets = () => {
    const filtered = base.deployment.facets.filter((f) => assetMockKeys.has(f.key));
    return Array.from(new Map(filtered.map((f) => [f.key, f])).values());
  };

  const deployment = {
    ...base.deployment,
    configurations: {
      ...base.deployment.configurations,
      assetMock: {
        configId: assetMockConfig.configurationId,
        version: assetMockConfig.version,
        facetCount: assetMockConfig.facetKeys.length,
        facets: assetMockConfig.facetKeys,
      },
    },
    helpers: {
      ...base.deployment.helpers,
      getAssetMockFacets,
    },
    summary: {
      ...base.deployment.summary,
      totalConfigurations: base.deployment.summary.totalConfigurations + 1,
    },
  };

  return {
    ...base,
    // TimeTravel mode always deploys the mock factory.
    factory: base.factory as IMockFactory,
    deployment,

    // AssetMock config metadata (populated from the augmented deployment)
    assetMockConfigId: assetMockConfig.configurationId,
    assetMockFacets: getAssetMockFacets(),
  };
}
