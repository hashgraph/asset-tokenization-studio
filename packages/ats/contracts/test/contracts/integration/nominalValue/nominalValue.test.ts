// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { RESOLVER_KEYS } from "@scripts";

export function nominalValueTests(getCtx: () => AssetMockCtx): void {
  describe("NominalValue Init Tests", () => {
    let unknownSigner: HardhatEthersSigner;
    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      unknownSigner = ctx.unknownSigner;
      asset = ctx.asset;
    });

    it("GIVEN an already-initialised facet WHEN initializeNominalValue is called again THEN it reverts with FacetAlreadyRegistered", async () => {
      await expect(asset.initializeNominalValue(100, 2, "0x455552")).to.be.revertedWithCustomError(
        asset,
        "FacetAlreadyRegistered",
      );
    });

    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeNominalValue is called THEN it reverts with AccountHasNoRole", async () => {
      await expect(
        asset.connect(unknownSigner).initializeNominalValue(100, 2, "0x455552"),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN a new deployment WHEN initializeNominalValue is called THEN it emits NominalValueInitialized", async () => {
      await asset.forceFacetNotRegistered(RESOLVER_KEYS.nominalValue);
      await expect(asset.initializeNominalValue(100, 2, "0x455552"))
        .to.emit(asset, "NominalValueInitialized")
        .withArgs(100, 2, "0x455552");
    });
  });
}
