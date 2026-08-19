// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { IAssetMock } from "@contract-types";
import type { AssetMockCtx } from "@test";
import { RESOLVER_KEYS } from "@scripts";
import { executeRbac, MAX_UINT256 } from "@test";
import {
  EMPTY_STRING,
  ATS_ROLES,
  ZERO,
  EMPTY_HEX_BYTES,
  ADDRESS_ZERO,
  dateToUnixTimestamp,
  DEFAULT_PARTITION,
} from "@scripts";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
const _AMOUNT = 1000;
const _DATA = "0x1234";
const maxSupply_Original = 1000000 * _AMOUNT;
const maxSupply_Partition_1_Original = 50000 * _AMOUNT;

const ONE_SECOND = 1;
const EMPTY_VC_ID = EMPTY_STRING;
const balanceOf_A_Original = [10 * _AMOUNT, 100 * _AMOUNT];
const balanceOf_B_Original = [20 * _AMOUNT, 200 * _AMOUNT];
const adjustFactor = 253;
const adjustDecimals = 2;
let holdIdentifier: any;
enum ThirdPartyType {
  NULL,
  AUTHORIZED,
  OPERATOR,
  PROTECTED,
  CONTROLLER,
  CLEARING,
}

export function holdByPartitionTests(getCtx: () => AssetMockCtx): void {
  describe("HoldByPartition Tests", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;
    let signer_E: HardhatEthersSigner;
    let signer_F: HardhatEthersSigner;

    let asset: IAssetMock;

    const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
    let currentTimestamp = 0;
    let expirationTimestamp = 0;

    let hold: any;

    const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "bytes32"],
      [ATS_ROLES.ROLE_PROTECTED_PARTITIONS_PARTICIPANT, DEFAULT_PARTITION],
    );
    const packedDataWithoutPrefix = packedData.slice(2);
    const ProtectedPartitionRole_1 = ethers.keccak256("0x" + packedDataWithoutPrefix);

    function set_initRbacs() {
      return [
        {
          role: ATS_ROLES.ROLE_ISSUER,
          members: [signer_B.address],
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
        {
          role: ATS_ROLES.ROLE_CLEARING,
          members: [signer_A.address],
        },
        {
          role: ATS_ROLES.ROLE_CORPORATE_ACTION,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_CONTROL_LIST,
          members: [signer_E.address],
        },
        {
          role: ATS_ROLES.ROLE_CONTROLLER,
          members: [signer_C.address],
        },
        {
          role: ATS_ROLES.ROLE_PROTECTED_PARTITIONS,
          members: [signer_B.address],
        },
        {
          role: ATS_ROLES.ROLE_AGENT,
          members: [signer_A.address],
        },
        { role: ProtectedPartitionRole_1, members: [signer_B.address] },
      ];
    }

    async function setFacets(asset: IAssetMock) {
      await asset.connect(signer_A).addIssuer(signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
      await asset.connect(signer_B).grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await asset.connect(signer_B).issueByPartition({
        partition: _DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: _AMOUNT,
        data: EMPTY_HEX_BYTES,
      });
    }

    describe("singlePartition", () => {
      async function checkCreatedHold_expected(
        balance_expected: number,
        totalHeldAmount_expected: number,
        holdCount_expected: number,
        holdAmount_expected: number,
        holdEscrow_expected: string,
        holdData_expected: string,
        holdOperatorData_expected: string,
        holdDestination_expected: string,
        holdExpirationTimestamp_expected: string,
        holdsLength_expected: number,
        holdId_expected: number,
        holdThirdPartyType_expected: ThirdPartyType,
        holdThirdPartyAddress_expected: string,
      ) {
        const balance = await asset.balanceOf(signer_A.address);
        const heldAmount = await asset.getHeldAmountForByPartition(_DEFAULT_PARTITION, signer_A.address);
        const holdCount = await asset.getHoldCountForByPartition(_DEFAULT_PARTITION, signer_A.address);
        const holdIds = await asset.getHoldsIdForByPartition(_DEFAULT_PARTITION, signer_A.address, 0, 100);

        expect(balance).to.equal(balance_expected);
        expect(heldAmount).to.equal(totalHeldAmount_expected);
        expect(holdCount).to.equal(holdCount_expected);
        expect(holdIds.length).to.equal(holdsLength_expected);

        if (holdCount_expected > 0) {
          const retrieved_hold = await asset.getHoldForByPartition(holdIdentifier);
          const holdThirdParty = await asset.getHoldThirdParty(holdIdentifier);

          expect(retrieved_hold.amount_).to.equal(holdAmount_expected);
          expect(retrieved_hold.escrow_).to.equal(holdEscrow_expected);
          expect(retrieved_hold.data_).to.equal(holdData_expected);
          expect(retrieved_hold.operatorData_).to.equal(holdOperatorData_expected);
          expect(retrieved_hold.destination_).to.equal(holdDestination_expected);
          expect(retrieved_hold.expirationTimestamp_).to.equal(holdExpirationTimestamp_expected);
          expect(holdIds[0]).to.equal(holdId_expected);
          expect(retrieved_hold.thirdPartyType_).to.equal(holdThirdPartyType_expected);
          expect(holdThirdParty).to.equal(holdThirdPartyAddress_expected);
        }
      }

      beforeEach(async () => {
        const ctx = getCtx();
        signer_A = ctx.deployer;
        signer_B = ctx.user1;
        signer_C = ctx.user2;
        signer_D = ctx.user3;
        signer_E = ctx.user4;
        signer_F = ctx.user5;
        asset = ctx.asset;

        await executeRbac(asset, set_initRbacs());
        await setFacets(asset);
        await asset.grantRole(ATS_ROLES.ROLE_INTERNAL_KYC_MANAGER, signer_A.address);
        await asset.activateInternalKyc();

        currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;
        expirationTimestamp = currentTimestamp + ONE_YEAR_IN_SECONDS;

        hold = {
          amount: _AMOUNT,
          expirationTimestamp: expirationTimestamp,
          escrow: signer_B.address,
          to: ADDRESS_ZERO,
          data: _DATA,
        };
        holdIdentifier = {
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          holdId: 1,
        };
      });

      describe("snapshot", () => {
        it("GIVEN an account with snapshot role WHEN takeSnapshot and Hold THEN transaction succeeds", async () => {
          const EXPIRATION_TIMESTAMP = dateToUnixTimestamp(`2030-01-01T00:00:35Z`);

          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_SNAPSHOT, signer_A.address);
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_LOCKER, signer_A.address);

          // snapshot
          await asset.connect(signer_A).takeSnapshot();

          // Operations
          const hold = {
            amount: 1,
            expirationTimestamp: EXPIRATION_TIMESTAMP,
            escrow: signer_A.address,
            to: ADDRESS_ZERO,
            data: EMPTY_HEX_BYTES,
          };
          await asset.connect(signer_A).createHoldByPartition(_DEFAULT_PARTITION, hold);
          await asset.connect(signer_A).createHoldByPartition(_DEFAULT_PARTITION, hold);
          await asset.connect(signer_A).createHoldByPartition(_DEFAULT_PARTITION, hold);
          await asset.connect(signer_A).createHoldByPartition(_DEFAULT_PARTITION, hold);

          // snapshot
          await asset.connect(signer_A).takeSnapshot();

          // Operations
          holdIdentifier.holdId = 1;
          await asset.connect(signer_A).releaseHoldByPartition(holdIdentifier, 1);
          holdIdentifier.holdId = 2;
          await asset.connect(signer_A).executeHoldByPartition(holdIdentifier, signer_B.address, 1);
          await asset.connect(signer_A).changeSystemTimestamp(EXPIRATION_TIMESTAMP + 1);
          holdIdentifier.holdId = 3;
          await asset.connect(signer_A).reclaimHoldByPartition(holdIdentifier);

          // snapshot
          await asset.connect(signer_A).takeSnapshot();

          // checks
          const snapshot_Balance_Of_A_1 = await asset.balanceOfAtSnapshot(1, signer_A.address);
          const snapshot_Balance_Of_B_1 = await asset.balanceOfAtSnapshot(1, signer_B.address);
          const snapshot_HeldBalance_Of_A_1 = await asset.heldBalanceOfAtSnapshot(1, signer_A.address);
          const snapshot_Total_Supply_1 = await asset.totalSupplyAtSnapshot(1);

          expect(snapshot_Balance_Of_A_1).to.equal(_AMOUNT);
          expect(snapshot_Balance_Of_B_1).to.equal(0);
          expect(snapshot_HeldBalance_Of_A_1).to.equal(0);
          expect(snapshot_Total_Supply_1).to.equal(_AMOUNT);

          const snapshot_Balance_Of_A_2 = await asset.balanceOfAtSnapshot(2, signer_A.address);
          const snapshot_Balance_Of_B_2 = await asset.balanceOfAtSnapshot(2, signer_B.address);
          const snapshot_HeldBalance_Of_A_2 = await asset.heldBalanceOfAtSnapshot(2, signer_A.address);
          const snapshot_Total_Supply_2 = await asset.totalSupplyAtSnapshot(2);

          expect(snapshot_Balance_Of_A_2).to.equal(_AMOUNT - 4);
          expect(snapshot_Balance_Of_B_2).to.equal(0);
          expect(snapshot_HeldBalance_Of_A_2).to.equal(4);
          expect(snapshot_Total_Supply_2).to.equal(_AMOUNT);

          const snapshot_Balance_Of_A_3 = await asset.balanceOfAtSnapshot(3, signer_A.address);
          const snapshot_Balance_Of_B_3 = await asset.balanceOfAtSnapshot(3, signer_B.address);
          const snapshot_HeldBalance_Of_A_3 = await asset.heldBalanceOfAtSnapshot(3, signer_A.address);
          const snapshot_Total_Supply_3 = await asset.totalSupplyAtSnapshot(3);

          expect(snapshot_Balance_Of_A_3).to.equal(_AMOUNT - 2);
          expect(snapshot_Balance_Of_B_3).to.equal(1);
          expect(snapshot_HeldBalance_Of_A_3).to.equal(1);
          expect(snapshot_Total_Supply_3).to.equal(_AMOUNT);
        });
      });

      describe("Paused", () => {
        beforeEach(async () => {
          await asset.connect(signer_D).pause();
        });

        it("GIVEN a paused Token WHEN createHoldByPartition THEN transaction fails with IsPaused", async () => {
          await expect(asset.createHoldByPartition(_DEFAULT_PARTITION, hold)).to.be.revertedWithCustomError(
            asset,
            "IsPaused",
          );
        });

        it("GIVEN a paused Token WHEN createHoldFromByPartition THEN transaction fails with IsPaused", async () => {
          await expect(
            asset.createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
          ).to.be.revertedWithCustomError(asset, "IsPaused");
        });

        it("GIVEN a paused Token WHEN executeHoldByPartition THEN transaction fails with IsPaused", async () => {
          await expect(asset.executeHoldByPartition(holdIdentifier, signer_C.address, 1)).to.be.revertedWithCustomError(
            asset,
            "IsPaused",
          );
        });

        it("GIVEN a paused Token WHEN releaseHoldByPartition THEN transaction fails with IsPaused", async () => {
          await expect(asset.releaseHoldByPartition(holdIdentifier, 1)).to.be.revertedWithCustomError(
            asset,
            "IsPaused",
          );
        });

        it("GIVEN a paused Token WHEN reclaimHoldByPartition THEN transaction fails with IsPaused", async () => {
          await expect(asset.reclaimHoldByPartition(holdIdentifier)).to.be.revertedWithCustomError(asset, "IsPaused");
        });
      });

      describe("Clearing active", () => {
        it("GIVEN a token in clearing mode THEN hold creation fails with ClearingIsActivated", async () => {
          await asset.connect(signer_A).activateClearing();
          await expect(asset.createHoldByPartition(_DEFAULT_PARTITION, hold)).to.be.revertedWithCustomError(
            asset,
            "ClearingIsActivated",
          );
          await expect(
            asset.createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
          ).to.be.revertedWithCustomError(asset, "ClearingIsActivated");
        });
      });

      describe("AccessControl", () => {
        it("GIVEN an account without authorization WHEN createHoldFromByPartition THEN transaction fails with InsufficientAllowance", async () => {
          await expect(
            asset
              .connect(signer_D)
              .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
          ).to.be.revertedWithCustomError(asset, "InsufficientAllowance");
        });
      });

      describe("Control List", () => {
        it("GIVEN a blacklisted destination account WHEN executeHoldByPartition THEN transaction fails with AccountIsBlocked", async () => {
          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await asset.connect(signer_E).addToControlList(signer_C.address);

          await expect(
            asset.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, 1),
          ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
        });

        it("GIVEN a blacklisted origin account WHEN executeHoldByPartition THEN transaction fails with AccountIsBlocked", async () => {
          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await asset.connect(signer_E).addToControlList(signer_A.address);

          await expect(
            asset.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_B.address, 1),
          ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
        });
      });

      describe("KYC", () => {
        it("Given a non kyc account WHEN executeHoldByPartition THEN transaction fails with InvalidKycStatus", async () => {
          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);
          await asset.connect(signer_B).revokeKyc(signer_A.address);
          await expect(
            asset.connect(signer_A).executeHoldByPartition(holdIdentifier, signer_B.address, 1),
          ).to.be.revertedWithCustomError(asset, "InvalidKycStatus");
          await expect(
            asset.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_A.address, 1),
          ).to.be.revertedWithCustomError(asset, "InvalidKycStatus");
        });
      });

      describe("Create with wrong input arguments", () => {
        it("Given a invalid _from address when createHoldFromByPartition THEN transaction fails with ZeroAddressNotAllowed", async () => {
          await asset.connect(signer_A).approve(signer_B.address, _AMOUNT);

          await expect(
            asset.connect(signer_B).createHoldFromByPartition(_DEFAULT_PARTITION, ADDRESS_ZERO, hold, EMPTY_HEX_BYTES),
          ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
        });

        it("GIVEN a Token WHEN creating hold with amount bigger than balance THEN transaction fails with InsufficientBalance", async () => {
          const AmountLargerThanBalance = 1000 * _AMOUNT;

          const hold_wrong = {
            amount: AmountLargerThanBalance,
            expirationTimestamp: expirationTimestamp,
            escrow: signer_B.address,
            to: ADDRESS_ZERO,
            data: _DATA,
          };

          await expect(asset.createHoldByPartition(_DEFAULT_PARTITION, hold_wrong)).to.be.revertedWithCustomError(
            asset,
            "InsufficientBalance",
          );

          await asset.connect(signer_A).approve(signer_B.address, AmountLargerThanBalance);

          await expect(
            asset
              .connect(signer_B)
              .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
          ).to.be.revertedWithCustomError(asset, "InsufficientBalance");
        });

        it("GIVEN msg.sender recovering WHEN createHoldByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_A).recoveryAddress(signer_F.address, signer_E.address, ADDRESS_ZERO);

          await expect(
            asset.connect(signer_F).createHoldByPartition(_DEFAULT_PARTITION, hold),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN hold.to recovering WHEN createHoldByPartition THEN transaction fails with WalletRecovered", async () => {
          const hold_with_destination = {
            amount: _AMOUNT,
            expirationTimestamp: expirationTimestamp,
            escrow: signer_B.address,
            to: signer_F.address,
            data: _DATA,
          };

          await asset.connect(signer_A).recoveryAddress(signer_F.address, signer_B.address, ADDRESS_ZERO);

          await expect(
            asset.createHoldByPartition(_DEFAULT_PARTITION, hold_with_destination),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN a Token WHEN createHoldByPartition passing empty escrow THEN transaction fails with ZeroAddressNotAllowed", async () => {
          const hold_wrong = {
            amount: _AMOUNT,
            expirationTimestamp: expirationTimestamp,
            escrow: ADDRESS_ZERO,
            to: ADDRESS_ZERO,
            data: _DATA,
          };

          await expect(asset.createHoldByPartition(_DEFAULT_PARTITION, hold_wrong)).to.be.revertedWithCustomError(
            asset,
            "ZeroAddressNotAllowed",
          );

          await asset.connect(signer_A).approve(signer_B.address, _AMOUNT);

          await expect(
            asset
              .connect(signer_B)
              .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
          ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
        });

        it("GIVEN a Token WHEN createHoldByPartition passing wrong expirationTimestamp THEN transaction fails with WrongExpirationTimestamp", async () => {
          await asset.connect(signer_A).changeSystemTimestamp(currentTimestamp);
          const wrongExpirationTimestamp = currentTimestamp - 1;

          const hold_wrong = {
            amount: _AMOUNT,
            expirationTimestamp: wrongExpirationTimestamp,
            escrow: signer_B.address,
            to: ADDRESS_ZERO,
            data: _DATA,
          };

          await expect(asset.createHoldByPartition(_DEFAULT_PARTITION, hold_wrong)).to.be.revertedWithCustomError(
            asset,
            "WrongExpirationTimestamp",
          );

          await asset.connect(signer_A).approve(signer_B.address, _AMOUNT);

          await expect(
            asset
              .connect(signer_B)
              .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
          ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
        });

        it("GIVEN a wrong partition WHEN creating hold THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
          await expect(asset.createHoldByPartition(_WRONG_PARTITION, hold)).to.be.revertedWithCustomError(
            asset,
            "PartitionNotAllowedInSinglePartitionMode",
          );

          await asset.connect(signer_A).approve(signer_B.address, _AMOUNT);

          await expect(
            asset
              .connect(signer_B)
              .createHoldFromByPartition(_WRONG_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
          ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
        });
      });

      describe("Create Holds OK", () => {
        async function checkCreatedHold(
          thirdPartyType: ThirdPartyType,
          thirdPartyAddress?: string,
          operatorData?: string,
        ) {
          await checkCreatedHold_expected(
            0,
            _AMOUNT,
            1,
            hold.amount,
            hold.escrow,
            hold.data,
            operatorData ?? EMPTY_HEX_BYTES,
            hold.to,
            hold.expirationTimestamp,
            1,
            1,
            thirdPartyType,
            thirdPartyAddress ?? ADDRESS_ZERO,
          );
        }

        it("GIVEN a Token WHEN createHoldByPartition hold THEN transaction succeeds", async () => {
          await expect(asset.createHoldByPartition(_DEFAULT_PARTITION, hold))
            .to.emit(asset, "HeldByPartition")
            .withArgs(signer_A.address, signer_A.address, _DEFAULT_PARTITION, 1, Object.values(hold), EMPTY_HEX_BYTES)
            .to.emit(asset, "Transfer")
            .withArgs(signer_A.address, ethers.ZeroAddress, _AMOUNT);

          await checkCreatedHold(ThirdPartyType.NULL);
        });

        it("GIVEN a Token WHEN createHoldFromByPartition hold THEN transaction succeeds", async () => {
          await asset.connect(signer_A).approve(signer_B.address, _AMOUNT);

          const operatorData = EMPTY_HEX_BYTES;

          await expect(
            asset.connect(signer_B).createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, operatorData),
          )
            .to.emit(asset, "HeldFromByPartition")
            .withArgs(signer_B.address, signer_A.address, _DEFAULT_PARTITION, 1, Object.values(hold), operatorData)
            .to.emit(asset, "Transfer")
            .withArgs(signer_A.address, ethers.ZeroAddress, _AMOUNT);

          await checkCreatedHold(ThirdPartyType.AUTHORIZED, signer_B.address, operatorData);
        });
      });

      describe("Execute with wrong input arguments", () => {
        it("GIVEN a wrong hold id WHEN executeHoldByPartition THEN transaction fails with WrongHoldId", async () => {
          holdIdentifier.holdId = 999;

          await expect(
            asset.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, 1),
          ).to.be.revertedWithCustomError(asset, "WrongHoldId");
        });

        it("GIVEN a wrong escrow id WHEN executeHoldByPartition THEN transaction fails with IsNotEscrow", async () => {
          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await expect(
            asset.connect(signer_C).executeHoldByPartition(holdIdentifier, signer_C.address, 1),
          ).to.be.revertedWithCustomError(asset, "IsNotEscrow");
        });

        it("GIVEN a wrong partition WHEN executeHoldByPartition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
          holdIdentifier.partition = _WRONG_PARTITION;
          await expect(
            asset.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, 1),
          ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
        });

        it("GIVEN a hold WHEN executeHoldByPartition for an amount larger than the total held amount THEN transaction fails with InsufficientHoldBalance", async () => {
          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await expect(
            asset.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, 2 * _AMOUNT),
          ).to.be.revertedWithCustomError(asset, "InsufficientHoldBalance");
        });

        it("GIVEN a hold WHEN executeHoldByPartition for a zero amount THEN transaction fails with InvalidHoldAmount", async () => {
          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await expect(
            asset.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, 0),
          ).to.be.revertedWithCustomError(asset, "InvalidHoldAmount");
        });

        it("GIVEN a hold WHEN executeHoldByPartition after expiration date THEN transaction fails with HoldExpirationReached", async () => {
          const initDate = dateToUnixTimestamp("2030-01-01T00:00:03Z");
          const finalDate = dateToUnixTimestamp("2030-02-01T00:00:03Z");

          hold.expirationTimestamp = finalDate - 1;

          await asset.connect(signer_A).changeSystemTimestamp(initDate);

          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await asset.connect(signer_A).changeSystemTimestamp(finalDate);

          await expect(
            asset.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, 1),
          ).to.be.revertedWithCustomError(asset, "HoldExpirationReached");
        });

        it("GIVEN a hold WHEN executeHoldByPartition at exact expiration timestamp THEN transaction fails with HoldExpirationReached", async () => {
          const initDate = dateToUnixTimestamp("2030-01-01T00:00:03Z");
          const expirationDate = dateToUnixTimestamp("2030-02-01T00:00:03Z");

          hold.expirationTimestamp = expirationDate;

          await asset.connect(signer_A).changeSystemTimestamp(initDate);

          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await asset.connect(signer_A).changeSystemTimestamp(expirationDate);

          await expect(
            asset.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, 1),
          ).to.be.revertedWithCustomError(asset, "HoldExpirationReached");
        });

        it("GIVEN a hold with a destination WHEN executeHoldByPartition to another destination THEN transaction fails with InvalidDestinationAddress", async () => {
          hold.to = signer_D.address;

          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await expect(
            asset.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, _AMOUNT),
          ).to.be.revertedWithCustomError(asset, "InvalidDestinationAddress");
        });
      });

      describe("Release with wrong input arguments", () => {
        it("GIVEN a wrong hold id WHEN releaseHoldByPartition THEN transaction fails with WrongHoldId", async () => {
          holdIdentifier.holdId = 999;

          await expect(asset.connect(signer_B).releaseHoldByPartition(holdIdentifier, 1)).to.be.revertedWithCustomError(
            asset,
            "WrongHoldId",
          );
        });

        it("GIVEN a wrong escrow WHEN releaseHoldByPartition THEN transaction fails with IsNotEscrow", async () => {
          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await expect(asset.connect(signer_C).releaseHoldByPartition(holdIdentifier, 1)).to.be.revertedWithCustomError(
            asset,
            "IsNotEscrow",
          );
        });

        it("GIVEN a wrong partition WHEN releaseHoldByPartition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
          holdIdentifier.partition = _WRONG_PARTITION;
          await expect(asset.connect(signer_B).releaseHoldByPartition(holdIdentifier, 1)).to.be.revertedWithCustomError(
            asset,
            "PartitionNotAllowedInSinglePartitionMode",
          );
        });

        it("GIVEN a hold WHEN releaseHoldByPartition for an amount larger than the total held amount THEN transaction fails with InsufficientHoldBalance", async () => {
          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await expect(
            asset.connect(signer_B).releaseHoldByPartition(holdIdentifier, 2 * _AMOUNT),
          ).to.be.revertedWithCustomError(asset, "InsufficientHoldBalance");
        });

        it("GIVEN a hold WHEN releaseHoldByPartition for a zero amount THEN transaction fails with InvalidHoldAmount", async () => {
          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await expect(asset.connect(signer_B).releaseHoldByPartition(holdIdentifier, 0)).to.be.revertedWithCustomError(
            asset,
            "InvalidHoldAmount",
          );
        });

        it("GIVEN hold WHEN releaseHoldByPartition after expiration date THEN transaction fails with HoldExpirationReached", async () => {
          const initDate = dateToUnixTimestamp("2030-01-01T00:00:03Z");
          const finalDate = dateToUnixTimestamp("2030-02-01T00:00:03Z");

          hold.expirationTimestamp = finalDate - 1;

          await asset.connect(signer_A).changeSystemTimestamp(initDate);

          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await asset.connect(signer_A).changeSystemTimestamp(finalDate);

          await expect(asset.connect(signer_B).releaseHoldByPartition(holdIdentifier, 1)).to.be.revertedWithCustomError(
            asset,
            "HoldExpirationReached",
          );
        });

        it("GIVEN hold WHEN releaseHoldByPartition at exact expiration timestamp THEN transaction fails with HoldExpirationReached", async () => {
          const initDate = dateToUnixTimestamp("2030-01-01T00:00:03Z");
          const expirationDate = dateToUnixTimestamp("2030-02-01T00:00:03Z");

          hold.expirationTimestamp = expirationDate;

          await asset.connect(signer_A).changeSystemTimestamp(initDate);

          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await asset.connect(signer_A).changeSystemTimestamp(expirationDate);

          await expect(asset.connect(signer_B).releaseHoldByPartition(holdIdentifier, 1)).to.be.revertedWithCustomError(
            asset,
            "HoldExpirationReached",
          );
        });
      });

      describe("Reclaim with wrong input arguments", () => {
        it("GIVEN a wrong id WHEN reclaimHoldByPartition THEN transaction fails with WrongHoldId", async () => {
          holdIdentifier.holdId = 2;
          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await expect(asset.reclaimHoldByPartition(holdIdentifier)).to.be.revertedWithCustomError(
            asset,
            "WrongHoldId",
          );
        });

        it("GIVEN a wrong partition WHEN reclaimHoldByPartition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
          holdIdentifier.partition = _WRONG_PARTITION;
          await expect(asset.connect(signer_B).reclaimHoldByPartition(holdIdentifier)).to.be.revertedWithCustomError(
            asset,
            "PartitionNotAllowedInSinglePartitionMode",
          );
        });

        it("GIVEN hold WHEN reclaimHoldByPartition after expiration date THEN transaction fails with HoldExpirationNotReached", async () => {
          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await expect(asset.connect(signer_B).reclaimHoldByPartition(holdIdentifier)).to.be.revertedWithCustomError(
            asset,
            "HoldExpirationNotReached",
          );
        });
      });

      describe("Execute OK", () => {
        it("GIVEN hold with no destination WHEN executeHoldByPartition THEN transaction succeeds", async () => {
          const balance_before = await asset.balanceOf(signer_C.address);

          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await expect(asset.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, _AMOUNT))
            .to.emit(asset, "HoldByPartitionExecuted")
            .withArgs(signer_A.address, _DEFAULT_PARTITION, 1, _AMOUNT, signer_C.address)
            .to.emit(asset, "Transfer")
            .withArgs(ethers.ZeroAddress, signer_C.address, _AMOUNT);

          await checkCreatedHold_expected(
            0,
            0,
            0,
            0,
            EMPTY_STRING,
            EMPTY_HEX_BYTES,
            EMPTY_HEX_BYTES,
            EMPTY_STRING,
            EMPTY_STRING,
            0,
            0,
            ThirdPartyType.NULL,
            ADDRESS_ZERO,
          );

          const balance_after = await asset.balanceOf(signer_C.address);

          expect(balance_after).to.equal(balance_before + BigInt(_AMOUNT));
        });

        it("GIVEN hold WHEN executeHoldByPartition THEN security token holder list and snapshots succeeds", async () => {
          const balance_before = await asset.balanceOf(signer_A.address);

          const hold = {
            amount: balance_before,
            expirationTimestamp: expirationTimestamp,
            escrow: signer_B.address,
            to: signer_C.address,
            data: _DATA,
          };

          await asset.connect(signer_A).createHoldByPartition(_DEFAULT_PARTITION, hold);

          const totalSecurityHoldersBefore = await asset.getTotalSecurityHolders();
          const securityHoldersBefore = await asset.getSecurityHolders(0, totalSecurityHoldersBefore);

          await expect(asset.connect(signer_B).executeHoldByPartition(holdIdentifier, signer_C.address, balance_before))
            .to.emit(asset, "HoldByPartitionExecuted")
            .withArgs(signer_A.address, _DEFAULT_PARTITION, 1, _AMOUNT, signer_C.address)
            .to.emit(asset, "Transfer")
            .withArgs(ethers.ZeroAddress, signer_C.address, _AMOUNT);

          const totalSecurityHoldersAfter = await asset.getTotalSecurityHolders();
          const securityHoldersAfter = await asset.getSecurityHolders(0, totalSecurityHoldersAfter);

          expect(totalSecurityHoldersAfter).to.equal(totalSecurityHoldersBefore);
          expect(securityHoldersBefore).to.deep.equal([signer_A.address]);
          expect(securityHoldersAfter).to.deep.equal([signer_C.address]);
        });
      });

      describe("Release OK", () => {
        it("GIVEN hold with no destination WHEN releaseHoldByPartition THEN transaction succeeds", async () => {
          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await expect(asset.connect(signer_B).releaseHoldByPartition(holdIdentifier, _AMOUNT))
            .to.emit(asset, "HoldByPartitionReleased")
            .withArgs(signer_A.address, _DEFAULT_PARTITION, 1, _AMOUNT)
            .to.emit(asset, "Transfer")
            .withArgs(ethers.ZeroAddress, signer_A.address, _AMOUNT);

          await checkCreatedHold_expected(
            _AMOUNT,
            0,
            0,
            0,
            EMPTY_STRING,
            EMPTY_HEX_BYTES,
            EMPTY_HEX_BYTES,
            EMPTY_STRING,
            EMPTY_STRING,
            0,
            0,
            ThirdPartyType.NULL,
            ADDRESS_ZERO,
          );
        });

        it("GIVEN a hold created by an approved user WHEN releaseHoldByPartition THEN allowance is restored", async () => {
          await asset.connect(signer_A).increaseAllowance(signer_B.address, _AMOUNT);
          await asset
            .connect(signer_B)
            .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES);

          expect(await asset.allowance(signer_A.address, signer_B.address)).to.be.equal(ZERO);

          await expect(asset.connect(signer_B).releaseHoldByPartition(holdIdentifier, _AMOUNT))
            .to.emit(asset, "Approval")
            .withArgs(signer_A.address, signer_B.address, _AMOUNT);

          expect(await asset.allowance(signer_A.address, signer_B.address)).to.be.equal(_AMOUNT);
        });
      });

      describe("Reclaim OK", () => {
        it("GIVEN hold with no destination WHEN reclaimHoldByPartition THEN transaction succeeds", async () => {
          const initDate = dateToUnixTimestamp("2030-01-01T00:00:03Z");
          const finalDate = dateToUnixTimestamp("2030-02-01T00:00:03Z");

          hold.expirationTimestamp = finalDate - 1;

          await asset.connect(signer_A).changeSystemTimestamp(initDate);

          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await asset.connect(signer_A).changeSystemTimestamp(finalDate);

          await expect(asset.connect(signer_B).reclaimHoldByPartition(holdIdentifier))
            .to.emit(asset, "HoldByPartitionReclaimed")
            .withArgs(signer_B.address, signer_A.address, _DEFAULT_PARTITION, 1, _AMOUNT)
            .to.emit(asset, "Transfer")
            .withArgs(ethers.ZeroAddress, signer_A.address, _AMOUNT);

          await checkCreatedHold_expected(
            _AMOUNT,
            0,
            0,
            0,
            EMPTY_STRING,
            EMPTY_HEX_BYTES,
            EMPTY_HEX_BYTES,
            EMPTY_STRING,
            EMPTY_STRING,
            0,
            0,
            ThirdPartyType.NULL,
            ADDRESS_ZERO,
          );
        });

        it("GIVEN hold WHEN reclaimHoldByPartition at exact expiration timestamp THEN transaction succeeds", async () => {
          const initDate = dateToUnixTimestamp("2030-01-01T00:00:03Z");
          const expirationDate = dateToUnixTimestamp("2030-02-01T00:00:03Z");

          hold.expirationTimestamp = expirationDate;

          await asset.connect(signer_A).changeSystemTimestamp(initDate);

          await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

          await asset.connect(signer_A).changeSystemTimestamp(expirationDate);

          await expect(asset.connect(signer_B).reclaimHoldByPartition(holdIdentifier))
            .to.emit(asset, "HoldByPartitionReclaimed")
            .withArgs(signer_B.address, signer_A.address, _DEFAULT_PARTITION, 1, _AMOUNT)
            .to.emit(asset, "Transfer")
            .withArgs(ethers.ZeroAddress, signer_A.address, _AMOUNT);
        });
      });

      it("GIVEN a hold created by an approved user WHEN reclaimHoldByPartition THEN allowance is restored", async () => {
        await asset.connect(signer_A).increaseAllowance(signer_B.address, _AMOUNT);
        await asset
          .connect(signer_B)
          .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES);

        expect(await asset.allowance(signer_A.address, signer_B.address)).to.be.equal(ZERO);

        await asset.connect(signer_A).changeSystemTimestamp(hold.expirationTimestamp + 1);

        await expect(asset.reclaimHoldByPartition(holdIdentifier))
          .to.emit(asset, "Approval")
          .withArgs(signer_A.address, signer_B.address, _AMOUNT);

        expect(await asset.allowance(signer_A.address, signer_B.address)).to.be.equal(_AMOUNT);
      });

      describe("bug Transfer", () => {
        it("GIVEN operator authorized WHEN operatorCreateHoldByPartition THEN Transfer event emitted", async () => {
          await asset.connect(signer_A).authorizeOperator(signer_B.address);

          await expect(
            asset
              .connect(signer_B)
              .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
          )
            .to.emit(asset, "Transfer")
            .withArgs(signer_A.address, ethers.ZeroAddress, _AMOUNT);
        });
      });

      describe("FIND-066", () => {
        it("GIVEN an unlimited allowance WHEN createHoldFromByPartition and releaseHoldByPartition THEN no third party is recorded and the allowance stays unlimited", async () => {
          await asset.connect(signer_A).approve(signer_B.address, MAX_UINT256);

          await asset
            .connect(signer_B)
            .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES);

          expect(await asset.getHoldThirdParty(holdIdentifier)).to.equal(ADDRESS_ZERO);
          expect(await asset.allowance(signer_A.address, signer_B.address)).to.equal(MAX_UINT256);

          await expect(asset.connect(signer_B).releaseHoldByPartition(holdIdentifier, _AMOUNT)).to.not.emit(
            asset,
            "Approval",
          );

          expect(await asset.allowance(signer_A.address, signer_B.address)).to.equal(MAX_UINT256);
        });

        it("GIVEN a finite allowance debited by a hold WHEN the owner re-approves an unlimited allowance before releaseHoldByPartition THEN restoration is skipped without reverting", async () => {
          await asset.connect(signer_A).increaseAllowance(signer_B.address, _AMOUNT);

          await asset
            .connect(signer_B)
            .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES);

          expect(await asset.getHoldThirdParty(holdIdentifier)).to.equal(signer_B.address);
          expect(await asset.allowance(signer_A.address, signer_B.address)).to.equal(ZERO);

          await asset.connect(signer_A).approve(signer_B.address, MAX_UINT256);

          await expect(asset.connect(signer_B).releaseHoldByPartition(holdIdentifier, _AMOUNT)).to.not.be.reverted;

          expect(await asset.allowance(signer_A.address, signer_B.address)).to.equal(MAX_UINT256);
        });

        it("GIVEN a hold created by an authorized operator WHEN releaseHoldByPartition THEN the allowance between owner and operator is untouched", async () => {
          await asset.connect(signer_A).authorizeOperator(signer_B.address);

          await asset
            .connect(signer_B)
            .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES);

          expect(await asset.allowance(signer_A.address, signer_B.address)).to.equal(ZERO);

          await expect(asset.connect(signer_B).releaseHoldByPartition(holdIdentifier, _AMOUNT)).to.not.emit(
            asset,
            "Approval",
          );

          expect(await asset.allowance(signer_A.address, signer_B.address)).to.equal(ZERO);
        });
      });
    });

    describe("Multi-partition", () => {
      beforeEach(async () => {
        const ctx = getCtx();
        signer_A = ctx.deployer;
        signer_B = ctx.user1;
        signer_C = ctx.user2;
        signer_D = ctx.user3;
        signer_E = ctx.user4;
        asset = ctx.asset;

        await asset.setMultiPartition(true);
        await executeRbac(asset, set_initRbacs());
        await setFacets(asset);
      });

      it("Given token with partition protected WHEN createHoldByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        await asset.connect(signer_B).protectPartitions();

        currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;

        hold = {
          amount: _AMOUNT,
          expirationTimestamp: currentTimestamp + ONE_YEAR_IN_SECONDS,
          escrow: signer_B.address,
          to: ADDRESS_ZERO,
          data: _DATA,
        };

        await expect(asset.createHoldByPartition(_DEFAULT_PARTITION, hold)).to.be.revertedWithCustomError(
          asset,
          "PartitionsAreProtectedAndNoRole",
        );
      });

      it("Given token with partition protected WHEN createHoldFromByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        await asset.connect(signer_B).protectPartitions();

        currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;

        hold = {
          amount: _AMOUNT,
          expirationTimestamp: currentTimestamp + ONE_YEAR_IN_SECONDS,
          escrow: signer_B.address,
          to: ADDRESS_ZERO,
          data: _DATA,
        };

        await expect(
          asset
            .connect(signer_B)
            .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
      });

      it("GIVEN a Token WHEN createHoldByPartition for wrong partition THEN transaction fails with InvalidPartition", async () => {
        await expect(asset.createHoldByPartition(_WRONG_PARTITION, hold)).to.be.revertedWithCustomError(
          asset,
          "InvalidPartition",
        );
      });

      describe("Adjust balances", () => {
        async function setPreBalanceAdjustment() {
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ADJUSTMENT_BALANCE, signer_C.address);
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_ISSUER, signer_A.address);
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CAP, signer_A.address);
          await asset.connect(signer_A).grantRole(ATS_ROLES.ROLE_CONTROLLER, signer_A.address);

          await asset.connect(signer_A).setMaxSupply(maxSupply_Original);
          await asset.connect(signer_A).setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply_Partition_1_Original);

          await asset.connect(signer_A).issueByPartition({
            partition: _PARTITION_ID_1,
            tokenHolder: signer_A.address,
            value: balanceOf_A_Original[0],
            data: EMPTY_HEX_BYTES,
          });
          await asset.connect(signer_A).issueByPartition({
            partition: _PARTITION_ID_2,
            tokenHolder: signer_A.address,
            value: balanceOf_A_Original[1],
            data: EMPTY_HEX_BYTES,
          });
          await asset.connect(signer_A).issueByPartition({
            partition: _PARTITION_ID_1,
            tokenHolder: signer_B.address,
            value: balanceOf_B_Original[0],
            data: EMPTY_HEX_BYTES,
          });
          await asset.connect(signer_A).issueByPartition({
            partition: _PARTITION_ID_2,
            tokenHolder: signer_B.address,
            value: balanceOf_B_Original[1],
            data: EMPTY_HEX_BYTES,
          });
        }

        it("GIVEN a hold WHEN adjustBalances THEN hold amount gets updated succeeds", async () => {
          await setPreBalanceAdjustment();

          const balance_Before = await asset.balanceOf(signer_A.address);
          const balance_Before_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

          const hold = {
            amount: _AMOUNT,
            expirationTimestamp: dateToUnixTimestamp("2030-01-01T00:00:01Z"),
            escrow: signer_B.address,
            to: ADDRESS_ZERO,
            data: EMPTY_HEX_BYTES,
          };

          await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

          const hold_TotalAmount_Before = await asset.getHeldAmountFor(signer_A.address);
          const hold_TotalAmount_Before_Partition_1 = await asset.getHeldAmountForByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );
          const hold_Before = await asset.getHoldForByPartition(holdIdentifier);

          // adjustBalances
          await asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

          // scheduled two balance updates
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

          // wait for first scheduled balance adjustment only
          await asset.connect(signer_A).changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:00:03Z"));

          const hold_TotalAmount_After = await asset.getHeldAmountFor(signer_A.address);
          const hold_TotalAmount_After_Partition_1 = await asset.getHeldAmountForByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );
          const hold_After = await asset.getHoldForByPartition(holdIdentifier);
          const balance_After = await asset.balanceOf(signer_A.address);
          const balance_After_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

          expect(hold_TotalAmount_After).to.be.equal(hold_TotalAmount_Before * BigInt(adjustFactor * adjustFactor));
          expect(hold_TotalAmount_After_Partition_1).to.be.equal(
            hold_TotalAmount_Before_Partition_1 * BigInt(adjustFactor * adjustFactor),
          );
          expect(balance_After).to.be.equal((balance_Before - BigInt(_AMOUNT)) * BigInt(adjustFactor * adjustFactor));
          expect(hold_TotalAmount_After).to.be.equal(hold_TotalAmount_Before * BigInt(adjustFactor * adjustFactor));
          expect(balance_After_Partition_1).to.be.equal(
            (balance_Before_Partition_1 - BigInt(_AMOUNT)) * BigInt(adjustFactor * adjustFactor),
          );
          expect(hold_After.amount_).to.be.equal(hold_Before.amount_ * BigInt(adjustFactor * adjustFactor));
        });

        it("GIVEN a hold WHEN adjustBalances THEN execute succeed", async () => {
          await setPreBalanceAdjustment();
          const balance_Before_A = await asset.balanceOf(signer_A.address);
          const balance_Before_Partition_1_A = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
          const balance_Before_C = await asset.balanceOf(signer_C.address);
          const balance_Before_Partition_1_C = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_C.address);

          const currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;

          const hold = {
            amount: _AMOUNT,
            expirationTimestamp: currentTimestamp + 10 * ONE_SECOND,
            escrow: signer_B.address,
            to: ADDRESS_ZERO,
            data: EMPTY_HEX_BYTES,
          };

          await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

          hold.expirationTimestamp = currentTimestamp + 100 * ONE_SECOND;
          await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

          const held_Amount_Before = await asset.getHeldAmountFor(signer_A.address);
          const held_Amount_Before_Partition_1 = await asset.getHeldAmountForByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );

          // adjustBalances
          await asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

          // EXECUTE HOLD
          await asset
            .connect(signer_B)
            .executeHoldByPartition(holdIdentifier, signer_C.address, hold.amount * adjustFactor);

          const balance_After_Execute_A = await asset.balanceOf(signer_A.address);
          const balance_After_Execute_Partition_1_A = await asset.balanceOfByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );
          const balance_After_Execute_C = await asset.balanceOf(signer_C.address);
          const balance_After_Execute_Partition_1_C = await asset.balanceOfByPartition(
            _PARTITION_ID_1,
            signer_C.address,
          );
          const held_Amount_After = await asset.getHeldAmountFor(signer_A.address);
          const held_Amount_After_Partition_1 = await asset.getHeldAmountForByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );

          expect(balance_After_Execute_A).to.be.equal(
            (balance_Before_A - BigInt(_AMOUNT) - BigInt(_AMOUNT)) * BigInt(adjustFactor),
          );
          expect(balance_After_Execute_C).to.be.equal((balance_Before_C + BigInt(_AMOUNT)) * BigInt(adjustFactor));
          expect(balance_After_Execute_Partition_1_A).to.be.equal(
            (balance_Before_Partition_1_A - BigInt(_AMOUNT) - BigInt(_AMOUNT)) * BigInt(adjustFactor),
          );
          expect(balance_After_Execute_Partition_1_C).to.be.equal(
            (balance_Before_Partition_1_C + BigInt(_AMOUNT)) * BigInt(adjustFactor),
          );
          expect(held_Amount_After).to.be.equal((held_Amount_Before - BigInt(_AMOUNT)) * BigInt(adjustFactor));
          expect(held_Amount_After_Partition_1).to.be.equal(
            (held_Amount_Before_Partition_1 - BigInt(_AMOUNT)) * BigInt(adjustFactor),
          );
          expect(balance_After_Execute_A + held_Amount_After).to.be.equal(
            (balance_Before_A - BigInt(_AMOUNT)) * BigInt(adjustFactor),
          );
          expect(balance_After_Execute_Partition_1_A + held_Amount_After_Partition_1).to.be.equal(
            (balance_Before_Partition_1_A - BigInt(_AMOUNT)) * BigInt(adjustFactor),
          );
        });

        it("GIVEN a hold WHEN adjustBalances THEN release succeed", async () => {
          await setPreBalanceAdjustment();
          const balance_Before = await asset.balanceOf(signer_A.address);
          const balance_Before_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

          const currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;

          const hold = {
            amount: _AMOUNT,
            expirationTimestamp: currentTimestamp + 10 * ONE_SECOND,
            escrow: signer_B.address,
            to: ADDRESS_ZERO,
            data: EMPTY_HEX_BYTES,
          };

          await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

          hold.expirationTimestamp = currentTimestamp + 100 * ONE_SECOND;
          await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

          const held_Amount_Before = await asset.getHeldAmountFor(signer_A.address);
          const held_Amount_Before_Partition_1 = await asset.getHeldAmountForByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );

          // adjustBalances
          await asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

          // RELEASE HOLD
          await asset.connect(signer_B).releaseHoldByPartition(holdIdentifier, hold.amount * adjustFactor);

          const balance_After_Release = await asset.balanceOf(signer_A.address);
          const balance_After_Release_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
          const held_Amount_After = await asset.getHeldAmountFor(signer_A.address);
          const held_Amount_After_Partition_1 = await asset.getHeldAmountForByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );

          expect(balance_After_Release).to.be.equal((balance_Before - BigInt(_AMOUNT)) * BigInt(adjustFactor));
          expect(balance_After_Release_Partition_1).to.be.equal(
            (balance_Before_Partition_1 - BigInt(_AMOUNT)) * BigInt(adjustFactor),
          );
          expect(held_Amount_After).to.be.equal((held_Amount_Before - BigInt(_AMOUNT)) * BigInt(adjustFactor));
          expect(held_Amount_After_Partition_1).to.be.equal(
            (held_Amount_Before_Partition_1 - BigInt(_AMOUNT)) * BigInt(adjustFactor),
          );
          expect(balance_After_Release + held_Amount_After).to.be.equal(balance_Before * BigInt(adjustFactor));
          expect(balance_After_Release_Partition_1 + held_Amount_After_Partition_1).to.be.equal(
            balance_Before_Partition_1 * BigInt(adjustFactor),
          );
        });

        it("GIVEN a hold WHEN adjustBalances THEN reclaim succeed", async () => {
          await setPreBalanceAdjustment();
          const balance_Before = await asset.balanceOf(signer_A.address);
          const balance_Before_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

          const currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;

          const hold = {
            amount: _AMOUNT,
            expirationTimestamp: currentTimestamp + ONE_SECOND,
            escrow: signer_B.address,
            to: ADDRESS_ZERO,
            data: EMPTY_HEX_BYTES,
          };

          await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

          hold.expirationTimestamp = currentTimestamp + 100 * ONE_SECOND;
          await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

          const held_Amount_Before = await asset.getHeldAmountFor(signer_A.address);
          const held_Amount_Before_Partition_1 = await asset.getHeldAmountForByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );

          // adjustBalances
          await asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

          // RECLAIM HOLD
          await asset
            .connect(signer_A)
            .changeSystemTimestamp((await ethers.provider.getBlock("latest"))!.timestamp + 2 * ONE_SECOND);
          await asset.connect(signer_B).reclaimHoldByPartition(holdIdentifier);

          const balance_After_Release = await asset.balanceOf(signer_A.address);
          const balance_After_Release_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
          const held_Amount_After = await asset.getHeldAmountFor(signer_A.address);
          const held_Amount_After_Partition_1 = await asset.getHeldAmountForByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );

          expect(balance_After_Release).to.be.equal((balance_Before - BigInt(_AMOUNT)) * BigInt(adjustFactor));
          expect(balance_After_Release_Partition_1).to.be.equal(
            (balance_Before_Partition_1 - BigInt(_AMOUNT)) * BigInt(adjustFactor),
          );
          expect(held_Amount_After).to.be.equal((held_Amount_Before - BigInt(_AMOUNT)) * BigInt(adjustFactor));
          expect(held_Amount_After_Partition_1).to.be.equal(
            (held_Amount_Before_Partition_1 - BigInt(_AMOUNT)) * BigInt(adjustFactor),
          );
          expect(balance_After_Release + held_Amount_After).to.be.equal(balance_Before * BigInt(adjustFactor));
          expect(balance_After_Release_Partition_1 + held_Amount_After_Partition_1).to.be.equal(
            balance_Before_Partition_1 * BigInt(adjustFactor),
          );
        });

        it("GIVEN a hold WHEN adjustBalances THEN hold succeeds", async () => {
          await setPreBalanceAdjustment();
          const balance_Before = await asset.balanceOf(signer_A.address);
          const balance_Before_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

          const currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;

          const hold = {
            amount: _AMOUNT,
            expirationTimestamp: currentTimestamp + 100 * ONE_SECOND,
            escrow: signer_B.address,
            to: ADDRESS_ZERO,
            data: EMPTY_HEX_BYTES,
          };

          await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

          const held_Amount_Before = await asset.getHeldAmountFor(signer_A.address);
          const held_Amount_Before_Partition_1 = await asset.getHeldAmountForByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );

          // adjustBalances
          await asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

          // HOLD AFTER BALANCE ADJUSTMENT
          await asset.connect(signer_A).createHoldByPartition(_PARTITION_ID_1, hold);

          const balance_After_Hold = await asset.balanceOf(signer_A.address);
          const balance_After_Hold_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
          const held_Amount_After = await asset.getHeldAmountFor(signer_A.address);
          const held_Amount_After_Partition_1 = await asset.getHeldAmountForByPartition(
            _PARTITION_ID_1,
            signer_A.address,
          );

          expect(balance_After_Hold).to.be.equal(
            (balance_Before - BigInt(_AMOUNT)) * BigInt(adjustFactor) - BigInt(_AMOUNT),
          );
          expect(balance_After_Hold_Partition_1).to.be.equal(
            (balance_Before_Partition_1 - BigInt(_AMOUNT)) * BigInt(adjustFactor) - BigInt(_AMOUNT),
          );
          expect(held_Amount_After).to.be.equal(held_Amount_Before * BigInt(adjustFactor) + BigInt(_AMOUNT));
          expect(held_Amount_After_Partition_1).to.be.equal(
            held_Amount_Before_Partition_1 * BigInt(adjustFactor) + BigInt(_AMOUNT),
          );
          expect(balance_After_Hold + held_Amount_After).to.be.equal(balance_Before * BigInt(adjustFactor));
          expect(balance_After_Hold_Partition_1 + held_Amount_After_Partition_1).to.be.equal(
            balance_Before_Partition_1 * BigInt(adjustFactor),
          );
        });
      });
    });

    describe("Deactivated", () => {
      it("GIVEN a deactivated asset WHEN createHoldByPartition THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(
          asset.connect(signer_A).createHoldByPartition(ethers.ZeroHash, {
            amount: 0,
            expirationTimestamp: 0,
            escrow: ethers.ZeroAddress,
            to: ethers.ZeroAddress,
            data: "0x",
          }),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN createHoldFromByPartition THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(
          asset
            .connect(signer_A)
            .createHoldFromByPartition(
              ethers.ZeroHash,
              ethers.ZeroAddress,
              { amount: 0, expirationTimestamp: 0, escrow: ethers.ZeroAddress, to: ethers.ZeroAddress, data: "0x" },
              "0x",
            ),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN executeHoldByPartition THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(
          asset
            .connect(signer_A)
            .executeHoldByPartition(
              { partition: ethers.ZeroHash, tokenHolder: ethers.ZeroAddress, holdId: 0 },
              ethers.ZeroAddress,
              0,
            ),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN releaseHoldByPartition THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(
          asset
            .connect(signer_A)
            .releaseHoldByPartition({ partition: ethers.ZeroHash, tokenHolder: ethers.ZeroAddress, holdId: 0 }, 0),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });

      it("GIVEN a deactivated asset WHEN reclaimHoldByPartition THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(
          asset
            .connect(signer_A)
            .reclaimHoldByPartition({ partition: ethers.ZeroHash, tokenHolder: ethers.ZeroAddress, holdId: 0 }),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeHoldByPartition", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeHoldByPartition is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeHoldByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeHoldByPartition is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeHoldByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.holdByPartition, 1);
      });
    });

    describe("initializeHoldByPartition event", () => {
      it("GIVEN a fresh deployment WHEN initializeHoldByPartition is called THEN emits HoldByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.holdByPartition);
        await expect(asset.initializeHoldByPartition()).to.emit(asset, "HoldByPartitionInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational asset WHEN createHoldByPartition THEN reverts with AssetNotOperational", async () => {
        const minimalHold = { amount: 0, expirationTimestamp: 0, escrow: ADDRESS_ZERO, to: ADDRESS_ZERO, data: "0x" };
        await expect(asset.createHoldByPartition(_DEFAULT_PARTITION, minimalHold)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });

      it("GIVEN non-operational asset WHEN createHoldFromByPartition THEN reverts with AssetNotOperational", async () => {
        const minimalHold = { amount: 0, expirationTimestamp: 0, escrow: ADDRESS_ZERO, to: ADDRESS_ZERO, data: "0x" };
        await expect(
          asset.createHoldFromByPartition(_DEFAULT_PARTITION, ADDRESS_ZERO, minimalHold, "0x"),
        ).to.be.revertedWithCustomError(asset, "AssetNotOperational");
      });

      it("GIVEN non-operational asset WHEN executeHoldByPartition THEN reverts with AssetNotOperational", async () => {
        const minimalId = { partition: _DEFAULT_PARTITION, tokenHolder: ADDRESS_ZERO, holdId: 0 };
        await expect(asset.executeHoldByPartition(minimalId, ADDRESS_ZERO, 0)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });

      it("GIVEN non-operational asset WHEN releaseHoldByPartition THEN reverts with AssetNotOperational", async () => {
        const minimalId = { partition: _DEFAULT_PARTITION, tokenHolder: ADDRESS_ZERO, holdId: 0 };
        await expect(asset.releaseHoldByPartition(minimalId, 0)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });

      it("GIVEN non-operational asset WHEN reclaimHoldByPartition THEN reverts with AssetNotOperational", async () => {
        const minimalId = { partition: _DEFAULT_PARTITION, tokenHolder: ADDRESS_ZERO, holdId: 0 };
        await expect(asset.reclaimHoldByPartition(minimalId)).to.be.revertedWithCustomError(
          asset,
          "AssetNotOperational",
        );
      });
    });
  });
}
