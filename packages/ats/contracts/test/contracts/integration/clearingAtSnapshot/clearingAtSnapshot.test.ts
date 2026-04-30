// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset } from "@contract-types";
import { ZERO, EMPTY_STRING, ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

const amount = 1000;
const balanceOf_C_Original = 2 * amount;
const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
const EMPTY_VC_ID = EMPTY_STRING;

describe("ClearingAtSnapshot Tests", () => {
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
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    asset = await ethers.getContractAt("IAsset", base.diamond.target);
    await executeRbac(asset, set_initRbacs());
  }

  function set_initRbacs(): any[] {
    return [
      {
        role: ATS_ROLES.ISSUER_ROLE,
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
});
