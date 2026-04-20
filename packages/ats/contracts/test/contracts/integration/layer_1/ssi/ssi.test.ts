// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type ResolverProxy, type IAsset, MockedT3RevocationRegistry } from "@contract-types";
import { ATS_ROLES } from "@scripts";
import { deployEquityTokenFixture } from "@test";
import { executeRbac } from "@test";

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
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._SSI_MANAGER_ROLE,
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

    it("GIVEN a paused Token WHEN setRevocationRegistryAddress THEN transaction fails with TokenIsPaused", async () => {
      await expect(
        asset.connect(signer_C).setRevocationRegistryAddress(revocationList.target),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN a paused Token WHEN addIssuer THEN transaction fails with TokenIsPaused", async () => {
      await expect(asset.connect(signer_C).addIssuer(signer_B.address)).to.be.revertedWithCustomError(
        asset,
        "TokenIsPaused",
      );
    });

    it("GIVEN a paused Token WHEN removeIssuer THEN transaction fails with TokenIsPaused", async () => {
      await expect(asset.connect(signer_C).removeIssuer(signer_B.address)).to.be.revertedWithCustomError(
        asset,
        "TokenIsPaused",
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
});
