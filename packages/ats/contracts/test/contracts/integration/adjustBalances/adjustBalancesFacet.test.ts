// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { DEFAULT_PARTITION, ATS_ROLES, ZERO, dateToUnixTimestamp } from "@scripts";
import { deployEquityTokenFixture, executeRbac, grantRoleAndPauseToken, MAX_UINT256 } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const EMPTY_VC_ID = "";

let balanceAdjustmentExecutionDateInSeconds = 0;
const balanceAdjustmentFactor = 356;
const balanceAdjustmentDecimals = 2;

let balanceAdjustmentData = {
  executionDate: balanceAdjustmentExecutionDateInSeconds.toString(),
  factor: balanceAdjustmentFactor,
  decimals: balanceAdjustmentDecimals,
};

describe("AdjustBalancesFacet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    await executeRbac(asset, [
      {
        role: ATS_ROLES.PAUSER_ROLE,
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
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureSinglePartition);

    const currentTimestamp = await asset.blockTimestamp();
    const ONE_DAY = 86400n;

    balanceAdjustmentExecutionDateInSeconds = Number(currentTimestamp + ONE_DAY);

    balanceAdjustmentData = {
      executionDate: balanceAdjustmentExecutionDateInSeconds.toString(),
      factor: balanceAdjustmentFactor,
      decimals: balanceAdjustmentDecimals,
    };
  });

  describe("Balance adjustments", () => {
    it("GIVEN an account without corporateActions role WHEN setScheduledBalanceAdjustment THEN transaction fails with AccountHasNoRole", async () => {
      await expect(
        asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN a paused Token WHEN setScheduledBalanceAdjustment THEN transaction fails with TokenIsPaused", async () => {
      await grantRoleAndPauseToken(asset, ATS_ROLES.CORPORATE_ACTION_ROLE, signer_A, signer_B, signer_C.address);

      await expect(
        asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN an account with corporateActions role WHEN setScheduledBalanceAdjustment with invalid timestamp THEN transaction fails with WrongTimestamp", async () => {
      const currentTimestamp = await asset.blockTimestamp();
      await asset.changeSystemTimestamp(currentTimestamp + 100n);
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      const invalidBalanceAdjustmentData = {
        executionDate: (currentTimestamp - 100n).toString(),
        factor: balanceAdjustmentFactor,
        decimals: balanceAdjustmentDecimals,
      };

      await expect(
        asset.connect(signer_C).setScheduledBalanceAdjustment(invalidBalanceAdjustmentData),
      ).to.be.revertedWithCustomError(asset, "WrongTimestamp");
    });

    it("GIVEN an account with corporateActions role WHEN setScheduledBalanceAdjustment with zero timestamp THEN transaction fails with InvalidTimestamp", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      const zeroTimestampBalanceAdjustmentData = {
        executionDate: "0",
        factor: balanceAdjustmentFactor,
        decimals: balanceAdjustmentDecimals,
      };

      await expect(
        asset.connect(signer_C).setScheduledBalanceAdjustment(zeroTimestampBalanceAdjustmentData),
      ).to.be.revertedWithCustomError(asset, "InvalidTimestamp");
    });

    it("GIVEN an account with corporateActions role WHEN setScheduledBalanceAdjustment with invalid factor THEN transaction fails with FactorIsZero", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      const invalidBalanceAdjustmentData = {
        executionDate: balanceAdjustmentExecutionDateInSeconds.toString(),
        factor: 0,
        decimals: balanceAdjustmentDecimals,
      };

      await expect(
        asset.connect(signer_C).setScheduledBalanceAdjustment(invalidBalanceAdjustmentData),
      ).to.be.revertedWithCustomError(asset, "FactorIsZero");
    });

    it("GIVEN balance adjustment created WHEN trying to get balance adjustment with wrong ID type THEN transaction fails with WrongIndexForAction", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      await asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);

      // Create a dividend to have a different action type at index 2
      const currentTimestamp = await asset.blockTimestamp();
      const ONE_DAY = 86400n;
      const dividendData = {
        recordDate: (currentTimestamp + ONE_DAY).toString(),
        executionDate: (currentTimestamp + ONE_DAY + 1000n).toString(),
        amount: 10,
        amountDecimals: 1,
      };
      await asset.connect(signer_C).setDividend(dividendData);

      await expect(asset.getScheduledBalanceAdjustment(2)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
    });

    it("GIVEN an account with corporateActions role WHEN setScheduledBalanceAdjustment THEN transaction succeeds", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      await expect(asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData))
        .to.emit(asset, "ScheduledBalanceAdjustmentSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          balanceAdjustmentExecutionDateInSeconds,
          balanceAdjustmentFactor,
          balanceAdjustmentDecimals,
        );

      const listCount = await asset.getBalanceAdjustmentCount();
      const [balanceAdjustment, isDisabled] = await asset.getScheduledBalanceAdjustment(1);

      expect(listCount).to.equal(1);
      expect(isDisabled).to.equal(false);
      expect(balanceAdjustment.executionDate).to.equal(balanceAdjustmentExecutionDateInSeconds);
      expect(balanceAdjustment.factor).to.equal(balanceAdjustmentFactor);
      expect(balanceAdjustment.decimals).to.equal(balanceAdjustmentDecimals);
    });

    describe("Cancel Scheduled Balance Adjustment", () => {
      it("GIVEN id is zero WHEN cancelScheduledBalanceAdjustment THEN reverts with WrongIndexForAction", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

        await expect(asset.connect(signer_C).cancelScheduledBalanceAdjustment(0)).to.be.revertedWithCustomError(
          asset,
          "ZeroValueNotAllowed",
        );
      });

      it("GIVEN an account without corporateActions role WHEN cancelScheduledBalanceAdjustment THEN transaction fails with AccountHasNoRole", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_B.address);
        await asset.connect(signer_B).setScheduledBalanceAdjustment(balanceAdjustmentData);
        await expect(asset.connect(signer_C).cancelScheduledBalanceAdjustment(1)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN a paused Token WHEN cancelScheduledBalanceAdjustment THEN transaction fails with TokenIsPaused", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_B.address);
        await asset.connect(signer_B).setScheduledBalanceAdjustment(balanceAdjustmentData);
        await asset.connect(signer_B).pause();

        await expect(asset.connect(signer_B).cancelScheduledBalanceAdjustment(1)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN a balance adjustment already executed WHEN cancelScheduledBalanceAdjustment THEN transaction fails with BalanceAdjustmentAlreadyExecuted", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

        await asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);

        await asset.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds + 1000);

        await expect(asset.connect(signer_C).cancelScheduledBalanceAdjustment(1)).to.be.revertedWithCustomError(
          asset,
          "BalanceAdjustmentAlreadyExecuted",
        );
      });

      it("GIVEN a balance adjustment not yet executed WHEN cancelScheduledBalanceAdjustment THEN transaction succeeds", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

        await asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);

        await expect(asset.connect(signer_C).cancelScheduledBalanceAdjustment(1))
          .to.emit(asset, "ScheduledBalanceAdjustmentCancelled")
          .withArgs(1, signer_C.address);
        const [balanceAdjustment, isDisabled] = await asset.getScheduledBalanceAdjustment(1);
        expect(isDisabled).to.equal(true);
        expect(balanceAdjustment.factor).to.equal(balanceAdjustmentFactor);
        expect(balanceAdjustment.decimals).to.equal(balanceAdjustmentDecimals);
      });

      it("GIVEN a non-existent balance adjustment WHEN cancelScheduledBalanceAdjustment THEN transaction fails", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

        await expect(asset.connect(signer_C).cancelScheduledBalanceAdjustment(999)).to.be.revertedWithCustomError(
          asset,
          "WrongIndexForAction",
        );
      });

      it("GIVEN multiple balance adjustments WHEN cancelScheduledBalanceAdjustment on one THEN only that adjustment is cancelled", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

        await asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);

        const secondBalanceAdjustmentData = {
          executionDate: (balanceAdjustmentExecutionDateInSeconds + 10000).toString(),
          factor: 500,
          decimals: 3,
        };
        await asset.connect(signer_C).setScheduledBalanceAdjustment(secondBalanceAdjustmentData);

        await expect(asset.connect(signer_C).cancelScheduledBalanceAdjustment(1))
          .to.emit(asset, "ScheduledBalanceAdjustmentCancelled")
          .withArgs(1, signer_C.address);

        const [balanceAdjustment1, isDisabled1] = await asset.getScheduledBalanceAdjustment(1);
        expect(isDisabled1).to.equal(true);
        expect(balanceAdjustment1.factor).to.equal(balanceAdjustmentFactor);

        const [balanceAdjustment2, isDisabled2] = await asset.getScheduledBalanceAdjustment(2);
        expect(isDisabled2).to.equal(false);
        expect(balanceAdjustment2.factor).to.equal(500);
        expect(balanceAdjustment2.decimals).to.equal(3);
      });

      it("GIVEN a cancelled balance adjustment WHEN triggerScheduledCrossOrderedTasks is called THEN scheduled task executes but token balance remains unchanged", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);

        const tokenAmount = 1000n;
        await asset.connect(signer_C).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: tokenAmount,
          data: "0x",
        });

        const balanceBeforeAdjustment = await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address);
        expect(balanceBeforeAdjustment).to.equal(tokenAmount);

        await asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);

        await asset.connect(signer_C).cancelScheduledBalanceAdjustment(1);

        const balanceAfterCancel = await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address);
        expect(balanceAfterCancel).to.equal(balanceBeforeAdjustment);

        await asset.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds + 1);

        await asset.connect(signer_A).triggerScheduledCrossOrderedTasks(100);

        const balanceAfterTrigger = await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address);
        expect(balanceAfterTrigger).to.equal(balanceBeforeAdjustment);
      });
    });
  });

  describe("getScheduledBalanceAdjustment", () => {
    it("GIVEN id is zero WHEN getScheduledBalanceAdjustment THEN reverts with WrongIndexForAction", async () => {
      await expect(asset.getScheduledBalanceAdjustment(0)).to.be.revertedWithCustomError(asset, "ZeroValueNotAllowed");
    });

    it("GIVEN a created balance adjustment WHEN getScheduledBalanceAdjustment THEN all struct fields match the values passed to setScheduledBalanceAdjustment", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      await asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);

      const [balanceAdjustment, isDisabled] = await asset.getScheduledBalanceAdjustment(1);

      expect(balanceAdjustment.executionDate).to.equal(balanceAdjustmentExecutionDateInSeconds);
      expect(balanceAdjustment.factor).to.equal(balanceAdjustmentFactor);
      expect(balanceAdjustment.decimals).to.equal(balanceAdjustmentDecimals);
      expect(isDisabled).to.equal(false);
    });
  });

  describe("getPendingBalanceAdjustmentCount", () => {
    it("GIVEN no scheduled adjustments WHEN getPendingBalanceAdjustmentCount THEN returns zero", async () => {
      const count = await asset.getPendingBalanceAdjustmentCount();
      expect(count).to.equal(0);
    });

    it("GIVEN scheduled adjustments set WHEN getPendingBalanceAdjustmentCount THEN returns correct queue count", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      await asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);
      await asset.connect(signer_C).setScheduledBalanceAdjustment({
        executionDate: (balanceAdjustmentExecutionDateInSeconds + 5000).toString(),
        factor: 100,
        decimals: 1,
      });

      const count = await asset.getPendingBalanceAdjustmentCount();
      expect(count).to.equal(2);
    });
  });

  describe("getBalanceAdjustmentCount", () => {
    it("GIVEN no balance adjustments WHEN getBalanceAdjustmentCount THEN returns 0", async () => {
      const count = await asset.getBalanceAdjustmentCount();
      expect(count).to.equal(0);
    });

    it("GIVEN N balance adjustments WHEN getBalanceAdjustmentCount THEN returns N", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      await asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);
      await asset.connect(signer_C).setScheduledBalanceAdjustment({
        executionDate: (balanceAdjustmentExecutionDateInSeconds + 5000).toString(),
        factor: 200,
        decimals: 3,
      });

      const count = await asset.getBalanceAdjustmentCount();
      expect(count).to.equal(2);
    });
  });

  describe("getScheduledBalanceAdjustments", () => {
    it("GIVEN no scheduled adjustments WHEN getScheduledBalanceAdjustments THEN returns empty array", async () => {
      const results = await asset.getScheduledBalanceAdjustments(0, 10);
      expect(results.length).to.equal(0);
    });

    it("GIVEN scheduled adjustments WHEN getScheduledBalanceAdjustments page 0 THEN returns non-empty array", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      await asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);

      const results = await asset.getScheduledBalanceAdjustments(0, 10);
      expect(results.length).to.be.gt(0);
    });

    it("GIVEN scheduled adjustments WHEN getScheduledBalanceAdjustments out-of-range page THEN returns empty array", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      await asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);

      const results = await asset.getScheduledBalanceAdjustments(100, 10);
      expect(results.length).to.equal(0);
    });
  });

  describe("adjustBalances", () => {
    const adjustFactor = 253;
    const adjustDecimals = 2;

    it("GIVEN an account without adjustBalances role WHEN adjustBalances THEN transaction fails with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a paused Token WHEN adjustBalances THEN transaction fails with TokenIsPaused", async () => {
      await grantRoleAndPauseToken(asset, ATS_ROLES.ADJUSTMENT_BALANCE_ROLE, signer_A, signer_B, signer_C.address);

      await expect(asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals)).to.be.revertedWithCustomError(
        asset,
        "TokenIsPaused",
      );
    });

    it("GIVEN a Token WHEN adjustBalances with factor set at 0 THEN transaction fails with FactorIsZero", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ADJUSTMENT_BALANCE_ROLE, signer_C.address);

      await expect(asset.connect(signer_C).adjustBalances(0, adjustDecimals)).to.be.revertedWithCustomError(
        asset,
        "FactorIsZero",
      );
    });

    it("GIVEN an account with adjustBalance role WHEN adjustBalances THEN scheduled tasks get executed succeeds", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ADJUSTMENT_BALANCE_ROLE, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_A.address);

      await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      const tokenAmount = 20;
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: tokenAmount,
        data: "0x",
      });

      // schedule tasks
      const dividendsRecordDateInSeconds_1 = dateToUnixTimestamp(`2030-01-01T00:00:06Z`);
      const dividendsExecutionDateInSeconds = dateToUnixTimestamp(`2030-01-01T00:01:00Z`);
      const dividendsAmountPerEquity = 1;
      const dividendAmountDecimalsPerEquity = 2;
      const dividendData_1 = {
        recordDate: dividendsRecordDateInSeconds_1.toString(),
        executionDate: dividendsExecutionDateInSeconds.toString(),
        amount: dividendsAmountPerEquity,
        amountDecimals: dividendAmountDecimalsPerEquity,
      };

      await asset.connect(signer_A).setDividend(dividendData_1);

      const balanceAdjustmentExecutionDateInSeconds_1 = dateToUnixTimestamp(`2030-01-01T00:00:07Z`);

      const balanceAdjustmentData_1 = {
        executionDate: balanceAdjustmentExecutionDateInSeconds_1.toString(),
        factor: adjustFactor,
        decimals: adjustDecimals,
      };

      await asset.connect(signer_A).setScheduledBalanceAdjustment(balanceAdjustmentData_1);

      const tasks_count_Before = await asset.scheduledCrossOrderedTaskCount();

      //-------------------------
      await asset.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds_1 + 1);

      // balance adjustment
      await asset.connect(signer_A).adjustBalances(1, 0);

      const tasks_count_After = await asset.scheduledCrossOrderedTaskCount();

      expect(tasks_count_Before).to.be.equal(2);
      expect(tasks_count_After).to.be.equal(0);
    });

    it("GIVEN an account with adjustBalance role WHEN adjustBalances THEN balances are adjusted correctly", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ADJUSTMENT_BALANCE_ROLE, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      const tokenAmount = 100n;
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: tokenAmount,
        data: "0x",
      });

      const balanceBefore = await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_B.address);
      expect(balanceBefore).to.equal(tokenAmount);

      // factor=2, decimals=0 → multiply all balances by 2
      const factor = 2;
      const decimals = 0;
      await asset.connect(signer_A).adjustBalances(factor, decimals);

      const balanceAfter = await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_B.address);
      expect(balanceAfter).to.equal(tokenAmount * BigInt(factor));
    });
  });

  describe("triggerAndSyncAll", () => {
    it("GIVEN a paused token WHEN triggerAndSyncAll THEN transaction fails with TokenIsPaused", async () => {
      await asset.connect(signer_B).pause();

      await expect(
        asset.connect(signer_A).triggerAndSyncAll(DEFAULT_PARTITION, signer_A.address, ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN an unpaused token with elapsed pending adjustment WHEN triggerAndSyncAll THEN pending adjustment is applied", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      const tokenAmount = 1000n;
      await asset.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_C.address,
        value: tokenAmount,
        data: "0x",
      });

      // Set a scheduled balance adjustment with a future execution date
      const adjustmentFactor = 2;
      const adjustmentDecimals = 0;
      await asset.connect(signer_C).setScheduledBalanceAdjustment({
        executionDate: balanceAdjustmentExecutionDateInSeconds.toString(),
        factor: adjustmentFactor,
        decimals: adjustmentDecimals,
      });

      // Advance time past the execution date
      await asset.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds + 1);

      // triggerAndSyncAll fires the pending scheduled task
      await expect(asset.connect(signer_A).triggerAndSyncAll(DEFAULT_PARTITION, signer_C.address, ethers.ZeroAddress))
        .to.not.be.reverted;

      // The task queue should now be empty after triggering
      const queueCount = await asset.getPendingBalanceAdjustmentCount();
      expect(queueCount).to.equal(0);
    });
  });
});
