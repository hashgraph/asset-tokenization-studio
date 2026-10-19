// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ATS_ROLES, DEFAULT_PARTITION, EIP1066_CODES, EMPTY_STRING, ZERO, RESOLVER_KEYS } from "@scripts";
import { executeRbac, MAX_UINT256 } from "@test";
import { ASSET_MOCK_CONFIG_ID } from "../../../fixtures/deploy/assetMockConfiguration";

const amount = 1000;
const DATA = "0x1234";
const EMPTY_VC_ID = EMPTY_STRING;

export function transferTests(getCtx: () => AssetMockCtx): void {
  describe("Transfer Facet Tests", () => {
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

    describe("Multi partition", () => {
      beforeEach(async () => {
        await asset.setMultiPartition(true);
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
      beforeEach(async () => {
        await executeRbac(asset, [
          { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address, signer_C.address] },
          { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
          { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_CLEARING, members: [signer_A.address, signer_B.address] },
          { role: ATS_ROLES.ROLE_CONTROL_LIST, members: [signer_A.address] },
          { role: ATS_ROLES.ROLE_PROTECTED_PARTITIONS, members: [signer_A.address] },
          { role: ATS_ROLES.ROLE_INTERNAL_KYC_MANAGER, members: [signer_A.address] },
        ]);

        await asset.connect(signer_A).activateInternalKyc();

        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
        await asset.connect(signer_A).addIssuer(signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
        await asset.connect(signer_B).issue(signer_C.address, amount, DATA);
      });

      describe("transfer", () => {
        it("GIVEN a non-kyc sender or receiver WHEN transfer THEN reverts with InvalidKycStatus", async () => {
          await asset.connect(signer_B).revokeKyc(signer_D.address);
          await expect(asset.connect(signer_C).transfer(signer_D.address, amount / 2)).to.be.revertedWithCustomError(
            asset,
            "InvalidKycStatus",
          );

          await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
          await asset.connect(signer_B).revokeKyc(signer_C.address);
          await expect(asset.connect(signer_C).transfer(signer_D.address, amount / 2)).to.be.revertedWithCustomError(
            asset,
            "InvalidKycStatus",
          );
        });

        it("GIVEN an account with balance WHEN transfer to a whitelisted account THEN emits Transfer and balances update", async () => {
          await expect(asset.connect(signer_C).transfer(signer_D.address, amount / 2))
            .to.emit(asset, "Transfer")
            .withArgs(signer_C.address, signer_D.address, amount / 2);

          expect(await asset.balanceOf(signer_C.address)).to.equal(amount / 2);
          expect(await asset.balanceOf(signer_D.address)).to.equal(amount / 2);
          expect(await asset.totalSupply()).to.equal(amount);
          expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_C.address)).to.equal(amount / 2);
          expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_D.address)).to.equal(amount / 2);
          expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(amount);
        });

        it("GIVEN a zero-value amount WHEN transfer THEN reverts with ZeroValue", async () => {
          await expect(asset.connect(signer_C).transfer(signer_D.address, 0)).to.be.revertedWithCustomError(
            asset,
            "ZeroValue",
          );
        });
      });

      describe("transferFrom", () => {
        beforeEach(async () => {
          await asset.connect(signer_C).approve(signer_D.address, amount);
        });

        it("GIVEN a non-kyc sender or receiver WHEN transferFrom THEN reverts with InvalidKycStatus", async () => {
          await asset.connect(signer_B).revokeKyc(signer_C.address);
          await expect(
            asset.connect(signer_D).transferFrom(signer_C.address, signer_D.address, amount / 2),
          ).to.be.revertedWithCustomError(asset, "InvalidKycStatus");

          await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
          await asset.connect(signer_B).revokeKyc(signer_D.address);
          await expect(
            asset.connect(signer_D).transferFrom(signer_C.address, signer_D.address, amount / 2),
          ).to.be.revertedWithCustomError(asset, "InvalidKycStatus");
        });

        it("GIVEN an allowance WHEN transferFrom to a whitelisted account THEN emits Transfer and balances update", async () => {
          await expect(asset.connect(signer_D).transferFrom(signer_C.address, signer_D.address, amount / 2))
            .to.emit(asset, "Transfer")
            .withArgs(signer_C.address, signer_D.address, amount / 2);

          expect(await asset.balanceOf(signer_C.address)).to.equal(amount / 2);
          expect(await asset.balanceOf(signer_D.address)).to.equal(amount / 2);
          expect(await asset.totalSupply()).to.equal(amount);
          expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_C.address)).to.equal(amount / 2);
          expect(await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_D.address)).to.equal(amount / 2);
          expect(await asset.totalSupplyByPartition(DEFAULT_PARTITION)).to.equal(amount);
        });

        it("GIVEN a zero-value amount WHEN transferFrom THEN reverts with ZeroValue", async () => {
          await expect(
            asset.connect(signer_D).transferFrom(signer_C.address, signer_D.address, 0),
          ).to.be.revertedWithCustomError(asset, "ZeroValue");
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

        it("GIVEN a zero-value amount WHEN transferWithData THEN reverts with ZeroValue", async () => {
          await expect(
            asset.connect(signer_E).transferWithData(signer_D.address, 0, DATA),
          ).to.be.revertedWithCustomError(asset, "ZeroValue");
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

          expect(
            await asset.connect(signer_D).transferFromWithData(signer_E.address, signer_D.address, amount / 2, DATA),
          )
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

        it("GIVEN a zero-value amount WHEN transferFromWithData THEN reverts with ZeroValue", async () => {
          await expect(
            asset.connect(signer_D).transferFromWithData(signer_E.address, signer_D.address, 0, DATA),
          ).to.be.revertedWithCustomError(asset, "ZeroValue");
        });
      });

      describe("ControlList", () => {
        it("GIVEN a blacklisted account WHEN transfer or transferFrom THEN reverts with AccountIsBlocked", async () => {
          await asset.addToControlList(signer_C.address);
          await expect(asset.connect(signer_C).transfer(signer_D.address, amount)).to.be.revertedWithCustomError(
            asset,
            "AccountIsBlocked",
          );
          await expect(
            asset.connect(signer_D).transferFrom(signer_C.address, signer_D.address, amount),
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

        it("GIVEN a paused ERC20 WHEN transfer or transferFrom THEN reverts with IsPaused", async () => {
          await expect(asset.connect(signer_C).transfer(signer_D.address, amount)).to.be.revertedWithCustomError(
            asset,
            "IsPaused",
          );
          await expect(
            asset.connect(signer_D).transferFrom(signer_C.address, signer_D.address, amount),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });

        it("GIVEN a paused token WHEN transferWithData THEN fails with IsPaused", async () => {
          await expect(
            asset.connect(signer_C).transferWithData(signer_D.address, amount / 2, DATA),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });

        it("GIVEN a paused token WHEN transferFromWithData THEN fails with IsPaused", async () => {
          await expect(
            asset.connect(signer_C).transferFromWithData(signer_E.address, signer_D.address, amount / 2, DATA),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });

        it("GIVEN a paused token WHEN transferWithData self-transfer THEN fails with IsPaused (FIND-002)", async () => {
          await expect(
            asset.connect(signer_E).transferWithData(signer_E.address, amount / 2, DATA),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });

        it("GIVEN a paused token WHEN transferFromWithData self-transfer THEN fails with IsPaused (FIND-002)", async () => {
          await expect(
            asset.connect(signer_C).transferFromWithData(signer_E.address, signer_E.address, amount / 2, DATA),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });

        it("GIVEN a paused token WHEN transferWithData called by non-paused path THEN transferWithData is NOT blocked by pause", async () => {
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
          await expect(asset.connect(signer_C).transfer(signer_D.address, amount)).to.be.revertedWithCustomError(
            asset,
            "ClearingIsActivated",
          );
          await expect(
            asset.connect(signer_D).transferFrom(signer_C.address, signer_D.address, amount),
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
          await expect(asset.connect(signer_C).transfer(signer_D.address, amount / 2)).to.be.revertedWithCustomError(
            asset,
            "PartitionsAreProtectedAndNoRole",
          );
        });

        it("GIVEN protected partitions activated WHEN transferFrom without role THEN reverts with PartitionsAreProtectedAndNoRole", async () => {
          await asset.protectPartitions();
          await asset.connect(signer_C).approve(signer_D.address, amount);
          await expect(
            asset.connect(signer_D).transferFrom(signer_C.address, signer_D.address, amount / 2),
          ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        });
      });

      describe("Protected Partitions with Wild Card Role", () => {
        beforeEach(async () => {
          await executeRbac(asset, [{ role: ATS_ROLES.ROLE_WILD_CARD, members: [signer_E.address] }]);

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
          await asset.connect(signer_C).approve(signer_E.address, amount / 2);

          expect(
            await asset.connect(signer_E).transferFromWithData(signer_C.address, signer_D.address, amount / 2, DATA),
          )
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
          await asset.grantRole(ATS_ROLES.ROLE_AGENT, signer_A.address);
          await asset.connect(signer_C).issue(signer_E.address, amount, DATA);
          await asset.connect(signer_C).issue(signer_C.address, amount, DATA);
        });

        it("GIVEN a recovered msgSender WHEN transferFromWithData THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_E).approve(signer_C.address, amount / 2);
          await asset.recoveryAddress(signer_D.address, signer_E.address, ethers.ZeroAddress);
          expect(await asset.isAddressRecovered(signer_D.address)).to.be.true;

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

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN transfer THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).transfer(ethers.ZeroAddress, 0)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN transferFrom THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(signer_A).transferFrom(ethers.ZeroAddress, ethers.ZeroAddress, 0),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN transferWithData THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(signer_A).transferWithData(ethers.ZeroAddress, 0, "0x"),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN transferFromWithData THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(signer_A).transferFromWithData(ethers.ZeroAddress, ethers.ZeroAddress, 0, "0x"),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeTransfer", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeTransfer is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeTransfer())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeTransfer is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeTransfer())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.transfer, 1);
      });
    });

    describe("initializeTransfer event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeTransfer is called THEN emits TransferInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.transfer);
        await expect(asset.initializeTransfer()).to.emit(asset, "TransferInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational WHEN transfer is called THEN AssetNotOperational", async () => {
        await expect(asset.transfer(ethers.ZeroAddress, 0n))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });

      it("GIVEN non-operational WHEN transferFrom is called THEN AssetNotOperational", async () => {
        await expect(asset.transferFrom(ethers.ZeroAddress, ethers.ZeroAddress, 0n))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });

      it("GIVEN non-operational WHEN transferWithData is called THEN AssetNotOperational", async () => {
        await expect(asset.transferWithData(ethers.ZeroAddress, 0n, "0x"))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });

      it("GIVEN non-operational WHEN transferFromWithData is called THEN AssetNotOperational", async () => {
        await expect(asset.transferFromWithData(ethers.ZeroAddress, ethers.ZeroAddress, 0n, "0x"))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });
    });
  });
}
