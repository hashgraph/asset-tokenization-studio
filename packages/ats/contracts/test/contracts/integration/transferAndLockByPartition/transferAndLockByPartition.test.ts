// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { ATS_ROLES, RESOLVER_KEY_TRANSFER_AND_LOCK_BY_PARTITION } from "@scripts";
import { ASSET_MOCK_CONFIG_ID } from "../../../fixtures/deploy/assetMockConfiguration";
import { executeRbac, getDltTimestamp, grantKycToHolders, NON_DEFAULT_PARTITION, DEFAULT_PARTITION } from "@test";
import type { AssetMockCtx } from "@test";

const _AMOUNT = 1000;

export function transferAndLockByPartitionTests(getCtx: () => AssetMockCtx): void {
  describe("TransferAndLockByPartition Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;

    let asset: IAssetMock;

    const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
    let currentTimestamp = 0;
    let expirationTimestamp = 0;

    function set_initRbacs(): any[] {
      return [
        {
          role: ATS_ROLES.ROLE_ISSUER,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_LOCKER,
          members: [signer_C.address],
        },
        {
          role: ATS_ROLES.ROLE_PAUSER,
          members: [signer_D.address],
        },
        {
          role: ATS_ROLES.ROLE_KYC,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_SSI_MANAGER,
          members: [signer_A.address],
        },
      ];
    }

    async function setFacets(asset: IAssetMock) {
      await asset.connect(signer_A).addIssuer(signer_A.address);
      await grantKycToHolders(asset, signer_B, [signer_A, signer_C], signer_A.address);
    }

    async function deployFixture() {
      const ctx = await loadFixture(deployAssetMockCtx);
      asset = ctx.asset;

      signer_A = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;
      signer_D = ctx.user4;

      await executeRbac(asset, set_initRbacs());
      await setFacets(asset);

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      signer_A = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;
      signer_D = ctx.user4;
      await executeRbac(asset, set_initRbacs());
      await setFacets(asset);
      currentTimestamp = await getDltTimestamp();
      expirationTimestamp = currentTimestamp + ONE_YEAR_IN_SECONDS;
    }

    beforeEach(async () => {
      await loadFixture(deployFixture);
    });

    describe("Multi-partition enabled", () => {
      beforeEach(async () => {
        await asset.setMultiPartition(true);
      });

      describe("transferAndLockByPartition", () => {
        it("GIVEN a paused Token WHEN transferAndLockByPartition THEN transaction fails with IsPaused", async () => {
          await asset.connect(signer_D).pause();

          await expect(
            asset
              .connect(signer_C)
              .transferAndLockByPartition(NON_DEFAULT_PARTITION, signer_B.address, _AMOUNT, "0x", currentTimestamp),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });

        it("GIVEN an account without LOCKER role WHEN transferAndLockByPartition THEN transaction fails with AccountHasNoRole", async () => {
          await expect(
            asset
              .connect(signer_D)
              .transferAndLockByPartition(NON_DEFAULT_PARTITION, signer_B.address, _AMOUNT, "0x", currentTimestamp),
          ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
        });

        it("GIVEN a expiration timestamp in past WHEN transferAndLockByPartition THEN transaction fails with WrongExpirationTimestamp", async () => {
          await expect(
            asset
              .connect(signer_C)
              .transferAndLockByPartition(
                NON_DEFAULT_PARTITION,
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
              .transferAndLockByPartition(NON_DEFAULT_PARTITION, signer_B.address, _AMOUNT, "0x", expirationTimestamp),
          )
            .to.be.revertedWithCustomError(asset, "InvalidPartition")
            .withArgs(signer_C.address, NON_DEFAULT_PARTITION);
        });

        it("GIVEN a valid partition WHEN transferAndLockByPartition with enough balance THEN transaction success", async () => {
          await asset.connect(signer_B).issueByPartition({
            partition: NON_DEFAULT_PARTITION,
            tokenHolder: signer_C.address,
            value: _AMOUNT * 2,
            data: "0x",
          });

          await expect(
            asset
              .connect(signer_C)
              .transferAndLockByPartition(NON_DEFAULT_PARTITION, signer_A.address, _AMOUNT, "0x", expirationTimestamp),
          )
            .to.emit(asset, "TransferByPartition")
            .withArgs(NON_DEFAULT_PARTITION, signer_C.address, signer_C.address, signer_A.address, _AMOUNT, "0x", "0x")
            .to.emit(asset, "PartitionTransferredAndLocked")
            .withArgs(NON_DEFAULT_PARTITION, signer_C.address, signer_A.address, _AMOUNT, "0x", expirationTimestamp, 1)
            .to.emit(asset, "Transfer")
            .withArgs(signer_C.address, signer_A.address, _AMOUNT);

          expect(await asset.getLockedAmountForByPartition(NON_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
          expect(await asset.getLockCountForByPartition(NON_DEFAULT_PARTITION, signer_A.address)).to.equal(1);
          expect(await asset.getLocksIdForByPartition(NON_DEFAULT_PARTITION, signer_A.address, 0, 1)).to.deep.equal([
            1n,
          ]);
          expect(await asset.getLockForByPartition(NON_DEFAULT_PARTITION, signer_A.address, 1)).to.deep.equal([
            _AMOUNT,
            expirationTimestamp,
          ]);

          expect(await asset.getLockedAmountFor(signer_C.address)).to.equal(0);
          expect(await asset.getLockCountFor(signer_C.address)).to.equal(0);
          expect(await asset.getLocksIdFor(signer_C.address, 0, 1)).to.deep.equal([]);
          expect(await asset.getLockFor(signer_C.address, 1)).to.deep.equal([0, 0]);

          expect(await asset.balanceOfByPartition(NON_DEFAULT_PARTITION, signer_C.address)).to.equal(_AMOUNT);
          expect(await asset.balanceOfByPartition(NON_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
          expect(await asset.totalSupplyByPartition(NON_DEFAULT_PARTITION)).to.equal(_AMOUNT * 2);
        });
      });
    });

    describe("Multi-partition disabled", () => {
      beforeEach(async () => {
        await loadFixture(deployFixture);
      });

      describe("transferAndLockByPartition", () => {
        it("GIVEN a token with multi-partition disabled GIVEN transferAndLockByPartition with non-default partition THEN fails with PartitionNotAllowedInSinglePartitionMode", async () => {
          await expect(
            asset
              .connect(signer_C)
              .transferAndLockByPartition(
                NON_DEFAULT_PARTITION,
                signer_A.address,
                _AMOUNT,
                "0x",
                (await getDltTimestamp()) + 1,
              ),
          )
            .to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode")
            .withArgs(NON_DEFAULT_PARTITION);
        });

        it("GIVEN a valid partition WHEN transferAndLockByPartition with enough balance THEN transaction success", async () => {
          await asset.connect(signer_B).issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_C.address,
            value: _AMOUNT * 2,
            data: "0x",
          });

          await expect(
            asset
              .connect(signer_C)
              .transferAndLockByPartition(DEFAULT_PARTITION, signer_A.address, _AMOUNT, "0x", expirationTimestamp),
          )
            .to.emit(asset, "TransferByPartition")
            .withArgs(DEFAULT_PARTITION, signer_C.address, signer_C.address, signer_A.address, _AMOUNT, "0x", "0x")
            .to.emit(asset, "PartitionTransferredAndLocked")
            .withArgs(DEFAULT_PARTITION, signer_C.address, signer_A.address, _AMOUNT, "0x", expirationTimestamp, 1);
        });
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        const ctx = getCtx();
        asset = ctx.asset;
        signer_A = ctx.deployer;
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN transferAndLockByPartition THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.connect(signer_A).transferAndLockByPartition(ethers.ZeroHash, ethers.ZeroAddress, 0, "0x", 0),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeTransferAndLockByPartition", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeTransferAndLockByPartition is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeTransferAndLockByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeTransferAndLockByPartition is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeTransferAndLockByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEY_TRANSFER_AND_LOCK_BY_PARTITION, 1);
      });
    });

    describe("initializeTransferAndLockByPartition event", () => {
      it("GIVEN a fresh deployment WHEN initializeTransferAndLockByPartition is called THEN emits TransferAndLockByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEY_TRANSFER_AND_LOCK_BY_PARTITION);
        await expect(asset.initializeTransferAndLockByPartition()).to.emit(
          asset,
          "TransferAndLockByPartitionInitialized",
        );
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.setMultiPartition(true);
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational WHEN transferAndLockByPartition is called THEN AssetNotOperational", async () => {
        await expect(asset.transferAndLockByPartition(ethers.ZeroHash, ethers.ZeroAddress, 0n, "0x", 0n))
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });
    });
  });
}
