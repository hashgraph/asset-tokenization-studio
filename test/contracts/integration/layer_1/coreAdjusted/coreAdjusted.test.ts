// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ATS_ROLES, RESOLVER_KEYS } from "@lib";
import { executeRbac } from "@test";

const decimals = 6;
const decimalAdjustment = 2;
const adjustmentTimestamp = 100_000;

export function coreAdjustedTests(getCtx: () => AssetMockCtx): void {
  describe("CoreAdjusted Facet Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;

    let asset: IAssetMock;

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      asset = ctx.asset;

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_CORPORATE_ACTION, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_ADJUSTMENT_BALANCE, members: [signer_A.address] },
      ]);
      await asset.forceDecimals(decimals);
    });

    describe("decimalsAt", () => {
      it("GIVEN an initialized token WHEN decimalsAt is called with current timestamp THEN returns current decimals", async () => {
        const currentTimestamp = await asset.blockTimestamp();

        expect(await asset.decimalsAt(currentTimestamp)).to.equal(decimals);
      });

      it("GIVEN a token with a pending scheduled balance adjustment WHEN decimalsAt is called with a timestamp after the adjustment THEN returns adjusted decimals", async () => {
        await asset.setScheduledBalanceAdjustment({
          executionDate: adjustmentTimestamp,
          factor: 100,
          decimals: decimalAdjustment,
        });

        expect(await asset.decimalsAt(adjustmentTimestamp + 1)).to.equal(decimals + decimalAdjustment);
      });

      it("GIVEN a token with a pending scheduled balance adjustment WHEN decimalsAt is called with a timestamp before the adjustment THEN returns original decimals", async () => {
        await asset.setScheduledBalanceAdjustment({
          executionDate: adjustmentTimestamp,
          factor: 100,
          decimals: decimalAdjustment,
        });

        expect(await asset.decimalsAt(adjustmentTimestamp - 1)).to.equal(decimals);
      });
    });

    describe("initializeCoreAdjusted", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeCoreAdjusted is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_B).initializeCoreAdjusted())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_B.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeCoreAdjusted is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeCoreAdjusted())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.coreAdjusted, 1);
      });
    });

    describe("initializeCoreAdjusted event", () => {
      it("GIVEN a fresh deployment WHEN initializeCoreAdjusted is called THEN emits CoreAdjustedInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.coreAdjusted);
        await expect(asset.initializeCoreAdjusted()).to.emit(asset, "CoreAdjustedInitialized");
      });
    });
  });
}
