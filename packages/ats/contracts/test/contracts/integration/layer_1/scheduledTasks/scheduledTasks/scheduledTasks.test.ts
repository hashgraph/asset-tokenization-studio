// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ZERO, EMPTY_STRING, dateToUnixTimestamp, ATS_ROLES, ATS_TASK } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, MAX_UINT256 } from "@test";
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
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
    ]);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureSinglePartition);
  });

  it("GIVEN a paused Token WHEN triggerTasks THEN transaction fails with TokenIsPaused", async () => {
    // Pausing the token
    await asset.connect(signer_B).pause();

    // trigger scheduled snapshots
    await expect(asset.connect(signer_C).triggerPendingScheduledCrossOrderedTasks()).to.be.rejectedWith(
      "TokenIsPaused",
    );
    await expect(asset.connect(signer_C).triggerScheduledCrossOrderedTasks(1)).to.be.rejectedWith("TokenIsPaused");
  });

  it("GIVEN a token WHEN triggerTasks THEN transaction succeeds", async () => {
    // Granting Role to account C
    await asset.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

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
