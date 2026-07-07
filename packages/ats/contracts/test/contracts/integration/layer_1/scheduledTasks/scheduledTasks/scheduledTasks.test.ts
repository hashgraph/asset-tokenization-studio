// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ZERO, EMPTY_STRING, dateToUnixTimestamp, ATS_ROLES, ATS_TASK, TIME_PERIODS_S, RESOLVER_KEYS } from "@scripts";
import { getOrchestratorLibraryAddresses } from "@scripts/domain";
import { takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { INTEREST_RATE_TYPE, executeRbac, getDltTimestamp, MAX_UINT256 } from "@test";

const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const INITIAL_AMOUNT = 1000;
const DECIMALS_INIT = 6;

export function scheduledTasksTests(getCtx: () => AssetMockCtx): void {
  describe("Scheduled Tasks Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      asset = ctx.asset;

      await executeRbac(asset, [
        {
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_ISSUER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_KYC,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_SSI_MANAGER,
          members: [signer_A.address],
        },
      ]);

      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);

      await asset.forceDecimals(DECIMALS_INIT);
    });

    it("GIVEN a paused Token WHEN triggerTasks THEN transaction fails with IsPaused", async () => {
      await asset.connect(signer_B).pause();

      await expect(asset.connect(signer_C).triggerPendingScheduledCrossOrderedTasks()).to.be.revertedWithCustomError(
        asset,
        "IsPaused",
      );
      await expect(asset.connect(signer_C).triggerScheduledCrossOrderedTasks(1)).to.be.revertedWithCustomError(
        asset,
        "IsPaused",
      );
    });

    it("GIVEN a token WHEN triggerTasks THEN transaction succeeds", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: INITIAL_AMOUNT,
        data: "0x",
      });

      const dividendsRecordDateInSeconds_1 = dateToUnixTimestamp("2030-01-01T00:00:15Z");
      const dividendsRecordDateInSeconds_2 = dateToUnixTimestamp("2030-01-01T00:00:30Z");
      const dividendsExecutionDateInSeconds = dateToUnixTimestamp("2030-01-01T00:02:30Z");
      const dividendsAmountPerEquity = 1;
      const dividendsAmountDecimalsPerEquity = 2;
      const dividendData_1 = {
        recordDate: dividendsRecordDateInSeconds_1.toString(),
        executionDate: dividendsExecutionDateInSeconds.toString(),
        amount: dividendsAmountPerEquity,
        amountDecimals: dividendsAmountDecimalsPerEquity,
      };
      const dividendData_2 = {
        recordDate: dividendsRecordDateInSeconds_2.toString(),
        executionDate: dividendsExecutionDateInSeconds.toString(),
        amount: dividendsAmountPerEquity,
        amountDecimals: dividendsAmountDecimalsPerEquity,
      };
      await asset.connect(signer_C).setDividend(dividendData_2);
      await asset.connect(signer_C).setDividend(dividendData_1);

      const balanceAdjustmentExecutionDateInSeconds_1 = dateToUnixTimestamp("2030-01-01T00:00:16Z");
      const balanceAdjustmentExecutionDateInSeconds_2 = dateToUnixTimestamp("2030-01-01T00:00:31Z");
      const balanceAdjustmentsFactor_1 = 1;
      const balanceAdjustmentsDecimals_1 = 2;
      const balanceAdjustmentsFactor_2 = 1;
      const balanceAdjustmentsDecimals_2 = 2;

      const balanceAdjustmentData_1 = {
        executionDate: balanceAdjustmentExecutionDateInSeconds_1.toString(),
        factor: balanceAdjustmentsFactor_1,
        decimals: balanceAdjustmentsDecimals_1,
      };
      const balanceAdjustmentData_2 = {
        executionDate: balanceAdjustmentExecutionDateInSeconds_2.toString(),
        factor: balanceAdjustmentsFactor_2,
        decimals: balanceAdjustmentsDecimals_2,
      };

      await asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData_2);
      await asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData_1);

      let scheduledTasksCount = await asset.scheduledCrossOrderedTaskCount();
      let scheduledTasks = await asset.getScheduledCrossOrderedTasks(0, 100);

      expect(scheduledTasksCount).to.equal(4);
      expect(scheduledTasks.length).to.equal(scheduledTasksCount);
      expect(scheduledTasks[0].scheduledTimestamp).to.equal(balanceAdjustmentExecutionDateInSeconds_2);
      expect(scheduledTasks[1].scheduledTimestamp).to.equal(dividendsRecordDateInSeconds_2);
      expect(scheduledTasks[2].scheduledTimestamp).to.equal(balanceAdjustmentExecutionDateInSeconds_1);
      expect(scheduledTasks[3].scheduledTimestamp).to.equal(dividendsRecordDateInSeconds_1);
      expect(scheduledTasks[0].data).to.equal(ATS_TASK.BALANCE_ADJUSTMENT);
      expect(scheduledTasks[1].data).to.equal(ATS_TASK.SNAPSHOT);
      expect(scheduledTasks[2].data).to.equal(ATS_TASK.BALANCE_ADJUSTMENT);
      expect(scheduledTasks[3].data).to.equal(ATS_TASK.SNAPSHOT);

      await asset.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds_1 + 1);

      const BalanceOf_A_Dividend_1 = await asset.getDividendFor(2, signer_A.address);
      let BalanceOf_A_Dividend_2 = await asset.getDividendFor(1, signer_A.address);

      expect(BalanceOf_A_Dividend_1.tokenBalance).to.equal(INITIAL_AMOUNT);
      expect(BalanceOf_A_Dividend_2.tokenBalance).to.equal(0);
      expect(BalanceOf_A_Dividend_1.decimals).to.equal(DECIMALS_INIT);

      await asset.connect(signer_A).triggerPendingScheduledCrossOrderedTasks();

      scheduledTasksCount = await asset.scheduledCrossOrderedTaskCount();
      scheduledTasks = await asset.getScheduledCrossOrderedTasks(0, 100);

      expect(scheduledTasksCount).to.equal(2);
      expect(scheduledTasks.length).to.equal(scheduledTasksCount);
      expect(scheduledTasks[0].scheduledTimestamp).to.equal(balanceAdjustmentExecutionDateInSeconds_2);
      expect(scheduledTasks[1].scheduledTimestamp).to.equal(dividendsRecordDateInSeconds_2);
      expect(scheduledTasks[0].data).to.equal(ATS_TASK.BALANCE_ADJUSTMENT);
      expect(scheduledTasks[1].data).to.equal(ATS_TASK.SNAPSHOT);

      await asset.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds_2 + 1);
      BalanceOf_A_Dividend_2 = await asset.getDividendFor(1, signer_A.address);

      expect(BalanceOf_A_Dividend_2.tokenBalance).to.equal(INITIAL_AMOUNT * balanceAdjustmentsFactor_1);
      expect(BalanceOf_A_Dividend_2.decimals).to.equal(DECIMALS_INIT + balanceAdjustmentsDecimals_1);

      await asset.connect(signer_A).triggerScheduledCrossOrderedTasks(100);

      scheduledTasksCount = await asset.scheduledCrossOrderedTaskCount();
      scheduledTasks = await asset.getScheduledCrossOrderedTasks(0, 100);

      expect(scheduledTasksCount).to.equal(0);
      expect(scheduledTasks.length).to.equal(scheduledTasksCount);
    });

    describe("Sub-task fires at exact scheduled timestamp", () => {
      const taskTimestamp = dateToUnixTimestamp("2030-01-01T00:00:15Z");
      const executionDate = dateToUnixTimestamp("2030-01-01T00:02:30Z");

      beforeEach(async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);
      });

      it("GIVEN a snapshot sub-task scheduled at T WHEN block.timestamp equals T THEN SnapshotTriggered is emitted", async () => {
        await asset.connect(signer_C).setDividend({
          recordDate: taskTimestamp.toString(),
          executionDate: executionDate.toString(),
          amount: 1,
          amountDecimals: 2,
        });

        await asset.changeSystemTimestamp(taskTimestamp);

        await expect(asset.connect(signer_A).triggerPendingScheduledCrossOrderedTasks()).to.emit(
          asset,
          "SnapshotTriggered",
        );
      });

      it("GIVEN a balance adjustment sub-task scheduled at T WHEN block.timestamp equals T THEN sub-task is removed from the queue", async () => {
        await asset.connect(signer_C).setScheduledBalanceAdjustment({
          executionDate: taskTimestamp.toString(),
          factor: 1,
          decimals: 2,
        });

        expect(await asset.getPendingBalanceAdjustmentCount(false)).to.equal(1);

        await asset.changeSystemTimestamp(taskTimestamp);
        await asset.connect(signer_A).triggerPendingScheduledCrossOrderedTasks();

        expect(await asset.getPendingBalanceAdjustmentCount(false)).to.equal(0);
      });
    });

    describe("Deactivated", () => {
      it("GIVEN a deactivated asset WHEN triggerPendingScheduledCrossOrderedTasks THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(asset.connect(signer_A).triggerPendingScheduledCrossOrderedTasks()).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN triggerScheduledCrossOrderedTasks THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(asset.connect(signer_A).triggerScheduledCrossOrderedTasks(0)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });
    });

    describe("initializeScheduledCrossOrderedTasks", () => {
      it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeScheduledCrossOrderedTasks is called THEN it reverts with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_B).initializeScheduledCrossOrderedTasks()).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN an already-initialised facet WHEN initializeScheduledCrossOrderedTasks is called again THEN it reverts with FacetAlreadyRegistered", async () => {
        await expect(asset.connect(signer_A).initializeScheduledCrossOrderedTasks()).to.be.revertedWithCustomError(
          asset,
          "FacetAlreadyRegistered",
        );
      });

      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeScheduledCrossOrderedTasks is called THEN it emits ScheduledCrossOrderedTasksInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.scheduledCrossOrderedTasks);
        await expect(asset.connect(signer_A).initializeScheduledCrossOrderedTasks()).to.emit(
          asset,
          "ScheduledCrossOrderedTasksInitialized",
        );
      });
    });
  });

  describe("Scheduled Tasks Failure Recovery", () => {
    let asset: IAssetMock;
    let deployer: HardhatEthersSigner;

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      deployer = ctx.deployer;
      await asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, deployer.address);
      await asset.grantRole(ATS_ROLES.ROLE_INTEREST_RATE_MANAGER, deployer.address);
    });

    it("GIVEN a crossOrdered snapshot task WHEN triggered successfully THEN queue drains and no TaskExecutionFailed is emitted", async () => {
      const currentTimestamp = await getDltTimestamp();
      const recordDate = currentTimestamp + TIME_PERIODS_S.DAY;

      await asset.connect(deployer).setDividend({
        recordDate: recordDate.toString(),
        executionDate: (recordDate + TIME_PERIODS_S.DAY).toString(),
        amount: 1,
        amountDecimals: 2,
      });

      expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(1);

      await asset.changeSystemTimestamp(recordDate + 1);

      await asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks();

      expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(0);
    });

    it("GIVEN two crossOrdered snapshot tasks WHEN all triggered successfully THEN queue fully drains", async () => {
      const currentTimestamp = await getDltTimestamp();
      const recordDate1 = currentTimestamp + TIME_PERIODS_S.DAY;
      const recordDate2 = currentTimestamp + TIME_PERIODS_S.DAY * 2;

      await asset.connect(deployer).setDividend({
        recordDate: recordDate1.toString(),
        executionDate: (recordDate1 + TIME_PERIODS_S.DAY).toString(),
        amount: 1,
        amountDecimals: 2,
      });
      await asset.connect(deployer).setDividend({
        recordDate: recordDate2.toString(),
        executionDate: (recordDate2 + TIME_PERIODS_S.DAY).toString(),
        amount: 1,
        amountDecimals: 2,
      });

      expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(2);

      await asset.changeSystemTimestamp(recordDate2 + 1);

      await asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks();

      expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(0);
    });

    it("GIVEN three due crossOrdered tasks WHEN triggered in a single call THEN all three are processed and queue is empty", async () => {
      const currentTimestamp = await getDltTimestamp();
      const recordDate1 = currentTimestamp + TIME_PERIODS_S.DAY;
      const recordDate2 = currentTimestamp + TIME_PERIODS_S.DAY * 2;
      const recordDate3 = currentTimestamp + TIME_PERIODS_S.DAY * 3;

      await asset.connect(deployer).setDividend({
        recordDate: recordDate1.toString(),
        executionDate: (recordDate1 + TIME_PERIODS_S.DAY).toString(),
        amount: 1,
        amountDecimals: 2,
      });
      await asset.connect(deployer).setDividend({
        recordDate: recordDate2.toString(),
        executionDate: (recordDate2 + TIME_PERIODS_S.DAY).toString(),
        amount: 1,
        amountDecimals: 2,
      });
      await asset.connect(deployer).setDividend({
        recordDate: recordDate3.toString(),
        executionDate: (recordDate3 + TIME_PERIODS_S.DAY).toString(),
        amount: 1,
        amountDecimals: 2,
      });

      expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(3);

      await asset.changeSystemTimestamp(recordDate3 + 1);

      await asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks();

      expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(0);
      expect(await asset.scheduledSnapshotCount(false)).to.equal(0);
    });

    // ─── Failure path: hardhat_setCode injection ───────────────────────────────
    //
    // MockScheduledTasksDispatchOps is swapped in at the real library address via
    // hardhat_setCode. Its selector does not match the real library's, so any
    // DELEGATECALL to it reverts — simulating a failing dispatch without touching
    // production code.

    let _snapBeforeInject: Awaited<ReturnType<typeof takeSnapshot>> | undefined;

    afterEach(async () => {
      if (_snapBeforeInject) {
        await _snapBeforeInject.restore();
        _snapBeforeInject = undefined;
      }
    });

    async function injectMockDispatch() {
      _snapBeforeInject = await takeSnapshot();
      const MockFactory = await ethers.getContractFactory("MockScheduledTasksDispatchOps");
      const mock = await MockFactory.deploy();
      const mockBytecode = await ethers.provider.getCode(await mock.getAddress());
      const libAddr = getOrchestratorLibraryAddresses().scheduledTasksDispatchOps;
      await ethers.provider.send("hardhat_setCode", [libAddr, mockBytecode]);
    }

    it("GIVEN failing crossOrdered SNAPSHOT task WHEN triggered THEN transaction reverts and queue not drained", async () => {
      await injectMockDispatch();

      const currentTimestamp = await getDltTimestamp();
      const recordDate = currentTimestamp + TIME_PERIODS_S.DAY;
      await asset.connect(deployer).setDividend({
        recordDate: recordDate.toString(),
        executionDate: (recordDate + TIME_PERIODS_S.DAY).toString(),
        amount: 1,
        amountDecimals: 2,
      });

      await asset.changeSystemTimestamp(recordDate + 1);

      await expect(asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks()).to.be.reverted;

      expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(1);
      expect(await asset.scheduledSnapshotCount(true)).to.equal(1);
    });

    it("GIVEN failing crossOrdered BALANCE_ADJUSTMENT task WHEN triggered THEN transaction reverts and queue not drained", async () => {
      await injectMockDispatch();

      const currentTimestamp = await getDltTimestamp();
      const executionDate = currentTimestamp + TIME_PERIODS_S.DAY;
      await asset.connect(deployer).setScheduledBalanceAdjustment({
        executionDate: executionDate.toString(),
        factor: 1,
        decimals: 2,
      });

      await asset.changeSystemTimestamp(executionDate + 1);

      await expect(asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks()).to.be.reverted;

      expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(1);
      expect((await asset.getScheduledBalanceAdjustments(0, 10, true)).length).to.equal(1);
    });

    it("GIVEN failing crossOrdered COUPON_LISTING task WHEN triggered THEN transaction reverts and queue not drained", async () => {
      await asset.setCouponRateType(INTEREST_RATE_TYPE.FIXED);

      await injectMockDispatch();

      const currentTimestamp = await getDltTimestamp();
      const fixingDate = currentTimestamp + TIME_PERIODS_S.DAY;
      await asset.connect(deployer).setCoupon({
        recordDate: fixingDate.toString(),
        executionDate: (fixingDate + TIME_PERIODS_S.DAY).toString(),
        rate: 0,
        rateDecimals: 0,
        startDate: currentTimestamp.toString(),
        endDate: fixingDate.toString(),
        fixingDate: fixingDate.toString(),
        rateStatus: 0,
      });

      const crossOrderedBefore = await asset.scheduledCrossOrderedTaskCount();
      const couponListingBefore = await asset.scheduledCouponListingCount(true);

      await asset.changeSystemTimestamp(fixingDate + 1);

      await expect(asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks()).to.be.reverted;

      expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(crossOrderedBefore);
      expect(await asset.scheduledCouponListingCount(true)).to.equal(couponListingBefore);
    });

    it("GIVEN two failing crossOrdered tasks WHEN triggered THEN transaction reverts and queue not drained", async () => {
      await injectMockDispatch();

      const currentTimestamp = await getDltTimestamp();
      const recordDate1 = currentTimestamp + TIME_PERIODS_S.DAY;
      const recordDate2 = currentTimestamp + TIME_PERIODS_S.DAY * 2;

      await asset.connect(deployer).setDividend({
        recordDate: recordDate1.toString(),
        executionDate: (recordDate1 + TIME_PERIODS_S.DAY).toString(),
        amount: 1,
        amountDecimals: 2,
      });
      await asset.connect(deployer).setDividend({
        recordDate: recordDate2.toString(),
        executionDate: (recordDate2 + TIME_PERIODS_S.DAY).toString(),
        amount: 2,
        amountDecimals: 2,
      });

      expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(2);

      await asset.changeSystemTimestamp(recordDate2 + 1);

      await expect(asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks()).to.be.reverted;

      expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(2);
    });

    describe("nonOperational", () => {
      it("GIVEN non-operational asset WHEN triggerPendingScheduledCrossOrderedTasks THEN reverts with AssetNotOperational", async () => {
        await asset.forceNonOperational();
        await expect(asset.triggerPendingScheduledCrossOrderedTasks()).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });

      it("GIVEN non-operational asset WHEN triggerScheduledCrossOrderedTasks THEN reverts with AssetNotOperational", async () => {
        await asset.forceNonOperational();
        await expect(asset.triggerScheduledCrossOrderedTasks(0)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });
    });

    describe("_triggerOneSubTask coverage", () => {
      it("GIVEN a cross-ordered task with an unknown sub-task type WHEN triggered THEN it completes without error", async () => {
        const currentTimestamp = await getDltTimestamp();
        const taskTimestamp = currentTimestamp + TIME_PERIODS_S.DAY;

        await asset.forceAddCrossOrderedTask(taskTimestamp, ethers.ZeroHash);

        expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(1);

        await asset.changeSystemTimestamp(taskTimestamp + 1);

        await asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks();

        expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(0);
      });

      it("GIVEN a cross-ordered balance-adjustment task with an empty sub-queue WHEN triggered THEN it completes without error", async () => {
        const currentTimestamp = await getDltTimestamp();
        const taskTimestamp = currentTimestamp + TIME_PERIODS_S.DAY;

        await asset.forceAddCrossOrderedTask(taskTimestamp, ATS_TASK.BALANCE_ADJUSTMENT);

        expect((await asset.getScheduledBalanceAdjustments(0, 10, true)).length).to.equal(0);

        await asset.changeSystemTimestamp(taskTimestamp + 1);

        await asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks();

        expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(0);
      });

      it("GIVEN a cross-ordered task whose balance-adjustment sub-task is not yet due WHEN triggered THEN sub-task remains in queue", async () => {
        const currentTimestamp = await getDltTimestamp();
        const crossOrderedTimestamp = currentTimestamp + TIME_PERIODS_S.DAY;
        const subTaskTimestamp = crossOrderedTimestamp + TIME_PERIODS_S.DAY;

        await asset.forceAddCrossOrderedTask(crossOrderedTimestamp, ATS_TASK.BALANCE_ADJUSTMENT);
        await asset.forceAddRawBalanceAdjustmentSubTask(subTaskTimestamp);

        expect((await asset.getScheduledBalanceAdjustments(0, 10, true)).length).to.equal(1);

        await asset.changeSystemTimestamp(crossOrderedTimestamp + 1);

        await asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks();

        expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(0);
        expect((await asset.getScheduledBalanceAdjustments(0, 10, true)).length).to.equal(1);
      });

      it("GIVEN a KPI-linked coupon WHEN triggered at fixing date THEN coupon listing sub-task is successfully processed", async () => {
        await asset.connect(deployer).setCouponRateType(INTEREST_RATE_TYPE.KPI_LINKED);

        const currentTimestamp = await getDltTimestamp();
        const fixingDate = currentTimestamp + TIME_PERIODS_S.DAY;

        await asset.connect(deployer).setCoupon({
          recordDate: fixingDate.toString(),
          executionDate: (fixingDate + TIME_PERIODS_S.DAY).toString(),
          rate: 0,
          rateDecimals: 0,
          startDate: currentTimestamp.toString(),
          endDate: fixingDate.toString(),
          fixingDate: fixingDate.toString(),
          rateStatus: 0,
        });

        const couponListingBefore = await asset.scheduledCouponListingCount(true);

        expect(couponListingBefore).to.be.gt(0);

        await asset.changeSystemTimestamp(fixingDate + 1);

        await asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks();

        expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(0);
        expect(await asset.scheduledCouponListingCount(true)).to.be.lt(couponListingBefore);
      });
    });
  });
}
