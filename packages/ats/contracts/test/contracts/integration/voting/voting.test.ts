// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, MockDiamondCut } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";
import { RESOLVER_KEY_VOTING } from "@scripts";

describe("Voting Tests", () => {
  let signer_A: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

  async function deployVotingFixture() {
    const base = await deployEquityTokenFixture();
    signer_A = base.deployer;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", base.diamond.target, signer_A);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", base.diamond.target);
  }

  beforeEach(async () => {
    await loadFixture(deployVotingFixture);
  });

  describe("initializeVoting", () => {
    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeVoting is called THEN it reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeVoting()).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN already-initialised WHEN initializeVoting is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeVoting())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(RESOLVER_KEY_VOTING, 1);
    });
  });

  describe("initializeVoting event", () => {
    it("GIVEN a fresh deployment WHEN initializeVoting is called THEN emits VotingInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(RESOLVER_KEY_VOTING);
      await expect(asset.initializeVoting()).to.emit(asset, "VotingInitialized");
    });
  });

  describe("nonOperational", () => {
    beforeEach(async () => {
      await mockDiamondCut.forceNonOperational();
    });

    it("GIVEN non-operational asset WHEN setVoting THEN AssetNotOperational", async () => {
      await expect(asset.setVoting({ recordDate: 0, data: "0x" })).to.be.revertedWithCustomError(
        asset,
        "AssetNotOperational",
      );
    });

    it("GIVEN non-operational asset WHEN cancelVoting THEN AssetNotOperational", async () => {
      await expect(asset.cancelVoting(0)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
    });
  });
});
