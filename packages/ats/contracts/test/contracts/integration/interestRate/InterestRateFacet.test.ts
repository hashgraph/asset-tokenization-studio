// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, RESOLVER_KEY_INTEREST_RATE } from "@scripts";
import { TEST_BOND_FIXED_RATE, executeRbac } from "@test";
import type { AssetMockCtx } from "@test";

enum RateType {
  STANDARD = 0,
  FIXED = 1,
  KPI_LINKED = 2,
}

export function interestRateFacetTests(getCtx: () => AssetMockCtx): void {
  describe("InterestRateFacet Tests", () => {
    let asset: IAssetMock;
    let admin: HardhatEthersSigner;
    let nonAdmin: HardhatEthersSigner;

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      admin = ctx.deployer;
      nonAdmin = ctx.user2;

      await executeRbac(asset, [{ role: ATS_ROLES.ROLE_INTEREST_RATE_MANAGER, members: [admin.address] }]);

      await asset.connect(admin).setCouponRateType(RateType.FIXED);
      await asset.connect(admin).setRate(TEST_BOND_FIXED_RATE.RATE, TEST_BOND_FIXED_RATE.RATE_DECIMALS);
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
        await asset.forceFacetNotRegistered(RESOLVER_KEY_INTEREST_RATE);
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

      it("GIVEN non-admin WHEN setCouponRateType THEN reverts with AccountHasNoRole", async () => {
        await expect(asset.connect(nonAdmin).setCouponRateType(RateType.FIXED)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN a deactivated asset WHEN setCouponRateType THEN reverts with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(asset.connect(admin).setCouponRateType(RateType.STANDARD)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });
    });

    describe("Standard bond", () => {
      it("GIVEN a standard bond WHEN getCouponRateType THEN returns STANDARD", async () => {
        await asset.connect(admin).setCouponRateType(RateType.STANDARD);
        expect(await asset.getCouponRateType()).to.equal(RateType.STANDARD);
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN setCouponRateType THEN reverts with AssetNotOperational", async () => {
        await expect(asset.setCouponRateType(1)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
