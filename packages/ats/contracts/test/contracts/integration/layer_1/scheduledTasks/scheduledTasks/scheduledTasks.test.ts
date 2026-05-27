// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ZERO, EMPTY_STRING, dateToUnixTimestamp, ATS_ROLES, ATS_TASK, TIME_PERIODS_S } from "@scripts";
import { getOrchestratorLibraryAddresses } from "@scripts/domain";
import { loadFixture, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, deployBondKpiLinkedRateTokenFixture, getDltTimestamp, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const INITIAL_AMOUNT = 1000;
const DECIMALS_INIT = 6;

describe("Scheduled Tasks Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture();
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
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureSinglePartition);
  });

  it("GIVEN a paused Token WHEN triggerTasks THEN transaction fails with IsPaused", async () => {
    // Pausing the token
    await asset.connect(signer_B).pause();

    // trigger scheduled snapshots
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
    // Granting Role to account C
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

    await asset.connect(signer_B).issueByPartition({
      partition: _PARTITION_ID_1,
      tokenHolder: signer_A.address,
      value: INITIAL_AMOUNT,
      data: "0x",
    });

    // set dividend
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

    // check schedled tasks

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

    // AFTER FIRST SCHEDULED TASKS ------------------------------------------------------------------
    await asset.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds_1 + 1);

    // Checking dividends For before triggering from the queue
    const BalanceOf_A_Dividend_1 = await asset.getDividendFor(2, signer_A.address);
    let BalanceOf_A_Dividend_2 = await asset.getDividendFor(1, signer_A.address);

    expect(BalanceOf_A_Dividend_1.tokenBalance).to.equal(INITIAL_AMOUNT);
    expect(BalanceOf_A_Dividend_2.tokenBalance).to.equal(0);
    expect(BalanceOf_A_Dividend_1.decimals).to.equal(DECIMALS_INIT);

    // triggering from the queue
    await asset.connect(signer_A).triggerPendingScheduledCrossOrderedTasks();

    scheduledTasksCount = await asset.scheduledCrossOrderedTaskCount();

    scheduledTasks = await asset.getScheduledCrossOrderedTasks(0, 100);

    expect(scheduledTasksCount).to.equal(2);
    expect(scheduledTasks.length).to.equal(scheduledTasksCount);
    expect(scheduledTasks[0].scheduledTimestamp).to.equal(balanceAdjustmentExecutionDateInSeconds_2);
    expect(scheduledTasks[1].scheduledTimestamp).to.equal(dividendsRecordDateInSeconds_2);
    expect(scheduledTasks[0].data).to.equal(ATS_TASK.BALANCE_ADJUSTMENT);
    expect(scheduledTasks[1].data).to.equal(ATS_TASK.SNAPSHOT);

    // AFTER SECOND SCHEDULED SNAPSHOTS ------------------------------------------------------------------
    await asset.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds_2 + 1);
    // Checking dividends For before triggering from the queue
    BalanceOf_A_Dividend_2 = await asset.getDividendFor(1, signer_A.address);

    expect(BalanceOf_A_Dividend_2.tokenBalance).to.equal(INITIAL_AMOUNT * balanceAdjustmentsFactor_1);
    expect(BalanceOf_A_Dividend_2.decimals).to.equal(DECIMALS_INIT + balanceAdjustmentsDecimals_1);

    // triggering from the queue
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

      expect(await asset.getPendingBalanceAdjustmentCount()).to.equal(1);

      await asset.changeSystemTimestamp(taskTimestamp);
      await asset.connect(signer_A).triggerPendingScheduledCrossOrderedTasks();

      expect(await asset.getPendingBalanceAdjustmentCount()).to.equal(0);
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN triggerPendingScheduledCrossOrderedTasks THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).triggerPendingScheduledCrossOrderedTasks(),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });

    it("GIVEN a deactivated asset WHEN triggerScheduledCrossOrderedTasks THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).triggerScheduledCrossOrderedTasks(0),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });
});

describe("Scheduled Tasks Failure Recovery", () => {
  async function deployWithCorporateActionRole() {
    const base = await deployEquityTokenFixture();
    await base.asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, base.deployer.address);
    return base;
  }

  it("GIVEN a crossOrdered snapshot task WHEN triggered successfully THEN queue drains and no TaskExecutionFailed is emitted", async () => {
    const { asset, deployer } = await loadFixture(deployWithCorporateActionRole);

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

    await expect(asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks()).to.not.emit(
      asset,
      "TaskExecutionFailed",
    );

    expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(0);
  });

  it("GIVEN two crossOrdered snapshot tasks WHEN all triggered successfully THEN queue fully drains and no TaskExecutionFailed is emitted", async () => {
    const { asset, deployer } = await loadFixture(deployWithCorporateActionRole);

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

    await expect(asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks()).to.not.emit(
      asset,
      "TaskExecutionFailed",
    );

    expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(0);
  });

  it("GIVEN three due crossOrdered tasks WHEN triggered in a single call THEN all three are processed and queue is empty", async () => {
    // Regression test for FIND-047: pos and scheduledTasksLength were dead params
    // passed stale to ScheduledTasksDispatchOps.execute(). Verifies that removing
    // them does not break multi-task processing across a full loop iteration.
    const { asset, deployer } = await loadFixture(deployWithCorporateActionRole);

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

    await expect(asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks()).to.not.emit(
      asset,
      "TaskExecutionFailed",
    );

    expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(0);
    expect(await asset.scheduledSnapshotCount(false)).to.equal(0);
  });

  // ─── Failure path: hardhat_setCode injection ───────────────────────────────
  //
  // MockScheduledTasksDispatchOps is swapped in at the real library address via
  // hardhat_setCode. It reads _FAIL_TYPE_SLOT from Diamond's storage (DELEGATECALL
  // context) and reverts when callbackType matches the configured value.
  //
  // This lets us test _cancelPendingSubTaskAction without touching production code.

  const FAIL_TYPE_SLOT = "0xdead000000000000000000000000000000000000000000000000000000001337";

  // Snapshot taken just before mock injection so afterEach can restore real bytecode.
  // Prevents hardhat_setCode from persisting into loadFixture snapshots of other fixtures.
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

  async function deployEquityWithCorporateActionRole() {
    const base = await deployEquityTokenFixture();
    await base.asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, base.deployer.address);
    return { ...base, diamondAddress: base.diamond.target as string };
  }

  async function deployBondWithCorporateActionRole() {
    const base = await deployBondKpiLinkedRateTokenFixture();
    await base.asset.grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, base.deployer.address);
    return { ...base, diamondAddress: base.diamond.target as string };
  }

  it("GIVEN failing crossOrdered SNAPSHOT task WHEN triggered THEN snapshot action cancelled and TaskExecutionFailed emitted", async () => {
    const { asset, deployer, diamondAddress } = await loadFixture(deployEquityWithCorporateActionRole);
    await injectMockDispatch();

    const currentTimestamp = await getDltTimestamp();
    const recordDate = currentTimestamp + TIME_PERIODS_S.DAY;
    await asset.connect(deployer).setDividend({
      recordDate: recordDate.toString(),
      executionDate: (recordDate + TIME_PERIODS_S.DAY).toString(),
      amount: 1,
      amountDecimals: 2,
    });

    await ethers.provider.send("hardhat_setStorageAt", [
      diamondAddress,
      FAIL_TYPE_SLOT,
      ethers.encodeBytes32String("crossOrdered"),
    ]);

    await asset.changeSystemTimestamp(recordDate + 1);

    await expect(asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks())
      .to.emit(asset, "TaskExecutionFailed")
      .withArgs(ATS_TASK.SNAPSHOT, ethers.encodeBytes32String("crossOrdered"), recordDate);

    expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(0);
    expect(await asset.scheduledSnapshotCount(true)).to.equal(1);

    const snapshots = await asset.getScheduledSnapshots(0, 10, true);
    const snapshotActionId = ethers.AbiCoder.defaultAbiCoder().decode(["bytes32"], snapshots[0].data)[0];
    const [, , , isDisabled] = await asset.getCorporateAction(snapshotActionId);
    expect(isDisabled).to.be.true;
  });

  it("GIVEN failing crossOrdered BALANCE_ADJUSTMENT task WHEN triggered THEN balance adjustment action cancelled and TaskExecutionFailed emitted", async () => {
    const { asset, deployer, diamondAddress } = await loadFixture(deployEquityWithCorporateActionRole);
    await injectMockDispatch();

    const currentTimestamp = await getDltTimestamp();
    const executionDate = currentTimestamp + TIME_PERIODS_S.DAY;
    await asset.connect(deployer).setScheduledBalanceAdjustment({
      executionDate: executionDate.toString(),
      factor: 1,
      decimals: 2,
    });

    await ethers.provider.send("hardhat_setStorageAt", [
      diamondAddress,
      FAIL_TYPE_SLOT,
      ethers.encodeBytes32String("crossOrdered"),
    ]);

    await asset.changeSystemTimestamp(executionDate + 1);

    await expect(asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks())
      .to.emit(asset, "TaskExecutionFailed")
      .withArgs(ATS_TASK.BALANCE_ADJUSTMENT, ethers.encodeBytes32String("crossOrdered"), executionDate);

    expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(0);

    const balanceAdjustments = await asset.getScheduledBalanceAdjustments(0, 10, true);
    expect(balanceAdjustments.length).to.equal(1);

    const balanceAdjustmentActionId = ethers.AbiCoder.defaultAbiCoder().decode(
      ["bytes32"],
      balanceAdjustments[0].data,
    )[0];
    const [, , , isDisabled] = await asset.getCorporateAction(balanceAdjustmentActionId);
    expect(isDisabled).to.be.true;
  });

  it("GIVEN failing crossOrdered COUPON_LISTING task WHEN triggered THEN coupon listing action cancelled and TaskExecutionFailed emitted", async () => {
    const { asset, deployer, diamondAddress } = await loadFixture(deployBondWithCorporateActionRole);
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

    await ethers.provider.send("hardhat_setStorageAt", [
      diamondAddress,
      FAIL_TYPE_SLOT,
      ethers.encodeBytes32String("crossOrdered"),
    ]);

    await asset.changeSystemTimestamp(fixingDate + 1);

    await expect(asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks())
      .to.emit(asset, "TaskExecutionFailed")
      .withArgs(ATS_TASK.COUPON_LISTING, ethers.encodeBytes32String("crossOrdered"), fixingDate);

    expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(0);
    expect(await asset.scheduledCouponListingCount(true)).to.equal(1);

    const couponListings = await asset.getScheduledCouponListing(0, 10, true);
    const couponListingActionId = ethers.AbiCoder.defaultAbiCoder().decode(["bytes32"], couponListings[0].data)[0];
    const [, , , isDisabled] = await asset.getCorporateAction(couponListingActionId);
    expect(isDisabled).to.be.true;
  });

  it("GIVEN two failing crossOrdered tasks WHEN triggered THEN queue fully drains and TaskExecutionFailed emitted for each", async () => {
    const { asset, deployer, diamondAddress } = await loadFixture(deployEquityWithCorporateActionRole);
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

    await ethers.provider.send("hardhat_setStorageAt", [
      diamondAddress,
      FAIL_TYPE_SLOT,
      ethers.encodeBytes32String("crossOrdered"),
    ]);

    await asset.changeSystemTimestamp(recordDate2 + 1);

    const tx = await asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks();
    const receipt = await tx.wait();
    const failedEvents = receipt!.logs.filter((log) => {
      try {
        return asset.interface.parseLog(log)?.name === "TaskExecutionFailed";
      } catch {
        return false;
      }
    });

    expect(failedEvents.length).to.equal(2);
    expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(0);
  });
});
