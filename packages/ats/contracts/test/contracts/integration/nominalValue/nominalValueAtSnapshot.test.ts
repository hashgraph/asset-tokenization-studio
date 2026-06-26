// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, RESOLVER_KEYS } from "@scripts";
import type { AssetMockCtx } from "@test";

export function nominalValueAtSnapshotTests(getCtx: () => AssetMockCtx): void {
  describe("NominalValueAtSnapshot Tests", () => {
    let asset: IAssetMock;
    let unknownSigner: HardhatEthersSigner;

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      const signers = await ethers.getSigners();
      unknownSigner = signers[signers.length - 1];
    });

    describe("initializeNominalValueAtSnapshot", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeNominalValueAtSnapshot THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeNominalValueAtSnapshot())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(await unknownSigner.getAddress(), ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeNominalValueAtSnapshot THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeNominalValueAtSnapshot())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.nominalValueAtSnapshot, 1);
      });
    });

    describe("initializeNominalValueAtSnapshot event", () => {
      it("GIVEN fresh facet WHEN initializeNominalValueAtSnapshot THEN emits NominalValueAtSnapshotInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.nominalValueAtSnapshot);
        await expect(asset.initializeNominalValueAtSnapshot()).to.emit(asset, "NominalValueAtSnapshotInitialized");
      });
    });
  });
}
