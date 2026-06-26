// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import { ATS_ROLES, EMPTY_STRING, ZERO, RESOLVER_KEYS } from "@scripts";

const AMOUNT = 1000;
const MAX_SUPPLY = 10000000;
const EMPTY_VC_ID = EMPTY_STRING;

export function batchBurnTests(getCtx: () => AssetMockCtx): void {
  describe("BatchBurn Tests", () => {
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
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_AGENT, members: [signer_A.address] },
      ]);

      await asset.grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
      await asset.addIssuer(signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.connect(signer_B).grantKyc(signer_E.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_E.address);
      await asset.grantRole(ATS_ROLES.ROLE_PAUSER, signer_A.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CAP, signer_A.address);
      await asset.connect(signer_A).setMaxSupply(MAX_SUPPLY);
      await asset.forceControllable(true);
    });

    describe("batchBurn", () => {
      const burnAmount = AMOUNT / 2;

      beforeEach(async () => {
        await asset.mint(signer_D.address, burnAmount);
        await asset.mint(signer_E.address, burnAmount);

        await asset.connect(signer_D).approve(signer_A.address, burnAmount);
        await asset.connect(signer_E).approve(signer_A.address, burnAmount);
      });

      it("GIVEN approved operator WHEN batchBurn THEN transaction succeeds", async () => {
        const userAddresses = [signer_D.address, signer_E.address];
        const amounts = [burnAmount, burnAmount];

        const initialTotalSupply = await asset.totalSupply();
        const initialBalanceD = await asset.balanceOf(signer_D.address);
        const initialBalanceE = await asset.balanceOf(signer_E.address);

        await expect(asset.connect(signer_A).batchBurn(userAddresses, amounts)).to.not.be.reverted;

        const finalTotalSupply = await asset.totalSupply();
        const finalBalanceD = await asset.balanceOf(signer_D.address);
        const finalBalanceE = await asset.balanceOf(signer_E.address);

        expect(finalBalanceD).to.equal(initialBalanceD - BigInt(burnAmount));
        expect(finalBalanceE).to.equal(initialBalanceE - BigInt(burnAmount));
        expect(finalTotalSupply).to.equal(initialTotalSupply - BigInt(burnAmount * 2));
      });

      describe("bug Transfer", () => {
        it("GIVEN approved operator WHEN batchBurn THEN Transfer event is emitted for each holder", async () => {
          const userAddresses = [signer_D.address, signer_E.address];
          const amounts = [burnAmount, burnAmount];

          await expect(asset.connect(signer_A).batchBurn(userAddresses, amounts))
            .to.emit(asset, "Transfer")
            .withArgs(signer_D.address, ethers.ZeroAddress, burnAmount)
            .to.emit(asset, "Transfer")
            .withArgs(signer_E.address, ethers.ZeroAddress, burnAmount);
        });
      });

      it("GIVEN an invalid input amounts array THEN transaction fails with InputAmountsArrayLengthMismatch", async () => {
        const userAddresses = [signer_D.address];
        const amounts = [burnAmount, burnAmount];

        await expect(asset.connect(signer_A).batchBurn(userAddresses, amounts)).to.be.revertedWithCustomError(
          asset,
          "InputAmountsArrayLengthMismatch",
        );
      });

      it("GIVEN a paused token WHEN batchBurn THEN transaction fails with IsPaused", async () => {
        await asset.pause();

        const userAddresses = [signer_D.address];
        const amounts = [burnAmount];

        await expect(asset.connect(signer_A).batchBurn(userAddresses, amounts)).to.be.revertedWithCustomError(
          asset,
          "IsPaused",
        );
      });
    });

    describe("multi partition", () => {
      beforeEach(async () => {
        await asset.setMultiPartition(true);
      });

      it("GIVEN a token with multi-partition enabled WHEN batchBurn THEN transaction fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(asset.batchBurn([signer_A.address], [AMOUNT])).to.be.revertedWithCustomError(
          asset,
          "NotAllowedInMultiPartitionMode",
        );
      });
    });

    describe("Token is controllable", () => {
      beforeEach(async () => {
        await asset.forceControllable(false);
      });

      it("GIVEN token is not controllable WHEN batchBurn THEN transaction fails with TokenIsNotControllable", async () => {
        const userAddresses = [signer_D.address];
        const amounts = [AMOUNT];

        await expect(asset.connect(signer_A).batchBurn(userAddresses, amounts)).to.be.revertedWithCustomError(
          asset,
          "TokenIsNotControllable",
        );
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN batchBurn THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).batchBurn([], [])).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeBatchBurn", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeBatchBurn is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeBatchBurn())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeBatchBurn is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeBatchBurn())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.batchBurn, 1);
      });
    });

    describe("initializeBatchBurn event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeBatchBurn is called THEN emits BatchBurnInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.batchBurn);
        await expect(asset.initializeBatchBurn()).to.emit(asset, "BatchBurnInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational WHEN batchBurn is called THEN AssetNotOperational", async () => {
        await expect(asset.batchBurn([], [])).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
