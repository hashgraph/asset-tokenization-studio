// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, MockDiamondCut } from "@contract-types";
import { ATS_ROLES, INTEREST_RATE_RESOLVER_KEY } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBondFixedRateTokenFixture, deployBondTokenFixture, executeRbac } from "@test";

// Must match ICouponTypes.RateType order
enum RateType {
  NONE = 0,
  STANDARD = 1,
  FIXED = 2,
  KPI_LINKED = 3,
}

describe("InterestRateFacet Tests", () => {
  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;
  let admin: HardhatEthersSigner;
  let nonAdmin: HardhatEthersSigner;

  async function deployFixedRateFixture() {
    const base = await deployBondFixedRateTokenFixture();
    asset = await ethers.getContractAt("IAsset", base.diamond.target as string);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", base.diamond.target);
    admin = base.deployer;
    nonAdmin = base.user2;
    await executeRbac(asset, [{ role: ATS_ROLES.INTEREST_RATE_MANAGER_ROLE, members: [admin.address] }]);
  }

  beforeEach(async () => {
    await loadFixture(deployFixedRateFixture);
  });

  describe("initializeInterestRateType", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeInterestRateType is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(nonAdmin).initializeInterestRateType(RateType.FIXED))
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(nonAdmin.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeInterestRateType is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeInterestRateType(RateType.FIXED)).to.be.revertedWithCustomError(
        asset,
        "FacetAlreadyRegistered",
      );
    });
  });

  describe("initializeInterestRateType event", () => {
    it("GIVEN a fresh deployment WHEN initializeInterestRateType is called THEN emits InterestRateTypeInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(INTEREST_RATE_RESOLVER_KEY);
      await expect(asset.initializeInterestRateType(RateType.FIXED))
        .to.emit(asset, "InterestRateTypeInitialized")
        .withArgs(RateType.FIXED);
    });
  });

  describe("Fixed-rate bond", () => {
    it("GIVEN a fixed-rate bond WHEN getCouponRateType THEN returns FIXED", async () => {
      expect(await asset.getCouponRateType()).to.equal(RateType.FIXED);
    });

    it("GIVEN admin WHEN setCouponRateType with valid type THEN emits CouponRateTypeSet and updates storage", async () => {
      await expect(asset.connect(admin).setCouponRateType(RateType.STANDARD))
        .to.emit(asset, "CouponRateTypeSet")
        .withArgs(admin.address, RateType.STANDARD);

      expect(await asset.getCouponRateType()).to.equal(RateType.STANDARD);
    });

    it("GIVEN admin WHEN setCouponRateType(NONE) THEN reverts with InvalidRateType", async () => {
      await expect(asset.connect(admin).setCouponRateType(RateType.NONE)).to.be.revertedWithCustomError(
        asset,
        "InvalidRateType",
      );
    });

    it("GIVEN non-admin WHEN setCouponRateType THEN reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(nonAdmin).setCouponRateType(RateType.FIXED)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a deactivated asset WHEN setCouponRateType THEN reverts with Deactivated", async () => {
      await asset.connect(admin).grantRole(ATS_ROLES.DEACTIVATE_ROLE, admin.address);
      await asset.connect(admin).deactivate();
      await expect(asset.connect(admin).setCouponRateType(RateType.STANDARD)).to.be.revertedWithCustomError(
        asset,
        "Deactivated",
      );
    });
  });

  describe("Standard bond", () => {
    let asset: IAsset;

    async function deployFixture() {
      const base = await deployBondTokenFixture();
      asset = await ethers.getContractAt("IAsset", base.diamond.target);
    }

    beforeEach(async () => {
      await loadFixture(deployFixture);
    });

    it("GIVEN a standard bond WHEN getCouponRateType THEN returns STANDARD", async () => {
      expect(await asset.getCouponRateType()).to.equal(RateType.STANDARD);
    });
  });

  describe("nonOperational", () => {
    beforeEach(async () => {
      await mockDiamondCut.forceNonOperational();
    });

    it("GIVEN non-operational asset WHEN setCouponRateType THEN reverts with AssetNotOperational", async () => {
      await expect(asset.setCouponRateType(1)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
    });
  });
});
