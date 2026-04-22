// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ATS_ROLES, DEFAULT_PARTITION, EMPTY_STRING, ZERO } from "@scripts";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { SecurityType } from "@scripts/domain";

const amount = 1000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("ERC20 Facet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;

  let asset: IAsset;

  describe("Multi partition", () => {
    async function deployMultiPartitionFixture() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: { isMultiPartition: true },
        },
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_C = base.user2;
      signer_D = base.user3;

      asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
    }

    beforeEach(async () => {
      await loadFixture(deployMultiPartitionFixture);
    });

    it("GIVEN an initialized ERC20 WHEN initialize_ERC20 again THEN reverts with AlreadyInitialized", async () => {
      await expect(
        asset.initialize_ERC20({
          info: { name: "TEST", symbol: "TST", isin: "ES1234567890", decimals: 6 },
          securityType: SecurityType.BOND_VARIABLE_RATE,
        }),
      ).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
    });

    it("GIVEN a multi-partition token WHEN transfer or transferFrom THEN reverts with NotAllowedInMultiPartitionMode", async () => {
      await expect(asset.transfer(signer_D.address, amount)).to.be.revertedWithCustomError(
        asset,
        "NotAllowedInMultiPartitionMode",
      );

      await expect(asset.transferFrom(signer_C.address, signer_D.address, amount)).to.be.revertedWithCustomError(
        asset,
        "NotAllowedInMultiPartitionMode",
      );
    });
  });

  describe("Single partition", () => {
    let assetSignerC: IAsset;
    let assetSignerD: IAsset;

    async function deploySinglePartitionFixture() {
      const base = await deployEquityTokenFixture();
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;

      asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
      assetSignerC = await ethers.getContractAt("IAsset", diamond.target, signer_C);
      assetSignerD = await ethers.getContractAt("IAsset", diamond.target, signer_D);

      await executeRbac(asset, [
        { role: ATS_ROLES._ISSUER_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES._KYC_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES._SSI_MANAGER_ROLE, members: [signer_A.address] },
        { role: ATS_ROLES._PAUSER_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES._CLEARING_ROLE, members: [signer_A.address] },
        { role: ATS_ROLES._CONTROL_LIST_ROLE, members: [signer_A.address] },
        { role: ATS_ROLES._PROTECTED_PARTITIONS_ROLE, members: [signer_A.address] },
      ]);

      await asset.addIssuer(signer_D.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_D.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_D.address);
      await asset.connect(signer_B).issue(signer_C.address, amount, "0x");
    }

    beforeEach(async () => {
      await loadFixture(deploySinglePartitionFixture);
    });

    describe("transfer", () => {
      it("GIVEN a non-kyc sender or receiver WHEN transfer THEN reverts with InvalidKycStatus", async () => {
        await asset.connect(signer_B).revokeKyc(signer_D.address);
        await expect(assetSignerC.transfer(signer_D.address, amount / 2)).to.be.revertedWithCustomError(
          asset,
          "InvalidKycStatus",
        );

        await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_D.address);
        await asset.connect(signer_B).revokeKyc(signer_C.address);
        await expect(assetSignerC.transfer(signer_D.address, amount / 2)).to.be.revertedWithCustomError(
          asset,
          "InvalidKycStatus",
        );
      });

      it("GIVEN an account with balance WHEN transfer to a whitelisted account THEN emits Transfer and balances update", async () => {
        await expect(assetSignerC.transfer(signer_D.address, amount / 2))
          .to.emit(asset, "Transfer")
          .withArgs(signer_C.address, signer_D.address, amount / 2);

        expect(await asset.balanceOf(signer_C.address)).to.equal(amount / 2);
        expect(await asset.balanceOf(signer_D.address)).to.equal(amount / 2);
        expect(await asset.totalSupply()).to.equal(amount);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_C.address)).to.equal(amount / 2);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_D.address)).to.equal(amount / 2);
        expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(amount);
      });
    });

    describe("transferFrom", () => {
      beforeEach(async () => {
        await assetSignerC.approve(signer_D.address, amount);
      });

      it("GIVEN a non-kyc sender or receiver WHEN transferFrom THEN reverts with InvalidKycStatus", async () => {
        await asset.connect(signer_B).revokeKyc(signer_C.address);
        await expect(
          assetSignerD.transferFrom(signer_C.address, signer_D.address, amount / 2),
        ).to.be.revertedWithCustomError(asset, "InvalidKycStatus");

        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_D.address);
        await asset.connect(signer_B).revokeKyc(signer_D.address);
        await expect(
          assetSignerD.transferFrom(signer_C.address, signer_D.address, amount / 2),
        ).to.be.revertedWithCustomError(asset, "InvalidKycStatus");
      });

      it("GIVEN an allowance WHEN transferFrom to a whitelisted account THEN emits Transfer and balances update", async () => {
        await expect(assetSignerD.transferFrom(signer_C.address, signer_D.address, amount / 2))
          .to.emit(asset, "Transfer")
          .withArgs(signer_C.address, signer_D.address, amount / 2);

        expect(await asset.balanceOf(signer_C.address)).to.equal(amount / 2);
        expect(await asset.balanceOf(signer_D.address)).to.equal(amount / 2);
        expect(await asset.totalSupply()).to.equal(amount);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_C.address)).to.equal(amount / 2);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_D.address)).to.equal(amount / 2);
        expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(amount);
      });
    });

    describe("Protected Partitions Role Tests", () => {
      it("GIVEN protected partitions activated WHEN transfer without role THEN reverts with PartitionsAreProtectedAndNoRole", async () => {
        await asset.protectPartitions();
        await expect(assetSignerC.transfer(signer_D.address, amount / 2)).to.be.revertedWithCustomError(
          asset,
          "PartitionsAreProtectedAndNoRole",
        );
      });

      it("GIVEN protected partitions activated WHEN transferFrom without role THEN reverts with PartitionsAreProtectedAndNoRole", async () => {
        await asset.protectPartitions();
        await assetSignerC.approve(signer_D.address, amount);
        await expect(
          assetSignerD.transferFrom(signer_C.address, signer_D.address, amount / 2),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
      });
    });

    describe("decimalsAt", () => {
      it("GIVEN an ERC20 token WHEN decimalsAt THEN returns the configured decimals", async () => {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        expect(await asset.decimalsAt(currentTimestamp)).to.equal(6);
      });
    });

    it("GIVEN a paused ERC20 WHEN transfer or transferFrom THEN reverts with TokenIsPaused", async () => {
      await asset.connect(signer_B).pause();

      await expect(assetSignerC.transfer(signer_D.address, amount)).to.be.revertedWithCustomError(
        asset,
        "TokenIsPaused",
      );

      await expect(assetSignerD.transferFrom(signer_C.address, signer_D.address, amount)).to.be.revertedWithCustomError(
        asset,
        "TokenIsPaused",
      );
    });

    it("GIVEN an ERC20 with clearing active WHEN transfer or transferFrom THEN reverts with ClearingIsActivated", async () => {
      await asset.activateClearing();

      await expect(assetSignerC.transfer(signer_D.address, amount)).to.be.revertedWithCustomError(
        asset,
        "ClearingIsActivated",
      );

      await expect(assetSignerD.transferFrom(signer_C.address, signer_D.address, amount)).to.be.revertedWithCustomError(
        asset,
        "ClearingIsActivated",
      );
    });

    it("GIVEN a blacklisted account WHEN transfer or transferFrom THEN reverts with AccountIsBlocked", async () => {
      await asset.addToControlList(signer_C.address);

      await expect(assetSignerC.transfer(signer_D.address, amount)).to.be.revertedWithCustomError(
        asset,
        "AccountIsBlocked",
      );

      await expect(assetSignerD.transferFrom(signer_C.address, signer_D.address, amount)).to.be.revertedWithCustomError(
        asset,
        "AccountIsBlocked",
      );
    });
  });
});
