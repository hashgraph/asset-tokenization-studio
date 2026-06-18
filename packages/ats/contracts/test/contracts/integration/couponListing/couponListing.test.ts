// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock, IAssetMock__factory } from "@contract-types";
import { ATS_ROLES, TIME_PERIODS_S, RESOLVER_KEY_COUPON_LISTING } from "@scripts";
import { getDltTimestamp } from "@test";
import type { AssetMockCtx } from "@test";

export function couponListingTests(getCtx: () => AssetMockCtx): void {
  describe("CouponListing Tests", () => {
    let asset: IAssetMock;
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;

    let startingDate = 0;
    let maturityDate = 0;

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      signer_A = ctx.deployer;
      signer_B = ctx.user1;

      const currentTimestamp = await getDltTimestamp();
      startingDate = currentTimestamp + TIME_PERIODS_S.DAY;
      maturityDate = startingDate + TIME_PERIODS_S.YEAR;

      await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A.address);
      await asset.grantRole(ATS_ROLES.ROLE_INTEREST_RATE_MANAGER, signer_A.address);
      await asset.grantRole(ATS_ROLES.ROLE_MATURITY_MANAGER, signer_A.address);
      await asset.setCouponRateType(2);
      await asset.updateMaturityDate(maturityDate);
    });

    it("GIVEN multiple coupons WHEN triggerScheduledCrossOrderedTasks is called after fixingDate THEN coupons are added to ordered list", async () => {
      const ctx = getCtx();
      const secondAddress = await ctx.factory.deployAssetMock.staticCall(ctx.blr);
      await ctx.factory.deployAssetMock(ctx.blr);
      const kpiAsset = IAssetMock__factory.connect(secondAddress, signer_A);

      await kpiAsset.grantRole(ATS_ROLES.ROLE_INTEREST_RATE_MANAGER, signer_A.address);
      await kpiAsset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A.address);
      await kpiAsset.grantRole(ATS_ROLES.ROLE_MATURITY_MANAGER, signer_A.address);
      await kpiAsset.setCouponRateType(2);
      await kpiAsset.updateMaturityDate(maturityDate);

      const timestamp = await getDltTimestamp();

      const coupon1 = {
        recordDate: (timestamp + TIME_PERIODS_S.DAY).toString(),
        executionDate: (timestamp + TIME_PERIODS_S.DAY * 2).toString(),
        rate: 0,
        rateDecimals: 0,
        startDate: timestamp.toString(),
        endDate: (timestamp + TIME_PERIODS_S.DAY).toString(),
        fixingDate: (timestamp + TIME_PERIODS_S.DAY).toString(),
        rateStatus: 0,
      };

      const coupon2 = {
        recordDate: (timestamp + TIME_PERIODS_S.DAY * 2).toString(),
        executionDate: (timestamp + TIME_PERIODS_S.DAY * 3).toString(),
        rate: 0,
        rateDecimals: 0,
        startDate: (timestamp + TIME_PERIODS_S.DAY).toString(),
        endDate: (timestamp + TIME_PERIODS_S.DAY * 2).toString(),
        fixingDate: (timestamp + TIME_PERIODS_S.DAY * 2).toString(),
        rateStatus: 0,
      };

      await expect(kpiAsset.setCoupon(coupon1)).to.emit(kpiAsset, "CouponSet");
      await expect(kpiAsset.setCoupon(coupon2)).to.emit(kpiAsset, "CouponSet");

      let orderedList = await kpiAsset.getCouponsOrderedList(0, 10, false);
      expect(orderedList).to.be.an("array").with.lengthOf(0);

      await kpiAsset.changeSystemTimestamp(timestamp + TIME_PERIODS_S.DAY + 1);
      await kpiAsset.triggerPendingScheduledCrossOrderedTasks();

      orderedList = await kpiAsset.getCouponsOrderedList(0, 10, false);
      expect(orderedList).to.be.an("array").with.lengthOf(1);
      expect(orderedList[0]).to.equal(1);

      await kpiAsset.changeSystemTimestamp(timestamp + TIME_PERIODS_S.DAY * 2 + 1);
      await kpiAsset.triggerPendingScheduledCrossOrderedTasks();

      orderedList = await kpiAsset.getCouponsOrderedList(0, 10, false);
      expect(orderedList).to.be.an("array").with.lengthOf(2);
      expect(orderedList[0]).to.equal(1);
      expect(orderedList[1]).to.equal(2);

      const couponIdAtPos0 = await kpiAsset.getCouponFromOrderedListAt(0, false);
      const couponIdAtPos1 = await kpiAsset.getCouponFromOrderedListAt(1, false);
      expect(couponIdAtPos0).to.equal(1);
      expect(couponIdAtPos1).to.equal(2);

      const totalCouponsInOrderedList = await kpiAsset.getCouponsOrderedListTotal(false);
      expect(totalCouponsInOrderedList).to.equal(2);
    });

    it("GIVEN empty ordered list WHEN getCouponFromOrderedListAt with _pos >= getCouponsOrderedListTotalAdjustedAt THEN returns 0", async () => {
      const couponIdAtPos0 = await asset.getCouponFromOrderedListAt(0, false);
      expect(couponIdAtPos0).to.equal(0);

      const couponIdAtPos1 = await asset.getCouponFromOrderedListAt(1, false);
      expect(couponIdAtPos1).to.equal(0);

      const couponIdAtPos100 = await asset.getCouponFromOrderedListAt(100, false);
      expect(couponIdAtPos100).to.equal(0);
    });

    describe("scheduledCouponListingCount", () => {
      it("GIVEN no scheduled coupons WHEN scheduledCouponListingCount THEN returns 0", async () => {
        const count = await asset.scheduledCouponListingCount(false);
        expect(count).to.equal(0);
      });

      it("GIVEN scheduled coupons WHEN scheduledCouponListingCount THEN returns correct count", async () => {
        for (let i = 0; i < 3; i++) {
          const fixingDate = startingDate + TIME_PERIODS_S.MONTH * (i + 1);
          const executionDate = fixingDate + TIME_PERIODS_S.WEEK;

          await asset.connect(signer_A).setCoupon({
            recordDate: fixingDate.toString(),
            executionDate: executionDate.toString(),
            rate: 0,
            rateDecimals: 0,
            startDate: (fixingDate - TIME_PERIODS_S.WEEK).toString(),
            endDate: fixingDate.toString(),
            fixingDate: fixingDate.toString(),
            rateStatus: 0,
          });
        }

        const count = await asset.scheduledCouponListingCount(false);
        expect(count).to.equal(3);
      });
    });

    describe("getScheduledCouponListing", () => {
      beforeEach(async () => {
        for (let i = 0; i < 5; i++) {
          const fixingDate = startingDate + TIME_PERIODS_S.MONTH * (i + 1);
          const executionDate = fixingDate + TIME_PERIODS_S.WEEK;

          await asset.connect(signer_A).setCoupon({
            recordDate: fixingDate.toString(),
            executionDate: executionDate.toString(),
            rate: 0,
            rateDecimals: 0,
            startDate: (fixingDate - TIME_PERIODS_S.WEEK).toString(),
            endDate: fixingDate.toString(),
            fixingDate: fixingDate.toString(),
            rateStatus: 0,
          });
        }
      });

      it("GIVEN scheduled coupons WHEN getScheduledCouponListing with page 0 and length 10 THEN returns all coupons", async () => {
        const coupons = await asset.getScheduledCouponListing(0, 10, false);
        expect(coupons.length).to.equal(5);
      });

      it("GIVEN scheduled coupons WHEN getScheduledCouponListing with page 0 and length 3 THEN returns first 3 coupons", async () => {
        const coupons = await asset.getScheduledCouponListing(0, 3, false);
        expect(coupons.length).to.equal(3);
      });

      it("GIVEN scheduled coupons WHEN getScheduledCouponListing with page 1 and length 3 THEN returns next 2 coupons", async () => {
        const coupons = await asset.getScheduledCouponListing(1, 3, false);
        expect(coupons.length).to.equal(2);
      });

      it("GIVEN scheduled coupons WHEN getScheduledCouponListing with page 2 and length 3 THEN returns empty array", async () => {
        const coupons = await asset.getScheduledCouponListing(2, 3, false);
        expect(coupons.length).to.equal(0);
      });

      it("GIVEN scheduled coupons WHEN getScheduledCouponListing THEN returns tasks with correct structure", async () => {
        const coupons = await asset.getScheduledCouponListing(0, 1, false);
        expect(coupons.length).to.equal(1);
        const coupon = {
          scheduledTimestamp: coupons[0].scheduledTimestamp,
          data: coupons[0].data,
        };
        expect(coupon).to.have.property("scheduledTimestamp");
        expect(coupon).to.have.property("data");
        expect(coupon.scheduledTimestamp).to.be.gt(0);
        expect(coupon.data).to.not.equal("0x");
      });
    });

    describe("getCouponsOrderedListTotal / getCouponsOrderedList: cancelled coupons are excluded", () => {
      it("GIVEN a pending listing task WHEN its coupon is cancelled THEN getCouponsOrderedListTotal returns zero", async () => {
        const fixingDate = startingDate + TIME_PERIODS_S.MONTH;
        const executionDate = fixingDate + TIME_PERIODS_S.WEEK;

        await asset.connect(signer_A).setCoupon({
          recordDate: fixingDate.toString(),
          executionDate: executionDate.toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: startingDate.toString(),
          endDate: fixingDate.toString(),
          fixingDate: fixingDate.toString(),
          rateStatus: 0,
        });

        await asset.changeSystemTimestamp(fixingDate + 1);

        expect(await asset.getCouponsOrderedListTotal(false)).to.equal(1);

        await asset.connect(signer_A).cancelCoupon(1);

        expect(await asset.getCouponsOrderedListTotal(false)).to.equal(0);
      });

      it("GIVEN a pending listing task WHEN its coupon is cancelled THEN getCouponsOrderedList returns empty array", async () => {
        const fixingDate = startingDate + TIME_PERIODS_S.MONTH;
        const executionDate = fixingDate + TIME_PERIODS_S.WEEK;

        await asset.connect(signer_A).setCoupon({
          recordDate: fixingDate.toString(),
          executionDate: executionDate.toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: startingDate.toString(),
          endDate: fixingDate.toString(),
          fixingDate: fixingDate.toString(),
          rateStatus: 0,
        });

        await asset.changeSystemTimestamp(fixingDate + 1);

        let list = await asset.getCouponsOrderedList(0, 10, false);
        expect(list).to.have.lengthOf(1);

        await asset.connect(signer_A).cancelCoupon(1);

        list = await asset.getCouponsOrderedList(0, 10, false);
        expect(list).to.have.lengthOf(0);
      });

      it("GIVEN two pending listing tasks WHEN one coupon is cancelled THEN only the active task is counted", async () => {
        const fixingDate1 = startingDate + TIME_PERIODS_S.MONTH;
        const fixingDate2 = startingDate + TIME_PERIODS_S.MONTH * 2;
        const executionDate1 = fixingDate2 + TIME_PERIODS_S.WEEK * 2;
        const executionDate2 = fixingDate2 + TIME_PERIODS_S.WEEK * 3;

        await asset.connect(signer_A).setCoupon({
          recordDate: fixingDate1.toString(),
          executionDate: executionDate1.toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: startingDate.toString(),
          endDate: fixingDate1.toString(),
          fixingDate: fixingDate1.toString(),
          rateStatus: 0,
        });

        await asset.connect(signer_A).setCoupon({
          recordDate: fixingDate2.toString(),
          executionDate: executionDate2.toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: fixingDate1.toString(),
          endDate: fixingDate2.toString(),
          fixingDate: fixingDate2.toString(),
          rateStatus: 0,
        });

        await asset.changeSystemTimestamp(fixingDate2 + 1);

        expect(await asset.getCouponsOrderedListTotal(false)).to.equal(2);

        await asset.connect(signer_A).cancelCoupon(1);

        expect(await asset.getCouponsOrderedListTotal(false)).to.equal(1);

        const list = await asset.getCouponsOrderedList(0, 10, false);
        expect(list).to.have.lengthOf(1);
        expect(list[0]).to.equal(2n);
      });
    });

    describe("_includeDisabled=true includes cancelled coupon tasks; false excludes them", () => {
      it("GIVEN a cancelled pending listing task WHEN scheduledCouponListingCount(false) THEN returns 0 and (true) returns 1", async () => {
        const fixingDate = startingDate + TIME_PERIODS_S.MONTH;
        const executionDate = fixingDate + TIME_PERIODS_S.WEEK;

        await asset.connect(signer_A).setCoupon({
          recordDate: fixingDate.toString(),
          executionDate: executionDate.toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: startingDate.toString(),
          endDate: fixingDate.toString(),
          fixingDate: fixingDate.toString(),
          rateStatus: 0,
        });

        await asset.connect(signer_A).cancelCoupon(1);

        expect(await asset.scheduledCouponListingCount(false)).to.equal(0);
        expect(await asset.scheduledCouponListingCount(true)).to.equal(1);
      });

      it("GIVEN a cancelled pending listing task WHEN getScheduledCouponListing(false) THEN returns empty and (true) returns the task", async () => {
        const fixingDate = startingDate + TIME_PERIODS_S.MONTH;
        const executionDate = fixingDate + TIME_PERIODS_S.WEEK;

        await asset.connect(signer_A).setCoupon({
          recordDate: fixingDate.toString(),
          executionDate: executionDate.toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: startingDate.toString(),
          endDate: fixingDate.toString(),
          fixingDate: fixingDate.toString(),
          rateStatus: 0,
        });

        await asset.connect(signer_A).cancelCoupon(1);

        const excluded = await asset.getScheduledCouponListing(0, 10, false);
        expect(excluded).to.have.lengthOf(0);

        const included = await asset.getScheduledCouponListing(0, 10, true);
        expect(included).to.have.lengthOf(1);
        expect(included[0].scheduledTimestamp).to.equal(BigInt(fixingDate));
      });

      it("GIVEN a cancelled pending listing task WHEN getCouponsOrderedListTotal(false) THEN returns 0 and (true) returns 1", async () => {
        const fixingDate = startingDate + TIME_PERIODS_S.MONTH;
        const executionDate = fixingDate + TIME_PERIODS_S.WEEK;

        await asset.connect(signer_A).setCoupon({
          recordDate: fixingDate.toString(),
          executionDate: executionDate.toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: startingDate.toString(),
          endDate: fixingDate.toString(),
          fixingDate: fixingDate.toString(),
          rateStatus: 0,
        });

        await asset.changeSystemTimestamp(fixingDate + 1);
        await asset.connect(signer_A).cancelCoupon(1);

        expect(await asset.getCouponsOrderedListTotal(false)).to.equal(0);
        expect(await asset.getCouponsOrderedListTotal(true)).to.equal(1);
      });

      it("GIVEN a cancelled pending listing task WHEN getCouponsOrderedList(false) THEN returns empty and (true) returns cancelled coupon", async () => {
        const fixingDate = startingDate + TIME_PERIODS_S.MONTH;
        const executionDate = fixingDate + TIME_PERIODS_S.WEEK;

        await asset.connect(signer_A).setCoupon({
          recordDate: fixingDate.toString(),
          executionDate: executionDate.toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: startingDate.toString(),
          endDate: fixingDate.toString(),
          fixingDate: fixingDate.toString(),
          rateStatus: 0,
        });

        await asset.changeSystemTimestamp(fixingDate + 1);
        await asset.connect(signer_A).cancelCoupon(1);

        const excluded = await asset.getCouponsOrderedList(0, 10, false);
        expect(excluded).to.have.lengthOf(0);

        const included = await asset.getCouponsOrderedList(0, 10, true);
        expect(included).to.have.lengthOf(1);
        expect(included[0]).to.equal(1n);
      });

      it("GIVEN a cancelled pending listing task WHEN getCouponFromOrderedListAt(0, false) THEN returns 0 and (0, true) returns coupon id", async () => {
        const fixingDate = startingDate + TIME_PERIODS_S.MONTH;
        const executionDate = fixingDate + TIME_PERIODS_S.WEEK;

        await asset.connect(signer_A).setCoupon({
          recordDate: fixingDate.toString(),
          executionDate: executionDate.toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: startingDate.toString(),
          endDate: fixingDate.toString(),
          fixingDate: fixingDate.toString(),
          rateStatus: 0,
        });

        await asset.changeSystemTimestamp(fixingDate + 1);
        await asset.connect(signer_A).cancelCoupon(1);

        expect(await asset.getCouponFromOrderedListAt(0, false)).to.equal(0n);
        expect(await asset.getCouponFromOrderedListAt(0, true)).to.equal(1n);
      });
    });

    describe("initializeCouponListing", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeCouponListing is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_B).initializeCouponListing())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_B.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeCouponListing is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeCouponListing())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_COUPON_LISTING, 1);
      });
    });

    describe("initializeCouponListing event", () => {
      it("GIVEN a fresh deployment WHEN initializeCouponListing is called THEN emits CouponListingInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_COUPON_LISTING);
        await expect(asset.initializeCouponListing()).to.emit(asset, "CouponListingInitialized");
      });
    });
  });
}
