// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock, KpiLinkedRate__factory, Kpis__factory } from "@contract-types";
import type { KpiLinkedRate, Kpis } from "@contract-types";
import { ATS_ROLES, TIME_PERIODS_S, RESOLVER_KEYS } from "@scripts";
import { TEST_BOND_KPI_LINKED_RATE, INTEREST_RATE_TYPE, executeRbac, getDltTimestamp } from "@test";
import type { AssetMockCtx } from "@test";

export function kpiLinkedRateTests(getCtx: () => AssetMockCtx): void {
  describe("Kpi Linked Rate Tests", () => {
    let asset: IAssetMock;
    let kpiRate: KpiLinkedRate;
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      signer_A = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_INTEREST_RATE_MANAGER, members: [signer_A.address] },
      ]);

      await asset.connect(signer_A).setCouponRateType(INTEREST_RATE_TYPE.KPI_LINKED);
      kpiRate = KpiLinkedRate__factory.connect(ctx.diamond.target as string, signer_A);
      await kpiRate.setKpiLinkedRateInterestRate({
        maxRate: TEST_BOND_KPI_LINKED_RATE.maxRate,
        baseRate: TEST_BOND_KPI_LINKED_RATE.baseRate,
        minRate: TEST_BOND_KPI_LINKED_RATE.minRate,
        startPeriod: TEST_BOND_KPI_LINKED_RATE.startPeriod,
        startRate: TEST_BOND_KPI_LINKED_RATE.startRate,
        missedPenalty: TEST_BOND_KPI_LINKED_RATE.missedPenalty,
        reportPeriod: TEST_BOND_KPI_LINKED_RATE.reportPeriod,
        rateDecimals: TEST_BOND_KPI_LINKED_RATE.rateDecimals,
      });
      await kpiRate.setKpiLinkedRateImpactData({
        maxDeviationCap: TEST_BOND_KPI_LINKED_RATE.maxDeviationCap,
        baseLine: TEST_BOND_KPI_LINKED_RATE.baseLine,
        maxDeviationFloor: TEST_BOND_KPI_LINKED_RATE.maxDeviationFloor,
        impactDataDecimals: TEST_BOND_KPI_LINKED_RATE.impactDataDecimals,
        adjustmentPrecision: TEST_BOND_KPI_LINKED_RATE.adjustmentPrecision,
      });
    });

    describe("initializeKpiLinkedRate", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeKpiLinkedRate is called THEN AccountHasNoRole", async () => {
        await expect(
          kpiRate.connect(signer_C).initializeKpiLinkedRate(
            {
              maxRate: 3,
              baseRate: 2,
              minRate: 1,
              startPeriod: 1000,
              startRate: 2,
              missedPenalty: 2,
              reportPeriod: 5000,
              rateDecimals: 1,
            },
            {
              maxDeviationCap: 1000,
              baseLine: 700,
              maxDeviationFloor: 300,
              impactDataDecimals: 1,
              adjustmentPrecision: 3,
            },
          ),
        )
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeKpiLinkedRate is called again THEN FacetAlreadyRegistered", async () => {
        await expect(
          kpiRate.initializeKpiLinkedRate(
            {
              maxRate: 3,
              baseRate: 2,
              minRate: 1,
              startPeriod: 1000,
              startRate: 2,
              missedPenalty: 2,
              reportPeriod: 5000,
              rateDecimals: 1,
            },
            {
              maxDeviationCap: 1000,
              baseLine: 700,
              maxDeviationFloor: 300,
              impactDataDecimals: 1,
              adjustmentPrecision: 3,
            },
          ),
        ).to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered");
      });

      it("GIVEN an invalid interest rate WHEN initializeKpiLinkedRate THEN transaction fails with WrongInterestRateValues", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.kpiLinkedRate);

        await expect(
          kpiRate.initializeKpiLinkedRate(
            {
              maxRate: 3,
              baseRate: 2,
              minRate: 3,
              startPeriod: 1000,
              startRate: 2,
              missedPenalty: 2,
              reportPeriod: 5000,
              rateDecimals: 1,
            },
            {
              maxDeviationCap: 1000,
              baseLine: 700,
              maxDeviationFloor: 300,
              impactDataDecimals: 1,
              adjustmentPrecision: 3,
            },
          ),
        ).to.be.revertedWithCustomError(asset, "WrongInterestRateValues");
      });

      it("GIVEN an invalid impact data WHEN initializeKpiLinkedRate THEN transaction fails with WrongImpactDataValues", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.kpiLinkedRate);

        await expect(
          kpiRate.initializeKpiLinkedRate(
            {
              maxRate: 3,
              baseRate: 2,
              minRate: 1,
              startPeriod: 1000,
              startRate: 2,
              missedPenalty: 2,
              reportPeriod: 5000,
              rateDecimals: 1,
            },
            {
              maxDeviationCap: 1000,
              baseLine: 700,
              maxDeviationFloor: 700,
              impactDataDecimals: 1,
              adjustmentPrecision: 3,
            },
          ),
        ).to.be.revertedWithCustomError(asset, "WrongImpactDataValues");
      });
    });

    describe("initializeKpiLinkedRate event", () => {
      it("GIVEN a fresh deployment WHEN initializeKpiLinkedRate is called THEN emits KpiLinkedRateInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.kpiLinkedRate);
        await expect(
          kpiRate.initializeKpiLinkedRate(
            {
              maxRate: 3n,
              baseRate: 2n,
              minRate: 1n,
              startPeriod: 5000,
              startRate: 2n,
              missedPenalty: 2n,
              reportPeriod: 5000,
              rateDecimals: 1,
            },
            {
              maxDeviationCap: 1000,
              baseLine: 700,
              maxDeviationFloor: 300,
              impactDataDecimals: 1,
              adjustmentPrecision: 3,
            },
          ),
        ).to.emit(asset, "KpiLinkedRateInitialized");
      });
    });

    describe("initializeKpiLinkedRate", () => {
      it("GIVEN Min Rate larger than Base Rate WHEN initializeKpiLinkedRate THEN transaction fails with WrongInterestRateValues", async () => {
        await expect(
          kpiRate.setKpiLinkedRateInterestRate({
            maxRate: 4,
            baseRate: 2,
            minRate: 3,
            startPeriod: 1000,
            startRate: 2,
            missedPenalty: 2,
            reportPeriod: 5000,
            rateDecimals: 1,
          }),
        ).to.be.revertedWithCustomError(asset, "WrongInterestRateValues");
      });

      it("GIVEN Base Rate larger than Max Rate WHEN initializeKpiLinkedRate THEN transaction fails with WrongInterestRateValues", async () => {
        await expect(
          kpiRate.setKpiLinkedRateInterestRate({
            maxRate: 4,
            baseRate: 5,
            minRate: 3,
            startPeriod: 1000,
            startRate: 2,
            missedPenalty: 2,
            reportPeriod: 5000,
            rateDecimals: 1,
          }),
        ).to.be.revertedWithCustomError(asset, "WrongInterestRateValues");
      });

      it("GIVEN Max deviation floor larger than Base Line WHEN initializeKpiLinkedRate THEN transaction fails with WrongImpactDataValues", async () => {
        await expect(
          kpiRate.setKpiLinkedRateImpactData({
            maxDeviationCap: 1000,
            baseLine: 700,
            maxDeviationFloor: 800,
            impactDataDecimals: 1,
            adjustmentPrecision: 3,
          }),
        ).to.be.revertedWithCustomError(asset, "WrongImpactDataValues");
      });

      it("GIVEN Max deviation floor equal to Base Line WHEN initializeKpiLinkedRate THEN transaction fails with WrongImpactDataValues", async () => {
        await expect(
          kpiRate.setKpiLinkedRateImpactData({
            maxDeviationCap: 1000,
            baseLine: 700,
            maxDeviationFloor: 700,
            impactDataDecimals: 1,
            adjustmentPrecision: 3,
          }),
        ).to.be.revertedWithCustomError(asset, "WrongImpactDataValues");
      });

      it("GIVEN Base Line larger than Max Deviation Cap WHEN initializeKpiLinkedRate THEN transaction fails with WrongImpactDataValues", async () => {
        await expect(
          kpiRate.setKpiLinkedRateImpactData({
            maxDeviationCap: 1000,
            baseLine: 7000,
            maxDeviationFloor: 800,
            impactDataDecimals: 1,
            adjustmentPrecision: 3,
          }),
        ).to.be.revertedWithCustomError(asset, "WrongImpactDataValues");
      });

      it("GIVEN Base Line equal to Max Deviation Cap WHEN initializeKpiLinkedRate THEN transaction fails with WrongImpactDataValues", async () => {
        await expect(
          kpiRate.setKpiLinkedRateImpactData({
            maxDeviationCap: 1000,
            baseLine: 1000,
            maxDeviationFloor: 800,
            impactDataDecimals: 1,
            adjustmentPrecision: 3,
          }),
        ).to.be.revertedWithCustomError(asset, "WrongImpactDataValues");
      });
    });

    describe("Paused", () => {
      beforeEach(async () => {
        await asset.connect(signer_B).pause();
      });

      it("GIVEN a paused Token WHEN setInterestRate THEN transaction fails with IsPaused", async () => {
        await expect(
          kpiRate.setKpiLinkedRateInterestRate({
            maxRate: 3,
            baseRate: 2,
            minRate: 1,
            startPeriod: 1000,
            startRate: 2,
            missedPenalty: 2,
            reportPeriod: 5000,
            rateDecimals: 1,
          }),
        ).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN a paused Token WHEN setImpactData THEN transaction fails with IsPaused", async () => {
        await expect(
          kpiRate.setKpiLinkedRateImpactData({
            maxDeviationCap: 1000,
            baseLine: 700,
            maxDeviationFloor: 300,
            impactDataDecimals: 1,
            adjustmentPrecision: 3,
          }),
        ).to.be.revertedWithCustomError(asset, "IsPaused");
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without interest rate manager role WHEN setInterestRate THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          kpiRate.connect(signer_C).setKpiLinkedRateInterestRate({
            maxRate: 3,
            baseRate: 2,
            minRate: 1,
            startPeriod: 1000,
            startRate: 2,
            missedPenalty: 2,
            reportPeriod: 5000,
            rateDecimals: 1,
          }),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });

      it("GIVEN an account without interest rate manager role WHEN setImpactData THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          kpiRate.connect(signer_C).setKpiLinkedRateImpactData({
            maxDeviationCap: 1000,
            baseLine: 700,
            maxDeviationFloor: 300,
            impactDataDecimals: 1,
            adjustmentPrecision: 3,
          }),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });
    });

    describe("Interest Rate", () => {
      it("GIVEN Min Rate larger than Base Rate WHEN setInterestRate THEN transaction fails with WrongInterestRateValues", async () => {
        await expect(
          kpiRate.setKpiLinkedRateInterestRate({
            maxRate: 4,
            baseRate: 2,
            minRate: 3,
            startPeriod: 1000,
            startRate: 2,
            missedPenalty: 2,
            reportPeriod: 5000,
            rateDecimals: 1,
          }),
        ).to.be.revertedWithCustomError(asset, "WrongInterestRateValues");
      });

      it("GIVEN Base Rate larger than Max Rate WHEN setInterestRate THEN transaction fails with WrongInterestRateValues", async () => {
        await expect(
          kpiRate.setKpiLinkedRateInterestRate({
            maxRate: 4,
            baseRate: 5,
            minRate: 3,
            startPeriod: 1000,
            startRate: 2,
            missedPenalty: 2,
            reportPeriod: 5000,
            rateDecimals: 1,
          }),
        ).to.be.revertedWithCustomError(asset, "WrongInterestRateValues");
      });

      it("GIVEN correct interest rate WHEN setInterestRate THEN transaction succeeds", async () => {
        const newInterestRate = {
          maxRate: TEST_BOND_KPI_LINKED_RATE.maxRate + 100,
          baseRate: TEST_BOND_KPI_LINKED_RATE.baseRate + 100,
          minRate: TEST_BOND_KPI_LINKED_RATE.minRate + 100,
          startPeriod: TEST_BOND_KPI_LINKED_RATE.startPeriod + 1000,
          startRate: TEST_BOND_KPI_LINKED_RATE.startRate + 100,
          missedPenalty: TEST_BOND_KPI_LINKED_RATE.missedPenalty + 100,
          reportPeriod: TEST_BOND_KPI_LINKED_RATE.reportPeriod + 1000,
          rateDecimals: TEST_BOND_KPI_LINKED_RATE.rateDecimals + 1,
        };

        await expect(kpiRate.setKpiLinkedRateInterestRate(newInterestRate))
          .to.emit(asset, "InterestRateUpdated")
          .withArgs(signer_A.address, [
            newInterestRate.maxRate,
            newInterestRate.baseRate,
            newInterestRate.minRate,
            newInterestRate.startPeriod,
            newInterestRate.startRate,
            newInterestRate.missedPenalty,
            newInterestRate.reportPeriod,
            newInterestRate.rateDecimals,
          ]);

        const interestRate = await kpiRate.getKpiLinkedRateInterestRate();

        expect(interestRate.maxRate).to.equal(newInterestRate.maxRate);
        expect(interestRate.baseRate).to.equal(newInterestRate.baseRate);
        expect(interestRate.minRate).to.equal(newInterestRate.minRate);
        expect(interestRate.startPeriod).to.equal(newInterestRate.startPeriod);
        expect(interestRate.startRate).to.equal(newInterestRate.startRate);
        expect(interestRate.missedPenalty).to.equal(newInterestRate.missedPenalty);
        expect(interestRate.reportPeriod).to.equal(newInterestRate.reportPeriod);
        expect(interestRate.rateDecimals).to.equal(newInterestRate.rateDecimals);
      });
    });

    describe("Impact Data", () => {
      it("GIVEN Max deviation floor larger than Base Line WHEN setImpactData THEN transaction fails with WrongImpactDataValues", async () => {
        await expect(
          kpiRate.setKpiLinkedRateImpactData({
            maxDeviationCap: 1000,
            baseLine: 700,
            maxDeviationFloor: 800,
            impactDataDecimals: 1,
            adjustmentPrecision: 8,
          }),
        ).to.be.revertedWithCustomError(asset, "WrongImpactDataValues");
      });

      it("GIVEN Max deviation floor equal to Base Line WHEN setImpactData THEN transaction fails with WrongImpactDataValues", async () => {
        await expect(
          kpiRate.setKpiLinkedRateImpactData({
            maxDeviationCap: 1000,
            baseLine: 700,
            maxDeviationFloor: 700,
            impactDataDecimals: 1,
            adjustmentPrecision: 8,
          }),
        ).to.be.revertedWithCustomError(asset, "WrongImpactDataValues");
      });

      it("GIVEN Base Line larger than Max Deviation Cap WHEN setImpactData THEN transaction fails with WrongImpactDataValues", async () => {
        await expect(
          kpiRate.setKpiLinkedRateImpactData({
            maxDeviationCap: 1000,
            baseLine: 7000,
            maxDeviationFloor: 800,
            impactDataDecimals: 1,
            adjustmentPrecision: 8,
          }),
        ).to.be.revertedWithCustomError(asset, "WrongImpactDataValues");
      });

      it("GIVEN Base Line equal to Max Deviation Cap WHEN setImpactData THEN transaction fails with WrongImpactDataValues", async () => {
        await expect(
          kpiRate.setKpiLinkedRateImpactData({
            maxDeviationCap: 1000,
            baseLine: 1000,
            maxDeviationFloor: 800,
            impactDataDecimals: 1,
            adjustmentPrecision: 8,
          }),
        ).to.be.revertedWithCustomError(asset, "WrongImpactDataValues");
      });

      it("GIVEN correct impact data WHEN setImpactData THEN transaction succeeds", async () => {
        const newImpactData = {
          maxDeviationCap: TEST_BOND_KPI_LINKED_RATE.maxDeviationCap + 100,
          baseLine: TEST_BOND_KPI_LINKED_RATE.baseLine + 100,
          maxDeviationFloor: TEST_BOND_KPI_LINKED_RATE.maxDeviationFloor + 100,
          impactDataDecimals: TEST_BOND_KPI_LINKED_RATE.impactDataDecimals + 1,
          adjustmentPrecision: TEST_BOND_KPI_LINKED_RATE.adjustmentPrecision + 1,
        };

        await expect(kpiRate.setKpiLinkedRateImpactData(newImpactData))
          .to.emit(asset, "ImpactDataUpdated")
          .withArgs(signer_A.address, [
            newImpactData.maxDeviationCap,
            newImpactData.baseLine,
            newImpactData.maxDeviationFloor,
            newImpactData.impactDataDecimals,
            newImpactData.adjustmentPrecision,
          ]);

        const impactData = await kpiRate.getKpiLinkedRateImpactData();

        expect(impactData.maxDeviationCap).to.equal(newImpactData.maxDeviationCap);
        expect(impactData.baseLine).to.equal(newImpactData.baseLine);
        expect(impactData.maxDeviationFloor).to.equal(newImpactData.maxDeviationFloor);
        expect(impactData.impactDataDecimals).to.equal(newImpactData.impactDataDecimals);
        expect(impactData.adjustmentPrecision).to.equal(newImpactData.adjustmentPrecision);
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN setKpiLinkedRateInterestRate THEN transaction fails with Deactivated", async () => {
        await expect(
          kpiRate.setKpiLinkedRateInterestRate({
            maxRate: 0,
            baseRate: 0,
            minRate: 0,
            startPeriod: 0,
            startRate: 0,
            missedPenalty: 0,
            reportPeriod: 0,
            rateDecimals: 0,
          }),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN setKpiLinkedRateImpactData THEN transaction fails with Deactivated", async () => {
        await expect(
          kpiRate.setKpiLinkedRateImpactData({
            maxDeviationCap: 0,
            baseLine: 0,
            maxDeviationFloor: 0,
            impactDataDecimals: 0,
            adjustmentPrecision: 0,
          }),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN setCouponRateType THEN reverts with AssetNotOperational", async () => {
        await expect(asset.setCouponRateType(INTEREST_RATE_TYPE.KPI_LINKED)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });

      it("GIVEN non-operational asset WHEN setKpiLinkedRateImpactData THEN reverts with AssetNotOperational", async () => {
        await expect(
          kpiRate.setKpiLinkedRateImpactData({
            maxDeviationCap: 0,
            baseLine: 0,
            maxDeviationFloor: 0,
            impactDataDecimals: 0,
            adjustmentPrecision: 0,
          }),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN setKpiLinkedRateInterestRate THEN reverts with AssetNotOperational", async () => {
        await expect(
          kpiRate.setKpiLinkedRateInterestRate({
            maxRate: 0,
            baseRate: 0,
            minRate: 0,
            startPeriod: 0,
            startRate: 0,
            missedPenalty: 0,
            reportPeriod: 0,
            rateDecimals: 0,
          }),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });

    describe("Rate Calculation", () => {
      let kpis: Kpis;

      beforeEach(async () => {
        await executeRbac(asset, [
          { role: ATS_ROLES.ROLE_CORPORATE_ACTION, members: [signer_A.address] },
          { role: ATS_ROLES.ROLE_PROCEED_RECIPIENT_MANAGER, members: [signer_A.address] },
          { role: ATS_ROLES.ROLE_KPI_MANAGER, members: [signer_A.address] },
        ]);
        kpis = Kpis__factory.connect(kpiRate.target as string, signer_A);
      });

      it("GIVEN fixingDate before startPeriod WHEN getCoupon THEN returns startRate", async () => {
        const currentTimestamp = await getDltTimestamp();
        const fixingDate = currentTimestamp + TIME_PERIODS_S.DAY;
        await kpiRate.setKpiLinkedRateInterestRate({
          maxRate: TEST_BOND_KPI_LINKED_RATE.maxRate,
          baseRate: TEST_BOND_KPI_LINKED_RATE.baseRate,
          minRate: TEST_BOND_KPI_LINKED_RATE.minRate,
          startPeriod: fixingDate + 1,
          startRate: TEST_BOND_KPI_LINKED_RATE.startRate,
          missedPenalty: TEST_BOND_KPI_LINKED_RATE.missedPenalty,
          reportPeriod: TEST_BOND_KPI_LINKED_RATE.reportPeriod,
          rateDecimals: TEST_BOND_KPI_LINKED_RATE.rateDecimals,
        });
        await asset.connect(signer_A).setCoupon({
          recordDate: fixingDate.toString(),
          executionDate: (fixingDate + TIME_PERIODS_S.DAY).toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: currentTimestamp.toString(),
          endDate: fixingDate.toString(),
          fixingDate: fixingDate.toString(),
          rateStatus: 0,
        });
        await asset.changeSystemTimestamp(fixingDate + 2);
        const [registeredCoupon] = await asset.getCoupon(1);
        expect(registeredCoupon.coupon.rate).to.equal(TEST_BOND_KPI_LINKED_RATE.startRate);
        expect(registeredCoupon.coupon.rateDecimals).to.equal(TEST_BOND_KPI_LINKED_RATE.rateDecimals);
      });

      it("GIVEN no KPI report and baseRate+missedPenalty exceeds maxRate WHEN getCoupon THEN rate is capped at maxRate", async () => {
        const maxRate = 100;
        await kpiRate.setKpiLinkedRateInterestRate({
          maxRate: maxRate,
          baseRate: 95,
          minRate: 50,
          startPeriod: TEST_BOND_KPI_LINKED_RATE.startPeriod,
          startRate: TEST_BOND_KPI_LINKED_RATE.startRate,
          missedPenalty: 10,
          reportPeriod: TEST_BOND_KPI_LINKED_RATE.reportPeriod,
          rateDecimals: TEST_BOND_KPI_LINKED_RATE.rateDecimals,
        });
        const currentTimestamp = await getDltTimestamp();
        const fixingDate = currentTimestamp + TIME_PERIODS_S.DAY;
        await asset.connect(signer_A).setCoupon({
          recordDate: fixingDate.toString(),
          executionDate: (fixingDate + TIME_PERIODS_S.DAY).toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: currentTimestamp.toString(),
          endDate: fixingDate.toString(),
          fixingDate: fixingDate.toString(),
          rateStatus: 0,
        });
        await asset.changeSystemTimestamp(fixingDate + 1);
        const [registeredCoupon] = await asset.getCoupon(1);
        // baseRate(95) + missedPenalty(10) = 105 > maxRate(100) → capped to maxRate
        expect(registeredCoupon.coupon.rate).to.equal(maxRate);
      });

      it("GIVEN reportPeriod larger than fixingDate WHEN getCoupon THEN windowStart equals fixingDate and no report found", async () => {
        await kpiRate.setKpiLinkedRateInterestRate({
          maxRate: TEST_BOND_KPI_LINKED_RATE.maxRate,
          baseRate: TEST_BOND_KPI_LINKED_RATE.baseRate,
          minRate: TEST_BOND_KPI_LINKED_RATE.minRate,
          startPeriod: TEST_BOND_KPI_LINKED_RATE.startPeriod,
          startRate: TEST_BOND_KPI_LINKED_RATE.startRate,
          missedPenalty: TEST_BOND_KPI_LINKED_RATE.missedPenalty,
          reportPeriod: 4000000000n, // exceeds any realistic fixingDate → windowStart = fixingDate
          rateDecimals: TEST_BOND_KPI_LINKED_RATE.rateDecimals,
        });
        const currentTimestamp = await getDltTimestamp();
        const fixingDate = currentTimestamp + TIME_PERIODS_S.DAY;
        await asset.connect(signer_A).setCoupon({
          recordDate: fixingDate.toString(),
          executionDate: (fixingDate + TIME_PERIODS_S.DAY).toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: currentTimestamp.toString(),
          endDate: fixingDate.toString(),
          fixingDate: fixingDate.toString(),
          rateStatus: 0,
        });
        await asset.changeSystemTimestamp(fixingDate + 1);
        const [registeredCoupon] = await asset.getCoupon(1);
        // empty window → no report → baseRate(75) + missedPenalty(10) = 85
        expect(registeredCoupon.coupon.rate).to.equal(
          TEST_BOND_KPI_LINKED_RATE.baseRate + TEST_BOND_KPI_LINKED_RATE.missedPenalty,
        );
      });

      it("FIND-023 (TDD, expected red) GIVEN a pending KPI coupon WHEN couponRateType is switched away from KPI_LINKED THEN the coupon still resolves instead of staying pending forever", async () => {
        const currentTimestamp = await getDltTimestamp();
        const fixingDate = currentTimestamp + TIME_PERIODS_S.DAY;
        await asset.connect(signer_A).setCoupon({
          recordDate: fixingDate.toString(),
          executionDate: (fixingDate + TIME_PERIODS_S.DAY).toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: currentTimestamp.toString(),
          endDate: fixingDate.toString(),
          fixingDate: fixingDate.toString(),
          rateStatus: 0,
        });
        await asset.changeSystemTimestamp(fixingDate + 1);
        // Switch away from KPI_LINKED before the pending coupon is ever read/resolved.
        await expect(asset.connect(signer_A).setCouponRateType(INTEREST_RATE_TYPE.STANDARD))
          .to.revertedWithCustomError(asset, "CouponRatePending")
          .withArgs(1);
        const [registeredCoupon] = await asset.getCoupon(1);
        expect(registeredCoupon.coupon.rateStatus).to.not.equal(0);
      });

      it("FIND-023 GIVEN a cancelled coupon alongside a genuinely pending one WHEN setCouponRateType switches away from KPI_LINKED THEN only the pending coupon blocks the switch", async () => {
        const currentTimestamp = await getDltTimestamp();
        const fixingDate1 = currentTimestamp + TIME_PERIODS_S.DAY;
        const fixingDate2 = currentTimestamp + 2 * TIME_PERIODS_S.DAY;

        await asset.connect(signer_A).setCoupon({
          recordDate: fixingDate1.toString(),
          executionDate: (fixingDate1 + TIME_PERIODS_S.DAY).toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: currentTimestamp.toString(),
          endDate: fixingDate1.toString(),
          fixingDate: fixingDate1.toString(),
          rateStatus: 0,
        });
        await asset.connect(signer_A).cancelCoupon(1);

        await asset.connect(signer_A).setCoupon({
          recordDate: fixingDate2.toString(),
          executionDate: (fixingDate2 + TIME_PERIODS_S.DAY).toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: currentTimestamp.toString(),
          endDate: fixingDate2.toString(),
          fixingDate: fixingDate2.toString(),
          rateStatus: 0,
        });

        await asset.changeSystemTimestamp(fixingDate2 + 1);

        await expect(asset.connect(signer_A).setCouponRateType(INTEREST_RATE_TYPE.STANDARD))
          .to.revertedWithCustomError(asset, "CouponRatePending")
          .withArgs(2);
      });

      it("FIND-023 (TDD, expected red) GIVEN very different total historical coupon counts WHEN setCouponRateType is called with none pending THEN gas cost does not scale with total coupon count", async () => {
        const fewTimestamp = await getDltTimestamp();
        const fewFixingDate = fewTimestamp + TIME_PERIODS_S.DAY;
        await asset.connect(signer_A).setCoupon({
          recordDate: fewFixingDate.toString(),
          executionDate: (fewFixingDate + TIME_PERIODS_S.DAY).toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: fewTimestamp.toString(),
          endDate: fewFixingDate.toString(),
          fixingDate: fewFixingDate.toString(),
          rateStatus: 0,
        });
        await asset.changeSystemTimestamp(fewFixingDate + 1);
        await asset.triggerPendingScheduledCrossOrderedTasks();

        const txFew = await asset.connect(signer_A).setCouponRateType(INTEREST_RATE_TYPE.STANDARD);
        const receiptFew = await txFew.wait();

        // Switch back to KPI_LINKED (nothing pending, so this succeeds trivially) to create
        // and resolve more coupons on the same asset, then measure the identical switch again.
        await asset.connect(signer_A).setCouponRateType(INTEREST_RATE_TYPE.KPI_LINKED);

        const MORE_COUPONS = 24;
        let manyTimestamp = await getDltTimestamp();
        for (let i = 0; i < MORE_COUPONS; i++) {
          const fixingDate = manyTimestamp + TIME_PERIODS_S.DAY;
          await asset.connect(signer_A).setCoupon({
            recordDate: fixingDate.toString(),
            executionDate: (fixingDate + TIME_PERIODS_S.DAY).toString(),
            rate: 0,
            rateDecimals: 0,
            startDate: manyTimestamp.toString(),
            endDate: fixingDate.toString(),
            fixingDate: fixingDate.toString(),
            rateStatus: 0,
          });
          await asset.changeSystemTimestamp(fixingDate + 1);
          await asset.triggerPendingScheduledCrossOrderedTasks();
          manyTimestamp = fixingDate + 1;
        }

        const txMany = await asset.connect(signer_A).setCouponRateType(INTEREST_RATE_TYPE.STANDARD);
        const receiptMany = await txMany.wait();

        const gasDelta = receiptMany!.gasUsed - receiptFew!.gasUsed;

        expect(gasDelta < 5_000n).to.equal(true);
      });

      describe("GIVEN a proceed recipient with KPI data in the report window", () => {
        beforeEach(async () => {
          await asset.connect(signer_A).addProceedRecipient(signer_A.address, "0x");
        });

        it("GIVEN impactData below baseLine WHEN getCoupon THEN returns interpolated decreased rate", async () => {
          const currentTimestamp = await getDltTimestamp();
          const fixingDate = currentTimestamp + TIME_PERIODS_S.DAY;
          await asset.connect(signer_A).setCoupon({
            recordDate: fixingDate.toString(),
            executionDate: (fixingDate + TIME_PERIODS_S.DAY).toString(),
            rate: 0,
            rateDecimals: 0,
            startDate: currentTimestamp.toString(),
            endDate: fixingDate.toString(),
            fixingDate: fixingDate.toString(),
            rateStatus: 0,
          });
          const kpiDate = fixingDate - TEST_BOND_KPI_LINKED_RATE.reportPeriod + 1;
          await asset.changeSystemTimestamp(kpiDate);
          // impactData=600 in (maxDeviationFloor=500, baseLine=750):
          //   impactDeltaRate = (100*(750-600))/(750-500) = 60 → rate = 75 - (25*60/100) = 60
          await kpis.addKpiData(kpiDate, 600, signer_A.address);
          await asset.changeSystemTimestamp(fixingDate + 1);
          const [registeredCoupon] = await asset.getCoupon(1);
          expect(registeredCoupon.coupon.rate).to.equal(60n);
        });

        it("GIVEN impactData at or above baseLine WHEN getCoupon THEN returns interpolated increased rate", async () => {
          const currentTimestamp = await getDltTimestamp();
          const fixingDate = currentTimestamp + TIME_PERIODS_S.DAY;
          await asset.connect(signer_A).setCoupon({
            recordDate: fixingDate.toString(),
            executionDate: (fixingDate + TIME_PERIODS_S.DAY).toString(),
            rate: 0,
            rateDecimals: 0,
            startDate: currentTimestamp.toString(),
            endDate: fixingDate.toString(),
            fixingDate: fixingDate.toString(),
            rateStatus: 0,
          });
          const kpiDate = fixingDate - TEST_BOND_KPI_LINKED_RATE.reportPeriod + 1;
          await asset.changeSystemTimestamp(kpiDate);
          // impactData=850 in (baseLine=750, maxDeviationCap=1000):
          //   impactDeltaRate = (100*(850-750))/(1000-750) = 40 → rate = 75 + (25*40/100) = 85
          await kpis.addKpiData(kpiDate, 850, signer_A.address);
          await asset.changeSystemTimestamp(fixingDate + 1);
          const [registeredCoupon] = await asset.getCoupon(1);
          expect(registeredCoupon.coupon.rate).to.equal(85n);
        });

        it("GIVEN impactData below maxDeviationFloor WHEN getCoupon THEN impactDeltaRate is capped and rate equals minRate", async () => {
          const currentTimestamp = await getDltTimestamp();
          const fixingDate = currentTimestamp + TIME_PERIODS_S.DAY;
          await asset.connect(signer_A).setCoupon({
            recordDate: fixingDate.toString(),
            executionDate: (fixingDate + TIME_PERIODS_S.DAY).toString(),
            rate: 0,
            rateDecimals: 0,
            startDate: currentTimestamp.toString(),
            endDate: fixingDate.toString(),
            fixingDate: fixingDate.toString(),
            rateStatus: 0,
          });
          const kpiDate = fixingDate - TEST_BOND_KPI_LINKED_RATE.reportPeriod + 1;
          await asset.changeSystemTimestamp(kpiDate);
          // impactData=400 < maxDeviationFloor=500:
          //   impactDeltaRate = (100*(750-400))/(750-500) = 140 > factor(100) → capped to 100
          //   rate = 75 - (25*100/100) = 50 = minRate
          await kpis.addKpiData(kpiDate, 400, signer_A.address);
          await asset.changeSystemTimestamp(fixingDate + 1);
          const [registeredCoupon] = await asset.getCoupon(1);
          expect(registeredCoupon.coupon.rate).to.equal(TEST_BOND_KPI_LINKED_RATE.minRate);
        });

        it("GIVEN impactData above maxDeviationCap WHEN getCoupon THEN impactDeltaRate is capped and rate equals maxRate", async () => {
          const currentTimestamp = await getDltTimestamp();
          const fixingDate = currentTimestamp + TIME_PERIODS_S.DAY;
          await asset.connect(signer_A).setCoupon({
            recordDate: fixingDate.toString(),
            executionDate: (fixingDate + TIME_PERIODS_S.DAY).toString(),
            rate: 0,
            rateDecimals: 0,
            startDate: currentTimestamp.toString(),
            endDate: fixingDate.toString(),
            fixingDate: fixingDate.toString(),
            rateStatus: 0,
          });
          const kpiDate = fixingDate - TEST_BOND_KPI_LINKED_RATE.reportPeriod + 1;
          await asset.changeSystemTimestamp(kpiDate);
          // impactData=1200 > maxDeviationCap=1000:
          //   impactDeltaRate = (100*(1200-750))/(1000-750) = 180 > factor(100) → capped to 100
          //   rate = 75 + (25*100/100) = 100 = maxRate
          await kpis.addKpiData(kpiDate, 1200, signer_A.address);
          await asset.changeSystemTimestamp(fixingDate + 1);
          const [registeredCoupon] = await asset.getCoupon(1);
          expect(registeredCoupon.coupon.rate).to.equal(TEST_BOND_KPI_LINKED_RATE.maxRate);
        });

        describe("FIND-021 - wrong KPI window start when fixingDate is at or before reportPeriod", () => {
          const kpiDate = 1;
          const impactData = 600;
          const expectedRate = 60n;

          it("GIVEN fixingDate equal to reportPeriod WHEN getCoupon THEN rate reflects the KPI impact instead of the missed-report penalty", async () => {
            const currentTimestamp = await getDltTimestamp();
            const fixingDate = currentTimestamp + TIME_PERIODS_S.DAY;

            await kpiRate.setKpiLinkedRateInterestRate({
              maxRate: TEST_BOND_KPI_LINKED_RATE.maxRate,
              baseRate: TEST_BOND_KPI_LINKED_RATE.baseRate,
              minRate: TEST_BOND_KPI_LINKED_RATE.minRate,
              startPeriod: TEST_BOND_KPI_LINKED_RATE.startPeriod,
              startRate: TEST_BOND_KPI_LINKED_RATE.startRate,
              missedPenalty: TEST_BOND_KPI_LINKED_RATE.missedPenalty,
              reportPeriod: fixingDate,
              rateDecimals: TEST_BOND_KPI_LINKED_RATE.rateDecimals,
            });
            await kpis.addKpiData(kpiDate, impactData, signer_A.address);
            await asset.connect(signer_A).setCoupon({
              recordDate: fixingDate.toString(),
              executionDate: (fixingDate + TIME_PERIODS_S.DAY).toString(),
              rate: 0,
              rateDecimals: 0,
              startDate: currentTimestamp.toString(),
              endDate: fixingDate.toString(),
              fixingDate: fixingDate.toString(),
              rateStatus: 0,
            });
            await asset.changeSystemTimestamp(fixingDate + 1);

            const [registeredCoupon] = await asset.getCoupon(1);
            expect(registeredCoupon.coupon.rate).to.equal(expectedRate);
          });

          it("GIVEN fixingDate lower than reportPeriod WHEN getCoupon THEN rate reflects the KPI impact instead of the missed-report penalty", async () => {
            const currentTimestamp = await getDltTimestamp();
            const fixingDate = currentTimestamp + TIME_PERIODS_S.DAY;

            await kpiRate.setKpiLinkedRateInterestRate({
              maxRate: TEST_BOND_KPI_LINKED_RATE.maxRate,
              baseRate: TEST_BOND_KPI_LINKED_RATE.baseRate,
              minRate: TEST_BOND_KPI_LINKED_RATE.minRate,
              startPeriod: TEST_BOND_KPI_LINKED_RATE.startPeriod,
              startRate: TEST_BOND_KPI_LINKED_RATE.startRate,
              missedPenalty: TEST_BOND_KPI_LINKED_RATE.missedPenalty,
              reportPeriod: fixingDate + 500,
              rateDecimals: TEST_BOND_KPI_LINKED_RATE.rateDecimals,
            });
            await kpis.addKpiData(kpiDate, impactData, signer_A.address);
            await asset.connect(signer_A).setCoupon({
              recordDate: fixingDate.toString(),
              executionDate: (fixingDate + TIME_PERIODS_S.DAY).toString(),
              rate: 0,
              rateDecimals: 0,
              startDate: currentTimestamp.toString(),
              endDate: fixingDate.toString(),
              fixingDate: fixingDate.toString(),
              rateStatus: 0,
            });
            await asset.changeSystemTimestamp(fixingDate + 1);

            const [registeredCoupon] = await asset.getCoupon(1);
            expect(registeredCoupon.coupon.rate).to.equal(expectedRate);
          });
        });
      });
    });
  });
}
