// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  type ResolverProxy,
  type IAsset,
  MockedT3RevocationRegistry,
  RevertingRevocationRegistry,
} from "@contract-types";
import { ATS_ROLES, ZERO, DEFAULT_PARTITION, EMPTY_HEX_BYTES, EMPTY_STRING } from "@scripts";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

describe("SSI Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;
  let revocationList: MockedT3RevocationRegistry;

  async function deploySecurityFixture() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target);
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
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixture);
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

    async function deployRevocationFixture() {
      const base = await deployEquityTokenFixture();
      signer_A = base.deployer;
      signer_B = base.user1;
      signer_C = base.user2;

      asset = await ethers.getContractAt("IAsset", base.diamond.target);

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
      ]);

      await asset.addIssuer(signer_A.address);
      await asset.grantKyc(signer_B.address, VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.grantKyc(signer_C.address, EMPTY_STRING, ZERO, MAX_UINT256, signer_A.address);
      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: AMOUNT,
        data: EMPTY_HEX_BYTES,
      });

      revocationList = await (await ethers.getContractFactory("MockedT3RevocationRegistry")).deploy();
      revertingRegistry = await (await ethers.getContractFactory("RevertingRevocationRegistry")).deploy();
    }

    beforeEach(async () => {
      await loadFixture(deployRevocationFixture);
    });

    it("GIVEN a reverting registry WHEN transfer THEN succeeds treating KYC credential as not revoked", async () => {
      await asset.setRevocationRegistryAddress(revertingRegistry.target);
      await asset.connect(signer_B).transfer(signer_C.address, AMOUNT);
      expect(await asset.balanceOf(signer_C.address)).to.equal(AMOUNT);
    });

    it("GIVEN a working registry with revoked credential WHEN transfer THEN reverts with InvalidKycStatus", async () => {
      await asset.setRevocationRegistryAddress(revocationList.target);
      await revocationList.revoke(VC_ID); // signer_A (the issuer) revokes the credential
      await expect(asset.connect(signer_B).transfer(signer_C.address, AMOUNT)).to.be.revertedWithCustomError(
        asset,
        "InvalidKycStatus",
      );
    });

    it("GIVEN a working registry with non-revoked credential WHEN transfer THEN succeeds", async () => {
      await asset.setRevocationRegistryAddress(revocationList.target);
      await asset.connect(signer_B).transfer(signer_C.address, AMOUNT);
      expect(await asset.balanceOf(signer_C.address)).to.equal(AMOUNT);
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN addIssuer THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(deactivatedAsset.connect(base.deployer).addIssuer(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        deactivatedAsset,
        "Deactivated",
      );
    });

    it("GIVEN a deactivated asset WHEN removeIssuer THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).removeIssuer(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });

    it("GIVEN a deactivated asset WHEN setRevocationRegistryAddress THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).setRevocationRegistryAddress(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });
});
