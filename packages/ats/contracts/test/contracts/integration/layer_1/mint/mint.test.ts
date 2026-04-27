// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, type ResolverProxy } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { ATS_ROLES, DEFAULT_PARTITION, EMPTY_STRING, ZERO } from "@scripts";

const AMOUNT = 1000;
const DATA = "0x1234";
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("MintFacet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;
  let asset: IAsset;

  describe("Multi partition mode", () => {
    async function deployMultiPartitionFixture() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
            internalKycActivated: true,
          },
        },
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      asset = await ethers.getContractAt("IAsset", diamond.target);
      await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
    }

    beforeEach(async () => {
      await loadFixture(deployMultiPartitionFixture);
    });

    it("GIVEN multi-partition mode WHEN issue THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      expect(await asset.isIssuable()).to.be.true;
      await expect(asset.issue(signer_A.address, AMOUNT, DATA)).to.be.revertedWithCustomError(
        asset,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN multi-partition mode WHEN mint THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      await expect(asset.mint(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(
        asset,
        "NotAllowedInMultiPartitionMode",
      );
    });
  });

  describe("Single partition mode", () => {
    async function deploySinglePartitionFixture() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            internalKycActivated: true,
            maxSupply: MAX_SUPPLY,
          },
        },
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_E = base.user4;
      asset = await ethers.getContractAt("IAsset", diamond.target);

      await executeRbac(asset, [
        { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
      ]);

      await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
      await asset.addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    }

    beforeEach(async () => {
      await loadFixture(deploySinglePartitionFixture);
    });

    it("GIVEN a fresh token WHEN isIssuable THEN returns true", async () => {
      expect(await asset.isIssuable()).to.be.true;
    });

    it("GIVEN an issuer WHEN issue THEN emits Issued and updates balances", async () => {
      expect(await asset.issue(signer_E.address, AMOUNT / 2, DATA))
        .to.emit(asset, "Issued")
        .withArgs(signer_A.address, signer_E.address, AMOUNT / 2);
      expect(await asset.totalSupply()).to.be.equal(AMOUNT / 2);
      expect(await asset.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
      expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(AMOUNT / 2);
      expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT / 2);
    });

    it("GIVEN an issuer WHEN mint THEN emits Issued with empty data and updates balances", async () => {
      expect(await asset.mint(signer_E.address, AMOUNT / 2))
        .to.emit(asset, "Issued")
        .withArgs(signer_A.address, signer_E.address, AMOUNT / 2);
      expect(await asset.totalSupply()).to.be.equal(AMOUNT / 2);
      expect(await asset.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
    });
  });
});
