// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, type ResolverProxy } from "@contract-types";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ATS_ROLES, DEFAULT_PARTITION, EMPTY_STRING, ZERO } from "@scripts";

const AMOUNT = 1000;
const BALANCE_OF_C_ORIGINAL = 2 * AMOUNT;
const DATA = "0x1234";
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("Burn Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;

  let asset: IAsset;

  describe("Multi partition mode", () => {
    async function deploySecurityFixtureMultiPartition() {
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
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;
      signer_E = base.user4;

      asset = await ethers.getContractAt("IAsset", diamond.target);
      await executeRbac(asset, [
        {
          role: ATS_ROLES._PAUSER_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._CLEARING_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._KYC_ROLE,
          members: [signer_B.address],
        },
      ]);

      await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_A.address);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureMultiPartition);
    });

    it("GIVEN an initialized token WHEN burning THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
      await expect(
        asset.connect(signer_C).burn(signer_C.address, 2 * BALANCE_OF_C_ORIGINAL),
      ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
    });

    it("GIVEN an initialized token WHEN redeem THEN fails with NotAllowedInMultiPartitionMode", async () => {
      await expect(asset.connect(signer_C).redeem(2 * BALANCE_OF_C_ORIGINAL, DATA)).to.be.revertedWithCustomError(
        asset,
        "NotAllowedInMultiPartitionMode",
      );
    });

    it("GIVEN an initialized token WHEN redeemFrom THEN fails with NotAllowedInMultiPartitionMode", async () => {
      await expect(
        asset.connect(signer_C).redeemFrom(signer_D.address, 2 * BALANCE_OF_C_ORIGINAL, DATA),
      ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
    });
  });

  describe("Single partition mode", () => {
    async function deploySecurityFixtureSinglePartition() {
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

      asset = await ethers.getContractAt("IAsset", diamond.target);
      await executeRbac(asset, [
        {
          role: ATS_ROLES._PAUSER_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._ISSUER_ROLE,
          members: [signer_C.address],
        },
        {
          role: ATS_ROLES._KYC_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._SSI_MANAGER_ROLE,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES._CLEARING_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._AGENT_ROLE,
          members: [signer_A.address],
        },
      ]);

      await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
      await asset.connect(signer_A).addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    describe("burn", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES._CONTROLLER_ROLE, signer_A.address);
      });

      it("GIVEN an initialized token WHEN burning THEN transaction success", async () => {
        await asset.mint(signer_E.address, AMOUNT);

        expect(await asset.burn(signer_E.address, AMOUNT / 2))
          .to.emit(asset, "Redeemed")
          .withArgs(signer_D.address, signer_E.address, AMOUNT / 2);

        expect(await asset.allowance(signer_E.address, signer_D.address)).to.be.equal(0);
        expect(await asset.totalSupply()).to.be.equal(AMOUNT / 2);
        expect(await asset.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT / 2);
      });

      it("GIVEN a paused token WHEN attempting to burn TokenIsPaused error", async () => {
        await asset.connect(signer_B).pause();
        await expect(asset.burn(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN an account without CONTROLLER_ROLE or AGENT_ROLE WHEN burn THEN transaction fails with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_B).burn(signer_E.address, AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRoles",
        );
      });
    });

    describe("redeem", () => {
      beforeEach(async () => {
        await asset.connect(signer_C).issue(signer_E.address, AMOUNT, DATA);
      });

      it("GIVEN an account with balance WHEN redeem THEN transaction succeeds", async () => {
        expect(await asset.connect(signer_E).redeem(AMOUNT / 2, DATA))
          .to.emit(asset, "Redeemed")
          .withArgs(ethers.ZeroAddress, signer_E.address, AMOUNT / 2);
        expect(await asset.totalSupply()).to.be.equal(AMOUNT / 2);
        expect(await asset.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT / 2);
      });

      it("GIVEN a paused Token WHEN redeem THEN transaction fails with TokenIsPaused", async () => {
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).pause();
        await expect(asset.connect(signer_E).redeem(AMOUNT, DATA)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN blocked account WHEN redeem THEN transaction fails with AccountIsBlocked", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES._CONTROL_LIST_ROLE, signer_A.address);
        await asset.connect(signer_A).addToControlList(signer_E.address);
        await expect(asset.connect(signer_E).redeem(AMOUNT, DATA)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );
      });

      it("GIVEN a token with clearing mode active WHEN redeem THEN transaction fails with ClearingIsActivated", async () => {
        await asset.connect(signer_B).activateClearing();
        await expect(asset.connect(signer_E).redeem(AMOUNT, DATA)).to.be.revertedWithCustomError(
          asset,
          "ClearingIsActivated",
        );
      });

      it("GIVEN non kyc account WHEN redeem THEN transaction reverts with InvalidKycStatus", async () => {
        await asset.connect(signer_B).revokeKyc(signer_E.address);
        await expect(asset.connect(signer_E).redeem(AMOUNT, DATA)).to.revertedWithCustomError(
          asset,
          "InvalidKycStatus",
        );
      });
    });

    describe("redeemFrom", () => {
      beforeEach(async () => {
        await asset.issue(signer_E.address, AMOUNT, DATA);
        await asset.connect(signer_E).approve(signer_D.address, AMOUNT / 2);
      });

      it("GIVEN an account with balance and another with allowance WHEN redeemFrom THEN transaction succeeds", async () => {
        expect(await asset.connect(signer_D).redeemFrom(signer_E.address, AMOUNT / 2, DATA))
          .to.emit(asset, "Redeemed")
          .withArgs(signer_D.address, signer_E.address, AMOUNT / 2);

        expect(await asset.connect(signer_E).allowance(signer_E.address, signer_D.address)).to.be.equal(0);
        expect(await asset.totalSupply()).to.be.equal(AMOUNT / 2);
        expect(await asset.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT / 2);
      });

      it("GIVEN a paused Token WHEN redeemFrom THEN transaction fails with TokenIsPaused", async () => {
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).pause();
        await expect(
          asset.connect(signer_D).redeemFrom(signer_E.address, AMOUNT / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN blocked accounts WHEN redeemFrom THEN transaction fails with AccountIsBlocked", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES._CONTROL_LIST_ROLE, signer_A.address);
        await asset.connect(signer_A).addToControlList(signer_D.address);
        await expect(
          asset.connect(signer_D).redeemFrom(signer_E.address, AMOUNT / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
      });

      it("GIVEN a token with clearing mode active WHEN redeemFrom THEN transaction fails with ClearingIsActivated", async () => {
        await asset.connect(signer_B).activateClearing();
        await expect(
          asset.connect(signer_D).redeemFrom(signer_E.address, AMOUNT / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "ClearingIsActivated");
      });

      it("GIVEN non kyc account WHEN redeemFrom THEN transaction reverts with InvalidKycStatus", async () => {
        await asset.connect(signer_B).revokeKyc(signer_E.address);
        await expect(asset.connect(signer_D).redeemFrom(signer_E.address, AMOUNT / 2, DATA)).to.revertedWithCustomError(
          asset,
          "InvalidKycStatus",
        );
      });

      describe("Recovered Addresses", () => {
        beforeEach(async () => {
          await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
          await asset.issue(signer_C.address, AMOUNT, DATA);
        });

        it("GIVEN a recovered msgSender WHEN redeemFrom THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_E).approve(signer_C.address, AMOUNT / 2);
          await asset.recoveryAddress(signer_C.address, signer_D.address, ethers.ZeroAddress);
          expect(await asset.isAddressRecovered(signer_C.address)).to.be.true;
          await expect(
            asset.connect(signer_C).redeemFrom(signer_E.address, AMOUNT / 2, DATA),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN a recovered tokenHolder WHEN redeemFrom THEN transaction fails with WalletRecovered", async () => {
          await asset.recoveryAddress(signer_E.address, signer_D.address, ethers.ZeroAddress);
          expect(await asset.isAddressRecovered(signer_E.address)).to.be.true;
          await expect(
            asset.connect(signer_C).redeemFrom(signer_E.address, AMOUNT / 2, DATA),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });
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
          {
            role: ATS_ROLES._ISSUER_ROLE,
            members: [signer_C.address],
          },
          {
            role: ATS_ROLES._KYC_ROLE,
            members: [signer_B.address],
          },
          {
            role: ATS_ROLES._SSI_MANAGER_ROLE,
            members: [signer_A.address],
          },
          {
            role: ATS_ROLES._PROTECTED_PARTITIONS_ROLE,
            members: [signer_A.address],
          },
          {
            role: ATS_ROLES._WILD_CARD_ROLE,
            members: [signer_E.address],
          },
        ]);

        await asset.connect(signer_A).addIssuer(signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_A).protectPartitions();
        await asset.connect(signer_C).issue(signer_E.address, AMOUNT, DATA);
      });

      it("GIVEN protected partitions and wildcard role WHEN redeem THEN transaction succeeds", async () => {
        expect(await asset.connect(signer_E).redeem(AMOUNT / 2, DATA))
          .to.emit(asset, "Redeemed")
          .withArgs(ethers.ZeroAddress, signer_E.address, AMOUNT / 2);

        expect(await asset.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
        expect(await asset.totalSupply()).to.be.equal(AMOUNT / 2);
      });

      it("GIVEN protected partitions without wildcard role WHEN redeem THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        await expect(asset.connect(signer_D).redeem(AMOUNT / 2, DATA)).to.be.revertedWithCustomError(
          asset,
          "PartitionsAreProtectedAndNoRole",
        );
      });

      it("GIVEN protected partitions without wildcard role WHEN redeemFrom THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        await asset.approve(signer_D.address, AMOUNT / 2);
        await expect(
          asset.connect(signer_D).redeemFrom(signer_E.address, AMOUNT / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
      });
    });
  });

  describe("Not controllable", () => {
    async function deployNonControllableFixture() {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            internalKycActivated: true,
            isControllable: false,
          },
        },
      });
      diamond = base.diamond;
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;
      signer_D = base.user3;
      signer_E = base.user4;

      asset = await ethers.getContractAt("IAsset", diamond.target);
      await executeRbac(asset, [
        {
          role: ATS_ROLES._KYC_ROLE,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES._AGENT_ROLE,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES._SSI_MANAGER_ROLE,
          members: [signer_A.address],
        },
      ]);

      await asset.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
      await asset.connect(signer_A).addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    }

    beforeEach(async () => {
      await loadFixture(deployNonControllableFixture);
    });

    it("GIVEN token is controllable WHEN burning THEN transaction fails with TokenIsNotControllable", async () => {
      await expect(asset.burn(signer_E.address, AMOUNT)).to.be.revertedWithCustomError(asset, "TokenIsNotControllable");
    });
  });
});
