// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { deployEquityTokenFixture } from "@test";

describe("Nonces Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  beforeEach(async () => {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target);
  });

  describe("Nonces", () => {
    it("GIVEN any account WHEN nonces is called THEN the current nonce for that account is returned", async () => {
      const nonces = await asset.nonces(signer_A.address);
      expect(nonces).to.equal(0);
    });
  });

  describe("initializeNonces", () => {
    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeNonces is called THEN it reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeNonces()).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    describe("when already initialised", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).initializeNonces();
      });

      it("GIVEN an already-initialised facet WHEN initializeNonces is called again THEN it reverts with FacetAlreadyRegistered", async () => {
        await expect(asset.connect(signer_A).initializeNonces()).to.be.revertedWithCustomError(
          asset,
          "FacetAlreadyRegistered",
        );
      });
    });

    it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeNonces is called THEN it emits NoncesInitialized", async () => {
      await expect(asset.connect(signer_A).initializeNonces()).to.emit(asset, "NoncesInitialized");
    });
  });
});
