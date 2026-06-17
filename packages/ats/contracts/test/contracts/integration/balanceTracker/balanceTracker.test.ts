// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ATS_ROLES, ADDRESS_ZERO, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO, RESOLVER_KEY_BALANCE_TRACKER } from "@scripts";
import { executeRbac, MAX_UINT256 } from "@test";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _SECOND_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000002";
const EMPTY_VC_ID = EMPTY_STRING;

interface ClearingOperation {
  partition: string;
  expirationTimestamp: number;
  data: string;
}

interface Hold {
  amount: bigint | number;
  expirationTimestamp: bigint | number;
  escrow: string;
  to: string;
  data: string;
}

export function balanceTrackerTests(getCtx: () => AssetMockCtx): void {
  describe("Balance Tracker Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;

    const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
    let currentTimestamp = 0;
    let expirationTimestamp = 0;

    async function setFacets() {
      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    }

    function commonRbacs() {
      return [
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_LOCKER, members: [signer_C.address] },
        { role: ATS_ROLES.ROLE_FREEZE_MANAGER, members: [signer_D.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_CLEARING, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_CLEARING_VALIDATOR, members: [signer_A.address] },
      ];
    }

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      signer_D = ctx.user3;
      unknownSigner = ctx.unknownSigner;
      asset = ctx.asset;

      currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;
      expirationTimestamp = currentTimestamp + ONE_YEAR_IN_SECONDS;

      await executeRbac(asset, commonRbacs());
      await setFacets();
    });

    describe("balanceOf", () => {
      describe("Single partition", () => {
        it("GIVEN a token holder with minted tokens WHEN balanceOf THEN returns correct balance", async () => {
          const mintAmount = 1000;
          await asset.connect(signer_B).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: mintAmount,
            data: EMPTY_HEX_BYTES,
          });

          expect(await asset.balanceOf(signer_A.address)).to.equal(mintAmount);
        });

        it("GIVEN an account with no tokens WHEN balanceOf THEN returns zero", async () => {
          expect(await asset.balanceOf(signer_C.address)).to.equal(0);
        });

        it("GIVEN a token holder after a transfer WHEN balanceOf THEN returns updated balance", async () => {
          const mintAmount = 1000;
          const transferAmount = 300;

          await asset.connect(signer_B).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: mintAmount,
            data: EMPTY_HEX_BYTES,
          });

          await asset.connect(signer_A).transfer(signer_B.address, transferAmount);

          expect(await asset.balanceOf(signer_A.address)).to.equal(mintAmount - transferAmount);
          expect(await asset.balanceOf(signer_B.address)).to.equal(transferAmount);
        });
      });

      describe("Multi-partition", () => {
        beforeEach(async () => {
          await asset.setMultiPartition(true);
        });

        it("GIVEN a token holder with tokens in multiple partitions WHEN balanceOf THEN returns total across all partitions", async () => {
          const defaultMintAmount = 600;
          const secondMintAmount = 400;

          await asset.connect(signer_B).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: defaultMintAmount,
            data: EMPTY_HEX_BYTES,
          });
          await asset.connect(signer_B).issueByPartition({
            partition: _SECOND_PARTITION,
            tokenHolder: signer_A.address,
            value: secondMintAmount,
            data: EMPTY_HEX_BYTES,
          });

          expect(await asset.balanceOf(signer_A.address)).to.equal(defaultMintAmount + secondMintAmount);
        });
      });
    });

    describe("totalSupply", () => {
      describe("Single partition", () => {
        it("GIVEN no tokens minted WHEN totalSupply THEN returns zero", async () => {
          expect(await asset.totalSupply()).to.equal(0);
        });

        it("GIVEN tokens minted WHEN totalSupply THEN returns correct total", async () => {
          const mintAmount = 1000;
          await asset.connect(signer_B).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: mintAmount,
            data: EMPTY_HEX_BYTES,
          });

          expect(await asset.totalSupply()).to.equal(mintAmount);
        });

        it("GIVEN tokens minted and then burned WHEN totalSupply THEN reflects the redemption", async () => {
          const mintAmount = 1000;
          const burnAmount = 400;

          await asset.connect(signer_B).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: mintAmount,
            data: EMPTY_HEX_BYTES,
          });

          await asset.connect(signer_A).redeemByPartition(_DEFAULT_PARTITION, burnAmount, EMPTY_HEX_BYTES);

          expect(await asset.totalSupply()).to.equal(mintAmount - burnAmount);
        });
      });

      describe("Multi-partition", () => {
        beforeEach(async () => {
          await asset.setMultiPartition(true);
        });

        it("GIVEN tokens minted across multiple partitions WHEN totalSupply THEN returns combined total", async () => {
          const defaultMintAmount = 600;
          const secondMintAmount = 400;

          await asset.connect(signer_B).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: defaultMintAmount,
            data: EMPTY_HEX_BYTES,
          });
          await asset.connect(signer_B).issueByPartition({
            partition: _SECOND_PARTITION,
            tokenHolder: signer_A.address,
            value: secondMintAmount,
            data: EMPTY_HEX_BYTES,
          });

          expect(await asset.totalSupply()).to.equal(defaultMintAmount + secondMintAmount);
        });
      });
    });

    describe("getTotalBalanceFor", () => {
      describe("Multi-partition enabled", () => {
        beforeEach(async () => {
          await asset.setMultiPartition(true);
        });

        it("GIVEN multi-partition equity with locked, held, and cleared tokens WHEN getTotalBalanceFor and getTotalBalanceForByPartition THEN returns correct total balance", async () => {
          const tokenHolder = signer_A.address;

          const defaultMintAmount = 600;
          const defaultLockAmount = 100;
          const defaultHoldAmount = 150;
          const defaultClearAmount = 50;

          const secondMintAmount = 400;
          const secondLockAmount = 80;
          const secondHoldAmount = 70;
          const secondClearAmount = 30;

          await asset.connect(signer_B).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder,
            value: defaultMintAmount,
            data: EMPTY_HEX_BYTES,
          });

          await asset.connect(signer_B).issueByPartition({
            partition: _SECOND_PARTITION,
            tokenHolder,
            value: secondMintAmount,
            data: EMPTY_HEX_BYTES,
          });

          await asset
            .connect(signer_C)
            .lockByPartition(_DEFAULT_PARTITION, defaultLockAmount, tokenHolder, expirationTimestamp);

          await asset
            .connect(signer_C)
            .lockByPartition(_SECOND_PARTITION, secondLockAmount, tokenHolder, expirationTimestamp);

          const holdDefault: Hold = {
            amount: BigInt(defaultHoldAmount),
            expirationTimestamp: BigInt(expirationTimestamp),
            escrow: signer_B.address,
            to: ADDRESS_ZERO,
            data: EMPTY_HEX_BYTES,
          };
          await asset.connect(signer_A).createHoldByPartition(_DEFAULT_PARTITION, holdDefault);

          const holdSecond: Hold = {
            amount: BigInt(secondHoldAmount),
            expirationTimestamp: BigInt(expirationTimestamp),
            escrow: signer_B.address,
            to: ADDRESS_ZERO,
            data: EMPTY_HEX_BYTES,
          };
          await asset.connect(signer_A).createHoldByPartition(_SECOND_PARTITION, holdSecond);

          await asset.connect(signer_A).activateClearing();

          const clearingOperationDefault: ClearingOperation = {
            partition: _DEFAULT_PARTITION,
            expirationTimestamp,
            data: EMPTY_HEX_BYTES,
          };
          await asset
            .connect(signer_A)
            .clearingTransferByPartition(clearingOperationDefault, defaultClearAmount, signer_B.address);

          const clearingOperationSecond: ClearingOperation = {
            partition: _SECOND_PARTITION,
            expirationTimestamp,
            data: EMPTY_HEX_BYTES,
          };
          await asset
            .connect(signer_A)
            .clearingTransferByPartition(clearingOperationSecond, secondClearAmount, signer_B.address);

          const totalBalance = await asset.getTotalBalanceFor(tokenHolder);
          expect(totalBalance).to.equal(defaultMintAmount + secondMintAmount);
        });
      });

      describe("Single partition (no multi-partition)", () => {
        it("GIVEN single partition equity with locked, held, cleared, and frozen tokens WHEN getTotalBalanceFor THEN returns correct total balance", async () => {
          const tokenHolder = signer_A.address;
          const totalMintAmount = 1000;

          const lockAmount = 100;
          const holdAmount = 150;
          const clearAmount = 50;
          const freezeAmount = 200;

          await asset.connect(signer_B).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder,
            value: totalMintAmount,
            data: EMPTY_HEX_BYTES,
          });

          await asset
            .connect(signer_C)
            .lockByPartition(_DEFAULT_PARTITION, lockAmount, tokenHolder, expirationTimestamp);

          const hold: Hold = {
            amount: BigInt(holdAmount),
            expirationTimestamp: BigInt(expirationTimestamp),
            escrow: signer_B.address,
            to: ADDRESS_ZERO,
            data: EMPTY_HEX_BYTES,
          };
          await asset.connect(signer_A).createHoldByPartition(_DEFAULT_PARTITION, hold);

          await asset.connect(signer_A).activateClearing();

          const clearingOperation: ClearingOperation = {
            partition: _DEFAULT_PARTITION,
            expirationTimestamp,
            data: EMPTY_HEX_BYTES,
          };
          await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, clearAmount, signer_B.address);

          await asset.connect(signer_D).freezePartialTokens(tokenHolder, freezeAmount);

          const totalBalance = await asset.getTotalBalanceFor(tokenHolder);
          expect(totalBalance).to.equal(totalMintAmount);
        });
      });
    });

    describe("initializeBalanceTracker", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeBalanceTracker is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeBalanceTracker())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeBalanceTracker is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeBalanceTracker())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_BALANCE_TRACKER, 1);
      });
    });

    describe("initializeBalanceTracker event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeBalanceTracker is called THEN emits BalanceTrackerInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_BALANCE_TRACKER);
        await expect(asset.initializeBalanceTracker()).to.emit(asset, "BalanceTrackerInitialized");
      });
    });
  });
}
