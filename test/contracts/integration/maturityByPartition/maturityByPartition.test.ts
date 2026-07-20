// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import { DEFAULT_PARTITION, ATS_ROLES, TIME_PERIODS_S, ADDRESS_ZERO, ZERO, EMPTY_STRING, RESOLVER_KEYS } from "@lib";
import { getDltTimestamp, grantRoleAndPauseToken, executeRbac, MAX_UINT256 } from "@test";
import type { AssetMockCtx } from "@test";

const numberOfUnits = 1000;
const amount = numberOfUnits;
const _PARTITION_ID = "0x0000000000000000000000000000000000000000000000000000000000000002";

const EMPTY_VC_ID = EMPTY_STRING;

export function maturityByPartitionTests(getCtx: () => AssetMockCtx): void {
  describe("MaturityByPartition Tests", () => {
    let asset: IAssetMock;
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;

    let maturityDate: number;

    beforeEach(async () => {
      const ctx = getCtx();
      asset = ctx.asset;
      signer_A = ctx.deployer;
      signer_B = ctx.user1;
      signer_C = ctx.user2;
      signer_D = ctx.user3;

      await executeRbac(asset, [
        { role: ATS_ROLES.ROLE_FREEZE_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_PAUSER, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_KYC, members: [signer_B.address] },
        { role: ATS_ROLES.ROLE_INTERNAL_KYC_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_MATURITY_REDEEMER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_SSI_MANAGER, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_CONTROL_LIST, members: [signer_D.address] },
        { role: ATS_ROLES.ROLE_CLEARING, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_PROTECTED_PARTITIONS, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_AGENT, members: [signer_A.address] },
        { role: ATS_ROLES.ROLE_MATURITY_MANAGER, members: [signer_A.address] },
      ]);

      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_A).activateInternalKyc();

      const futureDate = (await getDltTimestamp()) + TIME_PERIODS_S.YEAR;
      await asset.connect(signer_A).updateMaturityDate(futureDate);
      maturityDate = futureDate;
    });

    describe("Single Partition", () => {
      describe("Redeem At Maturity By Partition", () => {
        it("GIVEN a zero address as token holder WHEN redeeming at maturity THEN transaction fails with ZeroAddressNotAllowed", async () => {
          await expect(
            asset.connect(signer_A).redeemAtMaturityByPartition(ADDRESS_ZERO, DEFAULT_PARTITION, amount),
          ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
        });

        it("GIVEN single partition mode WHEN redeeming from a non-default partition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
          await expect(
            asset.connect(signer_A).redeemAtMaturityByPartition(signer_C.address, _PARTITION_ID, amount),
          ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
        });

        it("GIVEN the token holder account is blocked WHEN redeeming at maturity THEN transaction fails with AccountIsBlocked", async () => {
          await asset.connect(signer_D).addToControlList(signer_B.address);

          await expect(
            asset.connect(signer_A).redeemAtMaturityByPartition(signer_B.address, DEFAULT_PARTITION, amount),
          ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
        });

        it("GIVEN the caller lacks the Maturity Redeemer role WHEN redeeming at maturity THEN transaction fails with AccountHasNoRole", async () => {
          await expect(
            asset.connect(signer_B).redeemAtMaturityByPartition(signer_C.address, DEFAULT_PARTITION, amount),
          ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
        });

        it("GIVEN clearing is activated WHEN redeeming at maturity THEN transaction fails with ClearingIsActivated", async () => {
          await asset.connect(signer_A).activateClearing();

          await expect(
            asset.connect(signer_A).redeemAtMaturityByPartition(signer_C.address, DEFAULT_PARTITION, amount),
          ).to.be.revertedWithCustomError(asset, "ClearingIsActivated");
        });

        it("GIVEN the token is paused WHEN redeeming at maturity THEN transaction fails with IsPaused", async () => {
          await grantRoleAndPauseToken(asset, ATS_ROLES.ROLE_CORPORATE_ACTION, signer_A, signer_B, signer_C.address);

          await expect(
            asset.connect(signer_C).redeemAtMaturityByPartition(signer_C.address, DEFAULT_PARTITION, amount),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });

        it("GIVEN the token holder lacks valid KYC status WHEN redeeming at maturity THEN transaction fails with InvalidKycStatus", async () => {
          await expect(
            asset.connect(signer_A).redeemAtMaturityByPartition(signer_C.address, DEFAULT_PARTITION, amount),
          ).to.be.revertedWithCustomError(asset, "InvalidKycStatus");
        });

        it("GIVEN the current date is before maturity WHEN redeeming at maturity THEN transaction fails with MaturityDateWrong", async () => {
          await expect(
            asset.connect(signer_A).redeemAtMaturityByPartition(signer_A.address, DEFAULT_PARTITION, amount),
          ).to.be.revertedWithCustomError(asset, "MaturityDateInvalid");
        });

        it("GIVEN a recovered wallet WHEN redeeming at maturity THEN transaction fails with WalletRecovered", async () => {
          await asset.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

          await expect(
            asset.connect(signer_A).redeemAtMaturityByPartition(signer_A.address, DEFAULT_PARTITION, amount),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN all conditions are met WHEN redeeming at maturity THEN transaction succeeds and emits RedeemedByPartition", async () => {
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);

          await asset.connect(signer_C).issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: amount,
            data: "0x",
          });

          await asset.changeSystemTimestamp(maturityDate + 1);

          await expect(asset.connect(signer_A).redeemAtMaturityByPartition(signer_A.address, DEFAULT_PARTITION, amount))
            .to.emit(asset, "RedeemedByPartition")
            .withArgs(DEFAULT_PARTITION, signer_A.address, signer_A.address, amount, "0x", "0x");
        });

        it("GIVEN all conditions are met WHEN redeeming zero amount at maturity THEN transaction succeeds but updates no balances", async () => {
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);

          await asset.connect(signer_C).issueByPartition({
            partition: DEFAULT_PARTITION,
            tokenHolder: signer_A.address,
            value: amount,
            data: "0x",
          });

          await asset.changeSystemTimestamp(maturityDate + 1);

          await expect(asset.connect(signer_A).redeemAtMaturityByPartition(signer_A.address, DEFAULT_PARTITION, ZERO))
            .to.emit(asset, "RedeemedByPartition")
            .withArgs(DEFAULT_PARTITION, signer_A.address, signer_A.address, ZERO, "0x", "0x");

          const balance = await asset.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address);
          expect(balance).to.equal(amount);
        });
      });
    });

    describe("Multi Partition", () => {
      beforeEach(async () => {
        await asset.setMultiPartition(true);
      });

      it("GIVEN a new diamond contract with multi-partition WHEN redeemAtMaturityByPartition is called THEN transaction success", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);
        await asset.connect(signer_C).issueByPartition({
          partition: _PARTITION_ID,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await asset.changeSystemTimestamp(maturityDate + 1);

        await expect(asset.connect(signer_A).redeemAtMaturityByPartition(signer_A.address, _PARTITION_ID, amount))
          .to.emit(asset, "RedeemedByPartition")
          .withArgs(_PARTITION_ID, signer_A.address, signer_A.address, amount, "0x", "0x");
      });

      it("GIVEN a new diamond contract with multi-partition and multiple partitions issued WHEN redeemAtMaturityByPartition is called THEN transaction success", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_C.address);
        await asset.connect(signer_C).issueByPartition({
          partition: _PARTITION_ID,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });
        await asset.connect(signer_C).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: amount,
          data: "0x",
        });

        await asset.changeSystemTimestamp(maturityDate + 1);

        await expect(asset.connect(signer_A).redeemAtMaturityByPartition(signer_A.address, _PARTITION_ID, amount))
          .to.emit(asset, "RedeemedByPartition")
          .withArgs(_PARTITION_ID, signer_A.address, signer_A.address, amount, "0x", "0x");
      });
    });

    describe("Deactivated", () => {
      beforeEach(async () => {
        await asset.forceDeactivate();
      });

      it("GIVEN a deactivated asset WHEN redeemAtMaturityByPartition THEN transaction fails with Deactivated", async () => {
        await expect(
          asset.redeemAtMaturityByPartition(ethers.ZeroAddress, ethers.ZeroHash, 0),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeMaturityByPartition", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeMaturityByPartition is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeMaturityByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeMaturityByPartition is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeMaturityByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.maturityByPartition, 1);
      });
    });

    describe("initializeMaturityByPartition event", () => {
      it("GIVEN a fresh deployment WHEN initializeMaturityByPartition is called THEN emits MaturityByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.maturityByPartition);
        await expect(asset.initializeMaturityByPartition()).to.emit(asset, "MaturityByPartitionInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN redeemAtMaturityByPartition THEN reverts with AssetNotOperational", async () => {
        await expect(
          asset.redeemAtMaturityByPartition(ADDRESS_ZERO, DEFAULT_PARTITION, 0),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });
    });
  });
}
