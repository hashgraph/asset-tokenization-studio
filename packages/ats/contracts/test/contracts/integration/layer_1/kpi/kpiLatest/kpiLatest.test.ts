// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { KpisFacetBase, PauseFacet, ProceedRecipientsFacet, type ResolverProxy } from "@contract-types";
import { ATS_ROLES, dateToUnixTimestamp } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBondSustainabilityPerformanceTargetRateTokenFixture } from "@test";
import { executeRbac } from "@test";

describe("Kpi Latest Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let project1: string;
  let project2: string;

  let kpiFacet: KpisFacetBase;
  let pauseFacet: PauseFacet;
  let proceedRecipientsFacet: ProceedRecipientsFacet;

  async function deploySecurityFixtureMultiPartition() {
    const base = await deployBondSustainabilityPerformanceTargetRateTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    // Set up projects
    project1 = signer_A.address;
    project2 = signer_B.address;

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._INTEREST_RATE_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._PROCEED_RECIPIENT_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._KPI_MANAGER_ROLE,
        members: [signer_A.address],
      },
    ]);

    kpiFacet = await ethers.getContractAt("KpisFacetBase", diamond.target, signer_A);
    pauseFacet = await ethers.getContractAt("PauseFacet", diamond.target, signer_A);
    proceedRecipientsFacet = await ethers.getContractAt("ProceedRecipientsFacet", diamond.target, signer_A);

    await proceedRecipientsFacet.connect(signer_A).addProceedRecipient(project1, "0x");
    await proceedRecipientsFacet.connect(signer_A).addProceedRecipient(project2, "0x");
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureMultiPartition);
  });

  describe("addKpiData", () => {
    it("GIVEN a user without KPI_MANAGER_ROLE WHEN addKpiData is called THEN transaction fails", async () => {
      const date = 1000;
      const value = 750;

      await expect(kpiFacet.connect(signer_C).addKpiData(date, value, project1)).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN a paused contract WHEN addKpiData is called THEN transaction fails with TokenIsPaused", async () => {
      await pauseFacet.connect(signer_B).pause();

      const date = 1000;
      const value = 750;

      await expect(kpiFacet.connect(signer_A).addKpiData(date, value, project1)).to.be.rejectedWith("TokenIsPaused");
    });

    it("GIVEN an already used date WHEN addKpiData is called THEN transaction reverts", async () => {
      const date = 1000;
      const value1 = 750;
      const value2 = 850;

      await kpiFacet.connect(signer_A).addKpiData(date, value1, project1);

      // Try to add data for the same date again - should fail due to assert in _addKpiData
      await expect(kpiFacet.connect(signer_A).addKpiData(date, value2, project1)).to.be.reverted;
    });

    it("GIVEN a date before minDate WHEN addKpiData is called THEN transaction fails", async () => {
      const invalidDate = 0;
      const value = 750;

      await expect(kpiFacet.connect(signer_A).addKpiData(invalidDate, value, project1)).to.be.revertedWithCustomError(
        kpiFacet,
        "InvalidDate",
      );
    });

    it("GIVEN a date after current block timestamp WHEN addKpiData is called THEN transaction fails", async () => {
      const invalidDate = dateToUnixTimestamp(`2999-01-01T00:01:00Z`);
      const value = 750;

      await expect(kpiFacet.connect(signer_A).addKpiData(invalidDate, value, project1)).to.be.revertedWithCustomError(
        kpiFacet,
        "InvalidDate",
      );
    });

    it("GIVEN a valid date, value and project WHEN addKpiData is called THEN KPI data is added successfully", async () => {
      const date = 1000;
      const value = 750;

      await expect(kpiFacet.connect(signer_A).addKpiData(date, value, project1))
        .to.emit(kpiFacet, "KpiDataAdded")
        .withArgs(project1, date, value);

      const isCheckpoint = await kpiFacet.isCheckPointDate(date, project1);
      expect(isCheckpoint).to.be.true;
    });

    it("GIVEN multiple KPI data entries WHEN addKpiData is called in order THEN all entries are stored correctly", async () => {
      const date1 = 1000;
      const value1 = 750;
      const date2 = 2000;
      const value2 = 850;

      await kpiFacet.connect(signer_A).addKpiData(date1, value1, project1);
      await kpiFacet.connect(signer_A).addKpiData(date2, value2, project1);

      expect(await kpiFacet.isCheckPointDate(date1, project1)).to.be.true;
      expect(await kpiFacet.isCheckPointDate(date2, project1)).to.be.true;
    });

    it("GIVEN KPI data entries WHEN addKpiData is called out of order THEN entries are stored correctly", async () => {
      const date1 = 1000;
      const value1 = 750;
      const date2 = 3000;
      const value2 = 950;
      const date3 = 2000;
      const value3 = 850;
      const date4 = 500;
      const value4 = 650;

      await kpiFacet.connect(signer_A).addKpiData(date1, value1, project1);
      await kpiFacet.connect(signer_A).addKpiData(date2, value2, project1);
      await kpiFacet.connect(signer_A).addKpiData(date3, value3, project1);
      await kpiFacet.connect(signer_A).addKpiData(date4, value4, project1);

      expect(await kpiFacet.isCheckPointDate(date1, project1)).to.be.true;
      expect(await kpiFacet.isCheckPointDate(date2, project1)).to.be.true;
      expect(await kpiFacet.isCheckPointDate(date3, project1)).to.be.true;
      expect(await kpiFacet.isCheckPointDate(date4, project1)).to.be.true;
    });

    it("GIVEN different projects WHEN addKpiData is called THEN data is stored separately", async () => {
      const date = 1000;
      const value1 = 750;
      const value2 = 850;

      await kpiFacet.connect(signer_A).addKpiData(date, value1, project1);
      await kpiFacet.connect(signer_A).addKpiData(date, value2, project2);

      expect(await kpiFacet.isCheckPointDate(date, project1)).to.be.true;
      expect(await kpiFacet.isCheckPointDate(date, project2)).to.be.true;
    });
  });

  describe("getLatestKpiData", () => {
    async function addKpiDataFixture() {
      await kpiFacet.connect(signer_A).addKpiData(1000, 750, project1);
      await kpiFacet.connect(signer_A).addKpiData(2000, 850, project1);
      await kpiFacet.connect(signer_A).addKpiData(3000, 950, project1);
    }
    beforeEach(async () => {
      await loadFixture(addKpiDataFixture);
    });

    it("GIVEN KPI data exists WHEN getLatestKpiData is called with valid range THEN returns latest value", async () => {
      const result = await kpiFacet.getLatestKpiData(500, 2500, project1);
      expect(result.exists_).to.be.true;
      expect(result.value_).to.equal(850);
    });

    it("GIVEN KPI data exists WHEN getLatestKpiData is called with exact date THEN returns correct value", async () => {
      const result = await kpiFacet.getLatestKpiData(500, 3000, project1);
      expect(result.exists_).to.be.true;
      expect(result.value_).to.equal(950);
    });

    it("GIVEN no KPI data in range WHEN getLatestKpiData is called THEN returns exists false", async () => {
      const result = await kpiFacet.getLatestKpiData(3500, 4000, project1);
      expect(result.exists_).to.be.false;
      expect(result.value_).to.equal(0);
    });

    it("GIVEN from date after checkpoint WHEN getLatestKpiData is called THEN returns exists false", async () => {
      const result = await kpiFacet.getLatestKpiData(3500, 4000, project1);
      expect(result.exists_).to.be.false;
      expect(result.value_).to.equal(0);
    });

    it("GIVEN different projects WHEN getLatestKpiData is called THEN returns project-specific data", async () => {
      await kpiFacet.connect(signer_A).addKpiData(1500, 800, project2);

      const result1 = await kpiFacet.getLatestKpiData(500, 2500, project1);
      const result2 = await kpiFacet.getLatestKpiData(500, 2500, project2);

      expect(result1.exists_).to.be.true;
      expect(result1.value_).to.equal(850);
      expect(result2.exists_).to.be.true;
      expect(result2.value_).to.equal(800);
    });

    it("GIVEN no KPI data for project WHEN getLatestKpiData is called THEN returns exists false", async () => {
      const result = await kpiFacet.getLatestKpiData(500, 2500, project2);
      expect(result.exists_).to.be.false;
      expect(result.value_).to.equal(0);
    });
  });

  describe("getMinDate", () => {
    it("GIVEN a contract WHEN getMinDate is called THEN returns the minimum date", async () => {
      const minDate = await kpiFacet.getMinDate();
      expect(minDate).to.be.equal(0);
    });
  });

  describe("isCheckPointDate", () => {
    it("GIVEN no KPI data WHEN isCheckPointDate is called THEN returns false", async () => {
      const date = 1000;
      const isCheckpoint = await kpiFacet.isCheckPointDate(date, project1);
      expect(isCheckpoint).to.be.false;
    });

    it("GIVEN KPI data exists at date WHEN isCheckPointDate is called THEN returns true", async () => {
      const date = 1000;
      await kpiFacet.connect(signer_A).addKpiData(date, 750, project1);

      const isCheckpoint = await kpiFacet.isCheckPointDate(date, project1);
      expect(isCheckpoint).to.be.true;
    });

    it("GIVEN KPI data for different project WHEN isCheckPointDate is called THEN returns false", async () => {
      const date = 1000;
      await kpiFacet.connect(signer_A).addKpiData(date, 750, project1);

      const isCheckpoint = await kpiFacet.isCheckPointDate(date, project2);
      expect(isCheckpoint).to.be.false;
    });

    it("GIVEN multiple checkpoints WHEN isCheckPointDate is called THEN returns correct values", async () => {
      const date1 = 1000;
      const date2 = 2000;
      const date3 = 3000;

      await kpiFacet.connect(signer_A).addKpiData(date1, 750, project1);
      await kpiFacet.connect(signer_A).addKpiData(date2, 850, project1);

      expect(await kpiFacet.isCheckPointDate(date1, project1)).to.be.true;
      expect(await kpiFacet.isCheckPointDate(date2, project1)).to.be.true;
      expect(await kpiFacet.isCheckPointDate(date3, project1)).to.be.false;
    });
  });
});
