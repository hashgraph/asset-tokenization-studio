// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ComplianceMock, IdentityRegistryMock, IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ADDRESS_ZERO, ATS_ROLES, RESOLVER_KEYS } from "@lib";
import { executeRbac } from "@test";

const name = "TEST";
const symbol = "TAC";
const decimals = 6;
const version = "1";
const onchainId = ethers.Wallet.createRandom().address;

export function identityTests(getCtx: () => AssetMockCtx): void {
  describe("Identity Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;

    let identityRegistryMock: IdentityRegistryMock;
    let complianceMock: ComplianceMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      unknownSigner = ctx.unknownSigner;
      asset = ctx.asset;

      complianceMock = await (await ethers.getContractFactory("ComplianceMock", signer_A)).deploy(true, false);
      await complianceMock.waitForDeployment();

      identityRegistryMock = await (
        await ethers.getContractFactory("IdentityRegistryMock", signer_A)
      ).deploy(true, false);
      await identityRegistryMock.waitForDeployment();

      await executeRbac(asset, [
        {
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_TREX_OWNER,
          members: [signer_A.address],
        },
      ]);

      await asset.connect(signer_A).setCompliance(complianceMock.target);
      await asset.connect(signer_A).setIdentityRegistry(identityRegistryMock.target);
    });

    describe("setOnchainID", () => {
      it("GIVEN an initialized token WHEN updating the onChanId THEN UpdatedTokenInformation emits OnchainIDUpdated with updated onchainId and current metadata", async () => {
        const retrieved_onChainId = await asset.onchainID();
        expect(retrieved_onChainId).to.equal(ADDRESS_ZERO);

        expect(await asset.setOnchainID(onchainId))
          .to.emit(asset, "UpdatedTokenInformation")
          .withArgs(name, symbol, decimals, version, onchainId);

        const retrieved_newOnChainId = await asset.onchainID();
        expect(retrieved_newOnChainId).to.equal(onchainId);
      });

      it("GIVEN an account without TREX_OWNER role WHEN setOnchainID THEN transaction fails with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).setOnchainID(onchainId)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN a paused token WHEN setOnchainID THEN transactions revert with IsPaused error", async () => {
        await asset.connect(signer_B).pause();

        await expect(asset.setOnchainID(onchainId)).to.be.revertedWithCustomError(asset, "IsPaused");
      });
    });

    describe("setIdentityRegistry", () => {
      it("GIVEN an initialized token WHEN updating the identityRegistry THEN setIdentityRegistry emits IdentityRegistryAdded with updated identityRegistry", async () => {
        const retrieved_identityRegistry = await asset.identityRegistry();
        expect(retrieved_identityRegistry).to.equal(identityRegistryMock.target as string);

        expect(await asset.setIdentityRegistry(identityRegistryMock.target as string))
          .to.emit(asset, "IdentityRegistryAdded")
          .withArgs(identityRegistryMock.target as string);

        const retrieved_newIdentityRegistry = await asset.identityRegistry();
        expect(retrieved_newIdentityRegistry).to.equal(identityRegistryMock.target as string);
      });

      it("GIVEN an account without TREX_OWNER role WHEN setIdentityRegistry THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          asset.connect(signer_C).setIdentityRegistry(identityRegistryMock.target as string),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });

      it("GIVEN a paused token WHEN setIdentityRegistry THEN transactions revert with IsPaused error", async () => {
        await asset.connect(signer_B).pause();

        await expect(asset.setIdentityRegistry(identityRegistryMock.target as string)).to.be.revertedWithCustomError(
          asset,
          "IsPaused",
        );
      });
    });

    describe("Deactivated", () => {
      it("GIVEN a deactivated asset WHEN setOnchainID THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(asset.connect(signer_A).setOnchainID(ethers.ZeroAddress)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN setIdentityRegistry THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(asset.connect(signer_A).setIdentityRegistry(ethers.ZeroAddress)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });
    });

    describe("initializeIdentity", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeIdentity THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeIdentity(ADDRESS_ZERO))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(await unknownSigner.getAddress(), ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeIdentity THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeIdentity(ADDRESS_ZERO))
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.identity, 1);
      });
    });

    describe("initializeIdentity event", () => {
      it("GIVEN fresh facet WHEN initializeIdentity THEN emits IdentityInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.identity);
        await expect(asset.initializeIdentity(ADDRESS_ZERO)).to.emit(asset, "IdentityInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN setOnchainID THEN AssetNotOperational", async () => {
        await expect(asset.setOnchainID(ethers.Wallet.createRandom().address)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });

      it("GIVEN non-operational asset WHEN setIdentityRegistry THEN AssetNotOperational", async () => {
        await expect(asset.setIdentityRegistry(ethers.Wallet.createRandom().address)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });
    });
  });
}
