// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";

describe("Voting Tests", () => {
  let signer_A: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deployVotingFixture() {
    const base = await deployEquityTokenFixture();
    signer_A = base.deployer;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", base.diamond.target, signer_A);
  }

  beforeEach(async () => {
    await loadFixture(deployVotingFixture);
  });

  describe("initializeVoting", () => {
    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeVoting is called THEN it reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeVoting()).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    describe("when already initialised", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).initializeVoting();
      });

      it("GIVEN an already-initialised facet WHEN initializeVoting is called again THEN it reverts with FacetAlreadyRegistered", async () => {
        await expect(asset.connect(signer_A).initializeVoting()).to.be.revertedWithCustomError(
          asset,
          "FacetAlreadyRegistered",
        );
      });
    });

    it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeVoting is called THEN it emits VotingInitialized", async () => {
      await expect(asset.connect(signer_A).initializeVoting()).to.emit(asset, "VotingInitialized");
    });
  });
});
