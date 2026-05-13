// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import {
  ZERO,
  EMPTY_STRING,
  dateToUnixTimestamp,
  ATS_ROLES,
  ATS_TASK,
  EQUITY_CONFIG_ID,
  TIME_PERIODS_S,
} from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, getDltTimestamp, MAX_UINT256 } from "@test";
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
        role: ATS_ROLES.PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.SSI_MANAGER_ROLE,
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
    await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

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
});

describe("Scheduled Tasks Failure Recovery", () => {
  const CROSS_ORDERED_CB = ethers.encodeBytes32String("crossOrdered");

  async function addFailingMockToDiamond(base: Awaited<ReturnType<typeof deployEquityTokenFixture>>) {
    const { blr, deployer, diamond } = base;

    const mockFactory = await ethers.getContractFactory("MockedFailingScheduledTaskCallback", deployer);
    const mockContract = await mockFactory.deploy();
    await mockContract.waitForDeployment();
    const mockAddress = await mockContract.getAddress();

    const resolverKey = await mockContract.getStaticResolverKey();

    await blr.registerBusinessLogics([
      {
        businessLogicKey: resolverKey,
        businessLogicAddress: mockAddress,
      },
    ]);

    const latestMockVersion = Number(await blr.getLatestVersion(resolverKey));

    const asset = await ethers.getContractAt("IAsset", diamond.target);
    const facetIds: string[] = [...(await asset.getFacetIds())];

    const latestVersions = await blr.getLatestVersions(facetIds);
    const facetConfigs = facetIds.map((id: string, i: number) => ({
      id,
      version: id === resolverKey ? latestMockVersion : Number(latestVersions[i]),
    }));

    const BATCH_SIZE = 20;
    for (let i = 0; i < facetConfigs.length; i += BATCH_SIZE) {
      const batch = facetConfigs.slice(i, i + BATCH_SIZE);
      const isLastBatch = i + BATCH_SIZE >= facetConfigs.length;
      await blr.createBatchConfiguration(EQUITY_CONFIG_ID, batch, isLastBatch);
    }

    const newConfigVersion = Number(await blr.getLatestVersionByConfiguration(EQUITY_CONFIG_ID));
    await asset.connect(deployer).updateConfigVersion(newConfigVersion);

    return {
      ...base,
      asset,
      mock: await ethers.getContractAt("MockedFailingScheduledTaskCallback", diamond.target, deployer),
    };
  }

  async function deployWithMock() {
    const base = await deployEquityTokenFixture();
    await base.asset.grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, base.deployer.address);
    return addFailingMockToDiamond(base);
  }

  it("GIVEN executeScheduledTaskCallback WHEN called directly by an external account THEN reverts with UnauthorizedSelfCall", async () => {
    const { mock, deployer } = await loadFixture(deployWithMock);

    await expect(
      mock.connect(deployer).executeScheduledTaskCallback(CROSS_ORDERED_CB, 0, 0, {
        scheduledTimestamp: 0,
        data: "0x",
      }),
    ).to.be.revertedWithCustomError(mock, "UnauthorizedSelfCall");
  });

  it("GIVEN a mock configured to fail WHEN a task is triggered THEN task is removed from queue AND TaskExecutionFailed is emitted", async () => {
    const { mock, asset, deployer } = await loadFixture(deployWithMock);

    await mock.setFailForCallbackType(CROSS_ORDERED_CB);

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

    await expect(asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks())
      .to.emit(asset, "TaskExecutionFailed")
      .withArgs(ATS_TASK.SNAPSHOT, CROSS_ORDERED_CB, recordDate);

    expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(0);
  });

  it("GIVEN two tasks configured to fail WHEN all are triggered THEN queue fully drains AND TaskExecutionFailed is emitted for each", async () => {
    const { mock, asset, deployer } = await loadFixture(deployWithMock);

    await mock.setFailForCallbackType(CROSS_ORDERED_CB);

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

    const tx = asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks();
    await expect(tx).to.emit(asset, "TaskExecutionFailed").withArgs(ATS_TASK.SNAPSHOT, CROSS_ORDERED_CB, recordDate2);
    await expect(tx).to.emit(asset, "TaskExecutionFailed").withArgs(ATS_TASK.SNAPSHOT, CROSS_ORDERED_CB, recordDate1);

    expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(0);
  });

  it("GIVEN a mock NOT configured to fail WHEN a task is triggered THEN task executes normally without TaskExecutionFailed", async () => {
    const { asset, deployer } = await loadFixture(deployWithMock);

    const currentTimestamp = await getDltTimestamp();
    const recordDate = currentTimestamp + TIME_PERIODS_S.DAY;

    await asset.connect(deployer).setDividend({
      recordDate: recordDate.toString(),
      executionDate: (recordDate + TIME_PERIODS_S.DAY).toString(),
      amount: 1,
      amountDecimals: 2,
    });

    await asset.changeSystemTimestamp(recordDate + 1);

    await expect(asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks()).to.not.emit(
      asset,
      "TaskExecutionFailed",
    );

    expect(await asset.scheduledCrossOrderedTaskCount()).to.equal(0);
  });
});
