// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { type ResolverProxy, type IAsset } from "@contract-types";

import { deployEquityTokenFixture } from "@test";

import { executeRbac, MAX_UINT256 } from "@test";
import { EMPTY_STRING, ATS_ROLES, ZERO } from "@scripts";
import { Rbac } from "@scripts/domain";

const _NON_DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000011";
const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _AMOUNT = 1000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("Lock Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;

  let asset: IAsset;

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  let currentTimestamp = 0;
  let expirationTimestamp = 0;

  function set_initRbacs(): Rbac[] {
    const rbacIssuer: Rbac = {
      role: ATS_ROLES.ISSUER_ROLE,
      members: [signer_B.address],
    };
    const rbacLocker: Rbac = {
      role: ATS_ROLES.LOCKER_ROLE,
      members: [signer_C.address],
    };
    const rbacPausable: Rbac = {
      role: ATS_ROLES.PAUSER_ROLE,
      members: [signer_D.address],
    };
    const rbacKYC: Rbac = {
      role: ATS_ROLES.KYC_ROLE,
      members: [signer_B.address],
    };
    const rbacSSI: Rbac = {
      role: ATS_ROLES.SSI_MANAGER_ROLE,
      members: [signer_A.address],
    };
    const rbacCorporateAction: Rbac = {
      role: ATS_ROLES.CORPORATE_ACTION_ROLE,
      members: [signer_B.address],
    };
    return [rbacIssuer, rbacLocker, rbacPausable, rbacKYC, rbacSSI, rbacCorporateAction];
  }

  async function setFacets(asset: IAsset) {
    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  async function deploySecurityFixtureMultiPartition() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: true,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    signer_D = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, set_initRbacs());

    await setFacets(asset);
  }

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    signer_D = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, set_initRbacs());

    await setFacets(asset);
  }

  beforeEach(async () => {
    currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;
    expirationTimestamp = currentTimestamp + ONE_YEAR_IN_SECONDS;
  });

  describe("Multi-partition enabled", () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureMultiPartition);
    });

    describe("Paused", () => {
      beforeEach(async () => {
        // Pausing the token
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
    });
  });

  describe("Multi-partition disabled", () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    describe("lock", () => {
      it("GIVEN a expiration timestamp in past WHEN lock THEN transaction fails with WrongExpirationTimestamp", async () => {
        await expect(
          asset.connect(signer_C).lock(_AMOUNT, signer_A.address, currentTimestamp - ONE_YEAR_IN_SECONDS),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
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
});
