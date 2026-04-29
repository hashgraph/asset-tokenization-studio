// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, type ResolverProxy } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { ATS_ROLES, DEFAULT_PARTITION, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO } from "@scripts";

const AMOUNT = 1000;
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;
const WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const CUSTOM_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";

describe("BurnByPartitionFacet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;
  let asset: IAsset;

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
      signer_C = base.user2;
      signer_E = base.user4;
      asset = await ethers.getContractAt("IAsset", diamond.target);

      await executeRbac(asset, [
        { role: ATS_ROLES.ISSUER_ROLE, members: [signer_A.address] },
        { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
        { role: ATS_ROLES.PAUSER_ROLE, members: [signer_C.address] },
      ]);

      await asset.addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_E.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });
    }

    beforeEach(async () => {
      await loadFixture(deploySinglePartitionFixture);
    });

    it("GIVEN a token holder with balance WHEN redeemByPartition THEN emits RedeemedByPartition and updates balances", async () => {
      const initialSupply = await asset.totalSupplyByPartition(DEFAULT_PARTITION);
      const initialBalance = await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address);

      await expect(asset.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, AMOUNT, EMPTY_HEX_BYTES))
        .to.emit(asset, "RedeemedByPartition")
        .withArgs(DEFAULT_PARTITION, ethers.ZeroAddress, signer_E.address, AMOUNT, EMPTY_HEX_BYTES, "0x");

      expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.equal(
        initialBalance - BigInt(AMOUNT),
      );
      expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(initialSupply - BigInt(AMOUNT));
    });

    it("GIVEN single-partition mode WHEN redeemByPartition with wrong partition THEN reverts with PartitionNotAllowedInSinglePartitionMode", async () => {
      await expect(asset.connect(signer_E).redeemByPartition(WRONG_PARTITION, AMOUNT, EMPTY_HEX_BYTES))
        .to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode")
        .withArgs(WRONG_PARTITION);
    });

    it("GIVEN a paused token WHEN redeemByPartition THEN reverts with TokenIsPaused", async () => {
      await asset.connect(signer_C).pause();

      await expect(
        asset.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, AMOUNT, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN insufficient balance WHEN redeemByPartition THEN reverts", async () => {
      await expect(asset.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, AMOUNT + 1, EMPTY_HEX_BYTES)).to.be
        .reverted;
    });

    it("GIVEN a token holder with balance WHEN redeemByPartition partial amount THEN updates balances correctly", async () => {
      const redeemAmount = AMOUNT / 2;

      await expect(asset.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, redeemAmount, EMPTY_HEX_BYTES))
        .to.emit(asset, "RedeemedByPartition")
        .withArgs(DEFAULT_PARTITION, ethers.ZeroAddress, signer_E.address, redeemAmount, EMPTY_HEX_BYTES, "0x");

      expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.equal(AMOUNT - redeemAmount);
      expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(AMOUNT - redeemAmount);
    });
  });

  describe("Multi partition mode", () => {
    async function deployMultiPartitionFixture() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
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
        { role: ATS_ROLES.ISSUER_ROLE, members: [signer_A.address] },
        { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
      ]);

      await asset.addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    }

    beforeEach(async () => {
      await loadFixture(deployMultiPartitionFixture);
    });

    it("GIVEN multi-partition mode WHEN redeemByPartition from default partition THEN succeeds and updates balances", async () => {
      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_E.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      await expect(asset.connect(signer_E).redeemByPartition(DEFAULT_PARTITION, AMOUNT, EMPTY_HEX_BYTES))
        .to.emit(asset, "RedeemedByPartition")
        .withArgs(DEFAULT_PARTITION, ethers.ZeroAddress, signer_E.address, AMOUNT, EMPTY_HEX_BYTES, "0x");

      expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.equal(0);
      expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(0);
    });

    it("GIVEN multi-partition mode WHEN redeemByPartition from non-default partition THEN succeeds and updates balances", async () => {
      await asset.issueByPartition({
        partition: CUSTOM_PARTITION,
        tokenHolder: signer_E.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      await expect(asset.connect(signer_E).redeemByPartition(CUSTOM_PARTITION, AMOUNT, EMPTY_HEX_BYTES))
        .to.emit(asset, "RedeemedByPartition")
        .withArgs(CUSTOM_PARTITION, ethers.ZeroAddress, signer_E.address, AMOUNT, EMPTY_HEX_BYTES, "0x");

      expect(await asset.balanceOfByPartition(CUSTOM_PARTITION, signer_E.address)).to.equal(0);
      expect(await asset.totalSupplyByPartition(CUSTOM_PARTITION)).to.equal(0);
    });
  });
});
