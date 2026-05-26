// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  type IAsset,
  type ResolverProxy,
  ISnapshotsByPartition__factory,
  MockDiamondCut,
  ISnapshotsByPartition,
} from "@contract-types";
import { ZERO, EMPTY_STRING, ATS_ROLES, SNAPSHOTS_BY_PARTITION_RESOLVER_KEY } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
const EMPTY_VC_ID = EMPTY_STRING;
const amount = 1000;

describe("SnapshotsByPartition Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;
  let mockDiamondCut: MockDiamondCut;
  let snapshotsByPartitionFacet: ISnapshotsByPartition;

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
    mockDiamondCut = await ethers.getContractAt("MockDiamondCut", diamond.target);
    snapshotsByPartitionFacet = ISnapshotsByPartition__factory.connect(await diamond.getAddress(), signer_A);
    await executeRbac(asset, [
      { role: ATS_ROLES.ISSUER_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
    ]);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureMultiPartition);
  });

  describe("AccessControl", () => {
    it("GIVEN any caller WHEN partitionsOfAtSnapshot with snapshotId zero THEN reverts with SnapshotIdNull", async () => {
      await expect(snapshotsByPartitionFacet.partitionsOfAtSnapshot(0, signer_A.address)).to.be.revertedWithCustomError(
        snapshotsByPartitionFacet,
        "SnapshotIdNull",
      );
    });

    it("GIVEN any caller WHEN partitionsOfAtSnapshot with non-existent snapshot THEN reverts with SnapshotIdDoesNotExists", async () => {
      await expect(snapshotsByPartitionFacet.partitionsOfAtSnapshot(1, signer_A.address)).to.be.revertedWithCustomError(
        snapshotsByPartitionFacet,
        "SnapshotIdDoesNotExists",
      );
    });
  });

  describe("partitionsOfAtSnapshot", () => {
    it("GIVEN an account with no tokens at snapshot THEN returns empty partition list", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.SNAPSHOT_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await asset.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_C.address,
        value: amount,
        data: "0x",
      });

      await asset.connect(signer_C).takeSnapshot();

      const partitions = await snapshotsByPartitionFacet.partitionsOfAtSnapshot(1, signer_A.address);
      expect(partitions.length).to.equal(0);
    });

    it("GIVEN a token holder with a single partition at snapshot THEN returns that partition", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.SNAPSHOT_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await asset.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_C.address,
        value: amount,
        data: "0x",
      });

      await asset.connect(signer_C).takeSnapshot();

      const partitions = await snapshotsByPartitionFacet.partitionsOfAtSnapshot(1, signer_C.address);
      expect(partitions.length).to.equal(1);
      expect(partitions[0]).to.equal(_PARTITION_ID_1);
    });

    it("GIVEN a token holder with multiple partitions at snapshot THEN returns all partitions", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.SNAPSHOT_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

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

      await asset.connect(signer_C).takeSnapshot();

      const partitions = await snapshotsByPartitionFacet.partitionsOfAtSnapshot(1, signer_A.address);
      expect(partitions.length).to.equal(2);
      expect([...partitions]).to.have.members([_PARTITION_ID_1, _PARTITION_ID_2]);
    });

    it("GIVEN token transfers after snapshot THEN partitions reflect state at snapshot time", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.SNAPSHOT_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await asset.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_C.address,
        value: amount,
        data: "0x",
      });

      // Snapshot 1: C has only partition 1
      await asset.connect(signer_C).takeSnapshot();

      // After snapshot: C receives partition 2 tokens
      await asset.connect(signer_A).issueByPartition({
        partition: _PARTITION_ID_2,
        tokenHolder: signer_C.address,
        value: amount,
        data: "0x",
      });

      // Snapshot 2: C now has partitions 1 and 2
      await asset.connect(signer_C).takeSnapshot();

      const partitionsAtSnapshot1 = await snapshotsByPartitionFacet.partitionsOfAtSnapshot(1, signer_C.address);
      expect(partitionsAtSnapshot1.length).to.equal(1);
      expect(partitionsAtSnapshot1[0]).to.equal(_PARTITION_ID_1);

      const partitionsAtSnapshot2 = await snapshotsByPartitionFacet.partitionsOfAtSnapshot(2, signer_C.address);
      expect(partitionsAtSnapshot2.length).to.equal(2);
      expect([...partitionsAtSnapshot2]).to.have.members([_PARTITION_ID_1, _PARTITION_ID_2]);
    });
  });

  describe("initializeSnapshotsByPartition", () => {
    it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeSnapshotsByPartition is called THEN AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeSnapshotsByPartition())
        .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
        .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
    });

    it("GIVEN already-initialised WHEN initializeSnapshotsByPartition is called again THEN FacetAlreadyRegistered", async () => {
      await expect(asset.initializeSnapshotsByPartition())
        .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
        .withArgs(SNAPSHOTS_BY_PARTITION_RESOLVER_KEY, 1);
    });
  });

  describe("initializeSnapshotsByPartition event", () => {
    it("GIVEN a fresh deployment WHEN initializeSnapshotsByPartition is called THEN emits SnapshotsByPartitionInitialized", async () => {
      await mockDiamondCut.forceFacetNotRegistered(SNAPSHOTS_BY_PARTITION_RESOLVER_KEY);
      await expect(asset.initializeSnapshotsByPartition()).to.emit(asset, "SnapshotsByPartitionInitialized");
    });
  });
});
