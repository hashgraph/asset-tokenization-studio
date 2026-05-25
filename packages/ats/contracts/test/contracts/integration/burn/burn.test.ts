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
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_CLEARING,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_KYC,
          members: [signer_B.address],
        },
      ]);

      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROLLER, signer_A.address);
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
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_ISSUER,
          members: [signer_C.address],
        },
        {
          role: ATS_ROLES.ROLE_KYC,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_SSI_MANAGER,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_CLEARING,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_AGENT,
          members: [signer_A.address],
        },
      ]);

      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
      await asset.connect(signer_A).addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
    }

    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    describe("burn", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROLLER, signer_A.address);
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

      it("GIVEN a paused token WHEN attempting to burn IsPaused error", async () => {
        await asset.connect(signer_B).pause();
        await expect(asset.burn(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN an account without ROLE_CONTROLLER or ROLE_AGENT WHEN burn THEN transaction fails with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_B).burn(signer_E.address, AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRoles",
        );
      });

      describe("bug Transfer", () => {
        it("GIVEN a controller WHEN burn THEN Transfer event is emitted from holder to address(0)", async () => {
          await asset.mint(signer_E.address, AMOUNT);
          await expect(asset.burn(signer_E.address, AMOUNT / 2))
            .to.emit(asset, "Transfer")
            .withArgs(signer_E.address, ethers.ZeroAddress, AMOUNT / 2);
        });
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

      it("GIVEN a paused Token WHEN redeem THEN transaction fails with IsPaused", async () => {
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).pause();
        await expect(asset.connect(signer_E).redeem(AMOUNT, DATA)).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN blocked account WHEN redeem THEN transaction fails with AccountIsBlocked", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROL_LIST, signer_A.address);
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

      describe("bug Transfer", () => {
        it("GIVEN a token holder WHEN redeem THEN Transfer event is emitted from holder to address(0)", async () => {
          await expect(asset.connect(signer_E).redeem(AMOUNT / 2, DATA))
            .to.emit(asset, "Transfer")
            .withArgs(signer_E.address, ethers.ZeroAddress, AMOUNT / 2);
        });
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

      it("GIVEN a paused Token WHEN redeemFrom THEN transaction fails with IsPaused", async () => {
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).pause();
        await expect(
          asset.connect(signer_D).redeemFrom(signer_E.address, AMOUNT / 2, DATA),
        ).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN blocked accounts WHEN redeemFrom THEN transaction fails with AccountIsBlocked", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROL_LIST, signer_A.address);
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

      describe("bug Transfer", () => {
        it("GIVEN an approved operator WHEN redeemFrom THEN Transfer event is emitted from holder to address(0)", async () => {
          await expect(asset.connect(signer_D).redeemFrom(signer_E.address, AMOUNT / 2, DATA))
            .to.emit(asset, "Transfer")
            .withArgs(signer_E.address, ethers.ZeroAddress, AMOUNT / 2);
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
            role: ATS_ROLES.ROLE_ISSUER,
            members: [signer_C.address],
          },
          {
            role: ATS_ROLES.ROLE_KYC,
            members: [signer_B.address],
          },
          {
            role: ATS_ROLES.ROLE_SSI_MANAGER,
            members: [signer_A.address],
          },
          {
            role: ATS_ROLES.ROLE_PROTECTED_PARTITIONS,
            members: [signer_A.address],
          },
          {
            role: ATS_ROLES.ROLE_WILD_CARD,
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
          role: ATS_ROLES.ROLE_KYC,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_AGENT,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_SSI_MANAGER,
          members: [signer_A.address],
        },
      ]);

      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
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

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN redeem THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).redeem(0, "0x")).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });

    it("GIVEN a deactivated asset WHEN burn THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).burn(ethers.ZeroAddress, 0)).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });

    it("GIVEN a deactivated asset WHEN redeemFrom THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).redeemFrom(ethers.ZeroAddress, 0, "0x"),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });
});
