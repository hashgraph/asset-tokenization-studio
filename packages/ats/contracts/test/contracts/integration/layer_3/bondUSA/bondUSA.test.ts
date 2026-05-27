// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, MockDiamondCut } from "@contract-types";
import { ATS_ROLES } from "@scripts";
import { deployBondTokenFixture, getBondDetails } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const BOND_VARIABLE_RATE_RESOLVER_KEY = "0xe6594ee8f54f346ab25268fdc7955031a6b06102355e1446353d89ab1d593de3";

describe("BondUSATests", () => {
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

  describe("initializeBondUSA", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeBondUSA THEN AccountHasNoRole", async () => {
      await mockDiamondCut.forceFacetNotRegistered(BOND_VARIABLE_RATE_RESOLVER_KEY);
      const bondDetails = await getBondDetails();
      await expect(asset.connect(unknownSigner).initializeBondUSA(bondDetails))
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(await unknownSigner.getAddress(), ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeBondUSA THEN FacetAlreadyRegistered", async () => {
      const bondDetails = await getBondDetails();
      await expect(asset.initializeBondUSA(bondDetails))
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(BOND_VARIABLE_RATE_RESOLVER_KEY, 1);
    });
  });

  describe("initializeBondUSA event", () => {
    it("GIVEN fresh facet WHEN initializeBondUSA THEN emits BondUSAInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(BOND_VARIABLE_RATE_RESOLVER_KEY);
      const bondDetails = await getBondDetails();
      await expect(asset.initializeBondUSA(bondDetails)).to.emit(asset, "BondUSAInitialized");
    });
  });
});
