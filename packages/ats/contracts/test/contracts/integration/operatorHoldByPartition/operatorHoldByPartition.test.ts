// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import type { AssetMockCtx } from "@test";
import { executeRbac, MAX_UINT256 } from "@test";
import {
  EMPTY_STRING,
  ATS_ROLES,
  ZERO,
  EMPTY_HEX_BYTES,
  ADDRESS_ZERO,
  DEFAULT_PARTITION,
  RESOLVER_KEYS,
} from "@scripts";
import { IAssetMock } from "@contract-types";
import { ASSET_MOCK_CONFIG_ID } from "../../../fixtures/deploy/assetMockConfiguration";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const _AMOUNT = 1000;
const _DATA = "0x1234";
const EMPTY_VC_ID = EMPTY_STRING;
let holdIdentifier: any;
enum ThirdPartyType {
  NULL,
  AUTHORIZED,
  OPERATOR,
  PROTECTED,
  CONTROLLER,
  CLEARING,
}

export function operatorHoldByPartitionTests(getCtx: () => AssetMockCtx): void {
  describe("operatorCreateHoldByPartition", () => {
    let signer_A: HardhatEthersSigner;
    let signer_B: HardhatEthersSigner;
    let signer_C: HardhatEthersSigner;
    let signer_D: HardhatEthersSigner;
    let signer_E: HardhatEthersSigner;

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
      asset = ctx.asset;

      await executeRbac(asset, set_initRbacs());
      await setFacets(asset);

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

    // --- modifier: onlyUnpaused ---
    it("GIVEN a paused token WHEN operatorCreateHoldByPartition THEN reverts with IsPaused", async () => {
      await asset.connect(signer_D).pause();
      await expect(
        asset.operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "IsPaused");
    });

    // --- modifier: onlyClearingDisabled ---
    it("GIVEN clearing is activated WHEN operatorCreateHoldByPartition THEN reverts with ClearingIsActivated", async () => {
      await asset.connect(signer_A).activateClearing();
      await expect(
        asset.operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "ClearingIsActivated");
    });

    // --- modifier: onlyValidOperatorCreateHoldByPartition (access) ---
    it("GIVEN an account without operator authorisation WHEN operatorCreateHoldByPartition THEN reverts with Unauthorized", async () => {
      await expect(
        asset
          .connect(signer_B)
          .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "Unauthorized");
    });

    // --- modifier: onlyValidOperatorCreateHoldByPartition (recovered addresses) ---
    it("GIVEN a recovered msgSender WHEN operatorCreateHoldByPartition THEN reverts with WalletRecovered", async () => {
      await asset.connect(signer_A).authorizeOperator(signer_B.address);
      await asset.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);

      await expect(
        asset
          .connect(signer_B)
          .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "WalletRecovered");
    });

    it("GIVEN a recovered _from address WHEN operatorCreateHoldByPartition THEN reverts with WalletRecovered", async () => {
      await asset.connect(signer_A).authorizeOperator(signer_B.address);
      await asset.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

      await expect(
        asset
          .connect(signer_B)
          .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "WalletRecovered");
    });

    it("GIVEN a recovered hold.to address WHEN operatorCreateHoldByPartition THEN reverts with WalletRecovered", async () => {
      const holdWithTo = { ...hold, to: signer_C.address };
      await asset.connect(signer_A).authorizeOperator(signer_B.address);
      await asset.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);

      await expect(
        asset
          .connect(signer_B)
          .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, holdWithTo, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "WalletRecovered");
    });

    // --- modifier: onlyValidOperatorCreateHoldByPartition (input validation) ---
    it("GIVEN _from is the zero address WHEN operatorCreateHoldByPartition THEN reverts with ZeroAddressNotAllowed", async () => {
      const hold_wrong = {
        amount: _AMOUNT,
        expirationTimestamp: expirationTimestamp,
        escrow: ADDRESS_ZERO,
        to: ADDRESS_ZERO,
        data: _DATA,
      };
      await expect(
        asset
          .connect(signer_B)
          .operatorCreateHoldByPartition(_DEFAULT_PARTITION, ADDRESS_ZERO, hold_wrong, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });

    it("GIVEN hold.escrow is the zero address WHEN operatorCreateHoldByPartition THEN reverts with ZeroAddressNotAllowed", async () => {
      const hold_wrong = {
        amount: _AMOUNT,
        expirationTimestamp: expirationTimestamp,
        escrow: ADDRESS_ZERO,
        to: ADDRESS_ZERO,
        data: _DATA,
      };

      await asset.connect(signer_A).authorizeOperator(signer_B.address);

      await expect(
        asset
          .connect(signer_B)
          .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
    });

    it("GIVEN an expired expirationTimestamp WHEN operatorCreateHoldByPartition THEN reverts with WrongExpirationTimestamp", async () => {
      await asset.connect(signer_A).changeSystemTimestamp(currentTimestamp);
      const wrongExpirationTimestamp = currentTimestamp - 1;

      const hold_wrong = {
        amount: _AMOUNT,
        expirationTimestamp: wrongExpirationTimestamp,
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: _DATA,
      };

      await asset.connect(signer_A).authorizeOperator(signer_B.address);

      await expect(
        asset
          .connect(signer_B)
          .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
    });

    it("GIVEN hold.amount exceeds balance WHEN operatorCreateHoldByPartition THEN reverts with InsufficientBalance", async () => {
      const AmountLargerThanBalance = 1000 * _AMOUNT;

      const hold_wrong = {
        amount: AmountLargerThanBalance,
        expirationTimestamp: expirationTimestamp,
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: _DATA,
      };

      await asset.connect(signer_A).authorizeOperator(signer_B.address);

      await expect(
        asset
          .connect(signer_B)
          .operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold_wrong, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "InsufficientBalance");
    });

    // --- modifier: onlyValidOperatorCreateHoldByPartition (partition rules) ---
    it("GIVEN a wrong partition in single-partition mode WHEN operatorCreateHoldByPartition THEN reverts with PartitionNotAllowedInSinglePartitionMode", async () => {
      await asset.connect(signer_A).authorizeOperator(signer_B.address);

      await expect(
        asset
          .connect(signer_B)
          .operatorCreateHoldByPartition(_WRONG_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
    });

    it("GIVEN a non-existent partition in multi-partition mode WHEN operatorCreateHoldByPartition THEN reverts with InvalidPartition", async () => {
      await asset.setMultiPartition(true);

      await asset.connect(signer_A).authorizeOperator(signer_B.address);

      await expect(
        asset
          .connect(signer_B)
          .operatorCreateHoldByPartition(_WRONG_PARTITION, signer_A.address, hold, EMPTY_HEX_BYTES),
      ).to.be.revertedWithCustomError(asset, "InvalidPartition");
    });

    // --- modifier: onlyUnProtectedPartitionsOrWildCardRole ---
    it("GIVEN protected partitions with no ROLE_WILD_CARD WHEN operatorCreateHoldByPartition THEN reverts with PartitionsAreProtectedAndNoRole", async () => {
      await asset.connect(signer_B).protectPartitions();
      const operatorData = "0xab56";

      await asset.connect(signer_A).authorizeOperator(signer_B.address);
      await expect(
        asset.connect(signer_B).operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, operatorData),
      ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
    });

    // --- happy path ---
    it("GIVEN an authorised operator WHEN operatorCreateHoldByPartition THEN emits OperatorHeldByPartition and returns success with holdId", async () => {
      const operatorData = "0xab56";

      await asset.connect(signer_A).authorizeOperator(signer_B.address);

      await expect(
        asset.connect(signer_B).operatorCreateHoldByPartition(_DEFAULT_PARTITION, signer_A.address, hold, operatorData),
      )
        .to.emit(asset, "OperatorHeldByPartition")
        .withArgs(signer_B.address, signer_A.address, _DEFAULT_PARTITION, 1, Object.values(hold), operatorData);

      await asset.connect(signer_A).revokeOperator(signer_B.address);

      await checkCreatedHold_expected(
        0,
        _AMOUNT,
        1,
        hold.amount,
        hold.escrow,
        hold.data,
        operatorData,
        hold.to,
        hold.expirationTimestamp,
        1,
        1,
        ThirdPartyType.OPERATOR,
        ADDRESS_ZERO,
      );
    });

    describe("Deactivated", () => {
      it("GIVEN a deactivated asset WHEN operatorCreateHoldByPartition THEN transaction fails with Deactivated", async () => {
        await asset.forceDeactivate();
        await expect(
          asset.operatorCreateHoldByPartition(
            ethers.ZeroHash,
            ethers.ZeroAddress,
            { amount: 0, expirationTimestamp: 0, escrow: ethers.ZeroAddress, to: ethers.ZeroAddress, data: "0x" },
            "0x",
          ),
        ).to.be.revertedWithCustomError(asset, "Deactivated");
      });
    });

    describe("initializeOperatorHoldByPartition", () => {
      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeOperatorHoldByPartition is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_D).initializeOperatorHoldByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_D.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeOperatorHoldByPartition is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeOperatorHoldByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.operatorHoldByPartition, 1);
      });
    });

    describe("initializeOperatorHoldByPartition event", () => {
      it("GIVEN a fresh deployment WHEN initializeOperatorHoldByPartition is called THEN emits OperatorHoldByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.operatorHoldByPartition);
        await expect(asset.initializeOperatorHoldByPartition()).to.emit(asset, "OperatorHoldByPartitionInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN caller without DEFAULT_ADMIN_ROLE WHEN initializeOperatorHoldByPartition is called THEN AccountHasNoRole", async () => {
        await expect(asset.connect(signer_C).initializeOperatorHoldByPartition())
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(signer_C.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      it("GIVEN already-initialised WHEN initializeOperatorHoldByPartition is called again THEN FacetAlreadyRegistered", async () => {
        await expect(asset.initializeOperatorHoldByPartition())
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(RESOLVER_KEYS.operatorHoldByPartition, 1);
      });
    });

    describe("initializeOperatorHoldByPartition event", () => {
      it("GIVEN a fresh deployment WHEN initializeOperatorHoldByPartition is called THEN emits OperatorHoldByPartitionInitialized", async () => {
        await asset.forceFacetNotRegistered(RESOLVER_KEYS.operatorHoldByPartition);
        await expect(asset.initializeOperatorHoldByPartition()).to.emit(asset, "OperatorHoldByPartitionInitialized");
      });
    });

    describe("nonOperational", () => {
      beforeEach(async () => {
        await asset.forceNonOperational();
      });

      it("GIVEN non-operational WHEN operatorCreateHoldByPartition is called THEN AssetNotOperational", async () => {
        await expect(
          asset.operatorCreateHoldByPartition(
            ethers.ZeroHash,
            ethers.ZeroAddress,
            { amount: 0n, expirationTimestamp: 0n, escrow: ethers.ZeroAddress, to: ethers.ZeroAddress, data: "0x" },
            "0x",
          ),
        )
          .to.be.revertedWithCustomError(asset, "AssetNotOperational")
          .withArgs(ASSET_MOCK_CONFIG_ID, 1);
      });
    });
  });
}
