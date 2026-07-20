// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, RESOLVER_KEYS } from "@lib";
import { DEFAULT_PARTITION, PARTITION_ID_2, executeRbac, grantKycToHolders, MAX_UINT256 } from "@test";
import type { AssetMockCtx } from "@test";

const amount = 1000;

export function lockAtSnapshotTests(getCtx: () => AssetMockCtx): void {
  describe("LockAtSnapshot Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      await asset.setMultiPartition(true);

      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_LOCKER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SNAPSHOT, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
      ]);

      await asset.connect(signer_A).addIssuer(signer_B.address);
      await grantKycToHolders(asset, signer_B, [signer_A, signer_B, signer_C]);
    });

    describe("lockedBalanceOfAtSnapshot", () => {
      it("GIVEN snapshotId is 0 WHEN lockedBalanceOfAtSnapshot THEN reverts with SnapshotIdNull", async () => {
        await expect(asset.lockedBalanceOfAtSnapshot(0, signer_A.address)).to.be.revertedWithCustomError(
          asset,
          "SnapshotIdNull",
        );
      });

      it("GIVEN no snapshot taken WHEN lockedBalanceOfAtSnapshot at id 1 THEN reverts with SnapshotIdDoesNotExists", async () => {
        await expect(asset.lockedBalanceOfAtSnapshot(1, signer_A.address)).to.be.revertedWithCustomError(
          asset,
          "SnapshotIdDoesNotExists",
        );
      });

      it("GIVEN a snapshot taken for a holder with no locks WHEN lockedBalanceOfAtSnapshot THEN returns zero", async () => {
        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await asset.connect(signer_A).takeSnapshot();

        const balance = await asset.lockedBalanceOfAtSnapshot(1, signer_A.address);
        expect(balance).to.equal(0);
      });

      it("GIVEN a lock exists at snapshot time WHEN lockedBalanceOfAtSnapshot THEN returns the exact locked amount", async () => {
        const lockedAmount = 300;

        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await asset.connect(signer_B).lockByPartition(DEFAULT_PARTITION, lockedAmount, signer_A.address, MAX_UINT256);

        await asset.connect(signer_A).takeSnapshot();

        const balance = await asset.lockedBalanceOfAtSnapshot(1, signer_A.address);
        expect(balance).to.equal(lockedAmount);
      });

      it("GIVEN two snapshots where locked amount differs WHEN lockedBalanceOfAtSnapshot at first snapshot THEN returns value recorded at first snapshot", async () => {
        const lockedAmountFirst = 100;
        const lockedAmountSecond = 250;

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

        const balanceAtSnapshot1 = await asset.lockedBalanceOfAtSnapshot(1, signer_A.address);
        const balanceAtSnapshot2 = await asset.lockedBalanceOfAtSnapshot(2, signer_A.address);

        expect(balanceAtSnapshot1).to.equal(0);
        expect(balanceAtSnapshot2).to.equal(lockedAmountFirst);
      });

      it("GIVEN two holders each with different locked amounts WHEN lockedBalanceOfAtSnapshot THEN returns each holder's individual locked amount independently", async () => {
        const lockedAmountA = 200;
        const lockedAmountC = 450;

        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });
        await asset.connect(signer_B).issueByPartition({
          partition: PARTITION_ID_2,
          tokenHolder: signer_C.address,
          value: amount,
          data: "0x",
        });

        await asset.connect(signer_B).lockByPartition(DEFAULT_PARTITION, lockedAmountA, signer_A.address, MAX_UINT256);
        await asset.connect(signer_B).lockByPartition(PARTITION_ID_2, lockedAmountC, signer_C.address, MAX_UINT256);

        await asset.connect(signer_A).takeSnapshot();

        const balanceA = await asset.lockedBalanceOfAtSnapshot(1, signer_A.address);
        const balanceC = await asset.lockedBalanceOfAtSnapshot(1, signer_C.address);

        expect(balanceA).to.equal(lockedAmountA);
        expect(balanceC).to.equal(lockedAmountC);
      });
    });

    describe("initializeLockAtSnapshot", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeLockAtSnapshot is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeLockAtSnapshot())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeLockAtSnapshot is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeLockAtSnapshot())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.lockAtSnapshot, 1);
      });
    });

    describe("initializeLockAtSnapshot event", () => {
      it("GIVEN a fresh deployment WHEN initializeLockAtSnapshot is called THEN emits LockAtSnapshotInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.lockAtSnapshot);
        await expect(asset.initializeLockAtSnapshot()).to.emit(asset, "LockAtSnapshotInitialized");
      });
    });
  });
}
