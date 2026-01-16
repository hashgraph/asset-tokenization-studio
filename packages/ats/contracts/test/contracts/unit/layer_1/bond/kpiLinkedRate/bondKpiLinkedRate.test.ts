import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import {
  ResolverProxy,
  BondUSAKpiLinkedRateFacetTimeTravel,
  KpiLinkedRateFacetTimeTravel,
  BondUSAReadFacetTimeTravel,
  TimeTravelFacet,
  ERC1594FacetTimeTravel,
} from "@contract-types";
import { dateToUnixTimestamp, ATS_ROLES, TIME_PERIODS_S, ADDRESS_ZERO } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBondKpiLinkedRateTokenFixture, DEFAULT_BOND_KPI_LINKED_RATE_PARAMS } from "@test";
import { executeRbac } from "@test";
import { Contract } from "ethers";

const couponPeriod = TIME_PERIODS_S.WEEK;
const referenceDate = dateToUnixTimestamp(`2030-01-01T00:01:00Z`);
const amount = 1000;

describe("Bond KpiLinked Rate Tests", () => {
  let couponRecordDateInSeconds = 0;
  let couponExecutionDateInSeconds = 0;
  let couponFixingDateInSeconds = 0;
  let couponEndDateInSeconds = 0;
  let couponStartDateInSeconds = 0;
  let newInterestRate = {
    maxRate: 0,
    baseRate: 0,
    minRate: 0,
    startPeriod: 0,
    startRate: 0,
    missedPenalty: 0,
    reportPeriod: 0,
    rateDecimals: 0,
  };
  let newImpactData = {
    maxDeviationCap: 0,
    baseLine: 0,
    maxDeviationFloor: 0,
    impactDataDecimals: 0,
    adjustmentPrecision: 0,
  };

  let diamond: ResolverProxy;
  let signer_A: SignerWithAddress;

  let bondKpiLinkedRateFacet: BondUSAKpiLinkedRateFacetTimeTravel;
  let bondReadFacet: BondUSAReadFacetTimeTravel;
  let kpiLinkedRateFacet: KpiLinkedRateFacetTimeTravel;
  let mockKpiOracle: Contract;
  let timeTravelFacet: TimeTravelFacet;
  let erc1594Facet: ERC1594FacetTimeTravel;

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

  async function deploySecurityFixture() {
    const base = await deployBondKpiLinkedRateTokenFixture();

    diamond = base.diamond;
    signer_A = base.deployer;

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._CORPORATE_ACTION_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._INTEREST_RATE_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._ISSUER_ROLE,
        members: [signer_A.address],
      },
    ]);

    bondKpiLinkedRateFacet = await ethers.getContractAt(
      "BondUSAKpiLinkedRateFacetTimeTravel",
      diamond.address,
      signer_A,
    );
    bondReadFacet = await ethers.getContractAt("BondUSAReadFacetTimeTravel", diamond.address, signer_A);
    kpiLinkedRateFacet = await ethers.getContractAt("KpiLinkedRateFacetTimeTravel", diamond.address, signer_A);
    erc1594Facet = await ethers.getContractAt("ERC1594FacetTimeTravel", diamond.address, signer_A);
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.address);

    const MockedKpiOracle = await ethers.getContractFactory("MockedKpiOracle");
    mockKpiOracle = await MockedKpiOracle.deploy();

    await erc1594Facet.issue(signer_A.address, amount, "0x");
  }

  async function setKpiConfiguration(startPeriodOffsetToFixingDate: number) {
    couponData = {
      startDate: referenceDate.toString(),
      endDate: (referenceDate + 100).toString(),
      fixingDate: (referenceDate + 200).toString(),
      recordDate: (referenceDate + 300).toString(),
      executionDate: (referenceDate + 400).toString(),
      rate: 0,
      rateDecimals: 0,
      rateStatus: 0,
    };

    newInterestRate = {
      maxRate: 10000,
      baseRate: 7500,
      minRate: 5000,
      startPeriod: parseInt(couponData.fixingDate) + startPeriodOffsetToFixingDate,
      startRate: 4000,
      missedPenalty: 100,
      reportPeriod: 5000,
      rateDecimals: 3,
    };
    newImpactData = {
      maxDeviationCap: 200000,
      baseLine: 150000,
      maxDeviationFloor: 100000,
      impactDataDecimals: 2,
      adjustmentPrecision: 2,
    };

    await kpiLinkedRateFacet.connect(signer_A).setInterestRate(newInterestRate);
    await kpiLinkedRateFacet.connect(signer_A).setImpactData(newImpactData);
    await kpiLinkedRateFacet.connect(signer_A).setKpiOracle(mockKpiOracle.address);
  }

  async function checkCouponPostValues(
    interestRate: number,
    interestRateDecimals: number,
    amount: number,
    couponID: number,
    accountAddress: string,
  ) {
    const registeredCouponPostFixingDate = await bondReadFacet.getCoupon(couponID);
    const couponForPostFixingDate = await bondReadFacet.getCouponFor(couponID, accountAddress);
    const couponAmountForPostFixingDate = await bondReadFacet.getCouponAmountFor(couponID, accountAddress);

    const numerator =
      BigInt(amount) *
      BigInt(DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.nominalValue) *
      BigInt(interestRate) *
      (BigInt(couponData.endDate) - BigInt(couponData.startDate));
    const denominator =
      BigInt(10) **
        (BigInt(couponForPostFixingDate.decimals) +
          BigInt(DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.nominalValueDecimals) +
          BigInt(interestRateDecimals)) *
      BigInt(365 * 24 * 60 * 60);

    expect(registeredCouponPostFixingDate.coupon.rate).to.equal(interestRate);
    expect(registeredCouponPostFixingDate.coupon.rateDecimals).to.equal(interestRateDecimals);
    expect(registeredCouponPostFixingDate.coupon.rateStatus).to.equal(1);

    expect(couponForPostFixingDate.coupon.rate).to.equal(interestRate);
    expect(couponForPostFixingDate.coupon.rateDecimals).to.equal(interestRateDecimals);
    expect(couponForPostFixingDate.coupon.rateStatus).to.equal(1);

    expect(couponAmountForPostFixingDate.numerator.toString()).to.equal(numerator.toString());
    expect(couponAmountForPostFixingDate.denominator.toString()).to.equal(denominator.toString());
  }

  function updateCouponDates() {
    const newFixingDate = parseInt(couponData.recordDate) + 10;
    const newRecordDate = newFixingDate + 100;
    const newExecutionDate = newRecordDate + 100;

    couponData.fixingDate = newFixingDate.toString();
    couponData.recordDate = newRecordDate.toString();
    couponData.executionDate = newExecutionDate.toString();
  }

  beforeEach(async () => {
    couponRecordDateInSeconds = dateToUnixTimestamp(`2030-01-01T00:01:00Z`);
    couponExecutionDateInSeconds = dateToUnixTimestamp(`2030-05-01T00:10:00Z`);
    couponFixingDateInSeconds = dateToUnixTimestamp(`2030-03-01T00:10:00Z`);
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
    await loadFixture(deploySecurityFixture);
  });
  describe("KpiLinkedRateFacet", () => {
    it("GIVEN a kpiLinked rate bond WHEN setting a coupon with non pending status THEN transaction fails with InterestRateIsKpiLinked", async () => {
      couponData.rateStatus = 1;

      await expect(bondKpiLinkedRateFacet.setCoupon(couponData)).to.be.rejectedWith("InterestRateIsKpiLinked");
    });

    it("GIVEN a kpiLinked rate bond WHEN setting a coupon with rate non 0 THEN transaction fails with InterestRateIsKpiLinked", async () => {
      couponData.rate = 1;

      await expect(bondKpiLinkedRateFacet.setCoupon(couponData)).to.be.rejectedWith("InterestRateIsKpiLinked");
    });

    it("GIVEN a kpiLinked rate bond WHEN setting a coupon with rate decimals non 0 THEN transaction fails with InterestRateIsKpiLinked", async () => {
      couponData.rateDecimals = 1;

      await expect(bondKpiLinkedRateFacet.setCoupon(couponData)).to.be.rejectedWith("InterestRateIsKpiLinked");
    });

    it("GIVEN a kpiLinked rate bond WHEN setting a coupon with pending status THEN transaction success", async () => {
      await expect(bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData))
        .to.emit(bondKpiLinkedRateFacet, "CouponSet")
        .withArgs("0x0000000000000000000000000000000000000000000000000000000000000001", 1, signer_A.address, [
          couponRecordDateInSeconds,
          couponExecutionDateInSeconds,
          couponStartDateInSeconds,
          couponEndDateInSeconds,
          couponFixingDateInSeconds,
          0,
          0,
          0,
        ]);

      const couponCount = await bondReadFacet.getCouponCount();
      expect(couponCount).to.equal(1);

      const registeredCoupon = await bondReadFacet.getCoupon(1);
      expect(registeredCoupon.coupon.recordDate).to.equal(couponRecordDateInSeconds);
      expect(registeredCoupon.coupon.executionDate).to.equal(couponExecutionDateInSeconds);
      expect(registeredCoupon.coupon.startDate).to.equal(couponStartDateInSeconds);
      expect(registeredCoupon.coupon.endDate).to.equal(couponEndDateInSeconds);
      expect(registeredCoupon.coupon.fixingDate).to.equal(couponFixingDateInSeconds);
      expect(registeredCoupon.coupon.rate).to.equal(0);
      expect(registeredCoupon.coupon.rateDecimals).to.equal(0);
      expect(registeredCoupon.coupon.rateStatus).to.equal(0);
    });

    it("GIVEN a kpiLinked rate bond WHEN rate is during start Period THEN transaction success and rate is start rate", async () => {
      await setKpiConfiguration(10);

      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);

      const registeredCouponPreFixingDate = await bondReadFacet.getCoupon(1);
      const couponForPreFixingDate = await bondReadFacet.getCouponFor(1, signer_A.address);
      const couponAmountForPreFixingDate = await bondReadFacet.getCouponAmountFor(1, signer_A.address);

      expect(registeredCouponPreFixingDate.coupon.rate).to.equal(0);
      expect(registeredCouponPreFixingDate.coupon.rateDecimals).to.equal(0);
      expect(registeredCouponPreFixingDate.coupon.rateStatus).to.equal(0);

      expect(couponForPreFixingDate.coupon.rate).to.equal(0);
      expect(couponForPreFixingDate.coupon.rateDecimals).to.equal(0);
      expect(couponForPreFixingDate.coupon.rateStatus).to.equal(0);

      expect(couponAmountForPreFixingDate.numerator).to.equal(0);
      expect(couponAmountForPreFixingDate.denominator).to.equal(0);

      await timeTravelFacet.changeSystemTimestamp(couponData.fixingDate + 1);

      await checkCouponPostValues(newInterestRate.startRate, newInterestRate.rateDecimals, amount, 1, signer_A.address);
    });

    it("GIVEN a kpiLinked rate bond with no oracle WHEN rate is calculated THEN transaction success and rate is base rate", async () => {
      await setKpiConfiguration(-10);
      await kpiLinkedRateFacet.connect(signer_A).setKpiOracle(ADDRESS_ZERO);

      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);

      await timeTravelFacet.changeSystemTimestamp(couponData.fixingDate + 1);

      await checkCouponPostValues(newInterestRate.baseRate, newInterestRate.rateDecimals, amount, 1, signer_A.address);
    });

    it("GIVEN a kpiLinked rate bond WHEN no oracle report is found THEN transaction success and rate is previous rate plus penalty", async () => {
      await setKpiConfiguration(-10);

      // Test missed penalty when there is a single coupon
      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.recordDate) + 1);

      await checkCouponPostValues(
        0 + newInterestRate.missedPenalty,
        newInterestRate.rateDecimals,
        amount,
        1,
        signer_A.address,
      );

      // Test missed penalty when there are two coupons
      updateCouponDates();

      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.recordDate) + 1);

      await checkCouponPostValues(
        0 + newInterestRate.missedPenalty,
        newInterestRate.rateDecimals,
        amount,
        1,
        signer_A.address,
      );

      await checkCouponPostValues(
        newInterestRate.missedPenalty + newInterestRate.missedPenalty,
        newInterestRate.rateDecimals,
        amount,
        2,
        signer_A.address,
      );

      // Test missed penalty when previous coupon had less decimals
      const previousCouponRate = 2 * newInterestRate.missedPenalty;
      const previousCouponRateDecimals = newInterestRate.rateDecimals;

      newInterestRate.missedPenalty = previousCouponRate;
      newInterestRate.rateDecimals = previousCouponRateDecimals + 1;

      await kpiLinkedRateFacet.connect(signer_A).setInterestRate(newInterestRate);

      updateCouponDates();

      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.recordDate) + 1);

      const rate = previousCouponRate * 10 + newInterestRate.missedPenalty;

      await checkCouponPostValues(previousCouponRate / 2, previousCouponRateDecimals, amount, 1, signer_A.address);

      await checkCouponPostValues(previousCouponRate, previousCouponRateDecimals, amount, 2, signer_A.address);

      await checkCouponPostValues(rate, newInterestRate.rateDecimals, amount, 3, signer_A.address);

      // Test missed penalty when previous coupon had more decimals
      const previousCouponRate_2 = rate;
      const previousCouponRateDecimals_2 = newInterestRate.rateDecimals;

      newInterestRate.missedPenalty = previousCouponRate_2;
      newInterestRate.rateDecimals = previousCouponRateDecimals_2 - 1;

      await kpiLinkedRateFacet.connect(signer_A).setInterestRate(newInterestRate);

      updateCouponDates();

      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.recordDate) + 1);

      const rate_2 = previousCouponRate_2 / 10 + newInterestRate.missedPenalty;

      await checkCouponPostValues(previousCouponRate / 2, previousCouponRateDecimals, amount, 1, signer_A.address);

      await checkCouponPostValues(previousCouponRate, previousCouponRateDecimals, amount, 2, signer_A.address);

      await checkCouponPostValues(previousCouponRate_2, previousCouponRateDecimals_2, amount, 3, signer_A.address);

      await checkCouponPostValues(rate_2, newInterestRate.rateDecimals, amount, 4, signer_A.address);
    });

    it("GIVEN a kpiLinked rate bond WHEN impact data is above baseline THEN transaction success and rate is calculated", async () => {
      await setKpiConfiguration(-10);

      const impactData = newImpactData.baseLine + (newImpactData.maxDeviationCap - newImpactData.baseLine) / 2;
      await mockKpiOracle.setKpiValue(impactData);
      await mockKpiOracle.setExists(true);

      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.recordDate) + 1);

      const rate = newInterestRate.baseRate + (newInterestRate.maxRate - newInterestRate.baseRate) / 2;

      await checkCouponPostValues(rate, newInterestRate.rateDecimals, amount, 1, signer_A.address);

      const impactData_2 = 2 * newImpactData.maxDeviationCap;
      await mockKpiOracle.setKpiValue(impactData_2);
      await mockKpiOracle.setExists(true);

      updateCouponDates();

      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);
      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.recordDate) + 1);

      const rate_2 = newInterestRate.maxRate;

      await checkCouponPostValues(rate_2, newInterestRate.rateDecimals, amount, 2, signer_A.address);
    });

    it("GIVEN a kpiLinked rate bond WHEN impact data is below baseline THEN transaction success and rate is calculated", async () => {
      await setKpiConfiguration(-10);

      const impactData = newImpactData.baseLine - (newImpactData.baseLine - newImpactData.maxDeviationFloor) / 2;
      await mockKpiOracle.setKpiValue(impactData);
      await mockKpiOracle.setExists(true);

      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.recordDate) + 1);

      const rate = newInterestRate.baseRate - (newInterestRate.baseRate - newInterestRate.minRate) / 2;

      await checkCouponPostValues(rate, newInterestRate.rateDecimals, amount, 1, signer_A.address);

      const impactData_2 = newImpactData.maxDeviationFloor / 2;
      await mockKpiOracle.setKpiValue(impactData_2);
      await mockKpiOracle.setExists(true);

      updateCouponDates();

      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);
      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.recordDate) + 1);

      const rate_2 = newInterestRate.minRate;

      await checkCouponPostValues(rate_2, newInterestRate.rateDecimals, amount, 2, signer_A.address);
    });
  });
});
