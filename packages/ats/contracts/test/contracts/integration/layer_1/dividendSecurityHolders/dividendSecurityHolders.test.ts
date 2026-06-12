// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { IAssetMock } from "@contract-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ATS_ROLES, RESOLVER_KEY_DIVIDEND_SECURITY_HOLDERS } from "@scripts";
import { deployAssetMockCtx } from "@test";

export function dividendSecurityHoldersTests(): void {
  describe("DividendSecurityHolders Tests", () => {
    let signer_C: HardhatEthersSigner;

    let asset: IAssetMock;

    async function deployFixture() {
      const ctx = await loadFixture(deployAssetMockCtx);
      signer_C = ctx.user2;

      asset = ctx.asset;
    }

    beforeEach(async () => {
      await loadFixture(deployFixture);
    });

    describe("initializeDividendSecurityHolders", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeDividendSecurityHolders is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeDividendSecurityHolders())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeDividendSecurityHolders is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeDividendSecurityHolders())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_DIVIDEND_SECURITY_HOLDERS, 1);
      });
    });

    describe("initializeDividendSecurityHolders event", () => {
      it("GIVEN a fresh deployment WHEN initializeDividendSecurityHolders is called THEN emits DividendSecurityHoldersInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_DIVIDEND_SECURITY_HOLDERS);
        await expect(asset.initializeDividendSecurityHolders()).to.emit(asset, "DividendSecurityHoldersInitialized");
      });
    });
  });
}
