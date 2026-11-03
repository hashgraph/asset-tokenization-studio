// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ZERO, EMPTY_STRING, ADDRESS_ZERO, dateToUnixTimestamp, ATS_ROLES, RESOLVER_KEYS } from "@scripts";
import { DEFAULT_PARTITION, PARTITION_ID_2, grantRoleAndPauseToken, MAX_UINT256, executeRbac } from "@test";

const amount = 1000;
const balanceOf_C_Original = 2 * amount;
const lockedAmountOf_A_Partition_1 = 1;
const lockedAmountOf_A_Partition_2 = 2;
const lockedAmountOf_C_Partition_1 = 3;
const heldAmountOf_A_Partition_1 = 4;
const heldAmountOf_A_Partition_2 = 5;
const heldAmountOf_C_Partition_1 = 6;
const EMPTY_VC_ID = EMPTY_STRING;
const balanceOf_B_Original = 2 * amount;
const DECIMALS = 6;

export function snapshotsTests(getCtx: () => AssetMockCtx): void {
  describe("Snapshots Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    let asset: IAssetMock;

    function set_initRbacs(): any[] {
      return [
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_LOCKER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_FREEZE_MANAGER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_CLEARING, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_CLEARING_VALIDATOR, members: [signer_B.address] },
      ];
    }

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;
      asset = ctx.asset;
      await asset.setMultiPartition(true);
      await executeRbac(asset, set_initRbacs());
    });

    it("GIVEN an account without snapshot role WHEN takeSnapshot THEN transaction fails with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).takeSnapshot()).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN a paused Token WHEN takeSnapshot THEN transaction fails with IsPaused", async () => {
      await grantRoleAndPauseToken(asset, ATS_ROLES.ROLE_SNAPSHOT, signer_A, signer_B, signer_C.address);

      await expect(asset.connect(signer_C).takeSnapshot()).to.be.revertedWithCustomError(asset, "IsPaused");
    });

    it("GIVEN no snapshot WHEN reading snapshot values THEN transaction fails", async () => {
      await expect(asset.balanceOfAtSnapshot(1, signer_A.address)).to.be.revertedWithCustomError(
        asset,
        "SnapshotIdDoesNotExists",
      );
      await expect(asset.balanceOfAtSnapshot(0, signer_A.address)).to.be.revertedWithCustomError(
        asset,
        "SnapshotIdNull",
      );
      await expect(asset.totalSupplyAtSnapshot(1)).to.be.revertedWithCustomError(asset, "SnapshotIdDoesNotExists");
      await expect(asset.totalSupplyAtSnapshot(0)).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
      await expect(
        asset.balanceOfAtSnapshotByPartition(DEFAULT_PARTITION, 1, signer_A.address),
      ).to.be.revertedWithCustomError(asset, "SnapshotIdDoesNotExists");
      await expect(
        asset.balanceOfAtSnapshotByPartition(DEFAULT_PARTITION, 0, signer_A.address),
      ).to.be.revertedWithCustomError(asset, "SnapshotIdNull");

      await expect(asset.getTokenHoldersAtSnapshot(1, 0, 1)).to.be.revertedWithCustomError(
        asset,
        "SnapshotIdDoesNotExists",
      );
      await expect(asset.getTokenHoldersAtSnapshot(0, 0, 1)).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
      await expect(asset.getTotalTokenHoldersAtSnapshot(1)).to.be.revertedWithCustomError(
        asset,
        "SnapshotIdDoesNotExists",
      );
      await expect(asset.getTotalTokenHoldersAtSnapshot(0)).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
      await expect(asset.partitionsOfAtSnapshot(1, signer_A.address)).to.be.revertedWithCustomError(
        asset,
        "SnapshotIdDoesNotExists",
      );
      await expect(asset.partitionsOfAtSnapshot(0, signer_A.address)).to.be.revertedWithCustomError(
        asset,
        "SnapshotIdNull",
      );
    });

    it("GIVEN an account with snapshot role WHEN takeSnapshot THEN transaction succeeds", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);

      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_C.address,
        value: balanceOf_C_Original,
        data: "0x",
      });

      // snapshot
      await expect(asset.connect(signer_C).takeSnapshot())
        .to.emit(asset, "SnapshotTaken")
        .withArgs(signer_C.address, 1);

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
      await asset.connect(signer_A).issueByPartition({
        partition: PARTITION_ID_2,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      const basicTransferInfo = {
        to: signer_A.address,
        value: amount,
      };

      await asset.connect(signer_C).transferByPartition(DEFAULT_PARTITION, basicTransferInfo, "0x");

      await asset
        .connect(signer_B)
        .lockByPartition(DEFAULT_PARTITION, lockedAmountOf_A_Partition_1, signer_A.address, MAX_UINT256);
      await asset
        .connect(signer_B)
        .lockByPartition(DEFAULT_PARTITION, lockedAmountOf_C_Partition_1, signer_C.address, MAX_UINT256);
      await asset
        .connect(signer_B)
        .lockByPartition(PARTITION_ID_2, lockedAmountOf_A_Partition_2, signer_A.address, MAX_UINT256);

      const hold = {
        amount: 0,
        expirationTimestamp: MAX_UINT256,
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: "0x",
      };

      hold.amount = heldAmountOf_A_Partition_1;
      await asset.connect(signer_A).createHoldByPartition(DEFAULT_PARTITION, hold);

      hold.amount = heldAmountOf_C_Partition_1;
      await asset.connect(signer_C).createHoldByPartition(DEFAULT_PARTITION, hold);

      hold.amount = heldAmountOf_A_Partition_2;
      await asset.connect(signer_A).createHoldByPartition(PARTITION_ID_2, hold);

      await asset.connect(signer_C).takeSnapshot();

      // check snapshot
      const snapshot_Balance_Of_A_1 = await asset.balanceOfAtSnapshot(1, signer_A.address);
      const snapshot_Balance_Of_C_1 = await asset.balanceOfAtSnapshot(1, signer_C.address);
      const snapshot_TotalTokenHolders_1 = await asset.getTotalTokenHoldersAtSnapshot(1);
      const snapshot_TokenHolders_1 = await asset.getTokenHoldersAtSnapshot(1, 0, snapshot_TotalTokenHolders_1);
      const snapshot_Balance_Of_A_1_Partition_1 = await asset.balanceOfAtSnapshotByPartition(
        DEFAULT_PARTITION,
        1,
        signer_A.address,
      );
      const snapshot_Balance_Of_C_1_Partition_1 = await asset.balanceOfAtSnapshotByPartition(
        DEFAULT_PARTITION,
        1,
        signer_C.address,
      );
      const snapshot_Balance_Of_A_1_Partition_2 = await asset.balanceOfAtSnapshotByPartition(
        PARTITION_ID_2,
        1,
        signer_A.address,
      );
      const snapshot_Balance_Of_C_1_Partition_2 = await asset.balanceOfAtSnapshotByPartition(
        PARTITION_ID_2,
        1,
        signer_C.address,
      );

      const snapshot_TotalSupply_1 = await asset.totalSupplyAtSnapshot(1);
      const snapshot_TotalSupply_1_Partition_1 = await asset.totalSupplyAtSnapshotByPartition(DEFAULT_PARTITION, 1);
      const snapshot_TotalSupply_1_Partition_2 = await asset.totalSupplyAtSnapshotByPartition(PARTITION_ID_2, 1);

      const snapshot_Balance_Paginated = await asset.balancesOfAtSnapshot(2, 0, 50);
      const snapshot_Balance_Of_A_2 =
        snapshot_Balance_Paginated.find((b) => b.holder.toLowerCase() === signer_A.address.toLowerCase())?.balance ??
        0n;
      const snapshot_Balance_Of_C_2 =
        snapshot_Balance_Paginated.find((b) => b.holder.toLowerCase() === signer_C.address.toLowerCase())?.balance ??
        0n;

      const snapshot_TotalTokenHolders_2 = await asset.getTotalTokenHoldersAtSnapshot(2);
      const snapshot_TokenHolders_2 = await asset.getTokenHoldersAtSnapshot(2, 0, snapshot_TotalTokenHolders_2);
      const snapshot_Balance_Of_A_2_Partition_1 = await asset.balanceOfAtSnapshotByPartition(
        DEFAULT_PARTITION,
        2,
        signer_A.address,
      );
      const snapshot_Balance_Of_C_2_Partition_1 = await asset.balanceOfAtSnapshotByPartition(
        DEFAULT_PARTITION,
        2,
        signer_C.address,
      );
      const snapshot_Balance_Of_A_2_Partition_2 = await asset.balanceOfAtSnapshotByPartition(
        PARTITION_ID_2,
        2,
        signer_A.address,
      );
      const snapshot_Balance_Of_C_2_Partition_2 = await asset.balanceOfAtSnapshotByPartition(
        PARTITION_ID_2,
        2,
        signer_C.address,
      );

      const snapshot_TotalSupply_2 = await asset.totalSupplyAtSnapshot(2);
      const snapshot_TotalSupply_2_Partition_1 = await asset.totalSupplyAtSnapshotByPartition(DEFAULT_PARTITION, 2);
      const snapshot_TotalSupply_2_Partition_2 = await asset.totalSupplyAtSnapshotByPartition(PARTITION_ID_2, 2);

      const current_Balance_Of_A = await asset.balanceOf(signer_A.address);
      const current_Balance_Of_C = await asset.balanceOf(signer_C.address);
      const current_TotalSupply = await asset.totalSupply();

      expect(snapshot_Balance_Of_A_1).to.equal(0);
      expect(snapshot_Balance_Of_A_1_Partition_1).to.equal(0);
      expect(snapshot_Balance_Of_A_1_Partition_2).to.equal(0);

      expect(snapshot_Balance_Of_C_1).to.equal(balanceOf_C_Original);
      expect(snapshot_Balance_Of_C_1_Partition_1).to.equal(balanceOf_C_Original);
      expect(snapshot_Balance_Of_C_1_Partition_2).to.equal(0);

      expect(snapshot_TotalSupply_1).to.equal(balanceOf_C_Original);
      expect(snapshot_TotalSupply_1_Partition_1).to.equal(balanceOf_C_Original);
      expect(snapshot_TotalSupply_1_Partition_2).to.equal(0);

      expect(current_Balance_Of_A).to.equal(
        3 * amount -
          lockedAmountOf_A_Partition_1 -
          lockedAmountOf_A_Partition_2 -
          heldAmountOf_A_Partition_1 -
          heldAmountOf_A_Partition_2,
      );
      expect(snapshot_Balance_Of_A_2).to.equal(current_Balance_Of_A);
      expect(snapshot_Balance_Of_A_2_Partition_1).to.equal(
        2 * amount - lockedAmountOf_A_Partition_1 - heldAmountOf_A_Partition_1,
      );
      expect(snapshot_Balance_Of_A_2_Partition_2).to.equal(
        amount - lockedAmountOf_A_Partition_2 - heldAmountOf_A_Partition_2,
      );

      expect(current_Balance_Of_C).to.equal(
        balanceOf_C_Original - amount - lockedAmountOf_C_Partition_1 - heldAmountOf_C_Partition_1,
      );
      expect(snapshot_Balance_Of_C_2).to.equal(current_Balance_Of_C);
      expect(snapshot_Balance_Of_C_2_Partition_1).to.equal(current_Balance_Of_C);
      expect(snapshot_Balance_Of_C_2_Partition_2).to.equal(0);

      expect(current_TotalSupply).to.equal(balanceOf_C_Original + 2 * amount);
      expect(snapshot_TotalSupply_2).to.equal(current_TotalSupply);
      expect(snapshot_TotalSupply_2_Partition_1).to.equal(balanceOf_C_Original + amount);
      expect(snapshot_TotalSupply_2_Partition_2).to.equal(amount);

      expect(snapshot_TotalTokenHolders_1).to.equal(1);
      expect(snapshot_TokenHolders_1.length).to.equal(snapshot_TotalTokenHolders_1);
      expect([...snapshot_TokenHolders_1]).to.have.members([signer_C.address]);

      expect(snapshot_TotalTokenHolders_2).to.equal(2);
      expect(snapshot_TokenHolders_2.length).to.equal(snapshot_TotalTokenHolders_2);
      expect([...snapshot_TokenHolders_2]).to.have.members([signer_A.address, signer_C.address]);
    });

    describe("Scheduled tasks", () => {
      it("GIVEN an account with snapshot role WHEN takeSnapshot THEN scheduled tasks get executed succeeds", async () => {
        await asset.forceDecimals(6);

        await asset.forceDecimals(6);

        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_A.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A.address);

        await asset.connect(signer_A).addIssuer(signer_A.address);
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);
        await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: balanceOf_C_Original,
          data: "0x",
        });
        await asset.connect(signer_A).issueByPartition({
          partition: PARTITION_ID_2,
          tokenHolder: signer_B.address,
          value: balanceOf_B_Original,
          data: "0x",
        });

        // schedule tasks
        const dividendsRecordDateInSeconds_1 = dateToUnixTimestamp("2030-01-01T00:00:06Z");
        const dividendsRecordDateInSeconds_2 = dateToUnixTimestamp("2030-01-01T00:00:12Z");
        const dividendsRecordDateInSeconds_3 = dateToUnixTimestamp("2030-01-01T00:00:18Z");
        const dividendsExecutionDateInSeconds = dateToUnixTimestamp("2030-01-01T00:01:00Z");
        const dividendsAmountPerEquity = 1;
        const dividendAmountDecimalsPerEquity = 0;
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
        await asset.connect(signer_A).setDividend(dividendData_1);
        await asset.connect(signer_A).setDividend(dividendData_2);
        await asset.connect(signer_A).setDividend(dividendData_3);

        const balanceAdjustmentExecutionDateInSeconds_1 = dateToUnixTimestamp("2030-01-01T00:00:07Z");
        const balanceAdjustmentExecutionDateInSeconds_2 = dateToUnixTimestamp("2030-01-01T00:00:13Z");
        const balanceAdjustmentExecutionDateInSeconds_3 = dateToUnixTimestamp("2030-01-01T00:00:19Z");

        const balanceAdjustmentsFactor_1 = 5;
        const balanceAdjustmentsDecimals_1 = 2;
        const balanceAdjustmentsFactor_2 = 6;
        const balanceAdjustmentsDecimals_2 = 0;
        const balanceAdjustmentsFactor_3 = 7;
        const balanceAdjustmentsDecimals_3 = 1;

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
        const balanceAdjustmentData_3 = {
          executionDate: balanceAdjustmentExecutionDateInSeconds_3.toString(),
          factor: balanceAdjustmentsFactor_3,
          decimals: balanceAdjustmentsDecimals_3,
        };
        await asset.connect(signer_A).setScheduledBalanceAdjustment(balanceAdjustmentData_1);
        await asset.connect(signer_A).setScheduledBalanceAdjustment(balanceAdjustmentData_2);
        await asset.connect(signer_A).setScheduledBalanceAdjustment(balanceAdjustmentData_3);

        //-------------------------
        await asset.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds_3 + 1);

        // snapshot
        await asset.connect(signer_A).takeSnapshot();

        const adjustmentFactor_1 = balanceAdjustmentsFactor_1;
        const adjustmentFactor_2 = adjustmentFactor_1 * balanceAdjustmentsFactor_2;
        const adjustmentFactor_3 = adjustmentFactor_2 * balanceAdjustmentsFactor_3;

        const decimalFactor_1 = balanceAdjustmentsDecimals_1;
        const decimalFactor_2 = decimalFactor_1 + balanceAdjustmentsDecimals_2;
        const decimalFactor_3 = decimalFactor_2 + balanceAdjustmentsDecimals_3;

        // check
        const dividendFor_C_1 = await asset.getDividendFor(1, signer_C.address);
        const dividendFor_C_2 = await asset.getDividendFor(2, signer_C.address);
        const dividendFor_C_3 = await asset.getDividendFor(3, signer_C.address);
        const balance_C_At_Snapshot_4 = await asset.balanceOfAtSnapshot(4, signer_C.address);

        expect(dividendFor_C_1.tokenBalance).to.be.equal(balanceOf_C_Original);
        expect(dividendFor_C_1.decimals).to.be.equal(DECIMALS);
        expect(dividendFor_C_2.tokenBalance).to.be.equal(balanceOf_C_Original * adjustmentFactor_1);
        expect(dividendFor_C_2.decimals).to.be.equal(DECIMALS + decimalFactor_1);

        expect(dividendFor_C_3.tokenBalance).to.be.equal(balanceOf_C_Original * adjustmentFactor_2);
        expect(dividendFor_C_3.decimals).to.be.equal(DECIMALS + decimalFactor_2);
        expect(balance_C_At_Snapshot_4).to.be.equal(balanceOf_C_Original * adjustmentFactor_3);

        const balance_C_At_Snapshot_1_partition_1 = await asset.balanceOfAtSnapshotByPartition(
          DEFAULT_PARTITION,
          1,
          signer_C.address,
        );
        const balance_C_At_Snapshot_2_partition_1 = await asset.balanceOfAtSnapshotByPartition(
          DEFAULT_PARTITION,
          2,
          signer_C.address,
        );
        const balance_C_At_Snapshot_3_partition_1 = await asset.balanceOfAtSnapshotByPartition(
          DEFAULT_PARTITION,
          3,
          signer_C.address,
        );
        const balance_C_At_Snapshot_4_partition_1 = await asset.balanceOfAtSnapshotByPartition(
          DEFAULT_PARTITION,
          4,
          signer_C.address,
        );

        expect(balance_C_At_Snapshot_1_partition_1).to.be.equal(balanceOf_C_Original);
        expect(balance_C_At_Snapshot_2_partition_1).to.be.equal(balanceOf_C_Original * adjustmentFactor_1);
        expect(balance_C_At_Snapshot_3_partition_1).to.be.equal(balanceOf_C_Original * adjustmentFactor_2);
        expect(balance_C_At_Snapshot_4_partition_1).to.be.equal(balanceOf_C_Original * adjustmentFactor_3);

        const balance_C_At_Snapshot_1_partition_2 = await asset.balanceOfAtSnapshotByPartition(
          PARTITION_ID_2,
          1,
          signer_C.address,
        );
        const balance_C_At_Snapshot_2_partition_2 = await asset.balanceOfAtSnapshotByPartition(
          PARTITION_ID_2,
          2,
          signer_C.address,
        );
        const balance_C_At_Snapshot_3_partition_2 = await asset.balanceOfAtSnapshotByPartition(
          PARTITION_ID_2,
          3,
          signer_C.address,
        );
        const balance_C_At_Snapshot_4_partition_2 = await asset.balanceOfAtSnapshotByPartition(
          PARTITION_ID_2,
          4,
          signer_C.address,
        );

        expect(balance_C_At_Snapshot_1_partition_2).to.be.equal(0);
        expect(balance_C_At_Snapshot_2_partition_2).to.be.equal(0);
        expect(balance_C_At_Snapshot_3_partition_2).to.be.equal(0);
        expect(balance_C_At_Snapshot_4_partition_2).to.be.equal(0);

        const decimals_At_Snapshot_1 = await asset.decimalsAtSnapshot(1);
        const decimals_At_Snapshot_2 = await asset.decimalsAtSnapshot(2);
        const decimals_At_Snapshot_3 = await asset.decimalsAtSnapshot(3);
        const decimals_At_Snapshot_4 = await asset.decimalsAtSnapshot(4);

        expect(decimals_At_Snapshot_1).to.be.equal(DECIMALS);
        expect(decimals_At_Snapshot_2).to.be.equal(DECIMALS + decimalFactor_1);
        expect(decimals_At_Snapshot_3).to.be.equal(DECIMALS + decimalFactor_2);
        expect(decimals_At_Snapshot_4).to.be.equal(DECIMALS + decimalFactor_3);

        const totalSupply_At_Snapshot_1 = await asset.totalSupplyAtSnapshot(1);
        const totalSupply_At_Snapshot_2 = await asset.totalSupplyAtSnapshot(2);
        const totalSupply_At_Snapshot_3 = await asset.totalSupplyAtSnapshot(3);
        const totalSupply_At_Snapshot_4 = await asset.totalSupplyAtSnapshot(4);

        expect(totalSupply_At_Snapshot_1).to.be.equal(balanceOf_C_Original + balanceOf_B_Original);
        expect(totalSupply_At_Snapshot_2).to.be.equal(
          (balanceOf_C_Original + balanceOf_B_Original) * adjustmentFactor_1,
        );
        expect(totalSupply_At_Snapshot_3).to.be.equal(
          (balanceOf_C_Original + balanceOf_B_Original) * adjustmentFactor_2,
        );
        expect(totalSupply_At_Snapshot_4).to.be.equal(
          (balanceOf_C_Original + balanceOf_B_Original) * adjustmentFactor_3,
        );
      });
    });
  });

  describe("Scheduled Snapshots Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;
      unknownSigner = ctx.unknownSigner;
      asset = ctx.asset;

      await executeRbac(asset, [{ role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] }]);
    });

    it("GIVEN a token WHEN triggerSnapshots THEN transaction succeeds", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

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
      await asset.connect(signer_C).setDividend(dividendData_2);
      await asset.connect(signer_C).setDividend(dividendData_3);
      await asset.connect(signer_C).setDividend(dividendData_1);

      const dividend_2_Id = "0x0000000000000000000000000000000000000000000000000000000000000001";
      const dividend_3_Id = "0x0000000000000000000000000000000000000000000000000000000000000002";
      const dividend_1_Id = "0x0000000000000000000000000000000000000000000000000000000000000003";

      // check schedled snapshots
      let scheduledSnapshotCount = await asset.scheduledSnapshotCount(false);
      let scheduledSnapshots = await asset.getScheduledSnapshots(0, 100, false);

      expect(scheduledSnapshotCount).to.equal(3);
      expect(scheduledSnapshots.length).to.equal(scheduledSnapshotCount);
      expect(scheduledSnapshots[0].scheduledTimestamp).to.equal(dividendsRecordDateInSeconds_3);
      expect(scheduledSnapshots[0].data).to.equal(dividend_3_Id);
      expect(scheduledSnapshots[1].scheduledTimestamp).to.equal(dividendsRecordDateInSeconds_2);
      expect(scheduledSnapshots[1].data).to.equal(dividend_2_Id);
      expect(scheduledSnapshots[2].scheduledTimestamp).to.equal(dividendsRecordDateInSeconds_1);
      expect(scheduledSnapshots[2].data).to.equal(dividend_1_Id);

      // AFTER FIRST SCHEDULED SNAPSHOTS ------------------------------------------------------------------
      await asset.changeSystemTimestamp(dividendsRecordDateInSeconds_1 + 1);
      await expect(asset.connect(signer_A).triggerPendingScheduledCrossOrderedTasks())
        .to.emit(asset, "SnapshotTriggered")
        .withArgs(1, dividend_1_Id);

      scheduledSnapshotCount = await asset.scheduledSnapshotCount(false);
      scheduledSnapshots = await asset.getScheduledSnapshots(0, 100, false);

      expect(scheduledSnapshotCount).to.equal(2);
      expect(scheduledSnapshots.length).to.equal(scheduledSnapshotCount);
      expect(scheduledSnapshots[0].scheduledTimestamp).to.equal(dividendsRecordDateInSeconds_3);
      expect(scheduledSnapshots[0].data).to.equal(dividend_3_Id);
      expect(scheduledSnapshots[1].scheduledTimestamp).to.equal(dividendsRecordDateInSeconds_2);
      expect(scheduledSnapshots[1].data).to.equal(dividend_2_Id);

      // AFTER SECOND SCHEDULED SNAPSHOTS ------------------------------------------------------------------
      await asset.changeSystemTimestamp(dividendsRecordDateInSeconds_2 + 1);
      await expect(asset.connect(signer_A).triggerScheduledCrossOrderedTasks(100))
        .to.emit(asset, "SnapshotTriggered")
        .withArgs(2, dividend_2_Id);

      scheduledSnapshotCount = await asset.scheduledSnapshotCount(false);
      scheduledSnapshots = await asset.getScheduledSnapshots(0, 100, false);

      expect(scheduledSnapshotCount).to.equal(1);
      expect(scheduledSnapshots.length).to.equal(scheduledSnapshotCount);
      expect(scheduledSnapshots[0].scheduledTimestamp).to.equal(dividendsRecordDateInSeconds_3);
      expect(scheduledSnapshots[0].data).to.equal(dividend_3_Id);

      // AFTER SECOND SCHEDULED SNAPSHOTS ------------------------------------------------------------------
      await asset.changeSystemTimestamp(dividendsRecordDateInSeconds_3 + 1);
      await expect(asset.connect(signer_A).triggerScheduledCrossOrderedTasks(0))
        .to.emit(asset, "SnapshotTriggered")
        .withArgs(3, dividend_3_Id);

      scheduledSnapshotCount = await asset.scheduledSnapshotCount(false);
      scheduledSnapshots = await asset.getScheduledSnapshots(0, 100, false);

      expect(scheduledSnapshotCount).to.equal(0);
      expect(scheduledSnapshots.length).to.equal(scheduledSnapshotCount);
    });

    it("GIVEN a disabled corporate action WHEN triggerSnapshots is called THEN snapshot is not executed", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

      const dividendsRecordDateInSeconds = dateToUnixTimestamp("2030-01-01T00:00:06Z");
      const dividendsExecutionDateInSeconds = dateToUnixTimestamp("2030-01-01T00:01:00Z");
      const dividendsAmountPerEquity = 1;
      const dividendAmountDecimalsPerEquity = 3;
      const dividendData = {
        recordDate: dividendsRecordDateInSeconds.toString(),
        executionDate: dividendsExecutionDateInSeconds.toString(),
        amount: dividendsAmountPerEquity,
        amountDecimals: dividendAmountDecimalsPerEquity,
      };
      await asset.connect(signer_C).setDividend(dividendData);

      let scheduledSnapshotCount = await asset.scheduledSnapshotCount(false);
      expect(scheduledSnapshotCount).to.equal(1);

      const [dividendBefore] = await asset.getDividend(1);
      expect(dividendBefore.snapshotId).to.equal(0);

      await asset.connect(signer_C).cancelDividend(1);

      await asset.changeSystemTimestamp(dividendsRecordDateInSeconds + 1);

      await expect(asset.connect(signer_A).triggerPendingScheduledCrossOrderedTasks()).not.to.emit(
        asset,
        "SnapshotTriggered",
      );

      scheduledSnapshotCount = await asset.scheduledSnapshotCount(false);
      expect(scheduledSnapshotCount).to.equal(0);

      const [dividendAfter] = await asset.getDividend(1);
      expect(dividendAfter.snapshotId).to.equal(0);
    });

    describe("scheduledSnapshotCount / getScheduledSnapshots: _includeDisabled flag", () => {
      it("GIVEN a cancelled snapshot task WHEN scheduledSnapshotCount(false) THEN returns 0 and (true) returns 1", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

        const recordDate = dateToUnixTimestamp("2030-01-01T00:00:06Z");
        const executionDate = dateToUnixTimestamp("2030-01-01T00:01:00Z");
        await asset.connect(signer_C).setDividend({
          recordDate: recordDate.toString(),
          executionDate: executionDate.toString(),
          amount: 1,
          amountDecimals: 3,
        });

        await asset.connect(signer_C).cancelDividend(1);

        expect(await asset.scheduledSnapshotCount(false)).to.equal(0);
        expect(await asset.scheduledSnapshotCount(true)).to.equal(1);
      });

      it("GIVEN a cancelled snapshot task WHEN getScheduledSnapshots(false) THEN returns empty and (true) returns the task", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CORPORATE_ACTION, signer_C.address);

        const recordDate = dateToUnixTimestamp("2030-01-01T00:00:06Z");
        const executionDate = dateToUnixTimestamp("2030-01-01T00:01:00Z");
        await asset.connect(signer_C).setDividend({
          recordDate: recordDate.toString(),
          executionDate: executionDate.toString(),
          amount: 1,
          amountDecimals: 3,
        });

        await asset.connect(signer_C).cancelDividend(1);

        const excluded = await asset.getScheduledSnapshots(0, 100, false);
        expect(excluded).to.have.lengthOf(0);

        const included = await asset.getScheduledSnapshots(0, 100, true);
        expect(included).to.have.lengthOf(1);
        expect(included[0].scheduledTimestamp).to.equal(BigInt(recordDate));
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN takeSnapshot THEN transaction fails with Deactivated", async () => {
        await expect(asset.takeSnapshot()).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeSnapshots", () => {
      it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeSnapshots is called THEN it reverts with AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeSnapshots()).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN an already-initialised facet WHEN initializeSnapshots is called again THEN it reverts with FacetAlreadyRegistered", async () => {
        await expect(asset.initializeSnapshots()).to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered");
      });

      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeSnapshots is called THEN it emits SnapshotsInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.snapshots);
        await expect(asset.initializeSnapshots()).to.emit(asset, "SnapshotsInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN takeSnapshot THEN reverts with AssetNotOperational", async () => {
        await expect(asset.takeSnapshot()).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
