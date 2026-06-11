// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset, MockDiamondCut } from "@contract-types";
import { deployAssetMockCtx } from "@test";
import { ATS_ROLES, RESOLVER_KEY_NONCES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

export function noncesTests(): void {
  describe("Nonces Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    let asset: IAsset;
    let mockDiamondCut: MockDiamondCut;

    beforeEach(async () => {
      const ctx = await loadFixture(deployAssetMockCtx);
      signer_A = ctx.deployer;
      signer_C = ctx.user2;

      asset = ctx.asset;
      mockDiamondCut = ctx.mockDiamondCut;
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
          .withArgs(RESOLVER_KEY_NONCES, 1);
      });
    });

    describe("initializeNonces event", () => {
      it("GIVEN a fresh deployment WHEN initializeNonces is called THEN emits NoncesInitialized", async () => {
        await mockDiamondCut.forceFacetNotRegistered(RESOLVER_KEY_NONCES);
        await expect(asset.initializeNonces()).to.emit(asset, "NoncesInitialized");
      });
    });
  });
}
