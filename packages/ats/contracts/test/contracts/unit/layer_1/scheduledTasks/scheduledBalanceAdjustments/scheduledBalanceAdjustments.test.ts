// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import {
  type ResolverProxy,
  type Equity,
  type ScheduledBalanceAdjustments,
  type AccessControl,
  ScheduledCrossOrderedTasks,
  TimeTravelFacet,
} from "@contract-types";
import { dateToUnixTimestamp, ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";
import { executeRbac } from "@test";

describe("Scheduled BalanceAdjustments Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: SignerWithAddress;
  let signer_B: SignerWithAddress;
  let signer_C: SignerWithAddress;

  let equityFacet: Equity;
  let scheduledBalanceAdjustmentsFacet: ScheduledBalanceAdjustments;
  let scheduledTasksFacet: ScheduledCrossOrderedTasks;
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
    accessControlFacet = await ethers.getContractAt("AccessControlFacet", diamond.address, signer_A);
    equityFacet = await ethers.getContractAt("Equity", diamond.address, signer_A);
    scheduledBalanceAdjustmentsFacet = await ethers.getContractAt(
      "ScheduledBalanceAdjustments",
      diamond.address,
      signer_A,
    );
    scheduledTasksFacet = await ethers.getContractAt("ScheduledCrossOrderedTasks", diamond.address, signer_A);
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.address, signer_A);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureSinglePartition);
  });

  afterEach(async () => {
    timeTravelFacet.resetSystemTimestamp();
  });

  it("GIVEN a token WHEN triggerBalanceAdjustments THEN transaction succeeds", async () => {
    await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

    // set balanceAdjustment
    const balanceAdjustmentExecutionDateInSeconds_1 = dateToUnixTimestamp("2030-01-01T00:00:06Z");
    const balanceAdjustmentExecutionDateInSeconds_2 = dateToUnixTimestamp("2030-01-01T00:00:12Z");
    const balanceAdjustmentExecutionDateInSeconds_3 = dateToUnixTimestamp("2030-01-01T00:00:18Z");
    const balanceAdjustmentsFactor = 1;
    const balanceAdjustmentsDecimals = 2;

    const balanceAdjustmentData_1 = {
      executionDate: balanceAdjustmentExecutionDateInSeconds_1.toString(),
      factor: balanceAdjustmentsFactor,
      decimals: balanceAdjustmentsDecimals,
    };
    const balanceAdjustmentData_2 = {
      executionDate: balanceAdjustmentExecutionDateInSeconds_2.toString(),
      factor: balanceAdjustmentsFactor,
      decimals: balanceAdjustmentsDecimals,
    };
    const balanceAdjustmentData_3 = {
      executionDate: balanceAdjustmentExecutionDateInSeconds_3.toString(),
      factor: balanceAdjustmentsFactor,
      decimals: balanceAdjustmentsDecimals,
    };
    await equityFacet.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData_2);
    await equityFacet.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData_3);
    await equityFacet.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData_1);

    const balanceAdjustment_2_Id = "0x0000000000000000000000000000000000000000000000000000000000000001";
    const balanceAdjustment_3_Id = "0x0000000000000000000000000000000000000000000000000000000000000002";
    const balanceAdjustment_1_Id = "0x0000000000000000000000000000000000000000000000000000000000000003";

    // check schedled BalanceAdjustments
    scheduledBalanceAdjustmentsFacet = scheduledBalanceAdjustmentsFacet.connect(signer_A);

    let scheduledBalanceAdjustmentCount = await scheduledBalanceAdjustmentsFacet.scheduledBalanceAdjustmentCount();
    let scheduledBalanceAdjustments = await scheduledBalanceAdjustmentsFacet.getScheduledBalanceAdjustments(0, 100);

    expect(scheduledBalanceAdjustmentCount).to.equal(3);
    expect(scheduledBalanceAdjustments.length).to.equal(scheduledBalanceAdjustmentCount);
    expect(scheduledBalanceAdjustments[0].scheduledTimestamp.toNumber()).to.equal(
      balanceAdjustmentExecutionDateInSeconds_3,
    );
    expect(scheduledBalanceAdjustments[0].data).to.equal(balanceAdjustment_3_Id);
    expect(scheduledBalanceAdjustments[1].scheduledTimestamp.toNumber()).to.equal(
      balanceAdjustmentExecutionDateInSeconds_2,
    );
    expect(scheduledBalanceAdjustments[1].data).to.equal(balanceAdjustment_2_Id);
    expect(scheduledBalanceAdjustments[2].scheduledTimestamp.toNumber()).to.equal(
      balanceAdjustmentExecutionDateInSeconds_1,
    );
    expect(scheduledBalanceAdjustments[2].data).to.equal(balanceAdjustment_1_Id);

    // AFTER FIRST SCHEDULED BalanceAdjustmentS ------------------------------------------------------------------
    await timeTravelFacet.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds_1 + 1);
    await scheduledTasksFacet.connect(signer_A).triggerPendingScheduledCrossOrderedTasks();

    scheduledBalanceAdjustmentCount = await scheduledBalanceAdjustmentsFacet.scheduledBalanceAdjustmentCount();
    scheduledBalanceAdjustments = await scheduledBalanceAdjustmentsFacet.getScheduledBalanceAdjustments(0, 100);

    expect(scheduledBalanceAdjustmentCount).to.equal(2);
    expect(scheduledBalanceAdjustments.length).to.equal(scheduledBalanceAdjustmentCount);
    expect(scheduledBalanceAdjustments[0].scheduledTimestamp.toNumber()).to.equal(
      balanceAdjustmentExecutionDateInSeconds_3,
    );
    expect(scheduledBalanceAdjustments[0].data).to.equal(balanceAdjustment_3_Id);
    expect(scheduledBalanceAdjustments[1].scheduledTimestamp.toNumber()).to.equal(
      balanceAdjustmentExecutionDateInSeconds_2,
    );
    expect(scheduledBalanceAdjustments[1].data).to.equal(balanceAdjustment_2_Id);

    // AFTER SECOND SCHEDULED BalanceAdjustmentS ------------------------------------------------------------------
    await timeTravelFacet.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds_2 + 1);
    await scheduledTasksFacet.connect(signer_A).triggerScheduledCrossOrderedTasks(100);

    scheduledBalanceAdjustmentCount = await scheduledBalanceAdjustmentsFacet.scheduledBalanceAdjustmentCount();
    scheduledBalanceAdjustments = await scheduledBalanceAdjustmentsFacet.getScheduledBalanceAdjustments(0, 100);

    expect(scheduledBalanceAdjustmentCount).to.equal(1);
    expect(scheduledBalanceAdjustments.length).to.equal(scheduledBalanceAdjustmentCount);
    expect(scheduledBalanceAdjustments[0].scheduledTimestamp.toNumber()).to.equal(
      balanceAdjustmentExecutionDateInSeconds_3,
    );
    expect(scheduledBalanceAdjustments[0].data).to.equal(balanceAdjustment_3_Id);

    // AFTER THIRD SCHEDULED BalanceAdjustmentS ------------------------------------------------------------------
    await timeTravelFacet.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds_3 + 1);
    await scheduledTasksFacet.connect(signer_A).triggerScheduledCrossOrderedTasks(0);

    scheduledBalanceAdjustmentCount = await scheduledBalanceAdjustmentsFacet.scheduledBalanceAdjustmentCount();
    scheduledBalanceAdjustments = await scheduledBalanceAdjustmentsFacet.getScheduledBalanceAdjustments(0, 100);

    expect(scheduledBalanceAdjustmentCount).to.equal(0);
    expect(scheduledBalanceAdjustments.length).to.equal(scheduledBalanceAdjustmentCount);
  });
});
