// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, EMPTY_STRING, ZERO, RESOLVER_KEYS } from "@scripts";
import { executeRbac, MAX_UINT256 } from "@test";
import type { AssetMockCtx } from "@test";

export function kycTests(getCtx: () => AssetMockCtx): void {
  describe("Kyc Init Tests", () => {
    let signer_D: HardhatEthersSigner;
    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_D = ctx.user3;
      asset = ctx.asset;
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
      await asset.forceFacetNotRegistered(RESOLVER_KEYS.kyc);
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

  describe("KYC Core Operations", () => {
    let deployer: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;
    let asset: IAssetMock;

    const VC_ID = "vc-test-123";

    beforeEach(async () => {
      const ctx = getCtx();
      deployer = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      signer_D = ctx.user3;
      unknownSigner = ctx.unknownSigner;
      asset = ctx.asset;

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_INTERNAL_KYC_MANAGER, members: [signer_C.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [deployer.address] },
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_D.address] },
      ]);

      await asset.addIssuer(deployer.address);
    });

    describe("grantKyc", () => {
      it("GIVEN a caller with ROLE_KYC WHEN grantKyc with valid params THEN emits KycGranted", async () => {
        await expect(
          asset.connect(signer_B).grantKyc(unknownSigner.address, VC_ID, ZERO, MAX_UINT256, deployer.address),
        )
          .to.emit(asset, "KycGranted")
          .withArgs(unknownSigner.address, signer_B.address);
      });

      it("GIVEN a caller without ROLE_KYC WHEN grantKyc THEN fails with AccountHasNoRole", async () => {
        await expect(
          asset.connect(unknownSigner).grantKyc(signer_D.address, VC_ID, ZERO, MAX_UINT256, deployer.address),
        )
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.ROLE_KYC);
      });

      it("GIVEN zero address account WHEN grantKyc THEN fails with ZeroAddressNotAllowed", async () => {
        await expect(
          asset.connect(signer_B).grantKyc(ethers.ZeroAddress, VC_ID, ZERO, MAX_UINT256, deployer.address),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
      });

      it("GIVEN an unregistered issuer WHEN grantKyc THEN fails with AccountIsNotIssuer", async () => {
        await expect(
          asset.connect(signer_B).grantKyc(unknownSigner.address, VC_ID, ZERO, MAX_UINT256, unknownSigner.address),
        )
          .to.be.revertedWithCustomError(asset, "AccountIsNotIssuer")
          .withArgs(unknownSigner.address);
      });

      it("GIVEN validTo in the past WHEN grantKyc THEN fails with InvalidDates", async () => {
        await expect(
          asset.connect(signer_B).grantKyc(unknownSigner.address, VC_ID, ZERO, 1n, deployer.address),
        ).to.be.revertedWithCustomError(asset, "InvalidDates");
      });

      it("GIVEN validFrom greater than validTo WHEN grantKyc THEN fails with InvalidDates", async () => {
        await expect(
          asset.connect(signer_B).grantKyc(unknownSigner.address, VC_ID, MAX_UINT256, 1n, deployer.address),
        ).to.be.revertedWithCustomError(asset, "InvalidDates");
      });

      it("GIVEN internal KYC active and already-granted account WHEN grantKyc again THEN fails with InvalidKycStatus", async () => {
        await asset.connect(signer_C).activateInternalKyc();
        await asset.connect(signer_B).grantKyc(unknownSigner.address, VC_ID, ZERO, MAX_UINT256, deployer.address);
        await expect(
          asset.connect(signer_B).grantKyc(unknownSigner.address, "vc-456", ZERO, MAX_UINT256, deployer.address),
        ).to.be.revertedWithCustomError(asset, "InvalidKycStatus");
      });

      it("GIVEN a paused token WHEN grantKyc THEN fails with IsPaused", async () => {
        await asset.connect(signer_D).pause();
        await expect(
          asset.connect(signer_B).grantKyc(unknownSigner.address, VC_ID, ZERO, MAX_UINT256, deployer.address),
        ).to.be.revertedWithCustomError(asset, "IsPaused");
      });
    });

    describe("revokeKyc", () => {
      beforeEach(async () => {
        await asset.connect(signer_B).grantKyc(unknownSigner.address, VC_ID, ZERO, MAX_UINT256, deployer.address);
      });

      it("GIVEN a KYC-granted account WHEN revokeKyc THEN emits KycRevoked", async () => {
        await expect(asset.connect(signer_B).revokeKyc(unknownSigner.address))
          .to.emit(asset, "KycRevoked")
          .withArgs(unknownSigner.address, signer_B.address);
      });

      it("GIVEN a caller without ROLE_KYC WHEN revokeKyc THEN fails with AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).revokeKyc(signer_D.address))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.ROLE_KYC);
      });

      it("GIVEN zero address account WHEN revokeKyc THEN fails with ZeroAddressNotAllowed", async () => {
        await expect(asset.connect(signer_B).revokeKyc(ethers.ZeroAddress)).to.be.revertedWithCustomError(
          asset,
          "ZeroAddressNotAllowed",
        );
      });

      it("GIVEN a paused token WHEN revokeKyc THEN fails with IsPaused", async () => {
        await asset.connect(signer_D).pause();
        await expect(asset.connect(signer_B).revokeKyc(unknownSigner.address)).to.be.revertedWithCustomError(
          asset,
          "IsPaused",
        );
      });
    });

    describe("KYC read functions", () => {
      beforeEach(async () => {
        await asset.connect(signer_B).grantKyc(unknownSigner.address, VC_ID, ZERO, MAX_UINT256, deployer.address);
      });

      it("GIVEN a KYC-granted account WHEN getKycStatusFor THEN returns GRANTED", async () => {
        await asset.connect(signer_C).activateInternalKyc();
        const status = await asset.getKycStatusFor(unknownSigner.address);
        expect(status).to.equal(1n);
      });

      it("GIVEN an account without KYC WHEN getKycStatusFor THEN returns NOT_GRANTED", async () => {
        await asset.connect(signer_C).activateInternalKyc();
        const status = await asset.getKycStatusFor(signer_C.address);
        expect(status).to.equal(0n);
      });

      it("GIVEN a KYC-granted account WHEN getKycFor THEN returns the stored KycData", async () => {
        const kycData = await asset.getKycFor(unknownSigner.address);
        expect(kycData.vcId).to.equal(VC_ID);
        expect(kycData.validFrom).to.equal(ZERO);
        expect(kycData.validTo).to.equal(MAX_UINT256);
        expect(kycData.issuer.toLowerCase()).to.equal(deployer.address.toLowerCase());
        expect(kycData.status).to.equal(1n);
      });

      it("GIVEN a KYC-granted account WHEN getKycAccountsCount for GRANTED THEN returns 1", async () => {
        const count = await asset.getKycAccountsCount(1n);
        expect(count).to.equal(1n);
      });

      it("GIVEN multiple KYC-granted accounts WHEN getKycAccountsCount THEN returns correct count", async () => {
        await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_STRING, ZERO, MAX_UINT256, deployer.address);
        const count = await asset.getKycAccountsCount(1n);
        expect(count).to.equal(2n);
      });

      it("GIVEN KYC-granted accounts WHEN getKycAccountsData for GRANTED THEN returns accounts and data", async () => {
        const [accounts, kycData] = await asset.getKycAccountsData(1n, 0, 10);
        expect(accounts.length).to.equal(1);
        expect(accounts[0].toLowerCase()).to.equal(unknownSigner.address.toLowerCase());
        expect(kycData.length).to.equal(1);
        expect(kycData[0].vcId).to.equal(VC_ID);
      });

      it("GIVEN no NOT_GRANTED accounts tracked WHEN getKycAccountsData for NOT_GRANTED THEN returns empty", async () => {
        const [accounts, kycData] = await asset.getKycAccountsData(0n, 0, 10);
        expect(accounts.length).to.equal(0);
        expect(kycData.length).to.equal(0);
      });

      it("WHEN isInternalKycActivated after force-ready THEN returns false", async () => {
        const isActivated = await asset.isInternalKycActivated();
        expect(isActivated).to.be.false;
      });
    });

    describe("activateInternalKyc", () => {
      it("GIVEN a caller with ROLE_INTERNAL_KYC_MANAGER WHEN activateInternalKyc THEN emits InternalKycStatusUpdated and activates", async () => {
        await expect(asset.connect(signer_C).activateInternalKyc())
          .to.emit(asset, "InternalKycStatusUpdated")
          .withArgs(signer_C.address, true);
        expect(await asset.isInternalKycActivated()).to.be.true;
      });

      it("GIVEN a caller without ROLE_INTERNAL_KYC_MANAGER WHEN activateInternalKyc THEN fails with AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).activateInternalKyc())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.ROLE_INTERNAL_KYC_MANAGER);
      });

      it("GIVEN a paused token WHEN activateInternalKyc THEN fails with IsPaused", async () => {
        await asset.connect(signer_D).pause();
        await expect(asset.connect(signer_C).activateInternalKyc()).to.be.revertedWithCustomError(asset, "IsPaused");
      });
    });

    describe("deactivateInternalKyc", () => {
      beforeEach(async () => {
        await asset.connect(signer_C).activateInternalKyc();
      });

      it("GIVEN a caller with ROLE_INTERNAL_KYC_MANAGER WHEN deactivateInternalKyc THEN emits InternalKycStatusUpdated and deactivates", async () => {
        await expect(asset.connect(signer_C).deactivateInternalKyc())
          .to.emit(asset, "InternalKycStatusUpdated")
          .withArgs(signer_C.address, false);
        expect(await asset.isInternalKycActivated()).to.be.false;
      });

      it("GIVEN a caller without ROLE_INTERNAL_KYC_MANAGER WHEN deactivateInternalKyc THEN fails with AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).deactivateInternalKyc())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.ROLE_INTERNAL_KYC_MANAGER);
      });

      it("GIVEN a paused token WHEN deactivateInternalKyc THEN fails with IsPaused", async () => {
        await asset.connect(signer_D).pause();
        await expect(asset.connect(signer_C).deactivateInternalKyc()).to.be.revertedWithCustomError(asset, "IsPaused");
      });
    });
  });
}
