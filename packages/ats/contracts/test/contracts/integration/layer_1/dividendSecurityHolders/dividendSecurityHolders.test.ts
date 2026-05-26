// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { type IAsset, type ResolverProxy, MockDiamondCut } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ATS_ROLES, DIVIDEND_SECURITY_HOLDERS_RESOLVER_KEY } from "@scripts";
import { deployEquityTokenFixture } from "@test";

describe("DividendSecurityHolders Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureSinglePartition);
  });

  describe("initializeDividendSecurityHolders", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeDividendSecurityHolders is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeDividendSecurityHolders())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeDividendSecurityHolders is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeDividendSecurityHolders())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(DIVIDEND_SECURITY_HOLDERS_RESOLVER_KEY, 1);
    });
  });

  describe("initializeDividendSecurityHolders event", () => {
    it("GIVEN a fresh deployment WHEN initializeDividendSecurityHolders is called THEN emits DividendSecurityHoldersInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(DIVIDEND_SECURITY_HOLDERS_RESOLVER_KEY);
      await expect(asset.initializeDividendSecurityHolders()).to.emit(asset, "DividendSecurityHoldersInitialized");
    });
  });
});
