// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, MockDiamondCut } from "@contract-types";
import { ATS_ROLES } from "@scripts";
import { deployBondTokenFixture } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const BOND_VARIABLE_READ_RESOLVER_KEY = "0x624866e79d4c0a78a8dc32cbce49563cdf86eba627bd05a9821dbaa1674ac231";

describe("BondUSARead Tests", () => {
  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;
  let unknownSigner: HardhatEthersSigner;

  async function deployFixture() {
    const base = await deployBondTokenFixture();
    asset = await ethers.getContractAt("IAsset", base.diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", base.diamond.target);
    const signers = await ethers.getSigners();
    unknownSigner = signers[signers.length - 1];
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  describe("initializeBondUSARead", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeBondUSARead THEN AccountHasNoRole", async () => {
      await expect(asset.connect(unknownSigner).initializeBondUSARead())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(await unknownSigner.getAddress(), ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeBondUSARead THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeBondUSARead())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(BOND_VARIABLE_READ_RESOLVER_KEY, 1);
    });
  });

  describe("initializeBondUSARead event", () => {
    it("GIVEN fresh facet WHEN initializeBondUSARead THEN emits BondUSAReadInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(BOND_VARIABLE_READ_RESOLVER_KEY);
      await expect(asset.initializeBondUSARead()).to.emit(asset, "BondUSAReadInitialized");
    });
  });
});
