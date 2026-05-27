// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, MockDiamondCut } from "@contract-types";
import { deployBondTokenFixture } from "@test";
import { ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const NOMINAL_VALUE_RESOLVER_KEY = "0x48903d4da8b1f0a5e9a9874be74ec5d2f8043d4d5b65cc093173c3dae103df8f";

describe("NominalValue Tests", () => {
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

  describe("initializeNominalValue", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeNominalValue THEN AccountHasNoRole", async () => {
      await expect(asset.connect(unknownSigner).initializeNominalValue(1, 6, "0x000000"))
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(await unknownSigner.getAddress(), ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeNominalValue THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeNominalValue(1, 6, "0x000000"))
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(NOMINAL_VALUE_RESOLVER_KEY, 1);
    });
  });

  describe("initializeNominalValue event", () => {
    it("GIVEN fresh facet WHEN initializeNominalValue THEN emits NominalValueInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(NOMINAL_VALUE_RESOLVER_KEY);
      await expect(asset.initializeNominalValue(1, 6, "0x000000")).to.emit(asset, "NominalValueInitialized");
    });
  });

  describe("nonOperational", () => {
    beforeEach(async () => {
      await mockDiamondCut.forceNonOperational();
    });

    it("GIVEN non-operational asset WHEN setNominalValue THEN AssetNotOperational", async () => {
      await expect(asset.setNominalValue(0, 0)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
    });

    it("GIVEN non-operational asset WHEN setNominalValueCurrency THEN AssetNotOperational", async () => {
      await expect(asset.setNominalValueCurrency("0x000000")).to.be.revertedWithCustomError(
        asset,
        "AssetNotOperational",
      );
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN setNominalValue THEN transaction fails with Deactivated", async () => {
      const base = await deployBondTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).setNominalValue(0, 0)).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });

    it("GIVEN a deactivated asset WHEN setNominalValueCurrency THEN transaction fails with Deactivated", async () => {
      const base = await deployBondTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).setNominalValueCurrency("0x000000"),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });
});
