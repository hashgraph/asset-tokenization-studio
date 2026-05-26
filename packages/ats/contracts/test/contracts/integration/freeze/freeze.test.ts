// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, type ResolverProxy, MockDiamondCut } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";
import { ATS_ROLES, FREEZE_RESOLVER_KEY } from "@scripts";

describe("Freeze Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;

  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

  async function deployFreezeFixture() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_D = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);
  }

  beforeEach(async () => {
    await loadFixture(deployFreezeFixture);
  });

  describe("initializeFreeze", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeFreeze is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_D).initializeFreeze())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_D.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeFreeze is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeFreeze())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(FREEZE_RESOLVER_KEY, 1);
    });
  });

  describe("initializeFreeze event", () => {
    it("GIVEN a fresh deployment WHEN initializeFreeze is called THEN emits FreezeInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(FREEZE_RESOLVER_KEY);
      await expect(asset.initializeFreeze()).to.emit(asset, "FreezeInitialized");
    });
  });
});
