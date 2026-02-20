import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  type ResolverProxy,
  ScheduledCouponListingFacet,
  BondUSAKpiLinkedRateFacet,
  IAccessControl,
} from "@contract-types";
import { deployBondKpiLinkedRateTokenFixture, getDltTimestamp } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ATS_ROLES, TIME_PERIODS_S } from "@scripts";

describe("ScheduledCouponListing Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;

  let scheduledCouponListingFacet: ScheduledCouponListingFacet;
  let bondFacet: BondUSAKpiLinkedRateFacet;
  let accessControlFacet: IAccessControl;

  let startingDate = 0;
  let maturityDate = 0;

  async function deploySecurityFixture() {
    const currentTimestamp = await getDltTimestamp();
    startingDate = currentTimestamp + TIME_PERIODS_S.DAY;
    maturityDate = startingDate + TIME_PERIODS_S.YEAR;

    // Deploy KPI-linked bond which uses fixing dates and scheduled coupon listing
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

    scheduledCouponListingFacet = await ethers.getContractAt("ScheduledCouponListingFacet", diamond.target);
    bondFacet = await ethers.getContractAt("BondUSAKpiLinkedRateFacet", diamond.target);
    accessControlFacet = await ethers.getContractAt("IAccessControl", diamond.target);

    // Grant corporate action role to signer_A
    await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixture);
  });

  describe("scheduledCouponListingCount", () => {
    it("GIVEN no scheduled coupons WHEN scheduledCouponListingCount THEN returns 0", async () => {
      const count = await scheduledCouponListingFacet.scheduledCouponListingCount();
      expect(count).to.equal(0);
    });

    it("GIVEN scheduled coupons WHEN scheduledCouponListingCount THEN returns correct count", async () => {
      // Add 3 coupons with fixing dates
      for (let i = 0; i < 3; i++) {
        const fixingDate = startingDate + TIME_PERIODS_S.MONTH * (i + 1);
        const executionDate = fixingDate + TIME_PERIODS_S.WEEK;

        await bondFacet.setCoupon({
          recordDate: fixingDate.toString(),
          executionDate: executionDate.toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: (fixingDate - TIME_PERIODS_S.WEEK).toString(),
          endDate: fixingDate.toString(),
          fixingDate: fixingDate.toString(),
          rateStatus: 0, // PENDING status for KPI-linked bonds
        });
      }

      const count = await scheduledCouponListingFacet.scheduledCouponListingCount();
      expect(count).to.equal(3);
    });
  });

  describe("getScheduledCouponListing", () => {
    beforeEach(async () => {
      // Add 5 coupons with fixing dates for pagination testing
      for (let i = 0; i < 5; i++) {
        const fixingDate = startingDate + TIME_PERIODS_S.MONTH * (i + 1);
        const executionDate = fixingDate + TIME_PERIODS_S.WEEK;

        await bondFacet.setCoupon({
          recordDate: fixingDate.toString(),
          executionDate: executionDate.toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: (fixingDate - TIME_PERIODS_S.WEEK).toString(),
          endDate: fixingDate.toString(),
          fixingDate: fixingDate.toString(),
          rateStatus: 0, // PENDING status
        });
      }
    });

    it("GIVEN scheduled coupons WHEN getScheduledCouponListing with page 0 and length 10 THEN returns all coupons", async () => {
      const coupons = await scheduledCouponListingFacet.getScheduledCouponListing(0, 10);
      expect(coupons.length).to.equal(5);
    });

    it("GIVEN scheduled coupons WHEN getScheduledCouponListing with page 0 and length 3 THEN returns first 3 coupons", async () => {
      const coupons = await scheduledCouponListingFacet.getScheduledCouponListing(0, 3);
      expect(coupons.length).to.equal(3);
    });

    it("GIVEN scheduled coupons WHEN getScheduledCouponListing with page 1 and length 3 THEN returns next 2 coupons", async () => {
      const coupons = await scheduledCouponListingFacet.getScheduledCouponListing(1, 3);
      expect(coupons.length).to.equal(2);
    });

    it("GIVEN scheduled coupons WHEN getScheduledCouponListing with page 2 and length 3 THEN returns empty array", async () => {
      const coupons = await scheduledCouponListingFacet.getScheduledCouponListing(2, 3);
      expect(coupons.length).to.equal(0);
    });

    it("GIVEN scheduled coupons WHEN getScheduledCouponListing THEN returns tasks with correct structure", async () => {
      const coupons = await scheduledCouponListingFacet.getScheduledCouponListing(0, 1);
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
