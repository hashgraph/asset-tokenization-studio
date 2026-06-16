// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { EMPTY_STRING, ATS_ROLES, ZERO, RESOLVER_KEY_BATCH_CONTROLLER } from "@scripts";

const AMOUNT = 1000;
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;

export function batchControllerTests(getCtx: () => AssetMockCtx): void {
  describe("BatchController Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;
    let signer_E: HardhatEthersSigner;
    let signer_F: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_D = ctx.user3;
      signer_E = ctx.user4;
      signer_F = ctx.user5;
      unknownSigner = ctx.unknownSigner;
      asset = ctx.asset;

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_CONTROLLER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
      ]);

      await asset.addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_F.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CAP, signer_A.address);
      await asset.connect(signer_A).setMaxSupply(MAX_SUPPLY);
      await asset.forceControllable(true);
    });

    describe("single partition", () => {
      describe("batchForcedTransfer", () => {
        const transferAmount = AMOUNT / 2;

        beforeEach(async () => {
          await asset.mint(signer_F.address, transferAmount);
          await asset.mint(signer_D.address, transferAmount);
        });

        it("GIVEN controller role WHEN batchForcedTransfer THEN transaction succeeds", async () => {
          const fromList = [signer_F.address, signer_D.address];
          const toList = [signer_E.address, signer_E.address];
          const amounts = [transferAmount, transferAmount];

          const initialBalanceF = await asset.balanceOf(signer_F.address);
          const initialBalanceD = await asset.balanceOf(signer_D.address);
          const initialBalanceE = await asset.balanceOf(signer_E.address);

          await expect(asset.connect(signer_A).batchForcedTransfer(fromList, toList, amounts)).to.not.be.reverted;

          const finalBalanceF = await asset.balanceOf(signer_F.address);
          const finalBalanceD = await asset.balanceOf(signer_D.address);
          const finalBalanceE = await asset.balanceOf(signer_E.address);

          expect(finalBalanceF).to.equal(initialBalanceF - BigInt(transferAmount));
          expect(finalBalanceD).to.equal(initialBalanceD - BigInt(transferAmount));
          expect(finalBalanceE).to.equal(initialBalanceE + BigInt(transferAmount * 2));
        });

        describe("bug Transfer", () => {
          it("GIVEN controller WHEN batchForcedTransfer THEN Transfer event is emitted for each transfer", async () => {
            const fromList = [signer_F.address, signer_D.address];
            const toList = [signer_E.address, signer_E.address];
            const amounts = [transferAmount, transferAmount];

            await expect(asset.connect(signer_A).batchForcedTransfer(fromList, toList, amounts))
              .to.emit(asset, "Transfer")
              .withArgs(signer_F.address, signer_E.address, transferAmount)
              .to.emit(asset, "Transfer")
              .withArgs(signer_D.address, signer_E.address, transferAmount);
          });
        });

        it("GIVEN account without controller role WHEN batchForcedTransfer THEN transaction fails with AccountHasNoRole", async () => {
          const fromList = [signer_F.address];
          const toList = [signer_E.address];
          const amounts = [transferAmount];

          await expect(
            asset.connect(signer_B).batchForcedTransfer(fromList, toList, amounts),
          ).to.be.revertedWithCustomError(asset, "AccountHasNoRoles");
        });

        it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const fromList = [signer_F.address, signer_D.address];
          const amounts = [mintAmount, mintAmount];

          await expect(asset.batchForcedTransfer(fromList, toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "InputAmountsArrayLengthMismatch",
          );
        });

        it("GIVEN toList and amounts with different lengths WHEN batchForcedTransfer THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const mintAmount = AMOUNT / 2;
          const fromList = [signer_A.address, signer_F.address];
          const toList = [signer_D.address, signer_E.address];
          const amounts = [mintAmount];

          await expect(asset.batchForcedTransfer(fromList, toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "InputAmountsArrayLengthMismatch",
          );
        });

        it("GIVEN a paused token WHEN batchForcedTransfer THEN transaction fails with IsPaused", async () => {
          await asset.pause();

          const fromList = [signer_F.address];
          const toList = [signer_E.address];
          const amounts = [transferAmount];

          await expect(
            asset.connect(signer_A).batchForcedTransfer(fromList, toList, amounts),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });
      });
    });

    describe("multi partition", () => {
      beforeEach(async () => {
        await asset.setMultiPartition(true);
      });

      it("GIVEN a token with multi-partition enabled WHEN batchForcedTransfer THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(
          asset.batchForcedTransfer([signer_A.address], [signer_A.address], [AMOUNT]),
        ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
      });
    });

    describe("Token is controllable", () => {
      beforeEach(async () => {
        await asset.forceControllable(false);
      });

      it("GIVEN token is not controllable WHEN batchForcedTransfer THEN transaction fails with TokenIsNotControllable", async () => {
        const fromList = [signer_F.address];
        const toList = [signer_E.address];
        const amounts = [AMOUNT];

        await expect(
          asset.connect(signer_A).batchForcedTransfer(fromList, toList, amounts),
        ).to.be.revertedWithCustomError(asset, "TokenIsNotControllable");
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN batchForcedTransfer THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).batchForcedTransfer([], [], [])).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });
    });

    describe("initializeBatchController", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeBatchController is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeBatchController())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeBatchController is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeBatchController())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_BATCH_CONTROLLER, 1);
      });
    });

    describe("initializeBatchController event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeBatchController is called THEN emits BatchControllerInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_BATCH_CONTROLLER);
        await expect(asset.initializeBatchController()).to.emit(asset, "BatchControllerInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational WHEN batchForcedTransfer is called THEN AssetNotOperational", async () => {
        await expect(asset.batchForcedTransfer([], [], [])).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
