// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { IAsset, type ResolverProxy } from "@contract-types";
import { ADDRESS_ZERO, ATS_ROLES, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO } from "@scripts";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const _AMOUNT = 1000;
const EMPTY_VC_ID = EMPTY_STRING;
const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
const SHORT_EXPIRATION_OFFSET = 120; // 2 minutes

// Fixed base timestamp for deterministic tests — set via time travel in fixture
const BASE_TIMESTAMP = 1_000_000_000;
const EXPIRATION_TIMESTAMP = BASE_TIMESTAMP + ONE_YEAR_IN_SECONDS;
const SHORT_EXPIRATION_TIMESTAMP = BASE_TIMESTAMP + SHORT_EXPIRATION_OFFSET;

enum ClearingOperationType {
  Transfer,
  Redeem,
  HoldCreation,
}

enum ThirdPartyType {
  NULL,
  AUTHORIZED,
  OPERATOR,
}

describe("ClearingByPartitionFacet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let asset: IAsset;

  async function deployFixture() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: false,
          clearingActive: true,
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
      { role: ATS_ROLES.ISSUER_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.PAUSER_ROLE, members: [signer_D.address] },
      { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.CLEARING_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.CLEARING_VALIDATOR_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.PROTECTED_PARTITIONS_ROLE, members: [signer_A.address] },
    ]);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

    await asset.connect(signer_B).issueByPartition({
      partition: _DEFAULT_PARTITION,
      tokenHolder: signer_A.address,
      value: 3 * _AMOUNT,
      data: EMPTY_HEX_BYTES,
    });

    await asset.changeSystemTimestamp(BASE_TIMESTAMP);
  }

  beforeEach(async () => {
    await loadFixture(deployFixture);
  });

  afterEach(async () => {
    await asset.resetSystemTimestamp();
  });

  // ─── clearingRedeemByPartition ─────────────────────────────────────────────

  describe("clearingRedeemByPartition", () => {
    it("GIVEN a token holder with balance WHEN clearingRedeemByPartition THEN balance is locked and clearedAmount increases", async () => {
      const balanceBefore = await asset.balanceOf(signer_A.address);
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };

      await expect(asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT))
        .to.emit(asset, "ClearedRedeemByPartition")
        .withArgs(
          signer_A.address,
          signer_A.address,
          _DEFAULT_PARTITION,
          1,
          _AMOUNT,
          EXPIRATION_TIMESTAMP,
          EMPTY_HEX_BYTES,
          EMPTY_HEX_BYTES,
        );

      expect(await asset.balanceOf(signer_A.address)).to.equal(balanceBefore - BigInt(_AMOUNT));
      expect(await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
    });

    it("GIVEN a paused token WHEN clearingRedeemByPartition THEN reverts with TokenIsPaused", async () => {
      await asset.connect(signer_D).pause();
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN clearing deactivated WHEN clearingRedeemByPartition THEN reverts with ClearingIsDisabled", async () => {
      await asset.connect(signer_A).deactivateClearing();
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT),
      ).to.be.revertedWithCustomError(asset, "ClearingIsDisabled");
    });

    it("GIVEN a recovered sender WHEN clearingRedeemByPartition THEN reverts with WalletRecovered", async () => {
      await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
      await asset.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT),
      ).to.be.revertedWithCustomError(asset, "WalletRecovered");
    });

    it("GIVEN non-default partition WHEN clearingRedeemByPartition THEN reverts with PartitionNotAllowedInSinglePartitionMode", async () => {
      const clearingOperation = {
        partition: _WRONG_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT),
      ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
    });

    it("GIVEN protected partitions without wildcard role WHEN clearingRedeemByPartition THEN reverts with PartitionsAreProtectedAndNoRole", async () => {
      await asset.connect(signer_A).protectPartitions();
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT),
      ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
    });

    it("GIVEN protected partitions with wildcard role WHEN clearingRedeemByPartition THEN succeeds", async () => {
      await asset.connect(signer_A).protectPartitions();
      await asset.grantRole(ATS_ROLES.WILD_CARD_ROLE, signer_A.address);
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT)).to.not.be.reverted;
    });

    it("GIVEN amount exceeds balance WHEN clearingRedeemByPartition THEN reverts with InsufficientBalance", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, 4 * _AMOUNT),
      ).to.be.revertedWithCustomError(asset, "InsufficientBalance");
    });

    it("GIVEN a past expiration timestamp WHEN clearingRedeemByPartition THEN reverts with WrongExpirationTimestamp", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: BASE_TIMESTAMP - 1,
        data: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT),
      ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
    });
  });

  // ─── clearingRedeemFromByPartition ────────────────────────────────────────

  describe("clearingRedeemFromByPartition", () => {
    it("GIVEN a caller with allowance WHEN clearingRedeemFromByPartition THEN balance is locked and allowance consumed", async () => {
      await asset.connect(signer_A).increaseAllowance(signer_B.address, _AMOUNT);
      const balanceBefore = await asset.balanceOf(signer_A.address);
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };

      await expect(asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT))
        .to.emit(asset, "ClearedRedeemFromByPartition")
        .withArgs(
          signer_B.address,
          signer_A.address,
          _DEFAULT_PARTITION,
          1,
          _AMOUNT,
          EXPIRATION_TIMESTAMP,
          EMPTY_HEX_BYTES,
          EMPTY_HEX_BYTES,
        )
        .to.emit(asset, "Transfer")
        .withArgs(signer_A.address, ethers.ZeroAddress, _AMOUNT);

      expect(await asset.balanceOf(signer_A.address)).to.equal(balanceBefore - BigInt(_AMOUNT));
      expect(await asset.allowance(signer_A.address, signer_B.address)).to.equal(0);
      expect(await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
    });

    it("GIVEN a paused token WHEN clearingRedeemFromByPartition THEN reverts with TokenIsPaused", async () => {
      await asset.connect(signer_D).pause();
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN a recovered sender WHEN clearingRedeemFromByPartition THEN reverts with WalletRecovered", async () => {
      await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
      await asset.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT),
      ).to.be.revertedWithCustomError(asset, "WalletRecovered");
    });

    it("GIVEN a recovered from address WHEN clearingRedeemFromByPartition THEN reverts with WalletRecovered", async () => {
      await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
      await asset.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT),
      ).to.be.revertedWithCustomError(asset, "WalletRecovered");
    });

    it("GIVEN clearing deactivated WHEN clearingRedeemFromByPartition THEN reverts with ClearingIsDisabled", async () => {
      await asset.connect(signer_A).deactivateClearing();
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT),
      ).to.be.revertedWithCustomError(asset, "ClearingIsDisabled");
    });

    it("GIVEN non-default partition WHEN clearingRedeemFromByPartition THEN reverts with PartitionNotAllowedInSinglePartitionMode", async () => {
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _WRONG_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT),
      ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
    });

    it("GIVEN protected partitions without wildcard role WHEN clearingRedeemFromByPartition THEN reverts with PartitionsAreProtectedAndNoRole", async () => {
      await asset.connect(signer_A).increaseAllowance(signer_B.address, _AMOUNT);
      await asset.connect(signer_A).protectPartitions();
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT),
      ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
    });

    it("GIVEN protected partitions with wildcard role WHEN clearingRedeemFromByPartition THEN succeeds", async () => {
      await asset.connect(signer_A).increaseAllowance(signer_B.address, _AMOUNT);
      await asset.connect(signer_A).protectPartitions();
      await asset.grantRole(ATS_ROLES.WILD_CARD_ROLE, signer_B.address);
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT)).to.not.be
        .reverted;
    });

    it("GIVEN a zero from address WHEN clearingRedeemFromByPartition THEN reverts with ZeroAddressNotAllowed", async () => {
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: ADDRESS_ZERO,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });

    it("GIVEN no allowance WHEN clearingRedeemFromByPartition THEN reverts with InsufficientAllowance", async () => {
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT),
      ).to.be.revertedWithCustomError(asset, "InsufficientAllowance");
    });

    it("GIVEN amount exceeds balance WHEN clearingRedeemFromByPartition THEN reverts with InsufficientBalance", async () => {
      await asset.connect(signer_A).increaseAllowance(signer_B.address, 4 * _AMOUNT);
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, 4 * _AMOUNT),
      ).to.be.revertedWithCustomError(asset, "InsufficientBalance");
    });

    it("GIVEN a past expiration timestamp WHEN clearingRedeemFromByPartition THEN reverts with WrongExpirationTimestamp", async () => {
      await asset.connect(signer_A).increaseAllowance(signer_B.address, _AMOUNT);
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: BASE_TIMESTAMP - 1,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT),
      ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
    });
  });

  // ─── clearingTransferByPartition ──────────────────────────────────────────

  describe("clearingTransferByPartition", () => {
    it("GIVEN a token holder WHEN clearingTransferByPartition THEN balance is locked and destination not credited yet", async () => {
      const balanceA_before = await asset.balanceOf(signer_A.address);
      const balanceB_before = await asset.balanceOf(signer_B.address);
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };

      await expect(asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address))
        .to.emit(asset, "ClearedTransferByPartition")
        .withArgs(
          signer_A.address,
          signer_A.address,
          signer_B.address,
          _DEFAULT_PARTITION,
          1,
          _AMOUNT,
          EXPIRATION_TIMESTAMP,
          EMPTY_HEX_BYTES,
          EMPTY_HEX_BYTES,
        );

      expect(await asset.balanceOf(signer_A.address)).to.equal(balanceA_before - BigInt(_AMOUNT));
      expect(await asset.balanceOf(signer_B.address)).to.equal(balanceB_before);
      expect(await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
    });

    it("GIVEN a paused token WHEN clearingTransferByPartition THEN reverts with TokenIsPaused", async () => {
      await asset.connect(signer_D).pause();
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN clearing deactivated WHEN clearingTransferByPartition THEN reverts with ClearingIsDisabled", async () => {
      await asset.connect(signer_A).deactivateClearing();
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address),
      ).to.be.revertedWithCustomError(asset, "ClearingIsDisabled");
    });

    it("GIVEN zero address destination WHEN clearingTransferByPartition THEN reverts with ZeroAddressNotAllowed", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, ADDRESS_ZERO),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });

    it("GIVEN a recovered sender WHEN clearingTransferByPartition THEN reverts with WalletRecovered", async () => {
      await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
      await asset.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address),
      ).to.be.revertedWithCustomError(asset, "WalletRecovered");
    });

    it("GIVEN a recovered destination WHEN clearingTransferByPartition THEN reverts with WalletRecovered", async () => {
      await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
      await asset.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address),
      ).to.be.revertedWithCustomError(asset, "WalletRecovered");
    });

    it("GIVEN non-default partition WHEN clearingTransferByPartition THEN reverts with PartitionNotAllowedInSinglePartitionMode", async () => {
      const clearingOperation = {
        partition: _WRONG_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address),
      ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
    });

    it("GIVEN protected partitions without wildcard role WHEN clearingTransferByPartition THEN reverts with PartitionsAreProtectedAndNoRole", async () => {
      await asset.connect(signer_A).protectPartitions();
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address),
      ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
    });

    it("GIVEN protected partitions with wildcard role WHEN clearingTransferByPartition THEN succeeds", async () => {
      await asset.connect(signer_A).protectPartitions();
      await asset.grantRole(ATS_ROLES.WILD_CARD_ROLE, signer_A.address);
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address)).to
        .not.be.reverted;
    });

    it("GIVEN amount exceeds balance WHEN clearingTransferByPartition THEN reverts with InsufficientBalance", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_A).clearingTransferByPartition(clearingOperation, 4 * _AMOUNT, signer_B.address),
      ).to.be.revertedWithCustomError(asset, "InsufficientBalance");
    });

    it("GIVEN a past expiration timestamp WHEN clearingTransferByPartition THEN reverts with WrongExpirationTimestamp", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: BASE_TIMESTAMP - 1,
        data: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address),
      ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
    });
  });

  // ─── clearingTransferFromByPartition ──────────────────────────────────────

  describe("clearingTransferFromByPartition", () => {
    it("GIVEN a caller with allowance WHEN clearingTransferFromByPartition THEN balance locked, destination not credited, allowance consumed", async () => {
      await asset.connect(signer_A).increaseAllowance(signer_B.address, _AMOUNT);
      const balanceA_before = await asset.balanceOf(signer_A.address);
      const balanceC_before = await asset.balanceOf(signer_C.address);
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };

      await expect(
        asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
      )
        .to.emit(asset, "ClearedTransferFromByPartition")
        .withArgs(
          signer_B.address,
          signer_A.address,
          signer_C.address,
          _DEFAULT_PARTITION,
          1,
          _AMOUNT,
          EXPIRATION_TIMESTAMP,
          EMPTY_HEX_BYTES,
          EMPTY_HEX_BYTES,
        );

      expect(await asset.balanceOf(signer_A.address)).to.equal(balanceA_before - BigInt(_AMOUNT));
      expect(await asset.balanceOf(signer_C.address)).to.equal(balanceC_before);
      expect(await asset.allowance(signer_A.address, signer_B.address)).to.equal(0);
      expect(await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
    });

    it("GIVEN a paused token WHEN clearingTransferFromByPartition THEN reverts with TokenIsPaused", async () => {
      await asset.connect(signer_D).pause();
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN clearing deactivated WHEN clearingTransferFromByPartition THEN reverts with ClearingIsDisabled", async () => {
      await asset.connect(signer_A).deactivateClearing();
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
      ).to.be.revertedWithCustomError(asset, "ClearingIsDisabled");
    });

    it("GIVEN a recovered sender WHEN clearingTransferFromByPartition THEN reverts with WalletRecovered", async () => {
      await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
      await asset.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
      ).to.be.revertedWithCustomError(asset, "WalletRecovered");
    });

    it("GIVEN a recovered destination WHEN clearingTransferFromByPartition THEN reverts with WalletRecovered", async () => {
      await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
      await asset.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
      ).to.be.revertedWithCustomError(asset, "WalletRecovered");
    });

    it("GIVEN a recovered from address WHEN clearingTransferFromByPartition THEN reverts with WalletRecovered", async () => {
      await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
      await asset.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
      ).to.be.revertedWithCustomError(asset, "WalletRecovered");
    });

    it("GIVEN non-default partition WHEN clearingTransferFromByPartition THEN reverts with PartitionNotAllowedInSinglePartitionMode", async () => {
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _WRONG_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
      ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
    });

    it("GIVEN protected partitions without wildcard role WHEN clearingTransferFromByPartition THEN reverts with PartitionsAreProtectedAndNoRole", async () => {
      await asset.connect(signer_A).increaseAllowance(signer_B.address, _AMOUNT);
      await asset.connect(signer_A).protectPartitions();
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
      ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
    });

    it("GIVEN protected partitions with wildcard role WHEN clearingTransferFromByPartition THEN succeeds", async () => {
      await asset.connect(signer_A).increaseAllowance(signer_B.address, _AMOUNT);
      await asset.connect(signer_A).protectPartitions();
      await asset.grantRole(ATS_ROLES.WILD_CARD_ROLE, signer_B.address);
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
      ).to.not.be.reverted;
    });

    it("GIVEN a zero from address WHEN clearingTransferFromByPartition THEN reverts with ZeroAddressNotAllowed", async () => {
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: ADDRESS_ZERO,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });

    it("GIVEN a zero destination WHEN clearingTransferFromByPartition THEN reverts with ZeroAddressNotAllowed", async () => {
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, ADDRESS_ZERO),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });

    it("GIVEN no allowance WHEN clearingTransferFromByPartition THEN reverts with InsufficientAllowance", async () => {
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
      ).to.be.revertedWithCustomError(asset, "InsufficientAllowance");
    });

    it("GIVEN amount exceeds balance WHEN clearingTransferFromByPartition THEN reverts with InsufficientBalance", async () => {
      await asset.connect(signer_A).increaseAllowance(signer_B.address, 4 * _AMOUNT);
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, 4 * _AMOUNT, signer_C.address),
      ).to.be.revertedWithCustomError(asset, "InsufficientBalance");
    });

    it("GIVEN a past expiration timestamp WHEN clearingTransferFromByPartition THEN reverts with WrongExpirationTimestamp", async () => {
      await asset.connect(signer_A).increaseAllowance(signer_B.address, _AMOUNT);
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: BASE_TIMESTAMP - 1,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };
      await expect(
        asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
      ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
    });
  });

  // ─── approveClearingOperationByPartition ──────────────────────────────────

  describe("approveClearingOperationByPartition", () => {
    it("GIVEN a pending transfer clearing WHEN approveClearingOperationByPartition THEN balances updated and clearedAmount zeroed", async () => {
      const balanceA_before = await asset.balanceOf(signer_A.address);
      const balanceB_before = await asset.balanceOf(signer_B.address);
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address);

      const identifier = {
        clearingOperationType: ClearingOperationType.Transfer,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };

      await expect(asset.connect(signer_A).approveClearingOperationByPartition(identifier))
        .to.emit(asset, "ClearingOperationApproved")
        .withArgs(signer_A.address, signer_A.address, _DEFAULT_PARTITION, 1, ClearingOperationType.Transfer, "0x")
        .to.emit(asset, "Transfer")
        .withArgs(ethers.ZeroAddress, signer_B.address, _AMOUNT);

      expect(await asset.balanceOf(signer_A.address)).to.equal(balanceA_before - BigInt(_AMOUNT));
      expect(await asset.balanceOf(signer_B.address)).to.equal(balanceB_before + BigInt(_AMOUNT));
      expect(await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
    });

    it("GIVEN a pending redeem clearing WHEN approveClearingOperationByPartition THEN balance stays reduced and clearedAmount zeroed", async () => {
      const balanceBefore = await asset.balanceOf(signer_A.address);
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);

      expect(await asset.balanceOf(signer_A.address)).to.equal(balanceBefore - BigInt(_AMOUNT));
      expect(await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);

      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };

      await expect(asset.connect(signer_A).approveClearingOperationByPartition(identifier))
        .to.emit(asset, "ClearingOperationApproved")
        .withArgs(signer_A.address, signer_A.address, _DEFAULT_PARTITION, 1, ClearingOperationType.Redeem, "0x");

      expect(await asset.balanceOf(signer_A.address)).to.equal(balanceBefore - BigInt(_AMOUNT));
      expect(await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
    });

    it("GIVEN a paused token WHEN approveClearingOperationByPartition THEN reverts with TokenIsPaused", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
      await asset.connect(signer_D).pause();
      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };
      await expect(
        asset.connect(signer_A).approveClearingOperationByPartition(identifier),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN no CLEARING_VALIDATOR_ROLE WHEN approveClearingOperationByPartition THEN reverts with AccountHasNoRole", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };
      await expect(
        asset.connect(signer_B).approveClearingOperationByPartition(identifier),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN clearing deactivated WHEN approveClearingOperationByPartition THEN reverts with ClearingIsDisabled", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
      await asset.connect(signer_A).deactivateClearing();
      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };
      await expect(
        asset.connect(signer_A).approveClearingOperationByPartition(identifier),
      ).to.be.revertedWithCustomError(asset, "ClearingIsDisabled");
    });

    it("GIVEN non-default partition WHEN approveClearingOperationByPartition THEN reverts with PartitionNotAllowedInSinglePartitionMode", async () => {
      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _WRONG_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };
      await expect(
        asset.connect(signer_A).approveClearingOperationByPartition(identifier),
      ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
    });

    it("GIVEN an expired clearing WHEN approveClearingOperationByPartition THEN reverts with ExpirationDateReached", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: SHORT_EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address);
      await asset.changeSystemTimestamp(SHORT_EXPIRATION_TIMESTAMP + 1);
      const identifier = {
        clearingOperationType: ClearingOperationType.Transfer,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };
      await expect(
        asset.connect(signer_A).approveClearingOperationByPartition(identifier),
      ).to.be.revertedWithCustomError(asset, "ExpirationDateReached");
    });

    it("GIVEN wrong clearingId WHEN approveClearingOperationByPartition THEN reverts with WrongClearingId", async () => {
      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 9999,
      };
      await expect(
        asset.connect(signer_A).approveClearingOperationByPartition(identifier),
      ).to.be.revertedWithCustomError(asset, "WrongClearingId");
    });
  });

  // ─── cancelClearingOperationByPartition ───────────────────────────────────

  describe("cancelClearingOperationByPartition", () => {
    it("GIVEN a pending clearing WHEN cancelClearingOperationByPartition THEN balance restored and clearedAmount zeroed", async () => {
      const balanceBefore = await asset.balanceOf(signer_A.address);
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);

      expect(await asset.balanceOf(signer_A.address)).to.equal(balanceBefore - BigInt(_AMOUNT));
      expect(await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);

      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };

      await expect(asset.connect(signer_A).cancelClearingOperationByPartition(identifier))
        .to.emit(asset, "ClearingOperationCanceled")
        .withArgs(signer_A.address, signer_A.address, _DEFAULT_PARTITION, 1, ClearingOperationType.Redeem)
        .to.emit(asset, "Transfer")
        .withArgs(ethers.ZeroAddress, signer_A.address, _AMOUNT);

      expect(await asset.balanceOf(signer_A.address)).to.equal(balanceBefore);
      expect(await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
    });

    it("GIVEN a paused token WHEN cancelClearingOperationByPartition THEN reverts with TokenIsPaused", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
      await asset.connect(signer_D).pause();
      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };
      await expect(
        asset.connect(signer_A).cancelClearingOperationByPartition(identifier),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN no CLEARING_VALIDATOR_ROLE WHEN cancelClearingOperationByPartition THEN reverts with AccountHasNoRole", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };
      await expect(
        asset.connect(signer_B).cancelClearingOperationByPartition(identifier),
      ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
    });

    it("GIVEN clearing deactivated WHEN cancelClearingOperationByPartition THEN reverts with ClearingIsDisabled", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
      await asset.connect(signer_A).deactivateClearing();
      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };
      await expect(
        asset.connect(signer_A).cancelClearingOperationByPartition(identifier),
      ).to.be.revertedWithCustomError(asset, "ClearingIsDisabled");
    });

    it("GIVEN non-default partition WHEN cancelClearingOperationByPartition THEN reverts with PartitionNotAllowedInSinglePartitionMode", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _WRONG_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };
      await expect(
        asset.connect(signer_A).cancelClearingOperationByPartition(identifier),
      ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
    });

    it("GIVEN wrong clearingId WHEN cancelClearingOperationByPartition THEN reverts with WrongClearingId", async () => {
      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 9999,
      };
      await expect(
        asset.connect(signer_A).cancelClearingOperationByPartition(identifier),
      ).to.be.revertedWithCustomError(asset, "WrongClearingId");
    });

    it("GIVEN an expired clearing WHEN cancelClearingOperationByPartition THEN reverts with ExpirationDateReached", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: SHORT_EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
      await asset.changeSystemTimestamp(SHORT_EXPIRATION_TIMESTAMP + 1);
      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };
      await expect(
        asset.connect(signer_A).cancelClearingOperationByPartition(identifier),
      ).to.be.revertedWithCustomError(asset, "ExpirationDateReached");
    });
  });

  // ─── bug Transfer: clearingRedeemByPartition ────────────────────────────────

  describe("bug Transfer: clearingRedeemByPartition", () => {
    it("GIVEN a holder WHEN clearingRedeemByPartition THEN Transfer event is emitted", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT))
        .to.emit(asset, "Transfer")
        .withArgs(signer_A.address, ethers.ZeroAddress, _AMOUNT);
    });
  });

  // ─── bug Transfer: operatorClearingRedeemByPartition ─────────────────────────

  describe("bug Transfer: operatorClearingRedeemByPartition", () => {
    it("GIVEN an authorized operator WHEN operatorClearingRedeemByPartition THEN Transfer event is emitted", async () => {
      await asset.connect(signer_A).authorizeOperator(signer_B.address);
      await expect(
        asset.connect(signer_B).operatorClearingRedeemByPartition(
          {
            clearingOperation: {
              partition: _DEFAULT_PARTITION,
              expirationTimestamp: EXPIRATION_TIMESTAMP,
              data: EMPTY_HEX_BYTES,
            },
            from: signer_A.address,
            operatorData: EMPTY_HEX_BYTES,
          },
          _AMOUNT,
        ),
      )
        .to.emit(asset, "Transfer")
        .withArgs(signer_A.address, ethers.ZeroAddress, _AMOUNT);
    });
  });

  // ─── bug Transfer: clearingRedeemFromByPartition ───────────────────────────

  describe("bug Transfer: clearingRedeemFromByPartition", () => {
    it("GIVEN a caller with allowance WHEN clearingRedeemFromByPartition THEN Transfer event is emitted", async () => {
      await asset.connect(signer_A).increaseAllowance(signer_B.address, _AMOUNT);
      const clearingOperationFrom = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        operatorData: EMPTY_HEX_BYTES,
      };

      await expect(asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT))
        .to.emit(asset, "Transfer")
        .withArgs(signer_A.address, ethers.ZeroAddress, _AMOUNT);
    });
  });

  // ─── bug Transfer: protectedClearingRedeemByPartition ──────────────────────

  describe("bug Transfer: protectedClearingRedeemByPartition", () => {
    it("GIVEN a holder with valid signature WHEN protectedClearingRedeemByPartition THEN Transfer event is emitted", async () => {
      await asset.connect(signer_A).protectPartitions();

      const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "bytes32"],
        [ATS_ROLES.PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
      );
      const packedDataWithoutPrefix = packedData.slice(2);
      const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
      await asset.grantRole(protectedPartitionRole, signer_A.address);

      const nonce = Number(await asset.nonces(signer_A.address)) + 1;

      const protectedClearingOperation = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        deadline: EXPIRATION_TIMESTAMP,
        nonce: nonce,
      };

      // Prepare EIP-712 domain
      const name = (await asset.getERC20Metadata()).info.name;
      const version = (await asset.getConfigInfo()).version_.toString();
      const chainId = await network.provider.send("eth_chainId");

      const domain = {
        name: name,
        version: version,
        chainId: parseInt(chainId, 16),
        verifyingContract: diamond.target.toString(),
      };

      const types = {
        ClearingOperation: [
          { name: "partition", type: "bytes32" },
          { name: "expirationTimestamp", type: "uint256" },
          { name: "data", type: "bytes" },
        ],
        ProtectedClearingOperation: [
          { name: "clearingOperation", type: "ClearingOperation" },
          { name: "from", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
        protectedClearingRedeemByPartition: [
          {
            name: "_protectedClearingOperation",
            type: "ProtectedClearingOperation",
          },
          { name: "_amount", type: "uint256" },
        ],
      };

      const message = {
        _protectedClearingOperation: protectedClearingOperation,
        _amount: _AMOUNT,
      };

      const signature = await signer_A.signTypedData(domain, types, message);

      await expect(
        asset.connect(signer_A).protectedClearingRedeemByPartition(protectedClearingOperation, _AMOUNT, signature),
      )
        .to.emit(asset, "Transfer")
        .withArgs(signer_A.address, ethers.ZeroAddress, _AMOUNT);
    });
  });

  // ─── bug Transfer: reclaimClearingOperationByPartition ─────────────────────

  describe("reclaimClearingOperationByPartition", () => {
    it("GIVEN an expired clearing WHEN reclaimClearingOperationByPartition THEN balance restored and clearedAmount zeroed", async () => {
      const balanceBefore = await asset.balanceOf(signer_A.address);
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: SHORT_EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);

      expect(await asset.balanceOf(signer_A.address)).to.equal(balanceBefore - BigInt(_AMOUNT));
      expect(await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);

      await asset.changeSystemTimestamp(SHORT_EXPIRATION_TIMESTAMP + 1);

      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };

      await expect(asset.connect(signer_A).reclaimClearingOperationByPartition(identifier))
        .to.emit(asset, "ClearingOperationReclaimed")
        .withArgs(signer_A.address, signer_A.address, _DEFAULT_PARTITION, 1, ClearingOperationType.Redeem)
        .to.emit(asset, "Transfer")
        .withArgs(ethers.ZeroAddress, signer_A.address, _AMOUNT);

      expect(await asset.balanceOf(signer_A.address)).to.equal(balanceBefore);
      expect(await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
    });

    it("GIVEN a paused token WHEN reclaimClearingOperationByPartition THEN reverts with TokenIsPaused", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: SHORT_EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
      await asset.changeSystemTimestamp(SHORT_EXPIRATION_TIMESTAMP + 1);
      await asset.connect(signer_D).pause();
      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };
      await expect(
        asset.connect(signer_A).reclaimClearingOperationByPartition(identifier),
      ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN clearing deactivated WHEN reclaimClearingOperationByPartition THEN reverts with ClearingIsDisabled", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: SHORT_EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
      await asset.changeSystemTimestamp(SHORT_EXPIRATION_TIMESTAMP + 1);
      await asset.connect(signer_A).deactivateClearing();
      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };
      await expect(
        asset.connect(signer_A).reclaimClearingOperationByPartition(identifier),
      ).to.be.revertedWithCustomError(asset, "ClearingIsDisabled");
    });

    it("GIVEN non-default partition WHEN reclaimClearingOperationByPartition THEN reverts with PartitionNotAllowedInSinglePartitionMode", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: SHORT_EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
      await asset.changeSystemTimestamp(SHORT_EXPIRATION_TIMESTAMP + 1);
      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _WRONG_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };
      await expect(
        asset.connect(signer_A).reclaimClearingOperationByPartition(identifier),
      ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
    });

    it("GIVEN a non-expired clearing WHEN reclaimClearingOperationByPartition THEN reverts with ExpirationDateNotReached", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      };
      await expect(
        asset.connect(signer_A).reclaimClearingOperationByPartition(identifier),
      ).to.be.revertedWithCustomError(asset, "ExpirationDateNotReached");
    });

    it("GIVEN wrong clearingId WHEN reclaimClearingOperationByPartition THEN reverts with WrongClearingId", async () => {
      const identifier = {
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 9999,
      };
      await expect(
        asset.connect(signer_A).reclaimClearingOperationByPartition(identifier),
      ).to.be.revertedWithCustomError(asset, "WrongClearingId");
    });
  });

  // ─── Read functions ────────────────────────────────────────────────────────

  describe("getClearingRedeemForByPartition", () => {
    it("GIVEN a pending redeem clearing WHEN getClearingRedeemForByPartition THEN returns correct data", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);

      const data = await asset.getClearingRedeemForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);
      expect(data.amount).to.equal(_AMOUNT);
      expect(data.expirationTimestamp).to.equal(EXPIRATION_TIMESTAMP);
      expect(data.operatorType).to.equal(ThirdPartyType.NULL);
    });
  });

  describe("getClearingTransferForByPartition", () => {
    it("GIVEN a pending transfer clearing WHEN getClearingTransferForByPartition THEN returns correct data", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address);

      const data = await asset.getClearingTransferForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);
      expect(data.amount).to.equal(_AMOUNT);
      expect(data.destination).to.equal(signer_B.address);
      expect(data.expirationTimestamp).to.equal(EXPIRATION_TIMESTAMP);
      expect(data.operatorType).to.equal(ThirdPartyType.NULL);
    });
  });

  describe("getClearedAmountForByPartition", () => {
    it("GIVEN a pending redeem clearing WHEN getClearedAmountForByPartition THEN returns locked amount", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
      expect(await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(_AMOUNT);
    });

    it("GIVEN no pending clearings WHEN getClearedAmountForByPartition THEN returns zero", async () => {
      expect(await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
    });

    it("GIVEN a cleared operation WHEN getClearedAmountForByPartition after approve THEN returns zero", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
      await asset.connect(signer_A).approveClearingOperationByPartition({
        clearingOperationType: ClearingOperationType.Redeem,
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        clearingId: 1,
      });
      expect(await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address)).to.equal(0);
    });
  });

  describe("getClearingCountForByPartition", () => {
    it("GIVEN two pending redeem clearings WHEN getClearingCountForByPartition THEN returns 2", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT / 2);
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT / 4);
      expect(
        await asset.getClearingCountForByPartition(_DEFAULT_PARTITION, signer_A.address, ClearingOperationType.Redeem),
      ).to.equal(2);
    });

    it("GIVEN no clearings WHEN getClearingCountForByPartition THEN returns 0", async () => {
      expect(
        await asset.getClearingCountForByPartition(_DEFAULT_PARTITION, signer_A.address, ClearingOperationType.Redeem),
      ).to.equal(0);
    });
  });

  describe("getClearingsIdForByPartition", () => {
    it("GIVEN multiple pending clearings WHEN getClearingsIdForByPartition with pagination THEN returns correct ids", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT / 4);
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT / 4);
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT / 4);

      const page1 = await asset.getClearingsIdForByPartition(
        _DEFAULT_PARTITION,
        signer_A.address,
        ClearingOperationType.Redeem,
        0,
        2,
      );
      expect(page1.length).to.equal(2);
      expect(page1[0]).to.equal(1);
      expect(page1[1]).to.equal(2);

      const page2 = await asset.getClearingsIdForByPartition(
        _DEFAULT_PARTITION,
        signer_A.address,
        ClearingOperationType.Redeem,
        1,
        2,
      );
      expect(page2.length).to.equal(1);
      expect(page2[0]).to.equal(3);
    });
  });

  // ─── bug Transfer: clearing transfer functions to ZeroAddress ─────────────────

  describe("bug Transfer", () => {
    it("A1: GIVEN a holder WHEN clearingTransferByPartition THEN Transfer to ZeroAddress", async () => {
      const clearingOperation = {
        partition: _DEFAULT_PARTITION,
        expirationTimestamp: EXPIRATION_TIMESTAMP,
        data: EMPTY_HEX_BYTES,
      };
      await expect(asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address))
        .to.emit(asset, "Transfer")
        .withArgs(signer_A.address, ethers.ZeroAddress, _AMOUNT);
    });

    it("A2: GIVEN a caller with allowance WHEN clearingTransferFromByPartition THEN Transfer to ZeroAddress", async () => {
      await asset.connect(signer_A).increaseAllowance(signer_B.address, _AMOUNT);
      await expect(
        asset.connect(signer_B).clearingTransferFromByPartition(
          {
            clearingOperation: {
              partition: _DEFAULT_PARTITION,
              expirationTimestamp: EXPIRATION_TIMESTAMP,
              data: EMPTY_HEX_BYTES,
            },
            from: signer_A.address,
            operatorData: EMPTY_HEX_BYTES,
          },
          _AMOUNT,
          signer_C.address,
        ),
      )
        .to.emit(asset, "Transfer")
        .withArgs(signer_A.address, ethers.ZeroAddress, _AMOUNT);
    });

    it("A3: GIVEN an authorized operator WHEN operatorClearingTransferByPartition THEN Transfer to ZeroAddress", async () => {
      await asset.connect(signer_A).authorizeOperator(signer_B.address);
      await expect(
        asset.connect(signer_B).operatorClearingTransferByPartition(
          {
            clearingOperation: {
              partition: _DEFAULT_PARTITION,
              expirationTimestamp: EXPIRATION_TIMESTAMP,
              data: EMPTY_HEX_BYTES,
            },
            from: signer_A.address,
            operatorData: EMPTY_HEX_BYTES,
          },
          _AMOUNT,
          signer_C.address,
        ),
      )
        .to.emit(asset, "Transfer")
        .withArgs(signer_A.address, ethers.ZeroAddress, _AMOUNT);
    });

    it("A4: GIVEN a holder with valid signature WHEN protectedClearingTransferByPartition THEN Transfer to ZeroAddress", async () => {
      await asset.connect(signer_A).protectPartitions();

      const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "bytes32"],
        [ATS_ROLES.PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
      );
      const packedDataWithoutPrefix = packedData.slice(2);
      const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
      await asset.grantRole(protectedPartitionRole, signer_A.address);

      const nonce = Number(await asset.nonces(signer_A.address)) + 1;

      const protectedClearingOperation = {
        clearingOperation: {
          partition: _DEFAULT_PARTITION,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          data: EMPTY_HEX_BYTES,
        },
        from: signer_A.address,
        deadline: EXPIRATION_TIMESTAMP,
        nonce: nonce,
      };

      const name = (await asset.getERC20Metadata()).info.name;
      const version = (await asset.getConfigInfo()).version_.toString();
      const chainId = await network.provider.send("eth_chainId");

      const domain = {
        name: name,
        version: version,
        chainId: parseInt(chainId, 16),
        verifyingContract: diamond.target.toString(),
      };

      const types = {
        ClearingOperation: [
          { name: "partition", type: "bytes32" },
          { name: "expirationTimestamp", type: "uint256" },
          { name: "data", type: "bytes" },
        ],
        ProtectedClearingOperation: [
          { name: "clearingOperation", type: "ClearingOperation" },
          { name: "from", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
        protectedClearingTransferByPartition: [
          {
            name: "_protectedClearingOperation",
            type: "ProtectedClearingOperation",
          },
          { name: "_amount", type: "uint256" },
          { name: "_to", type: "address" },
        ],
      };

      const message = {
        _protectedClearingOperation: protectedClearingOperation,
        _amount: _AMOUNT,
        _to: signer_C.address,
      };

      const signature = await signer_A.signTypedData(domain, types, message);

      await expect(
        asset
          .connect(signer_A)
          .protectedClearingTransferByPartition(protectedClearingOperation, _AMOUNT, signer_C.address, signature),
      )
        .to.emit(asset, "Transfer")
        .withArgs(signer_A.address, ethers.ZeroAddress, _AMOUNT);
    });
  });
});
