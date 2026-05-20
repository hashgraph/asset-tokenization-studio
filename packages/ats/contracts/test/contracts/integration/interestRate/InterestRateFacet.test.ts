// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset } from "@contract-types";
import { ATS_ROLES } from "@scripts";
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
  describe("Fixed-rate bond", () => {
    let asset: IAsset;
    let admin: HardhatEthersSigner;
    let nonAdmin: HardhatEthersSigner;

    async function deployFixture() {
      const base = await deployBondFixedRateTokenFixture();
      asset = await ethers.getContractAt("IAsset", base.diamond.target as string);
      admin = base.deployer;
      nonAdmin = base.user2;
      await executeRbac(asset, [{ role: ATS_ROLES.INTEREST_RATE_MANAGER_ROLE, members: [admin.address] }]);
    }

    beforeEach(async () => {
      await loadFixture(deployFixture);
    });

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
});
