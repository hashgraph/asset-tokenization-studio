// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture } from "@test";
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
import { ResolverProxy, IAsset } from "@contract-types";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _PARTITION_ID_2 = "0x0000000000000000000000000000000000000000000000000000000000000002";
const _AMOUNT = 1000;
const _DATA = "0x1234";
const maxSupply_Original = 1000000 * _AMOUNT;
const maxSupply_Partition_1_Original = 50000 * _AMOUNT;
const maxSupply_Partition_2_Original = 0;
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

describe("HoldByPartition Tests", () => {
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

  let hold: any;

  const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes32", "bytes32"],
    [ATS_ROLES.PROTECTED_PARTITIONS_PARTICIPANT_ROLE, DEFAULT_PARTITION],
  );
  const packedDataWithoutPrefix = packedData.slice(2);
  const ProtectedPartitionRole_1 = ethers.keccak256("0x" + packedDataWithoutPrefix);

  function set_initRbacs() {
    return [
      {
        role: ATS_ROLES.ISSUER_ROLE,
        members: [signer_B.address],
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
      {
        role: ATS_ROLES.CLEARING_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES.CORPORATE_ACTION_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.CONTROL_LIST_ROLE,
        members: [signer_E.address],
      },
      {
        role: ATS_ROLES.CONTROLLER_ROLE,
        members: [signer_C.address],
      },
      {
        role: ATS_ROLES.PROTECTED_PARTITIONS_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.AGENT_ROLE,
        members: [signer_A.address],
      },
      { role: ProtectedPartitionRole_1, members: [signer_B.address] },
    ];
  }

  async function setFacets(asset: IAsset) {
    // Set the initial RBACs
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
    signer_E = base.user4;

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
    signer_E = base.user4;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    await executeRbac(asset, set_initRbacs());

    await setFacets(asset);
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
      await loadFixture(deploySecurityFixtureSinglePartition);
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

        await asset.connect(signer_A).grantRole(ATS_ROLES.SNAPSHOT_ROLE, signer_A.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.LOCKER_ROLE, signer_A.address);

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
        // Pausing the token
        await asset.connect(signer_D).pause();
      });

      // Create
      it("GIVEN a paused Token WHEN createHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(asset.createHoldByPartition(_DEFAULT_PARTITION, hold)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused Token WHEN createHoldFromByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          asset.createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      // Execute
      it("GIVEN a paused Token WHEN executeHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(asset.executeHoldByPartition(holdIdentifier, signer_C.address, 1)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      // Release
      it("GIVEN a paused Token WHEN releaseHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(asset.releaseHoldByPartition(holdIdentifier, 1)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      // Reclaim
      it("GIVEN a paused Token WHEN reclaimHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(asset.reclaimHoldByPartition(holdIdentifier)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
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
      // Create
      it("GIVEN an account without authorization WHEN createHoldFromByPartition THEN transaction fails with InsufficientAllowance", async () => {
        await expect(
          asset
            .connect(signer_D)
            .createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "InsufficientAllowance");
      });
    });

    describe("Control List", () => {
      // Execute
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
        await asset.connect(signer_A).recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

        await expect(asset.createHoldByPartition(_DEFAULT_PARTITION, hold)).to.be.revertedWithCustomError(
          asset,
          "WalletRecovered",
        );
      });

      it("GIVEN hold.to recovering WHEN createHoldByPartition THEN transaction fails with WalletRecovered", async () => {
        const hold_with_destination = {
          amount: _AMOUNT,
          expirationTimestamp: expirationTimestamp,
          escrow: signer_B.address,
          to: signer_C.address,
          data: _DATA,
        };

        await asset.connect(signer_A).recoveryAddress(signer_C.address, signer_B.address, ADDRESS_ZERO);

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
          asset.connect(signer_B).createHoldFromByPartition(_WRONG_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
        ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
      });
    });

    describe("Create Holds OK", () => {
      // Create
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
    });

    describe("Reclaim with wrong input arguments", () => {
      it("GIVEN a wrong id WHEN reclaimHoldByPartition THEN transaction fails with WrongHoldId", async () => {
        holdIdentifier.holdId = 2;
        await asset.createHoldByPartition(_DEFAULT_PARTITION, hold);

        await expect(asset.reclaimHoldByPartition(holdIdentifier)).to.be.revertedWithCustomError(asset, "WrongHoldId");
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
  });

  describe("Multi-partition", () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureMultiPartition);
    });

    it("Given token with partition protected WHEN createHoldByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
            arePartitionsProtected: true,
          },
        },
      });
      await executeRbac(asset, set_initRbacs());
      diamond = base.diamond;
      asset = await ethers.getContractAt("IAsset", diamond.target);
      await setFacets(asset);

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
      const base = await deployEquityTokenFixture({
        equityDataParams: {
          securityData: {
            isMultiPartition: true,
            arePartitionsProtected: true,
          },
        },
      });
      await executeRbac(asset, set_initRbacs());
      diamond = base.diamond;
      asset = await ethers.getContractAt("IAsset", diamond.target);
      await setFacets(asset);

      currentTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;

      hold = {
        amount: _AMOUNT,
        expirationTimestamp: currentTimestamp + ONE_YEAR_IN_SECONDS,
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: _DATA,
      };

      await expect(
        asset.connect(signer_B).createHoldFromByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
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
        await asset.connect(signer_A).grantRole(ATS_ROLES.ADJUSTMENT_BALANCE_ROLE, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.CAP_ROLE, signer_A.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.CONTROLLER_ROLE, signer_A.address);

        await asset.connect(signer_A).setMaxSupply(maxSupply_Original);
        await asset.connect(signer_A).setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply_Partition_1_Original);
        await asset.connect(signer_A).setMaxSupplyByPartition(_PARTITION_ID_2, maxSupply_Partition_2_Original);

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

        // HOLD
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

        // HOLD TWICE
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
        const balance_After_Execute_Partition_1_A = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
        const balance_After_Execute_C = await asset.balanceOf(signer_C.address);
        const balance_After_Execute_Partition_1_C = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_C.address);
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

        // HOLD TWICE
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

        // HOLD TWICE
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

        // HOLD BEFORE BALANCE ADJUSTMENT
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
});
