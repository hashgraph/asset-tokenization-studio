// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ComplianceMock, IdentityRegistryMock, IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { ASSET_MOCK_CONFIG_ID } from "../../../fixtures/deploy/assetMockConfiguration";
import { ATS_ROLES, EMPTY_STRING, ZERO, ADDRESS_ZERO, RESOLVER_KEYS } from "@lib";

const AMOUNT = 1000;
const EMPTY_VC_ID = EMPTY_STRING;

export function batchTransferTests(getCtx: () => AssetMockCtx): void {
  describe("BatchTransfer Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;
    let signer_E: HardhatEthersSigner;
    let signer_F: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;

    let identityRegistryMock: IdentityRegistryMock;
    let complianceMock: ComplianceMock;

    async function deployComplianceMocks() {
      complianceMock = await (await ethers.getContractFactory("ComplianceMock", signer_A)).deploy(true, false);
      await complianceMock.waitForDeployment();

      identityRegistryMock = await (
        await ethers.getContractFactory("IdentityRegistryMock", signer_A)
      ).deploy(true, false);
      await identityRegistryMock.waitForDeployment();
    }

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_D = ctx.user3;
      signer_E = ctx.user4;
      signer_F = ctx.user5;
      unknownSigner = ctx.unknownSigner;
      asset = ctx.asset;

      await deployComplianceMocks();

      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_TREX_OWNER, signer_A.address);
      await asset.connect(signer_A).setCompliance(complianceMock.target as string);
      await asset.connect(signer_A).setIdentityRegistry(identityRegistryMock.target as string);

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_AGENT, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_CLEARING, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_PROTECTED_PARTITIONS, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_CONTROL_LIST, members: [signer_A.address] },
      ]);

      await asset.grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
      await asset.addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_F.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.grantRole(ATS_ROLES.ROLE_PAUSER, signer_A.address);
    });

    describe("single partition", () => {
      describe("batchTransfer", () => {
        const transferAmount = AMOUNT / 4;
        const initialMintAmount = AMOUNT;

        beforeEach(async () => {
          await asset.mint(signer_E.address, initialMintAmount);
        });

        it("GIVEN a valid sender WHEN batchTransfer THEN transaction succeeds and balances are updated", async () => {
          const toList = [signer_F.address, signer_D.address];
          const amounts = [transferAmount, transferAmount];

          const initialBalanceSender = await asset.balanceOf(signer_E.address);
          const initialBalanceF = await asset.balanceOf(signer_F.address);
          const initialBalanceD = await asset.balanceOf(signer_D.address);

          await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.not.be.reverted;

          const finalBalanceSender = await asset.balanceOf(signer_E.address);
          const finalBalanceF = await asset.balanceOf(signer_F.address);
          const finalBalanceD = await asset.balanceOf(signer_D.address);

          expect(finalBalanceSender).to.equal(initialBalanceSender - BigInt(transferAmount * 2));
          expect(finalBalanceF).to.equal(initialBalanceF + BigInt(transferAmount));
          expect(finalBalanceD).to.equal(initialBalanceD + BigInt(transferAmount));
        });

        describe("bug Transfer", () => {
          it("GIVEN a valid sender WHEN batchTransfer THEN Transfer event is emitted for each receiver", async () => {
            const toList = [signer_F.address, signer_D.address];
            const amounts = [transferAmount, transferAmount];

            await expect(asset.connect(signer_E).batchTransfer(toList, amounts))
              .to.emit(asset, "Transfer")
              .withArgs(signer_E.address, signer_F.address, transferAmount)
              .to.emit(asset, "Transfer")
              .withArgs(signer_E.address, signer_D.address, transferAmount);
          });
        });

        it("GIVEN insufficient balance WHEN batchTransfer THEN transaction fails", async () => {
          const toList = [signer_F.address, signer_D.address];
          const amounts = [initialMintAmount, transferAmount];

          await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "InvalidPartition",
          );
        });

        it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const amounts = [mintAmount, mintAmount];

          await expect(asset.batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "InputAmountsArrayLengthMismatch",
          );
        });

        it("GIVEN a paused token WHEN batchTransfer THEN transaction fails with IsPaused", async () => {
          await asset.pause();

          const toList = [signer_F.address];
          const amounts = [transferAmount];

          await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "IsPaused",
          );
        });

        it("GIVEN clearing is activated WHEN batchTransfer THEN transaction fails with ClearingIsActivated", async () => {
          await asset.connect(signer_B).activateClearing();

          const toList = [signer_F.address];
          const amounts = [transferAmount];

          await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "ClearingIsActivated",
          );
        });

        it("GIVEN protected partitions without wildcard role WHEN batchTransfer THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
          await asset.protectPartitions();

          const toList = [signer_F.address];
          const amounts = [transferAmount];

          await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "PartitionsAreProtectedAndNoRole",
          );
        });

        it("GIVEN non-verified sender WHEN batchTransfer THEN transaction fails with AddressNotVerified", async () => {
          await identityRegistryMock.setFlags(false, false);

          const toList = [signer_F.address];
          const amounts = [transferAmount];

          await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "AddressNotVerified",
          );
        });

        it("GIVEN compliance returns false WHEN batchTransfer THEN transaction fails with ComplianceNotAllowed", async () => {
          await complianceMock.setFlags(false, false);

          const toList = [signer_F.address];
          const amounts = [transferAmount];

          await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "ComplianceNotAllowed",
          );
        });

        describe("ControlList", () => {
          it("GIVEN a blacklisted sender WHEN batchTransfer THEN transaction fails with AccountIsBlocked", async () => {
            await asset.addToControlList(signer_E.address);

            const toList = [signer_F.address];
            const amounts = [transferAmount];

            await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
              asset,
              "AccountIsBlocked",
            );
          });

          it("GIVEN a blacklisted destination WHEN batchTransfer THEN transaction fails with AccountIsBlocked", async () => {
            await asset.addToControlList(signer_F.address);

            const toList = [signer_D.address, signer_F.address];
            const amounts = [transferAmount, transferAmount];

            await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
              asset,
              "AccountIsBlocked",
            );
          });
        });

        describe("Recovery", () => {
          it("GIVEN a recovered sender WHEN batchTransfer THEN transaction fails with WalletRecovered", async () => {
            await asset.recoveryAddress(signer_E.address, signer_D.address, ethers.ZeroAddress);

            const toList = [signer_F.address];
            const amounts = [transferAmount];

            await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
              asset,
              "WalletRecovered",
            );
          });

          it("GIVEN a recovered destination WHEN batchTransfer THEN transaction fails with WalletRecovered", async () => {
            await asset.recoveryAddress(signer_F.address, signer_D.address, ethers.ZeroAddress);

            const toList = [signer_F.address];
            const amounts = [transferAmount];

            await expect(asset.connect(signer_E).batchTransfer(toList, amounts)).to.be.revertedWithCustomError(
              asset,
              "WalletRecovered",
            );
          });
        });

        it("GIVEN address(0) in toList WHEN batchTransfer THEN transaction fails with ZeroAddressNotAllowed", async () => {
          await expect(
            asset.connect(signer_E).batchTransfer([ADDRESS_ZERO], [transferAmount]),
          ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
        });
      });
    });

    describe("multi partition", () => {
      beforeEach(async () => {
        await asset.setMultiPartition(true);
      });

      it("GIVEN a token with multi-partition enabled WHEN batchTransfer THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.batchTransfer([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN batchTransfer THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).batchTransfer([], [])).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeBatchTransfer", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeBatchTransfer is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeBatchTransfer())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeBatchTransfer is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeBatchTransfer())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.batchTransfer, 1);
      });
    });

    describe("initializeBatchTransfer event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeBatchTransfer is called THEN emits BatchTransferInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.batchTransfer);
        await expect(asset.initializeBatchTransfer()).to.emit(asset, "BatchTransferInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational WHEN batchTransfer is called THEN AssetNotOperational", async () => {
        await expect(asset.batchTransfer([], []))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });
    });
  });
}
