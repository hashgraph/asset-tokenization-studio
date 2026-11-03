// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";

export function kycLayer1Tests(getCtx: () => AssetMockCtx): void {
  describe("Kyc Tests", () => {
    let signer_A: HardhatEthersSigner;
    let asset: IAssetMock;

    describe("Deactivated", () => {
      beforeEach(async () => {
        const ctx = getCtx();
        signer_A = ctx.deployer;
        asset = ctx.asset;
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN activateInternalKyc THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).activateInternalKyc()).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN deactivateInternalKyc THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).deactivateInternalKyc()).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN grantKyc THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(signer_A).grantKyc(ethers.ZeroAddress, "", 0, 0, ethers.ZeroAddress),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN revokeKyc THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).revokeKyc(ethers.ZeroAddress)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        const ctx = getCtx();
        signer_A = ctx.deployer;
        asset = ctx.asset;
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN grantKyc THEN reverts with AssetNotOperational", async () => {
        await expect(asset.grantKyc(ethers.ZeroAddress, "", 0, 0, ethers.ZeroAddress)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });
    });
  });
}
