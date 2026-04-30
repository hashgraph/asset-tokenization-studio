// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers, network } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { IAsset, type ResolverProxy } from "@contract-types";
import { ADDRESS_ZERO, ATS_ROLES, dateToUnixTimestamp, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO } from "@scripts";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

const _DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
const _WRONG_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000321";
const _PARTITION_ID_1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
const adjustFactor = 253;
const adjustDecimals = 2;
const _AMOUNT = 1000;
const _DATA = "0x1234";
const EMPTY_VC_ID = EMPTY_STRING;

enum ClearingOperationType {
  Transfer,
  Redeem,
  HoldCreation,
}

enum ThirdPartyType {
  NULL,
  AUTHORIZED,
  OPERATOR,
  PROTECTED,
  CONTROLLER,
  CLEARING,
}

interface Clearing {
  amount_: bigint;
  expirationTimestamp_: bigint;
  destination_: string;
  clearingOperationType_: ClearingOperationType;
  data_: string;
  operatorData_: string;
  thirdPartyType_: ThirdPartyType;
  hold_?: Hold;
}

interface ClearingIdentifier {
  partition: string;
  tokenHolder: string;
  clearingId: number;
  clearingOperationType: ClearingOperationType;
}

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

let clearingIdentifier: ClearingIdentifier;
let clearingOperation: ClearingOperation;
let clearingOperationFrom: ClearingOperationFrom;
let hold: Hold;

describe("Clearing Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;
  let signer_D: HardhatEthersSigner;
  let signer_E: HardhatEthersSigner;

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
    ];
  }

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

  async function deploySecurityFixtureMultiPartition() {
    const base = await deployEquityTokenFixture({
      equityDataParams: {
        securityData: {
          isMultiPartition: true,
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
      {
        role: ATS_ROLES.ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.CONTROLLER_ROLE,
        members: [signer_C.address],
      },
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [signer_D.address],
      },
      {
        role: ATS_ROLES.CONTROL_LIST_ROLE,
        members: [signer_E.address],
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
        role: ATS_ROLES.CLEARING_VALIDATOR_ROLE,
        members: [signer_A.address],
      },
    ]);

    await setFacets(asset);
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
      {
        role: ATS_ROLES.ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.CONTROLLER_ROLE,
        members: [signer_C.address],
      },
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [signer_D.address],
      },
      {
        role: ATS_ROLES.CONTROL_LIST_ROLE,
        members: [signer_E.address],
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
        role: ATS_ROLES.CLEARING_VALIDATOR_ROLE,
        members: [signer_A.address],
      },
    ]);

    await setFacets(asset);
  }

  async function checkCreatedClearingAmounts(
    balance_expected: number,
    account: string,
    totalClearedAmountByPartition_expected: number,
    totalClearedAmount_expected: number,
    clearingCount_Transfer_expected: number,
    clearingCount_Redeem_expected: number,
    clearingCount_HoldCreation_expected: number,
  ) {
    const balance = await asset.balanceOf(signer_A.address);
    const clearedAmountByPartition = await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, account);
    const clearedAmount = await asset.getClearedAmountFor(account);

    const clearingCount_Transfer = await asset.getClearingCountForByPartition(
      _DEFAULT_PARTITION,
      account,
      ClearingOperationType.Transfer,
    );
    const clearingCount_Redeem = await asset.getClearingCountForByPartition(
      _DEFAULT_PARTITION,
      account,
      ClearingOperationType.Redeem,
    );
    const clearingCount_HoldCreation = await asset.getClearingCountForByPartition(
      _DEFAULT_PARTITION,
      account,
      ClearingOperationType.HoldCreation,
    );

    const clearingIds_Transfer = await asset.getClearingsIdForByPartition(
      _DEFAULT_PARTITION,
      account,
      ClearingOperationType.Transfer,
      0,
      100,
    );
    const clearingIds_Redeem = await asset.getClearingsIdForByPartition(
      _DEFAULT_PARTITION,
      account,
      ClearingOperationType.Redeem,
      0,
      100,
    );
    const clearingIds_HoldCreation = await asset.getClearingsIdForByPartition(
      _DEFAULT_PARTITION,
      account,
      ClearingOperationType.HoldCreation,
      0,
      100,
    );

    expect(balance).to.equal(balance_expected);
    expect(clearedAmountByPartition).to.equal(totalClearedAmountByPartition_expected);
    expect(clearedAmount).to.equal(totalClearedAmount_expected);
    expect(clearingCount_Transfer).to.equal(clearingCount_Transfer_expected);
    expect(clearingCount_Redeem).to.equal(clearingCount_Redeem_expected);
    expect(clearingCount_HoldCreation).to.equal(clearingCount_HoldCreation_expected);
    expect(clearingIds_Transfer.length).to.equal(clearingCount_Transfer_expected);
    expect(clearingIds_Redeem.length).to.equal(clearingCount_Redeem_expected);
    expect(clearingIds_HoldCreation.length).to.equal(clearingCount_HoldCreation_expected);
  }

  async function checkCreatedClearingValues(
    clearingIdentifier: ClearingIdentifier,
    clearingType: ClearingOperationType,
    to: string,
    amount: number,
    expirationTimestamp: number,
    data: string,
    operatorData: string,
    operatorType: ThirdPartyType,
    thirdParty: string,
    hold?: Hold,
  ) {
    let clearing: any;
    if (clearingType == ClearingOperationType.Transfer)
      clearing = await asset.getClearingTransferForByPartition(
        clearingIdentifier.partition,
        clearingIdentifier.tokenHolder,
        clearingIdentifier.clearingId,
      );
    else if (clearingType == ClearingOperationType.Redeem)
      clearing = await asset.getClearingRedeemForByPartition(
        clearingIdentifier.partition,
        clearingIdentifier.tokenHolder,
        clearingIdentifier.clearingId,
      );
    else if (clearingType == ClearingOperationType.HoldCreation)
      clearing = await asset.getClearingCreateHoldForByPartition(
        clearingIdentifier.partition,
        clearingIdentifier.tokenHolder,
        clearingIdentifier.clearingId,
      );
    else throw new Error("Unrecognize ClearingOperationType");

    const clearingThirdParty = await asset.getClearingThirdParty(
      clearingIdentifier.partition,
      clearingIdentifier.tokenHolder,
      clearingType,
      clearingIdentifier.clearingId,
    );

    checkClearingValues(
      clearing,
      clearingThirdParty,
      clearingIdentifier,
      to,
      amount,
      expirationTimestamp,
      data,
      operatorData,
      operatorType,
      thirdParty,
      hold,
    );
  }

  async function checkClearingValues(
    clearing: Clearing,
    clearingThirdParty: string,
    clearingIdentifier: ClearingIdentifier,
    to: string,
    amount: number,
    expirationTimestamp: number,
    data: string,
    operatorData: string,
    operatorType: ThirdPartyType,
    thirdParty: string,
    hold?: Hold,
  ) {
    expect(clearing.amount_).to.equal(amount);
    expect(clearing.expirationTimestamp_).to.equal(expirationTimestamp);
    expect(clearing.destination_).to.equal(to);
    expect(clearing.clearingOperationType_).to.equal(clearingIdentifier.clearingOperationType);
    expect(clearing.data_).to.equal(data);
    expect(clearing.thirdPartyType_).to.equal(operatorType);
    expect(clearingThirdParty).to.equal(thirdParty);
    expect(clearing.operatorData_).to.equal(operatorData);
    if (hold) {
      expect(clearing.hold_!.amount).to.equal(hold.amount);
      expect(clearing.hold_!.expirationTimestamp).to.equal(hold.expirationTimestamp);
      expect(clearing.hold_!.escrow).to.equal(hold.escrow);
      expect(clearing.hold_!.to).to.equal(hold.to);
      expect(clearing.hold_!.data).to.equal(hold.data);
    }
  }

  function getOpType(opTypeId: number): ClearingOperationType {
    if (opTypeId == 1) return ClearingOperationType.Transfer;
    else if (opTypeId == 2) return ClearingOperationType.HoldCreation;

    return ClearingOperationType.Redeem;
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
      expirationTimestamp: expirationTimestamp,
      data: _DATA,
    };

    clearingOperationFrom = {
      clearingOperation: clearingOperation,
      from: signer_A.address,
      operatorData: _DATA,
    };

    clearingIdentifier = {
      partition: _DEFAULT_PARTITION,
      tokenHolder: signer_A.address,
      clearingId: 1,
      clearingOperationType: ClearingOperationType.Transfer,
    };
  });

  afterEach(async () => {
    await asset.resetSystemTimestamp();
  });

  describe("Single Partition", async () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    describe("snapshot", () => {
      it("GIVEN an account with snapshot role WHEN takeSnapshot and Clearing THEN transaction succeeds", async () => {
        const EXPIRATION_TIMESTAMP = dateToUnixTimestamp(`2030-01-01T00:00:35Z`);

        await asset.connect(signer_A).grantRole(ATS_ROLES.SNAPSHOT_ROLE, signer_A.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.LOCKER_ROLE, signer_A.address);

        // snapshot
        await asset.connect(signer_A).takeSnapshot();

        // Operations
        clearingOperation.expirationTimestamp = EXPIRATION_TIMESTAMP;
        const hold = {
          amount: 1,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          escrow: signer_A.address,
          to: ADDRESS_ZERO,
          data: EMPTY_HEX_BYTES,
        };

        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, 1, signer_C.address);
        await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, 1);
        await asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold);

        // snapshot
        await asset.connect(signer_A).takeSnapshot();

        // Operations
        clearingIdentifier.clearingId = 1;
        clearingIdentifier.clearingOperationType = ClearingOperationType.Transfer;
        await asset.connect(signer_A).approveClearingOperationByPartition(clearingIdentifier);

        clearingIdentifier.clearingOperationType = ClearingOperationType.Redeem;
        await asset.connect(signer_A).cancelClearingOperationByPartition(clearingIdentifier);

        await asset.changeSystemTimestamp(EXPIRATION_TIMESTAMP + 1);

        clearingIdentifier.clearingOperationType = ClearingOperationType.HoldCreation;
        await asset.connect(signer_A).reclaimClearingOperationByPartition(clearingIdentifier);

        // snapshot
        await asset.connect(signer_A).takeSnapshot();

        // checks
        const snapshot_Balance_Of_A_1 = await asset.balanceOfAtSnapshot(1, signer_A.address);
        const snapshot_Balance_Of_C_1 = await asset.balanceOfAtSnapshot(1, signer_C.address);
        const snapshot_ClearingBalance_Of_A_1 = await asset.clearedBalanceOfAtSnapshot(1, signer_A.address);
        const snapshot_Total_Supply_1 = await asset.totalSupplyAtSnapshot(1);

        expect(snapshot_Balance_Of_A_1).to.equal(3 * _AMOUNT);
        expect(snapshot_Balance_Of_C_1).to.equal(0);
        expect(snapshot_ClearingBalance_Of_A_1).to.equal(0);
        expect(snapshot_Total_Supply_1).to.equal(6 * _AMOUNT);

        const snapshot_Balance_Of_A_2 = await asset.balanceOfAtSnapshot(2, signer_A.address);
        const snapshot_Balance_Of_C_2 = await asset.balanceOfAtSnapshot(2, signer_C.address);
        const snapshot_ClearingBalance_Of_A_2 = await asset.clearedBalanceOfAtSnapshot(2, signer_A.address);
        const snapshot_Total_Supply_2 = await asset.totalSupplyAtSnapshot(2);

        expect(snapshot_Balance_Of_A_2).to.equal(3 * _AMOUNT - 3);
        expect(snapshot_Balance_Of_C_2).to.equal(0);
        expect(snapshot_ClearingBalance_Of_A_2).to.equal(3);
        expect(snapshot_Total_Supply_2).to.equal(6 * _AMOUNT);

        const snapshot_Balance_Of_A_3 = await asset.balanceOfAtSnapshot(3, signer_A.address);
        const snapshot_Balance_Of_C_3 = await asset.balanceOfAtSnapshot(3, signer_C.address);
        const snapshot_ClearingBalance_Of_A_3 = await asset.clearedBalanceOfAtSnapshot(3, signer_A.address);
        const snapshot_Total_Supply_3 = await asset.totalSupplyAtSnapshot(3);

        expect(snapshot_Balance_Of_A_3).to.equal(3 * _AMOUNT - 1);
        expect(snapshot_Balance_Of_C_3).to.equal(1);
        expect(snapshot_ClearingBalance_Of_A_3).to.equal(0);
        expect(snapshot_Total_Supply_3).to.equal(6 * _AMOUNT);
      });
    });

    describe("corporate actions integration", () => {
      it("GIVEN pending clearing WHEN record date is reached THEN dividends use total balance including cleared amounts", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_A.address);

        const currentTime = await asset.blockTimestamp();
        const recordDate = currentTime + 100n;
        const executionDate = recordDate + 100n;

        clearingOperation.expirationTimestamp = Number(executionDate + BigInt(ONE_YEAR_IN_SECONDS));

        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, 10, signer_B.address);

        const dividendInput = {
          recordDate,
          executionDate,
          amount: 100,
          amountDecimals: 0,
        };

        const dividendId = await asset.connect(signer_A).setDividend.staticCall(dividendInput);
        await asset.connect(signer_A).setDividend(dividendInput);

        await asset.changeSystemTimestamp(recordDate + 1n);

        const dividendFor = await asset.getDividendFor(dividendId, signer_A.address);

        const currentBalance = await asset.balanceOf(signer_A.address);
        const clearedAmount = await asset.getClearedAmountFor(signer_A.address);

        expect(dividendFor.recordDateReached).to.equal(true);
        expect(dividendFor.tokenBalance).to.equal(currentBalance + clearedAmount);
      });
    });

    describe("Not in clearing mode", () => {
      it("GIVEN a token not in clearing mode WHEN create clearing THEN transaction fails with ClearingIsDisabled", async () => {
        await asset.deactivateClearing();
        // Transfers
        await expect(
          asset.clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address),
        ).to.be.revertedWithCustomError(asset, "ClearingIsDisabled");
        await expect(
          asset.clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_B.address),
        ).to.be.revertedWithCustomError(asset, "ClearingIsDisabled");
        await expect(
          asset.operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_B.address),
        ).to.be.revertedWithCustomError(asset, "ClearingIsDisabled");

        // Holds
        await expect(asset.clearingCreateHoldByPartition(clearingOperation, hold)).to.be.revertedWithCustomError(
          asset,
          "ClearingIsDisabled",
        );
        await expect(
          asset.clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(asset, "ClearingIsDisabled");
        await expect(
          asset.operatorClearingCreateHoldByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(asset, "ClearingIsDisabled");

        // Redeems
        await expect(asset.clearingRedeemByPartition(clearingOperation, _AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "ClearingIsDisabled",
        );
        await expect(asset.clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "ClearingIsDisabled",
        );
        await expect(
          asset.operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT),
        ).to.be.revertedWithCustomError(asset, "ClearingIsDisabled");
      });
      it("GIVEN a token not in clearing mode WHEN trigger clearing THEN transaction fails with ClearingIsDisabled", async () => {
        await asset.clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address);

        await asset.deactivateClearing();
        // Approve
        await expect(asset.approveClearingOperationByPartition(clearingIdentifier)).to.be.revertedWithCustomError(
          asset,
          "ClearingIsDisabled",
        );
        // Cancel
        await expect(asset.cancelClearingOperationByPartition(clearingIdentifier)).to.be.revertedWithCustomError(
          asset,
          "ClearingIsDisabled",
        );
        // Reclaim
        await expect(asset.reclaimClearingOperationByPartition(clearingIdentifier)).to.be.revertedWithCustomError(
          asset,
          "ClearingIsDisabled",
        );
      });
    });

    describe("Paused", () => {
      beforeEach(async () => {
        // Pausing the token
        await asset.connect(signer_D).pause();
      });

      // Activate/Deactivate clearing
      it("GIVEN a paused Token WHEN switching clearing mode THEN transaction fails with TokenIsPaused", async () => {
        await expect(asset.activateClearing()).to.be.revertedWithCustomError(asset, "TokenIsPaused");
        await expect(asset.deactivateClearing()).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      // Transfers
      it("GIVEN a paused Token WHEN clearingTransferByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          asset.clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN clearingTransferFromByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          asset.clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN operatorClearingTransferByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          asset.operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      // Holds
      it("GIVEN a paused Token WHEN clearingCreateHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(asset.clearingCreateHoldByPartition(clearingOperation, hold)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused Token WHEN clearingCreateHoldFromByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          asset.clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN operatorClearingCreateHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          asset.operatorClearingCreateHoldByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      //Redeems

      it("GIVEN a paused Token WHEN clearingRedeemByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(asset.clearingRedeemByPartition(clearingOperation, _AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused Token WHEN clearingRedeemFromByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(asset.clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused Token WHEN operatorClearingRedeemByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          asset.operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      // Approve / Cancel / Reclaim
      it("GIVEN a paused Token WHEN approveClearingOperationByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(asset.approveClearingOperationByPartition(clearingIdentifier)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused Token WHEN cancelClearingOperationByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(asset.cancelClearingOperationByPartition(clearingIdentifier)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused Token WHEN reclaimClearingOperationByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(asset.reclaimClearingOperationByPartition(clearingIdentifier)).to.be.revertedWithCustomError(
          asset,
          "TokenIsPaused",
        );
      });
    });

    describe("Clearing with zero and minimal amounts", () => {
      it("GIVEN a Token WHEN creating clearing with amount 1 THEN transaction succeeds", async () => {
        await expect(asset.clearingTransferByPartition(clearingOperation, 1, signer_B.address)).to.emit(
          asset,
          "ClearedTransferByPartition",
        );

        const clearing = await asset.getClearingTransferForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);
        expect(clearing.amount).to.equal(1);
      });

      it("GIVEN a Token WHEN creating clearing redeem with amount 1 THEN transaction succeeds", async () => {
        await expect(asset.clearingRedeemByPartition(clearingOperation, 1)).to.emit(asset, "ClearedRedeemByPartition");

        clearingIdentifier.clearingId = 1;
        clearingIdentifier.clearingOperationType = ClearingOperationType.Redeem;
        const clearing = await asset.getClearingRedeemForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);
        expect(clearing.amount).to.equal(1);
      });

      it("GIVEN a Token WHEN creating clearing hold with amount 1 THEN transaction succeeds", async () => {
        const minimalHold = {
          ...hold,
          amount: 1,
        };
        await expect(asset.clearingCreateHoldByPartition(clearingOperation, minimalHold)).to.emit(
          asset,
          "ClearedHoldByPartition",
        );

        const clearing = await asset.getClearingCreateHoldForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);
        expect(clearing.amount).to.equal(1);
      });
    });

    describe("Clearing read operations edge cases", () => {
      it("GIVEN no clearings WHEN getting cleared amounts THEN returns zero", async () => {
        const clearedAmount = await asset.getClearedAmountFor(signer_D.address);
        const clearedAmountByPartition = await asset.getClearedAmountForByPartition(
          _DEFAULT_PARTITION,
          signer_D.address,
        );

        expect(clearedAmount).to.equal(0);
        expect(clearedAmountByPartition).to.equal(0);
      });

      it("GIVEN no clearings WHEN getting clearing counts THEN returns zero", async () => {
        const transferCount = await asset.getClearingCountForByPartition(
          _DEFAULT_PARTITION,
          signer_D.address,
          ClearingOperationType.Transfer,
        );
        const redeemCount = await asset.getClearingCountForByPartition(
          _DEFAULT_PARTITION,
          signer_D.address,
          ClearingOperationType.Redeem,
        );
        const holdCreationCount = await asset.getClearingCountForByPartition(
          _DEFAULT_PARTITION,
          signer_D.address,
          ClearingOperationType.HoldCreation,
        );

        expect(transferCount).to.equal(0);
        expect(redeemCount).to.equal(0);
        expect(holdCreationCount).to.equal(0);
      });

      it("GIVEN no clearings WHEN getting clearing IDs THEN returns empty array", async () => {
        const clearingIds = await asset.getClearingsIdForByPartition(
          _DEFAULT_PARTITION,
          signer_D.address,
          ClearingOperationType.Transfer,
          0,
          100,
        );

        expect(clearingIds.length).to.equal(0);
      });
    });

    describe("operator clearing operations", () => {
      it("GIVEN an authorized operator WHEN creating clearing transfers with different data THEN all succeed", async () => {
        await asset.connect(signer_A).authorizeOperator(signer_B.address);

        const data1 = "0x1111";
        const data2 = "0x2222";
        const data3 = "0x3333";

        const clearingOp1 = { ...clearingOperation, data: data1 };
        const clearingOp2 = { ...clearingOperation, data: data2 };
        const clearingOp3 = { ...clearingOperation, data: data3 };

        await asset
          .connect(signer_B)
          .operatorClearingTransferByPartition(
            { ...clearingOperationFrom, clearingOperation: clearingOp1 },
            _AMOUNT / 10,
            signer_C.address,
          );
        await asset
          .connect(signer_B)
          .operatorClearingTransferByPartition(
            { ...clearingOperationFrom, clearingOperation: clearingOp2 },
            _AMOUNT / 10,
            signer_C.address,
          );
        await asset
          .connect(signer_B)
          .operatorClearingTransferByPartition(
            { ...clearingOperationFrom, clearingOperation: clearingOp3 },
            _AMOUNT / 10,
            signer_C.address,
          );

        const clearing1 = await asset.getClearingTransferForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);
        const clearing2 = await asset.getClearingTransferForByPartition(_DEFAULT_PARTITION, signer_A.address, 2);
        const clearing3 = await asset.getClearingTransferForByPartition(_DEFAULT_PARTITION, signer_A.address, 3);

        expect(clearing1.data).to.equal(data1);
        expect(clearing2.data).to.equal(data2);
        expect(clearing3.data).to.equal(data3);
      });

      it("GIVEN an authorized operator WHEN creating clearing redeems with different operatorData THEN all succeed", async () => {
        await asset.connect(signer_A).authorizeOperator(signer_B.address);

        const opData1 = "0xaaaa";
        const opData2 = "0xbbbb";

        await asset
          .connect(signer_B)
          .operatorClearingRedeemByPartition({ ...clearingOperationFrom, operatorData: opData1 }, _AMOUNT / 10);
        await asset
          .connect(signer_B)
          .operatorClearingRedeemByPartition({ ...clearingOperationFrom, operatorData: opData2 }, _AMOUNT / 10);

        const clearing1 = await asset.getClearingRedeemForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);
        const clearing2 = await asset.getClearingRedeemForByPartition(_DEFAULT_PARTITION, signer_A.address, 2);

        expect(clearing1.operatorData).to.equal(opData1);
        expect(clearing2.operatorData).to.equal(opData2);
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without clearing role WHEN switching clearing mode THEN transaction fails with AccountHasNoRole", async () => {
        await expect(asset.connect(signer_D).activateClearing()).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
        await expect(asset.connect(signer_D).deactivateClearing()).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN an account without clearing validator role WHEN trigger clearing THEN transaction fails with AccountHasNoRole", async () => {
        await asset.clearingTransferByPartition(clearingOperation, _AMOUNT, signer_A.address);

        // Approve
        await expect(
          asset.connect(signer_D).approveClearingOperationByPartition(clearingIdentifier),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");

        // Cancel
        await expect(
          asset.connect(signer_D).cancelClearingOperationByPartition(clearingIdentifier),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });

      // Transfers
      it("GIVEN an account without authorization WHEN clearingTransferFromByPartition THEN transaction fails with InsufficientAllowance", async () => {
        await expect(
          asset.connect(signer_D).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "InsufficientAllowance");
      });

      it("GIVEN an account without operator authorization WHEN operatorClearingTransferByPartition THEN transaction fails with Unauthorized", async () => {
        await expect(
          asset.connect(signer_D).operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "Unauthorized");
      });

      // Holds
      it("GIVEN an account without authorization WHEN clearingCreateHoldFromByPartition THEN transaction fails with InsufficientAllowance", async () => {
        await expect(
          asset.connect(signer_D).clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(asset, "InsufficientAllowance");
      });

      // Redeems
      it("GIVEN an account without authorization WHEN clearingRedeemFromByPartition THEN transaction fails with InsufficientAllowance", async () => {
        await expect(
          asset.connect(signer_D).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT),
        ).to.be.revertedWithCustomError(asset, "InsufficientAllowance");
      });

      it("GIVEN an account without operator authorization WHEN operatorClearingRedeemByPartition THEN transaction fails with Unauthorized", async () => {
        await expect(
          asset.connect(signer_D).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT),
        ).to.be.revertedWithCustomError(asset, "Unauthorized");
      });
    });

    describe("Control List", () => {
      // Transfers
      it("GIVEN a blacklisted destination account WHEN approveClearingOperationByPartition with operation type Transfer THEN transaction fails with AccountIsBlocked", async () => {
        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
        await asset.connect(signer_A).authorizeOperator(signer_B.address);
        await asset
          .connect(signer_B)
          .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);

        await asset.connect(signer_E).addToControlList(signer_C.address);

        // Transfer
        await expect(asset.approveClearingOperationByPartition(clearingIdentifier)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );

        // From
        const clearingIdentifierFrom = {
          ...clearingIdentifier,
          clearingId: 2,
        };
        await expect(asset.approveClearingOperationByPartition(clearingIdentifierFrom)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );

        // Operator
        const clearingIdentifierOperator = {
          ...clearingIdentifier,
          clearingId: 3,
        };
        await expect(
          asset.approveClearingOperationByPartition(clearingIdentifierOperator),
        ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
      });

      it("GIVEN a blacklisted origin account WHEN approveClearingOperationByPartition with operation type Transfer THEN transaction fails with AccountIsBlocked", async () => {
        await asset.connect(signer_B).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);
        await asset.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        const clearingOperationFromB = {
          ...clearingOperationFrom,
          from: signer_B.address,
        };
        await asset.clearingTransferFromByPartition(clearingOperationFromB, _AMOUNT, signer_C.address);
        await asset.connect(signer_B).authorizeOperator(signer_A.address);
        await asset.operatorClearingTransferByPartition(clearingOperationFromB, _AMOUNT, signer_C.address);

        await asset.connect(signer_E).addToControlList(signer_B.address);

        // Transfer
        const clearingIdentifierB = {
          ...clearingIdentifier,
          tokenHolder: signer_B.address,
        };
        await expect(asset.approveClearingOperationByPartition(clearingIdentifierB)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );

        // From
        const clearingIdentifierFromB = {
          ...clearingIdentifierB,
          clearingId: 2,
        };
        await expect(asset.approveClearingOperationByPartition(clearingIdentifierFromB)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );

        // Operator
        const clearingIdentifierOperatorB = {
          ...clearingIdentifierB,
          clearingId: 3,
        };
        await expect(
          asset.approveClearingOperationByPartition(clearingIdentifierOperatorB),
        ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
      });

      // // Holds
      // TODO: Should we check control list when approving hold?
      // it('GIVEN a blacklisted destination account WHEN approveClearingOperationByPartition with operation type Hold THEN transaction fails with AccountIsBlocked', async () => {
      //     await asset
      //         .connect(signer_A)
      //         .clearingCreateHoldByPartition(clearingOperation, hold)
      //     await asset.increaseAllowance(signer_B.address, _AMOUNT)
      //     await asset
      //         .connect(signer_B)
      //         .clearingCreateHoldFromByPartition(clearingOperationFrom, hold)
      //     await asset.connect(signer_A).authorizeOperator(signer_B.address)
      //     await asset
      //         .connect(signer_B)
      //         .operatorClearingCreateHoldByPartition(
      //             clearingOperationFrom,
      //             hold
      //         )

      //     await asset.addToControlList(signer_C.address)

      //     clearingIdentifier = {
      //         ...clearingIdentifier,
      //         clearingOperationType: ClearingOperationType.HoldCreation,
      //     }

      //     // Hold
      //     await expect(
      //         asset.approveClearingOperationByPartition(
      //             clearingIdentifier
      //         )
      //     ).to.be.revertedWithCustomError(
      //         asset,
      //         'AccountIsBlocked'
      //     )

      //     // From
      //     let clearingIdentifierFrom = {
      //         ...clearingIdentifier,
      //         clearingId: 2,
      //     }
      //     await expect(
      //         asset.approveClearingOperationByPartition(
      //             clearingIdentifierFrom
      //         )
      //     ).to.be.revertedWithCustomError(
      //         asset,
      //         'AccountIsBlocked'
      //     )

      //     // Operator
      //     let clearingIdentifierOperator = {
      //         ...clearingIdentifier,
      //         clearingId: 3,
      //     }
      //     await expect(
      //         asset.approveClearingOperationByPartition(
      //             clearingIdentifierOperator
      //         )
      //     ).to.be.revertedWithCustomError(
      //         asset,
      //         'AccountIsBlocked'
      //     )
      // })

      // it('GIVEN a blacklisted origin account WHEN approveClearingOperationByPartition with operation type Hold THEN transaction fails with AccountIsBlocked', async () => {
      //     await asset
      //         .connect(signer_B)
      //         .clearingCreateHoldByPartition(clearingOperation, hold)
      //     await asset
      //         .connect(signer_B)
      //         .increaseAllowance(signer_A.address, _AMOUNT)
      //     let clearingOperationFromB = {
      //         ...clearingOperationFrom,
      //         from: signer_B.address,
      //     }
      //     await asset.clearingCreateHoldFromByPartition(
      //         clearingOperationFromB,
      //         hold
      //     )
      //     await asset.authorizeOperator(signer_A.address)
      //     await asset.operatorClearingCreateHoldByPartition(
      //         clearingOperationFromB,
      //         hold
      //     )

      //     await asset.addToControlList(signer_B.address)

      //     clearingIdentifier = {
      //         ...clearingIdentifier,
      //         clearingOperationType: ClearingOperationType.HoldCreation,
      //     }

      //     // Hold
      //     let clearingIdentifierB = {
      //         ...clearingIdentifier,
      //         tokenHolder: signer_B.address,
      //     }
      //     await expect(
      //         asset.approveClearingOperationByPartition(
      //             clearingIdentifierB
      //         )
      //     ).to.be.revertedWithCustomError(
      //         asset,
      //         'AccountIsBlocked'
      //     )

      //     // From
      //     let clearingIdentifierFromB = {
      //         ...clearingIdentifierB,
      //         clearingId: 2,
      //     }
      //     await expect(
      //         asset.approveClearingOperationByPartition(
      //             clearingIdentifierFromB
      //         )
      //     ).to.be.revertedWithCustomError(
      //         asset,
      //         'AccountIsBlocked'
      //     )

      //     // Operator
      //     let clearingIdentifierOperatorB = {
      //         ...clearingIdentifierB,
      //         clearingId: 3,
      //     }
      //     await expect(
      //         asset.approveClearingOperationByPartition(
      //             clearingIdentifierOperatorB
      //         )
      //     ).to.be.revertedWithCustomError(
      //         asset,
      //         'AccountIsBlocked'
      //     )
      // })

      // Redeems
      it("GIVEN a blacklisted origin account WHEN approveClearingOperationByPartition with operation type Redeem THEN transaction fails with AccountIsBlocked", async () => {
        await asset.connect(signer_B).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        await asset.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        const clearingOperationFromB = {
          ...clearingOperationFrom,
          from: signer_B.address,
        };
        await asset.clearingRedeemFromByPartition(clearingOperationFromB, _AMOUNT);
        await asset.connect(signer_B).authorizeOperator(signer_A.address);
        await asset.operatorClearingRedeemByPartition(clearingOperationFromB, _AMOUNT);

        await asset.connect(signer_E).addToControlList(signer_B.address);

        // Redeem
        const clearingIdentifierB = {
          ...clearingIdentifier,
          clearingOperationType: ClearingOperationType.Redeem,
          tokenHolder: signer_B.address,
        };
        await expect(asset.approveClearingOperationByPartition(clearingIdentifierB)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );

        // From
        const clearingIdentifierFromB = {
          ...clearingIdentifierB,
          clearingId: 2,
        };
        await expect(asset.approveClearingOperationByPartition(clearingIdentifierFromB)).to.be.revertedWithCustomError(
          asset,
          "AccountIsBlocked",
        );

        // Operator
        const clearingIdentifierOperatorB = {
          ...clearingIdentifierB,
          clearingId: 3,
        };
        await expect(
          asset.approveClearingOperationByPartition(clearingIdentifierOperatorB),
        ).to.be.revertedWithCustomError(asset, "AccountIsBlocked");
      });
    });

    describe("KYC", () => {
      it("Given a non kyc account WHEN approveClearingOperationByPartition with operation type Transfer THEN transaction fails with InvalidKycStatus", async () => {
        const clearingOperationFromB = {
          ...clearingOperationFrom,
          from: signer_B.address,
        };
        await asset.connect(signer_B).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_D.address);
        await asset.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        await asset.clearingTransferFromByPartition(clearingOperationFromB, _AMOUNT, signer_D.address);
        await asset.connect(signer_B).authorizeOperator(signer_A.address);
        await asset.operatorClearingTransferByPartition(clearingOperationFromB, _AMOUNT, signer_D.address);

        // Revoke from
        await asset.connect(signer_B).revokeKyc(signer_B.address);
        await asset.connect(signer_B).grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

        // Transfer
        const clearingIdentifierB = {
          ...clearingIdentifier,
          tokenHolder: signer_B.address,
        };
        await expect(asset.approveClearingOperationByPartition(clearingIdentifierB)).to.be.revertedWithCustomError(
          asset,
          "InvalidKycStatus",
        );

        // From
        const clearingIdentifierFromB = {
          ...clearingIdentifierB,
          clearingId: 2,
        };
        await expect(asset.approveClearingOperationByPartition(clearingIdentifierFromB)).to.be.revertedWithCustomError(
          asset,
          "InvalidKycStatus",
        );

        // Operator
        const clearingIdentifierOperatorB = {
          ...clearingIdentifierB,
          clearingId: 3,
        };

        await expect(
          asset.approveClearingOperationByPartition(clearingIdentifierOperatorB),
        ).to.be.revertedWithCustomError(asset, "InvalidKycStatus");

        // Revoke destination
        await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
        await asset.connect(signer_B).revokeKyc(signer_D.address);

        // Transfer
        await expect(asset.approveClearingOperationByPartition(clearingIdentifierB)).to.be.revertedWithCustomError(
          asset,
          "InvalidKycStatus",
        );

        // From
        await expect(asset.approveClearingOperationByPartition(clearingIdentifierFromB)).to.be.revertedWithCustomError(
          asset,
          "InvalidKycStatus",
        );

        // Operator
        await expect(
          asset.approveClearingOperationByPartition(clearingIdentifierOperatorB),
        ).to.be.revertedWithCustomError(asset, "InvalidKycStatus");
      });

      // TODO: Should we check kyc status when approving hold?
      // it('Given a non kyc account WHEN approveClearingOperationByPartition with operation type Hold THEN transaction fails with InvalidKycStatus', async () => {
      //     let clearingOperationFromB = {
      //         ...clearingOperationFrom,
      //         from: signer_B.address,
      //     }
      //     await asset
      //         .connect(signer_B)
      //         .clearingCreateHoldByPartition(clearingOperation, hold)
      //     await asset
      //         .connect(signer_B)
      //         .increaseAllowance(signer_A.address, _AMOUNT)
      //     await asset.clearingCreateHoldFromByPartition(
      //         clearingOperationFromB,
      //         hold
      //     )
      //     await asset.authorizeOperator(signer_A.address)
      //     await asset.operatorClearingCreateHoldByPartition(
      //         clearingOperationFromB,
      //         hold
      //     )

      //     // Revoke from
      //     await asset.revokeKyc(signer_B.address)

      //     // Hold
      //     let clearingIdentifierB = {
      //         ...clearingIdentifier,
      //         tokenHolder: signer_B.address,
      //         clearingOperationType: ClearingOperationType.HoldCreation
      //     }
      //     await expect(
      //         asset.approveClearingOperationByPartition(
      //             clearingIdentifierB
      //         )
      //     ).to.be.revertedWithCustomError(asset, 'InvalidKycStatus')

      //     // From
      //     let clearingIdentifierFromB = {
      //         ...clearingIdentifierB,
      //         clearingId: 2,
      //     }
      //     await expect(
      //         asset.approveClearingOperationByPartition(
      //             clearingIdentifierFromB
      //         )
      //     ).to.be.revertedWithCustomError(asset, 'InvalidKycStatus')

      //     // Operator
      //     let clearingIdentifierOperatorB = {
      //         ...clearingIdentifierB,
      //         clearingId: 3,
      //     }

      //     await expect(
      //         asset.approveClearingOperationByPartition(
      //             clearingIdentifierOperatorB
      //         )
      //     ).to.be.revertedWithCustomError(asset, 'InvalidKycStatus')

      //     // Revoke destination
      //     await asset.grantKyc(
      //         signer_B.address,
      //         EMPTY_VC_ID,
      //         ZERO,
      //         MAX_UINT256,
      //         signer_A.address
      //     )
      //     await asset.revokeKyc(signer_C.address)

      //     // Hold
      //     await expect(
      //         asset.approveClearingOperationByPartition(
      //             clearingIdentifierB
      //         )
      //     ).to.be.revertedWithCustomError(asset, 'InvalidKycStatus')

      //     // From
      //     await expect(
      //         asset.approveClearingOperationByPartition(
      //             clearingIdentifierFromB
      //         )
      //     ).to.be.revertedWithCustomError(asset, 'InvalidKycStatus')

      //     // Operator
      //     await expect(
      //         asset.approveClearingOperationByPartition(
      //             clearingIdentifierOperatorB
      //         )
      //     ).to.be.revertedWithCustomError(asset, 'InvalidKycStatus')
      // })

      it("Given a non kyc account WHEN approveClearingOperationByPartition with operation type Redeem THEN transaction fails with InvalidKycStatus", async () => {
        const clearingOperationFromB = {
          ...clearingOperationFrom,
          from: signer_B.address,
        };
        await asset.connect(signer_B).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        await asset.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        await asset.clearingRedeemFromByPartition(clearingOperationFromB, _AMOUNT);
        await asset.connect(signer_B).authorizeOperator(signer_A.address);
        await asset.operatorClearingRedeemByPartition(clearingOperationFromB, _AMOUNT);

        // Revoke from
        await asset.connect(signer_B).revokeKyc(signer_B.address);

        // Redeem
        const clearingIdentifierB = {
          ...clearingIdentifier,
          tokenHolder: signer_B.address,
          clearingOperationType: ClearingOperationType.Redeem,
        };
        await expect(asset.approveClearingOperationByPartition(clearingIdentifierB)).to.be.revertedWithCustomError(
          asset,
          "InvalidKycStatus",
        );

        // From
        const clearingIdentifierFromB = {
          ...clearingIdentifierB,
          clearingId: 2,
        };
        await expect(asset.approveClearingOperationByPartition(clearingIdentifierFromB)).to.be.revertedWithCustomError(
          asset,
          "InvalidKycStatus",
        );

        // Operator
        const clearingIdentifierOperatorB = {
          ...clearingIdentifierB,
          clearingId: 3,
        };

        await expect(
          asset.approveClearingOperationByPartition(clearingIdentifierOperatorB),
        ).to.be.revertedWithCustomError(asset, "InvalidKycStatus");
      });
    });

    describe("Create clearing with wrong input arguments", () => {
      it("GIVEN a Token WHEN creating clearing with amount bigger than balance THEN transaction fails with InsufficientBalance", async () => {
        // Transfers
        await expect(
          asset.clearingTransferByPartition(clearingOperation, 4 * _AMOUNT, signer_B.address),
        ).to.be.revertedWithCustomError(asset, "InsufficientBalance");

        const clearingOperationFromB = {
          ...clearingOperationFrom,
          from: signer_B.address,
        };

        await asset.connect(signer_B).increaseAllowance(signer_A.address, 4 * _AMOUNT);
        await expect(
          asset.clearingTransferFromByPartition(clearingOperationFromB, 4 * _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "InsufficientBalance");
        await asset.connect(signer_B).authorizeOperator(signer_A.address);
        await expect(
          asset.operatorClearingTransferByPartition(clearingOperationFromB, 4 * _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "InsufficientBalance");

        // Holds
        const hold_wrong = {
          ...hold,
          amount: 4 * _AMOUNT,
        };
        await expect(asset.clearingCreateHoldByPartition(clearingOperation, hold_wrong)).to.be.revertedWithCustomError(
          asset,
          "InsufficientBalance",
        );
        await expect(
          asset.clearingCreateHoldFromByPartition(clearingOperationFromB, hold_wrong),
        ).to.be.revertedWithCustomError(asset, "InsufficientBalance");
        await expect(
          asset.operatorClearingCreateHoldByPartition(clearingOperationFromB, hold_wrong),
        ).to.be.revertedWithCustomError(asset, "InsufficientBalance");

        // Redeems
        await expect(asset.clearingRedeemByPartition(clearingOperation, 4 * _AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "InsufficientBalance",
        );
        await expect(
          asset.clearingRedeemFromByPartition(clearingOperationFromB, 4 * _AMOUNT),
        ).to.be.revertedWithCustomError(asset, "InsufficientBalance");
        await expect(
          asset.operatorClearingRedeemByPartition(clearingOperationFromB, 4 * _AMOUNT),
        ).to.be.revertedWithCustomError(asset, "InsufficientBalance");
      });

      it("GIVEN a Token WHEN creating clearing from with amount bigger than allowed THEN transaction fails with InsufficientAllowance", async () => {
        // Transfers
        await expect(
          asset.clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "InsufficientAllowance");

        // Holds
        await expect(
          asset.clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(asset, "InsufficientAllowance");

        // Redeems
        await expect(asset.clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "InsufficientAllowance",
        );
      });

      it("GIVEN a Token WHEN creating clearing passing empty address from or escrow THEN transaction fails with ZeroAddressNotAllowed", async () => {
        // Transfers
        const clearingOperationFrom_wrong = {
          ...clearingOperationFrom,
          from: ADDRESS_ZERO,
        };
        await expect(
          asset.clearingTransferFromByPartition(clearingOperationFrom_wrong, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
        await expect(
          asset.operatorClearingTransferByPartition(clearingOperationFrom_wrong, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");

        // Holds
        await expect(
          asset.clearingCreateHoldFromByPartition(clearingOperationFrom_wrong, hold),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
        await expect(
          asset.operatorClearingCreateHoldByPartition(clearingOperationFrom_wrong, hold),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
        const hold_wrong_empty_address_escrow = {
          ...hold,
          escrow: ADDRESS_ZERO,
        };
        await expect(
          asset.clearingCreateHoldByPartition(clearingOperation, hold_wrong_empty_address_escrow),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
        await expect(
          asset.clearingCreateHoldFromByPartition(clearingOperationFrom, hold_wrong_empty_address_escrow),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
        await expect(
          asset.operatorClearingCreateHoldByPartition(clearingOperationFrom, hold_wrong_empty_address_escrow),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");

        // Redeems
        await expect(
          asset.clearingRedeemFromByPartition(clearingOperationFrom_wrong, _AMOUNT),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
        await expect(
          asset.operatorClearingRedeemByPartition(clearingOperationFrom_wrong, _AMOUNT),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
      });

      it("GIVEN a Token WHEN creating clearing passing wrong expirationTimestamp THEN transaction fails with WrongExpirationTimestamp", async () => {
        const wrongExpirationTimestamp = currentTimestamp - 1;

        const clearingOperation__wrong = {
          ...clearingOperation,
          expirationTimestamp: wrongExpirationTimestamp,
        };

        const clearingOperationFrom_wrong = {
          ...clearingOperationFrom,
          from: signer_B.address,
          clearingOperation: clearingOperation__wrong,
        };

        await asset.changeSystemTimestamp(currentTimestamp);

        // Transfers
        await expect(
          asset.clearingTransferByPartition(clearingOperation__wrong, _AMOUNT, signer_B.address),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
        await asset.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        await expect(
          asset.clearingTransferFromByPartition(clearingOperationFrom_wrong, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
        await asset.authorizeOperator(signer_A.address);
        await expect(
          asset.operatorClearingTransferByPartition(clearingOperationFrom_wrong, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");

        // Holds
        await expect(asset.clearingCreateHoldByPartition(clearingOperation__wrong, hold)).to.be.revertedWithCustomError(
          asset,
          "WrongExpirationTimestamp",
        );
        await asset.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        await expect(
          asset.clearingCreateHoldFromByPartition(clearingOperationFrom_wrong, hold),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
        await asset.authorizeOperator(signer_A.address);
        await expect(
          asset.operatorClearingCreateHoldByPartition(clearingOperationFrom_wrong, hold),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");

        const hold_wrong = {
          ...hold,
          expirationTimestamp: wrongExpirationTimestamp,
        };
        await expect(asset.clearingCreateHoldByPartition(clearingOperation, hold_wrong)).to.be.revertedWithCustomError(
          asset,
          "WrongExpirationTimestamp",
        );
        await expect(
          asset.clearingCreateHoldFromByPartition(clearingOperationFrom_wrong, hold_wrong),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
        await expect(
          asset.operatorClearingCreateHoldByPartition(clearingOperationFrom_wrong, hold_wrong),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");

        // Redeems
        await expect(asset.clearingRedeemByPartition(clearingOperation__wrong, _AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "WrongExpirationTimestamp",
        );
        await expect(
          asset.clearingRedeemFromByPartition(clearingOperationFrom_wrong, _AMOUNT),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
        await expect(
          asset.operatorClearingRedeemByPartition(clearingOperationFrom_wrong, _AMOUNT),
        ).to.be.revertedWithCustomError(asset, "WrongExpirationTimestamp");
      });

      it("GIVEN a wrong partition WHEN creating clearing THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        const clearingOperation__wrong = {
          ...clearingOperation,
          partition: _WRONG_PARTITION,
        };

        const clearingOperationFrom_wrong = {
          ...clearingOperationFrom,
          from: signer_B.address,
          clearingOperation: clearingOperation__wrong,
        };

        // Transfers
        await expect(
          asset.clearingTransferByPartition(clearingOperation__wrong, _AMOUNT, signer_B.address),
        ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
        await asset.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        await expect(
          asset.clearingTransferFromByPartition(clearingOperationFrom_wrong, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
        await asset.authorizeOperator(signer_A.address);
        await expect(
          asset.operatorClearingTransferByPartition(clearingOperationFrom_wrong, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");

        // Holds
        await expect(asset.clearingCreateHoldByPartition(clearingOperation__wrong, hold)).to.be.revertedWithCustomError(
          asset,
          "PartitionNotAllowedInSinglePartitionMode",
        );
        await asset.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        await expect(
          asset.clearingCreateHoldFromByPartition(clearingOperationFrom_wrong, hold),
        ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
        await asset.authorizeOperator(signer_A.address);
        await expect(
          asset.operatorClearingCreateHoldByPartition(clearingOperationFrom_wrong, hold),
        ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");

        // Redeems
        await expect(asset.clearingRedeemByPartition(clearingOperation__wrong, _AMOUNT)).to.be.revertedWithCustomError(
          asset,
          "PartitionNotAllowedInSinglePartitionMode",
        );
        await asset.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        await expect(
          asset.clearingRedeemFromByPartition(clearingOperationFrom_wrong, _AMOUNT),
        ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
        await asset.authorizeOperator(signer_A.address);
        await expect(
          asset.operatorClearingRedeemByPartition(clearingOperationFrom_wrong, _AMOUNT),
        ).to.be.revertedWithCustomError(asset, "PartitionNotAllowedInSinglePartitionMode");
      });
    });

    describe("Manage clearing with wrong input arguments", () => {
      it("GIVEN a clearing transfer WHEN approveClearingOperationByPartition with wrong input arguments THEN transaction fails with ExpirationDateReached", async () => {
        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);

        // Wait until expiration date
        await asset.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

        await expect(asset.approveClearingOperationByPartition(clearingIdentifier)).to.be.revertedWithCustomError(
          asset,
          "ExpirationDateReached",
        );
      });

      it("GIVEN a clearing transfer WHEN cancelClearingOperationByPartition with wrong input arguments THEN transaction fails with ExpirationDateReached", async () => {
        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);

        // Wait until expiration date
        await asset.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

        await expect(asset.cancelClearingOperationByPartition(clearingIdentifier)).to.be.revertedWithCustomError(
          asset,
          "ExpirationDateReached",
        );
      });

      it("GIVEN a clearing transfer WHEN reclaimClearingOperationByPartition with wrong input arguments THEN transaction fails with ExpirationDateReached", async () => {
        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);

        await expect(asset.reclaimClearingOperationByPartition(clearingIdentifier)).to.be.revertedWithCustomError(
          asset,
          "ExpirationDateNotReached",
        );
      });

      it("GIVEN a clearing transfer WHEN approveClearingOperationByPartition with wrong partition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);

        const wrongClearingIdentifier = {
          ...clearingIdentifier,
          partition: _WRONG_PARTITION,
        };

        await expect(asset.approveClearingOperationByPartition(wrongClearingIdentifier)).to.be.revertedWithCustomError(
          asset,
          "PartitionNotAllowedInSinglePartitionMode",
        );
      });

      it("GIVEN a clearing transfer WHEN cancelClearingOperationByPartition with wrong clearingId THEN transaction fails with WrongClearingId", async () => {
        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);

        const wrongClearingIdentifier = {
          ...clearingIdentifier,
          clearingId: 999,
        };

        await expect(asset.cancelClearingOperationByPartition(wrongClearingIdentifier)).to.be.revertedWithCustomError(
          asset,
          "WrongClearingId",
        );
      });

      it("GIVEN a clearing transfer WHEN reclaimClearingOperationByPartition with unidentified account THEN transaction fails", async () => {
        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);

        // Revoke identity for signer_A
        await asset.connect(signer_B).revokeKyc(signer_A.address);

        // Wait until expiration date
        await asset.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

        await expect(asset.connect(signer_A).reclaimClearingOperationByPartition(clearingIdentifier)).to.be.reverted;
      });
    });

    describe("Create clearing success", () => {
      let balance_A_original: bigint;
      let totalClearedAmount = 0;

      beforeEach(async () => {
        balance_A_original = await asset.balanceOf(signer_A.address);
        totalClearedAmount = 3 * _AMOUNT;
      });
      it("GIVEN a Token WHEN Activate and Deactive clearing THEN transaction succeeds", async () => {
        await expect(asset.connect(signer_A).deactivateClearing())
          .to.emit(asset, "ClearingDeactivated")
          .withArgs(signer_A.address);

        const deactivated = await asset.isClearingActivated();

        await expect(asset.connect(signer_A).activateClearing())
          .to.emit(asset, "ClearingActivated")
          .withArgs(signer_A.address);

        const activated = await asset.isClearingActivated();

        expect(deactivated).to.equal(false);
        expect(activated).to.equal(true);
      });
      it("GIVEN a Token WHEN creating clearing transfer THEN transaction succeeds", async () => {
        await expect(asset.clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address))
          .to.emit(asset, "ClearedTransferByPartition")
          .withArgs(
            signer_A.address,
            signer_A.address,
            signer_B.address,
            clearingOperation.partition,
            1,
            _AMOUNT,
            clearingOperation.expirationTimestamp,
            clearingOperation.data,
            EMPTY_HEX_BYTES,
          );

        clearingIdentifier.clearingId = 1;
        await checkCreatedClearingValues(
          clearingIdentifier,
          ClearingOperationType.Transfer,
          signer_B.address,
          _AMOUNT,
          clearingOperation.expirationTimestamp,
          clearingOperation.data,
          EMPTY_HEX_BYTES,
          ThirdPartyType.NULL,
          ADDRESS_ZERO,
        );

        // increase allowance
        await asset.connect(signer_A).increaseAllowance(signer_B.address, 4 * _AMOUNT);

        await expect(
          asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
        )
          .to.emit(asset, "ClearedTransferFromByPartition")
          .withArgs(
            signer_B.address,
            clearingOperationFrom.from,
            signer_C.address,
            clearingOperationFrom.clearingOperation.partition,
            2,
            _AMOUNT,
            clearingOperationFrom.clearingOperation.expirationTimestamp,
            clearingOperationFrom.clearingOperation.data,
            clearingOperationFrom.operatorData,
          );

        clearingIdentifier.clearingId = 2;
        await checkCreatedClearingValues(
          clearingIdentifier,
          ClearingOperationType.Transfer,
          signer_C.address,
          _AMOUNT,
          clearingOperationFrom.clearingOperation.expirationTimestamp,
          clearingOperationFrom.clearingOperation.data,
          clearingOperationFrom.operatorData,
          ThirdPartyType.AUTHORIZED,
          signer_B.address,
        );

        // authorize operator
        await asset.connect(signer_A).authorizeOperator(signer_C.address);

        await expect(
          asset.connect(signer_C).operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_D.address),
        )
          .to.emit(asset, "ClearedOperatorTransferByPartition")
          .withArgs(
            signer_C.address,
            clearingOperationFrom.from,
            signer_D.address,
            clearingOperationFrom.clearingOperation.partition,
            3,
            _AMOUNT,
            clearingOperationFrom.clearingOperation.expirationTimestamp,
            clearingOperationFrom.clearingOperation.data,
            clearingOperationFrom.operatorData,
          );

        clearingIdentifier.clearingId = 3;
        await checkCreatedClearingValues(
          clearingIdentifier,
          ClearingOperationType.Transfer,
          signer_D.address,
          _AMOUNT,
          clearingOperationFrom.clearingOperation.expirationTimestamp,
          clearingOperationFrom.clearingOperation.data,
          clearingOperationFrom.operatorData,
          ThirdPartyType.OPERATOR,
          ADDRESS_ZERO,
        );

        await checkCreatedClearingAmounts(
          Number(balance_A_original) - totalClearedAmount,
          signer_A.address,
          totalClearedAmount,
          totalClearedAmount,
          3,
          0,
          0,
        );
      });

      it("GIVEN a Token WHEN creating clearing redeem THEN transaction succeeds", async () => {
        await expect(asset.clearingRedeemByPartition(clearingOperation, _AMOUNT))
          .to.emit(asset, "ClearedRedeemByPartition")
          .withArgs(
            signer_A.address,
            signer_A.address,
            clearingOperation.partition,
            1,
            _AMOUNT,
            clearingOperation.expirationTimestamp,
            clearingOperation.data,
            EMPTY_HEX_BYTES,
          );

        clearingIdentifier.clearingId = 1;
        await checkCreatedClearingValues(
          clearingIdentifier,
          ClearingOperationType.Redeem,
          ADDRESS_ZERO,
          _AMOUNT,
          clearingOperation.expirationTimestamp,
          clearingOperation.data,
          EMPTY_HEX_BYTES,
          ThirdPartyType.NULL,
          ADDRESS_ZERO,
        );

        // increase allowance
        await asset.connect(signer_A).increaseAllowance(signer_B.address, 4 * _AMOUNT);

        await expect(asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT))
          .to.emit(asset, "ClearedRedeemFromByPartition")
          .withArgs(
            signer_B.address,
            clearingOperationFrom.from,
            clearingOperationFrom.clearingOperation.partition,
            2,
            _AMOUNT,
            clearingOperationFrom.clearingOperation.expirationTimestamp,
            clearingOperationFrom.clearingOperation.data,
            clearingOperationFrom.operatorData,
          );

        clearingIdentifier.clearingId = 2;
        await checkCreatedClearingValues(
          clearingIdentifier,
          ClearingOperationType.Redeem,
          ADDRESS_ZERO,
          _AMOUNT,
          clearingOperationFrom.clearingOperation.expirationTimestamp,
          clearingOperationFrom.clearingOperation.data,
          clearingOperationFrom.operatorData,
          ThirdPartyType.AUTHORIZED,
          signer_B.address,
        );
        // authorize operator
        await asset.connect(signer_A).authorizeOperator(signer_C.address);

        await expect(asset.connect(signer_C).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT))
          .to.emit(asset, "ClearedOperatorRedeemByPartition")
          .withArgs(
            signer_C.address,
            clearingOperationFrom.from,
            clearingOperationFrom.clearingOperation.partition,
            3,
            _AMOUNT,
            clearingOperationFrom.clearingOperation.expirationTimestamp,
            clearingOperationFrom.clearingOperation.data,
            clearingOperationFrom.operatorData,
          );

        clearingIdentifier.clearingId = 3;
        await checkCreatedClearingValues(
          clearingIdentifier,
          ClearingOperationType.Redeem,
          ADDRESS_ZERO,
          _AMOUNT,
          clearingOperationFrom.clearingOperation.expirationTimestamp,
          clearingOperationFrom.clearingOperation.data,
          clearingOperationFrom.operatorData,
          ThirdPartyType.AUTHORIZED,
          ADDRESS_ZERO,
        );

        await checkCreatedClearingAmounts(
          Number(balance_A_original) - totalClearedAmount,
          signer_A.address,
          totalClearedAmount,
          totalClearedAmount,
          0,
          3,
          0,
        );
      });

      it("GIVEN a Token WHEN creating clearing new hold THEN transaction succeeds", async () => {
        await expect(asset.clearingCreateHoldByPartition(clearingOperation, hold))
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
        ((clearingIdentifier.clearingId = 1),
          await checkCreatedClearingValues(
            clearingIdentifier,
            ClearingOperationType.HoldCreation,
            ADDRESS_ZERO,
            _AMOUNT,
            clearingOperation.expirationTimestamp,
            clearingOperation.data,
            EMPTY_HEX_BYTES,
            ThirdPartyType.NULL,
            ADDRESS_ZERO,
            hold,
          ));

        // increase allowance
        await asset.connect(signer_A).increaseAllowance(signer_B.address, 4 * _AMOUNT);

        await expect(asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold))
          .to.emit(asset, "ClearedHoldFromByPartition")
          .withArgs(
            signer_B.address,
            clearingOperationFrom.from,
            clearingOperationFrom.clearingOperation.partition,
            2,
            Object.values(hold),
            clearingOperationFrom.clearingOperation.expirationTimestamp,
            clearingOperationFrom.clearingOperation.data,
            clearingOperationFrom.operatorData,
          );

        clearingIdentifier.clearingId = 2;
        await checkCreatedClearingValues(
          clearingIdentifier,
          ClearingOperationType.HoldCreation,
          ADDRESS_ZERO,
          _AMOUNT,
          clearingOperationFrom.clearingOperation.expirationTimestamp,
          clearingOperationFrom.clearingOperation.data,
          clearingOperationFrom.operatorData,
          ThirdPartyType.AUTHORIZED,
          signer_B.address,
          hold,
        );
        // authorize operator
        await asset.connect(signer_A).authorizeOperator(signer_C.address);

        await expect(asset.connect(signer_C).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold))
          .to.emit(asset, "ClearedOperatorHoldByPartition")
          .withArgs(
            signer_C.address,
            clearingOperationFrom.from,
            clearingOperationFrom.clearingOperation.partition,
            3,
            Object.values(hold),
            clearingOperationFrom.clearingOperation.expirationTimestamp,
            clearingOperationFrom.clearingOperation.data,
            clearingOperationFrom.operatorData,
          );

        clearingIdentifier.clearingId = 3;
        await checkCreatedClearingValues(
          clearingIdentifier,
          ClearingOperationType.HoldCreation,
          ADDRESS_ZERO,
          _AMOUNT,
          clearingOperationFrom.clearingOperation.expirationTimestamp,
          clearingOperationFrom.clearingOperation.data,
          clearingOperationFrom.operatorData,
          ThirdPartyType.OPERATOR,
          ADDRESS_ZERO,
          hold,
        );

        await checkCreatedClearingAmounts(
          Number(balance_A_original) - totalClearedAmount,
          signer_A.address,
          totalClearedAmount,
          totalClearedAmount,
          0,
          0,
          3,
        );
      });
    });

    describe("Edge cases and Additional Scenarios", () => {
      it("GIVEN multiple clearings WHEN getClearingsIdForByPartition with pagination THEN returns correct results", async () => {
        // Create multiple clearings
        for (let i = 0; i < 5; i++) {
          await asset.clearingTransferByPartition(clearingOperation, _AMOUNT / 10, signer_B.address);
        }

        // Test pagination
        const clearingIds_page1 = await asset.getClearingsIdForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          ClearingOperationType.Transfer,
          0,
          3,
        );
        const clearingIds_page2 = await asset.getClearingsIdForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          ClearingOperationType.Transfer,
          1,
          3,
        );

        expect(clearingIds_page1.length).to.equal(3);
        expect(clearingIds_page2.length).to.equal(2);
        expect(clearingIds_page1[0]).to.equal(1);
        expect(clearingIds_page1[1]).to.equal(2);
        expect(clearingIds_page1[2]).to.equal(3);
        expect(clearingIds_page2[0]).to.equal(4);
        expect(clearingIds_page2[1]).to.equal(5);
      });

      it("GIVEN a clearing transfer WHEN checking cleared amounts across different accounts THEN values are correct", async () => {
        const amount_A = _AMOUNT;
        const amount_B = _AMOUNT * 2;

        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, amount_A, signer_C.address);
        await asset.connect(signer_B).clearingTransferByPartition(clearingOperation, amount_B, signer_C.address);

        const clearedAmount_A = await asset.getClearedAmountFor(signer_A.address);
        const clearedAmount_B = await asset.getClearedAmountFor(signer_B.address);
        const clearedAmountByPartition_A = await asset.getClearedAmountForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
        );
        const clearedAmountByPartition_B = await asset.getClearedAmountForByPartition(
          _DEFAULT_PARTITION,
          signer_B.address,
        );

        expect(clearedAmount_A).to.equal(amount_A);
        expect(clearedAmount_B).to.equal(amount_B);
        expect(clearedAmountByPartition_A).to.equal(amount_A);
        expect(clearedAmountByPartition_B).to.equal(amount_B);
      });

      it("GIVEN a Token WHEN creating clearing with same parameters multiple times THEN all clearings are created independently", async () => {
        const countBefore = await asset.getClearingCountForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          ClearingOperationType.Transfer,
        );

        await asset.clearingTransferByPartition(clearingOperation, _AMOUNT / 2, signer_B.address);
        await asset.clearingTransferByPartition(clearingOperation, _AMOUNT / 2, signer_B.address);
        await asset.clearingTransferByPartition(clearingOperation, _AMOUNT / 2, signer_B.address);

        const countAfter = await asset.getClearingCountForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          ClearingOperationType.Transfer,
        );

        expect(countAfter).to.equal(countBefore + 3n);

        // Verify each clearing is independent
        const clearing1 = await asset.getClearingTransferForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          Number(countBefore + 1n),
        );
        const clearing2 = await asset.getClearingTransferForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          Number(countBefore + 2n),
        );
        const clearing3 = await asset.getClearingTransferForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          Number(countBefore + 3n),
        );

        expect(clearing1.amount).to.equal(_AMOUNT / 2);
        expect(clearing2.amount).to.equal(_AMOUNT / 2);
        expect(clearing3.amount).to.equal(_AMOUNT / 2);
      });

      it("GIVEN mixed clearing operations WHEN checking counts per type THEN counts are accurate", async () => {
        await asset.clearingTransferByPartition(clearingOperation, _AMOUNT / 5, signer_B.address);
        await asset.clearingTransferByPartition(clearingOperation, _AMOUNT / 5, signer_B.address);
        await asset.clearingRedeemByPartition(clearingOperation, _AMOUNT / 5);
        await asset.clearingRedeemByPartition(clearingOperation, _AMOUNT / 5);
        await asset.clearingRedeemByPartition(clearingOperation, _AMOUNT / 5);
        await asset.clearingCreateHoldByPartition(clearingOperation, {
          ...hold,
          amount: _AMOUNT / 5,
        });

        const transferCount = await asset.getClearingCountForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          ClearingOperationType.Transfer,
        );
        const redeemCount = await asset.getClearingCountForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          ClearingOperationType.Redeem,
        );
        const holdCreationCount = await asset.getClearingCountForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          ClearingOperationType.HoldCreation,
        );

        expect(transferCount).to.equal(2);
        expect(redeemCount).to.equal(3);
        expect(holdCreationCount).to.equal(1);
      });

      it("GIVEN a clearing WHEN checking third party type THEN correct type is returned", async () => {
        // NULL type (direct)
        await asset.clearingTransferByPartition(clearingOperation, _AMOUNT / 4, signer_B.address);

        // AUTHORIZED type (from)
        await asset.connect(signer_A).increaseAllowance(signer_C.address, _AMOUNT / 4);
        await asset
          .connect(signer_C)
          .clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT / 4, signer_B.address);

        // OPERATOR type
        await asset.connect(signer_A).authorizeOperator(signer_C.address);
        await asset
          .connect(signer_C)
          .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT / 4, signer_B.address);

        const thirdParty1 = await asset.getClearingThirdParty(
          _DEFAULT_PARTITION,
          signer_A.address,
          ClearingOperationType.Transfer,
          1,
        );
        const thirdParty2 = await asset.getClearingThirdParty(
          _DEFAULT_PARTITION,
          signer_A.address,
          ClearingOperationType.Transfer,
          2,
        );
        const thirdParty3 = await asset.getClearingThirdParty(
          _DEFAULT_PARTITION,
          signer_A.address,
          ClearingOperationType.Transfer,
          3,
        );

        expect(thirdParty1).to.equal(ADDRESS_ZERO); // NULL type
        expect(thirdParty2).to.equal(signer_C.address); // AUTHORIZED
        expect(thirdParty3).to.equal(ADDRESS_ZERO); // OPERATOR (stored differently)
      });

      it("GIVEN a Token WHEN activating and deactivating clearing multiple times THEN status is tracked correctly", async () => {
        expect(await asset.isClearingActivated()).to.equal(true);

        await asset.deactivateClearing();
        expect(await asset.isClearingActivated()).to.equal(false);

        await asset.activateClearing();
        expect(await asset.isClearingActivated()).to.equal(true);

        await asset.deactivateClearing();
        expect(await asset.isClearingActivated()).to.equal(false);

        await asset.activateClearing();
        expect(await asset.isClearingActivated()).to.equal(true);
      });

      // it("GIVEN a clearing WHEN expiration timestamp is at current time THEN transaction succeeds", async () => {
      //   const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
      //   const clearingOpCurrentTime = {
      //     ...clearingOperation,
      //     expirationTimestamp: currentTime + 1, // Add 1 second to ensure it's in the future
      //   };

      //   // Should succeed with future timestamp
      //   await expect(asset.clearingTransferByPartition(clearingOpCurrentTime, _AMOUNT / 10, signer_B.address))
      //     .to.not.be.reverted;
      // });

      it("GIVEN expired clearing operations WHEN reclaimClearingOperationByPartition for different types THEN all succeed", async () => {
        // Create clearings of all types
        await asset.clearingTransferByPartition(clearingOperation, _AMOUNT / 4, signer_B.address);
        await asset.clearingRedeemByPartition(clearingOperation, _AMOUNT / 4);
        await asset.clearingCreateHoldByPartition(clearingOperation, {
          ...hold,
          amount: _AMOUNT / 4,
        });

        // Wait for expiration
        await asset.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

        // Reclaim all
        clearingIdentifier.clearingId = 1;
        clearingIdentifier.clearingOperationType = ClearingOperationType.Transfer;
        await expect(asset.reclaimClearingOperationByPartition(clearingIdentifier)).to.emit(
          asset,
          "ClearingOperationReclaimed",
        );

        clearingIdentifier.clearingOperationType = ClearingOperationType.Redeem;
        await expect(asset.reclaimClearingOperationByPartition(clearingIdentifier)).to.emit(
          asset,
          "ClearingOperationReclaimed",
        );

        clearingIdentifier.clearingOperationType = ClearingOperationType.HoldCreation;
        await expect(asset.reclaimClearingOperationByPartition(clearingIdentifier)).to.emit(
          asset,
          "ClearingOperationReclaimed",
        );
      });
    });

    describe("Managing clearing success", () => {
      it("GIVEN a Token WHEN clearing operation approved THEN transaction succeeds", async () => {
        const balance_A_original = await asset.balanceOf(signer_A.address);
        const balance_B_original = await asset.balanceOf(signer_B.address);

        // Transfer
        await asset.clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address);

        clearingIdentifier.clearingId = 1;
        clearingIdentifier.clearingOperationType = ClearingOperationType.Transfer;

        await expect(asset.approveClearingOperationByPartition(clearingIdentifier))
          .to.emit(asset, "ClearingOperationApproved")
          .withArgs(signer_A.address, signer_A.address, _PARTITION_ID_1, 1, ClearingOperationType.Transfer, "0x");

        const balance_A_final_Transfer = await asset.balanceOf(signer_A.address);
        const balance_B_final_Transfer = await asset.balanceOf(signer_B.address);

        // Redeem

        await asset.clearingRedeemByPartition(clearingOperation, _AMOUNT);
        clearingIdentifier.clearingOperationType = ClearingOperationType.Redeem;

        await expect(asset.approveClearingOperationByPartition(clearingIdentifier))
          .to.emit(asset, "ClearingOperationApproved")
          .withArgs(signer_A.address, signer_A.address, _PARTITION_ID_1, 1, ClearingOperationType.Redeem, "0x");

        const balance_A_final_Redeem = await asset.balanceOf(signer_A.address);
        const balance_B_final_Redeem = await asset.balanceOf(signer_B.address);

        // HoldCreate
        await asset.clearingCreateHoldByPartition(clearingOperation, hold);

        clearingIdentifier.clearingOperationType = ClearingOperationType.HoldCreation;

        await expect(asset.approveClearingOperationByPartition(clearingIdentifier))
          .to.emit(asset, "ClearingOperationApproved")
          .withArgs(
            signer_A.address,
            signer_A.address,
            _PARTITION_ID_1,
            1,
            ClearingOperationType.HoldCreation,
            ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [1]),
          );

        const balance_A_final_HoldCreation = await asset.balanceOf(signer_A.address);
        const balance_B_final_HoldCreation = await asset.balanceOf(signer_B.address);

        expect(balance_B_final_Transfer).to.equal(balance_B_original + BigInt(_AMOUNT));
        expect(balance_A_final_Transfer).to.equal(balance_A_original - BigInt(_AMOUNT));
        expect(balance_B_final_Redeem).to.equal(balance_B_original + BigInt(_AMOUNT));
        expect(balance_A_final_Redeem).to.equal(balance_A_original - BigInt(2 * _AMOUNT));
        expect(balance_B_final_HoldCreation).to.equal(balance_B_original + BigInt(_AMOUNT));
        expect(balance_A_final_HoldCreation).to.equal(balance_A_original - BigInt(3 * _AMOUNT));
      });

      it("GIVEN a Token WHEN clearing operation cancelled THEN transaction succeeds", async () => {
        const balance_A_original = await asset.balanceOf(signer_A.address);
        const balance_B_original = await asset.balanceOf(signer_B.address);

        // Transfer
        await asset.clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address);

        clearingIdentifier.clearingId = 1;
        clearingIdentifier.clearingOperationType = ClearingOperationType.Transfer;

        await expect(asset.cancelClearingOperationByPartition(clearingIdentifier))
          .to.emit(asset, "ClearingOperationCanceled")
          .withArgs(signer_A.address, signer_A.address, _PARTITION_ID_1, 1, ClearingOperationType.Transfer);

        const balance_A_final_Transfer = await asset.balanceOf(signer_A.address);
        const balance_B_final_Transfer = await asset.balanceOf(signer_B.address);

        // Redeem

        await asset.clearingRedeemByPartition(clearingOperation, _AMOUNT);
        clearingIdentifier.clearingOperationType = ClearingOperationType.Redeem;

        await expect(asset.cancelClearingOperationByPartition(clearingIdentifier))
          .to.emit(asset, "ClearingOperationCanceled")
          .withArgs(signer_A.address, signer_A.address, _PARTITION_ID_1, 1, ClearingOperationType.Redeem);

        const balance_A_final_Redeem = await asset.balanceOf(signer_A.address);
        const balance_B_final_Redeem = await asset.balanceOf(signer_B.address);

        // HoldCreate
        await asset.clearingCreateHoldByPartition(clearingOperation, hold);

        clearingIdentifier.clearingOperationType = ClearingOperationType.HoldCreation;

        await expect(asset.cancelClearingOperationByPartition(clearingIdentifier))
          .to.emit(asset, "ClearingOperationCanceled")
          .withArgs(signer_A.address, signer_A.address, _PARTITION_ID_1, 1, ClearingOperationType.HoldCreation);

        const balance_A_final_HoldCreation = await asset.balanceOf(signer_A.address);
        const balance_B_final_HoldCreation = await asset.balanceOf(signer_B.address);

        expect(balance_B_final_Transfer).to.equal(balance_B_original);
        expect(balance_A_final_Transfer).to.equal(balance_A_original);
        expect(balance_B_final_Redeem).to.equal(balance_B_original);
        expect(balance_A_final_Redeem).to.equal(balance_A_original);
        expect(balance_B_final_HoldCreation).to.equal(balance_B_original);
        expect(balance_A_final_HoldCreation).to.equal(balance_A_original);
      });

      it("GIVEN a Token WHEN clearing operation recalimed THEN transaction succeeds", async () => {
        const balance_A_original = await asset.balanceOf(signer_A.address);
        const balance_B_original = await asset.balanceOf(signer_B.address);

        // Transfer
        await asset.clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address);

        clearingIdentifier.clearingId = 1;

        clearingIdentifier.clearingOperationType = ClearingOperationType.Transfer;

        await asset.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

        await expect(asset.reclaimClearingOperationByPartition(clearingIdentifier))
          .to.emit(asset, "ClearingOperationReclaimed")
          .withArgs(signer_A.address, signer_A.address, _PARTITION_ID_1, 1, ClearingOperationType.Transfer);

        const balance_A_final_Transfer = await asset.balanceOf(signer_A.address);
        const balance_B_final_Transfer = await asset.balanceOf(signer_B.address);

        await asset.changeSystemTimestamp(1);

        // Redeem

        await asset.clearingRedeemByPartition(clearingOperation, _AMOUNT);
        clearingIdentifier.clearingOperationType = ClearingOperationType.Redeem;

        await asset.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

        await expect(asset.reclaimClearingOperationByPartition(clearingIdentifier))
          .to.emit(asset, "ClearingOperationReclaimed")
          .withArgs(signer_A.address, signer_A.address, _PARTITION_ID_1, 1, ClearingOperationType.Redeem);

        const balance_A_final_Redeem = await asset.balanceOf(signer_A.address);
        const balance_B_final_Redeem = await asset.balanceOf(signer_B.address);

        await asset.changeSystemTimestamp(1);

        // HoldCreate
        await asset.clearingCreateHoldByPartition(clearingOperation, hold);

        clearingIdentifier.clearingOperationType = ClearingOperationType.HoldCreation;

        await asset.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

        await expect(asset.reclaimClearingOperationByPartition(clearingIdentifier))
          .to.emit(asset, "ClearingOperationReclaimed")
          .withArgs(signer_A.address, signer_A.address, _PARTITION_ID_1, 1, ClearingOperationType.HoldCreation);

        const balance_A_final_HoldCreation = await asset.balanceOf(signer_A.address);
        const balance_B_final_HoldCreation = await asset.balanceOf(signer_B.address);

        expect(balance_B_final_Transfer).to.equal(balance_B_original);
        expect(balance_A_final_Transfer).to.equal(balance_A_original);
        expect(balance_B_final_Redeem).to.equal(balance_B_original);
        expect(balance_A_final_Redeem).to.equal(balance_A_original);
        expect(balance_B_final_HoldCreation).to.equal(balance_B_original);
        expect(balance_A_final_HoldCreation).to.equal(balance_A_original);
      });

      it("GIVEN a token WHEN clearing operation reclaimed or canceled THEN allowance is restored", async () => {
        // RECLAIM
        await asset.connect(signer_A).increaseAllowance(signer_B.address, 3 * _AMOUNT);

        await asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
        await asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT);
        await asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold);
        let allowance_B_Before = await asset.allowance(signer_A.address, signer_B.address);

        await asset.changeSystemTimestamp(clearingOperationFrom.clearingOperation.expirationTimestamp + 1);

        await expect(asset.reclaimClearingOperationByPartition(clearingIdentifier))
          .to.emit(asset, "Approval")
          .withArgs(signer_A.address, signer_B.address, _AMOUNT);

        clearingIdentifier.clearingOperationType = ClearingOperationType.Redeem;
        await expect(asset.reclaimClearingOperationByPartition(clearingIdentifier))
          .to.emit(asset, "Approval")
          .withArgs(signer_A.address, signer_B.address, 2 * _AMOUNT);

        clearingIdentifier.clearingOperationType = ClearingOperationType.HoldCreation;
        await expect(asset.reclaimClearingOperationByPartition(clearingIdentifier))
          .to.emit(asset, "Approval")
          .withArgs(signer_A.address, signer_B.address, 3 * _AMOUNT);

        expect(await asset.allowance(signer_A.address, signer_B.address)).to.be.equal(3 * _AMOUNT);
        expect(allowance_B_Before).to.be.equal(ZERO);

        // CANCEL
        await asset.resetSystemTimestamp();

        await asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
        await asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT);
        await asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold);

        allowance_B_Before = await asset.allowance(signer_A.address, signer_B.address);

        clearingIdentifier.clearingOperationType = ClearingOperationType.Transfer;
        clearingIdentifier.clearingId = 2;
        await expect(asset.cancelClearingOperationByPartition(clearingIdentifier))
          .to.emit(asset, "Approval")
          .withArgs(signer_A.address, signer_B.address, _AMOUNT);

        clearingIdentifier.clearingOperationType = ClearingOperationType.Redeem;
        await expect(asset.cancelClearingOperationByPartition(clearingIdentifier))
          .to.emit(asset, "Approval")
          .withArgs(signer_A.address, signer_B.address, 2 * _AMOUNT);

        clearingIdentifier.clearingOperationType = ClearingOperationType.HoldCreation;
        await expect(asset.cancelClearingOperationByPartition(clearingIdentifier))
          .to.emit(asset, "Approval")
          .withArgs(signer_A.address, signer_B.address, 3 * _AMOUNT);

        expect(await asset.allowance(signer_A.address, signer_B.address)).to.be.equal(3 * _AMOUNT);
        expect(allowance_B_Before).to.be.equal(ZERO);
      });
    });

    describe("Balance Adjustments", () => {
      async function setPreBalanceAdjustment() {
        await asset.connect(signer_A).grantRole(ATS_ROLES.ADJUSTMENT_BALANCE_ROLE, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_A.address);
      }

      it("GIVEN a clearing WHEN adjustBalances THEN clearing amount gets updated succeeds", async () => {
        await setPreBalanceAdjustment();

        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 7 * _AMOUNT,
          data: EMPTY_HEX_BYTES,
        });

        const balance_Before = await asset.balanceOf(signer_A.address);
        const balance_Before_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

        // CLEARING TRANSFER
        clearingOperation.partition = _PARTITION_ID_1;
        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_B.address);

        await asset.connect(signer_A).authorizeOperator(signer_B.address);
        await asset
          .connect(signer_B)
          .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_B.address);
        await asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold);

        await asset.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold);
        await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT);

        await asset.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT);

        const cleared_TotalAmount_Before = await asset.getClearedAmountFor(signer_A.address);
        const cleared_TotalAmount_Before_Partition_1 = await asset.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const cleared_Before = await asset.getClearingTransferForByPartition(
          clearingIdentifier.partition,
          clearingIdentifier.tokenHolder,
          clearingIdentifier.clearingId,
        );

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
        await asset.connect(signer_A).setScheduledBalanceAdjustment(balanceAdjustmentData);
        await asset.connect(signer_A).setScheduledBalanceAdjustment(balanceAdjustmentData_2);

        // wait for first scheduled balance adjustment only
        await asset.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:00:03Z"));

        const cleared_TotalAmount_After = await asset.getClearedAmountFor(signer_A.address);
        const cleared_TotalAmount_After_Partition_1 = await asset.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const cleared_After = await asset.getClearingTransferForByPartition(
          clearingIdentifier.partition,
          clearingIdentifier.tokenHolder,
          clearingIdentifier.clearingId,
        );
        const balance_After = await asset.balanceOf(signer_A.address);
        const balance_After_Partition_1 = await asset.balanceOfByPartition(_DEFAULT_PARTITION, signer_A.address);

        expect(cleared_TotalAmount_After).to.be.equal(cleared_TotalAmount_Before * BigInt(adjustFactor * adjustFactor));
        expect(cleared_TotalAmount_After_Partition_1).to.be.equal(
          cleared_TotalAmount_Before_Partition_1 * BigInt(adjustFactor * adjustFactor),
        );
        expect(balance_After).to.be.equal((balance_Before - BigInt(9 * _AMOUNT)) * BigInt(adjustFactor * adjustFactor));

        expect(balance_After_Partition_1).to.be.equal(
          (balance_Before_Partition_1 - BigInt(9 * _AMOUNT)) * BigInt(adjustFactor * adjustFactor),
        );
        expect(cleared_After.amount).to.be.equal(cleared_Before.amount * BigInt(adjustFactor * adjustFactor));
      });

      it("GIVEN a clearing WHEN adjustBalances THEN approve succeed", async () => {
        await setPreBalanceAdjustment();

        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 7 * _AMOUNT,
          data: EMPTY_HEX_BYTES,
        });

        const balance_Before_A = await asset.balanceOf(signer_A.address);
        const balance_Before_Partition_1_A = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
        const balance_Before_C = await asset.balanceOf(signer_C.address);
        const balance_Before_Partition_1_C = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_C.address);

        // CLEARING TRANSFER
        clearingOperation.partition = _PARTITION_ID_1;
        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);

        await asset.connect(signer_A).authorizeOperator(signer_B.address);
        await asset
          .connect(signer_B)
          .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
        // CLEARING CREATE HOLD
        await asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold);
        await asset.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold);
        // CLEARING REDEEM
        await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT);
        await asset.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT);

        const cleared_Amount_Before = await asset.getClearedAmountFor(signer_A.address);
        const cleared_Amount_Before_Partition_1 = await asset.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        const held_Amount_Before = await asset.getHeldAmountFor(signer_A.address);
        const held_Amount_Before_Partition_1 = await asset.getHeldAmountFor(signer_A.address);

        // adjustBalances
        await asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

        // APPROVE CLEARINGS
        for (let opTypeId = 1; opTypeId <= 3; opTypeId++) {
          clearingIdentifier.clearingOperationType = getOpType(opTypeId);
          for (let i = 1; i <= 3; i++) {
            clearingIdentifier.clearingId = i;
            await asset.approveClearingOperationByPartition(clearingIdentifier);
          }
        }

        const balance_After_Approve_A = await asset.balanceOf(signer_A.address);
        const balance_After_Approve_Partition_1_A = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
        const balance_After_Approve_C = await asset.balanceOf(signer_C.address);
        const balance_After_Approve_Partition_1_C = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_C.address);
        const cleared_Amount_After = await asset.getClearedAmountFor(signer_A.address);
        const cleared_Amount_After_Partition_1 = await asset.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const held_Amount_After = await asset.getHeldAmountFor(signer_A.address);
        const held_Amount_After_Partition_1 = await asset.getHeldAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        expect(balance_After_Approve_A).to.be.equal((balance_Before_A - BigInt(9 * _AMOUNT)) * BigInt(adjustFactor));
        expect(balance_After_Approve_C).to.be.equal((balance_Before_C + BigInt(3 * _AMOUNT)) * BigInt(adjustFactor));
        expect(balance_After_Approve_Partition_1_A).to.be.equal(
          (balance_Before_Partition_1_A - BigInt(9 * _AMOUNT)) * BigInt(adjustFactor),
        );
        expect(balance_After_Approve_Partition_1_C).to.be.equal(
          (balance_Before_Partition_1_C + BigInt(3 * _AMOUNT)) * BigInt(adjustFactor),
        );
        expect(cleared_Amount_After).to.be.equal((cleared_Amount_Before - BigInt(9 * _AMOUNT)) * BigInt(adjustFactor));
        expect(cleared_Amount_After_Partition_1).to.be.equal(
          (cleared_Amount_Before_Partition_1 - BigInt(9 * _AMOUNT)) * BigInt(adjustFactor),
        );
        expect(held_Amount_After).to.be.equal((held_Amount_Before + BigInt(3 * _AMOUNT)) * BigInt(adjustFactor));
        expect(held_Amount_After_Partition_1).to.be.equal(
          (held_Amount_Before_Partition_1 + BigInt(3 * _AMOUNT)) * BigInt(adjustFactor),
        );
        expect(balance_After_Approve_A + cleared_Amount_After).to.be.equal(
          (balance_Before_A - BigInt(9 * _AMOUNT)) * BigInt(adjustFactor),
        );
        expect(balance_After_Approve_Partition_1_A + cleared_Amount_After_Partition_1).to.be.equal(
          (balance_Before_Partition_1_A - BigInt(9 * _AMOUNT)) * BigInt(adjustFactor),
        );
      });

      it("GIVEN a clearing WHEN adjustBalances THEN cancel succeed", async () => {
        await setPreBalanceAdjustment();

        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 7 * _AMOUNT,
          data: EMPTY_HEX_BYTES,
        });

        const balance_Before_A = await asset.balanceOf(signer_A.address);
        const balance_Before_Partition_1_A = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
        const balance_Before_C = await asset.balanceOf(signer_C.address);
        const balance_Before_Partition_1_C = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_C.address);

        // CLEARING TRANSFER
        clearingOperation.partition = _PARTITION_ID_1;
        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);

        await asset.connect(signer_A).authorizeOperator(signer_B.address);
        await asset
          .connect(signer_B)
          .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
        // CLEARING CREATE HOLD
        await asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold);
        await asset.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold);
        // CLEARING REDEEM
        await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT);
        await asset.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT);

        const cleared_Amount_Before = await asset.getClearedAmountFor(signer_A.address);
        const cleared_Amount_Before_Partition_1 = await asset.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        const held_Amount_Before = await asset.getHeldAmountFor(signer_A.address);
        const held_Amount_Before_Partition_1 = await asset.getHeldAmountFor(signer_A.address);

        // adjustBalances
        await asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

        // CANCEL CLEARINGS
        for (let opTypeId = 1; opTypeId <= 3; opTypeId++) {
          clearingIdentifier.clearingOperationType = getOpType(opTypeId);
          for (let i = 1; i <= 3; i++) {
            clearingIdentifier.clearingId = i;
            await asset.cancelClearingOperationByPartition(clearingIdentifier);
          }
        }

        const balance_After_Cancel_A = await asset.balanceOf(signer_A.address);
        const balance_After_Cancel_Partition_1_A = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
        const balance_After_Cancel_C = await asset.balanceOf(signer_C.address);
        const balance_After_Cancel_Partition_1_C = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_C.address);
        const cleared_Amount_After = await asset.getClearedAmountFor(signer_A.address);
        const cleared_Amount_After_Partition_1 = await asset.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const held_Amount_After = await asset.getHeldAmountFor(signer_A.address);
        const held_Amount_After_Partition_1 = await asset.getHeldAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        expect(balance_After_Cancel_A).to.be.equal(balance_Before_A * BigInt(adjustFactor));
        expect(balance_After_Cancel_C).to.be.equal(balance_Before_C * BigInt(adjustFactor));
        expect(balance_After_Cancel_Partition_1_A).to.be.equal(balance_Before_Partition_1_A * BigInt(adjustFactor));
        expect(balance_After_Cancel_Partition_1_C).to.be.equal(balance_Before_Partition_1_C * BigInt(adjustFactor));
        expect(cleared_Amount_After).to.be.equal((cleared_Amount_Before - BigInt(9 * _AMOUNT)) * BigInt(adjustFactor));
        expect(cleared_Amount_After_Partition_1).to.be.equal(
          (cleared_Amount_Before_Partition_1 - BigInt(9 * _AMOUNT)) * BigInt(adjustFactor),
        );
        expect(held_Amount_After).to.be.equal(held_Amount_Before * BigInt(adjustFactor));
        expect(held_Amount_After_Partition_1).to.be.equal(held_Amount_Before_Partition_1 * BigInt(adjustFactor));
        expect(balance_After_Cancel_A + cleared_Amount_After).to.be.equal(balance_Before_A * BigInt(adjustFactor));
        expect(balance_After_Cancel_Partition_1_A + cleared_Amount_After_Partition_1).to.be.equal(
          balance_Before_Partition_1_A * BigInt(adjustFactor),
        );
      });

      it("GIVEN a clearing WHEN adjustBalances THEN reclaim succeed", async () => {
        await setPreBalanceAdjustment();

        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 7 * _AMOUNT,
          data: EMPTY_HEX_BYTES,
        });

        const balance_Before_A = await asset.balanceOf(signer_A.address);
        const balance_Before_Partition_1_A = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
        const balance_Before_C = await asset.balanceOf(signer_C.address);
        const balance_Before_Partition_1_C = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_C.address);

        // CLEARING TRANSFER
        clearingOperation.partition = _PARTITION_ID_1;
        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);

        await asset.connect(signer_A).authorizeOperator(signer_B.address);
        await asset
          .connect(signer_B)
          .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
        // CLEARING CREATE HOLD
        await asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold);
        await asset.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold);
        // CLEARING REDEEM
        await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT);
        await asset.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT);

        const cleared_Amount_Before = await asset.getClearedAmountFor(signer_A.address);
        const cleared_Amount_Before_Partition_1 = await asset.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        const held_Amount_Before = await asset.getHeldAmountFor(signer_A.address);
        const held_Amount_Before_Partition_1 = await asset.getHeldAmountFor(signer_A.address);

        // adjustBalances
        await asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

        await asset.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

        // RECLAIM CLEARINGS
        for (let opTypeId = 1; opTypeId <= 3; opTypeId++) {
          clearingIdentifier.clearingOperationType = getOpType(opTypeId);
          for (let i = 1; i <= 3; i++) {
            clearingIdentifier.clearingId = i;
            await asset.reclaimClearingOperationByPartition(clearingIdentifier);
          }
        }

        const balance_After_Cancel_A = await asset.balanceOf(signer_A.address);
        const balance_After_Cancel_Partition_1_A = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
        const balance_After_Cancel_C = await asset.balanceOf(signer_C.address);
        const balance_After_Cancel_Partition_1_C = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_C.address);
        const cleared_Amount_After = await asset.getClearedAmountFor(signer_A.address);
        const cleared_Amount_After_Partition_1 = await asset.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const held_Amount_After = await asset.getHeldAmountFor(signer_A.address);
        const held_Amount_After_Partition_1 = await asset.getHeldAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        expect(balance_After_Cancel_A).to.be.equal(balance_Before_A * BigInt(adjustFactor));
        expect(balance_After_Cancel_C).to.be.equal(balance_Before_C * BigInt(adjustFactor));
        expect(balance_After_Cancel_Partition_1_A).to.be.equal(balance_Before_Partition_1_A * BigInt(adjustFactor));
        expect(balance_After_Cancel_Partition_1_C).to.be.equal(balance_Before_Partition_1_C * BigInt(adjustFactor));
        expect(cleared_Amount_After).to.be.equal((cleared_Amount_Before - BigInt(9 * _AMOUNT)) * BigInt(adjustFactor));
        expect(cleared_Amount_After_Partition_1).to.be.equal(
          (cleared_Amount_Before_Partition_1 - BigInt(9 * _AMOUNT)) * BigInt(adjustFactor),
        );
        expect(held_Amount_After).to.be.equal(held_Amount_Before * BigInt(adjustFactor));
        expect(held_Amount_After_Partition_1).to.be.equal(held_Amount_Before_Partition_1 * BigInt(adjustFactor));
        expect(balance_After_Cancel_A + cleared_Amount_After).to.be.equal(balance_Before_A * BigInt(adjustFactor));
        expect(balance_After_Cancel_Partition_1_A + cleared_Amount_After_Partition_1).to.be.equal(
          balance_Before_Partition_1_A * BigInt(adjustFactor),
        );
      });

      it("GIVEN a hold WHEN adjustBalances THEN clearing succeeds", async () => {
        await asset.connect(signer_B).issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 15 * _AMOUNT,
          data: EMPTY_HEX_BYTES,
        });
        await setPreBalanceAdjustment();
        const balance_Before = await asset.balanceOf(signer_A.address);
        const balance_Before_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

        // CLEARING BEFORE BALANCE ADJUSTMENT
        // CLEARING TRANSFER
        clearingOperation.partition = _PARTITION_ID_1;
        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);

        await asset.connect(signer_A).authorizeOperator(signer_B.address);
        await asset
          .connect(signer_B)
          .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
        // CLEARING CREATE HOLD
        await asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold);
        await asset.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold);
        // CLEARING REDEEM
        await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT);
        await asset.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT);

        const cleared_Amount_Before = await asset.getClearedAmountFor(signer_A.address);
        const cleared_Amount_Before_Partition_1 = await asset.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        // adjustBalances
        await asset.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

        // CLEARING AFTER BALANCE ADJUSTMENT
        // CLEARING TRANSFER
        clearingOperation.partition = _PARTITION_ID_1;
        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);

        await asset
          .connect(signer_B)
          .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
        // CLEARING CREATE HOLD
        await asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold);
        await asset.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold);
        // CLEARING REDEEM
        await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        await asset.increaseAllowance(signer_B.address, _AMOUNT);
        await asset.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT);
        await asset.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT);

        const balance_After_Clearing = await asset.balanceOf(signer_A.address);
        const balance_After_Clearing_Partition_1 = await asset.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
        const cleared_Amount_After = await asset.getClearedAmountFor(signer_A.address);
        const cleared_Amount_After_Partition_1 = await asset.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        expect(balance_After_Clearing).to.be.equal(
          (balance_Before - BigInt(9 * _AMOUNT)) * BigInt(adjustFactor) - BigInt(9 * _AMOUNT),
        );
        expect(balance_After_Clearing_Partition_1).to.be.equal(
          (balance_Before_Partition_1 - BigInt(9 * _AMOUNT)) * BigInt(adjustFactor) - BigInt(9 * _AMOUNT),
        );
        expect(cleared_Amount_After).to.be.equal(cleared_Amount_Before * BigInt(adjustFactor) + BigInt(9 * _AMOUNT));
        expect(cleared_Amount_After_Partition_1).to.be.equal(
          cleared_Amount_Before_Partition_1 * BigInt(adjustFactor) + BigInt(9 * _AMOUNT),
        );
        expect(balance_After_Clearing + cleared_Amount_After).to.be.equal(balance_Before * BigInt(adjustFactor));
        expect(balance_After_Clearing_Partition_1 + cleared_Amount_After_Partition_1).to.be.equal(
          balance_Before_Partition_1 * BigInt(adjustFactor),
        );
      });
    });
  });

  describe("Common Modifiers", () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    describe("onlyClearingDisabled modifier", () => {
      it("GIVEN clearing is activated WHEN attempting executeHold THEN transaction succeeds (executeHold does not have onlyClearingDisabled modifier)", async () => {
        // First create a hold when clearing is not yet activated
        await asset.deactivateClearing();

        // Issue tokens to signer_A so they can create a hold
        await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 1000,
          data: _DATA,
        });

        const holdAmount = 100;
        const holdExpirationTimestamp = expirationTimestamp;
        const holdEscrow = signer_C.address;
        const holdTo = signer_B.address;
        const holdData = _DATA;

        const holdToCreate = {
          amount: holdAmount,
          expirationTimestamp: holdExpirationTimestamp,
          escrow: holdEscrow,
          to: holdTo,
          data: holdData,
        };

        await asset.connect(signer_A).createHoldByPartition(_DEFAULT_PARTITION, holdToCreate);

        // Now activate clearing
        await asset.activateClearing();

        const holdId = 1;
        const holdIdentifierForTest = {
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          holdId: holdId,
        };

        // Execute hold - should succeed because executeHoldByPartition doesn't have onlyClearingDisabled modifier
        await expect(
          asset.connect(signer_C).executeHoldByPartition(holdIdentifierForTest, signer_B.address, holdAmount),
        ).to.not.be.reverted;
      });

      it("GIVEN clearing is activated WHEN attempting releaseHold THEN transaction succeeds (releaseHold does not have onlyClearingDisabled modifier)", async () => {
        // First create a hold when clearing is not yet activated
        await asset.deactivateClearing();

        // Issue tokens to signer_A so they can create a hold
        await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 1000,
          data: _DATA,
        });

        const holdAmount = 100;
        const holdExpirationTimestamp = expirationTimestamp;
        const holdEscrow = signer_C.address;
        const holdTo = signer_B.address;
        const holdData = _DATA;

        const holdToCreate = {
          amount: holdAmount,
          expirationTimestamp: holdExpirationTimestamp,
          escrow: holdEscrow,
          to: holdTo,
          data: holdData,
        };

        await asset.connect(signer_A).createHoldByPartition(_DEFAULT_PARTITION, holdToCreate);

        // Now activate clearing
        await asset.activateClearing();

        const holdId = 1;
        const holdIdentifierForTest = {
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          holdId: holdId,
        };

        // Release hold - should succeed because releaseHoldByPartition doesn't have onlyClearingDisabled modifier
        await expect(asset.connect(signer_C).releaseHoldByPartition(holdIdentifierForTest, holdAmount)).to.not.be
          .reverted;
      });
    });

    describe("validateAddress modifier", () => {
      it("GIVEN zero address as destination WHEN calling clearingTransferByPartition THEN transaction fails with ZeroAddressNotAllowed", async () => {
        await expect(
          asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, ADDRESS_ZERO),
        ).to.be.revertedWithCustomError(asset, "ZeroAddressNotAllowed");
      });
    });

    describe("onlyUninitialized modifier", () => {
      it("GIVEN clearing already initialized WHEN calling initializeClearing THEN transaction fails with AlreadyInitialized", async () => {
        await expect(asset.initializeClearing(true)).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
      });
    });

    describe("onlyDefaultPartitionWithSinglePartition modifier", () => {
      it("GIVEN non-default partition WHEN calling cancelClearingOperationByPartition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        const wrongPartitionIdentifier = {
          ...clearingIdentifier,
          partition: _WRONG_PARTITION,
        };

        await expect(asset.cancelClearingOperationByPartition(wrongPartitionIdentifier)).to.be.revertedWithCustomError(
          asset,
          "PartitionNotAllowedInSinglePartitionMode",
        );
      });

      it("GIVEN non-default partition WHEN calling reclaimClearingOperationByPartition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        const wrongPartitionIdentifier = {
          ...clearingIdentifier,
          partition: _WRONG_PARTITION,
        };

        await expect(asset.reclaimClearingOperationByPartition(wrongPartitionIdentifier)).to.be.revertedWithCustomError(
          asset,
          "PartitionNotAllowedInSinglePartitionMode",
        );
      });
    });

    describe("onlyUnrecoveredAddress modifier", () => {
      describe("operatorClearingCreateHoldByPartition", () => {
        it("GIVEN a recovered msgSender WHEN calling operatorClearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
          await asset.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset.connect(signer_A).operatorClearingCreateHoldByPartition(clearingOperationFromB, hold),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN a recovered from address WHEN calling operatorClearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
          await asset.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset.connect(signer_A).operatorClearingCreateHoldByPartition(clearingOperationFromB, hold),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN a recovered hold.to WHEN calling operatorClearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
          // Give signer_B some tokens and authorize operator
          await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
          await asset.issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_B.address,
            value: _AMOUNT,
            data: _DATA,
          });
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
          // Recover the hold.to address (signer_C - the actual hold.to)
          await asset.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset.connect(signer_A).operatorClearingCreateHoldByPartition(clearingOperationFromB, hold),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });
      });

      describe("clearingRedeemByPartition", () => {
        it("GIVEN a recovered msgSender WHEN calling clearingRedeemByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
          await asset.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          await expect(
            asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });
      });

      describe("clearingRedeemFromByPartition", () => {
        it("GIVEN a recovered msgSender WHEN calling clearingRedeemFromByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
          await asset.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset.connect(signer_A).clearingRedeemFromByPartition(clearingOperationFromB, _AMOUNT),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN a recovered from address WHEN calling clearingRedeemFromByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
          await asset.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset.connect(signer_A).clearingRedeemFromByPartition(clearingOperationFromB, _AMOUNT),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });
      });

      describe("operatorClearingRedeemByPartition", () => {
        it("GIVEN a recovered msgSender WHEN calling operatorClearingRedeemByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
          await asset.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset.connect(signer_A).operatorClearingRedeemByPartition(clearingOperationFromB, _AMOUNT),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN a recovered from address WHEN calling operatorClearingRedeemByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
          await asset.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset.connect(signer_A).operatorClearingRedeemByPartition(clearingOperationFromB, _AMOUNT),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });
      });

      describe("clearingTransferByPartition", () => {
        it("GIVEN a recovered msgSender WHEN calling clearingTransferByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
          await asset.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          await expect(
            asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN a recovered to address WHEN calling clearingTransferByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
          await asset.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);

          await expect(
            asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });
      });

      describe("clearingTransferFromByPartition", () => {
        it("GIVEN a recovered msgSender WHEN calling clearingTransferFromByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
          await asset.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset.connect(signer_A).clearingTransferFromByPartition(clearingOperationFromB, _AMOUNT, signer_C.address),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN a recovered to address WHEN calling clearingTransferFromByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
          await asset.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset.connect(signer_A).clearingTransferFromByPartition(clearingOperationFromB, _AMOUNT, signer_C.address),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN a recovered from address WHEN calling clearingTransferFromByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
          await asset.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset.connect(signer_A).clearingTransferFromByPartition(clearingOperationFromB, _AMOUNT, signer_C.address),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });
      });

      describe("operatorClearingTransferByPartition", () => {
        it("GIVEN a recovered msgSender WHEN calling operatorClearingTransferByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
          await asset.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset
              .connect(signer_A)
              .operatorClearingTransferByPartition(clearingOperationFromB, _AMOUNT, signer_C.address),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN a recovered to address WHEN calling operatorClearingTransferByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
          await asset.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset
              .connect(signer_A)
              .operatorClearingTransferByPartition(clearingOperationFromB, _AMOUNT, signer_C.address),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });

        it("GIVEN a recovered from address WHEN calling operatorClearingTransferByPartition THEN transaction fails with WalletRecovered", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
          await asset.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset
              .connect(signer_A)
              .operatorClearingTransferByPartition(clearingOperationFromB, _AMOUNT, signer_C.address),
          ).to.be.revertedWithCustomError(asset, "WalletRecovered");
        });
      });
    });

    describe("onlyUnProtectedPartitionsOrWildCardRole modifier", () => {
      beforeEach(async () => {
        // Grant _PROTECTED_PARTITIONS_ROLE to call protectPartitions
        await asset.grantRole(ATS_ROLES.PROTECTED_PARTITIONS_ROLE, signer_A.address);
        // Protect partitions
        await asset.protectPartitions();
      });

      it("GIVEN protected partitions without wildcard role WHEN calling clearingCreateHoldByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        // Try to create clearing hold without having wildcard role
        await expect(
          asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
      });

      it("GIVEN protected partitions with wildcard role WHEN calling clearingCreateHoldByPartition THEN transaction succeeds", async () => {
        // Grant wildcard role to signer_A
        await asset.grantRole(ATS_ROLES.WILD_CARD_ROLE, signer_A.address);

        // Should succeed now
        await expect(asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold)).to.not.be.reverted;
      });

      it("GIVEN protected partitions without wildcard role WHEN calling clearingCreateHoldFromByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        // Grant allowance for clearing from
        await asset.connect(signer_B).authorizeOperator(signer_A.address);

        const clearingOperationFromB = {
          ...clearingOperationFrom,
          from: signer_B.address,
        };

        // Try to create clearing hold from without having wildcard role
        await expect(
          asset.connect(signer_A).clearingCreateHoldFromByPartition(clearingOperationFromB, hold),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
      });

      it("GIVEN protected partitions without wildcard role WHEN calling operatorClearingCreateHoldByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        // Make signer_A an operator
        await asset.connect(signer_B).authorizeOperator(signer_A.address);

        const clearingOperationFromB = {
          ...clearingOperationFrom,
          from: signer_B.address,
        };

        // Try to create operator clearing hold without having wildcard role
        await expect(
          asset.connect(signer_A).operatorClearingCreateHoldByPartition(clearingOperationFromB, hold),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
      });

      describe("additional clearing methods", () => {
        it("GIVEN protected partitions with wildcard role WHEN calling clearingCreateHoldFromByPartition THEN transaction succeeds", async () => {
          // Give signer_B some tokens
          await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
          await asset.issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_B.address,
            value: _AMOUNT,
            data: _DATA,
          });
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.WILD_CARD_ROLE, signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          // Need to increase allowance for signer_A from signer_B
          await asset.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);

          await asset.connect(signer_A).clearingCreateHoldFromByPartition(clearingOperationFromB, hold);
        });

        it("GIVEN protected partitions with wildcard role WHEN calling operatorClearingCreateHoldByPartition THEN transaction succeeds", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.WILD_CARD_ROLE, signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await asset.connect(signer_A).operatorClearingCreateHoldByPartition(clearingOperationFromB, hold);
        });

        it("GIVEN protected partitions without wildcard role WHEN calling clearingRedeemByPartition THEN transaction fails", async () => {
          await expect(
            asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT),
          ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        });

        it("GIVEN protected partitions with wildcard role WHEN calling clearingRedeemByPartition THEN transaction succeeds", async () => {
          await asset.grantRole(ATS_ROLES.WILD_CARD_ROLE, signer_A.address);

          await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        });

        it("GIVEN protected partitions without wildcard role WHEN calling clearingRedeemFromByPartition THEN transaction fails", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset.connect(signer_A).clearingRedeemFromByPartition(clearingOperationFromB, _AMOUNT),
          ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        });

        it("GIVEN protected partitions with wildcard role WHEN calling clearingRedeemFromByPartition THEN transaction succeeds", async () => {
          // Give signer_B some tokens
          await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
          await asset.issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_B.address,
            value: _AMOUNT,
            data: _DATA,
          });
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.WILD_CARD_ROLE, signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          // Need to increase allowance for signer_A from signer_B
          await asset.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);

          await asset.connect(signer_A).clearingRedeemFromByPartition(clearingOperationFromB, _AMOUNT);
        });

        it("GIVEN protected partitions without wildcard role WHEN calling operatorClearingRedeemByPartition THEN transaction fails", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset.connect(signer_A).operatorClearingRedeemByPartition(clearingOperationFromB, _AMOUNT),
          ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        });

        it("GIVEN protected partitions with wildcard role WHEN calling operatorClearingRedeemByPartition THEN transaction succeeds", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.WILD_CARD_ROLE, signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await asset.connect(signer_A).operatorClearingRedeemByPartition(clearingOperationFromB, _AMOUNT);
        });

        it("GIVEN protected partitions without wildcard role WHEN calling clearingTransferByPartition THEN transaction fails", async () => {
          await expect(
            asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address),
          ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        });

        it("GIVEN protected partitions with wildcard role WHEN calling clearingTransferByPartition THEN transaction succeeds", async () => {
          await asset.grantRole(ATS_ROLES.WILD_CARD_ROLE, signer_A.address);

          await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address);
        });

        it("GIVEN protected partitions without wildcard role WHEN calling clearingTransferFromByPartition THEN transaction fails", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset.connect(signer_A).clearingTransferFromByPartition(clearingOperationFromB, _AMOUNT, signer_C.address),
          ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        });

        it("GIVEN protected partitions with wildcard role WHEN calling clearingTransferFromByPartition THEN transaction succeeds", async () => {
          // Give signer_B some tokens
          await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
          await asset.issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_B.address,
            value: _AMOUNT,
            data: _DATA,
          });
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.WILD_CARD_ROLE, signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          // Need to increase allowance for signer_A from signer_B
          await asset.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);

          await asset
            .connect(signer_A)
            .clearingTransferFromByPartition(clearingOperationFromB, _AMOUNT, signer_C.address);
        });

        it("GIVEN protected partitions without wildcard role WHEN calling operatorClearingTransferByPartition THEN transaction fails", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            asset
              .connect(signer_A)
              .operatorClearingTransferByPartition(clearingOperationFromB, _AMOUNT, signer_C.address),
          ).to.be.revertedWithCustomError(asset, "PartitionsAreProtectedAndNoRole");
        });

        it("GIVEN protected partitions with wildcard role WHEN calling operatorClearingTransferByPartition THEN transaction succeeds", async () => {
          await asset.connect(signer_B).authorizeOperator(signer_A.address);
          await asset.grantRole(ATS_ROLES.WILD_CARD_ROLE, signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await asset
            .connect(signer_A)
            .operatorClearingTransferByPartition(clearingOperationFromB, _AMOUNT, signer_C.address);
        });
      });
    });

    describe("onlyProtectedPartitions modifier", () => {
      it("GIVEN unprotected partitions WHEN calling protectedClearingTransferByPartition THEN transaction fails with PartitionsAreUnProtected", async () => {
        const protectedClearingOperation = {
          clearingOperation: clearingOperation,
          from: signer_A.address,
          deadline: expirationTimestamp,
          nonce: 1,
        };

        const signature = "0x1234"; // Dummy signature

        await expect(
          asset.protectedClearingTransferByPartition(protectedClearingOperation, _AMOUNT, signer_B.address, signature),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreUnProtected");
      });

      it("GIVEN unprotected partitions WHEN calling protectedClearingRedeemByPartition THEN transaction fails with PartitionsAreUnProtected", async () => {
        const protectedClearingOperation = {
          clearingOperation: clearingOperation,
          from: signer_A.address,
          deadline: expirationTimestamp,
          nonce: 1,
        };

        const signature = "0x1234"; // Dummy signature

        await expect(
          asset.protectedClearingRedeemByPartition(protectedClearingOperation, _AMOUNT, signature),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreUnProtected");
      });

      it("GIVEN unprotected partitions WHEN calling protectedClearingCreateHoldByPartition THEN transaction fails with PartitionsAreUnProtected", async () => {
        const protectedClearingOperation = {
          clearingOperation: clearingOperation,
          from: signer_A.address,
          deadline: expirationTimestamp,
          nonce: 1,
        };

        const signature = "0x1234"; // Dummy signature

        await expect(
          asset.protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, signature),
        ).to.be.revertedWithCustomError(asset, "PartitionsAreUnProtected");
      });
    });

    describe("onlyUnpaused modifier for protected clearing functions", () => {
      beforeEach(async () => {
        await asset.connect(signer_D).pause();
      });

      it("GIVEN a paused Token WHEN calling protectedClearingTransferByPartition THEN transaction fails with TokenIsPaused", async () => {
        const protectedClearingOperation = {
          clearingOperation: clearingOperation,
          from: signer_A.address,
          deadline: expirationTimestamp,
          nonce: 1,
        };

        const signature = "0x1234"; // Dummy signature

        await expect(
          asset.protectedClearingTransferByPartition(protectedClearingOperation, _AMOUNT, signer_B.address, signature),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN calling protectedClearingRedeemByPartition THEN transaction fails with TokenIsPaused", async () => {
        const protectedClearingOperation = {
          clearingOperation: clearingOperation,
          from: signer_A.address,
          deadline: expirationTimestamp,
          nonce: 1,
        };

        const signature = "0x1234"; // Dummy signature

        await expect(
          asset.protectedClearingRedeemByPartition(protectedClearingOperation, _AMOUNT, signature),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN calling protectedClearingCreateHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        const protectedClearingOperation = {
          clearingOperation: clearingOperation,
          from: signer_A.address,
          deadline: expirationTimestamp,
          nonce: 1,
        };

        const signature = "0x1234"; // Dummy signature

        await expect(
          asset.protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, signature),
        ).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });
    });

    describe("onlyUnrecoveredAddress modifier for protectedClearingCreateHoldByPartition", () => {
      it("GIVEN a recovered from address WHEN calling protectedClearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
        await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
        await asset.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

        const protectedClearingOperation = {
          clearingOperation: clearingOperation,
          from: signer_A.address,
          deadline: expirationTimestamp,
          nonce: 1,
        };

        const signature = "0x1234"; // Dummy signature

        await expect(
          asset.protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, signature),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
      });

      it("GIVEN a recovered hold.to address WHEN calling protectedClearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
        await asset.grantRole(ATS_ROLES.AGENT_ROLE, signer_A.address);
        // Recover the hold.to address (signer_C)
        await asset.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);

        const protectedClearingOperation = {
          clearingOperation: clearingOperation,
          from: signer_A.address,
          deadline: expirationTimestamp,
          nonce: 1,
        };

        const signature = "0x1234"; // Dummy signature

        await expect(
          asset.protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, signature),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
      });
    });
  });

  describe("Multi Partition", async () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureMultiPartition);
    });

    describe("Create clearing with wrong input arguments", async () => {
      it("GIVEN a Token WHEN createHoldByPartition for wrong partition THEN transaction fails with InvalidPartition", async () => {
        const clearingOperation_wrong_partition = {
          ...clearingOperation,
          partition: _WRONG_PARTITION,
        };

        const clearingOperationFromB_wrong_partition = {
          ...clearingOperationFrom,
          clearingOperation: clearingOperation_wrong_partition,
          from: signer_B.address,
        };

        // Transfers
        await expect(
          asset.clearingTransferByPartition(clearingOperation_wrong_partition, _AMOUNT, signer_B.address),
        ).to.be.revertedWithCustomError(asset, "InvalidPartition");
        await asset.connect(signer_B).authorizeOperator(signer_A.address);
        await expect(
          asset.operatorClearingTransferByPartition(clearingOperationFromB_wrong_partition, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(asset, "InvalidPartition");

        // Holds
        const hold_wrong = {
          ...hold,
          amount: _AMOUNT,
        };
        await expect(
          asset.clearingCreateHoldByPartition(clearingOperation_wrong_partition, hold_wrong),
        ).to.be.revertedWithCustomError(asset, "InvalidPartition");
        await expect(
          asset.operatorClearingCreateHoldByPartition(clearingOperationFromB_wrong_partition, hold_wrong),
        ).to.be.revertedWithCustomError(asset, "InvalidPartition");

        // Redeems
        await expect(
          asset.clearingRedeemByPartition(clearingOperation_wrong_partition, _AMOUNT),
        ).to.be.revertedWithCustomError(asset, "InvalidPartition");
        await expect(
          asset.operatorClearingRedeemByPartition(clearingOperationFromB_wrong_partition, _AMOUNT),
        ).to.be.revertedWithCustomError(asset, "InvalidPartition");
      });
    });

    describe("Manage clearing with wrong input arguments", async () => {
      it("GIVEN a clearing transfer WHEN approveClearingOperationByPartition with wrong input arguments THEN transaction fails with WrongClearingId", async () => {
        await asset.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);

        // Wrong Partition Id
        const clearingIdentifier_WrongPartition = {
          ...clearingIdentifier,
          partition: _WRONG_PARTITION,
        };

        await expect(
          asset.approveClearingOperationByPartition(clearingIdentifier_WrongPartition),
        ).to.be.revertedWithCustomError(asset, "WrongClearingId");

        // Wrong Token Holder
        const clearingIdentifier_WrongTokenHolder = {
          ...clearingIdentifier,
          tokenHolder: signer_B.address,
        };

        await expect(
          asset.approveClearingOperationByPartition(clearingIdentifier_WrongTokenHolder),
        ).to.be.revertedWithCustomError(asset, "WrongClearingId");

        // Wrong Clearing Id
        const clearingIdentifier_ClearingId = {
          ...clearingIdentifier,
          clearingId: 100,
        };

        await expect(
          asset.approveClearingOperationByPartition(clearingIdentifier_ClearingId),
        ).to.be.revertedWithCustomError(asset, "WrongClearingId");

        // Wrong Clearing Operation Type

        const clearingIdentifier_ClearingOperationType = {
          ...clearingIdentifier,
          clearingOperationType: ClearingOperationType.Redeem,
        };

        await expect(
          asset.approveClearingOperationByPartition(clearingIdentifier_ClearingOperationType),
        ).to.be.revertedWithCustomError(asset, "WrongClearingId");
      });
    });
    it("GIVEN a clearing transfer WHEN cancelClearingOperationByPartition with wrong input arguments THEN transaction fails with WrongClearingId", async () => {
      await asset.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);

      // Wrong Partition Id
      const clearingIdentifier_WrongPartition = {
        ...clearingIdentifier,
        partition: _WRONG_PARTITION,
      };

      await expect(
        asset.cancelClearingOperationByPartition(clearingIdentifier_WrongPartition),
      ).to.be.revertedWithCustomError(asset, "WrongClearingId");

      // Wrong Token Holder
      const clearingIdentifier_WrongTokenHolder = {
        ...clearingIdentifier,
        tokenHolder: signer_B.address,
      };

      await expect(
        asset.cancelClearingOperationByPartition(clearingIdentifier_WrongTokenHolder),
      ).to.be.revertedWithCustomError(asset, "WrongClearingId");

      // Wrong Clearing Id
      const clearingIdentifier_ClearingId = {
        ...clearingIdentifier,
        clearingId: 100,
      };

      await expect(
        asset.cancelClearingOperationByPartition(clearingIdentifier_ClearingId),
      ).to.be.revertedWithCustomError(asset, "WrongClearingId");

      // Wrong Clearing Operation Type

      const clearingIdentifier_ClearingOperationType = {
        ...clearingIdentifier,
        clearingOperationType: ClearingOperationType.HoldCreation,
      };

      await expect(
        asset.cancelClearingOperationByPartition(clearingIdentifier_ClearingOperationType),
      ).to.be.revertedWithCustomError(asset, "WrongClearingId");
    });

    it("GIVEN a clearing transfer WHEN reclaimClearingOperationByPartition with wrong input arguments THEN transaction fails with WrongClearingId", async () => {
      await asset.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold);

      // Wrong Partition Id
      const clearingIdentifier_WrongPartition = {
        ...clearingIdentifier,
        partition: _WRONG_PARTITION,
      };

      await expect(
        asset.reclaimClearingOperationByPartition(clearingIdentifier_WrongPartition),
      ).to.be.revertedWithCustomError(asset, "WrongClearingId");

      // Wrong Token Holder
      const clearingIdentifier_WrongTokenHolder = {
        ...clearingIdentifier,
        tokenHolder: signer_B.address,
      };

      await expect(
        asset.reclaimClearingOperationByPartition(clearingIdentifier_WrongTokenHolder),
      ).to.be.revertedWithCustomError(asset, "WrongClearingId");

      // Wrong Clearing Id
      const clearingIdentifier_ClearingId = {
        ...clearingIdentifier,
        clearingId: 100,
      };

      await expect(
        asset.reclaimClearingOperationByPartition(clearingIdentifier_ClearingId),
      ).to.be.revertedWithCustomError(asset, "WrongClearingId");

      // Wrong Clearing Operation Type

      const clearingIdentifier_ClearingOperationType = {
        ...clearingIdentifier,
        clearingOperationType: ClearingOperationType.Transfer,
      };

      await expect(
        asset.reclaimClearingOperationByPartition(clearingIdentifier_ClearingOperationType),
      ).to.be.revertedWithCustomError(asset, "WrongClearingId");
    });

    describe("Protected Clearing Operations", () => {
      let protectedClearingTransfer: any;
      let protectedClearingRedeem: any;
      let protectedClearingHoldCreation: any;
      let domain: any;

      const clearingTransferType = {
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
          { name: "_protectedClearingOperation", type: "ProtectedClearingOperation" },
          { name: "_to", type: "address" },
          { name: "_amount", type: "uint256" },
        ],
      };

      const clearingRedeemType = {
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
          { name: "_protectedClearingOperation", type: "ProtectedClearingOperation" },
          { name: "_value", type: "uint256" },
        ],
      };

      const clearingHoldType = {
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
        Hold: [
          { name: "amount", type: "uint256" },
          { name: "expirationTimestamp", type: "uint256" },
          { name: "escrow", type: "address" },
          { name: "to", type: "address" },
          { name: "data", type: "bytes" },
        ],
        protectedClearingCreateHoldByPartition: [
          { name: "_protectedClearingOperation", type: "ProtectedClearingOperation" },
          { name: "_hold", type: "Hold" },
        ],
      };

      async function protectedClearingFixture() {
        const base = await deployEquityTokenFixture({
          equityDataParams: {
            securityData: {
              arePartitionsProtected: true,
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
        await executeRbac(asset, set_initRbacs());
        await setFacets(asset);
      }

      beforeEach(async () => {
        await loadFixture(protectedClearingFixture);

        const chainId = await network.provider.send("eth_chainId");
        domain = {
          name: "ProtectedPartitions",
          version: "1.0.0",
          chainId: chainId,
          verifyingContract: diamond.target.toString(),
        };

        protectedClearingTransfer = {
          clearingOperation: {
            partition: _DEFAULT_PARTITION,
            expirationTimestamp: expirationTimestamp,
            data: _DATA,
          },
          from: signer_A.address,
          deadline: MAX_UINT256,
          nonce: 1,
        };

        protectedClearingRedeem = {
          clearingOperation: {
            partition: _DEFAULT_PARTITION,
            expirationTimestamp: expirationTimestamp,
            data: _DATA,
          },
          from: signer_A.address,
          deadline: MAX_UINT256,
          nonce: 1,
        };

        protectedClearingHoldCreation = {
          clearingOperation: {
            partition: _DEFAULT_PARTITION,
            expirationTimestamp: expirationTimestamp,
            data: _DATA,
          },
          from: signer_A.address,
          deadline: MAX_UINT256,
          nonce: 1,
        };
      });

      it("GIVEN a valid signature WHEN calling protectedClearingTransferByPartition THEN transaction succeeds", async () => {
        // Setup: Issue tokens to signer_A
        await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Enable protected partitions - grant role first
        await asset.grantRole(ATS_ROLES.PROTECTED_PARTITIONS_ROLE, signer_A.address);
        await asset.protectPartitions();

        // Grant role for protected partition
        const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
          ["bytes32", "bytes32"],
          [ATS_ROLES.PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
        );
        const packedDataWithoutPrefix = packedData.slice(2);
        const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
        await asset.grantRole(protectedPartitionRole, signer_A.address);

        // Get the nonce for signer_A
        const nonce = Number(await asset.nonces(signer_A.address)) + 1;

        const protectedClearingOperation = {
          clearingOperation: {
            partition: _DEFAULT_PARTITION,
            expirationTimestamp: expirationTimestamp,
            data: _DATA,
          },
          from: signer_A.address,
          deadline: expirationTimestamp,
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

        // Sign the message
        const signature = await signer_A.signTypedData(domain, types, message);

        // Execute the protected clearing transfer
        await asset
          .connect(signer_A)
          .protectedClearingTransferByPartition(protectedClearingOperation, _AMOUNT, signer_C.address, signature);

        // Check cleared amount
        const clearedAmount = await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address);
        expect(clearedAmount).to.equal(_AMOUNT);
      });

      it("GIVEN a valid signature WHEN calling protectedClearingRedeemByPartition THEN transaction succeeds", async () => {
        // Setup: Issue tokens to signer_A
        await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Enable protected partitions - grant role first
        await asset.grantRole(ATS_ROLES.PROTECTED_PARTITIONS_ROLE, signer_A.address);
        await asset.protectPartitions();

        // Grant role for protected partition
        const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
          ["bytes32", "bytes32"],
          [ATS_ROLES.PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
        );
        const packedDataWithoutPrefix = packedData.slice(2);
        const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
        await asset.grantRole(protectedPartitionRole, signer_A.address);

        // Get the nonce for signer_A
        const nonce = Number(await asset.nonces(signer_A.address)) + 1;

        const protectedClearingOperation = {
          clearingOperation: {
            partition: _DEFAULT_PARTITION,
            expirationTimestamp: expirationTimestamp,
            data: _DATA,
          },
          from: signer_A.address,
          deadline: expirationTimestamp,
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

        // Sign the message
        const signature = await signer_A.signTypedData(domain, types, message);

        // Execute the protected clearing redeem
        await asset
          .connect(signer_A)
          .protectedClearingRedeemByPartition(protectedClearingOperation, _AMOUNT, signature);

        // Check cleared amount
        const clearedAmount = await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address);
        expect(clearedAmount).to.equal(_AMOUNT);
      });

      it("GIVEN a valid signature WHEN calling protectedClearingCreateHoldByPartition THEN transaction succeeds", async () => {
        // Setup: Issue tokens to signer_A
        await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Enable protected partitions - grant role first
        await asset.grantRole(ATS_ROLES.PROTECTED_PARTITIONS_ROLE, signer_A.address);
        await asset.protectPartitions();

        // Grant role for protected partition
        const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
          ["bytes32", "bytes32"],
          [ATS_ROLES.PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
        );
        const packedDataWithoutPrefix = packedData.slice(2);
        const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
        await asset.grantRole(protectedPartitionRole, signer_A.address);

        // Get the nonce for signer_A
        const nonce = Number(await asset.nonces(signer_A.address)) + 1;

        const protectedClearingOperation = {
          clearingOperation: {
            partition: _DEFAULT_PARTITION,
            expirationTimestamp: expirationTimestamp,
            data: _DATA,
          },
          from: signer_A.address,
          deadline: expirationTimestamp,
          nonce: nonce,
        };

        const holdForClearing = {
          amount: BigInt(_AMOUNT),
          expirationTimestamp: BigInt(expirationTimestamp),
          escrow: signer_B.address,
          to: signer_C.address,
          data: _DATA,
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
          Hold: [
            { name: "amount", type: "uint256" },
            { name: "expirationTimestamp", type: "uint256" },
            { name: "escrow", type: "address" },
            { name: "to", type: "address" },
            { name: "data", type: "bytes" },
          ],
          protectedClearingCreateHoldByPartition: [
            {
              name: "_protectedClearingOperation",
              type: "ProtectedClearingOperation",
            },
            { name: "_hold", type: "Hold" },
          ],
        };

        const message = {
          _protectedClearingOperation: protectedClearingOperation,
          _hold: holdForClearing,
        };

        // Sign the message
        const signature = await signer_A.signTypedData(domain, types, message);

        // Execute the protected clearing create hold
        await asset
          .connect(signer_A)
          .protectedClearingCreateHoldByPartition(protectedClearingOperation, holdForClearing, signature);

        // Check cleared amount
        const clearedAmount = await asset.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address);
        expect(clearedAmount).to.equal(_AMOUNT);
      });

      describe("Modifier Tests", () => {
        describe("protectedClearingTransferByPartition", () => {
          it("SHOULD revert WHEN from address is zero (validateAddress modifier)", async () => {
            const protectedClearingOperationInvalid = {
              clearingOperation: {
                partition: _DEFAULT_PARTITION,
                expirationTimestamp: expirationTimestamp,
                data: _DATA,
              },
              from: ethers.ZeroAddress, // Invalid
              deadline: expirationTimestamp,
              nonce: 1,
            };

            const chainId = await network.provider.send("eth_chainId");
            const domain = {
              name: "ProtectedPartitions",
              version: "1.0.0",
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
                { name: "_protectedClearingOperation", type: "ProtectedClearingOperation" },
                { name: "_amount", type: "uint256" },
                { name: "_to", type: "address" },
              ],
            };

            const message = {
              _protectedClearingOperation: protectedClearingOperationInvalid,
              _amount: _AMOUNT,
              _to: signer_C.address,
            };

            const sig = await signer_A.signTypedData(domain, types, message);

            await expect(
              asset
                .connect(signer_A)
                .protectedClearingTransferByPartition(
                  protectedClearingOperationInvalid,
                  _AMOUNT,
                  signer_C.address,
                  sig,
                ),
            ).to.be.reverted;
          });

          it("SHOULD revert WHEN to address is zero (validateAddress modifier)", async () => {
            await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
            await asset.issueByPartition({
              partition: _DEFAULT_PARTITION,
              tokenHolder: signer_A.address,
              value: _AMOUNT,
              data: _DATA,
            });

            await asset.grantRole(ATS_ROLES.PROTECTED_PARTITIONS_ROLE, signer_A.address);
            await asset.protectPartitions();

            const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
              ["bytes32", "bytes32"],
              [ATS_ROLES.PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
            );
            const packedDataWithoutPrefix = packedData.slice(2);
            const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
            await asset.grantRole(protectedPartitionRole, signer_A.address);

            const nonce = Number(await asset.nonces(signer_A.address)) + 1;

            const protectedClearingOp = {
              clearingOperation: {
                partition: _DEFAULT_PARTITION,
                expirationTimestamp: expirationTimestamp,
                data: _DATA,
              },
              from: signer_A.address,
              deadline: expirationTimestamp,
              nonce: nonce,
            };

            const chainId = await network.provider.send("eth_chainId");
            const domain = {
              name: "ProtectedPartitions",
              version: "1.0.0",
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
                { name: "_protectedClearingOperation", type: "ProtectedClearingOperation" },
                { name: "_amount", type: "uint256" },
                { name: "_to", type: "address" },
              ],
            };

            const message = {
              _protectedClearingOperation: protectedClearingOp,
              _amount: _AMOUNT,
              _to: ethers.ZeroAddress, // Invalid
            };

            const sig = await signer_A.signTypedData(domain, types, message);

            await expect(
              asset
                .connect(signer_A)
                .protectedClearingTransferByPartition(protectedClearingOp, _AMOUNT, ethers.ZeroAddress, sig),
            ).to.be.reverted;
          });

          it("SHOULD revert WHEN expiration timestamp is invalid (onlyWithValidExpirationTimestamp modifier)", async () => {
            await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
            await asset.issueByPartition({
              partition: _DEFAULT_PARTITION,
              tokenHolder: signer_A.address,
              value: _AMOUNT,
              data: _DATA,
            });

            await asset.grantRole(ATS_ROLES.PROTECTED_PARTITIONS_ROLE, signer_A.address);
            await asset.protectPartitions();

            const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
              ["bytes32", "bytes32"],
              [ATS_ROLES.PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
            );
            const packedDataWithoutPrefix = packedData.slice(2);
            const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
            await asset.grantRole(protectedPartitionRole, signer_A.address);

            const nonce = Number(await asset.nonces(signer_A.address)) + 1;

            const protectedClearingOp = {
              clearingOperation: {
                partition: _DEFAULT_PARTITION,
                expirationTimestamp: 1, // Expired timestamp
                data: _DATA,
              },
              from: signer_A.address,
              deadline: expirationTimestamp,
              nonce: nonce,
            };

            const chainId = await network.provider.send("eth_chainId");
            const domain = {
              name: "ProtectedPartitions",
              version: "1.0.0",
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
                { name: "_protectedClearingOperation", type: "ProtectedClearingOperation" },
                { name: "_amount", type: "uint256" },
                { name: "_to", type: "address" },
              ],
            };

            const message = {
              _protectedClearingOperation: protectedClearingOp,
              _amount: _AMOUNT,
              _to: signer_C.address,
            };

            const sig = await signer_A.signTypedData(domain, types, message);

            await expect(
              asset
                .connect(signer_A)
                .protectedClearingTransferByPartition(protectedClearingOp, _AMOUNT, signer_C.address, sig),
            ).to.be.reverted;
          });

          it("SHOULD revert WHEN missing required role (onlyRole modifier)", async () => {
            await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
            await asset.issueByPartition({
              partition: _DEFAULT_PARTITION,
              tokenHolder: signer_A.address,
              value: _AMOUNT,
              data: _DATA,
            });

            await asset.grantRole(ATS_ROLES.PROTECTED_PARTITIONS_ROLE, signer_A.address);
            await asset.protectPartitions();

            // Don't grant protectedPartitionRole

            const nonce = Number(await asset.nonces(signer_A.address)) + 1;

            const protectedClearingOp = {
              clearingOperation: {
                partition: _DEFAULT_PARTITION,
                expirationTimestamp: expirationTimestamp,
                data: _DATA,
              },
              from: signer_A.address,
              deadline: expirationTimestamp,
              nonce: nonce,
            };

            const chainId = await network.provider.send("eth_chainId");
            const domain = {
              name: "ProtectedPartitions",
              version: "1.0.0",
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
                { name: "_protectedClearingOperation", type: "ProtectedClearingOperation" },
                { name: "_amount", type: "uint256" },
                { name: "_to", type: "address" },
              ],
            };

            const message = {
              _protectedClearingOperation: protectedClearingOp,
              _amount: _AMOUNT,
              _to: signer_C.address,
            };

            const sig = await signer_A.signTypedData(domain, types, message);

            await expect(
              asset
                .connect(signer_A)
                .protectedClearingTransferByPartition(protectedClearingOp, _AMOUNT, signer_C.address, sig),
            ).to.be.reverted;
          });

          it("SHOULD revert WHEN clearing not activated (onlyClearingActivated modifier)", async () => {
            await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
            await asset.issueByPartition({
              partition: _DEFAULT_PARTITION,
              tokenHolder: signer_A.address,
              value: _AMOUNT,
              data: _DATA,
            });

            await asset.grantRole(ATS_ROLES.PROTECTED_PARTITIONS_ROLE, signer_A.address);
            await asset.protectPartitions();

            const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
              ["bytes32", "bytes32"],
              [ATS_ROLES.PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
            );
            const packedDataWithoutPrefix = packedData.slice(2);
            const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
            await asset.grantRole(protectedPartitionRole, signer_A.address);

            // Activate then deactivate clearing
            await asset.activateClearing();
            await asset.deactivateClearing();

            const nonce = Number(await asset.nonces(signer_A.address)) + 1;

            const protectedClearingOp = {
              clearingOperation: {
                partition: _DEFAULT_PARTITION,
                expirationTimestamp: expirationTimestamp,
                data: _DATA,
              },
              from: signer_A.address,
              deadline: expirationTimestamp,
              nonce: nonce,
            };

            const chainId = await network.provider.send("eth_chainId");
            const domain = {
              name: "ProtectedPartitions",
              version: "1.0.0",
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
                { name: "_protectedClearingOperation", type: "ProtectedClearingOperation" },
                { name: "_amount", type: "uint256" },
                { name: "_to", type: "address" },
              ],
            };

            const message = {
              _protectedClearingOperation: protectedClearingOp,
              _amount: _AMOUNT,
              _to: signer_C.address,
            };

            const sig = await signer_A.signTypedData(domain, types, message);

            await expect(
              asset
                .connect(signer_A)
                .protectedClearingTransferByPartition(protectedClearingOp, _AMOUNT, signer_C.address, sig),
            ).to.be.reverted;
          });
        });

        describe("protectedClearingRedeemByPartition", () => {
          it("SHOULD revert WHEN from address is zero (validateAddress modifier)", async () => {
            const protectedClearingOperationInvalid = {
              clearingOperation: {
                partition: _DEFAULT_PARTITION,
                expirationTimestamp: expirationTimestamp,
                data: _DATA,
              },
              from: ethers.ZeroAddress, // Invalid
              deadline: expirationTimestamp,
              nonce: 1,
            };

            const chainId = await network.provider.send("eth_chainId");
            const domain = {
              name: "ProtectedPartitions",
              version: "1.0.0",
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
                { name: "_protectedClearingOperation", type: "ProtectedClearingOperation" },
                { name: "_amount", type: "uint256" },
              ],
            };

            const message = {
              _protectedClearingOperation: protectedClearingOperationInvalid,
              _amount: _AMOUNT,
            };

            const sig = await signer_A.signTypedData(domain, types, message);

            await expect(
              asset
                .connect(signer_A)
                .protectedClearingRedeemByPartition(protectedClearingOperationInvalid, _AMOUNT, sig),
            ).to.be.reverted;
          });

          it("SHOULD revert WHEN clearing not activated (onlyClearingActivated modifier)", async () => {
            await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
            await asset.issueByPartition({
              partition: _DEFAULT_PARTITION,
              tokenHolder: signer_A.address,
              value: _AMOUNT,
              data: _DATA,
            });

            await asset.grantRole(ATS_ROLES.PROTECTED_PARTITIONS_ROLE, signer_A.address);
            await asset.protectPartitions();

            const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
              ["bytes32", "bytes32"],
              [ATS_ROLES.PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
            );
            const packedDataWithoutPrefix = packedData.slice(2);
            const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
            await asset.grantRole(protectedPartitionRole, signer_A.address);

            // Activate then deactivate clearing to test the modifier
            await asset.activateClearing();
            await asset.deactivateClearing();

            const nonce = Number(await asset.nonces(signer_A.address)) + 1;

            const protectedClearingOp = {
              clearingOperation: {
                partition: _DEFAULT_PARTITION,
                expirationTimestamp: expirationTimestamp,
                data: _DATA,
              },
              from: signer_A.address,
              deadline: expirationTimestamp,
              nonce: nonce,
            };

            const chainId = await network.provider.send("eth_chainId");
            const domain = {
              name: "ProtectedPartitions",
              version: "1.0.0",
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
                { name: "_protectedClearingOperation", type: "ProtectedClearingOperation" },
                { name: "_amount", type: "uint256" },
              ],
            };

            const message = {
              _protectedClearingOperation: protectedClearingOp,
              _amount: _AMOUNT,
            };

            const sig = await signer_A.signTypedData(domain, types, message);

            await expect(asset.connect(signer_A).protectedClearingRedeemByPartition(protectedClearingOp, _AMOUNT, sig))
              .to.be.reverted;
          });
        });

        describe("protectedClearingCreateHoldByPartition", () => {
          it("SHOULD revert WHEN from address is zero (validateAddress modifier)", async () => {
            const protectedClearingOperationInvalid = {
              clearingOperation: {
                partition: _DEFAULT_PARTITION,
                expirationTimestamp: expirationTimestamp,
                data: _DATA,
              },
              from: ethers.ZeroAddress, // Invalid
              deadline: expirationTimestamp,
              nonce: 1,
            };

            const holdForClearing = {
              amount: _AMOUNT,
              expirationTimestamp: expirationTimestamp,
              escrow: ethers.ZeroAddress,
              to: signer_C.address,
              data: _DATA,
            };

            const chainId = await network.provider.send("eth_chainId");
            const domain = {
              name: "ProtectedPartitions",
              version: "1.0.0",
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
              Hold: [
                { name: "amount", type: "uint256" },
                { name: "expirationTimestamp", type: "uint256" },
                { name: "escrow", type: "address" },
                { name: "to", type: "address" },
                { name: "data", type: "bytes" },
              ],
              protectedClearingCreateHoldByPartition: [
                { name: "_protectedClearingOperation", type: "ProtectedClearingOperation" },
                { name: "_hold", type: "Hold" },
              ],
            };

            const message = {
              _protectedClearingOperation: protectedClearingOperationInvalid,
              _hold: holdForClearing,
            };

            const sig = await signer_A.signTypedData(domain, types, message);

            await expect(
              asset
                .connect(signer_A)
                .protectedClearingCreateHoldByPartition(protectedClearingOperationInvalid, holdForClearing, sig),
            ).to.be.reverted;
          });

          it("SHOULD revert WHEN clearing not activated (onlyClearingActivated modifier)", async () => {
            await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
            await asset.issueByPartition({
              partition: _DEFAULT_PARTITION,
              tokenHolder: signer_A.address,
              value: _AMOUNT,
              data: _DATA,
            });

            await asset.grantRole(ATS_ROLES.PROTECTED_PARTITIONS_ROLE, signer_A.address);
            await asset.protectPartitions();

            const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
              ["bytes32", "bytes32"],
              [ATS_ROLES.PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
            );
            const packedDataWithoutPrefix = packedData.slice(2);
            const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
            await asset.grantRole(protectedPartitionRole, signer_A.address);

            // Activate then deactivate clearing to test the modifier
            await asset.activateClearing();
            await asset.deactivateClearing();

            const nonce = Number(await asset.nonces(signer_A.address)) + 1;

            const protectedClearingOp = {
              clearingOperation: {
                partition: _DEFAULT_PARTITION,
                expirationTimestamp: expirationTimestamp,
                data: _DATA,
              },
              from: signer_A.address,
              deadline: expirationTimestamp,
              nonce: nonce,
            };

            const holdForClearing = {
              amount: _AMOUNT,
              expirationTimestamp: expirationTimestamp,
              escrow: ethers.ZeroAddress,
              to: signer_C.address,
              data: _DATA,
            };

            const chainId = await network.provider.send("eth_chainId");
            const domain = {
              name: "ProtectedPartitions",
              version: "1.0.0",
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
              Hold: [
                { name: "amount", type: "uint256" },
                { name: "expirationTimestamp", type: "uint256" },
                { name: "escrow", type: "address" },
                { name: "to", type: "address" },
                { name: "data", type: "bytes" },
              ],
              protectedClearingCreateHoldByPartition: [
                { name: "_protectedClearingOperation", type: "ProtectedClearingOperation" },
                { name: "_hold", type: "Hold" },
              ],
            };

            const message = {
              _protectedClearingOperation: protectedClearingOp,
              _hold: holdForClearing,
            };

            const sig = await signer_A.signTypedData(domain, types, message);

            await expect(
              asset.connect(signer_A).protectedClearingCreateHoldByPartition(protectedClearingOp, holdForClearing, sig),
            ).to.be.reverted;
          });
        });
      });

      // Recovery tests following hold.test.ts pattern
      it("GIVEN a from user recovering WHEN protectedClearingTransferByPartition THEN transaction fails with WalletRecovered", async () => {
        // Setup: Issue tokens to signer_A
        await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Recover signer_A's address to signer_B
        await asset.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

        const message = {
          _protectedClearingOperation: protectedClearingTransfer,
          _to: signer_C.address,
          _amount: _AMOUNT,
        };

        const signature = await signer_A.signTypedData(domain, clearingTransferType, message);

        await expect(
          asset
            .connect(signer_B)
            .protectedClearingTransferByPartition(protectedClearingTransfer, _AMOUNT, signer_C.address, signature),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
      });

      it("GIVEN a to user recovering WHEN protectedClearingTransferByPartition THEN transaction fails with WalletRecovered", async () => {
        // Setup: Issue tokens to signer_A
        await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Recover signer_C's address to signer_D
        await asset.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);

        const message = {
          _protectedClearingOperation: protectedClearingTransfer,
          _to: signer_C.address,
          _amount: _AMOUNT,
        };

        const signature = await signer_A.signTypedData(domain, clearingTransferType, message);

        await expect(
          asset
            .connect(signer_B)
            .protectedClearingTransferByPartition(protectedClearingTransfer, _AMOUNT, signer_C.address, signature),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
      });

      it("GIVEN missing partition role WHEN protectedClearingRedeemByPartition THEN transaction fails with AccountHasNoRole", async () => {
        // Setup: Issue tokens to signer_A
        await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Do NOT grant partition-specific role to signer_B - this will test the onlyRole modifier

        // Try to call - should fail with AccountHasNoRole due to missing partition-specific role
        await expect(
          asset.connect(signer_B).protectedClearingRedeemByPartition(protectedClearingRedeem, _AMOUNT, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });

      it("GIVEN a from user recovering WHEN protectedClearingRedeemByPartition THEN transaction fails with WalletRecovered", async () => {
        // Setup: Issue tokens to signer_A
        await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Grant partition-specific role to signer_B
        const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
          ["bytes32", "bytes32"],
          [ATS_ROLES.PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
        );
        const packedDataWithoutPrefix = packedData.slice(2);
        const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
        await asset.grantRole(protectedPartitionRole, signer_B.address);

        // Recover signer_A's address to signer_B
        await asset.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

        // Try to call - should hit onlyUnrecoveredAddress before signature validation
        await expect(
          asset.connect(signer_B).protectedClearingRedeemByPartition(protectedClearingRedeem, _AMOUNT, "0x1234"),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
      });

      it("GIVEN a from user recovering WHEN protectedClearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
        // Setup: Issue tokens to signer_A
        await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Recover signer_A's address to signer_B
        await asset.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

        const holdForClearing = {
          amount: _AMOUNT,
          expirationTimestamp: expirationTimestamp,
          escrow: signer_D.address,
          to: signer_C.address,
          data: _DATA,
        };

        const message = {
          _protectedClearingOperation: protectedClearingHoldCreation,
          _hold: holdForClearing,
        };

        const signature = await signer_A.signTypedData(domain, clearingHoldType, message);

        await expect(
          asset
            .connect(signer_B)
            .protectedClearingCreateHoldByPartition(protectedClearingHoldCreation, holdForClearing, signature),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
      });

      it("GIVEN a to user recovering WHEN protectedClearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
        // Setup: Issue tokens to signer_A
        await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Recover signer_C's address (the "to" address in hold) to signer_D
        await asset.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);

        const holdForClearing = {
          amount: _AMOUNT,
          expirationTimestamp: expirationTimestamp,
          escrow: signer_D.address,
          to: signer_C.address,
          data: _DATA,
        };

        const message = {
          _protectedClearingOperation: protectedClearingHoldCreation,
          _hold: holdForClearing,
        };

        const signature = await signer_A.signTypedData(domain, clearingHoldType, message);

        await expect(
          asset
            .connect(signer_B)
            .protectedClearingCreateHoldByPartition(protectedClearingHoldCreation, holdForClearing, signature),
        ).to.be.revertedWithCustomError(asset, "WalletRecovered");
      });

      // Additional tests for missing branch coverage
      it("SHOULD revert WHEN expiration timestamp is invalid for protectedClearingRedeemByPartition", async () => {
        await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        const nonce = Number(await asset.nonces(signer_A.address)) + 1;

        const protectedClearingOpExpired = {
          clearingOperation: {
            partition: _DEFAULT_PARTITION,
            expirationTimestamp: 1, // Expired timestamp
            data: _DATA,
          },
          from: signer_A.address,
          deadline: MAX_UINT256,
          nonce: nonce,
        };

        const message = {
          _protectedClearingOperation: protectedClearingOpExpired,
          _value: _AMOUNT,
        };

        const signature = await signer_A.signTypedData(domain, clearingRedeemType, message);

        await expect(
          asset.connect(signer_B).protectedClearingRedeemByPartition(protectedClearingOpExpired, _AMOUNT, signature),
        ).to.be.reverted;
      });

      it("SHOULD revert WHEN expiration timestamp is invalid for protectedClearingCreateHoldByPartition", async () => {
        await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        const nonce = Number(await asset.nonces(signer_A.address)) + 1;

        const protectedClearingOpExpired = {
          clearingOperation: {
            partition: _DEFAULT_PARTITION,
            expirationTimestamp: 1, // Expired timestamp
            data: _DATA,
          },
          from: signer_A.address,
          deadline: MAX_UINT256,
          nonce: nonce,
        };

        const holdForClearing = {
          amount: _AMOUNT,
          expirationTimestamp: expirationTimestamp,
          escrow: signer_D.address,
          to: signer_C.address,
          data: _DATA,
        };

        const message = {
          _protectedClearingOperation: protectedClearingOpExpired,
          _hold: holdForClearing,
        };

        const signature = await signer_A.signTypedData(domain, clearingHoldType, message);

        await expect(
          asset
            .connect(signer_B)
            .protectedClearingCreateHoldByPartition(protectedClearingOpExpired, holdForClearing, signature),
        ).to.be.reverted;
      });

      it("SHOULD revert WHEN missing required role for protectedClearingCreateHoldByPartition", async () => {
        await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
        await asset.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Don't grant the protected partition role for signer_A
        const nonce = Number(await asset.nonces(signer_A.address)) + 1;

        const protectedClearingOp = {
          clearingOperation: {
            partition: _DEFAULT_PARTITION,
            expirationTimestamp: expirationTimestamp,
            data: _DATA,
          },
          from: signer_A.address,
          deadline: MAX_UINT256,
          nonce: nonce,
        };

        const holdForClearing = {
          amount: _AMOUNT,
          expirationTimestamp: expirationTimestamp,
          escrow: signer_D.address,
          to: signer_C.address,
          data: _DATA,
        };

        const message = {
          _protectedClearingOperation: protectedClearingOp,
          _hold: holdForClearing,
        };

        const signature = await signer_A.signTypedData(domain, clearingHoldType, message);

        await expect(
          asset
            .connect(signer_B)
            .protectedClearingCreateHoldByPartition(protectedClearingOp, holdForClearing, signature),
        ).to.be.reverted;
      });
    });
  });
});
