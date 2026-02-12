// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  type ResolverProxy,
  type EquityUSAFacet,
  type ScheduledSnapshotsFacet,
  type AccessControl,
  ScheduledCrossOrderedTasksFacet,
  TimeTravelFacet,
} from "@contract-types";
import { dateToUnixTimestamp, ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";
import { executeRbac } from "@test";

describe("Scheduled Snapshots Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let equityFacet: EquityUSAFacet;
  let scheduledSnapshotsFacet: ScheduledSnapshotsFacet;
  let scheduledTasksFacet: ScheduledCrossOrderedTasksFacet;
  let accessControlFacet: AccessControl;
  let timeTravelFacet: TimeTravelFacet;

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_B.address],
      },
    ]);

    await setFacets(diamond);
  }

  async function setFacets(diamond: ResolverProxy) {
    accessControlFacet = await ethers.getContractAt("AccessControlFacet", diamond.target, signer_A);
    equityFacet = await ethers.getContractAt("EquityUSAFacet", diamond.target, signer_A);
    scheduledSnapshotsFacet = await ethers.getContractAt("ScheduledSnapshotsFacet", diamond.target, signer_A);
    scheduledTasksFacet = await ethers.getContractAt("ScheduledCrossOrderedTasksFacet", diamond.target, signer_A);
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.target, signer_A);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureSinglePartition);
  });

  it("GIVEN a token WHEN triggerSnapshots THEN transaction succeeds", async () => {
    await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

    // set dividend
    const dividendsRecordDateInSeconds_1 = dateToUnixTimestamp("2030-01-01T00:00:06Z");
    const dividendsRecordDateInSeconds_2 = dateToUnixTimestamp("2030-01-01T00:00:12Z");
    const dividendsRecordDateInSeconds_3 = dateToUnixTimestamp("2030-01-01T00:00:18Z");
    const dividendsExecutionDateInSeconds = dateToUnixTimestamp("2030-01-01T00:01:00Z");
    const dividendsAmountPerEquity = 1;
    const dividendAmountDecimalsPerEquity = 3;
    const dividendData_1 = {
      recordDate: dividendsRecordDateInSeconds_1.toString(),
      executionDate: dividendsExecutionDateInSeconds.toString(),
      amount: dividendsAmountPerEquity,
      amountDecimals: dividendAmountDecimalsPerEquity,
    };
    const dividendData_2 = {
      recordDate: dividendsRecordDateInSeconds_2.toString(),
      executionDate: dividendsExecutionDateInSeconds.toString(),
      amount: dividendsAmountPerEquity,
      amountDecimals: dividendAmountDecimalsPerEquity,
    };
    const dividendData_3 = {
      recordDate: dividendsRecordDateInSeconds_3.toString(),
      executionDate: dividendsExecutionDateInSeconds.toString(),
      amount: dividendsAmountPerEquity,
      amountDecimals: dividendAmountDecimalsPerEquity,
    };
    await equityFacet.connect(signer_C).setDividends(dividendData_2);
    await equityFacet.connect(signer_C).setDividends(dividendData_3);
    await equityFacet.connect(signer_C).setDividends(dividendData_1);

    const dividend_2_Id = "0x0000000000000000000000000000000000000000000000000000000000000001";
    const dividend_3_Id = "0x0000000000000000000000000000000000000000000000000000000000000002";
    const dividend_1_Id = "0x0000000000000000000000000000000000000000000000000000000000000003";

    // check schedled snapshots
    let scheduledSnapshotCount = await scheduledSnapshotsFacet.scheduledSnapshotCount();
    let scheduledSnapshots = await scheduledSnapshotsFacet.getScheduledSnapshots(0, 100);

    expect(scheduledSnapshotCount).to.equal(3);
    expect(scheduledSnapshots.length).to.equal(scheduledSnapshotCount);
    expect(scheduledSnapshots[0].scheduledTimestamp).to.equal(dividendsRecordDateInSeconds_3);
    expect(scheduledSnapshots[0].data).to.equal(dividend_3_Id);
    expect(scheduledSnapshots[1].scheduledTimestamp).to.equal(dividendsRecordDateInSeconds_2);
    expect(scheduledSnapshots[1].data).to.equal(dividend_2_Id);
    expect(scheduledSnapshots[2].scheduledTimestamp).to.equal(dividendsRecordDateInSeconds_1);
    expect(scheduledSnapshots[2].data).to.equal(dividend_1_Id);

    // AFTER FIRST SCHEDULED SNAPSHOTS ------------------------------------------------------------------
    await timeTravelFacet.changeSystemTimestamp(dividendsRecordDateInSeconds_1 + 1);
    await expect(scheduledTasksFacet.connect(signer_A).triggerPendingScheduledCrossOrderedTasks())
      .to.emit(scheduledSnapshotsFacet, "SnapshotTriggered")
      .withArgs(1);

    scheduledSnapshotCount = await scheduledSnapshotsFacet.scheduledSnapshotCount();
    scheduledSnapshots = await scheduledSnapshotsFacet.getScheduledSnapshots(0, 100);

    expect(scheduledSnapshotCount).to.equal(2);
    expect(scheduledSnapshots.length).to.equal(scheduledSnapshotCount);
    expect(scheduledSnapshots[0].scheduledTimestamp).to.equal(dividendsRecordDateInSeconds_3);
    expect(scheduledSnapshots[0].data).to.equal(dividend_3_Id);
    expect(scheduledSnapshots[1].scheduledTimestamp).to.equal(dividendsRecordDateInSeconds_2);
    expect(scheduledSnapshots[1].data).to.equal(dividend_2_Id);

    // AFTER SECOND SCHEDULED SNAPSHOTS ------------------------------------------------------------------
    await timeTravelFacet.changeSystemTimestamp(dividendsRecordDateInSeconds_2 + 1);
    await expect(scheduledTasksFacet.connect(signer_A).triggerScheduledCrossOrderedTasks(100))
      .to.emit(scheduledSnapshotsFacet, "SnapshotTriggered")
      .withArgs(2);

    scheduledSnapshotCount = await scheduledSnapshotsFacet.scheduledSnapshotCount();
    scheduledSnapshots = await scheduledSnapshotsFacet.getScheduledSnapshots(0, 100);

    expect(scheduledSnapshotCount).to.equal(1);
    expect(scheduledSnapshots.length).to.equal(scheduledSnapshotCount);
    expect(scheduledSnapshots[0].scheduledTimestamp).to.equal(dividendsRecordDateInSeconds_3);
    expect(scheduledSnapshots[0].data).to.equal(dividend_3_Id);

    // AFTER SECOND SCHEDULED SNAPSHOTS ------------------------------------------------------------------
    await timeTravelFacet.changeSystemTimestamp(dividendsRecordDateInSeconds_3 + 1);
    await expect(scheduledTasksFacet.connect(signer_A).triggerScheduledCrossOrderedTasks(0))
      .to.emit(scheduledSnapshotsFacet, "SnapshotTriggered")
      .withArgs(3);

    scheduledSnapshotCount = await scheduledSnapshotsFacet.scheduledSnapshotCount();
    scheduledSnapshots = await scheduledSnapshotsFacet.getScheduledSnapshots(0, 100);

    expect(scheduledSnapshotCount).to.equal(0);
    expect(scheduledSnapshots.length).to.equal(scheduledSnapshotCount);
  });
});
