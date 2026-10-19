// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock, LockFacet__factory, type LockFacet } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";

import { EMPTY_STRING, ATS_ROLES, ZERO, RESOLVER_KEYS } from "@scripts";
import { Rbac } from "@scripts/domain";

const _NON_DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000011";
const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _AMOUNT = 1000;
const EMPTY_VC_ID = EMPTY_STRING;

export function lockTests(getCtx: () => AssetMockCtx): void {
  describe("Lock Tests", () => {
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
      const rbacIssuer: Rbac = {
        role: ATS_ROLES.ROLE_ISSUER,
        members: [signer_B.address],
      };
      const rbacLocker: Rbac = {
        role: ATS_ROLES.ROLE_LOCKER,
        members: [signer_C.address],
      };
      const rbacPausable: Rbac = {
        role: ATS_ROLES.ROLE_PAUSER,
        members: [signer_D.address],
      };
      const rbacKYC: Rbac = {
        role: ATS_ROLES.ROLE_KYC,
        members: [signer_B.address],
      };
      const rbacSSI: Rbac = {
        role: ATS_ROLES.ROLE_SSI_MANAGER,
        members: [signer_A.address],
      };
      const rbacCorporateAction: Rbac = {
        role: ATS_ROLES.ROLE_CORPORATE_ACTION,
        members: [signer_B.address],
      };
      return [rbacIssuer, rbacLocker, rbacPausable, rbacKYC, rbacSSI, rbacCorporateAction];
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

        it("GIVEN a paused Token WHEN lock THEN transaction fails with IsPaused", async () => {
          await expect(
            asset.connect(signer_C).lock(_AMOUNT, signer_A.address, currentTimestamp),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });

        it("GIVEN a paused Token WHEN release THEN transaction fails with IsPaused", async () => {
          await expect(asset.connect(signer_C).release(1, signer_A.address)).to.be.revertedWithCustomError(
            asset,
            "IsPaused",
          );
        });

        it("GIVEN a paused Token WHEN forceReleaseByPartition THEN transaction fails with IsPaused", async () => {
          const lockFacet = await ethers.getContractAt("LockFacet", await asset.getAddress());
          await expect(
            lockFacet.connect(signer_C).forceReleaseByPartition(_DEFAULT_PARTITION, 1, signer_A.address),
          ).to.be.revertedWithCustomError(lockFacet, "IsPaused");
        });

        it("GIVEN a paused Token WHEN updateLockExpiration THEN transaction fails with IsPaused", async () => {
          await expect(
            asset.connect(signer_C).updateLockExpiration(signer_A.address, 1, expirationTimestamp),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });
      });

      describe("AccessControl", () => {
        it("GIVEN an account without LOCKER role WHEN lock THEN transaction fails with AccountHasNoRole", async () => {
          await expect(
            asset.connect(signer_D).lock(_AMOUNT, signer_A.address, currentTimestamp),
          ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
        });
      });

      describe("multi-partition transactions are enabled", () => {
        it("GIVEN a token with multi-partition enabled GIVEN lock THEN fails with NotAllowedInMultiPartitionMode", async () => {
          await expect(
            asset.connect(signer_C).lock(_AMOUNT, signer_A.address, currentTimestamp),
          ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
        });

        it("GIVEN a token with multi-partition enabled GIVEN release THEN fails with NotAllowedInMultiPartitionMode", async () => {
          await expect(asset.connect(signer_C).release(1, signer_A.address)).to.be.revertedWithCustomError(
            asset,
            "NotAllowedInMultiPartitionMode",
          );
        });

        it("GIVEN a token with multi-partition enabled WHEN updateLockExpiration THEN fails with NotAllowedInMultiPartitionMode", async () => {
          await expect(
            asset.connect(signer_C).updateLockExpiration(signer_A.address, 1, expirationTimestamp),
          ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
        });
      });
    });

    describe("Multi-partition disabled", () => {
      describe("lock", () => {
        it("GIVEN a expiration timestamp in past WHEN lock THEN transaction fails with WrongExpirationTimestamp", async () => {
          await expect(
            asset.connect(signer_C).lock(_AMOUNT, signer_A.address, currentTimestamp - ONE_YEAR_IN_SECONDS),
          ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
        });

        it("FIND-041 (TDD, expected red) GIVEN an expiration timestamp equal to the current block time WHEN lock THEN transaction fails instead of accepting a lock that is immediately releasable in the same block", async () => {
          await asset.connect(signer_B).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: _AMOUNT,
            data: "0x",
          });

          await asset.changeSystemTimestamp(currentTimestamp);

          await expect(
            asset.connect(signer_C).lock(_AMOUNT, signer_A.address, currentTimestamp),
          ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
        });

        it("GIVEN an expiration timestamp one second after the current block time WHEN lock THEN transaction success", async () => {
          await asset.connect(signer_B).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: _AMOUNT,
            data: "0x",
          });

          await asset.changeSystemTimestamp(currentTimestamp);

          await expect(asset.connect(signer_C).lock(_AMOUNT, signer_A.address, currentTimestamp + 1)).to.emit(
            asset,
            "LockedByPartition",
          );
        });

        it("GIVEN a valid partition WHEN lock with enough balance THEN transaction success", async () => {
          await asset.connect(signer_B).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: _AMOUNT * 2,
            data: "0x",
          });

          await expect(asset.connect(signer_C).lock(_AMOUNT, signer_A.address, expirationTimestamp))
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

      describe("release", () => {
        it("GIVEN a non valid lockId WHEN release THEN transaction fails with InvalidLockId", async () => {
          await expect(asset.connect(signer_C).release(10, signer_A.address)).to.be.revertedWithCustomError(
            asset,
            "WrongLockId",
          );
        });

        it("GIVEN a valid lockId but timestamp is not reached WHEN release THEN transaction fails with LockExpirationNotReached", async () => {
          await asset.connect(signer_B).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: _AMOUNT,
            data: "0x",
          });
          await asset.connect(signer_C).lock(_AMOUNT, signer_A.address, expirationTimestamp);

          await expect(asset.connect(signer_C).release(1, signer_A.address)).to.be.revertedWithCustomError(
            asset,
            "LockExpirationNotReached",
          );
        });

        it("GIVEN a valid lockId and timestamp is reached WHEN release THEN transaction success", async () => {
          await asset.connect(signer_B).issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: _AMOUNT,
            data: "0x",
          });
          await expect(asset.connect(signer_C).lock(_AMOUNT - 1, signer_A.address, expirationTimestamp))
            .to.emit(asset, "LockedByPartition")
            .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 1, _AMOUNT - 1, expirationTimestamp);
          await expect(asset.connect(signer_C).lock(1, signer_A.address, expirationTimestamp))
            .to.emit(asset, "LockedByPartition")
            .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 2, 1, expirationTimestamp);

          await asset.changeSystemTimestamp(expirationTimestamp + 1);
          await expect(asset.connect(signer_C).release(1, signer_A.address))
            .to.emit(asset, "LockByPartitionReleased")
            .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 1)
            .to.emit(asset, "Transfer")
            .withArgs(ethers.ZeroAddress, signer_A.address, _AMOUNT - 1);
          await expect(asset.connect(signer_C).release(2, signer_A.address))
            .to.emit(asset, "LockByPartitionReleased")
            .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 2)
            .to.emit(asset, "Transfer")
            .withArgs(ethers.ZeroAddress, signer_A.address, 1);

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
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN lock THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).lock(0, ethers.ZeroAddress, 0)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN release THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).release(0, ethers.ZeroAddress)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });

      it("GIVEN a deactivated asset WHEN forceReleaseByPartition THEN transaction fails with Deactivated", async () => {
        const lockFacet = await ethers.getContractAt("LockFacet", await asset.getAddress());
        await expect(
          lockFacet.connect(signer_A).forceReleaseByPartition(ethers.ZeroHash, 0, ethers.ZeroAddress),
        ).to.be.revertedWithCustomError(lockFacet, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN updateLockExpiration THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(signer_A).updateLockExpiration(signer_A.address, 1, expirationTimestamp),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeLock", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeLock is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeLock())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeLock is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeLock())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.lock, 1);
      });
    });

    describe("initializeLock event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeLock is called THEN emits LockInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.lock);
        await expect(asset.initializeLock()).to.emit(asset, "LockInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational WHEN lock is called THEN AssetNotOperational", async () => {
        await expect(asset.lock(0n, ethers.ZeroAddress, 0n)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });

      it("GIVEN non-operational WHEN release is called THEN AssetNotOperational", async () => {
        await expect(asset.release(0n, ethers.ZeroAddress)).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational WHEN forceReleaseByPartition is called THEN AssetNotOperational", async () => {
        const lockFacet = await ethers.getContractAt("LockFacet", await asset.getAddress());
        await expect(
          lockFacet.forceReleaseByPartition(_DEFAULT_PARTITION, 1, signer_A.address),
        ).to.be.revertedWithCustomError(lockFacet, "AssetNotOperational");
      });
    });

    describe("forceReleaseByPartition", () => {
      let lockFacet: LockFacet;

      beforeEach(async () => {
        lockFacet = LockFacet__factory.connect(await asset.getAddress(), ethers.provider);

        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT * 2,
          data: "0x",
        });
        await asset.connect(signer_C).lock(_AMOUNT, signer_A.address, expirationTimestamp);
      });

      it("GIVEN a caller with ROLE_LOCKER WHEN forceReleaseByPartition THEN succeeds and emits LockByPartitionReleased", async () => {
        await expect(lockFacet.connect(signer_C).forceReleaseByPartition(_DEFAULT_PARTITION, 1, signer_A.address))
          .to.emit(lockFacet, "LockByPartitionReleased")
          .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 1);
      });

      it("GIVEN a caller with ROLE_CONTROLLER WHEN forceReleaseByPartition THEN succeeds", async () => {
        await asset.grantRole(ATS_ROLES.ROLE_CONTROLLER, signer_B.address);
        await expect(lockFacet.connect(signer_B).forceReleaseByPartition(_DEFAULT_PARTITION, 1, signer_A.address))
          .to.emit(lockFacet, "LockByPartitionReleased")
          .withArgs(signer_B.address, signer_A.address, _DEFAULT_PARTITION, 1);
      });

      it("GIVEN a caller without ROLE_LOCKER or ROLE_CONTROLLER WHEN forceReleaseByPartition THEN fails with AccountHasNoRoles", async () => {
        await expect(
          lockFacet.connect(unknownSigner).forceReleaseByPartition(_DEFAULT_PARTITION, 1, signer_A.address),
        ).to.be.revertedWithCustomError(lockFacet, "AccountHasNoRoles");
      });

      it("GIVEN a non-default partition in single-partition mode WHEN forceReleaseByPartition THEN fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        await expect(
          lockFacet.connect(signer_C).forceReleaseByPartition(_NON_DEFAULT_PARTITION, 1, signer_A.address),
        ).to.be.revertedWithCustomError(lockFacet, "PartitionNotAllowedInSinglePartitionMode");
      });
    });

    describe("updateLockExpiration", () => {
      beforeEach(async () => {
        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: "0x",
        });
        await asset.connect(signer_C).lock(_AMOUNT, signer_A.address, expirationTimestamp);
      });

      it("GIVEN a caller with ROLE_LOCKER WHEN updateLockExpiration THEN succeeds and emits LockExpirationUpdated", async () => {
        const newExpiration = expirationTimestamp + ONE_YEAR_IN_SECONDS;
        await expect(asset.connect(signer_C).updateLockExpiration(signer_A.address, 1, newExpiration))
          .to.emit(asset, "LockExpirationUpdated")
          .withArgs(signer_C.address, signer_A.address, _DEFAULT_PARTITION, 1, expirationTimestamp, newExpiration);
      });

      it("GIVEN a caller without ROLE_LOCKER WHEN updateLockExpiration THEN fails with AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).updateLockExpiration(signer_A.address, 1, expirationTimestamp))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.ROLE_LOCKER);
      });

      it("GIVEN an invalid lockId WHEN updateLockExpiration THEN fails with WrongLockId", async () => {
        await expect(
          asset.connect(signer_C).updateLockExpiration(signer_A.address, 999, expirationTimestamp),
        ).to.be.revertedWithCustomError(asset, "WrongLockId");
      });

      it("GIVEN a past expiration timestamp WHEN updateLockExpiration THEN fails with WrongExpirationTimestamp", async () => {
        await expect(
          asset.connect(signer_C).updateLockExpiration(signer_A.address, 1, currentTimestamp - ONE_YEAR_IN_SECONDS),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
      });
    });

    describe("getLockByPartition", () => {
      beforeEach(async () => {
        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: "0x",
        });
        await asset.connect(signer_C).lock(_AMOUNT, signer_A.address, expirationTimestamp);
      });

      it("GIVEN an existing lock WHEN token holder calls getLockByPartition THEN returns LockData", async () => {
        const lockFacet = await ethers.getContractAt("LockFacet", await asset.getAddress());
        const lockData = await lockFacet.connect(signer_A).getLockByPartition(_DEFAULT_PARTITION, 1);
        expect(lockData.id).to.equal(1n);
        expect(lockData.amount).to.equal(_AMOUNT);
        expect(lockData.expirationTimestamp).to.equal(expirationTimestamp);
      });

      it("GIVEN a non-existent lockId WHEN getLockByPartition THEN returns zeroed LockData", async () => {
        const lockFacet = await ethers.getContractAt("LockFacet", await asset.getAddress());
        const lockData = await lockFacet.connect(signer_A).getLockByPartition(_DEFAULT_PARTITION, 999);
        expect(lockData.id).to.equal(0n);
        expect(lockData.amount).to.equal(0n);
        expect(lockData.expirationTimestamp).to.equal(0n);
      });
    });
  });
}
