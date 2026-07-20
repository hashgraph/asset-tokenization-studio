// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { ATS_ROLES, EMPTY_STRING, ZERO, ADDRESS_ZERO, RESOLVER_KEYS } from "@lib";

const AMOUNT = 1000;
const EMPTY_VC_ID = EMPTY_STRING;

export function batchFreezeTests(getCtx: () => AssetMockCtx): void {
  describe("BatchFreeze Tests", () => {
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
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_AGENT, members: [signer_A.address] },
      ]);

      await asset.grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
      await asset.addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_F.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.grantRole(ATS_ROLES.ROLE_FREEZE_MANAGER, signer_A.address);
      await asset.grantRole(ATS_ROLES.ROLE_PAUSER, signer_A.address);
    });

    describe("single partition", () => {
      describe("batchSetAddressFrozen", () => {
        const mintAmount = AMOUNT;
        const transferAmount = AMOUNT / 2;

        beforeEach(async () => {
          await asset.mint(signer_D.address, mintAmount);
          await asset.mint(signer_E.address, mintAmount);
        });

        it("GIVEN a FREEZE_MANAGER WHEN batchSetAddressFrozen with true THEN transfers from those addresses fail", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const freezeFlags = [true, true];

          await expect(asset.batchSetAddressFrozen(userAddresses, freezeFlags)).to.not.be.reverted;

          await expect(
            asset.connect(signer_D).transfer(signer_A.address, transferAmount),
          ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");

          await expect(
            asset.connect(signer_E).transfer(signer_A.address, transferAmount),
          ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
        });

        it("GIVEN paused token WHEN batchSetAddressFrozen THEN fails with IsPaused", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

          await asset.connect(signer_B).pause();

          await expect(asset.batchSetAddressFrozen(userAddresses, [true, true])).to.revertedWithCustomError(
            asset,
            "IsPaused",
          );
        });

        it("GIVEN invalid address WHEN batchSetAddressFrozen THEN fails with ZeroAddressNotAllowed", async () => {
          const userAddresses = [signer_D.address, signer_E.address, ADDRESS_ZERO];
          await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

          await expect(asset.batchSetAddressFrozen(userAddresses, [true, true, true])).to.revertedWithCustomError(
            asset,
            "ZeroAddressNotAllowed",
          );
        });

        it("GIVEN frozen addresses WHEN batchSetAddressFrozen with false THEN transfers from those addresses succeed", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);

          await asset.batchSetAddressFrozen(userAddresses, [true, true]);

          await expect(asset.batchSetAddressFrozen(userAddresses, [false, false])).to.not.be.reverted;

          await expect(asset.connect(signer_D).transfer(signer_A.address, transferAmount)).to.not.be.reverted;

          await expect(asset.connect(signer_E).transfer(signer_A.address, transferAmount)).to.not.be.reverted;

          expect(await asset.balanceOf(signer_D.address)).to.equal(mintAmount - transferAmount);
          expect(await asset.balanceOf(signer_E.address)).to.equal(mintAmount - transferAmount);
        });

        it("GIVEN an account without ATS_ROLES.ROLE_FREEZE_MANAGER WHEN batchSetAddressFrozen THEN transaction fails", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const freezeFlags = [true, true];

          await expect(
            asset.connect(signer_F).batchSetAddressFrozen(userAddresses, freezeFlags),
          ).to.be.revertedWithCustomError(asset, "AccountHasNoRoles");
        });

        it("GIVEN an invalid input boolean array THEN transaction fails with InputBoolArrayLengthMismatch", async () => {
          const toList = [signer_D.address];
          const status = [true, true];

          await expect(asset.batchSetAddressFrozen(toList, status)).to.be.revertedWithCustomError(
            asset,
            "InputBoolArrayLengthMismatch",
          );
        });
      });

      describe("batchFreezePartialTokens", () => {
        const freezeAmount = AMOUNT / 2;
        beforeEach(async () => {
          await asset.mint(signer_D.address, freezeAmount);
          await asset.mint(signer_E.address, freezeAmount);
        });

        it("GIVEN ATS_ROLES.ROLE_FREEZE_MANAGER WHEN batchFreezePartialTokens THEN tokens are frozen successfully", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const amounts = [freezeAmount, freezeAmount];

          const initialFrozenD = await asset.getFrozenTokens(signer_D.address);
          const initialFrozenE = await asset.getFrozenTokens(signer_E.address);

          await expect(asset.batchFreezePartialTokens(userAddresses, amounts)).to.not.be.reverted;

          const finalFrozenD = await asset.getFrozenTokens(signer_D.address);
          const finalFrozenE = await asset.getFrozenTokens(signer_E.address);

          expect(finalFrozenD).to.equal(initialFrozenD + BigInt(freezeAmount));
          expect(finalFrozenE).to.equal(initialFrozenE + BigInt(freezeAmount));
        });

        describe("bug Transfer", () => {
          it("GIVEN freeze manager WHEN batchFreezePartialTokens THEN Transfer event is emitted for each account", async () => {
            const userAddresses = [signer_D.address, signer_E.address];
            const amounts = [freezeAmount, freezeAmount];

            await expect(asset.batchFreezePartialTokens(userAddresses, amounts))
              .to.emit(asset, "Transfer")
              .withArgs(signer_D.address, ethers.ZeroAddress, freezeAmount)
              .to.emit(asset, "Transfer")
              .withArgs(signer_E.address, ethers.ZeroAddress, freezeAmount);
          });
        });

        it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const amounts = [mintAmount, mintAmount];

          await expect(asset.batchFreezePartialTokens(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "InputAmountsArrayLengthMismatch",
          );
        });

        it("GIVEN address(0) in userAddresses WHEN batchFreezePartialTokens THEN transaction fails with ZeroAddressNotAllowed", async () => {
          await expect(asset.batchFreezePartialTokens([ADDRESS_ZERO], [freezeAmount])).to.be.revertedWithCustomError(
            asset,
            "ZeroAddressNotAllowed",
          );
        });

        it("GIVEN an account without ROLE_FREEZE_MANAGER or ROLE_AGENT WHEN batchFreezePartialTokens THEN fails with AccountHasNoRoles", async () => {
          await expect(
            asset.connect(signer_F).batchFreezePartialTokens([signer_D.address], [freezeAmount]),
          ).to.be.revertedWithCustomError(asset, "AccountHasNoRoles");
        });
      });

      describe("batchUnfreezePartialTokens", () => {
        const totalAmount = AMOUNT;
        const unfreezeAmount = AMOUNT / 2;

        beforeEach(async () => {
          await asset.mint(signer_D.address, totalAmount);
          await asset.mint(signer_E.address, totalAmount);

          await asset.freezePartialTokens(signer_D.address, totalAmount);
          await asset.freezePartialTokens(signer_E.address, totalAmount);
        });

        it("GIVEN frozen tokens WHEN batchUnfreezePartialTokens THEN tokens are unfrozen successfully", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const amounts = [unfreezeAmount, unfreezeAmount];

          const initialFrozenD = await asset.getFrozenTokens(signer_D.address);
          const initialFrozenE = await asset.getFrozenTokens(signer_E.address);

          await expect(asset.batchUnfreezePartialTokens(userAddresses, amounts)).to.not.be.reverted;

          const finalFrozenD = await asset.getFrozenTokens(signer_D.address);
          const finalFrozenE = await asset.getFrozenTokens(signer_E.address);

          expect(finalFrozenD).to.equal(initialFrozenD - BigInt(unfreezeAmount));
          expect(finalFrozenE).to.equal(initialFrozenE - BigInt(unfreezeAmount));
        });

        describe("bug Transfer", () => {
          it("GIVEN frozen tokens WHEN batchUnfreezePartialTokens THEN Transfer event is emitted for each account", async () => {
            const userAddresses = [signer_D.address, signer_E.address];
            const amounts = [unfreezeAmount, unfreezeAmount];

            await expect(asset.batchUnfreezePartialTokens(userAddresses, amounts))
              .to.emit(asset, "Transfer")
              .withArgs(ethers.ZeroAddress, signer_D.address, unfreezeAmount)
              .to.emit(asset, "Transfer")
              .withArgs(ethers.ZeroAddress, signer_E.address, unfreezeAmount);
          });
        });

        it("GIVEN insufficient frozen tokens WHEN batchUnfreezePartialTokens THEN transaction fails", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const amounts = [totalAmount + 1, unfreezeAmount];

          await expect(asset.batchUnfreezePartialTokens(userAddresses, amounts)).to.be.revertedWithCustomError(
            asset,
            "InsufficientFrozenBalance",
          );
        });

        it("GIVEN address(0) in userAddresses WHEN batchUnfreezePartialTokens THEN transaction fails with ZeroAddressNotAllowed", async () => {
          await expect(
            asset.batchUnfreezePartialTokens([ADDRESS_ZERO], [unfreezeAmount]),
          ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
        });

        it("GIVEN an account without ROLE_FREEZE_MANAGER or ROLE_AGENT WHEN batchUnfreezePartialTokens THEN fails with AccountHasNoRoles", async () => {
          await expect(
            asset.connect(signer_F).batchUnfreezePartialTokens([signer_D.address], [unfreezeAmount]),
          ).to.be.revertedWithCustomError(asset, "AccountHasNoRoles");
        });

        it("GIVEN batchUnfreezePartialTokens with an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const toList = [signer_D.address];
          const amounts = [unfreezeAmount, unfreezeAmount];

          await expect(asset.batchUnfreezePartialTokens(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "InputAmountsArrayLengthMismatch",
          );
        });
      });

      describe("Paused", () => {
        beforeEach(async () => {
          await asset.pause();
        });

        it("GIVEN a paused token WHEN batchFreezePartialTokens THEN transactions revert with IsPaused error", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const amounts = [100, 100];

          await expect(asset.batchFreezePartialTokens(userAddresses, amounts)).to.be.revertedWithCustomError(
            asset,
            "IsPaused",
          );
        });

        it("GIVEN a paused token WHEN batchUnfreezePartialTokens THEN transactions revert with IsPaused error", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const amounts = [100, 100];

          await expect(asset.batchUnfreezePartialTokens(userAddresses, amounts)).to.be.revertedWithCustomError(
            asset,
            "IsPaused",
          );
        });
      });
    });

    describe("multi partition", () => {
      beforeEach(async () => {
        await asset.setMultiPartition(true);
      });

      it("GIVEN a token with multi-partition enabled WHEN batchFreezePartialTokens THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.batchFreezePartialTokens([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });

      it("GIVEN a token with multi-partition enabled WHEN batchUnfreezePartialTokens THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.batchUnfreezePartialTokens([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN batchSetAddressFrozen THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).batchSetAddressFrozen([], [])).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN batchFreezePartialTokens THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).batchFreezePartialTokens([], [])).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN batchUnfreezePartialTokens THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).batchUnfreezePartialTokens([], [])).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });
    });

    describe("initializeBatchFreeze", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeBatchFreeze is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeBatchFreeze())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeBatchFreeze is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeBatchFreeze())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.batchFreeze, 1);
      });
    });

    describe("initializeBatchFreeze event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeBatchFreeze is called THEN emits BatchFreezeInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.batchFreeze);
        await expect(asset.initializeBatchFreeze()).to.emit(asset, "BatchFreezeInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN batchSetAddressFrozen THEN reverts with AssetNotOperational", async () => {
        await expect(asset.batchSetAddressFrozen([], [])).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN batchFreezePartialTokens THEN reverts with AssetNotOperational", async () => {
        await expect(asset.batchFreezePartialTokens([], [])).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });

      it("GIVEN non-operational asset WHEN batchUnfreezePartialTokens THEN reverts with AssetNotOperational", async () => {
        await expect(asset.batchUnfreezePartialTokens([], [])).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });
    });
  });
}
