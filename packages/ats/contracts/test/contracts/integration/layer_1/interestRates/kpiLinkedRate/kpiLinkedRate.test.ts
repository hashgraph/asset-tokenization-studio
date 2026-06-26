// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock, KpiLinkedRate__factory, Kpis__factory } from "@contract-types";
import type { KpiLinkedRate, Kpis } from "@contract-types";
import { ATS_ROLES, RESOLVER_KEY_KPI_LINKED_RATE, TIME_PERIODS_S } from "@scripts";
import { DEFAULT_BOND_KPI_LINKED_RATE_PARAMS, executeRbac, getDltTimestamp } from "@test";
import type { AssetMockCtx } from "@test";

export function kpiLinkedRateTests(getCtx: () => AssetMockCtx): void {
  describe("Kpi Linked Rate Tests", () => {
    const KPI_INTEREST_RATE_TYPE = 2;

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

      await asset.connect(signer_A).setCouponRateType(KPI_INTEREST_RATE_TYPE);
      kpiRate = KpiLinkedRate__factory.connect(ctx.diamond.target as string, signer_A);
      await kpiRate.setKpiLinkedRateInterestRate({
        maxRate: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.maxRate,
        baseRate: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.baseRate,
        minRate: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.minRate,
        startPeriod: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.startPeriod,
        startRate: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.startRate,
        missedPenalty: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.missedPenalty,
        reportPeriod: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.reportPeriod,
        rateDecimals: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.rateDecimals,
      });
      await kpiRate.setKpiLinkedRateImpactData({
        maxDeviationCap: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.maxDeviationCap,
        baseLine: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.baseLine,
        maxDeviationFloor: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.maxDeviationFloor,
        impactDataDecimals: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.impactDataDecimals,
        adjustmentPrecision: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.adjustmentPrecision,
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
    });

    describe("initializeKpiLinkedRate event", () => {
      it("GIVEN a fresh deployment WHEN initializeKpiLinkedRate is called THEN emits KpiLinkedRateInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_KPI_LINKED_RATE);
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
          maxRate: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.maxRate + 100,
          baseRate: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.baseRate + 100,
          minRate: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.minRate + 100,
          startPeriod: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.startPeriod + 1000,
          startRate: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.startRate + 100,
          missedPenalty: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.missedPenalty + 100,
          reportPeriod: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.reportPeriod + 1000,
          rateDecimals: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.rateDecimals + 1,
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
          maxDeviationCap: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.maxDeviationCap + 100,
          baseLine: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.baseLine + 100,
          maxDeviationFloor: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.maxDeviationFloor + 100,
          impactDataDecimals: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.impactDataDecimals + 1,
          adjustmentPrecision: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.adjustmentPrecision + 1,
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
        await expect(asset.setCouponRateType(KPI_INTEREST_RATE_TYPE)).to.be.revertedWithCustomError(
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
          maxRate: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.maxRate,
          baseRate: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.baseRate,
          minRate: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.minRate,
          startPeriod: fixingDate + 1,
          startRate: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.startRate,
          missedPenalty: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.missedPenalty,
          reportPeriod: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.reportPeriod,
          rateDecimals: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.rateDecimals,
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
        expect(registeredCoupon.coupon.rate).to.equal(DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.startRate);
        expect(registeredCoupon.coupon.rateDecimals).to.equal(DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.rateDecimals);
      });

      it("GIVEN no KPI report and baseRate+missedPenalty exceeds maxRate WHEN getCoupon THEN rate is capped at maxRate", async () => {
        const maxRate = 100;
        await kpiRate.setKpiLinkedRateInterestRate({
          maxRate: maxRate,
          baseRate: 95,
          minRate: 50,
          startPeriod: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.startPeriod,
          startRate: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.startRate,
          missedPenalty: 10,
          reportPeriod: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.reportPeriod,
          rateDecimals: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.rateDecimals,
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
          maxRate: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.maxRate,
          baseRate: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.baseRate,
          minRate: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.minRate,
          startPeriod: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.startPeriod,
          startRate: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.startRate,
          missedPenalty: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.missedPenalty,
          reportPeriod: 4000000000n, // exceeds any realistic fixingDate → windowStart = fixingDate
          rateDecimals: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.rateDecimals,
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
          DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.baseRate + DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.missedPenalty,
        );
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
          const kpiDate = fixingDate - DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.reportPeriod + 1;
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
          const kpiDate = fixingDate - DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.reportPeriod + 1;
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
          const kpiDate = fixingDate - DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.reportPeriod + 1;
          await asset.changeSystemTimestamp(kpiDate);
          // impactData=400 < maxDeviationFloor=500:
          //   impactDeltaRate = (100*(750-400))/(750-500) = 140 > factor(100) → capped to 100
          //   rate = 75 - (25*100/100) = 50 = minRate
          await kpis.addKpiData(kpiDate, 400, signer_A.address);
          await asset.changeSystemTimestamp(fixingDate + 1);
          const [registeredCoupon] = await asset.getCoupon(1);
          expect(registeredCoupon.coupon.rate).to.equal(DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.minRate);
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
          const kpiDate = fixingDate - DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.reportPeriod + 1;
          await asset.changeSystemTimestamp(kpiDate);
          // impactData=1200 > maxDeviationCap=1000:
          //   impactDeltaRate = (100*(1200-750))/(1000-750) = 180 > factor(100) → capped to 100
          //   rate = 75 + (25*100/100) = 100 = maxRate
          await kpis.addKpiData(kpiDate, 1200, signer_A.address);
          await asset.changeSystemTimestamp(fixingDate + 1);
          const [registeredCoupon] = await asset.getCoupon(1);
          expect(registeredCoupon.coupon.rate).to.equal(DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.maxRate);
        });
      });
    });
  });
}
