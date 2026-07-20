// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock, Kpis__factory } from "@contract-types";
import type { Kpis } from "@contract-types";
import { ATS_ROLES, dateToUnixTimestamp, TIME_PERIODS_S, RESOLVER_KEYS } from "@lib";
import { executeRbac, getDltTimestamp } from "@test";
import { ASSET_MOCK_CONFIG_ID } from "../../../../../fixtures/deploy/assetMockConfiguration";
import type { AssetMockCtx } from "@test";

export function kpiLatestTests(getCtx: () => AssetMockCtx): void {
  describe("Kpi Latest Tests", () => {
    let asset: IAssetMock;
    let kpis: Kpis;
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let project1: string;
    let project2: string;

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      signer_A = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;

      project1 = signer_A.address;
      project2 = signer_B.address;

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_PROCEED_RECIPIENT_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_KPI_MANAGER, members: [signer_A.address] },
      ]);

      kpis = Kpis__factory.connect(ctx.diamond.target as string, signer_A);

      await asset.connect(signer_A).addProceedRecipient(project1, "0x");
      await asset.connect(signer_A).addProceedRecipient(project2, "0x");
    });

    describe("addKpiData", () => {
      it("GIVEN a user without ROLE_KPI_MANAGER WHEN addKpiData is called THEN transaction fails", async () => {
        const date = 1000;
        const value = 750;

        await expect(kpis.connect(signer_C).addKpiData(date, value, project1)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN a paused contract WHEN addKpiData is called THEN transaction fails with IsPaused", async () => {
        await asset.connect(signer_B).pause();

        const date = 1000;
        const value = 750;

        await expect(kpis.addKpiData(date, value, project1)).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN an already used date WHEN addKpiData is called THEN transaction reverts", async () => {
        const date = 1000;
        const value1 = 750;
        const value2 = 850;

        await kpis.addKpiData(date, value1, project1);

        await expect(kpis.addKpiData(date, value2, project1)).to.be.reverted;
      });

      it("GIVEN a date before minDate WHEN addKpiData is called THEN transaction fails", async () => {
        const invalidDate = 0;
        const value = 750;

        await expect(kpis.addKpiData(invalidDate, value, project1)).to.be.revertedWithCustomError(asset, "InvalidDate");
      });

      it("GIVEN a date after current block timestamp WHEN addKpiData is called THEN transaction fails", async () => {
        const invalidDate = dateToUnixTimestamp(`2999-01-01T00:01:00Z`);
        const value = 750;

        await expect(kpis.addKpiData(invalidDate, value, project1)).to.be.revertedWithCustomError(asset, "InvalidDate");
      });

      it("GIVEN a valid date, value and project WHEN addKpiData is called THEN KPI data is added successfully", async () => {
        const date = 1000;
        const value = 750;

        await expect(kpis.addKpiData(date, value, project1))
          .to.emit(asset, "KpiDataAdded")
          .withArgs(project1, date, value);

        const isCheckpoint = await kpis.isCheckPointDate(date, project1);
        expect(isCheckpoint).to.be.true;
      });

      it("GIVEN multiple KPI data entries WHEN addKpiData is called in order THEN all entries are stored correctly", async () => {
        const date1 = 1000;
        const value1 = 750;
        const date2 = 2000;
        const value2 = 850;

        await kpis.addKpiData(date1, value1, project1);
        await kpis.addKpiData(date2, value2, project1);

        expect(await kpis.isCheckPointDate(date1, project1)).to.be.true;
        expect(await kpis.isCheckPointDate(date2, project1)).to.be.true;
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

        await kpis.addKpiData(date1, value1, project1);
        await kpis.addKpiData(date2, value2, project1);
        await kpis.addKpiData(date3, value3, project1);
        await kpis.addKpiData(date4, value4, project1);

        expect(await kpis.isCheckPointDate(date1, project1)).to.be.true;
        expect(await kpis.isCheckPointDate(date2, project1)).to.be.true;
        expect(await kpis.isCheckPointDate(date3, project1)).to.be.true;
        expect(await kpis.isCheckPointDate(date4, project1)).to.be.true;
      });

      it("GIVEN different projects WHEN addKpiData is called THEN data is stored separately", async () => {
        const date = 1000;
        const value1 = 750;
        const value2 = 850;

        await kpis.addKpiData(date, value1, project1);
        await kpis.addKpiData(date, value2, project2);

        expect(await kpis.isCheckPointDate(date, project1)).to.be.true;
        expect(await kpis.isCheckPointDate(date, project2)).to.be.true;
      });
    });

    describe("getLatestKpiData", () => {
      beforeEach(async () => {
        await kpis.addKpiData(1000, 750, project1);
        await kpis.addKpiData(2000, 850, project1);
        await kpis.addKpiData(3000, 950, project1);
      });

      it("GIVEN KPI data exists WHEN getLatestKpiData is called with valid range THEN returns latest value", async () => {
        const result = await kpis.getLatestKpiData(500, 2500, project1);
        expect(result.exists_).to.be.true;
        expect(result.value_).to.equal(850);
      });

      it("GIVEN KPI data exists WHEN getLatestKpiData is called with exact date THEN returns correct value", async () => {
        const result = await kpis.getLatestKpiData(500, 3000, project1);
        expect(result.exists_).to.be.true;
        expect(result.value_).to.equal(950);
      });

      it("GIVEN no KPI data in range WHEN getLatestKpiData is called THEN returns exists false", async () => {
        const result = await kpis.getLatestKpiData(3500, 4000, project1);
        expect(result.exists_).to.be.false;
        expect(result.value_).to.equal(0);
      });

      it("GIVEN from date after checkpoint WHEN getLatestKpiData is called THEN returns exists false", async () => {
        const result = await kpis.getLatestKpiData(3500, 4000, project1);
        expect(result.exists_).to.be.false;
        expect(result.value_).to.equal(0);
      });

      it("GIVEN different projects WHEN getLatestKpiData is called THEN returns project-specific data", async () => {
        await kpis.addKpiData(1500, 800, project2);

        const result1 = await kpis.getLatestKpiData(500, 2500, project1);
        const result2 = await kpis.getLatestKpiData(500, 2500, project2);

        expect(result1.exists_).to.be.true;
        expect(result1.value_).to.equal(850);
        expect(result2.exists_).to.be.true;
        expect(result2.value_).to.equal(800);
      });

      it("GIVEN no KPI data for project WHEN getLatestKpiData is called THEN returns exists false", async () => {
        const result = await kpis.getLatestKpiData(500, 2500, project2);
        expect(result.exists_).to.be.false;
        expect(result.value_).to.equal(0);
      });
    });

    describe("getMinDate", () => {
      it("GIVEN a contract WHEN getMinDate is called THEN returns the minimum date", async () => {
        const minDate = await kpis.getMinDate();
        expect(minDate).to.be.equal(0);
      });

      describe("GIVEN a KPI-linked coupon past its fixing date", () => {
        beforeEach(async () => {
          await asset.grantRole(ATS_ROLES.ROLE_INTEREST_RATE_MANAGER, signer_A.address);
          await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A.address);
        });

        it("WHEN getMinDate is called THEN returns the coupon fixing date", async () => {
          await asset.connect(signer_A).setCouponRateType(3);

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

          const minDate = await kpis.getMinDate();
          expect(minDate).to.be.equal(fixingDate);
        });
      });
    });

    describe("isCheckPointDate", () => {
      it("GIVEN no KPI data WHEN isCheckPointDate is called THEN returns false", async () => {
        const date = 1000;
        const isCheckpoint = await kpis.isCheckPointDate(date, project1);
        expect(isCheckpoint).to.be.false;
      });

      it("GIVEN KPI data exists at date WHEN isCheckPointDate is called THEN returns true", async () => {
        const date = 1000;
        await kpis.addKpiData(date, 750, project1);

        const isCheckpoint = await kpis.isCheckPointDate(date, project1);
        expect(isCheckpoint).to.be.true;
      });

      it("GIVEN KPI data for different project WHEN isCheckPointDate is called THEN returns false", async () => {
        const date = 1000;
        await kpis.addKpiData(date, 750, project1);

        const isCheckpoint = await kpis.isCheckPointDate(date, project2);
        expect(isCheckpoint).to.be.false;
      });

      it("GIVEN multiple checkpoints WHEN isCheckPointDate is called THEN returns correct values", async () => {
        const date1 = 1000;
        const date2 = 2000;
        const date3 = 3000;

        await kpis.addKpiData(date1, 750, project1);
        await kpis.addKpiData(date2, 850, project1);

        expect(await kpis.isCheckPointDate(date1, project1)).to.be.true;
        expect(await kpis.isCheckPointDate(date2, project1)).to.be.true;
        expect(await kpis.isCheckPointDate(date3, project1)).to.be.false;
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN addKpiData THEN transaction fails with Deactivated", async () => {
        await expect(kpis.addKpiData(0, 0, ethers.ZeroAddress)).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeKpis", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeKpis is called THEN AccountHasNoRole", async () => {
        await expect(kpis.connect(signer_C).initializeKpis())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeKpis is called again THEN FacetAlreadyRegistered", async () => {
        await expect(kpis.initializeKpis()).to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered");
      });
    });

    describe("initializeKpis event", () => {
      it("GIVEN a fresh deployment WHEN initializeKpis is called THEN emits KpisInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.kpis);
        await expect(kpis.initializeKpis()).to.emit(asset, "KpisInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational WHEN addKpiData is called THEN AssetNotOperational", async () => {
        await expect(kpis.addKpiData(0n, 0n, ethers.ZeroAddress))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });
    });
  });
}
