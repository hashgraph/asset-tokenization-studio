// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for the AssetMock BLR test-only configuration.
 *
 * These tests verify that the full IAsset facet union plus MockDiamondCut
 * can be registered in the BusinessLogicResolver without selector or
 * resolver-key collisions.
 *
 * @module test/scripts/integration/assetMockConfiguration
 */

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAtsInfrastructureFullAssetFixture } from "../../fixtures/deploy/fullAsset";
import { ASSET_MOCK_CONFIG_ID, getAssetMockFacets } from "@scripts/domain";
import { BusinessLogicResolver__factory } from "@contract-types";
import { silenceScriptLogging } from "@test";

describe("AssetMock BLR Configuration - Integration Tests", () => {
  before(silenceScriptLogging);

  let ctx: Awaited<ReturnType<typeof deployAtsInfrastructureFullAssetFixture>>;

  beforeEach(async () => {
    ctx = await loadFixture(deployAtsInfrastructureFullAssetFixture);
  });

  it("should register the AssetMock configuration in the BLR", async () => {
    // GIVEN the full ATS infrastructure is deployed

    // THEN the configuration ID from the deployment output matches the constant
    expect(ctx.assetMockConfigId).to.equal(ASSET_MOCK_CONFIG_ID);

    // AND the facet list from the deployment output is non-empty
    expect(ctx.assetMockFacets).to.be.an("array").that.is.not.empty;
  });

  it("should resolve the full AssetMock facet set from the BLR", async () => {
    // GIVEN the full ATS infrastructure is deployed
    const blr = BusinessLogicResolver__factory.connect(ctx.deployment.infrastructure.blr.proxy, ctx.deployer);

    // WHEN we fetch the latest version of the AssetMock config
    const version = await blr.getLatestVersionByConfiguration(ASSET_MOCK_CONFIG_ID);
    expect(Number(version)).to.be.greaterThanOrEqual(1);

    // AND query the facet count for that version
    const facetCount = await blr.getFacetsLengthByConfigurationIdAndVersion(ASSET_MOCK_CONFIG_ID, version);

    // THEN the resolved facet count matches the expected facet set
    const expectedFacets = getAssetMockFacets();
    expect(Number(facetCount)).to.equal(expectedFacets.length);
  });

  it("should register MockDiamondCut under RESOLVER_KEY_DIAMOND", async () => {
    // GIVEN the full ATS infrastructure with AssetMock config and the
    // known RESOLVER_KEY_DIAMOND value (the bytes32 used in the BLR registry)
    const RESOLVER_KEY_DIAMOND = "0xd9202bb838fd8d0f2866f13141398cfb9fa74cbbbce7449c9158caffa9c509f4";

    // WHEN we query the BLR's latest version for the diamond resolver key
    const diamondVersion = (await ctx.blr.getLatestVersions([RESOLVER_KEY_DIAMOND]))[0];

    // THEN the diamond facet (MockDiamondCut) has been registered (version >= 1)
    expect(Number(diamondVersion)).to.be.greaterThanOrEqual(1);

    // AND the expected facet list includes MockDiamondCut rather than DiamondFacet
    const mockFacetNames = getAssetMockFacets();
    expect(mockFacetNames).to.include("MockDiamondCut");
    expect(mockFacetNames).to.not.include("DiamondFacet");
  });

  it("should have the same facet count across loadFixture restores", async () => {
    // GIVEN the expected facet set from the domain helper
    const expectedFacets = getAssetMockFacets();

    // WHEN we deploy infrastructure again via loadFixture (restores snapshot)
    const ctx2 = await loadFixture(deployAtsInfrastructureFullAssetFixture);
    const blr2 = BusinessLogicResolver__factory.connect(ctx2.deployment.infrastructure.blr.proxy, ctx2.deployer);
    const version2 = await blr2.getLatestVersionByConfiguration(ASSET_MOCK_CONFIG_ID);
    const facetCount2 = await blr2.getFacetsLengthByConfigurationIdAndVersion(ASSET_MOCK_CONFIG_ID, version2);

    // THEN the facet count is deterministic
    expect(Number(facetCount2)).to.equal(expectedFacets.length);
    expect(Number(version2)).to.be.greaterThanOrEqual(1);
  });
});
