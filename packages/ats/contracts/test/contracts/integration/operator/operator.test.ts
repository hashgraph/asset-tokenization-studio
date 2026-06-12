// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, RESOLVER_KEY_OPERATOR } from "@scripts";
import { executeRbac, grantKycToHolders } from "@test";
import type { AssetMockCtx } from "@test";

export function operatorTests(getCtx: () => AssetMockCtx): void {
  export function operatorTests(): void {
  describe("Operator Facet Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      asset = ctx.asset;
      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_CONTROL_LIST, members: [signer_A.address] },
      ]);

      await asset.addIssuer(signer_A.address);
      await grantKycToHolders(asset, signer_A, [signer_A, signer_B, signer_C]);
    });

    describe("isOperator", () => {
      it("GIVEN no authorization WHEN isOperator is called THEN returns false", async () => {
        expect(await asset.isOperator(signer_B.address, signer_C.address)).to.equal(false);
      });

      it("GIVEN an authorized operator WHEN isOperator is called THEN returns true", async () => {
        await asset.connect(signer_C).authorizeOperator(signer_B.address);
        expect(await asset.isOperator(signer_B.address, signer_C.address)).to.equal(true);
      });

      it("GIVEN a revoked operator WHEN isOperator is called THEN returns false", async () => {
        await asset.connect(signer_C).authorizeOperator(signer_B.address);
        await asset.connect(signer_C).revokeOperator(signer_B.address);
        expect(await asset.isOperator(signer_B.address, signer_C.address)).to.equal(false);
      });
    });

    describe("authorizeOperator", () => {
      it("GIVEN KYC'd addresses WHEN authorizeOperator THEN emits AuthorizedOperator and  state is updated", async () => {
        await expect(asset.connect(signer_C).authorizeOperator(signer_B.address))
          .to.emit(asset, "AuthorizedOperator")
          .withArgs(signer_B.address, signer_C.address)
          ;

        expect(await asset.isOperator(signer_B.address, signer_C.address)).to.equal(true);
      });

      it("GIVEN a paused token WHEN authorizeOperator THEN reverts with IsPaused", async () => {
        await asset.pause();
        await expect(asset.connect(signer_C).authorizeOperator(signer_B.address)).to.be.revertedWithCustomError(
          asset,
          "IsPaused",
        );
      });

      it("GIVEN a blocked operator WHEN authorizeOperator THEN reverts with AccountIsBlocked", async () => {
        await asset.addToControlList(signer_B.address);
        await expect(asset.connect(signer_C).authorizeOperator(signer_B.address)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );
      });
    });

    describe("revokeOperator", () => {
      it("GIVEN an authorized operator WHEN revokeOperator THEN emits RevokedOperator and state is updated", async () => {
        await asset.connect(signer_C).authorizeOperator(signer_B.address);

        await expect(asset.connect(signer_C).revokeOperator(signer_B.address))
          .to.emit(asset, "RevokedOperator")
          .withArgs(signer_B.address, signer_C.address)
          ;

        expect(await asset.isOperator(signer_B.address, signer_C.address)).to.equal(false);
      });

      it("GIVEN a paused token WHEN revokeOperator THEN reverts with IsPaused", async () => {
        await asset.connect(signer_C).authorizeOperator(signer_B.address);
        await asset.pause();
        await expect(asset.connect(signer_C).revokeOperator(signer_B.address)).to.be.revertedWithCustomError(
          asset,
          "IsPaused",
        );
      });

      it("GIVEN a blocked operator WHEN revokeOperator THEN reverts with AccountIsBlocked", async () => {
        await asset.connect(signer_C).authorizeOperator(signer_B.address);
        await asset.addToControlList(signer_B.address);
        await expect(asset.connect(signer_C).revokeOperator(signer_B.address)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN authorizeOperator THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).authorizeOperator(ethers.ZeroAddress)
        ).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN revokeOperator THEN transaction fails with Deactivated", async () => {

        await expect(asset.connect(signer_A).revokeOperator(ethers.ZeroAddress)
        ).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });
    });

    describe("initializeOperator", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeOperator is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeOperator())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeOperator is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeOperator())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_OPERATOR, 1);
      });
    });

    describe("initializeOperator event", () => {
      it("GIVEN a fresh deployment WHEN initializeOperator is called THEN emits OperatorInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_OPERATOR);
        await expect(asset.initializeOperator()).to.emit(asset, "OperatorInitialized");
      });
    });

    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeOperator is called THEN it reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeOperator()).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN authorizeOperator THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.authorizeOperator("0x0000000000000000000000000000000000000001"),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
