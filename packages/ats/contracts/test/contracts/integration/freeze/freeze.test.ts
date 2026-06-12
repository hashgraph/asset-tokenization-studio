// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAssetMockCtx } from "@test";
import { ADDRESS_ZERO, ATS_ROLES, RESOLVER_KEY_FREEZE } from "@scripts";

export function freezeTests(): void {
  describe("Freeze Tests", () => {
    let signer_D: HardhatEthersSigner;

    let asset: IAssetMock;

    async function deployFreezeFixture() {
      const ctx = await loadFixture(deployAssetMockCtx);
      signer_D = ctx.user3;

      asset = ctx.asset;
    }

    beforeEach(async () => {
      await loadFixture(deployFreezeFixture);
    });

    describe("initializeFreeze", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeFreeze is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_D).initializeFreeze())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_D.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeFreeze is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeFreeze())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_FREEZE, 1);
      });
    });

    describe("initializeFreeze event", () => {
      it("GIVEN a fresh deployment WHEN initializeFreeze is called THEN emits FreezeInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_FREEZE);
        await expect(asset.initializeFreeze()).to.emit(asset, "FreezeInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN setAddressFrozen THEN reverts with AssetNotOperational", async () => {
        await expect(asset.setAddressFrozen(ADDRESS_ZERO, true)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });

      it("GIVEN non-operational asset WHEN freezePartialTokens THEN reverts with AssetNotOperational", async () => {
        await expect(asset.freezePartialTokens(ADDRESS_ZERO, 0)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });

      it("GIVEN non-operational asset WHEN unfreezePartialTokens THEN reverts with AssetNotOperational", async () => {
        await expect(asset.unfreezePartialTokens(ADDRESS_ZERO, 0)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });
    });
  });
}
