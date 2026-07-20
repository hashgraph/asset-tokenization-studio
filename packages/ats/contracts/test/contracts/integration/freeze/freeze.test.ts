// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ADDRESS_ZERO, ATS_ROLES, RESOLVER_KEYS } from "@scripts";

export function freezeTests(getCtx: () => AssetMockCtx): void {
  describe("Freeze Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;
    let signer_E: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_D = ctx.user3;
      signer_E = ctx.user4;
      asset = ctx.asset;
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
          .withArgs(RESOLVER_KEYS.freeze, 1);
      });
    });

    describe("initializeFreeze event", () => {
      it("GIVEN a fresh deployment WHEN initializeFreeze is called THEN emits FreezeInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.freeze);
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

    describe("onlyUnrecoveredAddress", () => {
      beforeEach(async () => {
        await asset.grantRole(ATS_ROLES.ROLE_AGENT, signer_A.address);
        await asset.recoveryAddress(signer_D.address, signer_E.address, ADDRESS_ZERO);
      });

      it("GIVEN a recovered address WHEN setAddressFrozen THEN reverts with WalletRecovered", async () => {
        await expect(asset.setAddressFrozen(signer_D.address, true)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
      });

      it("GIVEN a recovered address WHEN unfreezePartialTokens THEN reverts with WalletRecovered", async () => {
        await expect(asset.unfreezePartialTokens(signer_D.address, 0)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
      });
    });

    describe("onlyPositiveUnfreezeAmount", () => {
      it("GIVEN unfreezePartialTokens with amount=0 WHEN called on a never-touched holder THEN reverts with InvalidFreezeAmount instead of listing a ghost partition", async () => {
        // Closes the same ghost-partition vector as audit finding d8b6174 (Hold): unfreezing 0
        // towards a holder with no prior entry on the partition used to list one via
        // ERC3643StorageWrapper._transferFrozenBalanceOnly -> addPartitionToOnly(0, ...).
        const signers = await ethers.getSigners();
        const freshHolder = signers[13];

        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_AGENT, signer_A.address);

        await expect(
          asset.connect(signer_A).unfreezePartialTokens(freshHolder.address, 0),
        ).to.be.revertedWithCustomError(asset, "InvalidFreezeAmount");

        expect(await asset.partitionsOf(freshHolder.address)).to.deep.equal([]);
      });
    });
  });
}
