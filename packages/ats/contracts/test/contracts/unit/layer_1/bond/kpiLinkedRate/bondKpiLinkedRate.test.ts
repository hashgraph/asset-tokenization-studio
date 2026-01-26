import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import {
  ResolverProxy,
  BondUSAKpiLinkedRateFacetTimeTravel,
  KpiLinkedRateFacetTimeTravel,
  BondUSAReadKpiLinkedRateFacetTimeTravel,
  TimeTravelFacet,
  ERC1594KpiLinkedRateFacetTimeTravel,
  ProceedRecipientsKpiLinkedRateFacetTimeTravel,
  KpisKpiLinkedRateFacetTimeTravel,
  ScheduledCrossOrderedTasksKpiLinkedRateFacetTimeTravel,
} from "@contract-types";
import { dateToUnixTimestamp, ATS_ROLES, TIME_PERIODS_S, ADDRESS_ZERO } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBondKpiLinkedRateTokenFixture, DEFAULT_BOND_KPI_LINKED_RATE_PARAMS, getDltTimestamp } from "@test";
import { executeRbac } from "@test";

const couponPeriod = TIME_PERIODS_S.WEEK;
const referenceDate = dateToUnixTimestamp(`2030-01-01T00:01:00Z`);
const amount = 1000;
const YEAR_SECONDS = 365 * 24 * 60 * 60;

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
  let signer_B: SignerWithAddress;
  let signer_C: SignerWithAddress;

  let bondKpiLinkedRateFacet: BondUSAKpiLinkedRateFacetTimeTravel;
  let bondReadFacet: BondUSAReadKpiLinkedRateFacetTimeTravel;
  let kpiLinkedRateFacet: KpiLinkedRateFacetTimeTravel;
  let timeTravelFacet: TimeTravelFacet;
  let erc1594Facet: ERC1594KpiLinkedRateFacetTimeTravel;
  let proceedRecipientsFacet: ProceedRecipientsKpiLinkedRateFacetTimeTravel;
  let kpisFacet: KpisKpiLinkedRateFacetTimeTravel;
  let scheduledTasksFacet: ScheduledCrossOrderedTasksKpiLinkedRateFacetTimeTravel;

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
    signer_B = base.user1;
    signer_C = base.user2;

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._KPI_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._PROCEED_RECIPIENT_MANAGER_ROLE,
        members: [signer_A.address],
      },
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
    erc1594Facet = await ethers.getContractAt("ERC1594KpiLinkedRateFacetTimeTravel", diamond.address, signer_A);
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.address);
    proceedRecipientsFacet = await ethers.getContractAt(
      "ProceedRecipientsKpiLinkedRateFacetTimeTravel",
      diamond.address,
      signer_A,
    );
    kpisFacet = await ethers.getContractAt("KpisKpiLinkedRateFacetTimeTravel", diamond.address, signer_A);
    scheduledTasksFacet = await ethers.getContractAt(
      "ScheduledCrossOrderedTasksKpiLinkedRateFacetTimeTravel",
      diamond.address,
      signer_A,
    );

    await erc1594Facet.issue(signer_A.address, amount, "0x");
    await proceedRecipientsFacet.addProceedRecipient(signer_B.address, "0x");
    await proceedRecipientsFacet.addProceedRecipient(signer_C.address, "0x");
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

  async function checkMinDates(expectedMinDate: string) {
    let minDate = await kpisFacet.getMinDate();
    expect(minDate.toString()).to.equal(expectedMinDate);
  }

  function updateCouponDates() {
    const newFixingDate = parseInt(couponData.recordDate) + 10000;
    const newRecordDate = newFixingDate + 100000;
    const newExecutionDate = newRecordDate + 100000;

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

    it("GIVEN a kpiLinked rate bond WHEN no report is found THEN transaction success and rate is previous rate plus penalty", async () => {
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

    it("GIVEN a kpiLinked rate bond WHEN no report is found but missing penalty is too high THEN transaction success and rate is max rate", async () => {
      await setKpiConfiguration(-10);
      newInterestRate.missedPenalty = newInterestRate.maxRate + 100;
      await kpiLinkedRateFacet.connect(signer_A).setInterestRate(newInterestRate);

      // Test missed penalty when there is a single coupon
      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.recordDate) + 1);

      await checkCouponPostValues(newInterestRate.maxRate, newInterestRate.rateDecimals, amount, 1, signer_A.address);
    });

    it("GIVEN a kpiLinked rate bond WHEN impact data is above baseline THEN transaction success and rate is calculated", async () => {
      await setKpiConfiguration(-10);

      const impactData = newImpactData.baseLine + (newImpactData.maxDeviationCap - newImpactData.baseLine) / 2;

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) - 1);
      await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, impactData - 1, signer_B.address);
      await kpisFacet.addKpiData(
        parseInt(couponData.fixingDate) - newInterestRate.reportPeriod + 1,
        1,
        signer_C.address,
      );

      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.recordDate) + 1);
      await checkMinDates(couponData.fixingDate);

      const rate = newInterestRate.baseRate + (newInterestRate.maxRate - newInterestRate.baseRate) / 2;

      await checkCouponPostValues(rate, newInterestRate.rateDecimals, amount, 1, signer_A.address);

      updateCouponDates();
      const impactData_2 = 2 * newImpactData.maxDeviationCap;

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) - 1);
      await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 2, impactData_2, signer_B.address);

      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.recordDate) + 1);
      await checkMinDates(couponData.fixingDate);

      const rate_2 = newInterestRate.maxRate;

      await checkCouponPostValues(rate_2, newInterestRate.rateDecimals, amount, 2, signer_A.address);
    });

    it("GIVEN a kpiLinked rate bond WHEN impact data is below baseline THEN transaction success and rate is calculated", async () => {
      await setKpiConfiguration(-10);

      const impactData = newImpactData.baseLine - (newImpactData.baseLine - newImpactData.maxDeviationFloor) / 2;

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) - 1);
      await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, impactData, signer_B.address);

      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.recordDate) + 1);
      await checkMinDates(couponData.fixingDate);

      const rate = newInterestRate.baseRate - (newInterestRate.baseRate - newInterestRate.minRate) / 2;

      await checkCouponPostValues(rate, newInterestRate.rateDecimals, amount, 1, signer_A.address);

      updateCouponDates();

      const impactData_2 = newImpactData.maxDeviationFloor / 2;

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) - 1);
      await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, impactData_2 - 1, signer_B.address);
      await kpisFacet.addKpiData(
        parseInt(couponData.fixingDate) - newInterestRate.reportPeriod + 1,
        1,
        signer_C.address,
      );

      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.recordDate) + 1);
      await checkMinDates(couponData.fixingDate);

      const rate_2 = newInterestRate.minRate;

      await checkCouponPostValues(rate_2, newInterestRate.rateDecimals, amount, 2, signer_A.address);
    });

    it("GIVEN a kpiLinked rate bond WHEN setting two coupons where the second one has a lower fixing date THEN min Date remains unchanged", async () => {
      await setKpiConfiguration(-10);

      let originalFixingDate = couponData.fixingDate;

      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);

      couponData.fixingDate = (parseInt(couponData.fixingDate) - 1).toString();
      await bondKpiLinkedRateFacet.connect(signer_A).setCoupon(couponData);

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.recordDate) + 1);

      await checkMinDates(originalFixingDate);

      await scheduledTasksFacet.connect(signer_A).triggerPendingScheduledCrossOrderedTasks();

      await checkMinDates(originalFixingDate);
    });
  });

  describe("Bond Read - Ordered List", () => {
    let currentBlockTimestamp: number;

    beforeEach(async () => {
      currentBlockTimestamp = await getDltTimestamp();
    });

    describe("getCouponsOrderedListTotal", () => {
      it("should return 0 when no coupons have been created", async () => {
        const total = await bondReadFacet.getCouponsOrderedListTotal();
        expect(total).to.equal(0);
      });

      it("should return the correct count when coupons exist", async () => {
        // Create 3 coupons with fixing dates
        const coupon1 = {
          recordDate: currentBlockTimestamp + TIME_PERIODS_S.DAY,
          executionDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 2,
          rate: 0,
          rateDecimals: 0,
          startDate: currentBlockTimestamp,
          endDate: currentBlockTimestamp + YEAR_SECONDS,
          fixingDate: currentBlockTimestamp + TIME_PERIODS_S.DAY,
          rateStatus: 0,
        };

        await bondKpiLinkedRateFacet.setCoupon(coupon1);

        const coupon2 = {
          recordDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 3,
          executionDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 4,
          rate: 0,
          rateDecimals: 0,
          startDate: currentBlockTimestamp,
          endDate: currentBlockTimestamp + YEAR_SECONDS,
          fixingDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 3,
          rateStatus: 0,
        };

        await bondKpiLinkedRateFacet.setCoupon(coupon2);

        const coupon3 = {
          recordDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 5,
          executionDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 6,
          rate: 0,
          rateDecimals: 0,
          startDate: currentBlockTimestamp,
          endDate: currentBlockTimestamp + YEAR_SECONDS,
          fixingDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 5,
          rateStatus: 0,
        };

        await bondKpiLinkedRateFacet.setCoupon(coupon3);

        // Move time forward past all fixing dates
        await timeTravelFacet.changeSystemTimestamp(currentBlockTimestamp + TIME_PERIODS_S.DAY * 6);

        const total = await bondReadFacet.getCouponsOrderedListTotal();
        expect(total).to.equal(3);
      });
    });

    describe("getCouponFromOrderedListAt", () => {
      it("should return 0 for invalid position when no coupons exist", async () => {
        const couponId = await bondReadFacet.getCouponFromOrderedListAt(0);
        expect(couponId).to.equal(0);
      });

      it("should return 0 for position beyond the list", async () => {
        // Create 1 coupon
        const coupon = {
          recordDate: currentBlockTimestamp + TIME_PERIODS_S.DAY,
          executionDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 2,
          rate: 0,
          rateDecimals: 0,
          startDate: currentBlockTimestamp,
          endDate: currentBlockTimestamp + YEAR_SECONDS,
          fixingDate: currentBlockTimestamp + TIME_PERIODS_S.DAY,
          rateStatus: 0,
        };

        await bondKpiLinkedRateFacet.setCoupon(coupon);

        // Move time forward past fixing date
        await timeTravelFacet.changeSystemTimestamp(currentBlockTimestamp + TIME_PERIODS_S.DAY * 2);

        // Try to get position 1 (second item) when only 1 exists (index 0)
        const couponId = await bondReadFacet.getCouponFromOrderedListAt(1);
        expect(couponId).to.equal(0);
      });

      it("should return correct coupon ID at specific position", async () => {
        // Create 3 coupons
        const coupon1 = {
          recordDate: currentBlockTimestamp + TIME_PERIODS_S.DAY,
          executionDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 2,
          rate: 0,
          rateDecimals: 0,
          startDate: currentBlockTimestamp,
          endDate: currentBlockTimestamp + YEAR_SECONDS,
          fixingDate: currentBlockTimestamp + TIME_PERIODS_S.DAY,
          rateStatus: 0,
        };

        const tx1 = await bondKpiLinkedRateFacet.setCoupon(coupon1);
        await tx1.wait();

        const coupon2 = {
          recordDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 3,
          executionDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 4,
          rate: 0,
          rateDecimals: 0,
          startDate: currentBlockTimestamp,
          endDate: currentBlockTimestamp + YEAR_SECONDS,
          fixingDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 3,
          rateStatus: 0,
        };

        const tx2 = await bondKpiLinkedRateFacet.setCoupon(coupon2);
        await tx2.wait();

        const coupon3 = {
          recordDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 5,
          executionDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 6,
          rate: 0,
          rateDecimals: 0,
          startDate: currentBlockTimestamp,
          endDate: currentBlockTimestamp + YEAR_SECONDS,
          fixingDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 5,
          rateStatus: 0,
        };

        const tx3 = await bondKpiLinkedRateFacet.setCoupon(coupon3);
        await tx3.wait();

        // Move time forward past all fixing dates so coupons appear in ordered list
        await timeTravelFacet.changeSystemTimestamp(currentBlockTimestamp + TIME_PERIODS_S.DAY * 6);

        // Get coupon at position 0 (first coupon)
        const couponId0 = await bondReadFacet.getCouponFromOrderedListAt(0);
        expect(couponId0).to.equal(1);

        // Get coupon at position 1 (second coupon)
        const couponId1 = await bondReadFacet.getCouponFromOrderedListAt(1);
        expect(couponId1).to.equal(2);

        // Get coupon at position 2 (third coupon)
        const couponId2 = await bondReadFacet.getCouponFromOrderedListAt(2);
        expect(couponId2).to.equal(3);
      });
    });

    describe("getCouponsOrderedList", () => {
      it("should return empty array when no coupons exist", async () => {
        const coupons = await bondReadFacet.getCouponsOrderedList(0, 10);
        expect(coupons).to.be.an("array").that.is.empty;
      });

      it("should return all coupons when page size is larger than total", async () => {
        // Create 3 coupons
        const coupon1 = {
          recordDate: currentBlockTimestamp + TIME_PERIODS_S.DAY,
          executionDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 2,
          rate: 0,
          rateDecimals: 0,
          startDate: currentBlockTimestamp,
          endDate: currentBlockTimestamp + YEAR_SECONDS,
          fixingDate: currentBlockTimestamp + TIME_PERIODS_S.DAY,
          rateStatus: 0,
        };

        await bondKpiLinkedRateFacet.setCoupon(coupon1);

        const coupon2 = {
          recordDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 3,
          executionDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 4,
          rate: 0,
          rateDecimals: 0,
          startDate: currentBlockTimestamp,
          endDate: currentBlockTimestamp + YEAR_SECONDS,
          fixingDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 3,
          rateStatus: 0,
        };

        await bondKpiLinkedRateFacet.setCoupon(coupon2);

        const coupon3 = {
          recordDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 5,
          executionDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 6,
          rate: 0,
          rateDecimals: 0,
          startDate: currentBlockTimestamp,
          endDate: currentBlockTimestamp + YEAR_SECONDS,
          fixingDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * 5,
          rateStatus: 0,
        };

        await bondKpiLinkedRateFacet.setCoupon(coupon3);

        // Move time forward past all fixing dates
        await timeTravelFacet.changeSystemTimestamp(currentBlockTimestamp + TIME_PERIODS_S.DAY * 6);

        const coupons = await bondReadFacet.getCouponsOrderedList(0, 10);
        expect(coupons).to.be.an("array").with.lengthOf(3);
        expect(coupons[0]).to.equal(1);
        expect(coupons[1]).to.equal(2);
        expect(coupons[2]).to.equal(3);
      });

      it("should return paginated results correctly", async () => {
        // Create 5 coupons
        for (let i = 0; i < 5; i++) {
          const coupon = {
            recordDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * (i * 2 + 1),
            executionDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * (i * 2 + 2),
            rate: 0,
            rateDecimals: 0,
            startDate: currentBlockTimestamp,
            endDate: currentBlockTimestamp + YEAR_SECONDS,
            fixingDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * (i * 2 + 1),
            rateStatus: 0,
          };

          await bondKpiLinkedRateFacet.setCoupon(coupon);
        }

        // Move time forward past all fixing dates
        await timeTravelFacet.changeSystemTimestamp(currentBlockTimestamp + TIME_PERIODS_S.DAY * 11);

        // Get first page (2 items)
        const page1 = await bondReadFacet.getCouponsOrderedList(0, 2);
        expect(page1).to.be.an("array").with.lengthOf(2);
        expect(page1[0]).to.equal(1);
        expect(page1[1]).to.equal(2);

        // Get second page (2 items)
        const page2 = await bondReadFacet.getCouponsOrderedList(1, 2);
        expect(page2).to.be.an("array").with.lengthOf(2);
        expect(page2[0]).to.equal(3);
        expect(page2[1]).to.equal(4);

        // Get third page (1 item remaining)
        const page3 = await bondReadFacet.getCouponsOrderedList(2, 2);
        expect(page3).to.be.an("array").with.lengthOf(1);
        expect(page3[0]).to.equal(5);

        // Get page beyond available data
        const page4 = await bondReadFacet.getCouponsOrderedList(3, 2);
        expect(page4).to.be.an("array").that.is.empty;
      });

      it("should handle single item per page", async () => {
        // Create 3 coupons
        for (let i = 0; i < 3; i++) {
          const coupon = {
            recordDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * (i * 2 + 1),
            executionDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * (i * 2 + 2),
            rate: 0,
            rateDecimals: 0,
            startDate: currentBlockTimestamp,
            endDate: currentBlockTimestamp + YEAR_SECONDS,
            fixingDate: currentBlockTimestamp + TIME_PERIODS_S.DAY * (i * 2 + 1),
            rateStatus: 0,
          };

          await bondKpiLinkedRateFacet.setCoupon(coupon);
        }

        // Move time forward past all fixing dates
        await timeTravelFacet.changeSystemTimestamp(currentBlockTimestamp + TIME_PERIODS_S.DAY * 7);

        // Get page 0 (first item)
        const page0 = await bondReadFacet.getCouponsOrderedList(0, 1);
        expect(page0).to.be.an("array").with.lengthOf(1);
        expect(page0[0]).to.equal(1);

        // Get page 1 (second item)
        const page1 = await bondReadFacet.getCouponsOrderedList(1, 1);
        expect(page1).to.be.an("array").with.lengthOf(1);
        expect(page1[0]).to.equal(2);

        // Get page 2 (third item)
        const page2 = await bondReadFacet.getCouponsOrderedList(2, 1);
        expect(page2).to.be.an("array").with.lengthOf(1);
        expect(page2[0]).to.equal(3);
      });
    });
  });
});
