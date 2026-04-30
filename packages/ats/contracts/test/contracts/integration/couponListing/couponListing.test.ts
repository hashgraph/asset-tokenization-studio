// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { deployBondKpiLinkedRateTokenFixture, getDltTimestamp } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ATS_ROLES, TIME_PERIODS_S } from "@scripts";

describe("CouponListing Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;

  let asset: IAsset;

  let startingDate = 0;
  let maturityDate = 0;

  async function deploySecurityFixture() {
    const currentTimestamp = await getDltTimestamp();
    startingDate = currentTimestamp + TIME_PERIODS_S.DAY;
    maturityDate = startingDate + TIME_PERIODS_S.YEAR;

    const base = await deployBondKpiLinkedRateTokenFixture({
      bondDataParams: {
        securityData: {
          internalKycActivated: true,
        },
        bondDetails: {
          startingDate,
          maturityDate,
        },
      },
    });

    diamond = base.diamond;
    signer_A = base.deployer;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await asset.grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixture);
  });

  // ─── getCouponsOrderedList / getCouponFromOrderedListAt / getCouponsOrderedListTotal ───

  it("GIVEN multiple coupons WHEN triggerScheduledCrossOrderedTasks is called after fixingDate THEN coupons are added to ordered list", async () => {
    const kpiLinkedRateBase = await deployBondKpiLinkedRateTokenFixture({
      bondDataParams: {
        securityData: {
          isMultiPartition: false,
        },
        bondDetails: {
          startingDate,
          maturityDate,
        },
      },
    });

    const kpiDiamond = kpiLinkedRateBase.diamond;
    const kpiAsset = await ethers.getContractAt("IAsset", kpiDiamond.target, signer_A);

    await kpiAsset.grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_A.address);

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

    let orderedList = await kpiAsset.getCouponsOrderedList(0, 10);
    expect(orderedList).to.be.an("array").with.lengthOf(0);

    await kpiAsset.changeSystemTimestamp(timestamp + TIME_PERIODS_S.DAY + 1);
    await kpiAsset.triggerPendingScheduledCrossOrderedTasks();

    orderedList = await kpiAsset.getCouponsOrderedList(0, 10);
    expect(orderedList).to.be.an("array").with.lengthOf(1);
    expect(orderedList[0]).to.equal(1); // couponId 1

    await kpiAsset.changeSystemTimestamp(timestamp + TIME_PERIODS_S.DAY * 2 + 1);
    await kpiAsset.triggerPendingScheduledCrossOrderedTasks();

    orderedList = await kpiAsset.getCouponsOrderedList(0, 10);
    expect(orderedList).to.be.an("array").with.lengthOf(2);
    expect(orderedList[0]).to.equal(1); // couponId 1
    expect(orderedList[1]).to.equal(2); // couponId 2

    // Verify getCouponFromOrderedListAt works correctly
    const couponIdAtPos0 = await kpiAsset.getCouponFromOrderedListAt(0);
    const couponIdAtPos1 = await kpiAsset.getCouponFromOrderedListAt(1);
    expect(couponIdAtPos0).to.equal(1);
    expect(couponIdAtPos1).to.equal(2);

    // Verify getCouponsOrderedListTotal
    const totalCouponsInOrderedList = await kpiAsset.getCouponsOrderedListTotal();
    expect(totalCouponsInOrderedList).to.equal(2);
  });

  it("GIVEN deprecated coupons in bond storage AND new coupons in coupon storage WHEN getCouponFromOrderedListAt is called THEN it correctly routes to both storages with offset", async () => {
    const kpiLinkedRateBase = await deployBondKpiLinkedRateTokenFixture({
      bondDataParams: {
        securityData: {
          isMultiPartition: false,
        },
        bondDetails: {
          startingDate,
          maturityDate,
        },
      },
    });

    const kpiDiamond = kpiLinkedRateBase.diamond;
    const kpiAsset = await ethers.getContractAt("IAsset", kpiDiamond.target, signer_A);

    await kpiAsset.grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_A.address);

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

    await expect(kpiAsset.setCoupon(coupon1)).to.emit(kpiAsset, "CouponSet");

    // Trigger scheduled tasks to move coupon1 to ordered list
    await kpiAsset.changeSystemTimestamp(timestamp + TIME_PERIODS_S.DAY + 1);
    await kpiAsset.triggerPendingScheduledCrossOrderedTasks();

    // Add deprecated coupons to bond storage (simulating legacy data from before refactor)
    // testOnlyAddDeprecatedCoupon is a test-helper only on TimeTravelFacet, not on IAsset
    const timeTravelKpi = await ethers.getContractAt("TimeTravelFacet", kpiDiamond.target, signer_A);
    await timeTravelKpi.testOnlyAddDeprecatedCoupon(100);

    // 1 deprecated (in bond storage) + 1 new (in coupon storage)
    const totalCoupons = await kpiAsset.getCouponsOrderedListTotal();
    expect(totalCoupons).to.equal(2);

    const pos0 = await kpiAsset.getCouponFromOrderedListAt(0);
    expect(pos0).to.equal(100); // from deprecated bond storage

    const pos1 = await kpiAsset.getCouponFromOrderedListAt(1);
    expect(pos1).to.equal(1); // first new coupon

    const fullList = await kpiAsset.getCouponsOrderedList(0, 10);
    expect(fullList).to.have.lengthOf(2);
    expect(fullList[0]).to.equal(100); // deprecated
    expect(fullList[1]).to.equal(1); // new storage
  });

  it("GIVEN empty ordered list WHEN getCouponFromOrderedListAt with _pos >= getCouponsOrderedListTotalAdjustedAt THEN returns 0", async () => {
    const couponIdAtPos0 = await asset.getCouponFromOrderedListAt(0);
    expect(couponIdAtPos0).to.equal(0);

    // Test position 1 - should return 0 because list is empty
    const couponIdAtPos1 = await asset.getCouponFromOrderedListAt(1);
    expect(couponIdAtPos1).to.equal(0);

    // Test position 100 - should return 0 because list is empty
    const couponIdAtPos100 = await asset.getCouponFromOrderedListAt(100);
    expect(couponIdAtPos100).to.equal(0);
  });

  // ─── scheduledCouponListingCount ───

  describe("scheduledCouponListingCount", () => {
    it("GIVEN no scheduled coupons WHEN scheduledCouponListingCount THEN returns 0", async () => {
      const count = await asset.scheduledCouponListingCount();
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

      const count = await asset.scheduledCouponListingCount();
      expect(count).to.equal(3);
    });
  });

  // ─── getScheduledCouponListing ───

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
      const coupons = await asset.getScheduledCouponListing(0, 10);
      expect(coupons.length).to.equal(5);
    });

    it("GIVEN scheduled coupons WHEN getScheduledCouponListing with page 0 and length 3 THEN returns first 3 coupons", async () => {
      const coupons = await asset.getScheduledCouponListing(0, 3);
      expect(coupons.length).to.equal(3);
    });

    it("GIVEN scheduled coupons WHEN getScheduledCouponListing with page 1 and length 3 THEN returns next 2 coupons", async () => {
      const coupons = await asset.getScheduledCouponListing(1, 3);
      expect(coupons.length).to.equal(2);
    });

    it("GIVEN scheduled coupons WHEN getScheduledCouponListing with page 2 and length 3 THEN returns empty array", async () => {
      const coupons = await asset.getScheduledCouponListing(2, 3);
      expect(coupons.length).to.equal(0);
    });

    it("GIVEN scheduled coupons WHEN getScheduledCouponListing THEN returns tasks with correct structure", async () => {
      const coupons = await asset.getScheduledCouponListing(0, 1);
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
});
