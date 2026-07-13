// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { EMPTY_STRING, ATS_ROLES, ZERO, RESOLVER_KEYS } from "@scripts";

const AMOUNT = 1000;
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;

export function batchMintTests(getCtx: () => AssetMockCtx): void {
  describe("BatchMint Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;
    let signer_E: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_D = ctx.user3;
      signer_E = ctx.user4;
      unknownSigner = ctx.unknownSigner;
      asset = ctx.asset;

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_AGENT, members: [signer_A.address] },
      ]);

      await asset.addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CAP, signer_A.address);
      await asset.connect(signer_A).setMaxSupply(MAX_SUPPLY);
    });

    describe("single partition", () => {
      describe("batchMint", () => {
        it("GIVEN an account with issuer role WHEN batchMint THEN transaction succeeds and balances are updated", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address, signer_E.address];
          const amounts = [mintAmount, mintAmount];

          const initialBalanceD = await asset.balanceOf(signer_D.address);
          const initialBalanceE = await asset.balanceOf(signer_E.address);
          const initialTotalSupply = await asset.totalSupply();

          await expect(asset.batchMint(toList, amounts)).to.not.be.reverted;

          const finalBalanceD = await asset.balanceOf(signer_D.address);
          const finalBalanceE = await asset.balanceOf(signer_E.address);
          const finalTotalSupply = await asset.totalSupply();

          expect(finalBalanceD).to.be.equal(initialBalanceD + BigInt(mintAmount));
          expect(finalBalanceE).to.be.equal(initialBalanceE + BigInt(mintAmount));
          expect(finalTotalSupply).to.be.equal(initialTotalSupply + BigInt(mintAmount * 2));
        });

        describe("bug Transfer", () => {
          it("GIVEN issuer WHEN batchMint THEN Transfer event is emitted for each receiver", async () => {
            const mintAmount = AMOUNT / 2;
            const toList = [signer_D.address, signer_E.address];
            const amounts = [mintAmount, mintAmount];

            await expect(asset.batchMint(toList, amounts))
              .to.emit(asset, "Transfer")
              .withArgs(ethers.ZeroAddress, signer_D.address, mintAmount)
              .to.emit(asset, "Transfer")
              .withArgs(ethers.ZeroAddress, signer_E.address, mintAmount);
          });
        });

        it("GIVEN individual amounts each below maxSupply but cumulative total exceeds it WHEN batchMint THEN transaction fails with MaxSupplyReached", async () => {
          const amountPerRecipient = MAX_SUPPLY / 2 + 1;
          const toList = [signer_D.address, signer_E.address];
          const amounts = [amountPerRecipient, amountPerRecipient];

          await expect(asset.batchMint(toList, amounts)).to.be.revertedWithCustomError(asset, "MaxSupplyReached");
        });

        it("GIVEN an account without issuer role WHEN batchMint THEN transaction fails with AccountHasNoRole", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address, signer_E.address];
          const amounts = [mintAmount, mintAmount];

          await expect(asset.connect(signer_B).batchMint(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "AccountHasNoRoles",
          );
        });

        it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const amounts = [mintAmount, mintAmount];

          await expect(asset.batchMint(toList, amounts)).to.be.revertedWithCustomError(
            asset,
            "InputAmountsArrayLengthMismatch",
          );
        });

        it("GIVEN a paused token WHEN batchMint THEN transaction fails with IsPaused", async () => {
          await asset.pause();

          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const amounts = [mintAmount];

          await expect(asset.batchMint(toList, amounts)).to.be.revertedWithCustomError(asset, "IsPaused");
        });

        it("GIVEN a recovered caller WHEN batchMint THEN transaction fails with WalletRecovered", async () => {
          await asset.recoveryAddress(signer_A.address, signer_B.address, ethers.ZeroAddress);

          const mintAmount = AMOUNT / 2;
          const toList = [signer_D.address];
          const amounts = [mintAmount];

          await expect(asset.batchMint(toList, amounts)).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });
      });
    });

    describe("multi partition", () => {
      beforeEach(async () => {
        await asset.setMultiPartition(true);
      });

      it("GIVEN a token with multi-partition enabled WHEN batchMint THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.batchMint([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN batchMint THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).batchMint([], [])).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeBatchMint", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeBatchMint is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeBatchMint())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeBatchMint is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeBatchMint())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.batchMint, 1);
      });
    });

    describe("initializeBatchMint event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeBatchMint is called THEN emits BatchMintInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.batchMint);
        await expect(asset.initializeBatchMint()).to.emit(asset, "BatchMintInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational WHEN batchMint is called THEN AssetNotOperational", async () => {
        await expect(asset.batchMint([], [])).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
