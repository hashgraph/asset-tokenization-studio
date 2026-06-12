// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ATS_ROLES, EMPTY_STRING, ZERO, RESOLVER_KEY_BALANCE_TRACKER_AT_SNAPSHOT_BY_PARTITION } from "@scripts";
import { deployAssetMockCtx, executeRbac, MAX_UINT256 } from "@test";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _UNKNOWN_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000002";
const EMPTY_VC_ID = EMPTY_STRING;

export function balanceTrackerAtSnapshotByPartitionTests(): void {
  describe("BalanceTrackerAtSnapshotByPartition Tests", () => {
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
        {
          role: ATS_ROLES.ROLE_ISSUER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_KYC,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_SNAPSHOT,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_SSI_MANAGER,
          members: [signer_A.address],
        },
      ]);

      await asset.connect(signer_A).addIssuer(signer_B.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
      await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
    }

    beforeEach(async () => {
      await loadFixture(deployFixture);
    });

    describe("balanceOfAtSnapshotByPartition", () => {
      it("GIVEN no snapshot taken WHEN balanceOfAtSnapshotByPartition at id 0 THEN reverts with SnapshotIdNull", async () => {
        await expect(
          asset.balanceOfAtSnapshotByPartition(_DEFAULT_PARTITION, 0, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
      });

      it("GIVEN no snapshot taken WHEN balanceOfAtSnapshotByPartition at unknown id THEN reverts with SnapshotIdDoesNotExists", async () => {
        await expect(
          asset.balanceOfAtSnapshotByPartition(_DEFAULT_PARTITION, 1, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "SnapshotIdDoesNotExists");
      });

      it("GIVEN a snapshot of a token holder WHEN balanceOfAtSnapshotByPartition THEN returns recorded balance", async () => {
        const mintAmount = 1000;
        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: mintAmount,
          data: "0x",
        });

        await asset.connect(signer_A).takeSnapshot();

        // mutating the partition balance after the snapshot must not change the snapshotted value
        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 500,
          data: "0x",
        });

        expect(await asset.balanceOfAtSnapshotByPartition(_DEFAULT_PARTITION, 1, signer_A.address)).to.equal(
          mintAmount,
        );
      });

      it("GIVEN a snapshot WHEN balanceOfAtSnapshotByPartition for an unknown partition THEN returns zero", async () => {
        await asset.connect(signer_A).takeSnapshot();
        expect(await asset.balanceOfAtSnapshotByPartition(_UNKNOWN_PARTITION, 1, signer_A.address)).to.equal(0);
      });

      it("GIVEN a snapshot WHEN balanceOfAtSnapshotByPartition for an account without tokens THEN returns zero", async () => {
        await asset.connect(signer_A).takeSnapshot();
        expect(await asset.balanceOfAtSnapshotByPartition(_DEFAULT_PARTITION, 1, signer_C.address)).to.equal(0);
      });
    });

    describe("totalSupplyAtSnapshotByPartition", () => {
      it("GIVEN no snapshot WHEN totalSupplyAtSnapshotByPartition at id 0 THEN reverts with SnapshotIdNull", async () => {
        await expect(asset.totalSupplyAtSnapshotByPartition(_DEFAULT_PARTITION, 0)).to.be.revertedWithCustomError(
          asset,
          "SnapshotIdNull",
        );
      });

      it("GIVEN no snapshot WHEN totalSupplyAtSnapshotByPartition at unknown id THEN reverts with SnapshotIdDoesNotExists", async () => {
        await expect(asset.totalSupplyAtSnapshotByPartition(_DEFAULT_PARTITION, 1)).to.be.revertedWithCustomError(
          asset,
          "SnapshotIdDoesNotExists",
        );
      });

      it("GIVEN tokens issued and a snapshot WHEN totalSupplyAtSnapshotByPartition THEN returns recorded total supply", async () => {
        const mintAmount = 1000;
        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: mintAmount,
          data: "0x",
        });

        await asset.connect(signer_A).takeSnapshot();

        // post-snapshot mint must not influence the snapshotted partition supply
        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 500,
          data: "0x",
        });

        expect(await asset.totalSupplyAtSnapshotByPartition(_DEFAULT_PARTITION, 1)).to.equal(mintAmount);
      });

      it("GIVEN a snapshot WHEN totalSupplyAtSnapshotByPartition for an unknown partition THEN returns zero", async () => {
        await asset.connect(signer_A).takeSnapshot();
        expect(await asset.totalSupplyAtSnapshotByPartition(_UNKNOWN_PARTITION, 1)).to.equal(0);
      });
    });
    describe("initializeBalanceTrackerAtSnapshotByPartition", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeBalanceTrackerAtSnapshotByPartition is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeBalanceTrackerAtSnapshotByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeBalanceTrackerAtSnapshotByPartition is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeBalanceTrackerAtSnapshotByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_BALANCE_TRACKER_AT_SNAPSHOT_BY_PARTITION, 1);
      });
    });

    describe("initializeBalanceTrackerAtSnapshotByPartition event", () => {
      it("GIVEN a fresh deployment WHEN initializeBalanceTrackerAtSnapshotByPartition is called THEN emits BalanceTrackerAtSnapshotByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_BALANCE_TRACKER_AT_SNAPSHOT_BY_PARTITION);
        await expect(asset.initializeBalanceTrackerAtSnapshotByPartition()).to.emit(
          asset,
          "BalanceTrackerAtSnapshotByPartitionInitialized",
        );
      });
    });
  });
}
