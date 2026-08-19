// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import {
  ADDRESS_ZERO,
  DEFAULT_PARTITION,
  EMPTY_STRING,
  ATS_ROLES,
  ZERO,
  dateToUnixTimestamp,
  RESOLVER_KEYS,
} from "@scripts";
import { Rbac } from "@scripts/domain";

const _NON_DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000011";
const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
const _AMOUNT = 1000;
const maxSupply_Original = 1000000 * _AMOUNT;
const maxSupply_Partition_1_Original = 50000 * _AMOUNT;

const ONE_SECOND = 1;
const EMPTY_VC_ID = EMPTY_STRING;
const balanceOf_A_Original = [10 * _AMOUNT, 100 * _AMOUNT];
const balanceOf_B_Original = [20 * _AMOUNT, 200 * _AMOUNT];
const adjustFactor = 253;
const adjustDecimals = 2;

export function lockByPartitionTests(getCtx: () => AssetMockCtx): void {
  describe("LockByPartition Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

    let asset: IAssetMock;

    const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
    let currentTimestamp = 0;
    let expirationTimestamp = 0;

    function set_initRbacs(): Rbac[] {
      return [
        { role: ATS_ROLES.ROLE_ISSUER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_LOCKER, members: [signer_C.address] },
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_D.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_CORPORATE_ACTION, members: [signer_B.address] },
      ];
    }

    async function setFacets() {
      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
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

      await executeRbac(asset, set_initRbacs());
      await setFacets();
    });

    describe("Multi-partition enabled", () => {
      beforeEach(async () => {
        await asset.setMultiPartition(true);
      });

      describe("Paused", () => {
        beforeEach(async () => {
          await asset.connect(signer_D).pause();
        });

        it("GIVEN a paused Token WHEN lockByPartition THEN transaction fails with IsPaused", async () => {
          await expect(
            asset
              .connect(signer_C)
              .lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, currentTimestamp),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });

        it("GIVEN a paused Token WHEN releaseByPartition THEN transaction fails with IsPaused", async () => {
          await expect(
            asset.connect(signer_C).releaseByPartition(_NON_DEFAULT_PARTITION, 1, signer_A.address),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });
      });

      describe("AccessControl", () => {
        it("GIVEN an account without LOCKER role WHEN lockByPartition THEN transaction fails with AccountHasNoRole", async () => {
          await expect(
            asset
              .connect(signer_D)
              .lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, currentTimestamp),
          ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
        });
      });

      describe("lockByPartition", () => {
        it("GIVEN a expiration timestamp in past WHEN lockByPartition THEN transaction fails with WrongExpirationTimestamp", async () => {
          await expect(
            asset
              .connect(signer_C)
              .lockByPartition(
                _NON_DEFAULT_PARTITION,
                _AMOUNT,
                signer_A.address,
                currentTimestamp - ONE_YEAR_IN_SECONDS,
              ),
          ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
        });

        it("GIVEN a non valid partition WHEN lockByPartition THEN transaction fails with InvalidPartition", async () => {
          await expect(
            asset
              .connect(signer_C)
              .lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expirationTimestamp),
          )
            .to.be.revertedWithCustomError(asset, "InvalidPartition")
            .withArgs(signer_A.address, _NON_DEFAULT_PARTITION);
        });

        it("GIVEN a valid partition WHEN lockByPartition with insufficient balance THEN transaction fails with InsufficientBalance", async () => {
          await asset.connect(signer_B).issueByPartition({
            partition: _NON_DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: _AMOUNT - 1,
            data: "0x",
          });

          await expect(
            asset
              .connect(signer_C)
              .lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expirationTimestamp),
          )
            .to.be.revertedWithCustomError(asset, "InsufficientBalance")
            .withArgs(signer_A.address, _AMOUNT - 1, _AMOUNT, _NON_DEFAULT_PARTITION);
        });

        it("GIVEN a valid partition WHEN lockByPartition with enough balance THEN transaction success", async () => {
          await asset.connect(signer_B).issueByPartition({
            partition: _NON_DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: _AMOUNT * 2,
            data: "0x",
          });

          await expect(
            asset
              .connect(signer_C)
              .lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expirationTimestamp),
          )
            .to.emit(asset, "LockedByPartition")
            .withArgs(signer_C.address, signer_A.address, _NON_DEFAULT_PARTITION, 1, _AMOUNT, expirationTimestamp)
            .to.emit(asset, "Transfer")
            .withArgs(signer_A.address, ethers.ZeroAddress, _AMOUNT);

          expect(await asset.getLockedAmountForByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
          expect(await asset.getLockCountForByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(1);
          expect(await asset.getLocksIdForByPartition(_NON_DEFAULT_PARTITION, signer_A.address, 0, 1)).to.deep.equal([
            1n,
          ]);
          expect(await asset.getLockForByPartition(_NON_DEFAULT_PARTITION, signer_A.address, 1)).to.deep.equal([
            _AMOUNT,
            expirationTimestamp,
          ]);

          expect(await asset.getLockedAmountFor(signer_A.address)).to.equal(0);
          expect(await asset.getLockCountFor(signer_A.address)).to.equal(0);
          expect(await asset.getLocksIdFor(signer_A.address, 0, 1)).to.deep.equal([]);
          expect(await asset.getLockFor(signer_A.address, 1)).to.deep.equal([0, 0]);

          expect(await asset.balanceOfByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
          expect(await asset.totalSupplyByPartition(_NON_DEFAULT_PARTITION)).to.equal(_AMOUNT * 2);
        });
      });

      describe("Release by partition", () => {
        it("GIVEN a non valid lockId WHEN releaseByPartition THEN transaction fails with InvalidLockId", async () => {
          await expect(
            asset.connect(signer_C).releaseByPartition(_NON_DEFAULT_PARTITION, 10, signer_A.address),
          ).to.be.revertedWithCustomError(asset, "WrongLockId");
        });

        it("GIVEN a valid lockId but timestamp is not reached WHEN releaseByPartition THEN transaction fails with LockExpirationNotReached", async () => {
          await asset.connect(signer_B).issueByPartition({
            partition: _NON_DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: _AMOUNT,
            data: "0x",
          });
          await asset
            .connect(signer_C)
            .lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expirationTimestamp);

          await expect(
            asset.connect(signer_C).releaseByPartition(_NON_DEFAULT_PARTITION, 1, signer_A.address),
          ).to.be.revertedWithCustomError(asset, "LockExpirationNotReached");
        });

        it("GIVEN a valid lockId and timestamp is reached WHEN releaseByPartition THEN transaction success", async () => {
          await asset.connect(signer_B).issueByPartition({
            partition: _NON_DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: _AMOUNT,
            data: "0x",
          });
          await asset
            .connect(signer_C)
            .lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expirationTimestamp);

          await asset.changeSystemTimestamp(expirationTimestamp + 1);
          await expect(asset.connect(signer_C).releaseByPartition(_NON_DEFAULT_PARTITION, 1, signer_A.address))
            .to.emit(asset, "LockByPartitionReleased")
            .withArgs(signer_C.address, signer_A.address, _NON_DEFAULT_PARTITION, 1);

          expect(await asset.getLockedAmountForByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
          expect(await asset.getLockCountForByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
          expect(await asset.getLocksIdForByPartition(_NON_DEFAULT_PARTITION, signer_A.address, 0, 1)).to.deep.equal(
            [],
          );
          expect(await asset.getLockForByPartition(_NON_DEFAULT_PARTITION, signer_A.address, 1)).to.deep.equal([0, 0]);

          expect(await asset.getLockedAmountFor(signer_A.address)).to.equal(0);
          expect(await asset.getLockCountFor(signer_A.address)).to.equal(0);
          expect(await asset.getLocksIdFor(signer_A.address, 0, 1)).to.deep.equal([]);
          expect(await asset.getLockFor(signer_A.address, 1)).to.deep.equal([0, 0]);

          expect(await asset.balanceOfByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
          expect(await asset.totalSupplyByPartition(_NON_DEFAULT_PARTITION)).to.equal(_AMOUNT);
        });

        it("GIVEN a valid lockId WHEN releaseByPartition at exact expiration timestamp THEN transaction success", async () => {
          await asset.connect(signer_B).issueByPartition({
            partition: _NON_DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: _AMOUNT,
            data: "0x",
          });
          await asset
            .connect(signer_C)
            .lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expirationTimestamp);

          await asset.changeSystemTimestamp(expirationTimestamp);
          await expect(asset.connect(signer_C).releaseByPartition(_NON_DEFAULT_PARTITION, 1, signer_A.address))
            .to.emit(asset, "LockByPartitionReleased")
            .withArgs(signer_C.address, signer_A.address, _NON_DEFAULT_PARTITION, 1);
        });
      });

      describe("Adjust Balances", () => {
        async function setPreBalanceAdjustment() {
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ADJUSTMENT_BALANCE, signer_C.address);
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CAP, signer_A.address);
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROLLER, signer_A.address);
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_LOCKER, signer_A.address);

          await asset.connect(signer_A).setMaxSupply(maxSupply_Original);
          await asset.connect(signer_A).setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply_Partition_1_Original);

          await asset.connect(signer_A).issueByPartition({
            partition: _PARTITION_ID_1,
            tokenHolder: signer_A.address,
            value: balanceOf_A_Original[0],
            data: "0x",
          });
          await asset.connect(signer_A).issueByPartition({
            partition: _PARTITION_ID_2,
            tokenHolder: signer_A.address,
            value: balanceOf_A_Original[1],
            data: "0x",
          });
          await asset.connect(signer_A).issueByPartition({
            partition: _PARTITION_ID_1,
            tokenHolder: signer_B.address,
            value: balanceOf_B_Original[0],
            data: "0x",
          });
          await asset.connect(signer_A).issueByPartition({
            partition: _PARTITION_ID_2,
            tokenHolder: signer_B.address,
            value: balanceOf_B_Original[1],
            data: "0x",
          });
        }

        it("GIVEN a lock WHEN adjustBalances THEN lock amount gets updated succeeds", async () => {
          await setPreBalanceAdjustment();

          const balance_Before = await asset.balanceOf(signer_A.address);
          const balance_Before_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

          await asset
            .connect(signer_A)
            .lockByPartition(_PARTITION_ID_1, _AMOUNT, signer_A.address, dateToUnixTimestamp("2030-01-01T00:00:01Z"));

          const lock_TotalAmount_Before = await asset.getLockedAmountFor(signer_A.address);
          const lock_TotalAmount_Before_Partition_1 = await asset.getLockedAmountForByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );
          const lock_Before = await asset.getLockForByPartition(_PARTITION_ID_1, signer_A.address, 1);

          await asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

          const balanceAdjustmentData = {
            executionDate: dateToUnixTimestamp("2030-01-01T00:00:02Z").toString(),
            factor: adjustFactor,
            decimals: adjustDecimals,
          };

          const balanceAdjustmentData_2 = {
            executionDate: dateToUnixTimestamp("2030-01-01T00:16:40Z").toString(),
            factor: adjustFactor,
            decimals: adjustDecimals,
          };
          await asset.connect(signer_B).setScheduledBalanceAdjustment(balanceAdjustmentData);
          await asset.connect(signer_B).setScheduledBalanceAdjustment(balanceAdjustmentData_2);

          await asset.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:00:03Z"));

          const lock_TotalAmount_After = await asset.getLockedAmountFor(signer_A.address);
          const lock_TotalAmount_After_Partition_1 = await asset.getLockedAmountForByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );
          const lock_After = await asset.getLockForByPartition(_PARTITION_ID_1, signer_A.address, 1);
          const balance_After = await asset.balanceOf(signer_A.address);
          const balance_After_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

          expect(lock_TotalAmount_After).to.be.equal(lock_TotalAmount_Before * BigInt(adjustFactor * adjustFactor));
          expect(lock_TotalAmount_After_Partition_1).to.be.equal(
            lock_TotalAmount_Before_Partition_1 * BigInt(adjustFactor * adjustFactor),
          );
          expect(balance_After).to.be.equal((balance_Before - BigInt(_AMOUNT)) * BigInt(adjustFactor * adjustFactor));
          expect(lock_TotalAmount_After).to.be.equal(lock_TotalAmount_Before * BigInt(adjustFactor * adjustFactor));
          expect(balance_After_Partition_1).to.be.equal(
            (balance_Before_Partition_1 - BigInt(_AMOUNT)) * BigInt(adjustFactor * adjustFactor),
          );
          expect(lock_After.amount_).to.be.equal(lock_Before.amount_ * BigInt(adjustFactor * adjustFactor));
        });

        it("GIVEN a lock WHEN adjustBalances THEN release succeeds", async () => {
          await setPreBalanceAdjustment();
          const balance_Before = await asset.balanceOf(signer_A.address);
          const balance_Before_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

          const currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;

          await asset
            .connect(signer_A)
            .lockByPartition(_PARTITION_ID_1, _AMOUNT, signer_A.address, currentTimestamp + 2 * ONE_SECOND);
          await asset
            .connect(signer_A)
            .lockByPartition(_PARTITION_ID_1, _AMOUNT, signer_A.address, currentTimestamp + 100 * ONE_SECOND);

          const locked_Amount_Before = await asset.getLockedAmountFor(signer_A.address);
          const locked_Amount_Before_Partition_1 = await asset.getLockedAmountForByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );

          await asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

          await asset.changeSystemTimestamp((await ethers.provider.getBlock("latest"))!.timestamp + 2 * ONE_SECOND);
          await asset.connect(signer_A).releaseByPartition(_PARTITION_ID_1, 1, signer_A.address);

          const balance_After_Release = await asset.balanceOf(signer_A.address);
          const balance_After_Release_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
          const locked_Amount_After = await asset.getLockedAmountFor(signer_A.address);
          const locked_Amount_After_Partition_1 = await asset.getLockedAmountForByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );

          expect(balance_After_Release).to.be.equal((balance_Before - BigInt(_AMOUNT)) * BigInt(adjustFactor));
          expect(balance_After_Release_Partition_1).to.be.equal(
            (balance_Before_Partition_1 - BigInt(_AMOUNT)) * BigInt(adjustFactor),
          );
          expect(locked_Amount_After).to.be.equal((locked_Amount_Before - BigInt(_AMOUNT)) * BigInt(adjustFactor));
          expect(locked_Amount_After_Partition_1).to.be.equal(
            (locked_Amount_Before_Partition_1 - BigInt(_AMOUNT)) * BigInt(adjustFactor),
          );
          expect(balance_After_Release + locked_Amount_After).to.be.equal(balance_Before * BigInt(adjustFactor));
          expect(balance_After_Release_Partition_1 + locked_Amount_After_Partition_1).to.be.equal(
            balance_Before_Partition_1 * BigInt(adjustFactor),
          );
        });

        it("GIVEN a lock WHEN adjustBalances THEN lock succeeds", async () => {
          await setPreBalanceAdjustment();
          const balance_Before = await asset.balanceOf(signer_A.address);
          const balance_Before_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

          const currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;

          await asset
            .connect(signer_A)
            .lockByPartition(_PARTITION_ID_1, _AMOUNT, signer_A.address, currentTimestamp + 100 * ONE_SECOND);

          const locked_Amount_Before = await asset.getLockedAmountFor(signer_A.address);
          const locked_Amount_Before_Partition_1 = await asset.getLockedAmountForByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );

          await asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

          await asset
            .connect(signer_A)
            .lockByPartition(_PARTITION_ID_1, _AMOUNT, signer_A.address, currentTimestamp + 100 * ONE_SECOND);

          const balance_After_Lock = await asset.balanceOf(signer_A.address);
          const balance_After_Lock_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
          const locked_Amount_After = await asset.getLockedAmountFor(signer_A.address);
          const locked_Amount_After_Partition_1 = await asset.getLockedAmountForByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );

          expect(balance_After_Lock).to.be.equal(
            (balance_Before - BigInt(_AMOUNT)) * BigInt(adjustFactor) - BigInt(_AMOUNT),
          );
          expect(balance_After_Lock_Partition_1).to.be.equal(
            (balance_Before_Partition_1 - BigInt(_AMOUNT)) * BigInt(adjustFactor) - BigInt(_AMOUNT),
          );
          expect(locked_Amount_After).to.be.equal(locked_Amount_Before * BigInt(adjustFactor) + BigInt(_AMOUNT));
          expect(locked_Amount_After_Partition_1).to.be.equal(
            locked_Amount_Before_Partition_1 * BigInt(adjustFactor) + BigInt(_AMOUNT),
          );
          expect(balance_After_Lock + locked_Amount_After).to.be.equal(balance_Before * BigInt(adjustFactor));
          expect(balance_After_Lock_Partition_1 + locked_Amount_After_Partition_1).to.be.equal(
            balance_Before_Partition_1 * BigInt(adjustFactor),
          );
        });
      });
    });

    describe("updateLockExpirationByPartition (multi-partition)", () => {
      beforeEach(async () => {
        await asset.setMultiPartition(true);
      });

      async function issuedAndLocked(expiration: number | bigint): Promise<void> {
        await asset.connect(signer_B).issueByPartition({
          partition: _NON_DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: "0x",
        });
        await asset.connect(signer_C).lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expiration);
      }

      it("GIVEN a paused token WHEN updateLockExpirationByPartition THEN fails with IsPaused", async () => {
        await asset.connect(signer_D).pause();
        await expect(
          asset
            .connect(signer_C)
            .updateLockExpirationByPartition(_NON_DEFAULT_PARTITION, signer_A.address, 1, expirationTimestamp),
        ).to.be.revertedWithCustomError(asset, "IsPaused");
      });

      it("GIVEN an account without LOCKER role WHEN updateLockExpirationByPartition THEN fails with AccountHasNoRole", async () => {
        await expect(
          asset
            .connect(signer_D)
            .updateLockExpirationByPartition(_NON_DEFAULT_PARTITION, signer_A.address, 1, expirationTimestamp),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });

      it("GIVEN an invalid lockId WHEN updateLockExpirationByPartition THEN fails with WrongLockId", async () => {
        await expect(
          asset
            .connect(signer_C)
            .updateLockExpirationByPartition(_NON_DEFAULT_PARTITION, signer_A.address, 99, expirationTimestamp),
        ).to.be.revertedWithCustomError(asset, "WrongLockId");
      });

      it("GIVEN a new timestamp in the past WHEN updateLockExpirationByPartition THEN fails with WrongExpirationTimestamp", async () => {
        await issuedAndLocked(expirationTimestamp);
        await expect(
          asset
            .connect(signer_C)
            .updateLockExpirationByPartition(
              _NON_DEFAULT_PARTITION,
              signer_A.address,
              1,
              currentTimestamp - ONE_SECOND,
            ),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
      });

      it("GIVEN a lock with type(uint256).max expiration (FIND-059) WHEN updateLockExpirationByPartition THEN shortens expiration and lock becomes releasable", async () => {
        await issuedAndLocked(MAX_UINT256);

        const shortenedExpiration = expirationTimestamp;

        await expect(
          asset
            .connect(signer_C)
            .updateLockExpirationByPartition(_NON_DEFAULT_PARTITION, signer_A.address, 1, shortenedExpiration),
        )
          .to.emit(asset, "LockExpirationUpdated")
          .withArgs(signer_C.address, signer_A.address, _NON_DEFAULT_PARTITION, 1, MAX_UINT256, shortenedExpiration);

        const [, updatedExpiration] = await asset.getLockForByPartition(_NON_DEFAULT_PARTITION, signer_A.address, 1);
        expect(updatedExpiration).to.equal(shortenedExpiration);

        await asset.changeSystemTimestamp(shortenedExpiration + ONE_SECOND);
        await expect(asset.connect(signer_C).releaseByPartition(_NON_DEFAULT_PARTITION, 1, signer_A.address))
          .to.emit(asset, "LockByPartitionReleased")
          .withArgs(signer_C.address, signer_A.address, _NON_DEFAULT_PARTITION, 1);
      });

      it("GIVEN a lock WHEN updateLockExpirationByPartition extends expiration THEN getLockForByPartition reflects new timestamp", async () => {
        await issuedAndLocked(expirationTimestamp);

        const extendedExpiration = expirationTimestamp + ONE_YEAR_IN_SECONDS;

        await expect(
          asset
            .connect(signer_C)
            .updateLockExpirationByPartition(_NON_DEFAULT_PARTITION, signer_A.address, 1, extendedExpiration),
        )
          .to.emit(asset, "LockExpirationUpdated")
          .withArgs(
            signer_C.address,
            signer_A.address,
            _NON_DEFAULT_PARTITION,
            1,
            expirationTimestamp,
            extendedExpiration,
          );

        const [lockedAmount, updatedExpiration] = await asset.getLockForByPartition(
          _NON_DEFAULT_PARTITION,
          signer_A.address,
          1,
        );
        expect(lockedAmount).to.equal(_AMOUNT);
        expect(updatedExpiration).to.equal(extendedExpiration);
      });

      it("GIVEN a lock WHEN updateLockExpirationByPartition THEN locked amount is unchanged", async () => {
        await issuedAndLocked(expirationTimestamp);
        await asset
          .connect(signer_C)
          .updateLockExpirationByPartition(
            _NON_DEFAULT_PARTITION,
            signer_A.address,
            1,
            expirationTimestamp + ONE_SECOND,
          );

        expect(await asset.getLockedAmountForByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
        expect(await asset.getLockCountForByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(1);
      });
    });

    describe("Single partition mode", () => {
      beforeEach(async () => {
        await asset.setMultiPartition(false);
      });

      describe("multi-partition transactions arent enabled", () => {
        it("GIVEN a token with single-partition mode GIVEN lockByPartition THEN fails with PartitionNotAllowedInSinglePartitionMode", async () => {
          await expect(
            asset
              .connect(signer_C)
              .lockByPartition(_NON_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expirationTimestamp),
          )
            .to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode")
            .withArgs(_NON_DEFAULT_PARTITION);
        });

        it("GIVEN a token with single-partition mode GIVEN releaseByPartition THEN fails with PartitionNotAllowedInSinglePartitionMode", async () => {
          await expect(asset.connect(signer_C).releaseByPartition(_NON_DEFAULT_PARTITION, 1, signer_A.address))
            .to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode")
            .withArgs(_NON_DEFAULT_PARTITION);
        });

        it("GIVEN a token with single-partition mode GIVEN updateLockExpirationByPartition THEN fails with PartitionNotAllowedInSinglePartitionMode", async () => {
          await expect(
            asset
              .connect(signer_C)
              .updateLockExpirationByPartition(_NON_DEFAULT_PARTITION, signer_A.address, 1, expirationTimestamp),
          )
            .to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode")
            .withArgs(_NON_DEFAULT_PARTITION);
        });
      });

      describe("snapshot", () => {
        it("GIVEN an account with snapshot role WHEN takeSnapshot and Lock THEN transaction succeeds", async () => {
          const snapshotAmount = 10;
          const EXPIRATION_TIMESTAMP = dateToUnixTimestamp(`2030-01-01T00:00:35Z`);

          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_A.address);
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_LOCKER, signer_A.address);

          await asset.connect(signer_A).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: snapshotAmount,
            data: "0x",
          });

          await asset.connect(signer_A).takeSnapshot();

          await asset.connect(signer_A).lockByPartition(_DEFAULT_PARTITION, 1, signer_A.address, EXPIRATION_TIMESTAMP);
          await asset.connect(signer_A).lockByPartition(_DEFAULT_PARTITION, 1, signer_A.address, EXPIRATION_TIMESTAMP);

          await asset.connect(signer_A).takeSnapshot();

          await asset.changeSystemTimestamp(EXPIRATION_TIMESTAMP + 1);
          await asset.connect(signer_A).releaseByPartition(_DEFAULT_PARTITION, 1, signer_A.address);

          await asset.connect(signer_A).takeSnapshot();

          const snapshot_Balance_Of_A_1 = await asset.balanceOfAtSnapshot(1, signer_A.address);
          const snapshot_LockedBalance_Of_A_1 = await asset.lockedBalanceOfAtSnapshot(1, signer_A.address);
          const snapshot_Total_Supply_1 = await asset.totalSupplyAtSnapshot(1);

          expect(snapshot_Balance_Of_A_1).to.equal(snapshotAmount);
          expect(snapshot_LockedBalance_Of_A_1).to.equal(0);
          expect(snapshot_Total_Supply_1).to.equal(snapshotAmount);

          const snapshot_Balance_Of_A_2 = await asset.balanceOfAtSnapshot(2, signer_A.address);
          const snapshot_LockedBalance_Of_A_2 = await asset.lockedBalanceOfAtSnapshot(2, signer_A.address);
          const snapshot_Total_Supply_2 = await asset.totalSupplyAtSnapshot(2);

          expect(snapshot_Balance_Of_A_2).to.equal(snapshotAmount - 2);
          expect(snapshot_LockedBalance_Of_A_2).to.equal(2);
          expect(snapshot_Total_Supply_2).to.equal(snapshotAmount);

          const snapshot_Balance_Of_A_3 = await asset.balanceOfAtSnapshot(3, signer_A.address);
          const snapshot_LockedBalance_Of_A_3 = await asset.lockedBalanceOfAtSnapshot(3, signer_A.address);
          const snapshot_Total_Supply_3 = await asset.totalSupplyAtSnapshot(3);

          expect(snapshot_Balance_Of_A_3).to.equal(snapshotAmount - 1);
          expect(snapshot_LockedBalance_Of_A_3).to.equal(1);
          expect(snapshot_Total_Supply_3).to.equal(snapshotAmount);
        });
      });

      describe("lockByPartition (single-partition)", () => {
        it("GIVEN a valid partition WHEN lockByPartition with enough balance to the default partition THEN transaction success", async () => {
          await asset.connect(signer_B).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: _AMOUNT * 2,
            data: "0x",
          });

          await expect(
            asset.connect(signer_C).lockByPartition(_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expirationTimestamp),
          )
            .to.emit(asset, "LockedByPartition")
            .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 1, _AMOUNT, expirationTimestamp)
            .to.emit(asset, "Transfer")
            .withArgs(signer_A.address, ethers.ZeroAddress, _AMOUNT);

          expect(await asset.getLockedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
          expect(await asset.getLockCountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(1);
          expect(await asset.getLocksIdForByPartition(_DEFAULT_PARTITION, signer_A.address, 0, 1)).to.deep.equal([1n]);
          expect(await asset.getLockForByPartition(_DEFAULT_PARTITION, signer_A.address, 1)).to.deep.equal([
            _AMOUNT,
            expirationTimestamp,
          ]);

          expect(await asset.getLockedAmountFor(signer_A.address)).to.equal(_AMOUNT);
          expect(await asset.getLockCountFor(signer_A.address)).to.equal(1);
          expect(await asset.getLocksIdFor(signer_A.address, 0, 1)).to.deep.equal([1n]);
          expect(await asset.getLockFor(signer_A.address, 1)).to.deep.equal([_AMOUNT, expirationTimestamp]);

          expect(await asset.balanceOfByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
          expect(await asset.totalSupplyByPartition(_DEFAULT_PARTITION)).to.equal(_AMOUNT * 2);
        });
      });

      describe("releaseByPartition (single-partition)", () => {
        it("GIVEN a valid lockId and timestamp is reached WHEN releaseByPartition on the default partition THEN transaction success", async () => {
          await asset.connect(signer_B).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: _AMOUNT,
            data: "0x",
          });
          await asset
            .connect(signer_C)
            .lockByPartition(_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expirationTimestamp);

          await asset.changeSystemTimestamp(expirationTimestamp + 1);
          await expect(asset.connect(signer_C).releaseByPartition(_DEFAULT_PARTITION, 1, signer_A.address))
            .to.emit(asset, "LockByPartitionReleased")
            .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 1)
            .to.emit(asset, "Transfer")
            .withArgs(ethers.ZeroAddress, signer_A.address, _AMOUNT);

          expect(await asset.getLockedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
          expect(await asset.getLockCountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
          expect(await asset.getLocksIdForByPartition(_DEFAULT_PARTITION, signer_A.address, 0, 1)).to.deep.equal([]);
          expect(await asset.getLockForByPartition(_DEFAULT_PARTITION, signer_A.address, 1)).to.deep.equal([0, 0]);

          expect(await asset.getLockedAmountFor(signer_A.address)).to.equal(0);
          expect(await asset.getLockCountFor(signer_A.address)).to.equal(0);
          expect(await asset.getLocksIdFor(signer_A.address, 0, 1)).to.deep.equal([]);
          expect(await asset.getLockFor(signer_A.address, 1)).to.deep.equal([0, 0]);

          expect(await asset.balanceOfByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
          expect(await asset.totalSupplyByPartition(_DEFAULT_PARTITION)).to.equal(_AMOUNT);
        });
      });

      describe("updateLockExpirationByPartition (single-partition)", () => {
        async function issuedAndLocked(expiration: number | bigint): Promise<void> {
          await asset.connect(signer_B).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: _AMOUNT,
            data: "0x",
          });
          await asset.connect(signer_C).lockByPartition(_DEFAULT_PARTITION, _AMOUNT, signer_A.address, expiration);
        }

        it("GIVEN a lock with type(uint256).max expiration (FIND-059) WHEN updateLockExpirationByPartition to the default partition THEN shortens expiration and lock becomes releasable", async () => {
          await issuedAndLocked(MAX_UINT256);

          const shortenedExpiration = expirationTimestamp;

          await expect(
            asset
              .connect(signer_C)
              .updateLockExpirationByPartition(_DEFAULT_PARTITION, signer_A.address, 1, shortenedExpiration),
          )
            .to.emit(asset, "LockExpirationUpdated")
            .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 1, MAX_UINT256, shortenedExpiration);

          await asset.changeSystemTimestamp(shortenedExpiration + ONE_SECOND);
          await expect(asset.connect(signer_C).releaseByPartition(_DEFAULT_PARTITION, 1, signer_A.address))
            .to.emit(asset, "LockByPartitionReleased")
            .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 1);
        });

        it("GIVEN a lock with type(uint256).max WHEN updateLockExpiration (default-partition helper) THEN shortens expiration", async () => {
          await issuedAndLocked(MAX_UINT256);

          const shortenedExpiration = expirationTimestamp;

          await expect(asset.connect(signer_C).updateLockExpiration(signer_A.address, 1, shortenedExpiration))
            .to.emit(asset, "LockExpirationUpdated")
            .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 1, MAX_UINT256, shortenedExpiration);

          const [, updatedExpiration] = await asset.getLockFor(signer_A.address, 1);
          expect(updatedExpiration).to.equal(shortenedExpiration);
        });
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN lockByPartition THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(signer_A).lockByPartition(ethers.ZeroHash, 0, ADDRESS_ZERO, 0),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN releaseByPartition THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(signer_A).releaseByPartition(ethers.ZeroHash, 0, ADDRESS_ZERO),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN updateLockExpirationByPartition THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(signer_A).updateLockExpirationByPartition(ethers.ZeroHash, ADDRESS_ZERO, 0, 0),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeLockByPartition", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeLockByPartition is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeLockByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeLockByPartition is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeLockByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.lockByPartition, 1);
      });
    });

    describe("initializeLockByPartition event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeLockByPartition is called THEN emits LockByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.lockByPartition);
        await expect(asset.initializeLockByPartition()).to.emit(asset, "LockByPartitionInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN lockByPartition THEN reverts with AssetNotOperational", async () => {
        await expect(asset.lockByPartition(DEFAULT_PARTITION, 0, ADDRESS_ZERO, 0)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });

      it("GIVEN non-operational asset WHEN releaseByPartition THEN reverts with AssetNotOperational", async () => {
        await expect(asset.releaseByPartition(DEFAULT_PARTITION, 0, ADDRESS_ZERO)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });

      it("GIVEN non-operational asset WHEN forceReleaseByPartition THEN reverts with AssetNotOperational", async () => {
        await expect(asset.forceReleaseByPartition(DEFAULT_PARTITION, 0, ADDRESS_ZERO)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });
    });
  });
}
