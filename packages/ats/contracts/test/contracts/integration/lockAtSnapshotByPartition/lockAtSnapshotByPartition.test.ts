// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, EMPTY_STRING, ZERO, RESOLVER_KEY_LOCK_AT_SNAPSHOT_BY_PARTITION } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAssetMockCtx, executeRbac, MAX_UINT256 } from "@test";

const amount = 1000;

export function lockAtSnapshotByPartitionTests(): void {
  describe("LockAtSnapshotByPartition Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    let asset: IAssetMock;

    async function deployFixture() {
      const ctx = await loadFixture(deployAssetMockCtx);
      asset = ctx.asset;
      await asset.setMultiPartition(true);

      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_LOCKER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SNAPSHOT, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
      ]);

      await asset.connect(signer_A).addIssuer(signer_B.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
      await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
    }

    beforeEach(async () => {
      await loadFixture(deployFixture);
    });

    describe("lockedBalanceOfAtSnapshotByPartition", () => {
      it("GIVEN no snapshot taken WHEN lockedBalanceOfAtSnapshotByPartition at id 0 THEN reverts with SnapshotIdNull", async () => {
        await expect(
          asset.lockedBalanceOfAtSnapshotByPartition(DEFAULT_PARTITION, 0, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
      });

      it("GIVEN no snapshot taken WHEN lockedBalanceOfAtSnapshotByPartition at id 1 THEN reverts with SnapshotIdDoesNotExists", async () => {
        await expect(
          asset.lockedBalanceOfAtSnapshotByPartition(DEFAULT_PARTITION, 1, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "SnapshotIdDoesNotExists");
      });

      it("GIVEN a snapshot taken WHEN lockedBalanceOfAtSnapshotByPartition for holder with no locks THEN returns zero", async () => {
        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await asset.connect(signer_A).takeSnapshot();

        const balance = await asset.lockedBalanceOfAtSnapshotByPartition(DEFAULT_PARTITION, 1, signer_A.address);
        expect(balance).to.equal(0);
      });

      it("GIVEN a snapshot taken after lockByPartition WHEN lockedBalanceOfAtSnapshotByPartition THEN returns the exact locked amount at that snapshot", async () => {
        const lockedAmount = 300;

        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await asset.connect(signer_B).lockByPartition(DEFAULT_PARTITION, lockedAmount, signer_A.address, MAX_UINT256);

        await asset.connect(signer_A).takeSnapshot();

        const balance = await asset.lockedBalanceOfAtSnapshotByPartition(DEFAULT_PARTITION, 1, signer_A.address);
        expect(balance).to.equal(lockedAmount);
      });

      it("GIVEN two snapshots where locked amount differs between them WHEN lockedBalanceOfAtSnapshotByPartition at first snapshot THEN returns the value recorded at the first snapshot", async () => {
        const lockedAmountFirst = 100;
        const lockedAmountSecond = 200;

        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        // snapshot 1: no locks yet
        await asset.connect(signer_A).takeSnapshot();

        await asset
          .connect(signer_B)
          .lockByPartition(DEFAULT_PARTITION, lockedAmountFirst, signer_A.address, MAX_UINT256);

        // snapshot 2: first lock active
        await asset.connect(signer_A).takeSnapshot();

        await asset
          .connect(signer_B)
          .lockByPartition(DEFAULT_PARTITION, lockedAmountSecond, signer_A.address, MAX_UINT256);

        const balanceAtSnapshot1 = await asset.lockedBalanceOfAtSnapshotByPartition(
          DEFAULT_PARTITION,
          1,
          signer_A.address,
        );
        const balanceAtSnapshot2 = await asset.lockedBalanceOfAtSnapshotByPartition(
          DEFAULT_PARTITION,
          2,
          signer_A.address,
        );

        expect(balanceAtSnapshot1).to.equal(0);
        expect(balanceAtSnapshot2).to.equal(lockedAmountFirst);
      });

      it("GIVEN two holders each with different locked amounts at snapshot time WHEN lockedBalanceOfAtSnapshotByPartition THEN returns each holder's individual locked amount independently across multiple partitions", async () => {
        const lockedAmountA_P1 = 1;
        const lockedAmountA_P2 = 2;
        const lockedAmountC_P1 = 3;

        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });
        await asset.connect(signer_B).issueByPartition({
          partition: PARTITION_ID_2,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });
        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: amount,
          data: "0x",
        });

        await asset
          .connect(signer_B)
          .lockByPartition(DEFAULT_PARTITION, lockedAmountA_P1, signer_A.address, MAX_UINT256);
        await asset.connect(signer_B).lockByPartition(PARTITION_ID_2, lockedAmountA_P2, signer_A.address, MAX_UINT256);
        await asset
          .connect(signer_B)
          .lockByPartition(DEFAULT_PARTITION, lockedAmountC_P1, signer_C.address, MAX_UINT256);

        await asset.connect(signer_A).takeSnapshot();

        const balanceA_P1 = await asset.lockedBalanceOfAtSnapshotByPartition(DEFAULT_PARTITION, 1, signer_A.address);
        const balanceA_P2 = await asset.lockedBalanceOfAtSnapshotByPartition(PARTITION_ID_2, 1, signer_A.address);
        const balanceC_P1 = await asset.lockedBalanceOfAtSnapshotByPartition(DEFAULT_PARTITION, 1, signer_C.address);
        const balanceC_P2 = await asset.lockedBalanceOfAtSnapshotByPartition(PARTITION_ID_2, 1, signer_C.address);

        expect(balanceA_P1).to.equal(lockedAmountA_P1);
        expect(balanceA_P2).to.equal(lockedAmountA_P2);
        expect(balanceC_P1).to.equal(lockedAmountC_P1);
        expect(balanceC_P2).to.equal(0);
      });
    });

    describe("initializeLockAtSnapshotByPartition", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeLockAtSnapshotByPartition is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeLockAtSnapshotByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeLockAtSnapshotByPartition is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeLockAtSnapshotByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_LOCK_AT_SNAPSHOT_BY_PARTITION, 1);
      });
    });

    describe("initializeLockAtSnapshotByPartition event", () => {
      it("GIVEN a fresh deployment WHEN initializeLockAtSnapshotByPartition is called THEN emits LockAtSnapshotByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_LOCK_AT_SNAPSHOT_BY_PARTITION);
        await expect(asset.initializeLockAtSnapshotByPartition()).to.emit(
          asset,
          "LockAtSnapshotByPartitionInitialized",
        );
      });
    });
  });
}
