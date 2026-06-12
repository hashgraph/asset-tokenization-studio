// SPDX-License-Identifier: Apache-2.0

/**
 * Equivalence tests for `setMultiPartition` on the shared AssetMock fixture.
 *
 * Verifies that `setMultiPartition` writes to the same ERC-1410 storage slot
 * that `PartitionsFacet.isMultiPartition()` reads from, and that the
 * `loadFixture` snapshot/restore cycle resets the flag between tests.
 *
 * @module test/scripts/integration/setters/multiPartition
 */

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAssetMockCtx } from "../../../fixtures/ctx/assetCtx";
import { ATS_ROLES, EMPTY_STRING, ZERO } from "@scripts";
import { executeRbac, MAX_UINT256, silenceScriptLogging } from "@test";

describe("setMultiPartition equivalence", () => {
  before(silenceScriptLogging);

  it("setMultiPartition(true) makes isMultiPartition() return true", async () => {
    const ctx = await loadFixture(deployAssetMockCtx);
    // Before: default is false (uninitialised bool)
    expect(await ctx.asset.isMultiPartition()).to.equal(false);
    // Set multi-partition mode
    await ctx.asset.setMultiPartition(true);
    // After: reflects the change
    expect(await ctx.asset.isMultiPartition()).to.equal(true);
  });

  it("setMultiPartition(false) reverts to single-partition", async () => {
    const ctx = await loadFixture(deployAssetMockCtx);
    await ctx.asset.setMultiPartition(true);
    expect(await ctx.asset.isMultiPartition()).to.equal(true);
    await ctx.asset.setMultiPartition(false);
    expect(await ctx.asset.isMultiPartition()).to.equal(false);
  });

  it("setMultiPartition writes to the same storage as initializeERC1410 — deterministic across snapshot restores", async () => {
    const ctx1 = await loadFixture(deployAssetMockCtx);
    await ctx1.asset.setMultiPartition(true);
    expect(await ctx1.asset.isMultiPartition()).to.equal(true);

    // Second loadFixture restores snapshot — isMultiPartition should be back to default
    const ctx2 = await loadFixture(deployAssetMockCtx);
    expect(await ctx2.asset.isMultiPartition()).to.equal(false);
  });

  it("setMultiPartition(true) enables issueByPartition to a non-default partition", async () => {
    const ctx = await loadFixture(deployAssetMockCtx);
    const NON_DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000011";

    await ctx.asset.setMultiPartition(true);
    await executeRbac(ctx.asset, [
      { role: ATS_ROLES.ROLE_ISSUER, members: [ctx.deployer.address] },
      { role: ATS_ROLES.ROLE_KYC, members: [ctx.deployer.address] },
      { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [ctx.deployer.address] },
    ]);
    await ctx.asset.addIssuer(ctx.deployer.address);
    await ctx.asset.grantKyc(ctx.user1.address, EMPTY_STRING, ZERO, MAX_UINT256, ctx.deployer.address);

    await expect(
      ctx.asset.issueByPartition({
        partition: NON_DEFAULT_PARTITION,
        tokenHolder: ctx.user1.address,
        value: 1000,
        data: "0x",
      }),
    )
      .to.emit(ctx.asset, "IssuedByPartition")
      .withArgs(NON_DEFAULT_PARTITION, ctx.deployer.address, ctx.user1.address, 1000, "0x");

    expect(await ctx.asset.balanceOfByPartition(NON_DEFAULT_PARTITION, ctx.user1.address)).to.equal(1000);
    expect(await ctx.asset.totalSupplyByPartition(NON_DEFAULT_PARTITION)).to.equal(1000);
  });

  it("setMultiPartition(false) reverts issueByPartition to a non-default partition", async () => {
    const ctx = await loadFixture(deployAssetMockCtx);
    const NON_DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000011";

    await ctx.asset.grantRole(ATS_ROLES.ROLE_ISSUER, ctx.deployer.address);

    await expect(
      ctx.asset.issueByPartition({
        partition: NON_DEFAULT_PARTITION,
        tokenHolder: ctx.user1.address,
        value: 1000,
        data: "0x",
      }),
    )
      .to.be.revertedWithCustomError(ctx.asset, "PartitionNotAllowedInSinglePartitionMode")
      .withArgs(NON_DEFAULT_PARTITION);
  });
});
