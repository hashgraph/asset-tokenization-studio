// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { dateToUnixTimestamp, ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";
import { executeRbac } from "@test";

describe("Scheduled BalanceAdjustments Tests", () => {
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
    ]);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureSinglePartition);
  });

  afterEach(async () => {
    asset.resetSystemTimestamp();
  });

  it("GIVEN a token WHEN triggerBalanceAdjustments THEN transaction succeeds", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

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
    await asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData_2);
    await asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData_3);
    await asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData_1);

    const balanceAdjustment_2_Id = "0x0000000000000000000000000000000000000000000000000000000000000001";
    const balanceAdjustment_3_Id = "0x0000000000000000000000000000000000000000000000000000000000000002";
    const balanceAdjustment_1_Id = "0x0000000000000000000000000000000000000000000000000000000000000003";

    // check schedled BalanceAdjustments

    let scheduledBalanceAdjustmentCount = await asset.connect(signer_A).getPendingBalanceAdjustmentCount(false);
    let scheduledBalanceAdjustments = await asset.connect(signer_A).getScheduledBalanceAdjustments(0, 100, false);

    expect(scheduledBalanceAdjustmentCount).to.equal(3);
    expect(scheduledBalanceAdjustments.length).to.equal(scheduledBalanceAdjustmentCount);
    expect(scheduledBalanceAdjustments[0].scheduledTimestamp).to.equal(balanceAdjustmentExecutionDateInSeconds_3);
    expect(scheduledBalanceAdjustments[0].data).to.equal(balanceAdjustment_3_Id);
    expect(scheduledBalanceAdjustments[1].scheduledTimestamp).to.equal(balanceAdjustmentExecutionDateInSeconds_2);
    expect(scheduledBalanceAdjustments[1].data).to.equal(balanceAdjustment_2_Id);
    expect(scheduledBalanceAdjustments[2].scheduledTimestamp).to.equal(balanceAdjustmentExecutionDateInSeconds_1);
    expect(scheduledBalanceAdjustments[2].data).to.equal(balanceAdjustment_1_Id);

    // AFTER FIRST SCHEDULED BalanceAdjustmentS ------------------------------------------------------------------
    await asset.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds_1 + 1);
    await asset.connect(signer_A).triggerPendingScheduledCrossOrderedTasks();

    scheduledBalanceAdjustmentCount = await asset.connect(signer_A).getPendingBalanceAdjustmentCount(false);
    scheduledBalanceAdjustments = await asset.connect(signer_A).getScheduledBalanceAdjustments(0, 100, false);

    expect(scheduledBalanceAdjustmentCount).to.equal(2);
    expect(scheduledBalanceAdjustments.length).to.equal(scheduledBalanceAdjustmentCount);
    expect(scheduledBalanceAdjustments[0].scheduledTimestamp).to.equal(balanceAdjustmentExecutionDateInSeconds_3);
    expect(scheduledBalanceAdjustments[0].data).to.equal(balanceAdjustment_3_Id);
    expect(scheduledBalanceAdjustments[1].scheduledTimestamp).to.equal(balanceAdjustmentExecutionDateInSeconds_2);
    expect(scheduledBalanceAdjustments[1].data).to.equal(balanceAdjustment_2_Id);

    // AFTER SECOND SCHEDULED BalanceAdjustmentS ------------------------------------------------------------------
    await asset.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds_2 + 1);
    await asset.connect(signer_A).triggerScheduledCrossOrderedTasks(100);

    scheduledBalanceAdjustmentCount = await asset.connect(signer_A).getPendingBalanceAdjustmentCount(false);
    scheduledBalanceAdjustments = await asset.connect(signer_A).getScheduledBalanceAdjustments(0, 100, false);

    expect(scheduledBalanceAdjustmentCount).to.equal(1);
    expect(scheduledBalanceAdjustments.length).to.equal(scheduledBalanceAdjustmentCount);
    expect(scheduledBalanceAdjustments[0].scheduledTimestamp).to.equal(balanceAdjustmentExecutionDateInSeconds_3);
    expect(scheduledBalanceAdjustments[0].data).to.equal(balanceAdjustment_3_Id);

    // AFTER THIRD SCHEDULED BalanceAdjustmentS ------------------------------------------------------------------
    await asset.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds_3 + 1);
    await asset.connect(signer_A).triggerScheduledCrossOrderedTasks(0);

    scheduledBalanceAdjustmentCount = await asset.connect(signer_A).getPendingBalanceAdjustmentCount(false);
    scheduledBalanceAdjustments = await asset.connect(signer_A).getScheduledBalanceAdjustments(0, 100, false);

    expect(scheduledBalanceAdjustmentCount).to.equal(0);
    expect(scheduledBalanceAdjustments.length).to.equal(scheduledBalanceAdjustmentCount);
  });

  describe("getPendingBalanceAdjustmentCount / getScheduledBalanceAdjustments: _includeDisabled flag", () => {
    it("GIVEN a cancelled balance adjustment WHEN getPendingBalanceAdjustmentCount(false) THEN returns 0 and (true) returns 1", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      const executionDate = dateToUnixTimestamp("2030-01-01T00:00:06Z");
      await asset.connect(signer_C).setScheduledBalanceAdjustment({
        executionDate: executionDate.toString(),
        factor: 1,
        decimals: 2,
      });

      await asset.connect(signer_C).cancelScheduledBalanceAdjustment(1);

      expect(await asset.getPendingBalanceAdjustmentCount(false)).to.equal(0);
      expect(await asset.getPendingBalanceAdjustmentCount(true)).to.equal(1);
    });

    it("GIVEN a cancelled balance adjustment WHEN getScheduledBalanceAdjustments(false) THEN returns empty and (true) returns the task", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      const executionDate = dateToUnixTimestamp("2030-01-01T00:00:06Z");
      await asset.connect(signer_C).setScheduledBalanceAdjustment({
        executionDate: executionDate.toString(),
        factor: 1,
        decimals: 2,
      });

      await asset.connect(signer_C).cancelScheduledBalanceAdjustment(1);

      const excluded = await asset.getScheduledBalanceAdjustments(0, 100, false);
      expect(excluded).to.have.lengthOf(0);

      const included = await asset.getScheduledBalanceAdjustments(0, 100, true);
      expect(included).to.have.lengthOf(1);
      expect(included[0].scheduledTimestamp).to.equal(BigInt(executionDate));
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN setScheduledBalanceAdjustment THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset
          .connect(base.deployer)
          .setScheduledBalanceAdjustment({ executionDate: 0, factor: 0, decimals: 0 }),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });

    it("GIVEN a deactivated asset WHEN cancelScheduledBalanceAdjustment THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).cancelScheduledBalanceAdjustment(0),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });
});
