// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset, MockDiamondCut } from "@contract-types";
import { ZERO, EMPTY_STRING, ATS_ROLES, FREEZE_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

const balanceOf_C_Original = 2000;
const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const EMPTY_VC_ID = EMPTY_STRING;

describe("FreezeAtSnapshotByPartition Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;

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
    ];
  }

  async function deploySingleParitionFixture() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: false,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);
    await executeRbac(asset, set_initRbacs());
  }

  beforeEach(async () => {
    await loadFixture(deploySingleParitionFixture);
  });

  it("GIVEN snapshot exists WHEN querying frozen balances by partition THEN returns correct values", async () => {
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_C.address);
    await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);

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

    const frozenBalance_C_1_Partition_1 = await asset.frozenBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      1,
      signer_C.address,
    );
    expect(frozenBalance_C_1_Partition_1).to.equal(0);

    // Freeze some tokens
    const frozenAmount = 500;
    await asset.connect(signer_B).freezePartialTokens(signer_C.address, frozenAmount);

    // Take snapshot after freezing
    await asset.connect(signer_C).takeSnapshot();

    const frozenBalance_C_2_Partition_1 = await asset.frozenBalanceOfAtSnapshotByPartition(
      _PARTITION_ID_1,
      2,
      signer_C.address,
    );
    expect(frozenBalance_C_2_Partition_1).to.equal(frozenAmount);

    // Verify current frozen balance is consistent with the snapshot read
    const currentFrozenBalance = await asset.getFrozenTokens(signer_C.address);
    expect(currentFrozenBalance).to.equal(frozenAmount);
  });

  describe("initializeFreezeAtSnapshotByPartition", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeFreezeAtSnapshotByPartition is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeFreezeAtSnapshotByPartition())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeFreezeAtSnapshotByPartition is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeFreezeAtSnapshotByPartition())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(FREEZE_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY, 1);
    });
  });

  describe("initializeFreezeAtSnapshotByPartition event", () => {
    it("GIVEN a fresh deployment WHEN initializeFreezeAtSnapshotByPartition is called THEN emits FreezeAtSnapshotByPartitionInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(FREEZE_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY);
      await expect(asset.initializeFreezeAtSnapshotByPartition()).to.emit(
        asset,
        "FreezeAtSnapshotByPartitionInitialized",
      );
    });
  });
});
