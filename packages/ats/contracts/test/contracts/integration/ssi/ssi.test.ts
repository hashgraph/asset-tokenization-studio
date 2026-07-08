// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock, MockedT3RevocationRegistry, RevertingRevocationRegistry } from "@contract-types";
import { ATS_ROLES, DEFAULT_PARTITION, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO, RESOLVER_KEYS } from "@scripts";
import { executeRbac, MAX_UINT256 } from "@test";
import type { AssetMockCtx } from "@test";

export function ssiTests(getCtx: () => AssetMockCtx): void {
  describe("SSI Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;
    let equityAsset: IAssetMock;
    let revocationList: MockedT3RevocationRegistry;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;
      unknownSigner = ctx.unknownSigner;

      asset = ctx.asset;
      equityAsset = ctx.asset;
      await executeRbac(asset, [
        {
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_SSI_MANAGER,
          members: [signer_C.address],
        },
      ]);
      revocationList = await (await ethers.getContractFactory("MockedT3RevocationRegistry", signer_C)).deploy();
      await revocationList.waitForDeployment();
    });

    describe("Paused", () => {
      beforeEach(async () => {
        // Pausing the token
        await asset.connect(signer_A).pause();
      });

      it("GIVEN a paused Token WHEN setRevocationRegistryAddress THEN transaction fails with IsPaused", async () => {
        await expect(
          asset.connect(signer_C).setRevocationRegistryAddress(revocationList.target),
        ).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN a paused Token WHEN addIssuer THEN transaction fails with IsPaused", async () => {
        await expect(asset.connect(signer_C).addIssuer(signer_B.address)).to.be.revertedWithCustomError(
          asset,
          "IsPaused",
        );
      });

      it("GIVEN a paused Token WHEN removeIssuer THEN transaction fails with IsPaused", async () => {
        await expect(asset.connect(signer_C).removeIssuer(signer_B.address)).to.be.revertedWithCustomError(
          asset,
          "IsPaused",
        );
      });
    });

    describe("Access Control", () => {
      it("GIVEN a non SSIManager account WHEN setRevocationRegistryAddress THEN transaction fails with AccountHasNoRole", async () => {
        await expect(
          asset.connect(signer_B).setRevocationRegistryAddress(revocationList.target),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });

      it("GIVEN a non SSIManager account WHEN addIssuer THEN transaction fails with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_B).addIssuer(signer_B.address)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN a non SSIManager account WHEN removeIssuer THEN transaction fails with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_B).removeIssuer(signer_B.address)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });
    });

    describe("SsiManagement Wrong input data", () => {
      it("GIVEN listed issuer WHEN adding issuer THEN fails with ListedIssuer", async () => {
        await asset.connect(signer_C).addIssuer(signer_B.address);

        await expect(asset.connect(signer_C).addIssuer(signer_B.address)).to.be.revertedWithCustomError(
          asset,
          "ListedIssuer",
        );
      });

      it("GIVEN unlisted issuer WHEN removing issuer THEN fails with UnlistedIssuer", async () => {
        await expect(asset.connect(signer_C).removeIssuer(signer_B.address)).to.be.revertedWithCustomError(
          asset,
          "UnlistedIssuer",
        );
      });

      it("GIVEN zero address WHEN addIssuer THEN fails with ZeroAddressNotAllowed", async () => {
        await expect(asset.connect(signer_C).addIssuer(ethers.ZeroAddress)).to.be.revertedWithCustomError(
          asset,
          "ZeroAddressNotAllowed",
        );
      });
    });

    describe("SsiManagement OK", () => {
      it("GIVEN a revocationList WHEN setRevocationRegistryAddress THEN transaction succeed", async () => {
        expect(await asset.connect(signer_C).setRevocationRegistryAddress(revocationList.target))
          .to.emit(asset, "RevocationRegistryAddressSet")
          .withArgs(ethers.ZeroAddress, revocationList.target);

        const revocationListAddress = await asset.connect(signer_C).getRevocationRegistryAddress();

        expect(revocationListAddress).to.equal(revocationList.target);
      });

      it("GIVEN an unlisted issuer WHEN addIssuer THEN transaction succeed", async () => {
        expect(await asset.connect(signer_C).addIssuer(signer_B.address)).to.emit(asset, "AddedToIssuerList");

        expect(await asset.connect(signer_C).isIssuer(signer_B.address)).to.equal(true);
        expect(await asset.connect(signer_C).getIssuerListCount()).to.equal(1);

        const issuerList = await asset.connect(signer_C).getIssuerListMembers(0, 1);

        expect(issuerList).to.deep.equal([signer_B.address]);
        expect(issuerList.length).to.equal(1);
      });

      it("GIVEN a listed issuer WHEN removeIssuer THEN transaction succeed", async () => {
        await asset.connect(signer_C).addIssuer(signer_B.address);
        const issuerStatusBefore = await asset.connect(signer_C).isIssuer(signer_B.address);
        const issuerListBefore = await asset.connect(signer_C).getIssuerListMembers(0, 1);
        const issuerListCountBefore = await asset.connect(signer_C).getIssuerListCount();

        expect(await asset.connect(signer_C).removeIssuer(signer_B.address)).to.emit(asset, "RemovedFromIssuerList");

        expect(issuerStatusBefore).to.equal(true);
        expect(await asset.connect(signer_C).isIssuer(signer_B.address)).to.equal(false);
        expect(issuerListCountBefore).to.equal(1);
        expect(await asset.connect(signer_C).getIssuerListCount()).to.equal(0);
        expect(issuerListBefore.length).to.equal(1);
        expect(issuerListBefore).to.deep.equal([signer_B.address]);
        expect(await asset.connect(signer_C).getIssuerListMembers(0, 1)).to.deep.equal([]);
      });
    });

    describe("RevocationRegistry", () => {
      const VC_ID = "vc-001";
      const AMOUNT = 1000;
      let revertingRegistry: RevertingRevocationRegistry;

      beforeEach(async () => {
        const ctx = getCtx();
        signer_A = ctx.deployer;
        signer_B = ctx.user1;
        signer_C = ctx.user2;

        equityAsset = ctx.asset;

        await executeRbac(equityAsset, [
          { role: ATS_ROLES.ROLE_ISSUER, members: [signer_A.address] },
          { role: ATS_ROLES.ROLE_KYC, members: [signer_A.address] },
          { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        ]);

        await equityAsset.forceFacetNotRegistered(RESOLVER_KEYS.kyc);
        await equityAsset.initializeInternalKyc(true);
        await equityAsset.addIssuer(signer_A.address);
        await equityAsset.grantKyc(signer_B.address, VC_ID, ZERO, MAX_UINT256, signer_A.address);
        await equityAsset.grantKyc(signer_C.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);
        await equityAsset.issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_B.address,
          value: AMOUNT,
          data: EMPTY_HEX_BYTES,
        });

        revocationList = await (await ethers.getContractFactory("MockedT3RevocationRegistry")).deploy();
        revertingRegistry = await (await ethers.getContractFactory("RevertingRevocationRegistry")).deploy();
      });

      it("GIVEN a reverting registry WHEN transfer THEN succeeds treating KYC credential as not revoked", async () => {
        await equityAsset.setRevocationRegistryAddress(revertingRegistry.target);
        await equityAsset.connect(signer_B).transfer(signer_C.address, AMOUNT);
        expect(await equityAsset.balanceOf(signer_C.address)).to.equal(AMOUNT);
      });

      it("GIVEN a working registry with revoked credential WHEN transfer THEN reverts with InvalidKycStatus", async () => {
        await equityAsset.setRevocationRegistryAddress(revocationList.target);
        await revocationList.revoke(VC_ID); // signer_A (the issuer) revokes the credential
        await expect(equityAsset.connect(signer_B).transfer(signer_C.address, AMOUNT)).to.be.revertedWithCustomError(
          equityAsset,
          "InvalidKycStatus",
        );
      });

      it("GIVEN a working registry with non-revoked credential WHEN transfer THEN succeeds", async () => {
        await equityAsset.setRevocationRegistryAddress(revocationList.target);
        await equityAsset.connect(signer_B).transfer(signer_C.address, AMOUNT);
        expect(await equityAsset.balanceOf(signer_C.address)).to.equal(AMOUNT);
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN addIssuer THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).addIssuer(ethers.ZeroAddress)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN removeIssuer THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).removeIssuer(ethers.ZeroAddress)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN setRevocationRegistryAddress THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(signer_A).setRevocationRegistryAddress(ethers.ZeroAddress),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeSsiManagement", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeSsiManagement THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeSsiManagement())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(await unknownSigner.getAddress(), ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeSsiManagement THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeSsiManagement())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.ssiManagement, 1);
      });
    });

    describe("initializeSsiManagement event", () => {
      it("GIVEN fresh facet WHEN initializeSsiManagement THEN emits SsiManagementInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.ssiManagement);
        await expect(asset.initializeSsiManagement()).to.emit(asset, "SsiManagementInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN addIssuer THEN AssetNotOperational", async () => {
        await expect(asset.addIssuer(ethers.ZeroAddress)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN removeIssuer THEN AssetNotOperational", async () => {
        await expect(asset.removeIssuer(ethers.ZeroAddress)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });

      it("GIVEN non-operational asset WHEN setRevocationRegistryAddress THEN AssetNotOperational", async () => {
        await expect(asset.setRevocationRegistryAddress(ethers.ZeroAddress)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });
    });
  });
}
