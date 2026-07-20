// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ATS_ROLES, RESOLVER_KEYS } from "@lib";

export function noncesTests(getCtx: () => AssetMockCtx): void {
  describe("Nonces Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_C = ctx.user2;
      asset = ctx.asset;
    });

    describe("Nonces", () => {
      it("GIVEN any account WHEN nonces is called THEN the current nonce for that account is returned", async () => {
        const nonces = await asset.nonces(signer_A.address);
        expect(nonces).to.equal(0);
      });
    });

    describe("initializeNonces", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeNonces is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeNonces())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeNonces is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeNonces())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.nonces, 1);
      });
    });

    describe("initializeNonces event", () => {
      it("GIVEN a fresh deployment WHEN initializeNonces is called THEN emits NoncesInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.nonces);
        await expect(asset.initializeNonces()).to.emit(asset, "NoncesInitialized");
      });
    });
  });
}
