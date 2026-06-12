// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { RESOLVER_KEY_KYC } from "@scripts";
import { deployAssetMockCtx } from "@test";

export function kycTests(): void {
  describe("Kyc Init Tests", () => {
    let signer_D: HardhatEthersSigner;
    let asset: IAssetMock;

    async function deployFixture() {
      const ctx = await loadFixture(deployAssetMockCtx);
      signer_D = ctx.user3;
      asset = ctx.asset;
    }

    beforeEach(async () => {
      await loadFixture(deployFixture);
    });

    it("GIVEN an initialized contract WHEN initializeInternalKyc is called again THEN it reverts with FacetAlreadyRegistered", async () => {
      await expect(asset.initializeInternalKyc(true)).to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered");
    });

    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeInternalKyc is called THEN it reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_D).initializeInternalKyc(true)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a new deployment WHEN initializeInternalKyc is called THEN it emits KycInitialized", async () => {
      await asset.forceFacetNotRegistered(RESOLVER_KEY_KYC);
      await expect(asset.initializeInternalKyc(true)).to.emit(asset, "KycInitialized").withArgs(true);
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN activateInternalKyc THEN reverts with AssetNotOperational", async () => {
        await expect(asset.activateInternalKyc()).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN deactivateInternalKyc THEN reverts with AssetNotOperational", async () => {
        await expect(asset.deactivateInternalKyc()).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN revokeKyc THEN reverts with AssetNotOperational", async () => {
        await expect(asset.revokeKyc(ethers.ZeroAddress)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
