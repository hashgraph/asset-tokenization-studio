// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, RESOLVER_KEY_CUSTOM_DATA } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployAssetMockCtx, executeRbac } from "@test";

const KEY_A = ethers.id("customData.test.key.A");
const UNSET_KEY = ethers.id("customData.test.key.unset");

const PAYLOAD_1 = ethers.hexlify(ethers.toUtf8Bytes("payload-one"));
const PAYLOAD_2 = ethers.hexlify(ethers.toUtf8Bytes("payload-two-longer-content"));
const PAYLOAD_3 = ethers.hexlify(ethers.toUtf8Bytes("payload-three"));

export function customDataTests(): void {
  describe("CustomData Tests", () => {
    let asset: IAssetMock;

    let signer_A: HardhatEthersSigner; // admin / custom data manager
    let signer_B: HardhatEthersSigner; // pauser
    let signer_C: HardhatEthersSigner; // unprivileged caller

    async function deployCustomDataFixture() {
      const ctx = await loadFixture(deployAssetMockCtx);
      signer_A = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;

      asset = ctx.asset;

      await executeRbac(asset, [
        {
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_CUSTOM_DATA_MANAGER,
          members: [signer_A.address],
        },
      ]);
    }

    beforeEach(async () => {
      await loadFixture(deployCustomDataFixture);
    });

    describe("AccessControl", () => {
      it("GIVEN an account without custom data manager role WHEN setCustomData THEN transaction fails with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).setCustomData(KEY_A, [PAYLOAD_1])).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });
    });

    describe("Paused", () => {
      beforeEach(async () => {
        await asset.connect(signer_B).pause();
      });

      it("GIVEN a paused Token WHEN setCustomData THEN transaction fails with IsPaused", async () => {
        await expect(asset.connect(signer_A).setCustomData(KEY_A, [PAYLOAD_1])).to.be.revertedWithCustomError(
          asset,
          "IsPaused",
        );
      });
    });

    describe("setCustomData & getCustomData", () => {
      it("GIVEN role and unpaused token WHEN setCustomData with a single payload THEN getCustomData returns it", async () => {
        await asset.connect(signer_A).setCustomData(KEY_A, [PAYLOAD_1]);

        const stored = await asset.getCustomData(KEY_A);
        expect(stored).to.deep.equal([PAYLOAD_1]);
      });

      it("GIVEN role and unpaused token WHEN setCustomData with multiple payloads THEN getCustomData preserves order", async () => {
        const value = [PAYLOAD_1, PAYLOAD_2, PAYLOAD_3];

        await asset.connect(signer_A).setCustomData(KEY_A, value);

        const stored = await asset.getCustomData(KEY_A);
        expect(stored).to.deep.equal(value);
      });

      it("GIVEN an existing custom data entry WHEN setCustomData is called again THEN the previous value is fully overwritten", async () => {
        await asset.connect(signer_A).setCustomData(KEY_A, [PAYLOAD_1, PAYLOAD_2]);

        await asset.connect(signer_A).setCustomData(KEY_A, [PAYLOAD_3]);

        const stored = await asset.getCustomData(KEY_A);
        expect(stored).to.deep.equal([PAYLOAD_3]);
      });

      it("GIVEN an existing custom data entry WHEN setCustomData is called with an empty array THEN the entry is cleared", async () => {
        await asset.connect(signer_A).setCustomData(KEY_A, [PAYLOAD_1, PAYLOAD_2]);

        await asset.connect(signer_A).setCustomData(KEY_A, []);

        const stored = await asset.getCustomData(KEY_A);
        expect(stored).to.deep.equal([]);
      });

      it("GIVEN a key that has never been set WHEN getCustomData THEN it returns an empty array", async () => {
        const stored = await asset.getCustomData(UNSET_KEY);
        expect(stored).to.deep.equal([]);
      });
    });

    describe("Deactivated", () => {
      it("GIVEN a deactivated asset WHEN setCustomData THEN transaction fails with Deactivated", async () => {
        const ctx = await loadFixture(deployAssetMockCtx);
        const deactivatedAsset = ctx.asset;
        await deactivatedAsset.forceDeactivate();
        await expect(
          deactivatedAsset.connect(ctx.deployer).setCustomData(ethers.ZeroHash, []),
        ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
      });
    });

    describe("initializeCustomData", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeCustomData is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeCustomData())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeCustomData is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeCustomData())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_CUSTOM_DATA, 1);
      });
    });

    describe("initializeCustomData event", () => {
      it("GIVEN a fresh deployment WHEN initializeCustomData is called THEN emits CustomDataInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_CUSTOM_DATA);
        await expect(asset.initializeCustomData()).to.emit(asset, "CustomDataInitialized");
      });
    });
    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN setCustomData THEN reverts with AssetNotOperational", async () => {
        await expect(asset.setCustomData(ethers.ZeroHash, [])).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });
    });
  });
}
