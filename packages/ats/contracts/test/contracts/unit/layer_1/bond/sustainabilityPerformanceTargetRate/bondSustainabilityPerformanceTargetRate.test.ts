// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import {
  ResolverProxy,
  BondUSASustainabilityPerformanceTargetRateFacetTimeTravel,
  SustainabilityPerformanceTargetRateFacetTimeTravel,
  BondUSAReadSustainabilityPerformanceTargetRateFacetTimeTravel,
  TimeTravelFacet,
  ERC1594SustainabilityPerformanceTargetRateFacetTimeTravel,
  ProceedRecipientsSustainabilityPerformanceTargetRateFacetTimeTravel,
  KpisSustainabilityPerformanceTargetRateFacetTimeTravel,
  ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacetTimeTravel,
} from "@contract-types";
import { dateToUnixTimestamp, ATS_ROLES, TIME_PERIODS_S } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBondSustainabilityPerformanceTargetRateTokenFixture } from "@test";
import { executeRbac } from "@test";

const couponPeriod = TIME_PERIODS_S.WEEK;
const referenceDate = dateToUnixTimestamp(`2030-01-01T00:01:00Z`);
const amount = 1000;

describe("Bond Sustainability Performance Target Rate Tests", () => {
  let couponRecordDateInSeconds = 0;
  let couponExecutionDateInSeconds = 0;
  let couponFixingDateInSeconds = 0;
  let couponEndDateInSeconds = 0;
  let couponStartDateInSeconds = 0;
  let newInterestRate = {
    baseRate: 0,
    startPeriod: 0,
    startRate: 0,
    rateDecimals: 0,
  };

  let diamond: ResolverProxy;
  let signer_A: SignerWithAddress;
  let signer_B: SignerWithAddress;
  let signer_C: SignerWithAddress;
  let project1: string;
  let project2: string;

  let bondSPTRateFacet: BondUSASustainabilityPerformanceTargetRateFacetTimeTravel;
  let bondReadFacet: BondUSAReadSustainabilityPerformanceTargetRateFacetTimeTravel;
  let sptRateFacet: SustainabilityPerformanceTargetRateFacetTimeTravel;
  let timeTravelFacet: TimeTravelFacet;
  let erc1594Facet: ERC1594SustainabilityPerformanceTargetRateFacetTimeTravel;
  let proceedRecipientsFacet: ProceedRecipientsSustainabilityPerformanceTargetRateFacetTimeTravel;
  let kpisFacet: KpisSustainabilityPerformanceTargetRateFacetTimeTravel;
  let scheduledTasksFacet: ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacetTimeTravel;

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
    const base = await deployBondSustainabilityPerformanceTargetRateTokenFixture();

    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    project1 = signer_B.address;
    project2 = signer_C.address;

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

    bondSPTRateFacet = await ethers.getContractAt(
      "BondUSASustainabilityPerformanceTargetRateFacetTimeTravel",
      diamond.address,
      signer_A,
    );
    bondReadFacet = await ethers.getContractAt(
      "BondUSAReadSustainabilityPerformanceTargetRateFacetTimeTravel",
      diamond.address,
      signer_A,
    );
    sptRateFacet = await ethers.getContractAt(
      "SustainabilityPerformanceTargetRateFacetTimeTravel",
      diamond.address,
      signer_A,
    );
    erc1594Facet = await ethers.getContractAt(
      "ERC1594SustainabilityPerformanceTargetRateFacetTimeTravel",
      diamond.address,
      signer_A,
    );
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.address);
    proceedRecipientsFacet = await ethers.getContractAt(
      "ProceedRecipientsSustainabilityPerformanceTargetRateFacetTimeTravel",
      diamond.address,
      signer_A,
    );
    kpisFacet = await ethers.getContractAt(
      "KpisSustainabilityPerformanceTargetRateFacetTimeTravel",
      diamond.address,
      signer_A,
    );
    scheduledTasksFacet = await ethers.getContractAt(
      "ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacetTimeTravel",
      diamond.address,
      signer_A,
    );

    await erc1594Facet.issue(signer_A.address, amount, "0x");
    await proceedRecipientsFacet.addProceedRecipient(project1, "0x");
    await proceedRecipientsFacet.addProceedRecipient(project2, "0x");

    newInterestRate = {
      baseRate: 5000,
      startPeriod: referenceDate - 1000,
      startRate: 3000,
      rateDecimals: 3,
    };

    await sptRateFacet.connect(signer_A).setInterestRate(newInterestRate);
  }

  async function checkCouponPostValues(
    interestRate: number,
    interestRateDecimals: number,
    amount: number,
    couponID: number,
    accountAddress: string,
    nominalValue: number = 100,
    nominalValueDecimals: number = 2,
  ) {
    const registeredCouponPostFixingDate = await bondReadFacet.getCoupon(couponID);
    const couponForPostFixingDate = await bondReadFacet.getCouponFor(couponID, accountAddress);
    const couponAmountForPostFixingDate = await bondReadFacet.getCouponAmountFor(couponID, accountAddress);

    const numerator =
      BigInt(amount) *
      BigInt(nominalValue) *
      BigInt(interestRate) *
      (BigInt(couponData.endDate) - BigInt(couponData.startDate));
    const denominator =
      BigInt(10) **
        (BigInt(couponForPostFixingDate.decimals) + BigInt(nominalValueDecimals) + BigInt(interestRateDecimals)) *
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

  describe("Sustainability Performance Target Rate Calculations", () => {
    it("GIVEN a coupon with fixing date before start period WHEN rate is calculated THEN rate is start rate", async () => {
      couponData.fixingDate = (newInterestRate.startPeriod - 1000).toString();
      couponData.recordDate = (parseInt(couponData.fixingDate) + 1).toString();
      couponData.executionDate = (parseInt(couponData.recordDate) + 1).toString();

      let originalFixingDate = couponData.fixingDate;

      await bondSPTRateFacet.connect(signer_A).setCoupon(couponData);
      const tasks_count_Before = await scheduledTasksFacet.scheduledCrossOrderedTaskCount();

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

      await checkMinDates(originalFixingDate);

      await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.recordDate) + 1);

      await checkCouponPostValues(newInterestRate.startRate, newInterestRate.rateDecimals, amount, 1, signer_A.address);

      await scheduledTasksFacet.connect(signer_A).triggerPendingScheduledCrossOrderedTasks();

      const tasks_count_After = await scheduledTasksFacet.scheduledCrossOrderedTaskCount();

      await checkMinDates(originalFixingDate);

      expect(tasks_count_Before).to.equal(2);
      expect(tasks_count_After).to.equal(0);

      await checkCouponPostValues(newInterestRate.startRate, newInterestRate.rateDecimals, amount, 1, signer_A.address);
    });

    describe("PENALTY mode tests", () => {
      beforeEach(async () => {
        // Set impact data with PENALTY modes for testing
        await sptRateFacet.connect(signer_A).setImpactData(
          [
            {
              baseLine: 1000,
              baseLineMode: 0, // MINIMUM
              deltaRate: 300,
              impactDataMode: 0, // PENALTY
            },
            {
              baseLine: 2000,
              baseLineMode: 1, // MAXIMUM
              deltaRate: 400,
              impactDataMode: 0, // PENALTY
            },
          ],
          [project1, project2],
        );
      });

      it("GIVEN no KPI data for any project WHEN rate is calculated with PENALTY mode THEN deltaRate is added for projects with no data", async () => {
        const deltaRateProject1 = 300;
        const deltaRateProject2 = 400;

        await bondSPTRateFacet.connect(signer_A).setCoupon(couponData);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

        const interestRate = await sptRateFacet.getInterestRate();

        const expectedRate = Number(interestRate.baseRate) + deltaRateProject1 + deltaRateProject2;

        await checkCouponPostValues(expectedRate, Number(interestRate.rateDecimals), amount, 1, signer_A.address);
      });

      it("GIVEN KPI value below baseline with PENALTY MINIMUM mode WHEN rate is calculated THEN deltaRate is added", async () => {
        const kpiValue = 800;
        const deltaRateProject1 = 300;

        await bondSPTRateFacet.connect(signer_A).setCoupon(couponData);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) - 1);
        await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, kpiValue, project1);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

        const interestRate = await sptRateFacet.getInterestRate();
        // Project1 triggers penalty (below minimum), Project2 no data also triggers penalty
        const expectedRate = Number(interestRate.baseRate) + deltaRateProject1 + 400;

        await checkCouponPostValues(expectedRate, Number(interestRate.rateDecimals), amount, 1, signer_A.address);
      });

      it("GIVEN KPI value at or above baseline with PENALTY MINIMUM mode WHEN rate is calculated THEN no deltaRate is added for that project", async () => {
        const kpiValue = 1000;

        await bondSPTRateFacet.connect(signer_A).setCoupon(couponData);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) - 1);
        await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, kpiValue, project1);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

        const interestRate = await sptRateFacet.getInterestRate();
        // Project1 meets target (at minimum), Project2 no data triggers penalty
        const expectedRate = Number(interestRate.baseRate) + 400;

        await checkCouponPostValues(expectedRate, Number(interestRate.rateDecimals), amount, 1, signer_A.address);
      });

      it("GIVEN KPI value above baseline with PENALTY MAXIMUM mode WHEN rate is calculated THEN deltaRate is added", async () => {
        const kpiValue = 2200;
        const deltaRateProject2 = 400;

        await bondSPTRateFacet.connect(signer_A).setCoupon(couponData);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) - 1);
        await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, kpiValue, project2);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

        const interestRate = await sptRateFacet.getInterestRate();
        // Project1 no data triggers penalty, Project2 exceeds maximum triggers penalty
        const expectedRate = Number(interestRate.baseRate) + 300 + deltaRateProject2;

        await checkCouponPostValues(expectedRate, Number(interestRate.rateDecimals), amount, 1, signer_A.address);
      });

      it("GIVEN KPI value at or below baseline with PENALTY MAXIMUM mode WHEN rate is calculated THEN no deltaRate is added for that project", async () => {
        const kpiValue = 2000;

        await bondSPTRateFacet.connect(signer_A).setCoupon(couponData);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) - 1);
        await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, kpiValue, project2);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

        const interestRate = await sptRateFacet.getInterestRate();
        // Project1 no data triggers penalty, Project2 at maximum no penalty
        const expectedRate = Number(interestRate.baseRate) + 300;

        await checkCouponPostValues(expectedRate, Number(interestRate.rateDecimals), amount, 1, signer_A.address);
      });

      it("GIVEN multiple projects with all targets met WHEN rate is calculated THEN base rate is maintained", async () => {
        await bondSPTRateFacet.connect(signer_A).setCoupon(couponData);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) - 1);
        await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, 1200, project1); // Above baseline (MINIMUM) -> no penalty
        await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, 1800, project2); // Below baseline (MAXIMUM) -> no penalty

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

        const interestRate = await sptRateFacet.getInterestRate();

        await checkCouponPostValues(
          Number(interestRate.baseRate),
          Number(interestRate.rateDecimals),
          amount,
          1,
          signer_A.address,
        );
      });
    });

    describe("BONUS mode tests", () => {
      beforeEach(async () => {
        // Set impact data with BONUS modes for testing
        await sptRateFacet.connect(signer_A).setImpactData(
          [
            {
              baseLine: 1000,
              baseLineMode: 0, // MINIMUM
              deltaRate: 250,
              impactDataMode: 1, // BONUS
            },
            {
              baseLine: 2000,
              baseLineMode: 1, // MAXIMUM
              deltaRate: 350,
              impactDataMode: 1, // BONUS
            },
          ],
          [project1, project2],
        );
      });

      it("GIVEN no KPI data for any project WHEN rate is calculated with BONUS mode THEN no deltaRate is subtracted", async () => {
        await bondSPTRateFacet.connect(signer_A).setCoupon(couponData);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

        const interestRate = await sptRateFacet.getInterestRate();

        await checkCouponPostValues(
          Number(interestRate.baseRate),
          Number(interestRate.rateDecimals),
          amount,
          1,
          signer_A.address,
        );
      });

      it("GIVEN KPI value above baseline with BONUS MINIMUM mode WHEN rate is calculated THEN deltaRate is subtracted", async () => {
        const kpiValue = 1200;
        const deltaRateProject1 = 250;

        await bondSPTRateFacet.connect(signer_A).setCoupon(couponData);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) - 1);
        await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, kpiValue, project1);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

        const interestRate = await sptRateFacet.getInterestRate();
        const expectedRate = Number(interestRate.baseRate) - deltaRateProject1;

        await checkCouponPostValues(expectedRate, Number(interestRate.rateDecimals), amount, 1, signer_A.address);
      });

      it("GIVEN KPI value at or below baseline with BONUS MINIMUM mode WHEN rate is calculated THEN no deltaRate is subtracted", async () => {
        const kpiValue = 1000;

        await bondSPTRateFacet.connect(signer_A).setCoupon(couponData);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) - 1);
        await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, kpiValue, project1);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

        const interestRate = await sptRateFacet.getInterestRate();

        await checkCouponPostValues(
          Number(interestRate.baseRate),
          Number(interestRate.rateDecimals),
          amount,
          1,
          signer_A.address,
        );
      });

      it("GIVEN KPI value below baseline with BONUS MAXIMUM mode WHEN rate is calculated THEN deltaRate is subtracted", async () => {
        const kpiValue = 1800;
        const deltaRateProject2 = 350;

        await bondSPTRateFacet.connect(signer_A).setCoupon(couponData);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) - 1);
        await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, kpiValue, project2);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

        const interestRate = await sptRateFacet.getInterestRate();
        const expectedRate = Number(interestRate.baseRate) - deltaRateProject2;

        await checkCouponPostValues(expectedRate, Number(interestRate.rateDecimals), amount, 1, signer_A.address);
      });

      it("GIVEN KPI value at or above baseline with BONUS MAXIMUM mode WHEN rate is calculated THEN no deltaRate is subtracted", async () => {
        const kpiValue = 2000;

        await bondSPTRateFacet.connect(signer_A).setCoupon(couponData);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) - 1);
        await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, kpiValue, project2);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

        const interestRate = await sptRateFacet.getInterestRate();

        await checkCouponPostValues(
          Number(interestRate.baseRate),
          Number(interestRate.rateDecimals),
          amount,
          1,
          signer_A.address,
        );
      });
    });

    describe("Mixed mode tests", () => {
      beforeEach(async () => {
        // Set impact data with mixed modes for testing
        await sptRateFacet.connect(signer_A).setImpactData(
          [
            {
              baseLine: 1000,
              baseLineMode: 0, // MINIMUM
              deltaRate: 200,
              impactDataMode: 0, // PENALTY
            },
            {
              baseLine: 2000,
              baseLineMode: 1, // MAXIMUM
              deltaRate: 150,
              impactDataMode: 1, // BONUS
            },
          ],
          [project1, project2],
        );
      });

      it("GIVEN multiple projects with mixed impact modes WHEN rate is calculated THEN all adjustments are applied correctly", async () => {
        const kpiValue1 = 800; // Below baseline1 (MINIMUM) -> triggers penalty
        const kpiValue2 = 1800; // Below baseline2 (MAXIMUM) -> triggers bonus
        const deltaRateProject1 = 200;
        const deltaRateProject2 = 150;

        await bondSPTRateFacet.connect(signer_A).setCoupon(couponData);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) - 1);
        await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, kpiValue1, project1);
        await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, kpiValue2, project2);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

        const interestRate = await sptRateFacet.getInterestRate();
        const expectedRate = Number(interestRate.baseRate) + deltaRateProject1 - deltaRateProject2;

        await checkCouponPostValues(expectedRate, Number(interestRate.rateDecimals), amount, 1, signer_A.address);
      });

      it("GIVEN one project with KPI data and one without WHEN rate is calculated THEN only applicable adjustments are made", async () => {
        await bondSPTRateFacet.connect(signer_A).setCoupon(couponData);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) - 1);
        await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, 1500, project1); // Above baseline -> no penalty

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

        const interestRate = await sptRateFacet.getInterestRate();
        const expectedRate = Number(interestRate.baseRate); // No penalties or bonuses

        await checkCouponPostValues(expectedRate, Number(interestRate.rateDecimals), amount, 1, signer_A.address);
      });
    });

    describe("Edge case tests", () => {
      it("GIVEN rate calculation results in negative value WHEN rate is calculated THEN rate is set to zero", async () => {
        const baseRate = 100;
        const deltaRateProject1 = 500;

        await sptRateFacet.connect(signer_A).setInterestRate({
          baseRate: baseRate,
          startPeriod: referenceDate - 1000,
          startRate: 3000,
          rateDecimals: 3,
        });

        await sptRateFacet.connect(signer_A).setImpactData(
          [
            {
              baseLine: 1000,
              baseLineMode: 0, // MINIMUM
              deltaRate: deltaRateProject1,
              impactDataMode: 1, // BONUS
            },
            {
              baseLine: 2000,
              baseLineMode: 1, // MAXIMUM
              deltaRate: 200,
              impactDataMode: 1, // BONUS
            },
          ],
          [project1, project2],
        );

        await bondSPTRateFacet.connect(signer_A).setCoupon(couponData);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) - 1);
        await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, 2000, project1); // Above baseline -> bonus applies

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

        await checkCouponPostValues(0, 3, amount, 1, signer_A.address);
      });

      it("GIVEN multiple coupons WHEN rates are calculated at different times THEN each coupon has correct rate", async () => {
        const deltaRateProject1 = 100;

        await sptRateFacet.connect(signer_A).setImpactData(
          [
            {
              baseLine: 1000,
              baseLineMode: 0, // MINIMUM
              deltaRate: deltaRateProject1,
              impactDataMode: 0, // PENALTY
            },
            {
              baseLine: 2000,
              baseLineMode: 1, // MAXIMUM
              deltaRate: 200,
              impactDataMode: 1, // BONUS
            },
          ],
          [project1, project2],
        );

        await bondSPTRateFacet.connect(signer_A).setCoupon(couponData);

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) - 1);
        await kpisFacet.addKpiData(parseInt(couponData.fixingDate) - 1, 800, project1); // Below baseline -> penalty

        await timeTravelFacet.changeSystemTimestamp(parseInt(couponData.fixingDate) + 1);

        const interestRate = await sptRateFacet.getInterestRate();
        const expectedRate1 = Number(interestRate.baseRate) + deltaRateProject1;

        await checkCouponPostValues(expectedRate1, Number(interestRate.rateDecimals), amount, 1, signer_A.address);

        const newFixingDate = parseInt(couponData.fixingDate) + 100000;
        const newRecordDate = newFixingDate + 100000;
        const newExecutionDate = newRecordDate + 100000;

        const couponData2 = {
          ...couponData,
          fixingDate: newFixingDate.toString(),
          recordDate: newRecordDate.toString(),
          executionDate: newExecutionDate.toString(),
        };

        await bondSPTRateFacet.connect(signer_A).setCoupon(couponData2);

        await timeTravelFacet.changeSystemTimestamp(newFixingDate - 1);
        await kpisFacet.addKpiData(newFixingDate - 1, 1500, project1); // Above baseline -> no penalty

        await timeTravelFacet.changeSystemTimestamp(newRecordDate + 1);

        await checkCouponPostValues(
          Number(interestRate.baseRate),
          Number(interestRate.rateDecimals),
          amount,
          2,
          signer_A.address,
        );
      });
    });
  });
});
