// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ATS_ROLES, EMPTY_STRING, ZERO } from "@scripts";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const EMPTY_VC_ID = EMPTY_STRING;

describe("BalanceTrackerAtSnapshot Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deployEquity() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.SNAPSHOT_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
    ]);

    await asset.connect(signer_A).addIssuer(signer_B.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
    await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
  }

  beforeEach(async () => {
    await loadFixture(deployEquity);
  });

  describe("balanceOfAtSnapshot", () => {
    it("GIVEN no snapshot taken WHEN balanceOfAtSnapshot at id 0 THEN reverts with SnapshotIdNull", async () => {
      await expect(asset.balanceOfAtSnapshot(0, signer_A.address)).to.be.revertedWithCustomError(
        asset,
        "SnapshotIdNull",
      );
    });

    it("GIVEN no snapshot taken WHEN balanceOfAtSnapshot at unknown id THEN reverts with SnapshotIdDoesNotExists", async () => {
      await expect(asset.balanceOfAtSnapshot(1, signer_A.address)).to.be.revertedWithCustomError(
        asset,
        "SnapshotIdDoesNotExists",
      );
    });

    it("GIVEN a snapshot of a token holder WHEN balanceOfAtSnapshot THEN returns recorded balance", async () => {
      const mintAmount = 1000;
      await asset.connect(signer_B).issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: mintAmount,
        data: "0x",
      });

      await asset.connect(signer_A).takeSnapshot();

      // mutating the balance after the snapshot should not change the snapshotted value
      await asset.connect(signer_B).issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 500,
        data: "0x",
      });

      expect(await asset.balanceOfAtSnapshot(1, signer_A.address)).to.equal(mintAmount);
    });

    it("GIVEN a snapshot WHEN balanceOfAtSnapshot for an account without tokens THEN returns zero", async () => {
      await asset.connect(signer_A).takeSnapshot();
      expect(await asset.balanceOfAtSnapshot(1, signer_C.address)).to.equal(0);
    });
  });

  describe("balancesOfAtSnapshot", () => {
    it("GIVEN multiple holders snapshotted WHEN balancesOfAtSnapshot paginated THEN returns recorded (holder, balance) pairs", async () => {
      const mintAmountA = 1000;
      const mintAmountB = 250;

      await asset.connect(signer_B).issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: mintAmountA,
        data: "0x",
      });
      await asset.connect(signer_B).issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: mintAmountB,
        data: "0x",
      });

      await asset.connect(signer_A).takeSnapshot();

      const page = await asset.balancesOfAtSnapshot(1, 0, 50);
      const balances: Record<string, bigint> = {};
      for (const entry of page) {
        balances[entry.holder] = entry.balance;
      }

      expect(balances[signer_A.address]).to.equal(BigInt(mintAmountA));
      expect(balances[signer_B.address]).to.equal(BigInt(mintAmountB));
    });

    it("GIVEN a snapshot WHEN balancesOfAtSnapshot with id 0 THEN reverts with SnapshotIdNull", async () => {
      await asset.connect(signer_A).takeSnapshot();
      await expect(asset.balancesOfAtSnapshot(0, 0, 50)).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
    });
  });

  describe("totalSupplyAtSnapshot", () => {
    it("GIVEN no snapshot WHEN totalSupplyAtSnapshot at id 0 THEN reverts with SnapshotIdNull", async () => {
      await expect(asset.totalSupplyAtSnapshot(0)).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
    });

    it("GIVEN no snapshot WHEN totalSupplyAtSnapshot at unknown id THEN reverts with SnapshotIdDoesNotExists", async () => {
      await expect(asset.totalSupplyAtSnapshot(1)).to.be.revertedWithCustomError(asset, "SnapshotIdDoesNotExists");
    });

    it("GIVEN tokens issued and a snapshot WHEN totalSupplyAtSnapshot THEN returns recorded total supply", async () => {
      const mintAmount = 1000;
      await asset.connect(signer_B).issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: mintAmount,
        data: "0x",
      });

      await asset.connect(signer_A).takeSnapshot();

      // post-snapshot mint must not influence the snapshotted total supply
      await asset.connect(signer_B).issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 500,
        data: "0x",
      });

      expect(await asset.totalSupplyAtSnapshot(1)).to.equal(mintAmount);
    });
  });
});
