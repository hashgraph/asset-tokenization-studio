// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  ResolverProxy,
  BondUSAFacet,
  BondUSAReadFacet,
  KpiLinkedRateFacet,
  SustainabilityPerformanceTargetRateFacet,
  ERC1594Facet,
  AccessControlFacet,
} from "@contract-types";
import { dateToUnixTimestamp, ATS_ROLES, TIME_PERIODS_S, BondRateType } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBondTokenFixture } from "@test";
import { executeRbac } from "@test";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type FixedRate = BondUSAFacet;

const couponPeriod = TIME_PERIODS_S.WEEK;
const referenceDate = dateToUnixTimestamp(`2030-01-01T00:01:00Z`);
const amount = 1000;

describe("Bond Rate Dispatch Tests", () => {
  let couponRecordDateInSeconds = 0;
  let couponExecutionDateInSeconds = 0;
  let couponFixingDateInSeconds = 0;
  let couponEndDateInSeconds = 0;
  let couponStartDateInSeconds = 0;

  let couponData = {
    recordDate: couponRecordDateInSeconds.toString(),
    executionDate: couponExecutionDateInSeconds.toString(),
    rate: 0,
    rateDecimals: 0,
    startDate: couponStartDateInSeconds.toString(),
    endDate: couponEndDateInSeconds.toString(),
    fixingDate: couponFixingDateInSeconds.toString(),
    rateStatus: 0,
  };

  // Variable rate bond fixtures
  let variableDiamond: ResolverProxy;
  let variableBondFacet: BondUSAFacet;
  let variableBondReadFacet: BondUSAReadFacet;
  let variableErc1594Facet: ERC1594Facet;
  let variableSigner: HardhatEthersSigner;

  // Fixed rate bond fixtures
  let fixedDiamond: ResolverProxy;
  let fixedBondFacet: BondUSAFacet;
  let fixedBondReadFacet: BondUSAReadFacet;
  let _fixedRateFacet: FixedRate;
  let fixedErc1594Facet: ERC1594Facet;
  let fixedSigner: HardhatEthersSigner;

  // KPI-linked rate bond fixtures
  let kpiDiamond: ResolverProxy;
  let kpiBondFacet: BondUSAFacet;
  let kpiBondReadFacet: BondUSAReadFacet;
  let kpiLinkedRateFacet: KpiLinkedRateFacet;
  let kpiErc1594Facet: ERC1594Facet;
  let kpiSigner: HardhatEthersSigner;

  // SPT rate bond fixtures
  let sptDiamond: ResolverProxy;
  let sptBondFacet: BondUSAFacet;
  let sptBondReadFacet: BondUSAReadFacet;
  let sptRateFacet: SustainabilityPerformanceTargetRateFacet;
  let sptErc1594Facet: ERC1594Facet;
  let sptSigner: HardhatEthersSigner;

  async function deployVariableRateFixture() {
    const base = await deployBondTokenFixture({
      rateType: BondRateType.Variable,
      useLoadFixture: false,
    });

    variableDiamond = base.diamond;
    variableSigner = base.deployer;

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._CORPORATE_ACTION_ROLE,
        members: [variableSigner.address],
      },
      {
        role: ATS_ROLES._ISSUER_ROLE,
        members: [variableSigner.address],
      },
    ]);

    variableBondFacet = await ethers.getContractAt("BondUSAFacet", variableDiamond.target, variableSigner);
    variableBondReadFacet = await ethers.getContractAt("BondUSAReadFacet", variableDiamond.target, variableSigner);
    variableErc1594Facet = await ethers.getContractAt("ERC1594Facet", variableDiamond.target, variableSigner);

    await variableErc1594Facet.issue(variableSigner.address, amount, "0x");
  }

  async function deployFixedRateFixture() {
    const base = await deployBondTokenFixture({
      rateType: BondRateType.Fixed,
      useLoadFixture: false,
    });

    fixedDiamond = base.diamond;
    fixedSigner = base.deployer;

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._CORPORATE_ACTION_ROLE,
        members: [fixedSigner.address],
      },
      {
        role: ATS_ROLES._ISSUER_ROLE,
        members: [fixedSigner.address],
      },
    ]);

    fixedBondFacet = await ethers.getContractAt("BondUSAFacet", fixedDiamond.target, fixedSigner);
    fixedBondReadFacet = await ethers.getContractAt("BondUSAReadFacet", fixedDiamond.target, fixedSigner);
    _fixedRateFacet = await ethers.getContractAt("IFixedRate", fixedDiamond.target, fixedSigner);
    fixedErc1594Facet = await ethers.getContractAt("ERC1594Facet", fixedDiamond.target, fixedSigner);

    await fixedErc1594Facet.issue(fixedSigner.address, amount, "0x");
  }

  async function deployKpiLinkedRateFixture() {
    const base = await deployBondTokenFixture({
      rateType: BondRateType.KpiLinked,
      useLoadFixture: false,
    });

    kpiDiamond = base.diamond;
    kpiSigner = base.deployer;

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._CORPORATE_ACTION_ROLE,
        members: [kpiSigner.address],
      },
      {
        role: ATS_ROLES._ISSUER_ROLE,
        members: [kpiSigner.address],
      },
      {
        role: ATS_ROLES._KPI_MANAGER_ROLE,
        members: [kpiSigner.address],
      },
      {
        role: ATS_ROLES._PROCEED_RECIPIENT_MANAGER_ROLE,
        members: [kpiSigner.address],
      },
    ]);

    kpiBondFacet = await ethers.getContractAt("BondUSAFacet", kpiDiamond.target, kpiSigner);
    kpiBondReadFacet = await ethers.getContractAt("BondUSAReadFacet", kpiDiamond.target, kpiSigner);
    kpiLinkedRateFacet = await ethers.getContractAt("KpiLinkedRateFacet", kpiDiamond.target, kpiSigner);
    kpiErc1594Facet = await ethers.getContractAt("ERC1594Facet", kpiDiamond.target, kpiSigner);

    // Add proceed recipients
    const proceedRecipientsFacet = await ethers.getContractAt(
      "ProceedRecipientsKpiLinkedRateFacet",
      kpiDiamond.target,
      kpiSigner,
    );
    await proceedRecipientsFacet.addProceedRecipient(kpiSigner.address, "0x");

    await kpiErc1594Facet.issue(kpiSigner.address, amount, "0x");
  }

  async function deploySptRateFixture() {
    const base = await deployBondTokenFixture({
      rateType: BondRateType.Spt,
      useLoadFixture: false,
    });

    sptDiamond = base.diamond;
    sptSigner = base.deployer;

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._CORPORATE_ACTION_ROLE,
        members: [sptSigner.address],
      },
      {
        role: ATS_ROLES._ISSUER_ROLE,
        members: [sptSigner.address],
      },
      {
        role: ATS_ROLES._KPI_MANAGER_ROLE,
        members: [sptSigner.address],
      },
      {
        role: ATS_ROLES._PROCEED_RECIPIENT_MANAGER_ROLE,
        members: [sptSigner.address],
      },
    ]);

    sptBondFacet = await ethers.getContractAt("BondUSAFacet", sptDiamond.target, sptSigner);
    sptBondReadFacet = await ethers.getContractAt("BondUSAReadFacet", sptDiamond.target, sptSigner);
    sptRateFacet = await ethers.getContractAt("SustainabilityPerformanceTargetRateFacet", sptDiamond.target, sptSigner);
    sptErc1594Facet = await ethers.getContractAt("ERC1594Facet", sptDiamond.target, sptSigner);

    // Add proceed recipients
    const proceedRecipientsFacet = await ethers.getContractAt(
      "ProceedRecipientsSustainabilityPerformanceTargetRateFacet",
      sptDiamond.target,
      sptSigner,
    );
    await proceedRecipientsFacet.addProceedRecipient(sptSigner.address, "0x");

    await sptErc1594Facet.issue(sptSigner.address, amount, "0x");
  }

  beforeEach(async () => {
    couponRecordDateInSeconds = dateToUnixTimestamp(`2030-01-01T00:01:00Z`);
    couponExecutionDateInSeconds = dateToUnixTimestamp(`2030-01-01T00:10:00Z`);
    couponFixingDateInSeconds = dateToUnixTimestamp(`2030-01-01T00:10:00Z`);
    couponEndDateInSeconds = couponFixingDateInSeconds - 1;
    couponStartDateInSeconds = couponEndDateInSeconds - couponPeriod;
    couponData = {
      recordDate: couponRecordDateInSeconds.toString(),
      executionDate: couponExecutionDateInSeconds.toString(),
      rate: 0,
      rateDecimals: 0,
      startDate: couponStartDateInSeconds.toString(),
      endDate: couponEndDateInSeconds.toString(),
      fixingDate: couponFixingDateInSeconds.toString(),
      rateStatus: 0,
    };
  });

  describe("Rate Type Persistence", () => {
    it("GIVEN a Variable rate bond WHEN deployed THEN rateType is persisted as Variable(0)", async () => {
      await loadFixture(deployVariableRateFixture);
      const rateType = await variableBondReadFacet.getRateType();
      expect(rateType).to.equal(BondRateType.Variable);
    });

    it("GIVEN a Fixed rate bond WHEN deployed THEN rateType is persisted as Fixed(1)", async () => {
      await loadFixture(deployFixedRateFixture);
      const rateType = await fixedBondReadFacet.getRateType();
      expect(rateType).to.equal(BondRateType.Fixed);
    });

    it("GIVEN a KPI-linked rate bond WHEN deployed THEN rateType is persisted as KpiLinked(2)", async () => {
      await loadFixture(deployKpiLinkedRateFixture);
      const rateType = await kpiBondReadFacet.getRateType();
      expect(rateType).to.equal(BondRateType.KpiLinked);
    });

    it("GIVEN an SPT rate bond WHEN deployed THEN rateType is persisted as Spt(3)", async () => {
      await loadFixture(deploySptRateFixture);
      const rateType = await sptBondReadFacet.getRateType();
      expect(rateType).to.equal(BondRateType.Spt);
    });
  });

  describe("getCoupon Dispatch", () => {
    it("GIVEN a Variable rate bond WHEN getCoupon is called THEN it returns the correct coupon data", async () => {
      await loadFixture(deployVariableRateFixture);

      // Fixture already grants CORPORATE_ACTION_ROLE and ISSUER_ROLE to deployer

      const variableCouponData = {
        ...couponData,
        rate: 500, // 5% with 2 decimals
        rateDecimals: 2,
      };

      await variableBondFacet.setCoupon(variableCouponData);

      const coupon = await variableBondReadFacet.getCoupon(1);
      expect(coupon.coupon.rate).to.equal(500);
      expect(coupon.coupon.rateDecimals).to.equal(2);
    });

    it("GIVEN a Fixed rate bond WHEN getCoupon is called THEN it returns the fixed rate from storage", async () => {
      await loadFixture(deployFixedRateFixture);

      // Set a coupon - fixed rate should be used automatically
      await fixedBondFacet.setCoupon(couponData);

      const fixedRate = await _fixedRateFacet.getRate();
      const coupon = await fixedBondReadFacet.getCoupon(1);

      // Fixed rate should be returned from storage, not from coupon data
      expect(coupon.coupon.rate).to.equal(fixedRate.rate_);
      expect(coupon.coupon.rateDecimals).to.equal(fixedRate.decimals_);
    });

    it("GIVEN a KPI-linked rate bond WHEN getCoupon is called THEN it returns the KPI-adjusted rate", async () => {
      await loadFixture(deployKpiLinkedRateFixture);

      // Grant INTEREST_RATE_MANAGER_ROLE to deployer for KPI rate operations
      const accessControlFacet = (await ethers.getContractAt(
        "AccessControlFacet",
        kpiDiamond.target,
        kpiSigner,
      )) as AccessControlFacet;
      const INTEREST_RATE_MANAGER_ROLE = "0xa174f099c94c902831d8b8a07810700505da86a76ea0bcb7629884ef26cf682e";
      await accessControlFacet.grantRole(INTEREST_RATE_MANAGER_ROLE, kpiSigner.address);

      // Set up KPI configuration
      const kpiInterestRate = {
        maxRate: 10000,
        baseRate: 7500,
        minRate: 5000,
        startPeriod: referenceDate - 1000,
        startRate: 4000,
        missedPenalty: 100,
        reportPeriod: 5000,
        rateDecimals: 3,
      };

      await kpiLinkedRateFacet.setInterestRate(kpiInterestRate);

      // Set impact data
      const impactData = {
        maxDeviationCap: 1000,
        baseLine: 750,
        maxDeviationFloor: 500,
        impactDataDecimals: 2,
        adjustmentPrecision: 2,
      };

      await kpiLinkedRateFacet.setImpactData(impactData);

      // Set coupon
      await kpiBondFacet.setCoupon(couponData);

      // Time travel past fixing date to trigger rate calculation
      const timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", kpiDiamond.target, kpiSigner);
      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

      const coupon = await kpiBondReadFacet.getCoupon(1);
      expect(coupon.coupon.rate).to.be.greaterThan(0);
      expect(coupon.coupon.rateDecimals).to.equal(kpiInterestRate.rateDecimals);
    });

    it("GIVEN an SPT rate bond WHEN getCoupon is called THEN it returns the SPT-adjusted rate", async () => {
      await loadFixture(deploySptRateFixture);

      // Grant INTEREST_RATE_MANAGER_ROLE to deployer for SPT rate operations
      const accessControlFacet = (await ethers.getContractAt(
        "AccessControlFacet",
        sptDiamond.target,
        sptSigner,
      )) as AccessControlFacet;
      const INTEREST_RATE_MANAGER_ROLE = "0xa174f099c94c902831d8b8a07810700505da86a76ea0bcb7629884ef26cf682e";
      await accessControlFacet.grantRole(INTEREST_RATE_MANAGER_ROLE, sptSigner.address);

      // Set up SPT configuration
      const sptInterestRate = {
        baseRate: 5000,
        startPeriod: referenceDate - 1000,
        startRate: 3000,
        rateDecimals: 3,
      };

      await sptRateFacet.setInterestRate(sptInterestRate);

      // Add a project address for SPT (projects and impactData arrays must match in length)
      const projectAddress = sptSigner.address;
      const projects = [projectAddress];

      // Set impact data - SPT uses arrays for impact data and projects
      const impactData = [
        {
          baseLine: 750,
          baseLineMode: 0, // MINIMUM
          deltaRate: 1000,
          impactDataMode: 0, // PENALTY
        },
      ];

      await sptRateFacet.setImpactData(impactData, projects);

      // Set coupon
      await sptBondFacet.setCoupon(couponData);

      // Time travel past fixing date to trigger rate calculation
      const timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", sptDiamond.target, sptSigner);
      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

      const coupon = await sptBondReadFacet.getCoupon(1);
      expect(coupon.coupon.rate).to.be.greaterThan(0);
      expect(coupon.coupon.rateDecimals).to.equal(sptInterestRate.rateDecimals);
    });
  });

  describe("setCoupon Validation", () => {
    it("GIVEN a Fixed rate bond WHEN setCoupon is called with non-zero rate THEN it reverts with InterestRateIsFixed", async () => {
      await loadFixture(deployFixedRateFixture);

      const invalidCouponData = {
        ...couponData,
        rate: 100, // Non-zero rate should fail for fixed rate
      };

      await expect(fixedBondFacet.setCoupon(invalidCouponData)).to.be.rejectedWith("InterestRateIsFixed");
    });

    it("GIVEN a Fixed rate bond WHEN setCoupon is called with non-zero rateDecimals THEN it reverts with InterestRateIsFixed", async () => {
      await loadFixture(deployFixedRateFixture);

      const invalidCouponData = {
        ...couponData,
        rateDecimals: 2, // Non-zero decimals should fail for fixed rate
      };

      await expect(fixedBondFacet.setCoupon(invalidCouponData)).to.be.rejectedWith("InterestRateIsFixed");
    });

    it("GIVEN a Fixed rate bond WHEN setCoupon is called with non-pending rateStatus THEN it reverts with InterestRateIsFixed", async () => {
      await loadFixture(deployFixedRateFixture);

      const invalidCouponData = {
        ...couponData,
        rateStatus: 1, // Non-pending status should fail for fixed rate
      };

      await expect(fixedBondFacet.setCoupon(invalidCouponData)).to.be.rejectedWith("InterestRateIsFixed");
    });
  });

  describe("BondRateType Enum Stability", () => {
    it("SHOULD maintain stable enum ordinals: Variable=0, Fixed=1, KpiLinked=2, Spt=3", async () => {
      // These values must never change as they are persisted on-chain
      expect(BondRateType.Variable).to.equal(0);
      expect(BondRateType.Fixed).to.equal(1);
      expect(BondRateType.KpiLinked).to.equal(2);
      expect(BondRateType.Spt).to.equal(3);
    });
  });
});
