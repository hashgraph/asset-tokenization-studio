// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, RESOLVER_KEY_NOMINAL_VALUE } from "@scripts";
import { executeRbac } from "@test";
import type { AssetMockCtx } from "@test";

export function nominalValueTests(getCtx: () => AssetMockCtx): void {
  describe("NominalValue Tests", () => {
    let asset: IAssetMock;
    let deployer: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      deployer = ctx.deployer;
      const signers = await ethers.getSigners();
      unknownSigner = signers[signers.length - 1];
    });

    describe("initializeNominalValue", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeNominalValue THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeNominalValue(1, 6, "0x000000"))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(await unknownSigner.getAddress(), ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeNominalValue THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeNominalValue(1, 6, "0x000000"))
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_NOMINAL_VALUE, 1);
      });
    });

    describe("initializeNominalValue event", () => {
      it("GIVEN fresh facet WHEN initializeNominalValue THEN emits NominalValueInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_NOMINAL_VALUE);
        await expect(asset.initializeNominalValue(1, 6, "0x000000")).to.emit(asset, "NominalValueInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN setNominalValue THEN AssetNotOperational", async () => {
        await expect(asset.setNominalValue(0, 0)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN setNominalValueCurrency THEN AssetNotOperational", async () => {
        await expect(asset.setNominalValueCurrency("0x000000")).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN setNominalValue THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(deployer).setNominalValue(0, 0)).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN setNominalValueCurrency THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(deployer).setNominalValueCurrency("0x000000")).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });
    });

    describe("setNominalValue", () => {
      let signer_B: HardhatEthersSigner;
      let signer_D: HardhatEthersSigner;

      beforeEach(async () => {
        const ctx = getCtx();
        asset = ctx.asset;
        deployer = ctx.deployer;
        signer_B = ctx.user1;
        signer_D = ctx.user3;
        unknownSigner = ctx.unknownSigner;

        await executeRbac(asset, [
          { role: ATS_ROLES.ROLE_NOMINAL_VALUE, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_PAUSER, members: [signer_D.address] },
        ]);
      });

      it("GIVEN a caller with ROLE_NOMINAL_VALUE WHEN setNominalValue THEN emits NominalValueSet and updates storage", async () => {
        await expect(asset.connect(signer_B).setNominalValue(200n, 4))
          .to.emit(asset, "NominalValueSet")
          .withArgs(signer_B.address, 200n, 4);
        expect(await asset.getNominalValue()).to.equal(200n);
        expect(await asset.getNominalValueDecimals()).to.equal(4);
      });

      it("GIVEN a caller without ROLE_NOMINAL_VALUE WHEN setNominalValue THEN fails with AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).setNominalValue(200n, 4))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.ROLE_NOMINAL_VALUE);
      });

      it("GIVEN a paused token WHEN setNominalValue THEN fails with IsPaused", async () => {
        await asset.connect(signer_D).pause();
        await expect(asset.connect(signer_B).setNominalValue(200n, 4)).to.be.revertedWithCustomError(asset, "IsPaused");
      });
    });

    describe("setNominalValueCurrency", () => {
      let signer_B: HardhatEthersSigner;
      let signer_D: HardhatEthersSigner;

      const EUR_CURRENCY = "0x455552";

      beforeEach(async () => {
        const ctx = getCtx();
        asset = ctx.asset;
        deployer = ctx.deployer;
        signer_B = ctx.user1;
        signer_D = ctx.user3;
        unknownSigner = ctx.unknownSigner;

        await executeRbac(asset, [
          { role: ATS_ROLES.ROLE_NOMINAL_VALUE, members: [signer_B.address] },
          { role: ATS_ROLES.ROLE_PAUSER, members: [signer_D.address] },
        ]);
      });

      it("GIVEN a caller with ROLE_NOMINAL_VALUE WHEN setNominalValueCurrency THEN emits NominalValueCurrencySet and updates storage", async () => {
        await expect(asset.connect(signer_B).setNominalValueCurrency(EUR_CURRENCY))
          .to.emit(asset, "NominalValueCurrencySet")
          .withArgs(signer_B.address, EUR_CURRENCY);
        expect(await asset.getNominalValueCurrency()).to.equal(EUR_CURRENCY);
      });

      it("GIVEN a caller without ROLE_NOMINAL_VALUE WHEN setNominalValueCurrency THEN fails with AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).setNominalValueCurrency(EUR_CURRENCY))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.ROLE_NOMINAL_VALUE);
      });
    });

    describe("NominalValue reads", () => {
      let signer_B: HardhatEthersSigner;

      beforeEach(async () => {
        const ctx = getCtx();
        asset = ctx.asset;
        signer_B = ctx.user1;

        await executeRbac(asset, [{ role: ATS_ROLES.ROLE_NOMINAL_VALUE, members: [signer_B.address] }]);

        await asset.connect(signer_B).setNominalValue(500n, 6);
        await asset.connect(signer_B).setNominalValueCurrency("0x555344");
      });

      it("WHEN getNominalValue THEN returns the updated value", async () => {
        expect(await asset.getNominalValue()).to.equal(500n);
      });

      it("WHEN getNominalValueDecimals THEN returns the updated decimals", async () => {
        expect(await asset.getNominalValueDecimals()).to.equal(6);
      });

      it("WHEN getNominalValueCurrency THEN returns the updated currency", async () => {
        expect(await asset.getNominalValueCurrency()).to.equal("0x555344");
      });
    });
  });
}
