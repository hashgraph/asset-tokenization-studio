// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset, MockDiamondCut } from "@contract-types";
import { deployEquityTokenFixture } from "@test";
import { ATS_ROLES, RESOLVER_KEY_NONCES } from "@scripts";

describe("Nonces Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

  beforeEach(async () => {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);
  });

  describe("Nonces", () => {
    it("GIVEN any account WHEN nonces is called THEN the current nonce for that account is returned", async () => {
      const nonces = await asset.nonces(signer_A.address);
      expect(nonces).to.equal(0);
    });
  });

  describe("initializeNonces", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeNonces is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeNonces())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeNonces is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeNonces())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(RESOLVER_KEY_NONCES, 1);
    });
  });

  describe("initializeNonces event", () => {
    it("GIVEN a fresh deployment WHEN initializeNonces is called THEN emits NoncesInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(RESOLVER_KEY_NONCES);
      await expect(asset.initializeNonces()).to.emit(asset, "NoncesInitialized");
    });
  });
});
