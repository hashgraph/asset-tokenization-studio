// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  type ResolverProxy,
  type BondUSAKpiLinkedRateFacet,
  type ScheduledCouponListing,
  type IAccessControl,
  type ScheduledCrossOrderedTasks,
  type TimeTravelFacet,
} from "@contract-types";
import { ATS_ROLES, TIME_PERIODS_S, dateToUnixTimestamp } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBondKpiLinkedRateTokenFixture, getDltTimestamp } from "@test";

describe("Scheduled Coupon Listing Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let account_C: string;

  let bondFacet: BondUSAKpiLinkedRateFacet;
  let scheduledCouponListingFacet: ScheduledCouponListing;
  let scheduledTasksFacet: ScheduledCrossOrderedTasks;
  let accessControlFacet: IAccessControl;
  let timeTravelFacet: TimeTravelFacet;

  let startingDate = 0;
  let maturityDate = 0;

  async function deploySecurityFixtureSinglePartition() {
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
    [, , signer_C] = await ethers.getSigners();
    account_C = signer_C.address;

    accessControlFacet = await ethers.getContractAt("IAccessControl", diamond.target);
    bondFacet = await ethers.getContractAt("BondUSAKpiLinkedRateFacet", diamond.target);
    scheduledCouponListingFacet = await ethers.getContractAt("ScheduledCouponListingFacet", diamond.target);
    scheduledTasksFacet = await ethers.getContractAt("IScheduledCrossOrderedTasks", diamond.target);
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.target);

    await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, account_C);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureSinglePartition);
  });

  it("GIVEN a token WHEN triggerCouponListing THEN transaction succeeds", async () => {
    // set coupons
    const couponsRecordDateInSeconds = dateToUnixTimestamp("2030-01-01T00:00:06Z");
    const couponsExecutionDateInSeconds = dateToUnixTimestamp("2030-01-01T00:01:00Z");
    const couponsStartDateInSeconds = dateToUnixTimestamp("2029-12-31T00:00:00Z");
    const couponsEndDateInSeconds = dateToUnixTimestamp("2029-12-31T00:10:00Z");
    const couponsFixingDateInSeconds_1 = dateToUnixTimestamp("2030-01-01T00:00:06Z");
    const couponsFixingDateInSeconds_2 = dateToUnixTimestamp("2030-01-01T00:00:12Z");
    const couponsFixingDateInSeconds_3 = dateToUnixTimestamp("2030-01-01T00:00:18Z");
    const couponsRate = 0;
    const couponRateDecimals = 0;

    const couponData_1 = {
      recordDate: couponsRecordDateInSeconds.toString(),
      executionDate: couponsExecutionDateInSeconds.toString(),
      rate: couponsRate,
      startDate: couponsStartDateInSeconds.toString(),
      endDate: couponsEndDateInSeconds.toString(),
      fixingDate: couponsFixingDateInSeconds_1.toString(),
      rateDecimals: couponRateDecimals,
      rateStatus: 0,
    };
    const couponData_2 = {
      recordDate: couponsRecordDateInSeconds.toString(),
      executionDate: couponsExecutionDateInSeconds.toString(),
      rate: couponsRate,
      startDate: couponsStartDateInSeconds.toString(),
      endDate: couponsEndDateInSeconds.toString(),
      fixingDate: couponsFixingDateInSeconds_2.toString(),
      rateDecimals: couponRateDecimals,
      rateStatus: 0,
    };
    const couponData_3 = {
      recordDate: couponsRecordDateInSeconds.toString(),
      executionDate: couponsExecutionDateInSeconds.toString(),
      rate: couponsRate,
      startDate: couponsStartDateInSeconds.toString(),
      endDate: couponsEndDateInSeconds.toString(),
      fixingDate: couponsFixingDateInSeconds_3.toString(),
      rateDecimals: couponRateDecimals,
      rateStatus: 0,
    };
    await bondFacet.connect(signer_C).setCoupon(couponData_2);
    await bondFacet.connect(signer_C).setCoupon(couponData_3);
    await bondFacet.connect(signer_C).setCoupon(couponData_1);

    const coupon_2_Id = "0x0000000000000000000000000000000000000000000000000000000000000001";
    const coupon_3_Id = "0x0000000000000000000000000000000000000000000000000000000000000002";
    const coupon_1_Id = "0x0000000000000000000000000000000000000000000000000000000000000003";

    // check scheduled CouponListing
    let scheduledCouponListingCount = await scheduledCouponListingFacet.scheduledCouponListingCount();
    let scheduledCouponListing = await scheduledCouponListingFacet.getScheduledCouponListing(0, 100);

    expect(scheduledCouponListingCount).to.equal(3);
    expect(scheduledCouponListing.length).to.equal(scheduledCouponListingCount);
    expect(Number(scheduledCouponListing[0].scheduledTimestamp)).to.equal(couponsFixingDateInSeconds_3);
    expect(scheduledCouponListing[0].data).to.equal(coupon_3_Id);
    expect(Number(scheduledCouponListing[1].scheduledTimestamp)).to.equal(couponsFixingDateInSeconds_2);
    expect(scheduledCouponListing[1].data).to.equal(coupon_2_Id);
    expect(Number(scheduledCouponListing[2].scheduledTimestamp)).to.equal(couponsFixingDateInSeconds_1);
    expect(scheduledCouponListing[2].data).to.equal(coupon_1_Id);

    // AFTER FIRST SCHEDULED CouponListing ------------------------------------------------------------------
    await timeTravelFacet.changeSystemTimestamp(couponsFixingDateInSeconds_1 + 1);
    await scheduledTasksFacet.connect(signer_A).triggerPendingScheduledCrossOrderedTasks();

    scheduledCouponListingCount = await scheduledCouponListingFacet.scheduledCouponListingCount();
    scheduledCouponListing = await scheduledCouponListingFacet.getScheduledCouponListing(0, 100);

    expect(scheduledCouponListingCount).to.equal(2);
    expect(scheduledCouponListing.length).to.equal(scheduledCouponListingCount);
    expect(Number(scheduledCouponListing[0].scheduledTimestamp)).to.equal(couponsFixingDateInSeconds_3);
    expect(scheduledCouponListing[0].data).to.equal(coupon_3_Id);
    expect(Number(scheduledCouponListing[1].scheduledTimestamp)).to.equal(couponsFixingDateInSeconds_2);
    expect(scheduledCouponListing[1].data).to.equal(coupon_2_Id);

    // AFTER SECOND SCHEDULED CouponListing ------------------------------------------------------------------
    await timeTravelFacet.changeSystemTimestamp(couponsFixingDateInSeconds_2 + 1);
    await scheduledTasksFacet.connect(signer_A).triggerScheduledCrossOrderedTasks(100);

    scheduledCouponListingCount = await scheduledCouponListingFacet.scheduledCouponListingCount();
    scheduledCouponListing = await scheduledCouponListingFacet.getScheduledCouponListing(0, 100);

    expect(scheduledCouponListingCount).to.equal(1);
    expect(scheduledCouponListing.length).to.equal(scheduledCouponListingCount);
    expect(Number(scheduledCouponListing[0].scheduledTimestamp)).to.equal(couponsFixingDateInSeconds_3);
    expect(scheduledCouponListing[0].data).to.equal(coupon_3_Id);

    // AFTER THIRD SCHEDULED CouponListing ------------------------------------------------------------------
    await timeTravelFacet.changeSystemTimestamp(couponsFixingDateInSeconds_3 + 1);
    await scheduledTasksFacet.connect(signer_A).triggerScheduledCrossOrderedTasks(0);

    scheduledCouponListingCount = await scheduledCouponListingFacet.scheduledCouponListingCount();
    scheduledCouponListing = await scheduledCouponListingFacet.getScheduledCouponListing(0, 100);

    expect(scheduledCouponListingCount).to.equal(0);
    expect(scheduledCouponListing.length).to.equal(scheduledCouponListingCount);
  });
});
