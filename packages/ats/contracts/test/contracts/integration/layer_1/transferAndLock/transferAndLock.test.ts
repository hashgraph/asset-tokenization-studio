// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import { ZERO, EMPTY_STRING, ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

const _NON_DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000011";
const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _AMOUNT = 1000;
const EMPTY_VC_ID = EMPTY_STRING;

describe("Transfer and lock Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;

  let asset: IAsset;

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  let currentTimestamp = 0;
  let expirationTimestamp = 0;

  function set_initRbacs(): any[] {
    return [
      {
        role: ATS_ROLES.ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.LOCKER_ROLE,
        members: [signer_C.address],
      },
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [signer_D.address],
      },
      {
        role: ATS_ROLES.KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
    ];
  }

  async function setFacets(asset: IAsset) {
    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
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
    signer_B = base.user2;
    signer_C = base.user3;
    signer_D = base.user4;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    await executeRbac(asset, set_initRbacs());
    await setFacets(asset);
  }

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture();

    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;
    signer_D = base.user4;

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

      it("GIVEN a paused Token WHEN transferAndLockByPartition THEN transaction fails with TokenIsPaused", async () => {
        // lockByPartition with data fails
        await expect(
          asset
            .connect(signer_C)
            .transferAndLockByPartition(_NON_DEFAULT_PARTITION, signer_B.address, _AMOUNT, "0x", currentTimestamp),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN transferAndLock THEN transaction fails with TokenIsPaused", async () => {
        // transfer from with data fails
        await expect(
          asset.connect(signer_C).transferAndLock(signer_B.address, _AMOUNT, "0x", currentTimestamp),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without LOCKER role WHEN transferAndLockByPartition THEN transaction fails with AccountHasNoRole", async () => {
        // add to list fails
        await expect(
          asset
            .connect(signer_D)
            .transferAndLockByPartition(_NON_DEFAULT_PARTITION, signer_B.address, _AMOUNT, "0x", currentTimestamp),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });

      it("GIVEN an account without LOCKER role WHEN transferAndLock THEN transaction fails with AccountHasNoRole", async () => {
        // add to list fails
        await expect(
          asset.connect(signer_D).transferAndLock(signer_B.address, _AMOUNT, "0x", currentTimestamp),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });
    });

    describe("multi-partition transactions are enabled", () => {
      it("GIVEN a token with multi-partition enabled GIVEN transferAndLock THEN fails with NotAllowedInMultiPartitionMode", async () => {
        await expect(
          asset.connect(signer_C).transferAndLock(signer_B.address, _AMOUNT, "0x", currentTimestamp),
        ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
      });
    });

    describe("transferAndLockByPartition", () => {
      it("GIVEN a expiration timestamp in past WHEN transferAndLockByPartition THEN transaction fails with WrongExpirationTimestamp", async () => {
        await expect(
          asset
            .connect(signer_C)
            .transferAndLockByPartition(
              _NON_DEFAULT_PARTITION,
              signer_B.address,
              _AMOUNT,
              "0x",
              currentTimestamp - ONE_YEAR_IN_SECONDS,
            ),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
      });

      it("GIVEN a non valid partition WHEN transferAndLockByPartition THEN transaction fails with InvalidPartition", async () => {
        await expect(
          asset
            .connect(signer_C)
            .transferAndLockByPartition(_NON_DEFAULT_PARTITION, signer_B.address, _AMOUNT, "0x", expirationTimestamp),
        )
          .to.be.revertedWithCustomError(asset, "InvalidPartition")
          .withArgs(signer_C.address, _NON_DEFAULT_PARTITION);
      });

      it("GIVEN a valid partition WHEN transferAndLockByPartition with enough balance THEN transaction success", async () => {
        await asset.connect(signer_B).issueByPartition({
          partition: _NON_DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: _AMOUNT * 2,
          data: "0x",
        });

        await expect(
          asset
            .connect(signer_C)
            .transferAndLockByPartition(_NON_DEFAULT_PARTITION, signer_A.address, _AMOUNT, "0x", expirationTimestamp),
        )
          .to.emit(asset, "TransferByPartition")
          .withArgs(_NON_DEFAULT_PARTITION, signer_C.address, signer_C.address, signer_A.address, _AMOUNT, "0x", "0x")
          .to.emit(asset, "PartitionTransferredAndLocked")
          .withArgs(_NON_DEFAULT_PARTITION, signer_C.address, signer_A.address, _AMOUNT, "0x", expirationTimestamp, 1);

        expect(await asset.getLockedAmountForByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
        expect(await asset.getLockCountForByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(1);
        expect(await asset.getLocksIdForByPartition(_NON_DEFAULT_PARTITION, signer_A.address, 0, 1)).to.deep.equal([
          1n,
        ]);
        expect(await asset.getLockForByPartition(_NON_DEFAULT_PARTITION, signer_A.address, 1)).to.deep.equal([
          _AMOUNT,
          expirationTimestamp,
        ]);

        expect(await asset.getLockedAmountFor(signer_C.address)).to.equal(0);
        expect(await asset.getLockCountFor(signer_C.address)).to.equal(0);
        expect(await asset.getLocksIdFor(signer_C.address, 0, 1)).to.deep.equal([]);
        expect(await asset.getLockFor(signer_C.address, 1)).to.deep.equal([0, 0]);

        expect(await asset.balanceOfByPartition(_NON_DEFAULT_PARTITION, signer_C.address)).to.equal(_AMOUNT);
        expect(await asset.balanceOfByPartition(_NON_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
        expect(await asset.totalSupplyByPartition(_NON_DEFAULT_PARTITION)).to.equal(_AMOUNT * 2);
      });
    });
  });

  describe("Multi-partition disabled", () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    describe("multi-partition transactions arent enabled", () => {
      it("GIVEN a token with multi-partition disabled GIVEN transferAndLockByPartition with non-default partition THEN fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        await expect(
          asset
            .connect(signer_C)
            .transferAndLockByPartition(_NON_DEFAULT_PARTITION, signer_A.address, _AMOUNT, "0x", currentTimestamp),
        )
          .to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode")
          .withArgs(_NON_DEFAULT_PARTITION);
      });
    });

    describe("transferAndLock", () => {
      it("GIVEN a valid partition WHEN transferAndLockByPartition with enough balance THEN transaction success", async () => {
        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: _AMOUNT * 2,
          data: "0x",
        });

        await expect(
          asset
            .connect(signer_C)
            .transferAndLockByPartition(_DEFAULT_PARTITION, signer_A.address, _AMOUNT, "0x", expirationTimestamp),
        )
          .to.emit(asset, "TransferByPartition")
          .withArgs(_DEFAULT_PARTITION, signer_C.address, signer_C.address, signer_A.address, _AMOUNT, "0x", "0x")
          .to.emit(asset, "PartitionTransferredAndLocked")
          .withArgs(_DEFAULT_PARTITION, signer_C.address, signer_A.address, _AMOUNT, "0x", expirationTimestamp, 1);
      });

      it("GIVEN a expiration timestamp in past WHEN transferAndLock THEN transaction fails with WrongExpirationTimestamp", async () => {
        await expect(
          asset
            .connect(signer_C)
            .transferAndLock(signer_A.address, _AMOUNT, "0x", currentTimestamp - ONE_YEAR_IN_SECONDS),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
      });

      it("GIVEN a valid partition WHEN transferAndLock with enough balance THEN transaction success", async () => {
        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: _AMOUNT * 2,
          data: "0x",
        });

        await expect(asset.connect(signer_C).transferAndLock(signer_A.address, _AMOUNT, "0x", expirationTimestamp))
          .to.emit(asset, "TransferByPartition")
          .withArgs(_DEFAULT_PARTITION, signer_C.address, signer_C.address, signer_A.address, _AMOUNT, "0x", "0x")
          .to.emit(asset, "PartitionTransferredAndLocked")
          .withArgs(_DEFAULT_PARTITION, signer_C.address, signer_A.address, _AMOUNT, "0x", expirationTimestamp, 1);

        expect(await asset.getLockedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
        expect(await asset.getLockCountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(1);
        expect(await asset.getLocksIdForByPartition(_DEFAULT_PARTITION, signer_A.address, 0, 1)).to.deep.equal([1n]);
        expect(await asset.getLockForByPartition(_DEFAULT_PARTITION, signer_A.address, 1)).to.deep.equal([
          _AMOUNT,
          expirationTimestamp,
        ]);

        expect(await asset.getLockedAmountFor(signer_C.address)).to.equal(0);
        expect(await asset.getLockCountFor(signer_C.address)).to.equal(0);
        expect(await asset.getLocksIdFor(signer_C.address, 0, 1)).to.deep.equal([]);
        expect(await asset.getLockFor(signer_C.address, 1)).to.deep.equal([0, 0]);

        expect(await asset.balanceOfByPartition(_DEFAULT_PARTITION, signer_C.address)).to.equal(_AMOUNT);
        expect(await asset.balanceOfByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
        expect(await asset.totalSupplyByPartition(_DEFAULT_PARTITION)).to.equal(_AMOUNT * 2);
      });
    });
  });
});
