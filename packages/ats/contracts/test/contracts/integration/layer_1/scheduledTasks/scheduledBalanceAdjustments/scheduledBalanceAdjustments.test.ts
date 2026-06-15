// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { dateToUnixTimestamp, ATS_ROLES, RESOLVER_KEY_SCHEDULED_BALANCE_ADJUSTMENT } from "@scripts";
import { executeRbac } from "@test";
import type { AssetMockCtx } from "@test";

export function scheduledBalanceAdjustmentsTests(getCtx: () => AssetMockCtx): void {
  describe("Scheduled BalanceAdjustments Tests", () => {
    let deployer: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      deployer = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;

      asset = ctx.asset;

      await executeRbac(asset, [
        {
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_B.address],
        },
      ]);
    });

    afterEach(async () => {
      asset.resetSystemTimestamp();
    });

    it("GIVEN a token WHEN triggerBalanceAdjustments THEN transaction succeeds", async () => {
      await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

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

      let scheduledBalanceAdjustmentCount = await asset.connect(deployer).getPendingBalanceAdjustmentCount(false);
      let scheduledBalanceAdjustments = await asset.connect(deployer).getScheduledBalanceAdjustments(0, 100, false);

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
      await asset.connect(deployer).triggerPendingScheduledCrossOrderedTasks();

      scheduledBalanceAdjustmentCount = await asset.connect(deployer).getPendingBalanceAdjustmentCount(false);
      scheduledBalanceAdjustments = await asset.connect(deployer).getScheduledBalanceAdjustments(0, 100, false);

      expect(scheduledBalanceAdjustmentCount).to.equal(2);
      expect(scheduledBalanceAdjustments.length).to.equal(scheduledBalanceAdjustmentCount);
      expect(scheduledBalanceAdjustments[0].scheduledTimestamp).to.equal(balanceAdjustmentExecutionDateInSeconds_3);
      expect(scheduledBalanceAdjustments[0].data).to.equal(balanceAdjustment_3_Id);
      expect(scheduledBalanceAdjustments[1].scheduledTimestamp).to.equal(balanceAdjustmentExecutionDateInSeconds_2);
      expect(scheduledBalanceAdjustments[1].data).to.equal(balanceAdjustment_2_Id);

      // AFTER SECOND SCHEDULED BalanceAdjustmentS ------------------------------------------------------------------
      await asset.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds_2 + 1);
      await asset.connect(deployer).triggerScheduledCrossOrderedTasks(100);

      scheduledBalanceAdjustmentCount = await asset.connect(deployer).getPendingBalanceAdjustmentCount(false);
      scheduledBalanceAdjustments = await asset.connect(deployer).getScheduledBalanceAdjustments(0, 100, false);

      expect(scheduledBalanceAdjustmentCount).to.equal(1);
      expect(scheduledBalanceAdjustments.length).to.equal(scheduledBalanceAdjustmentCount);
      expect(scheduledBalanceAdjustments[0].scheduledTimestamp).to.equal(balanceAdjustmentExecutionDateInSeconds_3);
      expect(scheduledBalanceAdjustments[0].data).to.equal(balanceAdjustment_3_Id);

      // AFTER THIRD SCHEDULED BalanceAdjustmentS ------------------------------------------------------------------
      await asset.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds_3 + 1);
      await asset.connect(deployer).triggerScheduledCrossOrderedTasks(0);

      scheduledBalanceAdjustmentCount = await asset.connect(deployer).getPendingBalanceAdjustmentCount(false);
      scheduledBalanceAdjustments = await asset.connect(deployer).getScheduledBalanceAdjustments(0, 100, false);

      expect(scheduledBalanceAdjustmentCount).to.equal(0);
      expect(scheduledBalanceAdjustments.length).to.equal(scheduledBalanceAdjustmentCount);
    });

    describe("getPendingBalanceAdjustmentCount / getScheduledBalanceAdjustments: _includeDisabled flag", () => {
      it("GIVEN a cancelled balance adjustment WHEN getPendingBalanceAdjustmentCount(false) THEN returns 0 and (true) returns 1", async () => {
        await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

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
        await asset.connect(deployer).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

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
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN setScheduledBalanceAdjustment THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(deployer).setScheduledBalanceAdjustment({ executionDate: 0, factor: 0, decimals: 0 }),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN cancelScheduledBalanceAdjustment THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(deployer).cancelScheduledBalanceAdjustment(0)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });
    });

    describe("initializeScheduledBalanceAdjustment", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeScheduledBalanceAdjustment is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeScheduledBalanceAdjustment())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeScheduledBalanceAdjustment is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeScheduledBalanceAdjustment())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_SCHEDULED_BALANCE_ADJUSTMENT, 1);
      });
    });

    describe("initializeScheduledBalanceAdjustment event", () => {
      it("GIVEN a fresh deployment WHEN initializeScheduledBalanceAdjustment is called THEN emits ScheduledBalanceAdjustmentInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_SCHEDULED_BALANCE_ADJUSTMENT);
        await expect(asset.initializeScheduledBalanceAdjustment()).to.emit(
          asset,
          "ScheduledBalanceAdjustmentInitialized",
        );
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN setScheduledBalanceAdjustment THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.setScheduledBalanceAdjustment({ executionDate: 0, factor: 0, decimals: 0 }),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN cancelScheduledBalanceAdjustment THEN reverts with AssetNotOperational", async () => {
        await expect(asset.cancelScheduledBalanceAdjustment(0)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });
    });
  });
}
