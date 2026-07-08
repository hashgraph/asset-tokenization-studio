// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, RESOLVER_KEYS } from "@scripts";
import { DEFAULT_PARTITION, PARTITION_ID_2, executeRbac, grantKycToHolders, MAX_UINT256 } from "@test";
import type { AssetMockCtx } from "@test";

const amount = 1000;

export function holdAtSnapshotTests(getCtx: () => AssetMockCtx): void {
  describe("HoldAtSnapshot Tests", () => {
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
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SNAPSHOT, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
      ]);

      await asset.connect(signer_A).addIssuer(signer_B.address);
      await grantKycToHolders(asset, signer_B, [signer_A, signer_B, signer_C]);
    });

    describe("heldBalanceOfAtSnapshot", () => {
      it("GIVEN no snapshot taken WHEN heldBalanceOfAtSnapshot at id 0 THEN reverts with SnapshotIdNull", async () => {
        await expect(asset.heldBalanceOfAtSnapshot(0, signer_A.address)).to.be.revertedWithCustomError(
          asset,
          "SnapshotIdNull",
        );
      });

      it("GIVEN no snapshot taken WHEN heldBalanceOfAtSnapshot at id 1 THEN reverts with SnapshotIdDoesNotExists", async () => {
        await expect(asset.heldBalanceOfAtSnapshot(1, signer_A.address)).to.be.revertedWithCustomError(
          asset,
          "SnapshotIdDoesNotExists",
        );
      });

      it("GIVEN a snapshot taken WHEN heldBalanceOfAtSnapshot for holder with no holds THEN returns zero", async () => {
        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await asset.connect(signer_A).takeSnapshot();

        const balance = await asset.heldBalanceOfAtSnapshot(1, signer_A.address);
        expect(balance).to.equal(0);
      });

      it("GIVEN a snapshot taken after createHoldByPartition WHEN heldBalanceOfAtSnapshot THEN returns the exact held amount at that snapshot", async () => {
        const heldAmount = 300;

        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await asset.connect(signer_A).createHoldByPartition(DEFAULT_PARTITION, {
          amount: heldAmount,
          expirationTimestamp: MAX_UINT256,
          escrow: signer_B.address,
          to: signer_C.address,
          data: "0x",
        });

        await asset.connect(signer_A).takeSnapshot();

        const balance = await asset.heldBalanceOfAtSnapshot(1, signer_A.address);
        expect(balance).to.equal(heldAmount);
      });

      it("GIVEN two snapshots where held amount differs between them WHEN heldBalanceOfAtSnapshot at first snapshot THEN returns the value recorded at the first snapshot", async () => {
        const heldAmountFirst = 100;
        const heldAmountSecond = 250;

        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        // snapshot 1: no holds yet
        await asset.connect(signer_A).takeSnapshot();

        await asset.connect(signer_A).createHoldByPartition(DEFAULT_PARTITION, {
          amount: heldAmountFirst,
          expirationTimestamp: MAX_UINT256,
          escrow: signer_B.address,
          to: signer_C.address,
          data: "0x",
        });

        // snapshot 2: first hold active
        await asset.connect(signer_A).takeSnapshot();

        await asset.connect(signer_A).createHoldByPartition(DEFAULT_PARTITION, {
          amount: heldAmountSecond,
          expirationTimestamp: MAX_UINT256,
          escrow: signer_B.address,
          to: signer_C.address,
          data: "0x",
        });

        const balanceAtSnapshot1 = await asset.heldBalanceOfAtSnapshot(1, signer_A.address);
        const balanceAtSnapshot2 = await asset.heldBalanceOfAtSnapshot(2, signer_A.address);

        expect(balanceAtSnapshot1).to.equal(0);
        expect(balanceAtSnapshot2).to.equal(heldAmountFirst);
      });

      it("GIVEN two holders each with different held amounts at snapshot time WHEN heldBalanceOfAtSnapshot THEN returns each holder's individual held amount independently", async () => {
        const heldAmountA = 200;
        const heldAmountC = 450;

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

        await asset.connect(signer_A).createHoldByPartition(DEFAULT_PARTITION, {
          amount: heldAmountA,
          expirationTimestamp: MAX_UINT256,
          escrow: signer_B.address,
          to: signer_C.address,
          data: "0x",
        });
        await asset.connect(signer_C).createHoldByPartition(PARTITION_ID_2, {
          amount: heldAmountC,
          expirationTimestamp: MAX_UINT256,
          escrow: signer_B.address,
          to: signer_A.address,
          data: "0x",
        });

        await asset.connect(signer_A).takeSnapshot();

        const balanceA = await asset.heldBalanceOfAtSnapshot(1, signer_A.address);
        const balanceC = await asset.heldBalanceOfAtSnapshot(1, signer_C.address);

        expect(balanceA).to.equal(heldAmountA);
        expect(balanceC).to.equal(heldAmountC);
      });
    });

    describe("initializeHoldAtSnapshot", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeHoldAtSnapshot is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeHoldAtSnapshot())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeHoldAtSnapshot is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeHoldAtSnapshot())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.holdAtSnapshot, 1);
      });
    });

    describe("initializeHoldAtSnapshot event", () => {
      it("GIVEN a fresh deployment WHEN initializeHoldAtSnapshot is called THEN emits HoldAtSnapshotInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.holdAtSnapshot);
        await expect(asset.initializeHoldAtSnapshot()).to.emit(asset, "HoldAtSnapshotInitialized");
      });
    });
  });
}
