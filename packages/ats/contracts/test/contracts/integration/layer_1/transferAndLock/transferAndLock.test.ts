// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock, ComplianceMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { ZERO, EMPTY_STRING, ATS_ROLES, ADDRESS_ZERO, RESOLVER_KEYS } from "@scripts";
import { getDltTimestamp, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _AMOUNT = 1000;
const EMPTY_VC_ID = EMPTY_STRING;

export function transferAndLockTests(getCtx: () => AssetMockCtx): void {
  describe("Transfer and lock Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;
    let signer_E: HardhatEthersSigner;
    let unknownSigner: HardhatEthersSigner;

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

    async function setFacets() {
      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    }

    beforeEach(async () => {
      const ctx = getCtx();
      signer_A = ctx.deployer;
      signer_B = ctx.user2;
      signer_C = ctx.user3;
      signer_D = ctx.user4;
      signer_E = ctx.user1;
      unknownSigner = ctx.unknownSigner;
      asset = ctx.asset;

      currentTimestamp = await getDltTimestamp();
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

        it("GIVEN a paused Token WHEN transferAndLock THEN transaction fails with IsPaused", async () => {
          await expect(
            asset.connect(signer_C).transferAndLock(signer_B.address, _AMOUNT, "0x", currentTimestamp),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });
      });

      describe("AccessControl", () => {
        it("GIVEN an account without LOCKER role WHEN transferAndLock THEN transaction fails with AccountHasNoRole", async () => {
          await expect(
            asset.connect(signer_D).transferAndLock(signer_B.address, _AMOUNT, "0x", currentTimestamp),
          ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
        });
      });

      describe("multi-partition transactions are enabled", () => {
        it("GIVEN a token with multi-partition enabled GIVEN transferAndLock THEN fails with NotAllowedInMultiPartitionMode", async () => {
          await expect(
            asset.connect(signer_C).transferAndLock(signer_B.address, _AMOUNT, "0x", expirationTimestamp),
          ).to.be.revertedWithCustomError(asset, "NotAllowedInMultiPartitionMode");
        });
      });
    });

    describe("Multi-partition disabled", () => {
      describe("transferAndLock", () => {
        it("GIVEN an expiration timestamp in the past WHEN transferAndLock THEN transaction fails with WrongExpirationTimestamp", async () => {
          await expect(
            asset
              .connect(signer_C)
              .transferAndLock(signer_A.address, _AMOUNT, "0x", currentTimestamp - ONE_YEAR_IN_SECONDS),
          ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
        });

        it("GIVEN a zero amount WHEN transferAndLock THEN transaction fails with ZeroValue", async () => {
          await expect(
            asset.connect(signer_C).transferAndLock(signer_A.address, 0, "0x", expirationTimestamp),
          ).to.be.revertedWithCustomError(asset, "ZeroValue");
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
            .withArgs(_DEFAULT_PARTITION, signer_C.address, signer_A.address, _AMOUNT, "0x", expirationTimestamp, 1)
            .to.emit(asset, "Transfer")
            .withArgs(signer_C.address, signer_A.address, _AMOUNT);

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

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN transferAndLock THEN transaction fails with Deactivated", async () => {
        await expect(asset.connect(signer_A).transferAndLock(ADDRESS_ZERO, 0, "0x", 0)).to.be.revertedWithCustomError(
          asset,
          "Deactivated",
        );
      });
    });

    describe("initializeTransferAndLock", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeTransferAndLock is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(unknownSigner).initializeTransferAndLock())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(unknownSigner.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeTransferAndLock is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeTransferAndLock())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.transferAndLock, 1);
      });
    });

    describe("initializeTransferAndLock event", () => {
      it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeTransferAndLock is called THEN emits TransferAndLockInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.transferAndLock);
        await expect(asset.initializeTransferAndLock()).to.emit(asset, "TransferAndLockInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational WHEN transferAndLock is called THEN AssetNotOperational", async () => {
        await expect(asset.transferAndLock(ADDRESS_ZERO, 0n, "0x", 0n)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });
    });

    describe("FIND-065 - recipient compliance checks", () => {
      it("GIVEN a recipient without KYC WHEN transferAndLock THEN transaction fails with InvalidKycStatus", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_INTERNAL_KYC_MANAGER, signer_A.address);
        await asset.connect(signer_A).activateInternalKyc();

        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: _AMOUNT * 2,
          data: "0x",
        });

        await expect(
          asset.connect(signer_C).transferAndLock(signer_D.address, _AMOUNT, "0x", expirationTimestamp),
        ).to.be.revertedWithCustomError(asset, "InvalidKycStatus");
      });

      it("GIVEN a compliance module that rejects the transfer WHEN transferAndLock THEN transaction fails with ComplianceNotAllowed", async () => {
        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: _AMOUNT * 2,
          data: "0x",
        });

        const complianceMock: ComplianceMock = await (
          await ethers.getContractFactory("ComplianceMock", signer_A)
        ).deploy(false, false);
        await complianceMock.waitForDeployment();
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_TREX_OWNER, signer_A.address);
        await asset.connect(signer_A).setCompliance(complianceMock.target as string);

        await expect(
          asset.connect(signer_C).transferAndLock(signer_A.address, _AMOUNT, "0x", expirationTimestamp),
        ).to.be.revertedWithCustomError(asset, "ComplianceNotAllowed");
      });

      it("GIVEN a recovered-wallet recipient WHEN transferAndLock THEN transaction fails with WalletRecovered", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_AGENT, signer_A.address);
        const strangerWallet = ethers.Wallet.createRandom().address;
        await asset.connect(signer_A).recoveryAddress(signer_E.address, strangerWallet, ADDRESS_ZERO);

        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_C.address,
          value: _AMOUNT * 2,
          data: "0x",
        });

        await expect(
          asset.connect(signer_C).transferAndLock(signer_E.address, _AMOUNT, "0x", expirationTimestamp),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
      });
    });
  });
}
