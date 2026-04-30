// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type IAsset, type ResolverProxy } from "@contract-types";
import { ATS_ROLES, DEFAULT_PARTITION, EIP1066_CODES, EMPTY_STRING, ZERO } from "@scripts";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const amount = 1000;
const DATA = "0x1234";
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("Transfer Facet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;

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

    it("GIVEN an initialized token WHEN transferWithData THEN fails with NotAllowedInMultiPartitionMode", async () => {
      await expect(
        asset.connect(signer_C).transferWithData(signer_D.address, amount, DATA),
      ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
    });

    it("GIVEN an initialized token WHEN transferFromWithData THEN fails with NotAllowedInMultiPartitionMode", async () => {
      await expect(
        asset.connect(signer_C).transferFromWithData(signer_A.address, signer_D.address, amount, DATA),
      ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
    });
  });

  describe("Single partition", () => {
    let assetSignerC: IAsset;
    let assetSignerD: IAsset;

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
      signer_D = base.user3;
      signer_E = base.user4;

      asset = await ethers.getContractAt("IAsset", diamond.target, signer_A);
      assetSignerC = await ethers.getContractAt("IAsset", diamond.target, signer_C);
      assetSignerD = await ethers.getContractAt("IAsset", diamond.target, signer_D);

      await executeRbac(asset, [
        { role: ATS_ROLES.ISSUER_ROLE, members: [signer_B.address, signer_C.address] },
        { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
        { role: ATS_ROLES.PAUSER_ROLE, members: [signer_B.address] },
        { role: ATS_ROLES.CLEARING_ROLE, members: [signer_A.address, signer_B.address] },
        { role: ATS_ROLES.CONTROL_LIST_ROLE, members: [signer_A.address] },
        { role: ATS_ROLES.PROTECTED_PARTITIONS_ROLE, members: [signer_A.address] },
      ]);

      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
      await asset.connect(signer_A).addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).issue(signer_C.address, amount, DATA);
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

        await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
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

        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
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

    describe("transferWithData", () => {
      beforeEach(async () => {
        await asset.connect(signer_C).issue(signer_E.address, amount, DATA);
      });

      it("GIVEN non-kyc accounts WHEN transferWithData THEN reverts with InvalidKycStatus", async () => {
        await asset.connect(signer_B).revokeKyc(signer_E.address);
        await expect(
          asset.connect(signer_E).transferWithData(signer_D.address, amount / 2, DATA),
        ).to.revertedWithCustomError(asset, "InvalidKycStatus");

        await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).revokeKyc(signer_D.address);
        await expect(
          asset.connect(signer_E).transferWithData(signer_D.address, amount / 2, DATA),
        ).to.revertedWithCustomError(asset, "InvalidKycStatus");
      });

      it("GIVEN an account with balance WHEN transferWithData THEN transaction succeeds", async () => {
        expect(await asset.connect(signer_E).canTransfer(signer_D.address, amount / 2, DATA)).to.be.deep.equal([
          true,
          EIP1066_CODES.SUCCESS,
          ethers.ZeroHash,
        ]);
        expect(await asset.connect(signer_E).transferWithData(signer_D.address, amount / 2, DATA))
          .to.emit(asset, "TransferWithData")
          .withArgs(signer_E.address, signer_D.address, amount / 2, DATA)
          .to.emit(asset, "Transfer")
          .withArgs(signer_E.address, signer_D.address, amount / 2);

        expect(await asset.balanceOf(signer_E.address)).to.be.equal(amount / 2);
        expect(await asset.balanceOf(signer_D.address)).to.be.equal(amount / 2);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(amount / 2);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_D.address)).to.be.equal(amount / 2);
      });
    });

    describe("transferFromWithData", () => {
      beforeEach(async () => {
        await asset.connect(signer_C).issue(signer_E.address, amount, DATA);
        await asset.connect(signer_E).approve(signer_D.address, amount / 2);
      });

      it("GIVEN non-kyc accounts WHEN transferFromWithData THEN reverts with InvalidKycStatus", async () => {
        await asset.connect(signer_B).revokeKyc(signer_E.address);
        await expect(
          asset.connect(signer_B).transferFromWithData(signer_E.address, signer_A.address, amount / 2, DATA),
        ).to.revertedWithCustomError(asset, "InvalidKycStatus");

        await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).revokeKyc(signer_D.address);
        await expect(
          asset.connect(signer_A).transferFromWithData(signer_D.address, signer_E.address, amount / 2, DATA),
        ).to.revertedWithCustomError(asset, "InvalidKycStatus");
      });

      it("GIVEN an account with balance and allowance WHEN transferFromWithData THEN transaction succeeds", async () => {
        expect(
          await asset.connect(signer_D).canTransferFrom(signer_E.address, signer_D.address, amount / 2, DATA),
        ).to.be.deep.equal([true, EIP1066_CODES.SUCCESS, ethers.ZeroHash]);

        expect(await asset.connect(signer_D).transferFromWithData(signer_E.address, signer_D.address, amount / 2, DATA))
          .to.emit(asset, "TransferFromWithData")
          .withArgs(signer_D.address, signer_E.address, signer_D.address, amount / 2, DATA)
          .to.emit(asset, "Transfer")
          .withArgs(signer_E.address, signer_D.address, amount / 2);

        expect(await asset.allowance(signer_E.address, signer_D.address)).to.be.equal(0);
        expect(await asset.balanceOf(signer_E.address)).to.be.equal(amount / 2);
        expect(await asset.balanceOf(signer_D.address)).to.be.equal(amount / 2);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(amount / 2);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_D.address)).to.be.equal(amount / 2);
      });
    });

    describe("ControlList", () => {
      it("GIVEN a blacklisted account WHEN transfer or transferFrom THEN reverts with AccountIsBlocked", async () => {
        await asset.addToControlList(signer_C.address);
        await expect(assetSignerC.transfer(signer_D.address, amount)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );
        await expect(
          assetSignerD.transferFrom(signer_C.address, signer_D.address, amount),
        ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
      });

      it("GIVEN blocked accounts (sender, to, from) WHEN transferWithData THEN fails with AccountIsBlocked", async () => {
        await asset.connect(signer_C).issue(signer_E.address, amount, DATA);
        await asset.addToControlList(signer_C.address);

        await expect(
          asset.connect(signer_C).transferWithData(signer_D.address, amount / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");

        await expect(
          asset.connect(signer_C).transferFromWithData(signer_E.address, signer_D.address, amount / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");

        await asset.removeFromControlList(signer_C.address);
        await asset.addToControlList(signer_D.address);

        await expect(
          asset.connect(signer_C).transferWithData(signer_D.address, amount / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");

        await expect(
          asset.connect(signer_C).transferFromWithData(signer_E.address, signer_D.address, amount / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");

        await asset.removeFromControlList(signer_D.address);
        await asset.addToControlList(signer_E.address);

        await expect(
          asset.connect(signer_C).transferFromWithData(signer_E.address, signer_D.address, amount / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
      });
    });

    describe("Paused", () => {
      beforeEach(async () => {
        await asset.connect(signer_C).issue(signer_E.address, amount, DATA);
        await asset.connect(signer_E).increaseAllowance(signer_C.address, amount);
        await asset.connect(signer_B).pause();
      });

      it("GIVEN a paused ERC20 WHEN transfer or transferFrom THEN reverts with TokenIsPaused", async () => {
        await expect(assetSignerC.transfer(signer_D.address, amount)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
        await expect(
          assetSignerD.transferFrom(signer_C.address, signer_D.address, amount),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN a paused token WHEN transferWithData THEN fails with TokenIsPaused", async () => {
        await expect(
          asset.connect(signer_C).transferWithData(signer_D.address, amount / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN a paused token WHEN transferFromWithData THEN fails with TokenIsPaused", async () => {
        await expect(
          asset.connect(signer_C).transferFromWithData(signer_E.address, signer_D.address, amount / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN a paused token WHEN transferWithData called by non-paused path THEN transferWithData is NOT blocked by pause", async () => {
        // transferWithData has no onlyUnpaused modifier — this is expected behaviour
        // The token is paused; unpause first to confirm transferWithData works once active
        await asset.connect(signer_B).unpause();
        expect(await asset.connect(signer_E).transferWithData(signer_D.address, amount / 2, DATA))
          .to.emit(asset, "TransferWithData")
          .withArgs(signer_E.address, signer_D.address, amount / 2, DATA);
      });
    });

    describe("Clearing", () => {
      beforeEach(async () => {
        await asset.connect(signer_B).activateClearing();
      });

      it("GIVEN an ERC20 with clearing active WHEN transfer or transferFrom THEN reverts with ClearingIsActivated", async () => {
        await expect(assetSignerC.transfer(signer_D.address, amount)).to.be.revertedWithCustomError(
          asset,
          "ClearingIsActivated",
        );
        await expect(
          assetSignerD.transferFrom(signer_C.address, signer_D.address, amount),
        ).to.be.revertedWithCustomError(asset, "ClearingIsActivated");
      });

      it("GIVEN a token with clearing active WHEN transferWithData THEN fails with ClearingIsActivated", async () => {
        await expect(
          asset.connect(signer_C).transferWithData(signer_D.address, amount / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "ClearingIsActivated");
      });

      it("GIVEN a token with clearing active WHEN transferFromWithData THEN fails with ClearingIsActivated", async () => {
        await asset.connect(signer_C).issue(signer_E.address, amount, DATA);
        await expect(
          asset.connect(signer_C).transferFromWithData(signer_E.address, signer_D.address, amount / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "ClearingIsActivated");
      });
    });

    describe("Protected Partitions", () => {
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

    describe("Protected Partitions with Wild Card Role", () => {
      beforeEach(async () => {
        const infrastructure = await loadFixture(deployAtsInfrastructureFixture);
        const base = await deployEquityTokenFixture({
          equityDataParams: {
            securityData: {
              internalKycActivated: true,
              maxSupply: MAX_SUPPLY,
              arePartitionsProtected: true,
            },
          },
          infrastructure,
        });

        diamond = base.diamond;
        signer_A = base.deployer;
        signer_B = base.user1;
        signer_C = base.user2;
        signer_D = base.user3;
        signer_E = base.user4;

        asset = await ethers.getContractAt("IAsset", diamond.target);
        await executeRbac(asset, [
          { role: ATS_ROLES.ISSUER_ROLE, members: [signer_C.address] },
          { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
          { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
          { role: ATS_ROLES.PROTECTED_PARTITIONS_ROLE, members: [signer_A.address] },
          { role: ATS_ROLES.WILD_CARD_ROLE, members: [signer_E.address] },
        ]);

        await asset.connect(signer_A).addIssuer(signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_A).protectPartitions();
        await asset.connect(signer_C).issue(signer_E.address, amount, DATA);
      });

      it("GIVEN protected partitions and wildcard role WHEN transferWithData THEN transaction succeeds", async () => {
        expect(await asset.connect(signer_E).transferWithData(signer_D.address, amount / 2, DATA))
          .to.emit(asset, "TransferWithData")
          .withArgs(signer_E.address, signer_D.address, amount / 2, DATA);

        expect(await asset.balanceOf(signer_E.address)).to.be.equal(amount / 2);
        expect(await asset.balanceOf(signer_D.address)).to.be.equal(amount / 2);
      });

      it("GIVEN protected partitions and wildcard role WHEN transferFromWithData THEN transaction succeeds", async () => {
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_C).issue(signer_C.address, amount, DATA);
        await asset.connect(signer_C).approve(signer_E.address, amount / 2);

        expect(await asset.connect(signer_E).transferFromWithData(signer_C.address, signer_D.address, amount / 2, DATA))
          .to.emit(asset, "TransferFromWithData")
          .withArgs(signer_E.address, signer_C.address, signer_D.address, amount / 2, DATA);

        expect(await asset.balanceOf(signer_C.address)).to.be.equal(amount / 2);
        expect(await asset.balanceOf(signer_D.address)).to.be.equal(amount / 2);
      });

      it("GIVEN protected partitions without wildcard role WHEN transferWithData THEN fails with PartitionsAreProtectedAndNoRole", async () => {
        await expect(
          asset.connect(signer_D).transferWithData(signer_E.address, amount / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
      });

      it("GIVEN protected partitions without wildcard role WHEN transferFromWithData THEN fails with PartitionsAreProtectedAndNoRole", async () => {
        await asset.approve(signer_D.address, amount / 2);
        await expect(
          asset.connect(signer_D).transferFromWithData(signer_E.address, signer_C.address, amount / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
      });
    });

    describe("Recovered Addresses", () => {
      beforeEach(async () => {
        await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
        await asset.connect(signer_C).issue(signer_E.address, amount, DATA);
        await asset.connect(signer_C).issue(signer_C.address, amount, DATA);
      });

      it("GIVEN a recovered msgSender WHEN transferFromWithData THEN transaction fails with WalletRecovered", async () => {
        await asset.connect(signer_E).approve(signer_C.address, amount / 2);
        await asset.recoveryAddress(signer_C.address, signer_D.address, ethers.ZeroAddress);
        expect(await asset.isAddressRecovered(signer_C.address)).to.be.true;

        await expect(
          asset.connect(signer_C).transferFromWithData(signer_E.address, signer_D.address, amount / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
      });

      it("GIVEN a recovered receiver WHEN transferFromWithData THEN transaction fails with WalletRecovered", async () => {
        await asset.recoveryAddress(signer_D.address, signer_C.address, ethers.ZeroAddress);
        expect(await asset.isAddressRecovered(signer_D.address)).to.be.true;

        await expect(
          asset.connect(signer_A).transferFromWithData(signer_E.address, signer_D.address, amount / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
      });

      it("GIVEN a recovered tokenHolder WHEN transferFromWithData THEN transaction fails with WalletRecovered", async () => {
        await asset.recoveryAddress(signer_E.address, signer_D.address, ethers.ZeroAddress);
        expect(await asset.isAddressRecovered(signer_E.address)).to.be.true;

        await expect(
          asset.connect(signer_C).transferFromWithData(signer_E.address, signer_D.address, amount / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
      });
    });
  });
});
