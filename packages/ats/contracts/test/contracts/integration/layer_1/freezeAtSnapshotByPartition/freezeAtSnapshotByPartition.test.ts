// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ZERO, EMPTY_STRING, ATS_ROLES, EQUITY_CONFIG_ID } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, deployAtsInfrastructureFixture, MAX_UINT256 } from "@test";
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
        role: ATS_ROLES.FREEZE_MANAGER_ROLE,
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
    await executeRbac(asset, set_initRbacs());
  }

  beforeEach(async () => {
    await loadFixture(deploySingleParitionFixture);
  });

  it("GIVEN snapshot exists WHEN querying frozen balances by partition THEN returns correct values", async () => {
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
    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeFreezeAtSnapshotByPartition is called THEN it reverts with AccountHasNoRole", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(signer_C).initializeFreezeAtSnapshotByPartition()).to.be.revertedWithCustomError(
        freshAsset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN an already-initialised facet WHEN initializeFreezeAtSnapshotByPartition is called again THEN it reverts with FacetAlreadyRegistered", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await freshAsset.connect(infra.deployer).initializeFreezeAtSnapshotByPartition();
      await expect(
        freshAsset.connect(infra.deployer).initializeFreezeAtSnapshotByPartition(),
      ).to.be.revertedWithCustomError(freshAsset, "FacetAlreadyRegistered");
    });

    it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeFreezeAtSnapshotByPartition is called THEN it emits FreezeAtSnapshotByPartitionInitialized", async () => {
      const { decodeEvent } = await import("@scripts/infrastructure");
      const infra = await loadFixture(deployAtsInfrastructureFixture);
      const proxyTx = await infra.factory.deployProxy(infra.blr.target as string, EQUITY_CONFIG_ID, 1, [
        { role: ATS_ROLES.DEFAULT_ADMIN_ROLE, members: [infra.deployer.address] },
      ]);
      const proxyReceipt = await proxyTx.wait();
      const { proxyAddress } = await decodeEvent(infra.factory, "ProxyDeployed", proxyReceipt!);
      const freshAsset = await ethers.getContractAt("IAsset", proxyAddress as string);
      await expect(freshAsset.connect(infra.deployer).initializeFreezeAtSnapshotByPartition()).to.emit(
        freshAsset,
        "FreezeAtSnapshotByPartitionInitialized",
      );
    });
  });
});
