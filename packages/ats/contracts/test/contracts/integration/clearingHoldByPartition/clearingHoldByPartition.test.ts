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
const _DATA = "0x1234";
const EMPTY_VC_ID = EMPTY_STRING;

interface ClearingOperation {
  partition: string;
  expirationTimestamp: number;
  data: string;
}

interface ClearingOperationFrom {
  clearingOperation: ClearingOperation;
  from: string;
  operatorData: string;
}

interface Hold {
  amount: bigint;
  expirationTimestamp: bigint;
  escrow: string;
  to: string;
  data: string;
}

let clearingOperation: ClearingOperation;
let clearingOperationFrom: ClearingOperationFrom;
let hold: Hold;

describe("ClearingHoldByPartitionFacet Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;

  let asset: IAsset;

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  let currentTimestamp = 0;
  let expirationTimestamp = 0;

  async function setFacets(asset: IAsset) {
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

    await asset.connect(signer_B).issueByPartition({
      partition: _DEFAULT_PARTITION,
      tokenHolder: signer_B.address,
      value: 3 * _AMOUNT,
      data: EMPTY_HEX_BYTES,
    });
  }

  async function deploySecurityFixtureSinglePartition() {
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
    signer_E = base.user4;

    asset = await ethers.getContractAt("IAsset", diamond.target);

    await executeRbac(asset, [
      { role: ATS_ROLES.ISSUER_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.CONTROLLER_ROLE, members: [signer_C.address] },
      { role: ATS_ROLES.PAUSER_ROLE, members: [signer_D.address] },
      { role: ATS_ROLES.CONTROL_LIST_ROLE, members: [signer_E.address] },
      { role: ATS_ROLES.KYC_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.SSI_MANAGER_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.CLEARING_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.CLEARING_VALIDATOR_ROLE, members: [signer_A.address] },
      { role: ATS_ROLES.PROTECTED_PARTITIONS_ROLE, members: [signer_B.address] },
      { role: ATS_ROLES.AGENT_ROLE, members: [signer_A.address] },
    ]);

    await setFacets(asset);
  }

  beforeEach(async () => {
    const block = await ethers.provider.getBlock("latest");
    if (!block) throw new Error("Failed to get latest block");
    currentTimestamp = block.timestamp;
    expirationTimestamp = currentTimestamp + ONE_YEAR_IN_SECONDS;
    [signer_A, signer_B, signer_C, signer_D, signer_E] = await ethers.getSigners();
    hold = {
      amount: BigInt(_AMOUNT),
      expirationTimestamp: BigInt(expirationTimestamp),
      escrow: signer_B.address,
      to: signer_C.address,
      data: _DATA,
    };

    clearingOperation = {
      partition: _DEFAULT_PARTITION,
      expirationTimestamp,
      data: _DATA,
    };

    clearingOperationFrom = {
      clearingOperation,
      from: signer_A.address,
      operatorData: _DATA,
    };
  });

  afterEach(async () => {
    await asset.resetSystemTimestamp();
  });

  describe("Single Partition", async () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // clearingCreateHoldByPartition
    // ─────────────────────────────────────────────────────────────────────────

    describe("clearingCreateHoldByPartition", () => {
      it("GIVEN a Token WHEN creating clearing hold THEN transaction succeeds and emits ClearedHoldByPartition", async () => {
        await expect(asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold))
          .to.emit(asset, "ClearedHoldByPartition")
          .withArgs(
            signer_A.address,
            signer_A.address,
            clearingOperation.partition,
            1,
            Object.values(hold),
            clearingOperation.expirationTimestamp,
            clearingOperation.data,
            EMPTY_HEX_BYTES,
          );

        const clearing = await asset.getClearingCreateHoldForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);
        expect(clearing.amount).to.equal(_AMOUNT);
        expect(clearing.holdTo).to.equal(hold.to);
        expect(clearing.holdEscrow).to.equal(hold.escrow);
      });

      it("GIVEN a Token WHEN creating clearing hold with amount 1 THEN transaction succeeds", async () => {
        const minimalHold = { ...hold, amount: 1n };
        await expect(asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, minimalHold)).to.emit(
          asset,
          "ClearedHoldByPartition",
        );
        const clearing = await asset.getClearingCreateHoldForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);
        expect(clearing.amount).to.equal(1);
      });

      describe("onlyUnpaused modifier", () => {
        it("GIVEN a paused Token WHEN clearingCreateHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
          await asset.connect(signer_D).pause();
          await expect(
            asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold),
          ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
        });
      });

      describe("onlyClearingActivated modifier", () => {
        it("GIVEN clearing deactivated WHEN clearingCreateHoldByPartition THEN transaction fails with ClearingIsDisabled", async () => {
          await asset.connect(signer_A).deactivateClearing();
          await expect(
            asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold),
          ).to.be.revertedWithCustomError(asset, "ClearingIsDisabled");
        });
      });

      describe("onlyWithValidExpirationTimestamp modifier", () => {
        it("GIVEN an expired clearing expirationTimestamp WHEN clearingCreateHoldByPartition THEN transaction fails with WrongExpirationTimestamp", async () => {
          const wrongExpirationTimestamp = currentTimestamp - 1;
          await asset.changeSystemTimestamp(currentTimestamp);

          const clearingOperation_wrong = { ...clearingOperation, expirationTimestamp: wrongExpirationTimestamp };
          await expect(
            asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation_wrong, hold),
          ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
        });

        it("GIVEN an expired hold expirationTimestamp WHEN clearingCreateHoldByPartition THEN transaction fails with WrongExpirationTimestamp", async () => {
          const wrongExpirationTimestamp = currentTimestamp - 1;
          await asset.changeSystemTimestamp(currentTimestamp);

          const hold_wrong = { ...hold, expirationTimestamp: BigInt(wrongExpirationTimestamp) };
          await expect(
            asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold_wrong),
          ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
        });
      });

      describe("notZeroAddress modifier", () => {
        it("GIVEN a zero escrow address WHEN clearingCreateHoldByPartition THEN transaction fails with ZeroAddressNotAllowed", async () => {
          const hold_wrong = { ...hold, escrow: ADDRESS_ZERO };
          await expect(
            asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold_wrong),
          ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
        });
      });

      describe("onlyDefaultPartitionWithSinglePartition modifier", () => {
        it("GIVEN a wrong partition in single-partition mode WHEN clearingCreateHoldByPartition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
          const clearingOperation_wrong = { ...clearingOperation, partition: _WRONG_PARTITION };
          await expect(
            asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation_wrong, hold),
          ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
        });
      });

      describe("onlyUnProtectedPartitionsOrWildCardRole modifier", () => {
        it("GIVEN protected partitions without wildcard role WHEN clearingCreateHoldByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
          await asset.connect(signer_B).protectPartitions();
          await expect(
            asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold),
          ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        });

        it("GIVEN protected partitions with wildcard role WHEN clearingCreateHoldByPartition THEN transaction succeeds", async () => {
          await asset.connect(signer_B).protectPartitions();
          await asset.grantRole(ATS_ROLES.WILD_CARD_ROLE, signer_A.address);
          await expect(asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold)).to.not.be
            .reverted;
        });
      });

      describe("onlyUnrecoveredAddress modifier", () => {
        it("GIVEN a recovered msgSender WHEN calling clearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);
          await expect(
            asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN a recovered hold.to address WHEN calling clearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);
          await expect(
            asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });
      });

      describe("InsufficientBalance", () => {
        it("GIVEN amount bigger than balance WHEN clearingCreateHoldByPartition THEN transaction fails with InsufficientBalance", async () => {
          const hold_wrong = { ...hold, amount: BigInt(4 * _AMOUNT) };
          await expect(
            asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold_wrong),
          ).to.be.revertedWithCustomError(asset, "InsufficientBalance");
        });
      });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // clearingCreateHoldFromByPartition
    // ─────────────────────────────────────────────────────────────────────────

    describe("clearingCreateHoldFromByPartition", () => {
      it("GIVEN an approved third party WHEN clearingCreateHoldFromByPartition THEN transaction succeeds and emits ClearedHoldFromByPartition", async () => {
        await asset.connect(signer_A).increaseAllowance(signer_B.address, _AMOUNT);

        await expect(asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold))
          .to.emit(asset, "ClearedHoldFromByPartition")
          .withArgs(
            signer_B.address,
            clearingOperationFrom.from,
            clearingOperationFrom.clearingOperation.partition,
            1,
            Object.values(hold),
            clearingOperationFrom.clearingOperation.expirationTimestamp,
            clearingOperationFrom.clearingOperation.data,
            clearingOperationFrom.operatorData,
          );

        const clearing = await asset.getClearingCreateHoldForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);
        expect(clearing.amount).to.equal(_AMOUNT);
        expect(clearing.holdTo).to.equal(hold.to);
      });

      describe("onlyUnpaused modifier", () => {
        it("GIVEN a paused Token WHEN clearingCreateHoldFromByPartition THEN transaction fails with TokenIsPaused", async () => {
          await asset.connect(signer_D).pause();
          await expect(
            asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
          ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
        });
      });

      describe("onlyClearingActivated modifier", () => {
        it("GIVEN clearing deactivated WHEN clearingCreateHoldFromByPartition THEN transaction fails with ClearingIsDisabled", async () => {
          await asset.connect(signer_A).deactivateClearing();
          await expect(
            asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
          ).to.be.revertedWithCustomError(asset, "ClearingIsDisabled");
        });
      });

      describe("onlyWithValidExpirationTimestamp modifier", () => {
        it("GIVEN an expired clearing expirationTimestamp WHEN clearingCreateHoldFromByPartition THEN transaction fails with WrongExpirationTimestamp", async () => {
          const wrongExpirationTimestamp = currentTimestamp - 1;
          await asset.changeSystemTimestamp(currentTimestamp);

          const clearingOperation_wrong = { ...clearingOperation, expirationTimestamp: wrongExpirationTimestamp };
          const clearingOperationFrom_wrong = {
            ...clearingOperationFrom,
            clearingOperation: clearingOperation_wrong,
          };
          await expect(
            asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom_wrong, hold),
          ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
        });

        it("GIVEN an expired hold expirationTimestamp WHEN clearingCreateHoldFromByPartition THEN transaction fails with WrongExpirationTimestamp", async () => {
          const wrongExpirationTimestamp = currentTimestamp - 1;
          await asset.changeSystemTimestamp(currentTimestamp);

          const hold_wrong = { ...hold, expirationTimestamp: BigInt(wrongExpirationTimestamp) };
          await expect(
            asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold_wrong),
          ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
        });
      });

      describe("notZeroAddress modifier", () => {
        it("GIVEN a zero from address WHEN clearingCreateHoldFromByPartition THEN transaction fails with ZeroAddressNotAllowed", async () => {
          const clearingOperationFrom_wrong = { ...clearingOperationFrom, from: ADDRESS_ZERO };
          await expect(
            asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom_wrong, hold),
          ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
        });

        it("GIVEN a zero escrow address WHEN clearingCreateHoldFromByPartition THEN transaction fails with ZeroAddressNotAllowed", async () => {
          const hold_wrong = { ...hold, escrow: ADDRESS_ZERO };
          await expect(
            asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold_wrong),
          ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
        });
      });

      describe("onlyDefaultPartitionWithSinglePartition modifier", () => {
        it("GIVEN a wrong partition in single-partition mode WHEN clearingCreateHoldFromByPartition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
          const clearingOperation_wrong = { ...clearingOperation, partition: _WRONG_PARTITION };
          const clearingOperationFrom_wrong = {
            ...clearingOperationFrom,
            clearingOperation: clearingOperation_wrong,
          };
          await expect(
            asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom_wrong, hold),
          ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
        });
      });

      describe("onlyUnProtectedPartitionsOrWildCardRole modifier", () => {
        it("GIVEN protected partitions without wildcard role WHEN clearingCreateHoldFromByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
          await asset.connect(signer_B).protectPartitions();
          await expect(
            asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
          ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        });

        it("GIVEN protected partitions with wildcard role WHEN clearingCreateHoldFromByPartition THEN transaction succeeds", async () => {
          await asset.connect(signer_A).increaseAllowance(signer_B.address, _AMOUNT);
          await asset.connect(signer_B).protectPartitions();
          await asset.grantRole(ATS_ROLES.WILD_CARD_ROLE, signer_B.address);
          await expect(asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold)).to.not.be
            .reverted;
        });
      });

      describe("onlyUnrecoveredAddress modifier", () => {
        it("GIVEN a recovered msgSender WHEN calling clearingCreateHoldFromByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = { ...clearingOperationFrom, from: signer_B.address };
          await expect(
            asset.connect(signer_A).clearingCreateHoldFromByPartition(clearingOperationFromB, hold),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN a recovered hold.to WHEN calling clearingCreateHoldFromByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = { ...clearingOperationFrom, from: signer_B.address };
          await expect(
            asset.connect(signer_A).clearingCreateHoldFromByPartition(clearingOperationFromB, hold),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN a recovered from address WHEN calling clearingCreateHoldFromByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = { ...clearingOperationFrom, from: signer_B.address };
          await expect(
            asset.connect(signer_A).clearingCreateHoldFromByPartition(clearingOperationFromB, hold),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });
      });

      describe("InsufficientAllowance", () => {
        it("GIVEN no allowance WHEN clearingCreateHoldFromByPartition THEN transaction fails with InsufficientAllowance", async () => {
          await expect(
            asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
          ).to.be.revertedWithCustomError(asset, "InsufficientAllowance");
        });
      });

      describe("InsufficientBalance", () => {
        it("GIVEN amount bigger than balance WHEN clearingCreateHoldFromByPartition THEN transaction fails with InsufficientBalance", async () => {
          const clearingOperationFromB = { ...clearingOperationFrom, from: signer_B.address };
          const hold_wrong = { ...hold, amount: BigInt(4 * _AMOUNT) };
          await asset.connect(signer_B).increaseAllowance(signer_A.address, 4 * _AMOUNT);
          await expect(
            asset.connect(signer_A).clearingCreateHoldFromByPartition(clearingOperationFromB, hold_wrong),
          ).to.be.revertedWithCustomError(asset, "InsufficientBalance");
        });
      });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // getClearingCreateHoldForByPartition
    // ─────────────────────────────────────────────────────────────────────────

    describe("getClearingCreateHoldForByPartition", () => {
      it("GIVEN a created clearing hold WHEN getClearingCreateHoldForByPartition THEN returns correct data", async () => {
        await asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold);

        const clearing = await asset.getClearingCreateHoldForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);

        expect(clearing.amount).to.equal(_AMOUNT);
        expect(clearing.expirationTimestamp).to.equal(clearingOperation.expirationTimestamp);
        expect(clearing.holdTo).to.equal(hold.to);
        expect(clearing.holdEscrow).to.equal(hold.escrow);
        expect(clearing.holdExpirationTimestamp).to.equal(hold.expirationTimestamp);
        expect(clearing.holdData).to.equal(hold.data);
      });

      it("GIVEN a created clearingFrom hold WHEN getClearingCreateHoldForByPartition THEN returns correct data", async () => {
        await asset.connect(signer_A).increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold);

        const clearing = await asset.getClearingCreateHoldForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);

        expect(clearing.amount).to.equal(_AMOUNT);
        expect(clearing.holdTo).to.equal(hold.to);
      });

      it("GIVEN no clearing WHEN getClearingCreateHoldForByPartition with non-existent id THEN returns zero data", async () => {
        const clearing = await asset.getClearingCreateHoldForByPartition(_DEFAULT_PARTITION, signer_A.address, 999);
        expect(clearing.amount).to.equal(0);
      });
    });
  });
});
