// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, executeRbac } from "@test";

const KEY_A = ethers.id("metadata.test.key.A");
const UNSET_KEY = ethers.id("metadata.test.key.unset");

const PAYLOAD_1 = ethers.hexlify(ethers.toUtf8Bytes("payload-one"));
const PAYLOAD_2 = ethers.hexlify(ethers.toUtf8Bytes("payload-two-longer-content"));
const PAYLOAD_3 = ethers.hexlify(ethers.toUtf8Bytes("payload-three"));

describe("Metadata Tests", () => {
  let diamond: ResolverProxy;
  let asset: IAsset;

  let signer_A: HardhatEthersSigner; // admin / metadata manager
  let signer_B: HardhatEthersSigner; // pauser
  let signer_C: HardhatEthersSigner; // unprivileged caller

  async function deployMetadataFixture() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.METADATA_MANAGER_ROLE,
        members: [signer_A.address],
      },
    ]);
  }

  beforeEach(async () => {
    await loadFixture(deployMetadataFixture);
  });

  describe("AccessControl", () => {
    it("GIVEN an account without metadata manager role WHEN setMetadata THEN transaction fails with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).setMetadata(KEY_A, [PAYLOAD_1])).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });
  });

  describe("Paused", () => {
    beforeEach(async () => {
      await asset.connect(signer_B).pause();
    });

    it("GIVEN a paused Token WHEN setMetadata THEN transaction fails with IsPaused", async () => {
      await expect(asset.connect(signer_A).setMetadata(KEY_A, [PAYLOAD_1])).to.be.revertedWithCustomError(
        asset,
        "IsPaused",
      );
    });
  });

  describe("setMetadata & getMetadata", () => {
    it("GIVEN role and unpaused token WHEN setMetadata with a single payload THEN getMetadata returns it", async () => {
      await asset.connect(signer_A).setMetadata(KEY_A, [PAYLOAD_1]);

      const stored = await asset.getMetadata(KEY_A);
      expect(stored).to.deep.equal([PAYLOAD_1]);
    });

    it("GIVEN role and unpaused token WHEN setMetadata with multiple payloads THEN getMetadata preserves order", async () => {
      const value = [PAYLOAD_1, PAYLOAD_2, PAYLOAD_3];

      await asset.connect(signer_A).setMetadata(KEY_A, value);

      const stored = await asset.getMetadata(KEY_A);
      expect(stored).to.deep.equal(value);
    });

    it("GIVEN an existing metadata entry WHEN setMetadata is called again THEN the previous value is fully overwritten", async () => {
      await asset.connect(signer_A).setMetadata(KEY_A, [PAYLOAD_1, PAYLOAD_2]);

      await asset.connect(signer_A).setMetadata(KEY_A, [PAYLOAD_3]);

      const stored = await asset.getMetadata(KEY_A);
      expect(stored).to.deep.equal([PAYLOAD_3]);
    });

    it("GIVEN an existing metadata entry WHEN setMetadata is called with an empty array THEN the entry is cleared", async () => {
      await asset.connect(signer_A).setMetadata(KEY_A, [PAYLOAD_1, PAYLOAD_2]);

      await asset.connect(signer_A).setMetadata(KEY_A, []);

      const stored = await asset.getMetadata(KEY_A);
      expect(stored).to.deep.equal([]);
    });

    it("GIVEN a key that has never been set WHEN getMetadata THEN it returns an empty array", async () => {
      const stored = await asset.getMetadata(UNSET_KEY);
      expect(stored).to.deep.equal([]);
    });
  });

  describe("Deactivated", () => {
    it("GIVEN a deactivated asset WHEN setMetadata THEN transaction fails with Deactivated", async () => {
      const base = await deployEquityTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.DEACTIVATE_ROLE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).setMetadata(ethers.ZeroHash, []),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });

  describe.skip("initializeMetadata", () => {
    beforeEach(async () => {
      const base = await deployEquityTokenFixture();
      signer_A = base.deployer;
      signer_C = base.user2;
      asset = await ethers.getContractAt("IAsset", base.diamond.target, signer_A);
    });

    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeMetadata is called THEN it reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeMetadata()).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    describe("when already initialised", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).initializeMetadata();
      });

      it("GIVEN an already-initialised facet WHEN initializeMetadata is called again THEN it reverts with FacetAlreadyRegistered", async () => {
        await expect(asset.connect(signer_A).initializeMetadata()).to.be.revertedWithCustomError(
          asset,
          "FacetAlreadyRegistered",
        );
      });
    });

    it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeMetadata is called THEN it emits MetadataInitialized", async () => {
      await expect(asset.connect(signer_A).initializeMetadata()).to.emit(asset, "MetadataInitialized");
    });
  });
});
