// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for the AssetMock shared context fixture.
 *
 * These tests verify that `deployAssetMockCtx()` deploys a single diamond
 * proxy via the MockFactory test-only path, that all contract handles bind to
 * the same address, that IAsset functions across asset classes are reachable,
 * and that the `loadFixture` snapshot/restore cycle is deterministic.
 *
 * @module test/scripts/integration/assetMockCtx
 */

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAssetMockCtx, assertHandlesBound } from "../../fixtures/ctx/assetCtx";
import { silenceScriptLogging } from "@test";

describe("AssetMock context fixture", () => {
  before(silenceScriptLogging);

  it("deploys and all handles point to the same address", async () => {
    const ctx = await loadFixture(deployAssetMockCtx);

    // THIS is the invariant — if any handle diverges, assertHandlesBound throws
    assertHandlesBound(ctx);
  });

  it("asset responds to IAsset functions across asset classes", async () => {
    const ctx = await loadFixture(deployAssetMockCtx);

    // Equity facet functions are reachable (no revert)
    // name() returns empty string (no initializer ran) but does not revert
    await expect(ctx.asset.name()).to.not.be.rejected;
    expect(await ctx.asset.totalSupply()).to.equal(0);

    // *ByPartition read (ERC1410 facet) — no revert
    const defaultPartition = "0x" + Buffer.from("default").toString("hex").padEnd(64, "0");
    const balance = await ctx.asset.balanceOfByPartition(defaultPartition, ctx.deployer.address);
    expect(balance).to.equal(0);
  });

  it("mockDiamondCut handles bound and forceNonOperational invocable", async () => {
    const ctx = await loadFixture(deployAssetMockCtx);

    expect(await ctx.mockDiamondCut.getAddress()).to.equal(await ctx.asset.getAddress());

    // forceNonOperational is a MockDiamondCut-specific function
    await expect(ctx.mockDiamondCut.forceNonOperational()).to.not.be.reverted;
  });

  it("loadFixture determinism", async () => {
    const ctx1 = await loadFixture(deployAssetMockCtx);
    const ctx2 = await loadFixture(deployAssetMockCtx);

    expect(await ctx1.asset.getAddress()).to.equal(await ctx2.asset.getAddress());
    expect(await ctx1.mockDiamondCut.getAddress()).to.equal(await ctx2.mockDiamondCut.getAddress());
  });
});
