// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ZERO, EMPTY_STRING, ADDRESS_ZERO, dateToUnixTimestamp, ATS_ROLES } from "@scripts";
import { grantRoleAndPauseToken } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

const amount = 1000;
const balanceOf_C_Original = 2 * amount;
const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
const lockedAmountOf_A_Partition_1 = 1;
const lockedAmountOf_A_Partition_2 = 2;
const lockedAmountOf_C_Partition_1 = 3;
const heldAmountOf_A_Partition_1 = 4;
const heldAmountOf_A_Partition_2 = 5;
const heldAmountOf_C_Partition_1 = 6;
const EMPTY_VC_ID = EMPTY_STRING;
const balanceOf_B_Original = 2 * amount;
const DECIMALS = 6;

describe("Snapshots Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deploySecurityFixtureMultiPartition() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: true,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    await executeRbac(asset, set_initRbacs());
  }

  function set_initRbacs(): any[] {
    return [
      {
        role: ATS_ROLES.ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.LOCKER_ROLE,
        members: [signer_B.address],
      },
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
      {
        role: ATS_ROLES.FREEZE_MANAGER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.CLEARING_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.CLEARING_VALIDATOR_ROLE,
        members: [signer_B.address],
      },
    ];
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureMultiPartition);
  });

  it("GIVEN an account without snapshot role WHEN takeSnapshot THEN transaction fails with AccountHasNoRole", async () => {
    // snapshot fails
    await expect(asset.connect(signer_C).takeSnapshot()).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
  });

  it("GIVEN a paused Token WHEN takeSnapshot THEN transaction fails with TokenIsPaused", async () => {
    // Granting Role to account C and Pause
    await grantRoleAndPauseToken(asset, ATS_ROLES.SNAPSHOT_ROLE, signer_A, signer_B, signer_C.address);

    await expect(asset.connect(signer_C).takeSnapshot()).to.be.revertedWithCustomError(asset, "TokenIsPaused");
  });

  it("GIVEN no snapshot WHEN reading snapshot values THEN transaction fails", async () => {
    // check snapshot
    await expect(asset.balanceOfAtSnapshot(1, signer_A.address)).to.be.revertedWithCustomError(
      asset,
      "SnapshotIdDoesNotExists",
    );
    await expect(asset.balanceOfAtSnapshot(0, signer_A.address)).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
    await expect(asset.totalSupplyAtSnapshot(1)).to.be.revertedWithCustomError(asset, "SnapshotIdDoesNotExists");
    await expect(asset.totalSupplyAtSnapshot(0)).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
    await expect(
      asset.balanceOfAtSnapshotByPartition(_PARTITION_ID_1, 1, signer_A.address),
    ).to.be.revertedWithCustomError(asset, "SnapshotIdDoesNotExists");
    await expect(
      asset.balanceOfAtSnapshotByPartition(_PARTITION_ID_1, 0, signer_A.address),
    ).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
    await expect(asset.partitionsOfAtSnapshot(1, signer_A.address)).to.be.revertedWithCustomError(
      asset,
      "SnapshotIdDoesNotExists",
    );
    await expect(asset.partitionsOfAtSnapshot(0, signer_A.address)).to.be.revertedWithCustomError(
      asset,
      "SnapshotIdNull",
    );

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
  });

  it("GIVEN an account with snapshot role WHEN takeSnapshot THEN transaction succeeds", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.SNAPSHOT_ROLE, signer_C.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

    await asset.connect(signer_A).issueByPartition({
      partition: _PARTITION_ID_1,
      tokenHolder: signer_C.address,
      value: balanceOf_C_Original,
      data: "0x",
    });

    // snapshot
    await expect(asset.connect(signer_C).takeSnapshot()).to.emit(asset, "SnapshotTaken").withArgs(signer_C.address, 1);

    await asset.connect(signer_A).issueByPartition({
      partition: _PARTITION_ID_1,
      tokenHolder: signer_A.address,
      value: amount,
      data: "0x",
    });
    await asset.connect(signer_A).issueByPartition({
      partition: _PARTITION_ID_2,
      tokenHolder: signer_A.address,
      value: amount,
      data: "0x",
    });

    const basicTransferInfo = {
      to: signer_A.address,
      value: amount,
    };

    await asset.connect(signer_C).transferByPartition(_PARTITION_ID_1, basicTransferInfo, "0x");

    await asset
      .connect(signer_B)
      .lockByPartition(_PARTITION_ID_1, lockedAmountOf_A_Partition_1, signer_A.address, MAX_UINT256);
    await asset
      .connect(signer_B)
      .lockByPartition(_PARTITION_ID_1, lockedAmountOf_C_Partition_1, signer_C.address, MAX_UINT256);
    await asset
      .connect(signer_B)
      .lockByPartition(_PARTITION_ID_2, lockedAmountOf_A_Partition_2, signer_A.address, MAX_UINT256);

    const hold = {
      amount: 0,
      expirationTimestamp: MAX_UINT256,
      escrow: signer_B.address,
      to: ADDRESS_ZERO,
      data: "0x",
    };

    hold.amount = heldAmountOf_A_Partition_1;
    await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

    hold.amount = heldAmountOf_C_Partition_1;
    await asset.connect(signer_C).createHoldByPartition(_PARTITION_ID_1, hold);

    hold.amount = heldAmountOf_A_Partition_2;
    await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_2, hold);

    await asset.connect(signer_C).takeSnapshot();

    // check snapshot
    const snapshot_Balance_Of_A_1 = await asset.balanceOfAtSnapshot(1, signer_A.address);
    const snapshot_Balance_Of_C_1 = await asset.balanceOfAtSnapshot(1, signer_C.address);
    const snapshot_TotalTokenHolders_1 = await asset.getTotalTokenHoldersAtSnapshot(1);
    const snapshot_TokenHolders_1 = await asset.getTokenHoldersAtSnapshot(1, 0, snapshot_TotalTokenHolders_1);
    const snapshot_Balance_Of_A_1_Partition_1 = await asset.balanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      1,
      signer_A.address,
    );
    const snapshot_Balance_Of_C_1_Partition_1 = await asset.balanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      1,
      signer_C.address,
    );
    const snapshot_Balance_Of_A_1_Partition_2 = await asset.balanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      1,
      signer_A.address,
    );
    const snapshot_Balance_Of_C_1_Partition_2 = await asset.balanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      1,
      signer_C.address,
    );

    const snapshot_LockedBalance_Of_A_1 = await asset.lockedBalanceOfAtSnapshot(1, signer_A.address);
    const snapshot_LockedBalance_Of_C_1 = await asset.lockedBalanceOfAtSnapshot(1, signer_C.address);
    const snapshot_LockedBalance_Of_A_1_Partition_1 = await asset.lockedBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      1,
      signer_A.address,
    );
    const snapshot_LockedBalance_Of_C_1_Partition_1 = await asset.lockedBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      1,
      signer_C.address,
    );
    const snapshot_LockedBalance_Of_A_1_Partition_2 = await asset.lockedBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      1,
      signer_A.address,
    );
    const snapshot_LockedBalance_Of_C_1_Partition_2 = await asset.lockedBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      1,
      signer_C.address,
    );

    const snapshot_HeldBalance_Of_A_1 = await asset.heldBalanceOfAtSnapshot(1, signer_A.address);
    const snapshot_HeldBalance_Of_C_1 = await asset.heldBalanceOfAtSnapshot(1, signer_C.address);
    const snapshot_HeldBalance_Of_A_1_Partition_1 = await asset.heldBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      1,
      signer_A.address,
    );
    const snapshot_HeldBalance_Of_C_1_Partition_1 = await asset.heldBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      1,
      signer_C.address,
    );
    const snapshot_HeldBalance_Of_A_1_Partition_2 = await asset.heldBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      1,
      signer_A.address,
    );
    const snapshot_HeldBalance_Of_C_1_Partition_2 = await asset.heldBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      1,
      signer_C.address,
    );

    const snapshot_Partitions_Of_A_1 = await asset.partitionsOfAtSnapshot(1, signer_A.address);
    const snapshot_Partitions_Of_C_1 = await asset.partitionsOfAtSnapshot(1, signer_C.address);
    const snapshot_TotalSupply_1 = await asset.totalSupplyAtSnapshot(1);
    const snapshot_TotalSupply_1_Partition_1 = await asset.totalSupplyAtSnapshotByPartition(_PARTITION_ID_1, 1);
    const snapshot_TotalSupply_1_Partition_2 = await asset.totalSupplyAtSnapshotByPartition(_PARTITION_ID_2, 1);

    const snapshot_Balance_Paginated = await asset.balancesOfAtSnapshot(2, 0, 50);
    const snapshot_Balance_Of_A_2 =
      snapshot_Balance_Paginated.find((b) => b.holder.toLowerCase() === signer_A.address.toLowerCase())?.balance ?? 0n;
    const snapshot_Balance_Of_C_2 =
      snapshot_Balance_Paginated.find((b) => b.holder.toLowerCase() === signer_C.address.toLowerCase())?.balance ?? 0n;

    const snapshot_TotalTokenHolders_2 = await asset.getTotalTokenHoldersAtSnapshot(2);
    const snapshot_TokenHolders_2 = await asset.getTokenHoldersAtSnapshot(2, 0, snapshot_TotalTokenHolders_2);
    const snapshot_Balance_Of_A_2_Partition_1 = await asset.balanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      2,
      signer_A.address,
    );
    const snapshot_Balance_Of_C_2_Partition_1 = await asset.balanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      2,
      signer_C.address,
    );
    const snapshot_Balance_Of_A_2_Partition_2 = await asset.balanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      2,
      signer_A.address,
    );
    const snapshot_Balance_Of_C_2_Partition_2 = await asset.balanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      2,
      signer_C.address,
    );

    const snapshot_LockedBalance_Of_A_2 = await asset.lockedBalanceOfAtSnapshot(2, signer_A.address);
    const snapshot_LockedBalance_Of_C_2 = await asset.lockedBalanceOfAtSnapshot(2, signer_C.address);
    const snapshot_LockedBalance_Of_A_2_Partition_1 = await asset.lockedBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      2,
      signer_A.address,
    );
    const snapshot_LockedBalance_Of_C_2_Partition_1 = await asset.lockedBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      2,
      signer_C.address,
    );
    const snapshot_LockedBalance_Of_A_2_Partition_2 = await asset.lockedBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      2,
      signer_A.address,
    );
    const snapshot_LockedBalance_Of_C_2_Partition_2 = await asset.lockedBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      2,
      signer_C.address,
    );

    const snapshot_HeldBalance_Of_A_2 = await asset.heldBalanceOfAtSnapshot(2, signer_A.address);
    const snapshot_HeldBalance_Of_C_2 = await asset.heldBalanceOfAtSnapshot(2, signer_C.address);
    const snapshot_HeldBalance_Of_A_2_Partition_1 = await asset.heldBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      2,
      signer_A.address,
    );
    const snapshot_HeldBalance_Of_C_2_Partition_1 = await asset.heldBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      2,
      signer_C.address,
    );
    const snapshot_HeldBalance_Of_A_2_Partition_2 = await asset.heldBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      2,
      signer_A.address,
    );
    const snapshot_HeldBalance_Of_C_2_Partition_2 = await asset.heldBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      2,
      signer_C.address,
    );

    const snapshot_Partitions_Of_A_2 = await asset.partitionsOfAtSnapshot(2, signer_A.address);
    const snapshot_Partitions_Of_C_2 = await asset.partitionsOfAtSnapshot(2, signer_C.address);
    const snapshot_TotalSupply_2 = await asset.totalSupplyAtSnapshot(2);
    const snapshot_TotalSupply_2_Partition_1 = await asset.totalSupplyAtSnapshotByPartition(_PARTITION_ID_1, 2);
    const snapshot_TotalSupply_2_Partition_2 = await asset.totalSupplyAtSnapshotByPartition(_PARTITION_ID_2, 2);

    const current_Balance_Of_A = await asset.balanceOf(signer_A.address);
    const current_Balance_Of_C = await asset.balanceOf(signer_C.address);
    const current_TotalSupply = await asset.totalSupply();

    expect(snapshot_Balance_Of_A_1).to.equal(0);
    expect(snapshot_Balance_Of_A_1_Partition_1).to.equal(0);
    expect(snapshot_Balance_Of_A_1_Partition_2).to.equal(0);
    expect(snapshot_Partitions_Of_A_1.length).to.equal(0);

    expect(snapshot_Balance_Of_C_1).to.equal(balanceOf_C_Original);
    expect(snapshot_Balance_Of_C_1_Partition_1).to.equal(balanceOf_C_Original);
    expect(snapshot_Balance_Of_C_1_Partition_2).to.equal(0);

    expect(snapshot_LockedBalance_Of_A_1).to.equal(0);
    expect(snapshot_LockedBalance_Of_C_1).to.equal(0);
    expect(snapshot_LockedBalance_Of_A_1_Partition_1).to.equal(0);
    expect(snapshot_LockedBalance_Of_C_1_Partition_1).to.equal(0);
    expect(snapshot_LockedBalance_Of_A_1_Partition_2).to.equal(0);
    expect(snapshot_LockedBalance_Of_C_1_Partition_2).to.equal(0);

    expect(snapshot_HeldBalance_Of_A_1).to.equal(0);
    expect(snapshot_HeldBalance_Of_C_1).to.equal(0);
    expect(snapshot_HeldBalance_Of_A_1_Partition_1).to.equal(0);
    expect(snapshot_HeldBalance_Of_C_1_Partition_1).to.equal(0);
    expect(snapshot_HeldBalance_Of_A_1_Partition_2).to.equal(0);
    expect(snapshot_HeldBalance_Of_C_1_Partition_2).to.equal(0);

    expect(snapshot_Partitions_Of_C_1.length).to.equal(1);
    expect(snapshot_Partitions_Of_C_1[0]).to.equal(_PARTITION_ID_1);

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
    expect(snapshot_Partitions_Of_A_2.length).to.equal(2);
    expect(snapshot_Partitions_Of_A_2[0]).to.equal(_PARTITION_ID_1);
    expect(snapshot_Partitions_Of_A_2[1]).to.equal(_PARTITION_ID_2);

    expect(current_Balance_Of_C).to.equal(
      balanceOf_C_Original - amount - lockedAmountOf_C_Partition_1 - heldAmountOf_C_Partition_1,
    );
    expect(snapshot_Balance_Of_C_2).to.equal(current_Balance_Of_C);
    expect(snapshot_Balance_Of_C_2_Partition_1).to.equal(current_Balance_Of_C);
    expect(snapshot_Balance_Of_C_2_Partition_2).to.equal(0);

    expect(snapshot_LockedBalance_Of_A_2).to.equal(lockedAmountOf_A_Partition_1 + lockedAmountOf_A_Partition_2);
    expect(snapshot_LockedBalance_Of_C_2).to.equal(lockedAmountOf_C_Partition_1);
    expect(snapshot_LockedBalance_Of_A_2_Partition_1).to.equal(lockedAmountOf_A_Partition_1);
    expect(snapshot_LockedBalance_Of_C_2_Partition_1).to.equal(lockedAmountOf_C_Partition_1);
    expect(snapshot_LockedBalance_Of_A_2_Partition_2).to.equal(lockedAmountOf_A_Partition_2);
    expect(snapshot_LockedBalance_Of_C_2_Partition_2).to.equal(0);

    expect(snapshot_HeldBalance_Of_A_2).to.equal(heldAmountOf_A_Partition_1 + heldAmountOf_A_Partition_2);
    expect(snapshot_HeldBalance_Of_C_2).to.equal(heldAmountOf_C_Partition_1);
    expect(snapshot_HeldBalance_Of_A_2_Partition_1).to.equal(heldAmountOf_A_Partition_1);
    expect(snapshot_HeldBalance_Of_C_2_Partition_1).to.equal(heldAmountOf_C_Partition_1);
    expect(snapshot_HeldBalance_Of_A_2_Partition_2).to.equal(heldAmountOf_A_Partition_2);
    expect(snapshot_HeldBalance_Of_C_2_Partition_2).to.equal(0);

    expect(snapshot_Partitions_Of_C_2.length).to.equal(1);
    expect(snapshot_Partitions_Of_C_2[0]).to.equal(_PARTITION_ID_1);

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

  it("GIVEN snapshot exists WHEN querying cleared balances THEN returns correct values", async () => {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: true,
          clearingActive: true,
        },
      },
    });
    const diamond = base.diamond;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, set_initRbacs());
    await asset.connect(signer_A).grantRole(ATS_ROLES.SNAPSHOT_ROLE, signer_C.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

    // Issue tokens to signer_C in two partitions
    await asset.connect(signer_A).issueByPartition({
      partition: _PARTITION_ID_1,
      tokenHolder: signer_C.address,
      value: balanceOf_C_Original,
      data: "0x",
    });

    await asset.connect(signer_A).issueByPartition({
      partition: _PARTITION_ID_2,
      tokenHolder: signer_C.address,
      value: amount,
      data: "0x",
    });

    // Take snapshot before clearing
    await asset.connect(signer_C).takeSnapshot();

    const clearedBalance_C_1 = await asset.clearedBalanceOfAtSnapshot(1, signer_C.address);
    const clearedBalance_C_1_Partition_1 = await asset.clearedBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      1,
      signer_C.address,
    );
    const clearedBalance_C_1_Partition_2 = await asset.clearedBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      1,
      signer_C.address,
    );

    expect(clearedBalance_C_1).to.equal(0);
    expect(clearedBalance_C_1_Partition_1).to.equal(0);
    expect(clearedBalance_C_1_Partition_2).to.equal(0);

    // Create clearing transfer in partition 1
    const clearedAmount_Partition_1 = 800;
    await asset.connect(signer_C).clearingTransferByPartition(
      {
        partition: _PARTITION_ID_1,
        expirationTimestamp: MAX_UINT256,
        data: "0x",
      },
      clearedAmount_Partition_1,
      signer_A.address,
    );

    // Create clearing transfer in partition 2
    const clearedAmount_Partition_2 = 500;
    await asset.connect(signer_C).clearingTransferByPartition(
      {
        partition: _PARTITION_ID_2,
        expirationTimestamp: MAX_UINT256,
        data: "0x",
      },
      clearedAmount_Partition_2,
      signer_A.address,
    );

    // Take snapshot after clearing
    await asset.connect(signer_C).takeSnapshot();

    const clearedBalance_C_2 = await asset.clearedBalanceOfAtSnapshot(2, signer_C.address);
    const clearedBalance_C_2_Partition_1 = await asset.clearedBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      2,
      signer_C.address,
    );
    const clearedBalance_C_2_Partition_2 = await asset.clearedBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      2,
      signer_C.address,
    );

    expect(clearedBalance_C_2).to.equal(clearedAmount_Partition_1 + clearedAmount_Partition_2);
    expect(clearedBalance_C_2_Partition_1).to.equal(clearedAmount_Partition_1);
    expect(clearedBalance_C_2_Partition_2).to.equal(clearedAmount_Partition_2);

    // Verify that cleared balances reduce the available balance
    const currentBalance_C = await asset.balanceOf(signer_C.address);
    expect(currentBalance_C).to.equal(
      balanceOf_C_Original + amount - clearedAmount_Partition_1 - clearedAmount_Partition_2,
    );

    const currentBalance_C_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_C.address);
    expect(currentBalance_C_Partition_1).to.equal(balanceOf_C_Original - clearedAmount_Partition_1);

    const currentBalance_C_Partition_2 = await asset.balanceOfByPartition(_PARTITION_ID_2, signer_C.address);
    expect(currentBalance_C_Partition_2).to.equal(amount - clearedAmount_Partition_2);
  });

  it("GIVEN snapshot exists WHEN querying frozen balances THEN returns correct values", async () => {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: false,
        },
      },
    });
    const diamond = base.diamond;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, set_initRbacs());

    await asset.connect(signer_A).grantRole(ATS_ROLES.SNAPSHOT_ROLE, signer_C.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

    await asset.connect(signer_A).issueByPartition({
      partition: _PARTITION_ID_1,
      tokenHolder: signer_C.address,
      value: balanceOf_C_Original,
      data: "0x",
    });

    await asset.connect(signer_C).takeSnapshot();

    const frozenBalance_C_1 = await asset.frozenBalanceOfAtSnapshot(1, signer_C.address);
    const frozenBalance_C_1_Partition_1 = await asset.frozenBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      1,
      signer_C.address,
    );

    expect(frozenBalance_C_1).to.equal(0);
    expect(frozenBalance_C_1_Partition_1).to.equal(0);

    // Freeze some tokens
    const frozenAmount = 500;
    await asset.connect(signer_B).freezePartialTokens(signer_C.address, frozenAmount);

    // Take snapshot after freezing
    await asset.connect(signer_C).takeSnapshot();

    const frozenBalance_C_2 = await asset.frozenBalanceOfAtSnapshot(2, signer_C.address);
    const frozenBalance_C_2_Partition_1 = await asset.frozenBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      2,
      signer_C.address,
    );

    expect(frozenBalance_C_2).to.equal(frozenAmount);
    expect(frozenBalance_C_2_Partition_1).to.equal(frozenAmount);

    // Verify current frozen balance
    const currentFrozenBalance = await asset.getFrozenTokens(signer_C.address);
    expect(currentFrozenBalance).to.equal(frozenAmount);

    // Verify free balance is reduced
    const currentFreeBalance = await asset.balanceOf(signer_C.address);
    expect(currentFreeBalance).to.equal(balanceOf_C_Original - frozenAmount);
  });

  it("GIVEN multiple snapshots WHEN querying token holders pagination THEN returns correct holders list", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.SNAPSHOT_ROLE, signer_C.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

    await asset.connect(signer_A).issueByPartition({
      partition: _PARTITION_ID_1,
      tokenHolder: signer_C.address,
      value: balanceOf_C_Original,
      data: "0x",
    });

    await asset.connect(signer_A).issueByPartition({
      partition: _PARTITION_ID_1,
      tokenHolder: signer_A.address,
      value: amount,
      data: "0x",
    });

    await asset.connect(signer_A).issueByPartition({
      partition: _PARTITION_ID_1,
      tokenHolder: signer_B.address,
      value: amount,
      data: "0x",
    });

    await asset.connect(signer_C).takeSnapshot();

    const totalHolders = await asset.getTotalTokenHoldersAtSnapshot(1);
    expect(totalHolders).to.equal(3);

    // Test pagination - get 2 holders per page
    const holders_page_0 = await asset.getTokenHoldersAtSnapshot(1, 0, 2);
    expect(holders_page_0.length).to.equal(2);
    // Verify page 0 contains 2 of the expected holders
    const expectedHolders = [signer_C.address, signer_A.address, signer_B.address];
    holders_page_0.forEach((holder) => {
      expect(expectedHolders).to.include(holder);
    });

    const holders_page_1 = await asset.getTokenHoldersAtSnapshot(1, 1, 2);
    expect(holders_page_1.length).to.equal(1);
    // Verify page 1 contains 1 of the expected holders
    holders_page_1.forEach((holder) => {
      expect(expectedHolders).to.include(holder);
    });

    // Combine all holders from both pages
    const allHolders = [...holders_page_0, ...holders_page_1];
    const uniqueHolders = [...new Set(allHolders)];
    expect(uniqueHolders.length).to.equal(3);

    // Get all holders in one call to verify consistency
    const allHolders_single_call = await asset.getTokenHoldersAtSnapshot(1, 0, 10);
    expect(allHolders_single_call.length).to.equal(3);
    expect([...allHolders_single_call]).to.have.members([signer_C.address, signer_A.address, signer_B.address]);
  });

  describe("Scheduled tasks", async () => {
    it("GIVEN an account with snapshot role WHEN takeSnapshot THEN scheduled tasks get executed succeeds", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.SNAPSHOT_ROLE, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_A.address);

      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);

      await asset.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_C.address,
        value: balanceOf_C_Original,
        data: "0x",
      });
      await asset.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_2,
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
        _PARTITION_ID_1,
        1,
        signer_C.address,
      );
      const balance_C_At_Snapshot_2_partition_1 = await asset.balanceOfAtSnapshotByPartition(
        _PARTITION_ID_1,
        2,
        signer_C.address,
      );
      const balance_C_At_Snapshot_3_partition_1 = await asset.balanceOfAtSnapshotByPartition(
        _PARTITION_ID_1,
        3,
        signer_C.address,
      );
      const balance_C_At_Snapshot_4_partition_1 = await asset.balanceOfAtSnapshotByPartition(
        _PARTITION_ID_1,
        4,
        signer_C.address,
      );

      expect(balance_C_At_Snapshot_1_partition_1).to.be.equal(balanceOf_C_Original);
      expect(balance_C_At_Snapshot_2_partition_1).to.be.equal(balanceOf_C_Original * adjustmentFactor_1);
      expect(balance_C_At_Snapshot_3_partition_1).to.be.equal(balanceOf_C_Original * adjustmentFactor_2);
      expect(balance_C_At_Snapshot_4_partition_1).to.be.equal(balanceOf_C_Original * adjustmentFactor_3);

      const balance_C_At_Snapshot_1_partition_2 = await asset.balanceOfAtSnapshotByPartition(
        _PARTITION_ID_2,
        1,
        signer_C.address,
      );
      const balance_C_At_Snapshot_2_partition_2 = await asset.balanceOfAtSnapshotByPartition(
        _PARTITION_ID_2,
        2,
        signer_C.address,
      );
      const balance_C_At_Snapshot_3_partition_2 = await asset.balanceOfAtSnapshotByPartition(
        _PARTITION_ID_2,
        3,
        signer_C.address,
      );
      const balance_C_At_Snapshot_4_partition_2 = await asset.balanceOfAtSnapshotByPartition(
        _PARTITION_ID_2,
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
      expect(totalSupply_At_Snapshot_2).to.be.equal((balanceOf_C_Original + balanceOf_B_Original) * adjustmentFactor_1);
      expect(totalSupply_At_Snapshot_3).to.be.equal((balanceOf_C_Original + balanceOf_B_Original) * adjustmentFactor_2);
      expect(totalSupply_At_Snapshot_4).to.be.equal((balanceOf_C_Original + balanceOf_B_Original) * adjustmentFactor_3);
    });
  });
});
