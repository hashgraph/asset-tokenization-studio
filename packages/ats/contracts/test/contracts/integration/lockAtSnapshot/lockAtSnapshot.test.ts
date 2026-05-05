// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ATS_ROLES, EMPTY_STRING, ZERO } from "@scripts";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
const EMPTY_VC_ID = EMPTY_STRING;
const amount = 1000;

describe("LockAtSnapshot Tests", () => {
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
      { role: ATS_ROLES.LOCKER_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
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
        partition: _PARTITION_ID_1,
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
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      await asset.connect(signer_B).lockByPartition(_PARTITION_ID_1, lockedAmount, signer_A.address, MAX_UINT256);

      await asset.connect(signer_A).takeSnapshot();

      const balance = await asset.lockedBalanceOfAtSnapshot(1, signer_A.address);
      expect(balance).to.equal(lockedAmount);
    });

    it("GIVEN two snapshots where locked amount differs WHEN lockedBalanceOfAtSnapshot at first snapshot THEN returns value recorded at first snapshot", async () => {
      const lockedAmountFirst = 100;
      const lockedAmountSecond = 250;

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

      const balanceAtSnapshot1 = await asset.lockedBalanceOfAtSnapshot(1, signer_A.address);
      const balanceAtSnapshot2 = await asset.lockedBalanceOfAtSnapshot(2, signer_A.address);

      expect(balanceAtSnapshot1).to.equal(0);
      expect(balanceAtSnapshot2).to.equal(lockedAmountFirst);
    });

    it("GIVEN two holders each with different locked amounts WHEN lockedBalanceOfAtSnapshot THEN returns each holder's individual locked amount independently", async () => {
      const lockedAmountA = 200;
      const lockedAmountC = 450;

      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_2,
        tokenHolder: signer_C.address,
        value: amount,
        data: "0x",
      });

      await asset.connect(signer_B).lockByPartition(_PARTITION_ID_1, lockedAmountA, signer_A.address, MAX_UINT256);
      await asset.connect(signer_B).lockByPartition(_PARTITION_ID_2, lockedAmountC, signer_C.address, MAX_UINT256);

      await asset.connect(signer_A).takeSnapshot();

      const balanceA = await asset.lockedBalanceOfAtSnapshot(1, signer_A.address);
      const balanceC = await asset.lockedBalanceOfAtSnapshot(1, signer_C.address);

      expect(balanceA).to.equal(lockedAmountA);
      expect(balanceC).to.equal(lockedAmountC);
    });
  });
});
