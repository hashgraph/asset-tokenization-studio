// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import { type ResolverProxy, Pause, KpiLinkedRate } from "@contract-types";
import { ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { DEFAULT_BOND_KPI_LINKED_RATE_PARAMS, deployBondKpiLinkedRateTokenFixture } from "@test";
import { executeRbac } from "@test";

describe("Kpi Linked Rate Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: SignerWithAddress;
  let signer_B: SignerWithAddress;
  let signer_C: SignerWithAddress;

  let kpiLinkedRateFacet: KpiLinkedRate;
  let pauseFacet: Pause;

  async function deploySecurityFixtureMultiPartition() {
    const base = await deployBondKpiLinkedRateTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._INTEREST_RATE_MANAGER_ROLE,
        members: [signer_A.address],
      },
    ]);

    kpiLinkedRateFacet = await ethers.getContractAt("KpiLinkedRate", diamond.address, signer_A);
    pauseFacet = await ethers.getContractAt("Pause", diamond.address, signer_A);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureMultiPartition);
  });

  it("GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized", async () => {
    await expect(
      kpiLinkedRateFacet.initialize_KpiLinkedRate(
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
    ).to.be.rejectedWith("AlreadyInitialized");
  });

  describe("Paused", () => {
    beforeEach(async () => {
      // Pausing the token
      await pauseFacet.connect(signer_B).pause();
    });

    it("GIVEN a paused Token WHEN setInterestRate THEN transaction fails with TokenIsPaused", async () => {
      // transfer with data fails
      await expect(
        kpiLinkedRateFacet.connect(signer_A).setInterestRate({
          maxRate: 3,
          baseRate: 2,
          minRate: 1,
          startPeriod: 1000,
          startRate: 2,
          missedPenalty: 2,
          reportPeriod: 5000,
          rateDecimals: 1,
        }),
      ).to.be.rejectedWith("TokenIsPaused");
    });

    it("GIVEN a paused Token WHEN setImpactData THEN transaction fails with TokenIsPaused", async () => {
      // transfer with data fails
      await expect(
        kpiLinkedRateFacet.connect(signer_A).setImpactData({
          maxDeviationCap: 1000,
          baseLine: 700,
          maxDeviationFloor: 300,
          impactDataDecimals: 1,
          adjustmentPrecision: 3,
        }),
      ).to.be.rejectedWith("TokenIsPaused");
    });
  });

  describe("AccessControl", () => {
    it("GIVEN an account without interest rate manager role WHEN setInterestRate THEN transaction fails with AccountHasNoRole", async () => {
      // add to list fails
      await expect(
        kpiLinkedRateFacet.connect(signer_C).setInterestRate({
          maxRate: 3,
          baseRate: 2,
          minRate: 1,
          startPeriod: 1000,
          startRate: 2,
          missedPenalty: 2,
          reportPeriod: 5000,
          rateDecimals: 1,
        }),
      ).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN an account without interest rate manager role WHEN setImpactData THEN transaction fails with AccountHasNoRole", async () => {
      // add to list fails
      await expect(
        kpiLinkedRateFacet.connect(signer_C).setImpactData({
          maxDeviationCap: 1000,
          baseLine: 700,
          maxDeviationFloor: 300,
          impactDataDecimals: 1,
          adjustmentPrecision: 3,
        }),
      ).to.be.rejectedWith("AccountHasNoRole");
    });
  });

  describe("Interest Rate", () => {
    it("GIVEN Min Rate larger than Base Rate WHEN setInterestRate THEN transaction fails with WrongInterestRateValues", async () => {
      // add to list fails
      await expect(
        kpiLinkedRateFacet.connect(signer_A).setInterestRate({
          maxRate: 4,
          baseRate: 2,
          minRate: 3,
          startPeriod: 1000,
          startRate: 2,
          missedPenalty: 2,
          reportPeriod: 5000,
          rateDecimals: 1,
        }),
      ).to.be.rejectedWith("WrongInterestRateValues");
    });

    it("GIVEN Base Rate larger than Max Rate WHEN setInterestRate THEN transaction fails with WrongInterestRateValues", async () => {
      // add to list fails
      await expect(
        kpiLinkedRateFacet.connect(signer_A).setInterestRate({
          maxRate: 4,
          baseRate: 5,
          minRate: 3,
          startPeriod: 1000,
          startRate: 2,
          missedPenalty: 2,
          reportPeriod: 5000,
          rateDecimals: 1,
        }),
      ).to.be.rejectedWith("WrongInterestRateValues");
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

      await expect(kpiLinkedRateFacet.connect(signer_A).setInterestRate(newInterestRate))
        .to.emit(kpiLinkedRateFacet, "InterestRateUpdated")
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

      const interestRate = await kpiLinkedRateFacet.getInterestRate();

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
      // add to list fails
      await expect(
        kpiLinkedRateFacet.connect(signer_A).setImpactData({
          maxDeviationCap: 1000,
          baseLine: 700,
          maxDeviationFloor: 800,
          impactDataDecimals: 1,
          adjustmentPrecision: 8,
        }),
      ).to.be.rejectedWith("WrongImpactDataValues");
    });

    it("GIVEN Base Line larger than Max Deviation Cap WHEN setImpactData THEN transaction fails with WrongImpactDataValues", async () => {
      // add to list fails
      await expect(
        kpiLinkedRateFacet.connect(signer_A).setImpactData({
          maxDeviationCap: 1000,
          baseLine: 7000,
          maxDeviationFloor: 800,
          impactDataDecimals: 1,
          adjustmentPrecision: 8,
        }),
      ).to.be.rejectedWith("WrongImpactDataValues");
    });

    it("GIVEN correct impact data WHEN setImpactData THEN transaction succeeds", async () => {
      const newImpactData = {
        maxDeviationCap: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.maxDeviationCap + 100,
        baseLine: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.baseLine + 100,
        maxDeviationFloor: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.maxDeviationFloor + 100,
        impactDataDecimals: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.impactDataDecimals + 1,
        adjustmentPrecision: DEFAULT_BOND_KPI_LINKED_RATE_PARAMS.adjustmentPrecision + 1,
      };

      await expect(kpiLinkedRateFacet.connect(signer_A).setImpactData(newImpactData))
        .to.emit(kpiLinkedRateFacet, "ImpactDataUpdated")
        .withArgs(signer_A.address, [
          newImpactData.maxDeviationCap,
          newImpactData.baseLine,
          newImpactData.maxDeviationFloor,
          newImpactData.impactDataDecimals,
          newImpactData.adjustmentPrecision,
        ]);

      const impactData = await kpiLinkedRateFacet.getImpactData();

      expect(impactData.maxDeviationCap).to.equal(newImpactData.maxDeviationCap);
      expect(impactData.baseLine).to.equal(newImpactData.baseLine);
      expect(impactData.maxDeviationFloor).to.equal(newImpactData.maxDeviationFloor);
      expect(impactData.impactDataDecimals).to.equal(newImpactData.impactDataDecimals);
      expect(impactData.adjustmentPrecision).to.equal(newImpactData.adjustmentPrecision);
    });
  });
});
