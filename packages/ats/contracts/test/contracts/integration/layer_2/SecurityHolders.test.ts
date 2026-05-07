// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { DEFAULT_PARTITION, ATS_ROLES, ZERO } from "@scripts";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const EMPTY_VC_ID = "";

describe("SecurityHoldersFacet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;

  let asset: IAsset;

  async function deploySecurityHoldersFixture() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    const signers = await ethers.getSigners();
    signer_D = signers[3];

    asset = await ethers.getContractAt("IAsset", diamond.target);
    await executeRbac(asset, [
      {
        role: ATS_ROLES.KYC_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ISSUER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
    ]);

    // Grant KYC to all signers
    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_A).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_A).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_A).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityHoldersFixture);
  });

  describe("getSecurityHolders", () => {
    it("GIVEN no security holders WHEN getSecurityHolders page 0 THEN returns empty array", async () => {
      const holders = await asset.getSecurityHolders(0, 10);
      expect(holders.length).to.equal(0);
    });

    it("GIVEN one security holder WHEN getSecurityHolders page 0 THEN returns that holder", async () => {
      const tokenAmount = 1000n;
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: tokenAmount,
        data: "0x",
      });

      const holders = await asset.getSecurityHolders(0, 10);
      expect(holders.length).to.equal(1);
      expect(holders[0]).to.equal(signer_B.address);
    });

    it("GIVEN three security holders WHEN getSecurityHolders page 0 with pageLength 2 THEN returns first two holders", async () => {
      const tokenAmount = 1000n;
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: tokenAmount,
        data: "0x",
      });

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_C.address,
        value: tokenAmount,
        data: "0x",
      });

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_D.address,
        value: tokenAmount,
        data: "0x",
      });

      const holders = await asset.getSecurityHolders(0, 2);
      expect(holders.length).to.equal(2);
    });

    it("GIVEN three security holders WHEN getSecurityHolders page 1 with pageLength 2 THEN returns third holder", async () => {
      const tokenAmount = 1000n;
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: tokenAmount,
        data: "0x",
      });

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_C.address,
        value: tokenAmount,
        data: "0x",
      });

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_D.address,
        value: tokenAmount,
        data: "0x",
      });

      const holders = await asset.getSecurityHolders(1, 2);
      expect(holders.length).to.equal(1);
      expect(holders[0]).to.equal(signer_D.address);
    });

    it("GIVEN security holders WHEN getSecurityHolders out-of-range page THEN returns empty array", async () => {
      const tokenAmount = 1000n;
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: tokenAmount,
        data: "0x",
      });

      const holders = await asset.getSecurityHolders(100, 10);
      expect(holders.length).to.equal(0);
    });

    it("GIVEN security holders WHEN getSecurityHolders with pageLength 0 THEN returns empty array", async () => {
      const tokenAmount = 1000n;
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: tokenAmount,
        data: "0x",
      });

      const holders = await asset.getSecurityHolders(0, 0);
      expect(holders.length).to.equal(0);
    });
  });

  describe("getTotalSecurityHolders", () => {
    it("GIVEN no security holders WHEN getTotalSecurityHolders THEN returns zero", async () => {
      const total = await asset.getTotalSecurityHolders();
      expect(total).to.equal(0);
    });

    it("GIVEN one security holder WHEN getTotalSecurityHolders THEN returns one", async () => {
      const tokenAmount = 1000n;
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: tokenAmount,
        data: "0x",
      });

      const total = await asset.getTotalSecurityHolders();
      expect(total).to.equal(1);
    });

    it("GIVEN three security holders WHEN getTotalSecurityHolders THEN returns three", async () => {
      const tokenAmount = 1000n;
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: tokenAmount,
        data: "0x",
      });

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_C.address,
        value: tokenAmount,
        data: "0x",
      });

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_D.address,
        value: tokenAmount,
        data: "0x",
      });

      const total = await asset.getTotalSecurityHolders();
      expect(total).to.equal(3);
    });

    it("GIVEN multiple issuances to same holder WHEN getTotalSecurityHolders THEN counts holder only once", async () => {
      const tokenAmount = 1000n;
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: tokenAmount,
        data: "0x",
      });

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: tokenAmount,
        data: "0x",
      });

      const total = await asset.getTotalSecurityHolders();
      expect(total).to.equal(1);
    });

    it("GIVEN security holders WHEN getTotalSecurityHolders multiple times THEN returns consistent result", async () => {
      const tokenAmount = 1000n;
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: tokenAmount,
        data: "0x",
      });

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_C.address,
        value: tokenAmount,
        data: "0x",
      });

      const total1 = await asset.getTotalSecurityHolders();
      const total2 = await asset.getTotalSecurityHolders();
      expect(total1).to.equal(total2);
      expect(total1).to.equal(2);
    });
  });

  describe("getSecurityHolders and getTotalSecurityHolders integration", () => {
    it("GIVEN N security holders WHEN getSecurityHolders with large pageLength THEN returns all N holders", async () => {
      const tokenAmount = 1000n;
      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: tokenAmount,
        data: "0x",
      });

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_C.address,
        value: tokenAmount,
        data: "0x",
      });

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_D.address,
        value: tokenAmount,
        data: "0x",
      });

      const total = await asset.getTotalSecurityHolders();
      const holders = await asset.getSecurityHolders(0, 1000);

      expect(holders.length).to.equal(Number(total));
    });

    it("GIVEN N security holders with pagination WHEN iterating through pages THEN all holders are returned exactly once", async () => {
      const tokenAmount = 1000n;
      const pageLength = 2;

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: tokenAmount,
        data: "0x",
      });

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_C.address,
        value: tokenAmount,
        data: "0x",
      });

      await asset.connect(signer_A).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_D.address,
        value: tokenAmount,
        data: "0x",
      });

      const total = await asset.getTotalSecurityHolders();
      const allHolders: string[] = [];

      // Iterate through pages
      for (let page = 0; page < Math.ceil(Number(total) / pageLength); page++) {
        const pageHolders = await asset.getSecurityHolders(page, pageLength);
        allHolders.push(...pageHolders);
      }

      expect(allHolders.length).to.equal(Number(total));
      // Check for duplicates
      const uniqueHolders = new Set(allHolders);
      expect(uniqueHolders.size).to.equal(allHolders.length);
    });
  });
});
