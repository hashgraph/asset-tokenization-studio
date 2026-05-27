// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ATS_ROLES, EMPTY_STRING, ZERO } from "@scripts";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const EMPTY_VC_ID = EMPTY_STRING;
const amount = 1000;

describe("SecurityHoldersAtSnapshot Tests", () => {
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
      { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address] },
      { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
      { role: ATS_ROLES.ROLE_SNAPSHOT, members: [signer_A.address] },
      { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
    ]);

    await asset.connect(signer_A).addIssuer(signer_B.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
    await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_B.address);
  }

  beforeEach(async () => {
    await loadFixture(deployEquity);
  });

  describe("getTokenHoldersAtSnapshot", () => {
    it("GIVEN no snapshot WHEN getTokenHoldersAtSnapshot at id 0 THEN reverts with SnapshotIdNull", async () => {
      await expect(asset.getTokenHoldersAtSnapshot(0, 0, 1)).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
    });

    it("GIVEN no snapshot WHEN getTokenHoldersAtSnapshot at id 1 THEN reverts with SnapshotIdDoesNotExists", async () => {
      await expect(asset.getTokenHoldersAtSnapshot(1, 0, 1)).to.be.revertedWithCustomError(
        asset,
        "SnapshotIdDoesNotExists",
      );
    });

    it("GIVEN a snapshot WHEN getTokenHoldersAtSnapshot for single holder THEN returns correct holder", async () => {
      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      await asset.connect(signer_A).takeSnapshot();

      const holders = await asset.getTokenHoldersAtSnapshot(1, 0, 10);
      expect(holders.length).to.equal(1);
      expect([...holders]).to.have.members([signer_A.address]);
    });

    it("GIVEN multiple holders WHEN getTokenHoldersAtSnapshot with pagination THEN returns correct pages", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_C.address);

      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_C.address,
        value: 2 * amount,
        data: "0x",
      });
      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_B.address,
        value: amount,
        data: "0x",
      });

      await asset.connect(signer_C).takeSnapshot();

      const totalHolders = await asset.getTotalTokenHoldersAtSnapshot(1);
      expect(totalHolders).to.equal(3);

      // Page 0: up to 2 holders
      const holders_page_0 = await asset.getTokenHoldersAtSnapshot(1, 0, 2);
      expect(holders_page_0.length).to.equal(2);
      const expectedHolders = [signer_C.address, signer_A.address, signer_B.address];
      holders_page_0.forEach((holder) => {
        expect(expectedHolders).to.include(holder);
      });

      // Page 1: remaining 1 holder
      const holders_page_1 = await asset.getTokenHoldersAtSnapshot(1, 1, 2);
      expect(holders_page_1.length).to.equal(1);
      holders_page_1.forEach((holder) => {
        expect(expectedHolders).to.include(holder);
      });

      // All pages combined cover all unique holders
      const allHolders = [...holders_page_0, ...holders_page_1];
      const uniqueHolders = [...new Set(allHolders)];
      expect(uniqueHolders.length).to.equal(3);

      // Single call to get all
      const allHolders_single_call = await asset.getTokenHoldersAtSnapshot(1, 0, 10);
      expect(allHolders_single_call.length).to.equal(3);
      expect([...allHolders_single_call]).to.have.members([signer_C.address, signer_A.address, signer_B.address]);
    });

    it("GIVEN a snapshot WHEN getTokenHoldersAtSnapshot at page beyond total THEN returns empty array", async () => {
      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      await asset.connect(signer_A).takeSnapshot();

      const holders = await asset.getTokenHoldersAtSnapshot(1, 999, 10);
      expect(holders.length).to.equal(0);
    });
  });

  describe("getTotalTokenHoldersAtSnapshot", () => {
    it("GIVEN no snapshot WHEN getTotalTokenHoldersAtSnapshot at id 0 THEN reverts with SnapshotIdNull", async () => {
      await expect(asset.getTotalTokenHoldersAtSnapshot(0)).to.be.revertedWithCustomError(asset, "SnapshotIdNull");
    });

    it("GIVEN no snapshot WHEN getTotalTokenHoldersAtSnapshot at id 1 THEN reverts with SnapshotIdDoesNotExists", async () => {
      await expect(asset.getTotalTokenHoldersAtSnapshot(1)).to.be.revertedWithCustomError(
        asset,
        "SnapshotIdDoesNotExists",
      );
    });

    it("GIVEN a snapshot with one holder WHEN getTotalTokenHoldersAtSnapshot THEN returns 1", async () => {
      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });

      await asset.connect(signer_A).takeSnapshot();

      const total = await asset.getTotalTokenHoldersAtSnapshot(1);
      expect(total).to.equal(1);
    });

    it("GIVEN a snapshot with multiple holders WHEN getTotalTokenHoldersAtSnapshot THEN returns correct count", async () => {
      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_A.address,
        value: amount,
        data: "0x",
      });
      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_B.address,
        value: amount,
        data: "0x",
      });
      await asset.connect(signer_B).issueByPartition({
        partition: _PARTITION_ID_1,
        tokenHolder: signer_C.address,
        value: amount,
        data: "0x",
      });

      await asset.connect(signer_A).takeSnapshot();

      const total = await asset.getTotalTokenHoldersAtSnapshot(1);
      expect(total).to.equal(3);
    });
  });
});
