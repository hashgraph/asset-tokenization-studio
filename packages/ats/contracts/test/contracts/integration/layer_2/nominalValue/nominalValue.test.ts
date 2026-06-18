// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, RESOLVER_KEY_NOMINAL_VALUE } from "@scripts";
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
  });
}
