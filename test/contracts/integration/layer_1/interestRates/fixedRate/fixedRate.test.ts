// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, RESOLVER_KEYS } from "@lib";
import { TEST_BOND_FIXED_RATE, executeRbac } from "@test";
import type { AssetMockCtx } from "@test";

export function fixedRateTests(getCtx: () => AssetMockCtx): void {
  describe("Fixed Rate Tests", () => {
    const FIXED_INTEREST_RATE_TYPE = 1;

    let asset: IAssetMock;
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      signer_A = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_INTEREST_RATE_MANAGER, members: [signer_A.address] },
      ]);

      await asset.connect(signer_A).setCouponRateType(FIXED_INTEREST_RATE_TYPE);
      await asset.connect(signer_A).setRate(TEST_BOND_FIXED_RATE.RATE, TEST_BOND_FIXED_RATE.RATE_DECIMALS);
    });

    describe("initializeFixedRate", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeFixedRate is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeFixedRate({ rate: 1, rateDecimals: 0 }))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeFixedRate is called again THEN FacetAlreadyRegistered", async () => {
        await expect(
          asset.connect(signer_A).initializeFixedRate({ rate: 1, rateDecimals: 0 }),
        ).to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered");
      });
    });

    describe("initializeFixedRate event", () => {
      it("GIVEN a fresh deployment WHEN initializeFixedRate is called THEN emits FixedRateInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.fixedRate);
        await expect(asset.initializeFixedRate({ rate: 1, rateDecimals: 0 })).to.emit(asset, "FixedRateInitialized");
      });
    });

    describe("Paused", () => {
      beforeEach(async () => {
        await asset.connect(signer_B).pause();
      });

      it("GIVEN a paused Token WHEN setFixedRate THEN transaction fails with IsPaused", async () => {
        await expect(asset.connect(signer_A).setRate(1, 2)).to.be.revertedWithCustomError(asset, "IsPaused");
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without interest rate manager role WHEN setFixedRate THEN transaction fails with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).setRate(1, 2)).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });
    });

    describe("New Interest Rate OK", () => {
      it("GIVEN a token WHEN setFixedRate THEN transaction succeeds", async () => {
        const newRate = 355;
        const newRateDecimals = 3;

        const oldRateValues = await asset.connect(signer_A).getRate();

        await expect(asset.connect(signer_A).setRate(newRate, newRateDecimals))
          .to.emit(asset, "RateUpdated")
          .withArgs(signer_A.address, newRate, newRateDecimals);

        const newRateValues = await asset.connect(signer_A).getRate();

        expect(oldRateValues.rate_).to.equal(TEST_BOND_FIXED_RATE.RATE);
        expect(oldRateValues.decimals_).to.equal(TEST_BOND_FIXED_RATE.RATE_DECIMALS);
        expect(newRateValues.rate_).to.equal(newRate);
        expect(newRateValues.decimals_).to.equal(newRateDecimals);
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN setRate THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).setRate(0, 0)).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN setCouponRateType THEN reverts with AssetNotOperational", async () => {
        await expect(asset.setCouponRateType(FIXED_INTEREST_RATE_TYPE)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });

      it("GIVEN non-operational asset WHEN setRate THEN reverts with AssetNotOperational", async () => {
        await expect(asset.setRate(0, 0)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
