// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { ResolverProxy, type IAsset } from "@contract-types";
import { DEFAULT_PARTITION, ATS_ROLES, TIME_PERIODS_S, ADDRESS_ZERO, ZERO, EMPTY_STRING } from "@scripts";
import { getDltTimestamp, grantRoleAndPauseToken } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployBondTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const numberOfUnits = 1000;
let startingDate = 0;
const numberOfCoupons = 50;
const frequency = TIME_PERIODS_S.DAY;
let maturityDate = 0;
const amount = numberOfUnits;
const _PARTITION_ID = "0x0000000000000000000000000000000000000000000000000000000000000002";

const EMPTY_VC_ID = EMPTY_STRING;

describe("MaturityByPartition Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;

  let asset: IAsset;

  async function deploySecurityFixture(isMultiPartition = false) {
    const base = await deployBondTokenFixture({
      bondDataParams: {
        securityData: {
          isMultiPartition,
        },
        bondDetails: {
          startingDate: startingDate,
          maturityDate: maturityDate,
        },
      },
    });
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;
    signer_D = base.user3;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      {
        role: ATS_ROLES.ROLE_FREEZE_MANAGER,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_PAUSER,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_KYC,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.ROLE_MATURITY_REDEEMER,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_SSI_MANAGER,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_CONTROL_LIST,
        members: [signer_D.address],
      },
      {
        role: ATS_ROLES.ROLE_CLEARING,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_PROTECTED_PARTITIONS,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.ROLE_AGENT,
        members: [signer_A.address],
      },
    ]);

    await asset.connect(signer_A).addIssuer(signer_A.address);

    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  before(async () => {
    const currentTimestamp = await getDltTimestamp();
    startingDate = currentTimestamp + TIME_PERIODS_S.DAY;
    maturityDate = startingDate + numberOfCoupons * frequency;
  });

  beforeEach(async () => {
    await loadFixture(deploySecurityFixture);
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

      it("GIVEN the current date is before maturity WHEN redeeming at maturity THEN transaction fails with BondMaturityDateWrong", async () => {
        await expect(
          asset.connect(signer_A).redeemAtMaturityByPartition(signer_A.address, DEFAULT_PARTITION, amount),
        ).to.be.revertedWithCustomError(asset, "BondMaturityDateWrong");
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
    it("GIVEN a new diamond contract with multi-partition WHEN redeemAtMaturityByPartition is called THEN transaction success", async () => {
      await deploySecurityFixture(true);
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
      await deploySecurityFixture(true);
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
    it("GIVEN a deactivated asset WHEN redeemAtMaturityByPartition THEN transaction fails with Deactivated", async () => {
      const base = await deployBondTokenFixture();
      const deactivatedAsset = await ethers.getContractAt("IAsset", base.diamond.target);
      await deactivatedAsset.connect(base.deployer).grantRole(ATS_ROLES.ROLE_DEACTIVATE, base.deployer.address);
      await deactivatedAsset.connect(base.deployer).deactivate();
      await expect(
        deactivatedAsset.connect(base.deployer).redeemAtMaturityByPartition(ethers.ZeroAddress, ethers.ZeroHash, 0),
      ).to.be.revertedWithCustomError(deactivatedAsset, "Deactivated");
    });
  });

  describe("initializeMaturityByPartition", () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixture);
    });

    it("GIVEN a caller without DEFAULT_ADMIN_ROLE WHEN initializeMaturityByPartition is called THEN it reverts with AccountHasNoRole", async () => {
      await expect(asset.connect(signer_C).initializeMaturityByPartition()).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    describe("when already initialised", () => {
      beforeEach(async () => {
        await asset.connect(signer_A).initializeMaturityByPartition();
      });

      it("GIVEN an already-initialised facet WHEN initializeMaturityByPartition is called again THEN it reverts with FacetAlreadyRegistered", async () => {
        await expect(asset.connect(signer_A).initializeMaturityByPartition()).to.be.revertedWithCustomError(
          asset,
          "FacetAlreadyRegistered",
        );
      });
    });

    it("GIVEN a caller with DEFAULT_ADMIN_ROLE WHEN initializeMaturityByPartition is called THEN it emits MaturityByPartitionInitialized", async () => {
      await expect(asset.connect(signer_A).initializeMaturityByPartition()).to.emit(
        asset,
        "MaturityByPartitionInitialized",
      );
    });
  });
});
