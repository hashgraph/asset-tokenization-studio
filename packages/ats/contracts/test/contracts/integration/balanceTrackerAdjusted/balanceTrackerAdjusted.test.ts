// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, dateToUnixTimestamp, RESOLVER_KEY_BALANCE_TRACKER_ADJUSTED } from "@scripts";
import { DEFAULT_PARTITION, executeRbac, grantKycToHolders } from "@test";
import type { AssetMockCtx } from "@test";

export function balanceTrackerAdjustedTests(getCtx: () => AssetMockCtx): void {
  export function balanceTrackerAdjustedTests(): void {
  describe("BalanceTrackerAdjusted Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;

    let asset: IAssetMock;

    afterEach(async () => {
      await asset.resetSystemTimestamp();
    });

    describe("balanceOfAt", () => {
      beforeEach(async () => {
        const ctx = getCtx();
        asset = ctx.asset;
        await asset.setMultiPartition(true);

        signer_A = ctx.deployer;
        signer_B = ctx.user1;
        signer_C = ctx.user2;

      await executeRbac(asset, [
        {
          role: ATS_ROLES.ROLE_ISSUER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_KYC,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_CORPORATE_ACTION,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_SSI_MANAGER,
          members: [signer_A.address],
        },
      ]);

        await asset.connect(signer_A).addIssuer(signer_B.address);
        await grantKycToHolders(asset, signer_B, [signer_A, signer_B]);
      });

      it("GIVEN a token holder with minted tokens WHEN balanceOfAt at current time THEN returns minted amount", async () => {
        const mintAmount = 1000;
        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: mintAmount,
          data: "0x",
        });

        const currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;
        expect(await asset.balanceOfAt(signer_A.address, currentTimestamp)).to.equal(mintAmount);
      });

      it("GIVEN an address with no tokens WHEN balanceOfAt THEN returns zero", async () => {
        const currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;
        expect(await asset.balanceOfAt(signer_C.address, currentTimestamp)).to.equal(0);
      });

      it("GIVEN a token holder with minted tokens WHEN balanceOfAt at timestamp 0 THEN returns minted amount unchanged", async () => {
        const mintAmount = 500;
        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: mintAmount,
          data: "0x",
        });

        // timestamp 0 has no pending adjustments — balance is unchanged
        expect(await asset.balanceOfAt(signer_A.address, 0)).to.equal(mintAmount);
      });

      it("GIVEN a scheduled balance adjustment WHEN balanceOfAt before the adjustment THEN returns original balance", async () => {
        const mintAmount = 100;
        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: mintAmount,
          data: "0x",
        });

        const adjustmentDate = dateToUnixTimestamp("2030-06-01T00:00:00Z");
        await asset.connect(signer_A).setScheduledBalanceAdjustment({
          executionDate: adjustmentDate.toString(),
          factor: 2,
          decimals: 0,
        });

        // one second before the adjustment the balance should be unchanged
        expect(await asset.balanceOfAt(signer_A.address, adjustmentDate - 1)).to.equal(mintAmount);
      });

      it("GIVEN a scheduled balance adjustment WHEN balanceOfAt after the adjustment THEN returns adjusted balance", async () => {
        const mintAmount = 100;
        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: mintAmount,
          data: "0x",
        });

        const adjustmentFactor = 2;
        const adjustmentDate = dateToUnixTimestamp("2030-06-01T00:00:00Z");
        await asset.connect(signer_A).setScheduledBalanceAdjustment({
          executionDate: adjustmentDate.toString(),
          factor: adjustmentFactor,
          decimals: 0,
        });

        // one second after the adjustment the projected balance should be multiplied by the factor
        expect(await asset.balanceOfAt(signer_A.address, adjustmentDate + 1)).to.equal(mintAmount * adjustmentFactor);
      });

      it("GIVEN multiple scheduled adjustments WHEN balanceOfAt between them THEN applies only the earlier adjustment", async () => {
        const mintAmount = 100;
        await asset.connect(signer_B).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: mintAmount,
          data: "0x",
        });

        const firstAdjustmentDate = dateToUnixTimestamp("2030-06-01T00:00:00Z");
        const secondAdjustmentDate = dateToUnixTimestamp("2031-06-01T00:00:00Z");

        await asset.connect(signer_A).setScheduledBalanceAdjustment({
          executionDate: firstAdjustmentDate.toString(),
          factor: 2,
          decimals: 0,
        });
        await asset.connect(signer_A).setScheduledBalanceAdjustment({
          executionDate: secondAdjustmentDate.toString(),
          factor: 3,
          decimals: 0,
        });

        // between the two adjustments: only the first factor (×2) is applied
        expect(await asset.balanceOfAt(signer_A.address, firstAdjustmentDate + 1)).to.equal(mintAmount * 2);

        // after both adjustments: both factors (×2×3 = ×6) are applied
        expect(await asset.balanceOfAt(signer_A.address, secondAdjustmentDate + 1)).to.equal(mintAmount * 2 * 3);
      });
    });
    describe("initializeBalanceTrackerAdjusted", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeBalanceTrackerAdjusted is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeBalanceTrackerAdjusted())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeBalanceTrackerAdjusted is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeBalanceTrackerAdjusted())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_BALANCE_TRACKER_ADJUSTED, 1);
      });
    });

    describe("initializeBalanceTrackerAdjusted event", () => {
      it("GIVEN a fresh deployment WHEN initializeBalanceTrackerAdjusted is called THEN emits BalanceTrackerAdjustedInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_BALANCE_TRACKER_ADJUSTED);
        await expect(asset.initializeBalanceTrackerAdjusted()).to.emit(asset, "BalanceTrackerAdjustedInitialized");
      });
    });
  });
}
