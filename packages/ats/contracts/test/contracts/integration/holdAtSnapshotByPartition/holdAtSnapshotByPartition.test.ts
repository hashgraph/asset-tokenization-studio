// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, MockDiamondCut } from "@contract-types";
import { ZERO, EMPTY_STRING, ADDRESS_ZERO, ATS_ROLES, HOLD_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

const amount = 1000;
const balanceOf_C_Original = 2 * amount;
const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
const heldAmountOf_A_Partition_1 = 4;
const heldAmountOf_A_Partition_2 = 5;
const heldAmountOf_C_Partition_1 = 6;
const EMPTY_VC_ID = EMPTY_STRING;

describe("HoldAtSnapshotByPartition Tests", () => {
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

  async function deploySecurityFixtureMultiPartition() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: true,
        },
      },
    });
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    asset = await ethers.getContractAt("IAsset", base.diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", base.diamond.target);
    await executeRbac(asset, set_initRbacs());
  }

  function set_initRbacs(): any[] {
    return [
      {
        role: ATS_ROLES.ROLE_ISSUER,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_PAUSER,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_KYC,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_SSI_MANAGER,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_FREEZE_MANAGER,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_CLEARING,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_CLEARING_VALIDATOR,
        members: [signer_B.address],
      },
    ];
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureMultiPartition);
  });

  it("GIVEN no snapshot WHEN querying heldBalanceOfAtSnapshotByPartition with id 0 THEN transaction fails with SnapshotIdNull", async () => {
    await expect(
      asset.heldBalanceOfAtSnapshotByPartition(_PARTITION_ID_1, 0, signer_A.address),
    ).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
  });

  it("GIVEN no snapshot WHEN querying heldBalanceOfAtSnapshotByPartition with unknown id THEN transaction fails with SnapshotIdDoesNotExists", async () => {
    await expect(
      asset.heldBalanceOfAtSnapshotByPartition(_PARTITION_ID_1, 1, signer_A.address),
    ).to.be.revertedWithCustomError(asset, "SnapshotIdDoesNotExists");
  });

  it("GIVEN snapshot exists WHEN querying held balances by partition THEN returns correct values", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_C.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

    // Issue tokens to signer_C in partition 1 and to signer_A in both partitions
    await asset.connect(signer_A).issueByPartition({
      partition: _PARTITION_ID_1,
      tokenHolder: signer_C.address,
      value: balanceOf_C_Original,
      data: "0x",
    });

    const basicTransferInfo = { to: signer_A.address, value: amount };
    await asset.connect(signer_C).transferByPartition(_PARTITION_ID_1, basicTransferInfo, "0x");

    await asset.connect(signer_A).issueByPartition({
      partition: _PARTITION_ID_2,
      tokenHolder: signer_A.address,
      value: amount,
      data: "0x",
    });

    // Take snapshot 1 — before any holds
    await asset.connect(signer_C).takeSnapshot();

    const heldBalance_A_1_Partition_1 = await asset.heldBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      1,
      signer_A.address,
    );
    const heldBalance_C_1_Partition_1 = await asset.heldBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      1,
      signer_C.address,
    );
    const heldBalance_A_1_Partition_2 = await asset.heldBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      1,
      signer_A.address,
    );
    const heldBalance_C_1_Partition_2 = await asset.heldBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      1,
      signer_C.address,
    );

    expect(heldBalance_A_1_Partition_1).to.equal(0);
    expect(heldBalance_C_1_Partition_1).to.equal(0);
    expect(heldBalance_A_1_Partition_2).to.equal(0);
    expect(heldBalance_C_1_Partition_2).to.equal(0);

    // Create holds in both partitions
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

    // Take snapshot 2 — after holds
    await asset.connect(signer_C).takeSnapshot();

    const heldBalance_A_2_Partition_1 = await asset.heldBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      2,
      signer_A.address,
    );
    const heldBalance_C_2_Partition_1 = await asset.heldBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      2,
      signer_C.address,
    );
    const heldBalance_A_2_Partition_2 = await asset.heldBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      2,
      signer_A.address,
    );
    const heldBalance_C_2_Partition_2 = await asset.heldBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_2,
      2,
      signer_C.address,
    );

    expect(heldBalance_A_2_Partition_1).to.equal(heldAmountOf_A_Partition_1);
    expect(heldBalance_C_2_Partition_1).to.equal(heldAmountOf_C_Partition_1);
    expect(heldBalance_A_2_Partition_2).to.equal(heldAmountOf_A_Partition_2);
    expect(heldBalance_C_2_Partition_2).to.equal(0);
  });

  describe("initializeHoldAtSnapshotByPartition", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeHoldAtSnapshotByPartition is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeHoldAtSnapshotByPartition())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeHoldAtSnapshotByPartition is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeHoldAtSnapshotByPartition())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(HOLD_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY, 1);
    });
  });

  describe("initializeHoldAtSnapshotByPartition event", () => {
    it("GIVEN a fresh deployment WHEN initializeHoldAtSnapshotByPartition is called THEN emits HoldAtSnapshotByPartitionInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(HOLD_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY);
      await expect(asset.initializeHoldAtSnapshotByPartition()).to.emit(asset, "HoldAtSnapshotByPartitionInitialized");
    });
  });
});
