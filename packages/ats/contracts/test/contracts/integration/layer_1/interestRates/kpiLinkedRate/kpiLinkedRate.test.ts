// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { DEFAULT_BOND_KPI_LINKED_RATE_PARAMS, deployBondKpiLinkedRateTokenFixture } from "@test";
import { executeRbac } from "@test";

describe("Kpi Linked Rate Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deploySecurityFixtureMultiPartition() {
    const base = await deployBondKpiLinkedRateTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    await executeRbac(asset, [
      {
        role: ATS_ROLES.ROLE_PAUSER,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_INTEREST_RATE_MANAGER,
        members: [signer_A.address],
      },
    ]);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureMultiPartition);
  });

  it("GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized", async () => {
    await expect(
      asset.initializeKpiLinkedRate(
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
    ).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
  });

  describe("initializeKpiLinkedRate", () => {
    it("GIVEN Min Rate larger than Base Rate WHEN initializeKpiLinkedRate THEN transaction fails with WrongInterestRateValues", async () => {
      await expect(
        deployBondKpiLinkedRateTokenFixture({
          interestRateParams: { maxRate: 4, baseRate: 2, minRate: 3 },
        }),
      ).to.be.revertedWithCustomError(asset, "WrongInterestRateValues");
    });

    it("GIVEN Base Rate larger than Max Rate WHEN initializeKpiLinkedRate THEN transaction fails with WrongInterestRateValues", async () => {
      await expect(
        deployBondKpiLinkedRateTokenFixture({
          interestRateParams: { maxRate: 4, baseRate: 5, minRate: 3 },
        }),
      ).to.be.revertedWithCustomError(asset, "WrongInterestRateValues");
    });

    it("GIVEN Max deviation floor larger than Base Line WHEN initializeKpiLinkedRate THEN transaction fails with WrongImpactDataValues", async () => {
      await expect(
        deployBondKpiLinkedRateTokenFixture({
          impactDataParams: { maxDeviationCap: 1000, baseLine: 700, maxDeviationFloor: 800 },
        }),
      ).to.be.revertedWithCustomError(asset, "WrongImpactDataValues");
    });

    it("GIVEN Max deviation floor equal to Base Line WHEN initializeKpiLinkedRate THEN transaction fails with WrongImpactDataValues", async () => {
      await expect(
        deployBondKpiLinkedRateTokenFixture({
          impactDataParams: { maxDeviationCap: 1000, baseLine: 700, maxDeviationFloor: 700 },
        }),
      ).to.be.revertedWithCustomError(asset, "WrongImpactDataValues");
    });

    it("GIVEN Base Line larger than Max Deviation Cap WHEN initializeKpiLinkedRate THEN transaction fails with WrongImpactDataValues", async () => {
      await expect(
        deployBondKpiLinkedRateTokenFixture({
          impactDataParams: { maxDeviationCap: 1000, baseLine: 7000, maxDeviationFloor: 800 },
        }),
      ).to.be.revertedWithCustomError(asset, "WrongImpactDataValues");
    });

    it("GIVEN Base Line equal to Max Deviation Cap WHEN initializeKpiLinkedRate THEN transaction fails with WrongImpactDataValues", async () => {
      await expect(
        deployBondKpiLinkedRateTokenFixture({
          impactDataParams: { maxDeviationCap: 1000, baseLine: 1000, maxDeviationFloor: 800 },
        }),
      ).to.be.revertedWithCustomError(asset, "WrongImpactDataValues");
    });
  });

  describe("Paused", () => {
    beforeEach(async () => {
      // Pausing the token
      await asset.connect(signer_B).pause();
    });

    it("GIVEN a paused Token WHEN setInterestRate THEN transaction fails with IsPaused", async () => {
      // transfer with data fails
      await expect(
        asset.connect(signer_A).setKpiLinkedRateInterestRate({
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
      // transfer with data fails
      await expect(
        asset.connect(signer_A).setKpiLinkedRateImpactData({
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
      // add to list fails
      await expect(
        asset.connect(signer_C).setKpiLinkedRateInterestRate({
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
      // add to list fails
      await expect(
        asset.connect(signer_C).setKpiLinkedRateImpactData({
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
      // add to list fails
      await expect(
        asset.connect(signer_A).setKpiLinkedRateInterestRate({
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
      // add to list fails
      await expect(
        asset.connect(signer_A).setKpiLinkedRateInterestRate({
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

      await expect(asset.connect(signer_A).setKpiLinkedRateInterestRate(newInterestRate))
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

      const interestRate = await asset.getKpiLinkedRateInterestRate();

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
        asset.connect(signer_A).setKpiLinkedRateImpactData({
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
        asset.connect(signer_A).setKpiLinkedRateImpactData({
          maxDeviationCap: 1000,
          baseLine: 700,
          maxDeviationFloor: 700,
          impactDataDecimals: 1,
          adjustmentPrecision: 8,
        }),
      ).to.be.revertedWithCustomError(asset, "WrongImpactDataValues");
    });

    it("GIVEN Base Line larger than Max Deviation Cap WHEN setImpactData THEN transaction fails with WrongImpactDataValues", async () => {
      // add to list fails
      await expect(
        asset.connect(signer_A).setKpiLinkedRateImpactData({
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
        asset.connect(signer_A).setKpiLinkedRateImpactData({
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

      await expect(asset.connect(signer_A).setKpiLinkedRateImpactData(newImpactData))
        .to.emit(asset, "ImpactDataUpdated")
        .withArgs(signer_A.address, [
          newImpactData.maxDeviationCap,
          newImpactData.baseLine,
          newImpactData.maxDeviationFloor,
          newImpactData.impactDataDecimals,
          newImpactData.adjustmentPrecision,
        ]);

      const impactData = await asset.getKpiLinkedRateImpactData();

      expect(impactData.maxDeviationCap).to.equal(newImpactData.maxDeviationCap);
      expect(impactData.baseLine).to.equal(newImpactData.baseLine);
      expect(impactData.maxDeviationFloor).to.equal(newImpactData.maxDeviationFloor);
      expect(impactData.impactDataDecimals).to.equal(newImpactData.impactDataDecimals);
      expect(impactData.adjustmentPrecision).to.equal(newImpactData.adjustmentPrecision);
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN setKpiLinkedRateInterestRate THEN transaction fails with Deactivated", async () => {
      const base = await deployBondKpiLinkedRateTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).setKpiLinkedRateInterestRate({
          maxRate: 0,
          baseRate: 0,
          minRate: 0,
          startPeriod: 0,
          startRate: 0,
          missedPenalty: 0,
          reportPeriod: 0,
          rateDecimals: 0,
        }),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });

    it("GIVEN a deactivated asset WHEN setKpiLinkedRateImpactData THEN transaction fails with Deactivated", async () => {
      const base = await deployBondKpiLinkedRateTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).setKpiLinkedRateImpactData({
          maxDeviationCap: 0,
          baseLine: 0,
          maxDeviationFloor: 0,
          impactDataDecimals: 0,
          adjustmentPrecision: 0,
        }),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });
});
