// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { ASSET_MOCK_CONFIG_ID } from "../../../fixtures/deploy/assetMockConfiguration";
import { ATS_ROLES, DEFAULT_PARTITION, EMPTY_STRING, ZERO, RESOLVER_KEY_BURN } from "@scripts";

const AMOUNT = 1000;
const BALANCE_OF_C_ORIGINAL = 2 * AMOUNT;
const DATA = "0x1234";
const EMPTY_VC_ID = EMPTY_STRING;

export function burnTests(getCtx: () => AssetMockCtx): void {
  describe("Burn Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;
    let signer_E: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      signer_D = ctx.user3;
      signer_E = ctx.user4;
      unknownSigner = ctx.unknownSigner;
      asset = ctx.asset;
    });

    describe("Multi partition mode", () => {
      beforeEach(async () => {
        await asset.setMultiPartition(true);

        await executeRbac(asset, [
          { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_CLEARING, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_INTERNAL_KYC_MANAGER, members: [signer_A.address] },
        ]);

        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROLLER, signer_A.address);
        await asset.connect(signer_A).activateInternalKyc();
      });

      it.skip("GIVEN a token with multi-partition mode WHEN burning THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(
          asset.connect(signer_C).burn(signer_C.address, 2 * BALANCE_OF_C_ORIGINAL),
        ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
      });

      it.skip("GIVEN a token with multi-partition mode WHEN redeem THEN fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.connect(signer_C).redeem(2 * BALANCE_OF_C_ORIGINAL, DATA)).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it.skip("GIVEN a token with multi-partition mode WHEN redeemFrom THEN fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(
          asset.connect(signer_C).redeemFrom(signer_D.address, 2 * BALANCE_OF_C_ORIGINAL, DATA),
        ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
      });
    });

    describe("Single partition mode", () => {
      beforeEach(async () => {
        await asset.forceControllable(true);

        await executeRbac(asset, [
          { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_ISSUER, members: [signer_C.address] },
          { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
          { role: ATS_ROLES.ROLE_CLEARING, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_AGENT, members: [signer_A.address] },
          { role: ATS_ROLES.ROLE_INTERNAL_KYC_MANAGER, members: [signer_A.address] },
        ]);

        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
        await asset.connect(signer_A).addIssuer(signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_A).activateInternalKyc();
      });

      describe("burn", () => {
        beforeEach(async () => {
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROLLER, signer_A.address);
        });

        it.skip("GIVEN an initialized token WHEN burning THEN transaction success", async () => {
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

        it.skip("GIVEN a paused token WHEN attempting to burn IsPaused error", async () => {
          await asset.connect(signer_B).pause();
          await expect(asset.burn(signer_A.address, AMOUNT)).to.be.revertedWithCustomError(asset, "IsPaused");
        });

        it.skip("GIVEN an account without ROLE_CONTROLLER or ROLE_AGENT WHEN burn THEN transaction fails with AccountHasNoRole", async () => {
          await expect(asset.connect(signer_B).burn(signer_E.address, AMOUNT)).to.be.revertedWithCustomError(
            asset,
            "AccountHasNoRoles",
          );
        });

        describe("bug Transfer", () => {
          it.skip("GIVEN a controller WHEN burn THEN Transfer event is emitted from holder to address(0)", async () => {
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

        it.skip("GIVEN an account with balance WHEN redeem THEN transaction succeeds", async () => {
          expect(await asset.connect(signer_E).redeem(AMOUNT / 2, DATA))
            .to.emit(asset, "Redeemed")
            .withArgs(ethers.ZeroAddress, signer_E.address, AMOUNT / 2);
          expect(await asset.totalSupply()).to.be.equal(AMOUNT / 2);
          expect(await asset.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
          expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(AMOUNT / 2);
          expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT / 2);
        });

        it.skip("GIVEN a paused Token WHEN redeem THEN transaction fails with IsPaused", async () => {
          await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
          await asset.connect(signer_B).pause();
          await expect(asset.connect(signer_E).redeem(AMOUNT, DATA)).to.be.revertedWithCustomError(asset, "IsPaused");
        });

        it.skip("GIVEN blocked account WHEN redeem THEN transaction fails with AccountIsBlocked", async () => {
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROL_LIST, signer_A.address);
          await asset.connect(signer_A).addToControlList(signer_E.address);
          await expect(asset.connect(signer_E).redeem(AMOUNT, DATA)).to.be.revertedWithCustomError(
            asset,
            "AccountIsBlocked",
          );
        });

        it.skip("GIVEN a token with clearing mode active WHEN redeem THEN transaction fails with ClearingIsActivated", async () => {
          await asset.connect(signer_B).activateClearing();
          await expect(asset.connect(signer_E).redeem(AMOUNT, DATA)).to.be.revertedWithCustomError(
            asset,
            "ClearingIsActivated",
          );
        });

        it.skip("GIVEN non kyc account WHEN redeem THEN transaction reverts with InvalidKycStatus", async () => {
          await asset.connect(signer_B).revokeKyc(signer_E.address);
          await expect(asset.connect(signer_E).redeem(AMOUNT, DATA)).to.revertedWithCustomError(
            asset,
            "InvalidKycStatus",
          );
        });

        describe("bug Transfer", () => {
          it.skip("GIVEN a token holder WHEN redeem THEN Transfer event is emitted from holder to address(0)", async () => {
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

        it.skip("GIVEN an account with balance and another with allowance WHEN redeemFrom THEN transaction succeeds", async () => {
          expect(await asset.connect(signer_D).redeemFrom(signer_E.address, AMOUNT / 2, DATA))
            .to.emit(asset, "Redeemed")
            .withArgs(signer_D.address, signer_E.address, AMOUNT / 2);

          expect(await asset.connect(signer_E).allowance(signer_E.address, signer_D.address)).to.be.equal(0);
          expect(await asset.totalSupply()).to.be.equal(AMOUNT / 2);
          expect(await asset.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
          expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_E.address)).to.be.equal(AMOUNT / 2);
          expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.be.equal(AMOUNT / 2);
        });

        it.skip("GIVEN a paused Token WHEN redeemFrom THEN transaction fails with IsPaused", async () => {
          await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
          await asset.connect(signer_B).pause();
          await expect(
            asset.connect(signer_D).redeemFrom(signer_E.address, AMOUNT / 2, DATA),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });

        it.skip("GIVEN blocked accounts WHEN redeemFrom THEN transaction fails with AccountIsBlocked", async () => {
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROL_LIST, signer_A.address);
          await asset.connect(signer_A).addToControlList(signer_D.address);
          await expect(
            asset.connect(signer_D).redeemFrom(signer_E.address, AMOUNT / 2, DATA),
          ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
        });

        it.skip("GIVEN a token with clearing mode active WHEN redeemFrom THEN transaction fails with ClearingIsActivated", async () => {
          await asset.connect(signer_B).activateClearing();
          await expect(
            asset.connect(signer_D).redeemFrom(signer_E.address, AMOUNT / 2, DATA),
          ).to.be.revertedWithCustomError(asset, "ClearingIsActivated");
        });

        it.skip("GIVEN non kyc account WHEN redeemFrom THEN transaction reverts with InvalidKycStatus", async () => {
          await asset.connect(signer_B).revokeKyc(signer_E.address);
          await expect(
            asset.connect(signer_D).redeemFrom(signer_E.address, AMOUNT / 2, DATA),
          ).to.revertedWithCustomError(asset, "InvalidKycStatus");
        });

        describe("Recovered Addresses", () => {
          beforeEach(async () => {
            await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
            await asset.issue(signer_C.address, AMOUNT, DATA);
          });

          it.skip("GIVEN a recovered msgSender WHEN redeemFrom THEN transaction fails with WalletRecovered", async () => {
            await asset.connect(signer_E).approve(signer_C.address, AMOUNT / 2);
            await asset.recoveryAddress(signer_C.address, signer_D.address, ethers.ZeroAddress);
            expect(await asset.isAddressRecovered(signer_C.address)).to.be.true;
            await expect(
              asset.connect(signer_C).redeemFrom(signer_E.address, AMOUNT / 2, DATA),
            ).to.be.revertedWithCustomError(asset, "WalletRecovered");
          });

          it.skip("GIVEN a recovered tokenHolder WHEN redeemFrom THEN transaction fails with WalletRecovered", async () => {
            await asset.recoveryAddress(signer_E.address, signer_D.address, ethers.ZeroAddress);
            expect(await asset.isAddressRecovered(signer_E.address)).to.be.true;
            await expect(
              asset.connect(signer_C).redeemFrom(signer_E.address, AMOUNT / 2, DATA),
            ).to.be.revertedWithCustomError(asset, "WalletRecovered");
          });
        });

        describe("bug Transfer", () => {
          it.skip("GIVEN an approved operator WHEN redeemFrom THEN Transfer event is emitted from holder to address(0)", async () => {
            await expect(asset.connect(signer_D).redeemFrom(signer_E.address, AMOUNT / 2, DATA))
              .to.emit(asset, "Transfer")
              .withArgs(signer_E.address, ethers.ZeroAddress, AMOUNT / 2);
          });
        });
      });

      describe("Protected Partitions with Wild Card Role", () => {
        beforeEach(async () => {
          await executeRbac(asset, [
            { role: ATS_ROLES.ROLE_PROTECTED_PARTITIONS, members: [signer_A.address] },
            { role: ATS_ROLES.ROLE_WILD_CARD, members: [signer_E.address] },
          ]);

          await asset.connect(signer_A).protectPartitions();
          await asset.connect(signer_C).issue(signer_E.address, AMOUNT, DATA);
        });

        it.skip("GIVEN protected partitions and wildcard role WHEN redeem THEN transaction succeeds", async () => {
          expect(await asset.connect(signer_E).redeem(AMOUNT / 2, DATA))
            .to.emit(asset, "Redeemed")
            .withArgs(ethers.ZeroAddress, signer_E.address, AMOUNT / 2);

          expect(await asset.balanceOf(signer_E.address)).to.be.equal(AMOUNT / 2);
          expect(await asset.totalSupply()).to.be.equal(AMOUNT / 2);
        });

        it.skip("GIVEN protected partitions without wildcard role WHEN redeem THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
          await expect(asset.connect(signer_D).redeem(AMOUNT / 2, DATA)).to.be.revertedWithCustomError(
            asset,
            "PartitionsAreProtectedAndNoRole",
          );
        });

        it.skip("GIVEN protected partitions without wildcard role WHEN redeemFrom THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
          await asset.approve(signer_D.address, AMOUNT / 2);
          await expect(
            asset.connect(signer_D).redeemFrom(signer_E.address, AMOUNT / 2, DATA),
          ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        });
      });
    });

    describe("Not controllable", () => {
      beforeEach(async () => {
        await executeRbac(asset, [
          { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_AGENT, members: [signer_A.address] },
          { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
          { role: ATS_ROLES.ROLE_INTERNAL_KYC_MANAGER, members: [signer_A.address] },
        ]);

        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
        await asset.connect(signer_A).addIssuer(signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_A).activateInternalKyc();
      });

      it.skip("GIVEN token is not controllable WHEN burning THEN transaction fails with TokenIsNotControllable", async () => {
        await expect(asset.burn(signer_E.address, AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "TokenIsNotControllable",
        );
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it.skip("GIVEN a deactivated asset WHEN redeem THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).redeem(0, "0x")).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it.skip("GIVEN a deactivated asset WHEN burn THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).burn(ethers.ZeroAddress, 0)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it.skip("GIVEN a deactivated asset WHEN redeemFrom THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).redeemFrom(ethers.ZeroAddress, 0, "0x")).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });
    });

    describe("initializeBurn", () => {
      it.skip("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeBurn is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeBurn())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it.skip("GIVEN already-initialised WHEN initializeBurn is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeBurn())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_BURN, 1);
      });
    });

    describe("initializeBurn event", () => {
      it.skip("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeBurn is called THEN emits BurnInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_BURN);
        await expect(asset.initializeBurn()).to.emit(asset, "BurnInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it.skip("GIVEN non-operational WHEN burn is called THEN AssetNotOperational", async () => {
        await expect(asset.burn(ethers.ZeroAddress, 0n))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });

      it.skip("GIVEN non-operational WHEN redeem is called THEN AssetNotOperational", async () => {
        await expect(asset.redeem(0n, "0x"))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });

      it.skip("GIVEN non-operational WHEN redeemFrom is called THEN AssetNotOperational", async () => {
        await expect(asset.redeemFrom(ethers.ZeroAddress, 0n, "0x"))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });
    });
  });
}
