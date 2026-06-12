// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock, ISnapshotsByPartition__factory, ISnapshotsByPartition } from "@contract-types";
import { ZERO, EMPTY_STRING, ATS_ROLES, RESOLVER_KEY_SNAPSHOTS_BY_PARTITION } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { DEFAULT_PARTITION, PARTITION_ID_2, PARTITION_ID_3, deployAssetMockCtx, executeRbac, MAX_UINT256 } from "@test";

const EMPTY_VC_ID = EMPTY_STRING;
const amount = 1000;

export function snapshotsByPartitionTests(): void {
  describe("SnapshotsByPartition Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    let asset: IAssetMock;
    let snapshotsByPartitionFacet: ISnapshotsByPartition;

    async function deployFixture() {
      const ctx = await loadFixture(deployAssetMockCtx);
      const target = await ctx.diamond.getAddress();
      asset = ctx.asset;
      await asset.setMultiPartition(true);

      signer_A = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;

      snapshotsByPartitionFacet = ISnapshotsByPartition__factory.connect(target, signer_A);
      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
      ]);
    }

    beforeEach(async () => {
      await loadFixture(deployFixture);
    });

    describe("AccessControl", () => {
      it("GIVEN any caller WHEN partitionsOfAtSnapshot with snapshotId zero THEN reverts with SnapshotIdNull", async () => {
        await expect(
          snapshotsByPartitionFacet.partitionsOfAtSnapshot(0, signer_A.address),
        ).to.be.revertedWithCustomError(snapshotsByPartitionFacet, "SnapshotIdNull");
      });

      it("GIVEN any caller WHEN partitionsOfAtSnapshot with non-existent snapshot THEN reverts with SnapshotIdDoesNotExists", async () => {
        await expect(
          snapshotsByPartitionFacet.partitionsOfAtSnapshot(1, signer_A.address),
        ).to.be.revertedWithCustomError(snapshotsByPartitionFacet, "SnapshotIdDoesNotExists");
      });
    });

    describe("partitionsOfAtSnapshot", () => {
      it("GIVEN an account with no tokens at snapshot THEN returns empty partition list", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
        await asset.connect(signer_A).addIssuer(signer_A.address);
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: amount,
          data: "0x",
        });

        await asset.connect(signer_C).takeSnapshot();

        const partitions = await snapshotsByPartitionFacet.partitionsOfAtSnapshot(1, signer_A.address);
        expect(partitions.length).to.equal(0);
      });

      it("GIVEN a token holder with a single partition at snapshot THEN returns that partition", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
        await asset.connect(signer_A).addIssuer(signer_A.address);
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: amount,
          data: "0x",
        });

        await asset.connect(signer_C).takeSnapshot();

        const partitions = await snapshotsByPartitionFacet.partitionsOfAtSnapshot(1, signer_C.address);
        expect(partitions.length).to.equal(1);
        expect(partitions[0]).to.equal(DEFAULT_PARTITION);
      });

      it("GIVEN a token holder with multiple partitions at snapshot THEN returns all partitions", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
        await asset.connect(signer_A).addIssuer(signer_A.address);
        await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });
        await asset.connect(signer_A).issueByPartition({
          partition: PARTITION_ID_2,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await asset.connect(signer_C).takeSnapshot();

        const partitions = await snapshotsByPartitionFacet.partitionsOfAtSnapshot(1, signer_A.address);
        expect(partitions.length).to.equal(2);
        expect([...partitions]).to.have.members([DEFAULT_PARTITION, PARTITION_ID_2]);
      });

      it("GIVEN token transfers after snapshot THEN partitions reflect state at snapshot time", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
        await asset.connect(signer_A).addIssuer(signer_A.address);
        await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: amount,
          data: "0x",
        });

        // Snapshot 1: C has only partition 1
        await asset.connect(signer_C).takeSnapshot();

        // After snapshot: C receives partition 2 tokens
        await asset.connect(signer_A).issueByPartition({
          partition: PARTITION_ID_2,
          tokenHolder: signer_C.address,
          value: amount,
          data: "0x",
        });

        // Snapshot 2: C now has partitions 1 and 2
        await asset.connect(signer_C).takeSnapshot();

        const partitionsAtSnapshot1 = await snapshotsByPartitionFacet.partitionsOfAtSnapshot(1, signer_C.address);
        expect(partitionsAtSnapshot1.length).to.equal(1);
        expect(partitionsAtSnapshot1[0]).to.equal(DEFAULT_PARTITION);

        const partitionsAtSnapshot2 = await snapshotsByPartitionFacet.partitionsOfAtSnapshot(2, signer_C.address);
        expect(partitionsAtSnapshot2.length).to.equal(2);
        expect([...partitionsAtSnapshot2]).to.have.members([DEFAULT_PARTITION, PARTITION_ID_2]);
      });

      it("GIVEN a middle partition emptied after snapshot THEN snapshot keeps the full pre-delete list (swap branch)", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
        await asset.connect(signer_A).addIssuer(signer_A.address);
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: amount,
          data: "0x",
        });
        await asset.connect(signer_A).issueByPartition({
          partition: PARTITION_ID_2,
          tokenHolder: signer_C.address,
          value: amount,
          data: "0x",
        });
        await asset.connect(signer_A).issueByPartition({
          partition: PARTITION_ID_3,
          tokenHolder: signer_C.address,
          value: amount,
          data: "0x",
        });

        // Snapshot 1: C has [P1, P2, P3]
        await asset.connect(signer_C).takeSnapshot();

        // C empties the middle partition P2 → deletePartitionForHolder with swap (P3 moves into P2's slot)
        await asset.connect(signer_C).redeemByPartition(PARTITION_ID_2, amount, "0x");

        // Snapshot 2: C now has [P1, P3]
        await asset.connect(signer_C).takeSnapshot();

        const atSnapshot1 = await snapshotsByPartitionFacet.partitionsOfAtSnapshot(1, signer_C.address);
        expect(atSnapshot1.length).to.equal(3);
        expect([...atSnapshot1]).to.have.members([DEFAULT_PARTITION, PARTITION_ID_2, PARTITION_ID_3]);

        const atSnapshot2 = await snapshotsByPartitionFacet.partitionsOfAtSnapshot(2, signer_C.address);
        expect(atSnapshot2.length).to.equal(2);
        expect([...atSnapshot2]).to.have.members([DEFAULT_PARTITION, PARTITION_ID_3]);

        const live = await asset.partitionsOf(signer_C.address);
        expect([...live]).to.have.members([DEFAULT_PARTITION, PARTITION_ID_3]);
      });

      it("GIVEN the last partition emptied after snapshot THEN snapshot keeps the full pre-delete list (no-swap branch)", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
        await asset.connect(signer_A).addIssuer(signer_A.address);
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: amount,
          data: "0x",
        });
        await asset.connect(signer_A).issueByPartition({
          partition: PARTITION_ID_2,
          tokenHolder: signer_C.address,
          value: amount,
          data: "0x",
        });

        // Snapshot 1: C has [P1, P2]
        await asset.connect(signer_C).takeSnapshot();

        // C empties the last partition P2 → deletePartitionForHolder without swap (plain pop)
        await asset.connect(signer_C).redeemByPartition(PARTITION_ID_2, amount, "0x");

        // Snapshot 2: C now has [P1]
        await asset.connect(signer_C).takeSnapshot();

        const atSnapshot1 = await snapshotsByPartitionFacet.partitionsOfAtSnapshot(1, signer_C.address);
        expect(atSnapshot1.length).to.equal(2);
        expect([...atSnapshot1]).to.have.members([DEFAULT_PARTITION, PARTITION_ID_2]);

        const atSnapshot2 = await snapshotsByPartitionFacet.partitionsOfAtSnapshot(2, signer_C.address);
        expect(atSnapshot2.length).to.equal(1);
        expect(atSnapshot2[0]).to.equal(DEFAULT_PARTITION);
      });

      it("GIVEN several partitions emptied within the same snapshot THEN earlier snapshots stay intact (idempotency)", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
        await asset.connect(signer_A).addIssuer(signer_A.address);
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

        await asset.connect(signer_A).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: amount,
          data: "0x",
        });
        await asset.connect(signer_A).issueByPartition({
          partition: PARTITION_ID_2,
          tokenHolder: signer_C.address,
          value: amount,
          data: "0x",
        });
        await asset.connect(signer_A).issueByPartition({
          partition: PARTITION_ID_3,
          tokenHolder: signer_C.address,
          value: amount,
          data: "0x",
        });

        // Snapshot 1: C has [P1, P2, P3]
        await asset.connect(signer_C).takeSnapshot();

        // Two deletes under the SAME active snapshot (snapshot 1 stays open).
        await asset.connect(signer_C).redeemByPartition(PARTITION_ID_2, amount, "0x");
        await asset.connect(signer_C).redeemByPartition(PARTITION_ID_3, amount, "0x");

        // Snapshot 1 must still reflect the original three partitions.
        const atSnapshot1 = await snapshotsByPartitionFacet.partitionsOfAtSnapshot(1, signer_C.address);
        expect(atSnapshot1.length).to.equal(3);
        expect([...atSnapshot1]).to.have.members([DEFAULT_PARTITION, PARTITION_ID_2, PARTITION_ID_3]);

        const live = await asset.partitionsOf(signer_C.address);
        expect([...live]).to.have.members([DEFAULT_PARTITION]);
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
          .withArgs(RESOLVER_KEY_SNAPSHOTS_BY_PARTITION, 1);
      });
    });

    describe("initializeSnapshotsByPartition event", () => {
      it("GIVEN a fresh deployment WHEN initializeSnapshotsByPartition is called THEN emits SnapshotsByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_SNAPSHOTS_BY_PARTITION);
        await expect(asset.initializeSnapshotsByPartition()).to.emit(asset, "SnapshotsByPartitionInitialized");
      });
    });
  });
}
