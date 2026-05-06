// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ATS_ROLES, EMPTY_STRING, ZERO } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
const EMPTY_VC_ID = EMPTY_STRING;
const amount = 1000;

describe("LockAtSnapshotByPartition Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deployEquity() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: { isMultiPartition: true },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      { role: ATS_ROLES.ISSUER_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.LOCKER_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.SNAPSHOT_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
    ]);

    await asset.connect(signer_A).addIssuer(signer_B.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
    await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
  }

  beforeEach(async () => {
    await loadFixture(deployEquity);
  });

  describe("lockedBalanceOfAtSnapshotByPartition", () => {
    it("GIVEN no snapshot taken WHEN lockedBalanceOfAtSnapshotByPartition at id 0 THEN reverts with SnapshotIdNull", async () => {
      await expect(
        asset.lockedBalanceOfAtSnapshotByPartition(_PARTITION_ID_1, 0, signer_A.address),
      ).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
    });

    it("GIVEN no snapshot taken WHEN lockedBalanceOfAtSnapshotByPartition at id 1 THEN reverts with SnapshotIdDoesNotExists", async () => {
      await expect(
        asset.lockedBalanceOfAtSnapshotByPartition(_PARTITION_ID_1, 1, signer_A.address),
      ).to.be.revertedWithCustomError(asset, "SnapshotIdDoesNotExists");
    });

    it("GIVEN a snapshot taken WHEN lockedBalanceOfAtSnapshotByPartition for holder with no locks THEN returns zero", async () => {
      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      await asset.connect(signer_A).takeSnapshot();

      const balance = await asset.lockedBalanceOfAtSnapshotByPartition(_PARTITION_ID_1, 1, signer_A.address);
      expect(balance).to.equal(0);
    });

    it("GIVEN a snapshot taken after lockByPartition WHEN lockedBalanceOfAtSnapshotByPartition THEN returns the exact locked amount at that snapshot", async () => {
      const lockedAmount = 300;

      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      await asset.connect(signer_B).lockByPartition(_PARTITION_ID_1, lockedAmount, signer_A.address, MAX_UINT256);

      await asset.connect(signer_A).takeSnapshot();

      const balance = await asset.lockedBalanceOfAtSnapshotByPartition(_PARTITION_ID_1, 1, signer_A.address);
      expect(balance).to.equal(lockedAmount);
    });

    it("GIVEN two snapshots where locked amount differs between them WHEN lockedBalanceOfAtSnapshotByPartition at first snapshot THEN returns the value recorded at the first snapshot", async () => {
      const lockedAmountFirst = 100;
      const lockedAmountSecond = 200;

      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      // snapshot 1: no locks yet
      await asset.connect(signer_A).takeSnapshot();

      await asset.connect(signer_B).lockByPartition(_PARTITION_ID_1, lockedAmountFirst, signer_A.address, MAX_UINT256);

      // snapshot 2: first lock active
      await asset.connect(signer_A).takeSnapshot();

      await asset.connect(signer_B).lockByPartition(_PARTITION_ID_1, lockedAmountSecond, signer_A.address, MAX_UINT256);

      const balanceAtSnapshot1 = await asset.lockedBalanceOfAtSnapshotByPartition(_PARTITION_ID_1, 1, signer_A.address);
      const balanceAtSnapshot2 = await asset.lockedBalanceOfAtSnapshotByPartition(_PARTITION_ID_1, 2, signer_A.address);

      expect(balanceAtSnapshot1).to.equal(0);
      expect(balanceAtSnapshot2).to.equal(lockedAmountFirst);
    });

    it("GIVEN two holders each with different locked amounts at snapshot time WHEN lockedBalanceOfAtSnapshotByPartition THEN returns each holder's individual locked amount independently across multiple partitions", async () => {
      const lockedAmountA_P1 = 1;
      const lockedAmountA_P2 = 2;
      const lockedAmountC_P1 = 3;

      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_2,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_C.address,
        value: amount,
        data: "0x",
      });

      await asset.connect(signer_B).lockByPartition(_PARTITION_ID_1, lockedAmountA_P1, signer_A.address, MAX_UINT256);
      await asset.connect(signer_B).lockByPartition(_PARTITION_ID_2, lockedAmountA_P2, signer_A.address, MAX_UINT256);
      await asset.connect(signer_B).lockByPartition(_PARTITION_ID_1, lockedAmountC_P1, signer_C.address, MAX_UINT256);

      await asset.connect(signer_A).takeSnapshot();

      const balanceA_P1 = await asset.lockedBalanceOfAtSnapshotByPartition(_PARTITION_ID_1, 1, signer_A.address);
      const balanceA_P2 = await asset.lockedBalanceOfAtSnapshotByPartition(_PARTITION_ID_2, 1, signer_A.address);
      const balanceC_P1 = await asset.lockedBalanceOfAtSnapshotByPartition(_PARTITION_ID_1, 1, signer_C.address);
      const balanceC_P2 = await asset.lockedBalanceOfAtSnapshotByPartition(_PARTITION_ID_2, 1, signer_C.address);

      expect(balanceA_P1).to.equal(lockedAmountA_P1);
      expect(balanceA_P2).to.equal(lockedAmountA_P2);
      expect(balanceC_P1).to.equal(lockedAmountC_P1);
      expect(balanceC_P2).to.equal(0);
    });
  });
});
