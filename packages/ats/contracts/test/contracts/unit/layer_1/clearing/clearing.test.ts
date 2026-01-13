import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import {
  type ResolverProxy,
  type ClearingActionsFacet,
  ClearingActionsFacet__factory,
  type IHold,
  ControlListFacet,
  Pause,
  ERC20Facet,
  type IERC1410,
  TimeTravelFacet,
  Kyc,
  SsiManagement,
  AccessControl,
  AdjustBalances,
  Equity,
  Snapshots,
  ERC3643Management,
  ProtectedPartitions,
} from "@contract-types";
import { ADDRESS_ZERO, ZERO, EMPTY_HEX_BYTES, EMPTY_STRING, dateToUnixTimestamp, ATS_ROLES } from "@scripts";
import { deployEquityTokenFixture, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

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
  amount_: BigNumber;
  expirationTimestamp_: BigNumber;
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
  amount: BigNumber;
  expirationTimestamp: BigNumber;
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
  let signer_A: SignerWithAddress;
  let signer_B: SignerWithAddress;
  let signer_C: SignerWithAddress;
  let signer_D: SignerWithAddress;
  let signer_E: SignerWithAddress;

  let clearingFacet: Contract;
  let clearingActionsFacet: ClearingActionsFacet;
  let holdFacet: IHold;
  let accessControlFacet: AccessControl;
  let adjustBalancesFacet: AdjustBalances;
  let equityFacet: Equity;
  let pauseFacet: Pause;
  let erc1410Facet: IERC1410;
  let controlListFacet: ControlListFacet;
  let erc20Facet: ERC20Facet;
  let timeTravelFacet: TimeTravelFacet;
  let kycFacet: Kyc;
  let ssiManagementFacet: SsiManagement;
  let snapshotFacet: Snapshots;
  let erc3643ManagementFacet: ERC3643Management;
  let protectedPartitionsFacet: ProtectedPartitions;

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  let currentTimestamp = 0;
  let expirationTimestamp = 0;

  async function setFacets({ diamond }: { diamond: ResolverProxy }) {
    const clearingTransferFacet = await ethers.getContractAt("ClearingTransferFacet", diamond.address, signer_A);

    const clearingRedeemFacet = await ethers.getContractAt("ClearingRedeemFacet", diamond.address, signer_A);
    const clearingHoldCreationFacet = await ethers.getContractAt(
      "ClearingHoldCreationFacet",
      diamond.address,
      signer_A,
    );
    const clearingReadFacet = await ethers.getContractAt("ClearingReadFacet", diamond.address, signer_A);
    clearingActionsFacet = ClearingActionsFacet__factory.connect(diamond.address, signer_A);

    const fragmentMap = new Map<string, any>();
    [
      ...clearingTransferFacet.interface.fragments,
      ...clearingRedeemFacet.interface.fragments,
      ...clearingHoldCreationFacet.interface.fragments,
      ...clearingReadFacet.interface.fragments,
      ...clearingActionsFacet.interface.fragments,
    ].forEach((fragment) => {
      const key = fragment.format();
      if (!fragmentMap.has(key)) {
        fragmentMap.set(key, fragment);
      }
    });

    const uniqueFragments = Array.from(fragmentMap.values());

    clearingFacet = new Contract(diamond.address, uniqueFragments, signer_A);

    holdFacet = await ethers.getContractAt("IHold", diamond.address, signer_A);
    equityFacet = await ethers.getContractAt("Equity", diamond.address, signer_A);
    accessControlFacet = await ethers.getContractAt("AccessControlFacet", diamond.address, signer_A);
    adjustBalancesFacet = await ethers.getContractAt("AdjustBalances", diamond.address, signer_A);
    pauseFacet = await ethers.getContractAt("Pause", diamond.address, signer_D);
    erc1410Facet = await ethers.getContractAt("IERC1410", diamond.address, signer_B);
    controlListFacet = await ethers.getContractAt("ControlListFacet", diamond.address, signer_E);
    erc20Facet = await ethers.getContractAt("ERC20Facet", diamond.address, signer_A);
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.address, signer_A);
    kycFacet = await ethers.getContractAt("Kyc", diamond.address, signer_B);
    ssiManagementFacet = await ethers.getContractAt("SsiManagement", diamond.address, signer_A);
    snapshotFacet = await ethers.getContractAt("Snapshots", diamond.address);
    erc3643ManagementFacet = await ethers.getContractAt("ERC3643ManagementFacet", diamond.address, signer_A);
    protectedPartitionsFacet = await ethers.getContractAt("ProtectedPartitions", diamond.address, signer_A);

    await ssiManagementFacet.connect(signer_A).addIssuer(signer_A.address);
    await kycFacet.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await kycFacet.grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
    await kycFacet.grantKyc(signer_C.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

    await erc1410Facet.issueByPartition({
      partition: _DEFAULT_PARTITION,
      tokenHolder: signer_A.address,
      value: 3 * _AMOUNT,
      data: EMPTY_HEX_BYTES,
    });

    await erc1410Facet.issueByPartition({
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

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._CONTROLLER_ROLE,
        members: [signer_C.address],
      },
      {
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_D.address],
      },
      {
        role: ATS_ROLES._CONTROL_LIST_ROLE,
        members: [signer_E.address],
      },
      {
        role: ATS_ROLES._KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._CLEARING_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._CLEARING_VALIDATOR_ROLE,
        members: [signer_A.address],
      },
    ]);

    await setFacets({ diamond });
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

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._CONTROLLER_ROLE,
        members: [signer_C.address],
      },
      {
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_D.address],
      },
      {
        role: ATS_ROLES._CONTROL_LIST_ROLE,
        members: [signer_E.address],
      },
      {
        role: ATS_ROLES._KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._CLEARING_ROLE,
        members: [signer_A.address],
      },
      {
        role: ATS_ROLES._CLEARING_VALIDATOR_ROLE,
        members: [signer_A.address],
      },
    ]);

    await setFacets({ diamond });
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
    const balance = await erc1410Facet.balanceOf(signer_A.address);
    const clearedAmountByPartition = await clearingFacet.getClearedAmountForByPartition(_DEFAULT_PARTITION, account);
    const clearedAmount = await clearingFacet.getClearedAmountFor(account);

    const clearingCount_Transfer = await clearingFacet.getClearingCountForByPartition(
      _DEFAULT_PARTITION,
      account,
      ClearingOperationType.Transfer,
    );
    const clearingCount_Redeem = await clearingFacet.getClearingCountForByPartition(
      _DEFAULT_PARTITION,
      account,
      ClearingOperationType.Redeem,
    );
    const clearingCount_HoldCreation = await clearingFacet.getClearingCountForByPartition(
      _DEFAULT_PARTITION,
      account,
      ClearingOperationType.HoldCreation,
    );

    const clearingIds_Transfer = await clearingFacet.getClearingsIdForByPartition(
      _DEFAULT_PARTITION,
      account,
      ClearingOperationType.Transfer,
      0,
      100,
    );
    const clearingIds_Redeem = await clearingFacet.getClearingsIdForByPartition(
      _DEFAULT_PARTITION,
      account,
      ClearingOperationType.Redeem,
      0,
      100,
    );
    const clearingIds_HoldCreation = await clearingFacet.getClearingsIdForByPartition(
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
    let clearing;
    if (clearingType == ClearingOperationType.Transfer)
      clearing = await clearingFacet.getClearingTransferForByPartition(
        clearingIdentifier.partition,
        clearingIdentifier.tokenHolder,
        clearingIdentifier.clearingId,
      );
    else if (clearingType == ClearingOperationType.Redeem)
      clearing = await clearingFacet.getClearingRedeemForByPartition(
        clearingIdentifier.partition,
        clearingIdentifier.tokenHolder,
        clearingIdentifier.clearingId,
      );
    else if (clearingType == ClearingOperationType.HoldCreation)
      clearing = await clearingFacet.getClearingCreateHoldForByPartition(
        clearingIdentifier.partition,
        clearingIdentifier.tokenHolder,
        clearingIdentifier.clearingId,
      );
    else throw new Error("Unrecognize ClearingOperationType");

    const clearingThirdParty = await clearingFacet.getClearingThirdParty(
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
    currentTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
    expirationTimestamp = currentTimestamp + ONE_YEAR_IN_SECONDS;
    [signer_A, signer_B, signer_C, signer_D, signer_E] = await ethers.getSigners();
    hold = {
      amount: BigNumber.from(_AMOUNT),
      expirationTimestamp: BigNumber.from(expirationTimestamp),
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
    await timeTravelFacet.resetSystemTimestamp();
  });

  describe("Single Partition", async () => {
    beforeEach(async () => {
      await loadFixture(deploySecurityFixtureSinglePartition);
    });

    describe("snapshot", () => {
      it("GIVEN an account with snapshot role WHEN takeSnapshot and Clearing THEN transaction succeeds", async () => {
        const EXPIRATION_TIMESTAMP = dateToUnixTimestamp(`2030-01-01T00:00:35Z`);

        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._SNAPSHOT_ROLE, signer_A.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._LOCKER_ROLE, signer_A.address);

        // snapshot
        await snapshotFacet.connect(signer_A).takeSnapshot();

        // Operations
        clearingOperation.expirationTimestamp = EXPIRATION_TIMESTAMP;
        const hold = {
          amount: 1,
          expirationTimestamp: EXPIRATION_TIMESTAMP,
          escrow: signer_A.address,
          to: ADDRESS_ZERO,
          data: EMPTY_HEX_BYTES,
        };

        await clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, 1, signer_C.address);
        await clearingFacet.connect(signer_A).clearingRedeemByPartition(clearingOperation, 1);
        await clearingFacet.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold);

        // snapshot
        await snapshotFacet.connect(signer_A).takeSnapshot();

        // Operations
        clearingIdentifier.clearingId = 1;
        clearingIdentifier.clearingOperationType = ClearingOperationType.Transfer;
        await clearingFacet.connect(signer_A).approveClearingOperationByPartition(clearingIdentifier);

        clearingIdentifier.clearingOperationType = ClearingOperationType.Redeem;
        await clearingFacet.connect(signer_A).cancelClearingOperationByPartition(clearingIdentifier);

        await timeTravelFacet.changeSystemTimestamp(EXPIRATION_TIMESTAMP + 1);

        clearingIdentifier.clearingOperationType = ClearingOperationType.HoldCreation;
        await clearingFacet.connect(signer_A).reclaimClearingOperationByPartition(clearingIdentifier);

        // snapshot
        await snapshotFacet.connect(signer_A).takeSnapshot();

        // checks
        const snapshot_Balance_Of_A_1 = await snapshotFacet.balanceOfAtSnapshot(1, signer_A.address);
        const snapshot_Balance_Of_C_1 = await snapshotFacet.balanceOfAtSnapshot(1, signer_C.address);
        const snapshot_ClearingBalance_Of_A_1 = await snapshotFacet.clearedBalanceOfAtSnapshot(1, signer_A.address);
        const snapshot_Total_Supply_1 = await snapshotFacet.totalSupplyAtSnapshot(1);

        expect(snapshot_Balance_Of_A_1).to.equal(3 * _AMOUNT);
        expect(snapshot_Balance_Of_C_1).to.equal(0);
        expect(snapshot_ClearingBalance_Of_A_1).to.equal(0);
        expect(snapshot_Total_Supply_1).to.equal(6 * _AMOUNT);

        const snapshot_Balance_Of_A_2 = await snapshotFacet.balanceOfAtSnapshot(2, signer_A.address);
        const snapshot_Balance_Of_C_2 = await snapshotFacet.balanceOfAtSnapshot(2, signer_C.address);
        const snapshot_ClearingBalance_Of_A_2 = await snapshotFacet.clearedBalanceOfAtSnapshot(2, signer_A.address);
        const snapshot_Total_Supply_2 = await snapshotFacet.totalSupplyAtSnapshot(2);

        expect(snapshot_Balance_Of_A_2).to.equal(3 * _AMOUNT - 3);
        expect(snapshot_Balance_Of_C_2).to.equal(0);
        expect(snapshot_ClearingBalance_Of_A_2).to.equal(3);
        expect(snapshot_Total_Supply_2).to.equal(6 * _AMOUNT);

        const snapshot_Balance_Of_A_3 = await snapshotFacet.balanceOfAtSnapshot(3, signer_A.address);
        const snapshot_Balance_Of_C_3 = await snapshotFacet.balanceOfAtSnapshot(3, signer_C.address);
        const snapshot_ClearingBalance_Of_A_3 = await snapshotFacet.clearedBalanceOfAtSnapshot(3, signer_A.address);
        const snapshot_Total_Supply_3 = await snapshotFacet.totalSupplyAtSnapshot(3);

        expect(snapshot_Balance_Of_A_3).to.equal(3 * _AMOUNT - 1);
        expect(snapshot_Balance_Of_C_3).to.equal(1);
        expect(snapshot_ClearingBalance_Of_A_3).to.equal(0);
        expect(snapshot_Total_Supply_3).to.equal(6 * _AMOUNT);
      });
    });

    describe("corporate actions integration", () => {
      it("GIVEN pending clearing WHEN record date is reached THEN dividends use total balance including cleared amounts", async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);

        const currentTime = await timeTravelFacet.blockTimestamp();
        const recordDate = currentTime.add(100);
        const executionDate = recordDate.add(100);

        clearingOperation.expirationTimestamp = executionDate.add(ONE_YEAR_IN_SECONDS).toNumber();

        await clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, 10, signer_B.address);

        const dividendInput = {
          recordDate,
          executionDate,
          amount: 100,
          amountDecimals: 0,
        };

        const [, dividendId] = await equityFacet.connect(signer_A).callStatic.setDividends(dividendInput);
        await equityFacet.connect(signer_A).setDividends(dividendInput);

        await timeTravelFacet.changeSystemTimestamp(recordDate.add(1));

        const dividendFor = await equityFacet.getDividendsFor(dividendId, signer_A.address);

        const currentBalance = await erc1410Facet.balanceOf(signer_A.address);
        const clearedAmount = await clearingFacet.getClearedAmountFor(signer_A.address);

        expect(dividendFor.recordDateReached).to.equal(true);
        expect(dividendFor.tokenBalance).to.equal(currentBalance.add(clearedAmount));
      });
    });

    describe("Not in clearing mode", () => {
      it("GIVEN a token not in clearing mode WHEN create clearing THEN transaction fails with ClearingIsDisabled", async () => {
        await clearingActionsFacet.deactivateClearing();
        // Transfers
        await expect(
          clearingFacet.clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address),
        ).to.be.revertedWithCustomError(clearingFacet, "ClearingIsDisabled");
        await expect(
          clearingFacet.clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_B.address),
        ).to.be.revertedWithCustomError(clearingFacet, "ClearingIsDisabled");
        await expect(
          clearingFacet.operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_B.address),
        ).to.be.revertedWithCustomError(clearingFacet, "ClearingIsDisabled");

        // Holds
        await expect(
          clearingFacet.clearingCreateHoldByPartition(clearingOperation, hold),
        ).to.be.revertedWithCustomError(clearingFacet, "ClearingIsDisabled");
        await expect(
          clearingFacet.clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(clearingFacet, "ClearingIsDisabled");
        await expect(
          clearingFacet.operatorClearingCreateHoldByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(clearingFacet, "ClearingIsDisabled");

        // Redeems
        await expect(clearingFacet.clearingRedeemByPartition(clearingOperation, _AMOUNT)).to.be.revertedWithCustomError(
          clearingFacet,
          "ClearingIsDisabled",
        );
        await expect(
          clearingFacet.clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT),
        ).to.be.revertedWithCustomError(clearingFacet, "ClearingIsDisabled");
        await expect(
          clearingFacet.operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT),
        ).to.be.revertedWithCustomError(clearingFacet, "ClearingIsDisabled");
      });
      it("GIVEN a token not in clearing mode WHEN trigger clearing THEN transaction fails with ClearingIsDisabled", async () => {
        await clearingFacet.clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address);

        await clearingActionsFacet.deactivateClearing();
        // Approve
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifier),
        ).to.be.revertedWithCustomError(clearingActionsFacet, "ClearingIsDisabled");
        // Cancel
        await expect(
          clearingActionsFacet.cancelClearingOperationByPartition(clearingIdentifier),
        ).to.be.revertedWithCustomError(clearingActionsFacet, "ClearingIsDisabled");
        // Reclaim
        await expect(
          clearingActionsFacet.reclaimClearingOperationByPartition(clearingIdentifier),
        ).to.be.revertedWithCustomError(clearingFacet, "ClearingIsDisabled");
      });
    });

    describe("Paused", () => {
      beforeEach(async () => {
        // Pausing the token
        await pauseFacet.pause();
      });

      // Activate/Deactivate clearing
      it("GIVEN a paused Token WHEN switching clearing mode THEN transaction fails with TokenIsPaused", async () => {
        await expect(clearingActionsFacet.activateClearing()).to.be.revertedWithCustomError(
          pauseFacet,
          "TokenIsPaused",
        );
        await expect(clearingActionsFacet.deactivateClearing()).to.be.revertedWithCustomError(
          pauseFacet,
          "TokenIsPaused",
        );
      });

      // Transfers
      it("GIVEN a paused Token WHEN clearingTransferByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          clearingFacet.clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN clearingTransferFromByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          clearingFacet.clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN operatorClearingTransferByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          clearingFacet.operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
      });

      // Holds
      it("GIVEN a paused Token WHEN clearingCreateHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          clearingFacet.clearingCreateHoldByPartition(clearingOperation, hold),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN clearingCreateHoldFromByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          clearingFacet.clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN operatorClearingCreateHoldByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          clearingFacet.operatorClearingCreateHoldByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
      });

      //Redeems

      it("GIVEN a paused Token WHEN clearingRedeemByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(clearingFacet.clearingRedeemByPartition(clearingOperation, _AMOUNT)).to.be.revertedWithCustomError(
          pauseFacet,
          "TokenIsPaused",
        );
      });

      it("GIVEN a paused Token WHEN clearingRedeemFromByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          clearingFacet.clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN operatorClearingRedeemByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          clearingFacet.operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
      });

      // Approve / Cancel / Reclaim
      it("GIVEN a paused Token WHEN approveClearingOperationByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifier),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN cancelClearingOperationByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          clearingActionsFacet.cancelClearingOperationByPartition(clearingIdentifier),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
      });

      it("GIVEN a paused Token WHEN reclaimClearingOperationByPartition THEN transaction fails with TokenIsPaused", async () => {
        await expect(
          clearingActionsFacet.reclaimClearingOperationByPartition(clearingIdentifier),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
      });
    });

    describe("Clearing with zero and minimal amounts", () => {
      it("GIVEN a Token WHEN creating clearing with amount 1 THEN transaction succeeds", async () => {
        await expect(clearingFacet.clearingTransferByPartition(clearingOperation, 1, signer_B.address)).to.emit(
          clearingFacet,
          "ClearedTransferByPartition",
        );

        const clearing = await clearingFacet.getClearingTransferForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);
        expect(clearing.amount).to.equal(1);
      });

      it("GIVEN a Token WHEN creating clearing redeem with amount 1 THEN transaction succeeds", async () => {
        await expect(clearingFacet.clearingRedeemByPartition(clearingOperation, 1)).to.emit(
          clearingFacet,
          "ClearedRedeemByPartition",
        );

        clearingIdentifier.clearingId = 1;
        clearingIdentifier.clearingOperationType = ClearingOperationType.Redeem;
        const clearing = await clearingFacet.getClearingRedeemForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);
        expect(clearing.amount).to.equal(1);
      });

      it("GIVEN a Token WHEN creating clearing hold with amount 1 THEN transaction succeeds", async () => {
        const minimalHold = {
          ...hold,
          amount: 1,
        };
        await expect(clearingFacet.clearingCreateHoldByPartition(clearingOperation, minimalHold)).to.emit(
          clearingFacet,
          "ClearedHoldByPartition",
        );

        const clearing = await clearingFacet.getClearingCreateHoldForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          1,
        );
        expect(clearing.amount).to.equal(1);
      });
    });

    describe("Clearing read operations edge cases", () => {
      it("GIVEN no clearings WHEN getting cleared amounts THEN returns zero", async () => {
        const clearedAmount = await clearingFacet.getClearedAmountFor(signer_D.address);
        const clearedAmountByPartition = await clearingFacet.getClearedAmountForByPartition(
          _DEFAULT_PARTITION,
          signer_D.address,
        );

        expect(clearedAmount).to.equal(0);
        expect(clearedAmountByPartition).to.equal(0);
      });

      it("GIVEN no clearings WHEN getting clearing counts THEN returns zero", async () => {
        const transferCount = await clearingFacet.getClearingCountForByPartition(
          _DEFAULT_PARTITION,
          signer_D.address,
          ClearingOperationType.Transfer,
        );
        const redeemCount = await clearingFacet.getClearingCountForByPartition(
          _DEFAULT_PARTITION,
          signer_D.address,
          ClearingOperationType.Redeem,
        );
        const holdCreationCount = await clearingFacet.getClearingCountForByPartition(
          _DEFAULT_PARTITION,
          signer_D.address,
          ClearingOperationType.HoldCreation,
        );

        expect(transferCount).to.equal(0);
        expect(redeemCount).to.equal(0);
        expect(holdCreationCount).to.equal(0);
      });

      it("GIVEN no clearings WHEN getting clearing IDs THEN returns empty array", async () => {
        const clearingIds = await clearingFacet.getClearingsIdForByPartition(
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
        await erc1410Facet.connect(signer_A).authorizeOperator(signer_B.address);

        const data1 = "0x1111";
        const data2 = "0x2222";
        const data3 = "0x3333";

        const clearingOp1 = { ...clearingOperation, data: data1 };
        const clearingOp2 = { ...clearingOperation, data: data2 };
        const clearingOp3 = { ...clearingOperation, data: data3 };

        await clearingFacet
          .connect(signer_B)
          .operatorClearingTransferByPartition(
            { ...clearingOperationFrom, clearingOperation: clearingOp1 },
            _AMOUNT / 10,
            signer_C.address,
          );
        await clearingFacet
          .connect(signer_B)
          .operatorClearingTransferByPartition(
            { ...clearingOperationFrom, clearingOperation: clearingOp2 },
            _AMOUNT / 10,
            signer_C.address,
          );
        await clearingFacet
          .connect(signer_B)
          .operatorClearingTransferByPartition(
            { ...clearingOperationFrom, clearingOperation: clearingOp3 },
            _AMOUNT / 10,
            signer_C.address,
          );

        const clearing1 = await clearingFacet.getClearingTransferForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          1,
        );
        const clearing2 = await clearingFacet.getClearingTransferForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          2,
        );
        const clearing3 = await clearingFacet.getClearingTransferForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          3,
        );

        expect(clearing1.data).to.equal(data1);
        expect(clearing2.data).to.equal(data2);
        expect(clearing3.data).to.equal(data3);
      });

      it("GIVEN an authorized operator WHEN creating clearing redeems with different operatorData THEN all succeed", async () => {
        await erc1410Facet.connect(signer_A).authorizeOperator(signer_B.address);

        const opData1 = "0xaaaa";
        const opData2 = "0xbbbb";

        await clearingFacet
          .connect(signer_B)
          .operatorClearingRedeemByPartition({ ...clearingOperationFrom, operatorData: opData1 }, _AMOUNT / 10);
        await clearingFacet
          .connect(signer_B)
          .operatorClearingRedeemByPartition({ ...clearingOperationFrom, operatorData: opData2 }, _AMOUNT / 10);

        const clearing1 = await clearingFacet.getClearingRedeemForByPartition(_DEFAULT_PARTITION, signer_A.address, 1);
        const clearing2 = await clearingFacet.getClearingRedeemForByPartition(_DEFAULT_PARTITION, signer_A.address, 2);

        expect(clearing1.operatorData).to.equal(opData1);
        expect(clearing2.operatorData).to.equal(opData2);
      });

      it("GIVEN an authorized operator WHEN creating clearing holds THEN holds are created correctly", async () => {
        await erc1410Facet.connect(signer_A).authorizeOperator(signer_B.address);

        const hold1 = {
          ...hold,
          amount: _AMOUNT / 10,
          to: signer_C.address,
        };

        const hold2 = {
          ...hold,
          amount: _AMOUNT / 10,
          to: signer_D.address,
        };

        await clearingFacet.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold1);
        await clearingFacet.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold2);

        const clearing1 = await clearingFacet.getClearingCreateHoldForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          1,
        );
        const clearing2 = await clearingFacet.getClearingCreateHoldForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          2,
        );

        expect(clearing1.holdTo).to.equal(signer_C.address);
        expect(clearing2.holdTo).to.equal(signer_D.address);
      });
    });

    describe("AccessControl", () => {
      it("GIVEN an account without clearing role WHEN switching clearing mode THEN transaction fails with AccountHasNoRole", async () => {
        await expect(clearingActionsFacet.connect(signer_D).activateClearing()).to.be.revertedWithCustomError(
          clearingActionsFacet,
          "AccountHasNoRole",
        );
        await expect(clearingActionsFacet.connect(signer_D).deactivateClearing()).to.be.revertedWithCustomError(
          clearingActionsFacet,
          "AccountHasNoRole",
        );
      });

      it("GIVEN an account without clearing validator role WHEN trigger clearing THEN transaction fails with AccountHasNoRole", async () => {
        await clearingFacet.clearingTransferByPartition(clearingOperation, _AMOUNT, signer_A.address);

        // Approve
        await expect(
          clearingActionsFacet.connect(signer_D).approveClearingOperationByPartition(clearingIdentifier),
        ).to.be.revertedWithCustomError(clearingActionsFacet, "AccountHasNoRole");

        // Cancel
        await expect(
          clearingActionsFacet.connect(signer_D).cancelClearingOperationByPartition(clearingIdentifier),
        ).to.be.revertedWithCustomError(clearingActionsFacet, "AccountHasNoRole");
      });

      // Transfers
      it("GIVEN an account without authorization WHEN clearingTransferFromByPartition THEN transaction fails with InsufficientAllowance", async () => {
        await expect(
          clearingFacet
            .connect(signer_D)
            .clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientAllowance");
      });

      it("GIVEN an account without operator authorization WHEN operatorClearingTransferByPartition THEN transaction fails with Unauthorized", async () => {
        await expect(
          clearingFacet
            .connect(signer_D)
            .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(clearingFacet, "Unauthorized");
      });

      // Holds
      it("GIVEN an account without authorization WHEN clearingCreateHoldFromByPartition THEN transaction fails with InsufficientAllowance", async () => {
        await expect(
          clearingFacet.connect(signer_D).clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientAllowance");
      });

      it("GIVEN an account without operator authorization WHEN operatorClearingCreateHoldByPartition THEN transaction fails with Unauthorized", async () => {
        await expect(
          clearingFacet.connect(signer_D).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(clearingFacet, "Unauthorized");
      });

      // Redeems
      it("GIVEN an account without authorization WHEN clearingRedeemFromByPartition THEN transaction fails with InsufficientAllowance", async () => {
        await expect(
          clearingFacet.connect(signer_D).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientAllowance");
      });

      it("GIVEN an account without operator authorization WHEN operatorClearingRedeemByPartition THEN transaction fails with Unauthorized", async () => {
        await expect(
          clearingFacet.connect(signer_D).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT),
        ).to.be.revertedWithCustomError(clearingFacet, "Unauthorized");
      });
    });

    describe("Control List", () => {
      // Transfers
      it("GIVEN a blacklisted destination account WHEN approveClearingOperationByPartition with operation type Transfer THEN transaction fails with AccountIsBlocked", async () => {
        await clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet
          .connect(signer_B)
          .clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
        await erc1410Facet.connect(signer_A).authorizeOperator(signer_B.address);
        await clearingFacet
          .connect(signer_B)
          .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);

        await controlListFacet.addToControlList(signer_C.address);

        // Transfer
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifier),
        ).to.be.revertedWithCustomError(controlListFacet, "AccountIsBlocked");

        // From
        const clearingIdentifierFrom = {
          ...clearingIdentifier,
          clearingId: 2,
        };
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifierFrom),
        ).to.be.revertedWithCustomError(controlListFacet, "AccountIsBlocked");

        // Operator
        const clearingIdentifierOperator = {
          ...clearingIdentifier,
          clearingId: 3,
        };
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifierOperator),
        ).to.be.revertedWithCustomError(controlListFacet, "AccountIsBlocked");
      });

      it("GIVEN a blacklisted origin account WHEN approveClearingOperationByPartition with operation type Transfer THEN transaction fails with AccountIsBlocked", async () => {
        await clearingFacet.connect(signer_B).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);
        await erc20Facet.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        const clearingOperationFromB = {
          ...clearingOperationFrom,
          from: signer_B.address,
        };
        await clearingFacet.clearingTransferFromByPartition(clearingOperationFromB, _AMOUNT, signer_C.address);
        await erc1410Facet.authorizeOperator(signer_A.address);
        await clearingFacet.operatorClearingTransferByPartition(clearingOperationFromB, _AMOUNT, signer_C.address);

        await controlListFacet.addToControlList(signer_B.address);

        // Transfer
        const clearingIdentifierB = {
          ...clearingIdentifier,
          tokenHolder: signer_B.address,
        };
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifierB),
        ).to.be.revertedWithCustomError(controlListFacet, "AccountIsBlocked");

        // From
        const clearingIdentifierFromB = {
          ...clearingIdentifierB,
          clearingId: 2,
        };
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifierFromB),
        ).to.be.revertedWithCustomError(controlListFacet, "AccountIsBlocked");

        // Operator
        const clearingIdentifierOperatorB = {
          ...clearingIdentifierB,
          clearingId: 3,
        };
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifierOperatorB),
        ).to.be.revertedWithCustomError(controlListFacet, "AccountIsBlocked");
      });

      // // Holds
      // TODO: Should we check control list when approving hold?
      // it('GIVEN a blacklisted destination account WHEN approveClearingOperationByPartition with operation type Hold THEN transaction fails with AccountIsBlocked', async () => {
      //     await clearingFacet
      //         .connect(signer_A)
      //         .clearingCreateHoldByPartition(clearingOperation, hold)
      //     await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT)
      //     await clearingFacet
      //         .connect(signer_B)
      //         .clearingCreateHoldFromByPartition(clearingOperationFrom, hold)
      //     await erc1410Facet.connect(signer_A).authorizeOperator(signer_B.address)
      //     await clearingFacet
      //         .connect(signer_B)
      //         .operatorClearingCreateHoldByPartition(
      //             clearingOperationFrom,
      //             hold
      //         )

      //     await controlListFacet.addToControlList(signer_C.address)

      //     clearingIdentifier = {
      //         ...clearingIdentifier,
      //         clearingOperationType: ClearingOperationType.HoldCreation,
      //     }

      //     // Hold
      //     await expect(
      //         clearingActionsFacet.approveClearingOperationByPartition(
      //             clearingIdentifier
      //         )
      //     ).to.be.revertedWithCustomError(
      //         controlListFacet,
      //         'AccountIsBlocked'
      //     )

      //     // From
      //     let clearingIdentifierFrom = {
      //         ...clearingIdentifier,
      //         clearingId: 2,
      //     }
      //     await expect(
      //         clearingActionsFacet.approveClearingOperationByPartition(
      //             clearingIdentifierFrom
      //         )
      //     ).to.be.revertedWithCustomError(
      //         controlListFacet,
      //         'AccountIsBlocked'
      //     )

      //     // Operator
      //     let clearingIdentifierOperator = {
      //         ...clearingIdentifier,
      //         clearingId: 3,
      //     }
      //     await expect(
      //         clearingActionsFacet.approveClearingOperationByPartition(
      //             clearingIdentifierOperator
      //         )
      //     ).to.be.revertedWithCustomError(
      //         controlListFacet,
      //         'AccountIsBlocked'
      //     )
      // })

      // it('GIVEN a blacklisted origin account WHEN approveClearingOperationByPartition with operation type Hold THEN transaction fails with AccountIsBlocked', async () => {
      //     await clearingFacet
      //         .connect(signer_B)
      //         .clearingCreateHoldByPartition(clearingOperation, hold)
      //     await erc20Facet
      //         .connect(signer_B)
      //         .increaseAllowance(signer_A.address, _AMOUNT)
      //     let clearingOperationFromB = {
      //         ...clearingOperationFrom,
      //         from: signer_B.address,
      //     }
      //     await clearingFacet.clearingCreateHoldFromByPartition(
      //         clearingOperationFromB,
      //         hold
      //     )
      //     await erc1410Facet.authorizeOperator(signer_A.address)
      //     await clearingFacet.operatorClearingCreateHoldByPartition(
      //         clearingOperationFromB,
      //         hold
      //     )

      //     await controlListFacet.addToControlList(signer_B.address)

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
      //         clearingActionsFacet.approveClearingOperationByPartition(
      //             clearingIdentifierB
      //         )
      //     ).to.be.revertedWithCustomError(
      //         controlListFacet,
      //         'AccountIsBlocked'
      //     )

      //     // From
      //     let clearingIdentifierFromB = {
      //         ...clearingIdentifierB,
      //         clearingId: 2,
      //     }
      //     await expect(
      //         clearingActionsFacet.approveClearingOperationByPartition(
      //             clearingIdentifierFromB
      //         )
      //     ).to.be.revertedWithCustomError(
      //         controlListFacet,
      //         'AccountIsBlocked'
      //     )

      //     // Operator
      //     let clearingIdentifierOperatorB = {
      //         ...clearingIdentifierB,
      //         clearingId: 3,
      //     }
      //     await expect(
      //         clearingActionsFacet.approveClearingOperationByPartition(
      //             clearingIdentifierOperatorB
      //         )
      //     ).to.be.revertedWithCustomError(
      //         controlListFacet,
      //         'AccountIsBlocked'
      //     )
      // })

      // Redeems
      it("GIVEN a blacklisted origin account WHEN approveClearingOperationByPartition with operation type Redeem THEN transaction fails with AccountIsBlocked", async () => {
        await clearingFacet.connect(signer_B).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        await erc20Facet.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        const clearingOperationFromB = {
          ...clearingOperationFrom,
          from: signer_B.address,
        };
        await clearingFacet.clearingRedeemFromByPartition(clearingOperationFromB, _AMOUNT);
        await erc1410Facet.authorizeOperator(signer_A.address);
        await clearingFacet.operatorClearingRedeemByPartition(clearingOperationFromB, _AMOUNT);

        await controlListFacet.addToControlList(signer_B.address);

        // Redeem
        const clearingIdentifierB = {
          ...clearingIdentifier,
          clearingOperationType: ClearingOperationType.Redeem,
          tokenHolder: signer_B.address,
        };
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifierB),
        ).to.be.revertedWithCustomError(controlListFacet, "AccountIsBlocked");

        // From
        const clearingIdentifierFromB = {
          ...clearingIdentifierB,
          clearingId: 2,
        };
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifierFromB),
        ).to.be.revertedWithCustomError(controlListFacet, "AccountIsBlocked");

        // Operator
        const clearingIdentifierOperatorB = {
          ...clearingIdentifierB,
          clearingId: 3,
        };
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifierOperatorB),
        ).to.be.revertedWithCustomError(controlListFacet, "AccountIsBlocked");
      });
    });

    describe("KYC", () => {
      it("Given a non kyc account WHEN approveClearingOperationByPartition with operation type Transfer THEN transaction fails with InvalidKycStatus", async () => {
        const clearingOperationFromB = {
          ...clearingOperationFrom,
          from: signer_B.address,
        };
        await clearingFacet.connect(signer_B).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_D.address);
        await erc20Facet.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        await clearingFacet.clearingTransferFromByPartition(clearingOperationFromB, _AMOUNT, signer_D.address);
        await erc1410Facet.authorizeOperator(signer_A.address);
        await clearingFacet.operatorClearingTransferByPartition(clearingOperationFromB, _AMOUNT, signer_D.address);

        // Revoke from
        await kycFacet.revokeKyc(signer_B.address);
        await kycFacet.grantKyc(signer_D.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

        // Transfer
        const clearingIdentifierB = {
          ...clearingIdentifier,
          tokenHolder: signer_B.address,
        };
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifierB),
        ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");

        // From
        const clearingIdentifierFromB = {
          ...clearingIdentifierB,
          clearingId: 2,
        };
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifierFromB),
        ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");

        // Operator
        const clearingIdentifierOperatorB = {
          ...clearingIdentifierB,
          clearingId: 3,
        };

        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifierOperatorB),
        ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");

        // Revoke destination
        await kycFacet.grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
        await kycFacet.revokeKyc(signer_D.address);

        // Transfer
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifierB),
        ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");

        // From
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifierFromB),
        ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");

        // Operator
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifierOperatorB),
        ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");
      });

      // TODO: Should we check kyc status when approving hold?
      // it('Given a non kyc account WHEN approveClearingOperationByPartition with operation type Hold THEN transaction fails with InvalidKycStatus', async () => {
      //     let clearingOperationFromB = {
      //         ...clearingOperationFrom,
      //         from: signer_B.address,
      //     }
      //     await clearingFacet
      //         .connect(signer_B)
      //         .clearingCreateHoldByPartition(clearingOperation, hold)
      //     await erc20Facet
      //         .connect(signer_B)
      //         .increaseAllowance(signer_A.address, _AMOUNT)
      //     await clearingFacet.clearingCreateHoldFromByPartition(
      //         clearingOperationFromB,
      //         hold
      //     )
      //     await erc1410Facet.authorizeOperator(signer_A.address)
      //     await clearingFacet.operatorClearingCreateHoldByPartition(
      //         clearingOperationFromB,
      //         hold
      //     )

      //     // Revoke from
      //     await kycFacet.revokeKyc(signer_B.address)

      //     // Hold
      //     let clearingIdentifierB = {
      //         ...clearingIdentifier,
      //         tokenHolder: signer_B.address,
      //         clearingOperationType: ClearingOperationType.HoldCreation
      //     }
      //     await expect(
      //         clearingActionsFacet.approveClearingOperationByPartition(
      //             clearingIdentifierB
      //         )
      //     ).to.be.revertedWithCustomError(kycFacet, 'InvalidKycStatus')

      //     // From
      //     let clearingIdentifierFromB = {
      //         ...clearingIdentifierB,
      //         clearingId: 2,
      //     }
      //     await expect(
      //         clearingActionsFacet.approveClearingOperationByPartition(
      //             clearingIdentifierFromB
      //         )
      //     ).to.be.revertedWithCustomError(kycFacet, 'InvalidKycStatus')

      //     // Operator
      //     let clearingIdentifierOperatorB = {
      //         ...clearingIdentifierB,
      //         clearingId: 3,
      //     }

      //     await expect(
      //         clearingActionsFacet.approveClearingOperationByPartition(
      //             clearingIdentifierOperatorB
      //         )
      //     ).to.be.revertedWithCustomError(kycFacet, 'InvalidKycStatus')

      //     // Revoke destination
      //     await kycFacet.grantKyc(
      //         signer_B.address,
      //         EMPTY_VC_ID,
      //         ZERO,
      //         MAX_UINT256,
      //         signer_A.address
      //     )
      //     await kycFacet.revokeKyc(signer_C.address)

      //     // Hold
      //     await expect(
      //         clearingActionsFacet.approveClearingOperationByPartition(
      //             clearingIdentifierB
      //         )
      //     ).to.be.revertedWithCustomError(kycFacet, 'InvalidKycStatus')

      //     // From
      //     await expect(
      //         clearingActionsFacet.approveClearingOperationByPartition(
      //             clearingIdentifierFromB
      //         )
      //     ).to.be.revertedWithCustomError(kycFacet, 'InvalidKycStatus')

      //     // Operator
      //     await expect(
      //         clearingActionsFacet.approveClearingOperationByPartition(
      //             clearingIdentifierOperatorB
      //         )
      //     ).to.be.revertedWithCustomError(kycFacet, 'InvalidKycStatus')
      // })

      it("Given a non kyc account WHEN approveClearingOperationByPartition with operation type Redeem THEN transaction fails with InvalidKycStatus", async () => {
        const clearingOperationFromB = {
          ...clearingOperationFrom,
          from: signer_B.address,
        };
        await clearingFacet.connect(signer_B).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        await erc20Facet.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        await clearingFacet.clearingRedeemFromByPartition(clearingOperationFromB, _AMOUNT);
        await erc1410Facet.authorizeOperator(signer_A.address);
        await clearingFacet.operatorClearingRedeemByPartition(clearingOperationFromB, _AMOUNT);

        // Revoke from
        await kycFacet.revokeKyc(signer_B.address);

        // Redeem
        const clearingIdentifierB = {
          ...clearingIdentifier,
          tokenHolder: signer_B.address,
          clearingOperationType: ClearingOperationType.Redeem,
        };
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifierB),
        ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");

        // From
        const clearingIdentifierFromB = {
          ...clearingIdentifierB,
          clearingId: 2,
        };
        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifierFromB),
        ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");

        // Operator
        const clearingIdentifierOperatorB = {
          ...clearingIdentifierB,
          clearingId: 3,
        };

        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifierOperatorB),
        ).to.be.revertedWithCustomError(kycFacet, "InvalidKycStatus");
      });
    });

    describe("Create clearing with wrong input arguments", () => {
      it("GIVEN a Token WHEN creating clearing with amount bigger than balance THEN transaction fails with InsufficientBalance", async () => {
        // Transfers
        await expect(
          clearingFacet.clearingTransferByPartition(clearingOperation, 4 * _AMOUNT, signer_B.address),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientBalance");

        const clearingOperationFromB = {
          ...clearingOperationFrom,
          from: signer_B.address,
        };

        await erc20Facet.connect(signer_B).increaseAllowance(signer_A.address, 4 * _AMOUNT);
        await expect(
          clearingFacet.clearingTransferFromByPartition(clearingOperationFromB, 4 * _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientBalance");
        await erc1410Facet.authorizeOperator(signer_A.address);
        await expect(
          clearingFacet.operatorClearingTransferByPartition(clearingOperationFromB, 4 * _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientBalance");

        // Holds
        const hold_wrong = {
          ...hold,
          amount: 4 * _AMOUNT,
        };
        await expect(
          clearingFacet.clearingCreateHoldByPartition(clearingOperation, hold_wrong),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientBalance");
        await expect(
          clearingFacet.clearingCreateHoldFromByPartition(clearingOperationFromB, hold_wrong),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientBalance");
        await expect(
          clearingFacet.operatorClearingCreateHoldByPartition(clearingOperationFromB, hold_wrong),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientBalance");

        // Redeems
        await expect(
          clearingFacet.clearingRedeemByPartition(clearingOperation, 4 * _AMOUNT),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientBalance");
        await expect(
          clearingFacet.clearingRedeemFromByPartition(clearingOperationFromB, 4 * _AMOUNT),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientBalance");
        await expect(
          clearingFacet.operatorClearingRedeemByPartition(clearingOperationFromB, 4 * _AMOUNT),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientBalance");
      });

      it("GIVEN a Token WHEN creating clearing from with amount bigger than allowed THEN transaction fails with InsufficientAllowance", async () => {
        // Transfers
        await expect(
          clearingFacet.clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientAllowance");

        // Holds
        await expect(
          clearingFacet.clearingCreateHoldFromByPartition(clearingOperationFrom, hold),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientAllowance");

        // Redeems
        await expect(
          clearingFacet.clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT),
        ).to.be.revertedWithCustomError(erc20Facet, "InsufficientAllowance");
      });

      it("GIVEN a Token WHEN creating clearing passing empty address from or escrow THEN transaction fails with ZeroAddressNotAllowed", async () => {
        // Transfers
        const clearingOperationFrom_wrong = {
          ...clearingOperationFrom,
          from: ADDRESS_ZERO,
        };
        await expect(
          clearingFacet.clearingTransferFromByPartition(clearingOperationFrom_wrong, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(clearingFacet, "ZeroAddressNotAllowed");
        await expect(
          clearingFacet.operatorClearingTransferByPartition(clearingOperationFrom_wrong, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(clearingFacet, "ZeroAddressNotAllowed");

        // Holds
        await expect(
          clearingFacet.clearingCreateHoldFromByPartition(clearingOperationFrom_wrong, hold),
        ).to.be.revertedWithCustomError(clearingFacet, "ZeroAddressNotAllowed");
        await expect(
          clearingFacet.operatorClearingCreateHoldByPartition(clearingOperationFrom_wrong, hold),
        ).to.be.revertedWithCustomError(clearingFacet, "ZeroAddressNotAllowed");
        const hold_wrong_empty_address_escrow = {
          ...hold,
          escrow: ADDRESS_ZERO,
        };
        await expect(
          clearingFacet.clearingCreateHoldByPartition(clearingOperation, hold_wrong_empty_address_escrow),
        ).to.be.revertedWithCustomError(clearingFacet, "ZeroAddressNotAllowed");
        await expect(
          clearingFacet.clearingCreateHoldFromByPartition(clearingOperationFrom, hold_wrong_empty_address_escrow),
        ).to.be.revertedWithCustomError(clearingFacet, "ZeroAddressNotAllowed");
        await expect(
          clearingFacet.operatorClearingCreateHoldByPartition(clearingOperationFrom, hold_wrong_empty_address_escrow),
        ).to.be.revertedWithCustomError(clearingFacet, "ZeroAddressNotAllowed");

        // Redeems
        await expect(
          clearingFacet.clearingRedeemFromByPartition(clearingOperationFrom_wrong, _AMOUNT),
        ).to.be.revertedWithCustomError(clearingFacet, "ZeroAddressNotAllowed");
        await expect(
          clearingFacet.operatorClearingRedeemByPartition(clearingOperationFrom_wrong, _AMOUNT),
        ).to.be.revertedWithCustomError(clearingFacet, "ZeroAddressNotAllowed");
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

        await timeTravelFacet.changeSystemTimestamp(currentTimestamp);

        // Transfers
        await expect(
          clearingFacet.clearingTransferByPartition(clearingOperation__wrong, _AMOUNT, signer_B.address),
        ).to.be.revertedWithCustomError(clearingFacet, "WrongExpirationTimestamp");
        await erc20Facet.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        await expect(
          clearingFacet.clearingTransferFromByPartition(clearingOperationFrom_wrong, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(clearingFacet, "WrongExpirationTimestamp");
        await erc1410Facet.authorizeOperator(signer_A.address);
        await expect(
          clearingFacet.operatorClearingTransferByPartition(clearingOperationFrom_wrong, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(clearingFacet, "WrongExpirationTimestamp");

        // Holds
        await expect(
          clearingFacet.clearingCreateHoldByPartition(clearingOperation__wrong, hold),
        ).to.be.revertedWithCustomError(clearingFacet, "WrongExpirationTimestamp");
        await erc20Facet.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        await expect(
          clearingFacet.clearingCreateHoldFromByPartition(clearingOperationFrom_wrong, hold),
        ).to.be.revertedWithCustomError(clearingFacet, "WrongExpirationTimestamp");
        await erc1410Facet.authorizeOperator(signer_A.address);
        await expect(
          clearingFacet.operatorClearingCreateHoldByPartition(clearingOperationFrom_wrong, hold),
        ).to.be.revertedWithCustomError(clearingFacet, "WrongExpirationTimestamp");

        const hold_wrong = {
          ...hold,
          expirationTimestamp: wrongExpirationTimestamp,
        };
        await expect(
          clearingFacet.clearingCreateHoldByPartition(clearingOperation, hold_wrong),
        ).to.be.revertedWithCustomError(clearingFacet, "WrongExpirationTimestamp");
        await expect(
          clearingFacet.clearingCreateHoldFromByPartition(clearingOperationFrom_wrong, hold_wrong),
        ).to.be.revertedWithCustomError(clearingFacet, "WrongExpirationTimestamp");
        await expect(
          clearingFacet.operatorClearingCreateHoldByPartition(clearingOperationFrom_wrong, hold_wrong),
        ).to.be.revertedWithCustomError(clearingFacet, "WrongExpirationTimestamp");

        // Redeems
        await expect(
          clearingFacet.clearingRedeemByPartition(clearingOperation__wrong, _AMOUNT),
        ).to.be.revertedWithCustomError(clearingFacet, "WrongExpirationTimestamp");
        await expect(
          clearingFacet.clearingRedeemFromByPartition(clearingOperationFrom_wrong, _AMOUNT),
        ).to.be.revertedWithCustomError(clearingFacet, "WrongExpirationTimestamp");
        await expect(
          clearingFacet.operatorClearingRedeemByPartition(clearingOperationFrom_wrong, _AMOUNT),
        ).to.be.revertedWithCustomError(clearingFacet, "WrongExpirationTimestamp");
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
          clearingFacet.clearingTransferByPartition(clearingOperation__wrong, _AMOUNT, signer_B.address),
        ).to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode");
        await erc20Facet.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        await expect(
          clearingFacet.clearingTransferFromByPartition(clearingOperationFrom_wrong, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode");
        await erc1410Facet.authorizeOperator(signer_A.address);
        await expect(
          clearingFacet.operatorClearingTransferByPartition(clearingOperationFrom_wrong, _AMOUNT, signer_A.address),
        ).to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode");

        // Holds
        await expect(
          clearingFacet.clearingCreateHoldByPartition(clearingOperation__wrong, hold),
        ).to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode");
        await erc20Facet.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        await expect(
          clearingFacet.clearingCreateHoldFromByPartition(clearingOperationFrom_wrong, hold),
        ).to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode");
        await erc1410Facet.authorizeOperator(signer_A.address);
        await expect(
          clearingFacet.operatorClearingCreateHoldByPartition(clearingOperationFrom_wrong, hold),
        ).to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode");

        // Redeems
        await expect(
          clearingFacet.clearingRedeemByPartition(clearingOperation__wrong, _AMOUNT),
        ).to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode");
        await erc20Facet.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);
        await expect(
          clearingFacet.clearingRedeemFromByPartition(clearingOperationFrom_wrong, _AMOUNT),
        ).to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode");
        await erc1410Facet.authorizeOperator(signer_A.address);
        await expect(
          clearingFacet.operatorClearingRedeemByPartition(clearingOperationFrom_wrong, _AMOUNT),
        ).to.be.revertedWithCustomError(erc1410Facet, "PartitionNotAllowedInSinglePartitionMode");
      });
    });

    describe("Manage clearing with wrong input arguments", () => {
      it("GIVEN a clearing transfer WHEN approveClearingOperationByPartition with wrong input arguments THEN transaction fails with ExpirationDateReached", async () => {
        await clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);

        // Wait until expiration date
        await timeTravelFacet.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifier),
        ).to.be.revertedWithCustomError(clearingActionsFacet, "ExpirationDateReached");
      });

      it("GIVEN a clearing transfer WHEN cancelClearingOperationByPartition with wrong input arguments THEN transaction fails with ExpirationDateReached", async () => {
        await clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);

        // Wait until expiration date
        await timeTravelFacet.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

        await expect(
          clearingActionsFacet.cancelClearingOperationByPartition(clearingIdentifier),
        ).to.be.revertedWithCustomError(clearingActionsFacet, "ExpirationDateReached");
      });

      it("GIVEN a clearing transfer WHEN reclaimClearingOperationByPartition with wrong input arguments THEN transaction fails with ExpirationDateReached", async () => {
        await clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);

        await expect(
          clearingActionsFacet.reclaimClearingOperationByPartition(clearingIdentifier),
        ).to.be.revertedWithCustomError(clearingActionsFacet, "ExpirationDateNotReached");
      });

      it("GIVEN a clearing transfer WHEN approveClearingOperationByPartition with wrong partition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        await clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);

        const wrongClearingIdentifier = {
          ...clearingIdentifier,
          partition: _WRONG_PARTITION,
        };

        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(wrongClearingIdentifier),
        ).to.be.revertedWithCustomError(clearingActionsFacet, "PartitionNotAllowedInSinglePartitionMode");
      });

      it("GIVEN a clearing transfer WHEN cancelClearingOperationByPartition with wrong clearingId THEN transaction fails with WrongClearingId", async () => {
        await clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);

        const wrongClearingIdentifier = {
          ...clearingIdentifier,
          clearingId: 999,
        };

        await expect(
          clearingActionsFacet.cancelClearingOperationByPartition(wrongClearingIdentifier),
        ).to.be.revertedWithCustomError(clearingActionsFacet, "WrongClearingId");
      });

      it("GIVEN a clearing transfer WHEN reclaimClearingOperationByPartition with unidentified account THEN transaction fails", async () => {
        await clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);

        // Revoke identity for signer_A
        await kycFacet.connect(signer_B).revokeKyc(signer_A.address);

        // Wait until expiration date
        await timeTravelFacet.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

        await expect(clearingActionsFacet.connect(signer_A).reclaimClearingOperationByPartition(clearingIdentifier)).to
          .be.reverted;
      });
    });

    describe("Create clearing success", () => {
      let balance_A_original: BigNumber;
      let totalClearedAmount = 0;

      beforeEach(async () => {
        balance_A_original = await erc1410Facet.balanceOf(signer_A.address);
        totalClearedAmount = 3 * _AMOUNT;
      });
      it("GIVEN a Token WHEN Activate and Deactive clearing THEN transaction succeeds", async () => {
        await expect(clearingActionsFacet.connect(signer_A).deactivateClearing())
          .to.emit(clearingActionsFacet, "ClearingDeactivated")
          .withArgs(signer_A.address);

        const deactivated = await clearingActionsFacet.isClearingActivated();

        await expect(clearingActionsFacet.connect(signer_A).activateClearing())
          .to.emit(clearingActionsFacet, "ClearingActivated")
          .withArgs(signer_A.address);

        const activated = await clearingActionsFacet.isClearingActivated();

        expect(deactivated).to.equal(false);
        expect(activated).to.equal(true);
      });
      it("GIVEN a Token WHEN creating clearing transfer THEN transaction succeeds", async () => {
        await expect(clearingFacet.clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address))
          .to.emit(clearingFacet, "ClearedTransferByPartition")
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
        await erc20Facet.connect(signer_A).increaseAllowance(signer_B.address, 4 * _AMOUNT);

        await expect(
          clearingFacet
            .connect(signer_B)
            .clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address),
        )
          .to.emit(clearingFacet, "ClearedTransferFromByPartition")
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
        await erc1410Facet.connect(signer_A).authorizeOperator(signer_C.address);

        await expect(
          clearingFacet
            .connect(signer_C)
            .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_D.address),
        )
          .to.emit(clearingFacet, "ClearedOperatorTransferByPartition")
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
          balance_A_original.toNumber() - totalClearedAmount,
          signer_A.address,
          totalClearedAmount,
          totalClearedAmount,
          3,
          0,
          0,
        );
      });

      it("GIVEN a Token WHEN creating clearing redeem THEN transaction succeeds", async () => {
        await expect(clearingFacet.clearingRedeemByPartition(clearingOperation, _AMOUNT))
          .to.emit(clearingFacet, "ClearedRedeemByPartition")
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
        await erc20Facet.connect(signer_A).increaseAllowance(signer_B.address, 4 * _AMOUNT);

        await expect(clearingFacet.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT))
          .to.emit(clearingFacet, "ClearedRedeemFromByPartition")
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
        await erc1410Facet.connect(signer_A).authorizeOperator(signer_C.address);

        await expect(clearingFacet.connect(signer_C).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT))
          .to.emit(clearingFacet, "ClearedOperatorRedeemByPartition")
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
          balance_A_original.toNumber() - totalClearedAmount,
          signer_A.address,
          totalClearedAmount,
          totalClearedAmount,
          0,
          3,
          0,
        );
      });

      it("GIVEN a Token WHEN creating clearing new hold THEN transaction succeeds", async () => {
        await expect(clearingFacet.clearingCreateHoldByPartition(clearingOperation, hold))
          .to.emit(clearingFacet, "ClearedHoldByPartition")
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
        await erc20Facet.connect(signer_A).increaseAllowance(signer_B.address, 4 * _AMOUNT);

        await expect(clearingFacet.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold))
          .to.emit(clearingFacet, "ClearedHoldFromByPartition")
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
        await erc1410Facet.connect(signer_A).authorizeOperator(signer_C.address);

        await expect(clearingFacet.connect(signer_C).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold))
          .to.emit(clearingFacet, "ClearedOperatorHoldByPartition")
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
          balance_A_original.toNumber() - totalClearedAmount,
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
          await clearingFacet.clearingTransferByPartition(clearingOperation, _AMOUNT / 10, signer_B.address);
        }

        // Test pagination
        const clearingIds_page1 = await clearingFacet.getClearingsIdForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          ClearingOperationType.Transfer,
          0,
          3,
        );
        const clearingIds_page2 = await clearingFacet.getClearingsIdForByPartition(
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

        await clearingFacet
          .connect(signer_A)
          .clearingTransferByPartition(clearingOperation, amount_A, signer_C.address);
        await clearingFacet
          .connect(signer_B)
          .clearingTransferByPartition(clearingOperation, amount_B, signer_C.address);

        const clearedAmount_A = await clearingFacet.getClearedAmountFor(signer_A.address);
        const clearedAmount_B = await clearingFacet.getClearedAmountFor(signer_B.address);
        const clearedAmountByPartition_A = await clearingFacet.getClearedAmountForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
        );
        const clearedAmountByPartition_B = await clearingFacet.getClearedAmountForByPartition(
          _DEFAULT_PARTITION,
          signer_B.address,
        );

        expect(clearedAmount_A).to.equal(amount_A);
        expect(clearedAmount_B).to.equal(amount_B);
        expect(clearedAmountByPartition_A).to.equal(amount_A);
        expect(clearedAmountByPartition_B).to.equal(amount_B);
      });

      it("GIVEN a Token WHEN creating clearing with same parameters multiple times THEN all clearings are created independently", async () => {
        const countBefore = await clearingFacet.getClearingCountForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          ClearingOperationType.Transfer,
        );

        await clearingFacet.clearingTransferByPartition(clearingOperation, _AMOUNT / 2, signer_B.address);
        await clearingFacet.clearingTransferByPartition(clearingOperation, _AMOUNT / 2, signer_B.address);
        await clearingFacet.clearingTransferByPartition(clearingOperation, _AMOUNT / 2, signer_B.address);

        const countAfter = await clearingFacet.getClearingCountForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          ClearingOperationType.Transfer,
        );

        expect(countAfter).to.equal(countBefore.add(3));

        // Verify each clearing is independent
        const clearing1 = await clearingFacet.getClearingTransferForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          countBefore.add(1).toNumber(),
        );
        const clearing2 = await clearingFacet.getClearingTransferForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          countBefore.add(2).toNumber(),
        );
        const clearing3 = await clearingFacet.getClearingTransferForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          countBefore.add(3).toNumber(),
        );

        expect(clearing1.amount).to.equal(_AMOUNT / 2);
        expect(clearing2.amount).to.equal(_AMOUNT / 2);
        expect(clearing3.amount).to.equal(_AMOUNT / 2);
      });

      it("GIVEN mixed clearing operations WHEN checking counts per type THEN counts are accurate", async () => {
        await clearingFacet.clearingTransferByPartition(clearingOperation, _AMOUNT / 5, signer_B.address);
        await clearingFacet.clearingTransferByPartition(clearingOperation, _AMOUNT / 5, signer_B.address);
        await clearingFacet.clearingRedeemByPartition(clearingOperation, _AMOUNT / 5);
        await clearingFacet.clearingRedeemByPartition(clearingOperation, _AMOUNT / 5);
        await clearingFacet.clearingRedeemByPartition(clearingOperation, _AMOUNT / 5);
        await clearingFacet.clearingCreateHoldByPartition(clearingOperation, {
          ...hold,
          amount: _AMOUNT / 5,
        });

        const transferCount = await clearingFacet.getClearingCountForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          ClearingOperationType.Transfer,
        );
        const redeemCount = await clearingFacet.getClearingCountForByPartition(
          _DEFAULT_PARTITION,
          signer_A.address,
          ClearingOperationType.Redeem,
        );
        const holdCreationCount = await clearingFacet.getClearingCountForByPartition(
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
        await clearingFacet.clearingTransferByPartition(clearingOperation, _AMOUNT / 4, signer_B.address);

        // AUTHORIZED type (from)
        await erc20Facet.connect(signer_A).increaseAllowance(signer_C.address, _AMOUNT / 4);
        await clearingFacet
          .connect(signer_C)
          .clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT / 4, signer_B.address);

        // OPERATOR type
        await erc1410Facet.connect(signer_A).authorizeOperator(signer_C.address);
        await clearingFacet
          .connect(signer_C)
          .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT / 4, signer_B.address);

        const thirdParty1 = await clearingFacet.getClearingThirdParty(
          _DEFAULT_PARTITION,
          signer_A.address,
          ClearingOperationType.Transfer,
          1,
        );
        const thirdParty2 = await clearingFacet.getClearingThirdParty(
          _DEFAULT_PARTITION,
          signer_A.address,
          ClearingOperationType.Transfer,
          2,
        );
        const thirdParty3 = await clearingFacet.getClearingThirdParty(
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
        expect(await clearingActionsFacet.isClearingActivated()).to.equal(true);

        await clearingActionsFacet.deactivateClearing();
        expect(await clearingActionsFacet.isClearingActivated()).to.equal(false);

        await clearingActionsFacet.activateClearing();
        expect(await clearingActionsFacet.isClearingActivated()).to.equal(true);

        await clearingActionsFacet.deactivateClearing();
        expect(await clearingActionsFacet.isClearingActivated()).to.equal(false);

        await clearingActionsFacet.activateClearing();
        expect(await clearingActionsFacet.isClearingActivated()).to.equal(true);
      });

      // it("GIVEN a clearing WHEN expiration timestamp is at current time THEN transaction succeeds", async () => {
      //   const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
      //   const clearingOpCurrentTime = {
      //     ...clearingOperation,
      //     expirationTimestamp: currentTime + 1, // Add 1 second to ensure it's in the future
      //   };

      //   // Should succeed with future timestamp
      //   await expect(clearingFacet.clearingTransferByPartition(clearingOpCurrentTime, _AMOUNT / 10, signer_B.address))
      //     .to.not.be.reverted;
      // });

      it("GIVEN expired clearing operations WHEN reclaimClearingOperationByPartition for different types THEN all succeed", async () => {
        // Create clearings of all types
        await clearingFacet.clearingTransferByPartition(clearingOperation, _AMOUNT / 4, signer_B.address);
        await clearingFacet.clearingRedeemByPartition(clearingOperation, _AMOUNT / 4);
        await clearingFacet.clearingCreateHoldByPartition(clearingOperation, {
          ...hold,
          amount: _AMOUNT / 4,
        });

        // Wait for expiration
        await timeTravelFacet.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

        // Reclaim all
        clearingIdentifier.clearingId = 1;
        clearingIdentifier.clearingOperationType = ClearingOperationType.Transfer;
        await expect(clearingActionsFacet.reclaimClearingOperationByPartition(clearingIdentifier)).to.emit(
          clearingActionsFacet,
          "ClearingOperationReclaimed",
        );

        clearingIdentifier.clearingOperationType = ClearingOperationType.Redeem;
        await expect(clearingActionsFacet.reclaimClearingOperationByPartition(clearingIdentifier)).to.emit(
          clearingActionsFacet,
          "ClearingOperationReclaimed",
        );

        clearingIdentifier.clearingOperationType = ClearingOperationType.HoldCreation;
        await expect(clearingActionsFacet.reclaimClearingOperationByPartition(clearingIdentifier)).to.emit(
          clearingActionsFacet,
          "ClearingOperationReclaimed",
        );
      });
    });

    describe("Managing clearing success", () => {
      it("GIVEN a Token WHEN clearing operation approved THEN transaction succeeds", async () => {
        const balance_A_original = await erc1410Facet.balanceOf(signer_A.address);
        const balance_B_original = await erc1410Facet.balanceOf(signer_B.address);

        // Transfer
        await clearingFacet.clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address);

        clearingIdentifier.clearingId = 1;
        clearingIdentifier.clearingOperationType = ClearingOperationType.Transfer;

        await expect(clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifier))
          .to.emit(clearingActionsFacet, "ClearingOperationApproved")
          .withArgs(signer_A.address, signer_A.address, _PARTITION_ID_1, 1, ClearingOperationType.Transfer, "0x");

        const balance_A_final_Transfer = await erc1410Facet.balanceOf(signer_A.address);
        const balance_B_final_Transfer = await erc1410Facet.balanceOf(signer_B.address);

        // Redeem

        await clearingFacet.clearingRedeemByPartition(clearingOperation, _AMOUNT);
        clearingIdentifier.clearingOperationType = ClearingOperationType.Redeem;

        await expect(clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifier))
          .to.emit(clearingActionsFacet, "ClearingOperationApproved")
          .withArgs(signer_A.address, signer_A.address, _PARTITION_ID_1, 1, ClearingOperationType.Redeem, "0x");

        const balance_A_final_Redeem = await erc1410Facet.balanceOf(signer_A.address);
        const balance_B_final_Redeem = await erc1410Facet.balanceOf(signer_B.address);

        // HoldCreate
        await clearingFacet.clearingCreateHoldByPartition(clearingOperation, hold);

        clearingIdentifier.clearingOperationType = ClearingOperationType.HoldCreation;

        await expect(clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifier))
          .to.emit(clearingActionsFacet, "ClearingOperationApproved")
          .withArgs(
            signer_A.address,
            signer_A.address,
            _PARTITION_ID_1,
            1,
            ClearingOperationType.HoldCreation,
            ethers.utils.defaultAbiCoder.encode(["uint256"], [1]),
          );

        const balance_A_final_HoldCreation = await erc1410Facet.balanceOf(signer_A.address);
        const balance_B_final_HoldCreation = await erc1410Facet.balanceOf(signer_B.address);

        expect(balance_B_final_Transfer.toNumber()).to.equal(balance_B_original.toNumber() + _AMOUNT);
        expect(balance_A_final_Transfer.toNumber()).to.equal(balance_A_original.toNumber() - _AMOUNT);
        expect(balance_B_final_Redeem.toNumber()).to.equal(balance_B_original.toNumber() + _AMOUNT);
        expect(balance_A_final_Redeem.toNumber()).to.equal(balance_A_original.toNumber() - 2 * _AMOUNT);
        expect(balance_B_final_HoldCreation.toNumber()).to.equal(balance_B_original.toNumber() + _AMOUNT);
        expect(balance_A_final_HoldCreation.toNumber()).to.equal(balance_A_original.toNumber() - 3 * _AMOUNT);
      });

      it("GIVEN a Token WHEN clearing operation cancelled THEN transaction succeeds", async () => {
        const balance_A_original = await erc1410Facet.balanceOf(signer_A.address);
        const balance_B_original = await erc1410Facet.balanceOf(signer_B.address);

        // Transfer
        await clearingFacet.clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address);

        clearingIdentifier.clearingId = 1;
        clearingIdentifier.clearingOperationType = ClearingOperationType.Transfer;

        await expect(clearingActionsFacet.cancelClearingOperationByPartition(clearingIdentifier))
          .to.emit(clearingActionsFacet, "ClearingOperationCanceled")
          .withArgs(signer_A.address, signer_A.address, _PARTITION_ID_1, 1, ClearingOperationType.Transfer);

        const balance_A_final_Transfer = await erc1410Facet.balanceOf(signer_A.address);
        const balance_B_final_Transfer = await erc1410Facet.balanceOf(signer_B.address);

        // Redeem

        await clearingFacet.clearingRedeemByPartition(clearingOperation, _AMOUNT);
        clearingIdentifier.clearingOperationType = ClearingOperationType.Redeem;

        await expect(clearingActionsFacet.cancelClearingOperationByPartition(clearingIdentifier))
          .to.emit(clearingActionsFacet, "ClearingOperationCanceled")
          .withArgs(signer_A.address, signer_A.address, _PARTITION_ID_1, 1, ClearingOperationType.Redeem);

        const balance_A_final_Redeem = await erc1410Facet.balanceOf(signer_A.address);
        const balance_B_final_Redeem = await erc1410Facet.balanceOf(signer_B.address);

        // HoldCreate
        await clearingFacet.clearingCreateHoldByPartition(clearingOperation, hold);

        clearingIdentifier.clearingOperationType = ClearingOperationType.HoldCreation;

        await expect(clearingActionsFacet.cancelClearingOperationByPartition(clearingIdentifier))
          .to.emit(clearingActionsFacet, "ClearingOperationCanceled")
          .withArgs(signer_A.address, signer_A.address, _PARTITION_ID_1, 1, ClearingOperationType.HoldCreation);

        const balance_A_final_HoldCreation = await erc1410Facet.balanceOf(signer_A.address);
        const balance_B_final_HoldCreation = await erc1410Facet.balanceOf(signer_B.address);

        expect(balance_B_final_Transfer.toNumber()).to.equal(balance_B_original.toNumber());
        expect(balance_A_final_Transfer.toNumber()).to.equal(balance_A_original.toNumber());
        expect(balance_B_final_Redeem.toNumber()).to.equal(balance_B_original.toNumber());
        expect(balance_A_final_Redeem.toNumber()).to.equal(balance_A_original.toNumber());
        expect(balance_B_final_HoldCreation.toNumber()).to.equal(balance_B_original.toNumber());
        expect(balance_A_final_HoldCreation.toNumber()).to.equal(balance_A_original.toNumber());
      });

      it("GIVEN a Token WHEN clearing operation recalimed THEN transaction succeeds", async () => {
        const balance_A_original = await erc1410Facet.balanceOf(signer_A.address);
        const balance_B_original = await erc1410Facet.balanceOf(signer_B.address);

        // Transfer
        await clearingFacet.clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address);

        clearingIdentifier.clearingId = 1;

        clearingIdentifier.clearingOperationType = ClearingOperationType.Transfer;

        await timeTravelFacet.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

        await expect(clearingActionsFacet.reclaimClearingOperationByPartition(clearingIdentifier))
          .to.emit(clearingActionsFacet, "ClearingOperationReclaimed")
          .withArgs(signer_A.address, signer_A.address, _PARTITION_ID_1, 1, ClearingOperationType.Transfer);

        const balance_A_final_Transfer = await erc1410Facet.balanceOf(signer_A.address);
        const balance_B_final_Transfer = await erc1410Facet.balanceOf(signer_B.address);

        await timeTravelFacet.changeSystemTimestamp(1);

        // Redeem

        await clearingFacet.clearingRedeemByPartition(clearingOperation, _AMOUNT);
        clearingIdentifier.clearingOperationType = ClearingOperationType.Redeem;

        await timeTravelFacet.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

        await expect(clearingActionsFacet.reclaimClearingOperationByPartition(clearingIdentifier))
          .to.emit(clearingActionsFacet, "ClearingOperationReclaimed")
          .withArgs(signer_A.address, signer_A.address, _PARTITION_ID_1, 1, ClearingOperationType.Redeem);

        const balance_A_final_Redeem = await erc1410Facet.balanceOf(signer_A.address);
        const balance_B_final_Redeem = await erc1410Facet.balanceOf(signer_B.address);

        await timeTravelFacet.changeSystemTimestamp(1);

        // HoldCreate
        await clearingFacet.clearingCreateHoldByPartition(clearingOperation, hold);

        clearingIdentifier.clearingOperationType = ClearingOperationType.HoldCreation;

        await timeTravelFacet.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

        await expect(clearingActionsFacet.reclaimClearingOperationByPartition(clearingIdentifier))
          .to.emit(clearingActionsFacet, "ClearingOperationReclaimed")
          .withArgs(signer_A.address, signer_A.address, _PARTITION_ID_1, 1, ClearingOperationType.HoldCreation);

        const balance_A_final_HoldCreation = await erc1410Facet.balanceOf(signer_A.address);
        const balance_B_final_HoldCreation = await erc1410Facet.balanceOf(signer_B.address);

        expect(balance_B_final_Transfer.toNumber()).to.equal(balance_B_original.toNumber());
        expect(balance_A_final_Transfer.toNumber()).to.equal(balance_A_original.toNumber());
        expect(balance_B_final_Redeem.toNumber()).to.equal(balance_B_original.toNumber());
        expect(balance_A_final_Redeem.toNumber()).to.equal(balance_A_original.toNumber());
        expect(balance_B_final_HoldCreation.toNumber()).to.equal(balance_B_original.toNumber());
        expect(balance_A_final_HoldCreation.toNumber()).to.equal(balance_A_original.toNumber());
      });

      it("GIVEN a token WHEN clearing operation reclaimed or canceled THEN allowance is restored", async () => {
        // RECLAIM
        await erc20Facet.connect(signer_A).increaseAllowance(signer_B.address, 3 * _AMOUNT);

        await clearingFacet
          .connect(signer_B)
          .clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
        await clearingFacet.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT);
        await clearingFacet.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold);
        let allowance_B_Before = await erc20Facet.allowance(signer_A.address, signer_B.address);

        await timeTravelFacet.changeSystemTimestamp(clearingOperationFrom.clearingOperation.expirationTimestamp + 1);

        await expect(clearingActionsFacet.reclaimClearingOperationByPartition(clearingIdentifier))
          .to.emit(erc20Facet, "Approval")
          .withArgs(signer_A.address, signer_B.address, _AMOUNT);

        clearingIdentifier.clearingOperationType = ClearingOperationType.Redeem;
        await expect(clearingActionsFacet.reclaimClearingOperationByPartition(clearingIdentifier))
          .to.emit(erc20Facet, "Approval")
          .withArgs(signer_A.address, signer_B.address, 2 * _AMOUNT);

        clearingIdentifier.clearingOperationType = ClearingOperationType.HoldCreation;
        await expect(clearingActionsFacet.reclaimClearingOperationByPartition(clearingIdentifier))
          .to.emit(erc20Facet, "Approval")
          .withArgs(signer_A.address, signer_B.address, 3 * _AMOUNT);

        expect(await erc20Facet.allowance(signer_A.address, signer_B.address)).to.be.equal(3 * _AMOUNT);
        expect(allowance_B_Before).to.be.equal(ZERO);

        // CANCEL
        await timeTravelFacet.resetSystemTimestamp();

        await clearingFacet
          .connect(signer_B)
          .clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
        await clearingFacet.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT);
        await clearingFacet.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold);

        allowance_B_Before = await erc20Facet.allowance(signer_A.address, signer_B.address);

        clearingIdentifier.clearingOperationType = ClearingOperationType.Transfer;
        clearingIdentifier.clearingId = 2;
        await expect(clearingActionsFacet.cancelClearingOperationByPartition(clearingIdentifier))
          .to.emit(erc20Facet, "Approval")
          .withArgs(signer_A.address, signer_B.address, _AMOUNT);

        clearingIdentifier.clearingOperationType = ClearingOperationType.Redeem;
        await expect(clearingActionsFacet.cancelClearingOperationByPartition(clearingIdentifier))
          .to.emit(erc20Facet, "Approval")
          .withArgs(signer_A.address, signer_B.address, 2 * _AMOUNT);

        clearingIdentifier.clearingOperationType = ClearingOperationType.HoldCreation;
        await expect(clearingActionsFacet.cancelClearingOperationByPartition(clearingIdentifier))
          .to.emit(erc20Facet, "Approval")
          .withArgs(signer_A.address, signer_B.address, 3 * _AMOUNT);

        expect(await erc20Facet.allowance(signer_A.address, signer_B.address)).to.be.equal(3 * _AMOUNT);
        expect(allowance_B_Before).to.be.equal(ZERO);
      });
    });

    describe("Balance Adjustments", () => {
      async function setPreBalanceAdjustment() {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ADJUSTMENT_BALANCE_ROLE, signer_C.address);
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);
      }

      it("GIVEN a clearing WHEN adjustBalances THEN clearing amount gets updated succeeds", async () => {
        await setPreBalanceAdjustment();

        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 7 * _AMOUNT,
          data: EMPTY_HEX_BYTES,
        });

        const balance_Before = await erc1410Facet.balanceOf(signer_A.address);
        const balance_Before_Partition_1 = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

        // CLEARING TRANSFER
        clearingOperation.partition = _PARTITION_ID_1;
        await clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet
          .connect(signer_B)
          .clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_B.address);

        await erc1410Facet.connect(signer_A).authorizeOperator(signer_B.address);
        await clearingFacet
          .connect(signer_B)
          .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_B.address);
        await clearingFacet.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold);

        await clearingFacet.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold);
        await clearingFacet.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT);

        await clearingFacet.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT);

        const cleared_TotalAmount_Before = await clearingFacet.getClearedAmountFor(signer_A.address);
        const cleared_TotalAmount_Before_Partition_1 = await clearingFacet.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const cleared_Before = await clearingFacet.getClearingTransferForByPartition(
          clearingIdentifier.partition,
          clearingIdentifier.tokenHolder,
          clearingIdentifier.clearingId,
        );

        // adjustBalances
        await adjustBalancesFacet.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

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
        await equityFacet.connect(signer_A).setScheduledBalanceAdjustment(balanceAdjustmentData);
        await equityFacet.connect(signer_A).setScheduledBalanceAdjustment(balanceAdjustmentData_2);

        // wait for first scheduled balance adjustment only
        await timeTravelFacet.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:00:03Z"));

        const cleared_TotalAmount_After = await clearingFacet.getClearedAmountFor(signer_A.address);
        const cleared_TotalAmount_After_Partition_1 = await clearingFacet.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const cleared_After = await clearingFacet.getClearingTransferForByPartition(
          clearingIdentifier.partition,
          clearingIdentifier.tokenHolder,
          clearingIdentifier.clearingId,
        );
        const balance_After = await erc1410Facet.balanceOf(signer_A.address);
        const balance_After_Partition_1 = await erc1410Facet.balanceOfByPartition(_DEFAULT_PARTITION, signer_A.address);

        expect(cleared_TotalAmount_After).to.be.equal(cleared_TotalAmount_Before.mul(adjustFactor * adjustFactor));
        expect(cleared_TotalAmount_After_Partition_1).to.be.equal(
          cleared_TotalAmount_Before_Partition_1.mul(adjustFactor * adjustFactor),
        );
        expect(balance_After).to.be.equal(balance_Before.sub(9 * _AMOUNT).mul(adjustFactor * adjustFactor));

        expect(balance_After_Partition_1).to.be.equal(
          balance_Before_Partition_1.sub(9 * _AMOUNT).mul(adjustFactor * adjustFactor),
        );
        expect(cleared_After.amount).to.be.equal(cleared_Before.amount.mul(adjustFactor * adjustFactor));
      });

      it("GIVEN a clearing WHEN adjustBalances THEN approve succeed", async () => {
        await setPreBalanceAdjustment();

        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 7 * _AMOUNT,
          data: EMPTY_HEX_BYTES,
        });

        const balance_Before_A = await erc1410Facet.balanceOf(signer_A.address);
        const balance_Before_Partition_1_A = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
        const balance_Before_C = await erc1410Facet.balanceOf(signer_C.address);
        const balance_Before_Partition_1_C = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_C.address);

        // CLEARING TRANSFER
        clearingOperation.partition = _PARTITION_ID_1;
        await clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet
          .connect(signer_B)
          .clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);

        await erc1410Facet.connect(signer_A).authorizeOperator(signer_B.address);
        await clearingFacet
          .connect(signer_B)
          .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
        // CLEARING CREATE HOLD
        await clearingFacet.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold);
        await clearingFacet.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold);
        // CLEARING REDEEM
        await clearingFacet.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT);
        await clearingFacet.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT);

        const cleared_Amount_Before = await clearingFacet.getClearedAmountFor(signer_A.address);
        const cleared_Amount_Before_Partition_1 = await clearingFacet.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        const held_Amount_Before = await holdFacet.getHeldAmountFor(signer_A.address);
        const held_Amount_Before_Partition_1 = await holdFacet.getHeldAmountFor(signer_A.address);

        // adjustBalances
        await adjustBalancesFacet.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

        // APPROVE CLEARINGS
        for (let opTypeId = 1; opTypeId <= 3; opTypeId++) {
          clearingIdentifier.clearingOperationType = getOpType(opTypeId);
          for (let i = 1; i <= 3; i++) {
            clearingIdentifier.clearingId = i;
            await clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifier);
          }
        }

        const balance_After_Approve_A = await erc1410Facet.balanceOf(signer_A.address);
        const balance_After_Approve_Partition_1_A = await erc1410Facet.balanceOfByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const balance_After_Approve_C = await erc1410Facet.balanceOf(signer_C.address);
        const balance_After_Approve_Partition_1_C = await erc1410Facet.balanceOfByPartition(
          _PARTITION_ID_1,
          signer_C.address,
        );
        const cleared_Amount_After = await clearingFacet.getClearedAmountFor(signer_A.address);
        const cleared_Amount_After_Partition_1 = await clearingFacet.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const held_Amount_After = await holdFacet.getHeldAmountFor(signer_A.address);
        const held_Amount_After_Partition_1 = await holdFacet.getHeldAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        expect(balance_After_Approve_A).to.be.equal(balance_Before_A.sub(9 * _AMOUNT).mul(adjustFactor));
        expect(balance_After_Approve_C).to.be.equal(balance_Before_C.add(3 * _AMOUNT).mul(adjustFactor));
        expect(balance_After_Approve_Partition_1_A).to.be.equal(
          balance_Before_Partition_1_A.sub(9 * _AMOUNT).mul(adjustFactor),
        );
        expect(balance_After_Approve_Partition_1_C).to.be.equal(
          balance_Before_Partition_1_C.add(3 * _AMOUNT).mul(adjustFactor),
        );
        expect(cleared_Amount_After).to.be.equal(cleared_Amount_Before.sub(9 * _AMOUNT).mul(adjustFactor));
        expect(cleared_Amount_After_Partition_1).to.be.equal(
          cleared_Amount_Before_Partition_1.sub(9 * _AMOUNT).mul(adjustFactor),
        );
        expect(held_Amount_After).to.be.equal(held_Amount_Before.add(3 * _AMOUNT).mul(adjustFactor));
        expect(held_Amount_After_Partition_1).to.be.equal(
          held_Amount_Before_Partition_1.add(3 * _AMOUNT).mul(adjustFactor),
        );
        expect(balance_After_Approve_A.add(cleared_Amount_After)).to.be.equal(
          balance_Before_A.sub(9 * _AMOUNT).mul(adjustFactor),
        );
        expect(balance_After_Approve_Partition_1_A.add(cleared_Amount_After_Partition_1)).to.be.equal(
          balance_Before_Partition_1_A.sub(9 * _AMOUNT).mul(adjustFactor),
        );
      });

      it("GIVEN a clearing WHEN adjustBalances THEN cancel succeed", async () => {
        await setPreBalanceAdjustment();

        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 7 * _AMOUNT,
          data: EMPTY_HEX_BYTES,
        });

        const balance_Before_A = await erc1410Facet.balanceOf(signer_A.address);
        const balance_Before_Partition_1_A = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
        const balance_Before_C = await erc1410Facet.balanceOf(signer_C.address);
        const balance_Before_Partition_1_C = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_C.address);

        // CLEARING TRANSFER
        clearingOperation.partition = _PARTITION_ID_1;
        await clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet
          .connect(signer_B)
          .clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);

        await erc1410Facet.connect(signer_A).authorizeOperator(signer_B.address);
        await clearingFacet
          .connect(signer_B)
          .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
        // CLEARING CREATE HOLD
        await clearingFacet.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold);
        await clearingFacet.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold);
        // CLEARING REDEEM
        await clearingFacet.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT);
        await clearingFacet.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT);

        const cleared_Amount_Before = await clearingFacet.getClearedAmountFor(signer_A.address);
        const cleared_Amount_Before_Partition_1 = await clearingFacet.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        const held_Amount_Before = await holdFacet.getHeldAmountFor(signer_A.address);
        const held_Amount_Before_Partition_1 = await holdFacet.getHeldAmountFor(signer_A.address);

        // adjustBalances
        await adjustBalancesFacet.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

        // CANCEL CLEARINGS
        for (let opTypeId = 1; opTypeId <= 3; opTypeId++) {
          clearingIdentifier.clearingOperationType = getOpType(opTypeId);
          for (let i = 1; i <= 3; i++) {
            clearingIdentifier.clearingId = i;
            await clearingActionsFacet.cancelClearingOperationByPartition(clearingIdentifier);
          }
        }

        const balance_After_Cancel_A = await erc1410Facet.balanceOf(signer_A.address);
        const balance_After_Cancel_Partition_1_A = await erc1410Facet.balanceOfByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const balance_After_Cancel_C = await erc1410Facet.balanceOf(signer_C.address);
        const balance_After_Cancel_Partition_1_C = await erc1410Facet.balanceOfByPartition(
          _PARTITION_ID_1,
          signer_C.address,
        );
        const cleared_Amount_After = await clearingFacet.getClearedAmountFor(signer_A.address);
        const cleared_Amount_After_Partition_1 = await clearingFacet.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const held_Amount_After = await holdFacet.getHeldAmountFor(signer_A.address);
        const held_Amount_After_Partition_1 = await holdFacet.getHeldAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        expect(balance_After_Cancel_A).to.be.equal(balance_Before_A.mul(adjustFactor));
        expect(balance_After_Cancel_C).to.be.equal(balance_Before_C.mul(adjustFactor));
        expect(balance_After_Cancel_Partition_1_A).to.be.equal(balance_Before_Partition_1_A.mul(adjustFactor));
        expect(balance_After_Cancel_Partition_1_C).to.be.equal(balance_Before_Partition_1_C.mul(adjustFactor));
        expect(cleared_Amount_After).to.be.equal(cleared_Amount_Before.sub(9 * _AMOUNT).mul(adjustFactor));
        expect(cleared_Amount_After_Partition_1).to.be.equal(
          cleared_Amount_Before_Partition_1.sub(9 * _AMOUNT).mul(adjustFactor),
        );
        expect(held_Amount_After).to.be.equal(held_Amount_Before.mul(adjustFactor));
        expect(held_Amount_After_Partition_1).to.be.equal(held_Amount_Before_Partition_1.mul(adjustFactor));
        expect(balance_After_Cancel_A.add(cleared_Amount_After)).to.be.equal(balance_Before_A.mul(adjustFactor));
        expect(balance_After_Cancel_Partition_1_A.add(cleared_Amount_After_Partition_1)).to.be.equal(
          balance_Before_Partition_1_A.mul(adjustFactor),
        );
      });

      it("GIVEN a clearing WHEN adjustBalances THEN reclaim succeed", async () => {
        await setPreBalanceAdjustment();

        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 7 * _AMOUNT,
          data: EMPTY_HEX_BYTES,
        });

        const balance_Before_A = await erc1410Facet.balanceOf(signer_A.address);
        const balance_Before_Partition_1_A = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);
        const balance_Before_C = await erc1410Facet.balanceOf(signer_C.address);
        const balance_Before_Partition_1_C = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_C.address);

        // CLEARING TRANSFER
        clearingOperation.partition = _PARTITION_ID_1;
        await clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet
          .connect(signer_B)
          .clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);

        await erc1410Facet.connect(signer_A).authorizeOperator(signer_B.address);
        await clearingFacet
          .connect(signer_B)
          .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
        // CLEARING CREATE HOLD
        await clearingFacet.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold);
        await clearingFacet.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold);
        // CLEARING REDEEM
        await clearingFacet.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT);
        await clearingFacet.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT);

        const cleared_Amount_Before = await clearingFacet.getClearedAmountFor(signer_A.address);
        const cleared_Amount_Before_Partition_1 = await clearingFacet.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        const held_Amount_Before = await holdFacet.getHeldAmountFor(signer_A.address);
        const held_Amount_Before_Partition_1 = await holdFacet.getHeldAmountFor(signer_A.address);

        // adjustBalances
        await adjustBalancesFacet.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

        await timeTravelFacet.changeSystemTimestamp(clearingOperation.expirationTimestamp + 1);

        // RECLAIM CLEARINGS
        for (let opTypeId = 1; opTypeId <= 3; opTypeId++) {
          clearingIdentifier.clearingOperationType = getOpType(opTypeId);
          for (let i = 1; i <= 3; i++) {
            clearingIdentifier.clearingId = i;
            await clearingActionsFacet.reclaimClearingOperationByPartition(clearingIdentifier);
          }
        }

        const balance_After_Cancel_A = await erc1410Facet.balanceOf(signer_A.address);
        const balance_After_Cancel_Partition_1_A = await erc1410Facet.balanceOfByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const balance_After_Cancel_C = await erc1410Facet.balanceOf(signer_C.address);
        const balance_After_Cancel_Partition_1_C = await erc1410Facet.balanceOfByPartition(
          _PARTITION_ID_1,
          signer_C.address,
        );
        const cleared_Amount_After = await clearingFacet.getClearedAmountFor(signer_A.address);
        const cleared_Amount_After_Partition_1 = await clearingFacet.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const held_Amount_After = await holdFacet.getHeldAmountFor(signer_A.address);
        const held_Amount_After_Partition_1 = await holdFacet.getHeldAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        expect(balance_After_Cancel_A).to.be.equal(balance_Before_A.mul(adjustFactor));
        expect(balance_After_Cancel_C).to.be.equal(balance_Before_C.mul(adjustFactor));
        expect(balance_After_Cancel_Partition_1_A).to.be.equal(balance_Before_Partition_1_A.mul(adjustFactor));
        expect(balance_After_Cancel_Partition_1_C).to.be.equal(balance_Before_Partition_1_C.mul(adjustFactor));
        expect(cleared_Amount_After).to.be.equal(cleared_Amount_Before.sub(9 * _AMOUNT).mul(adjustFactor));
        expect(cleared_Amount_After_Partition_1).to.be.equal(
          cleared_Amount_Before_Partition_1.sub(9 * _AMOUNT).mul(adjustFactor),
        );
        expect(held_Amount_After).to.be.equal(held_Amount_Before.mul(adjustFactor));
        expect(held_Amount_After_Partition_1).to.be.equal(held_Amount_Before_Partition_1.mul(adjustFactor));
        expect(balance_After_Cancel_A.add(cleared_Amount_After)).to.be.equal(balance_Before_A.mul(adjustFactor));
        expect(balance_After_Cancel_Partition_1_A.add(cleared_Amount_After_Partition_1)).to.be.equal(
          balance_Before_Partition_1_A.mul(adjustFactor),
        );
      });

      it("GIVEN a hold WHEN adjustBalances THEN clearing succeeds", async () => {
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 15 * _AMOUNT,
          data: EMPTY_HEX_BYTES,
        });
        await setPreBalanceAdjustment();
        const balance_Before = await erc1410Facet.balanceOf(signer_A.address);
        const balance_Before_Partition_1 = await erc1410Facet.balanceOfByPartition(_PARTITION_ID_1, signer_A.address);

        // CLEARING BEFORE BALANCE ADJUSTMENT
        // CLEARING TRANSFER
        clearingOperation.partition = _PARTITION_ID_1;
        await clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet
          .connect(signer_B)
          .clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);

        await erc1410Facet.connect(signer_A).authorizeOperator(signer_B.address);
        await clearingFacet
          .connect(signer_B)
          .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
        // CLEARING CREATE HOLD
        await clearingFacet.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold);
        await clearingFacet.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold);
        // CLEARING REDEEM
        await clearingFacet.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT);
        await clearingFacet.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT);

        const cleared_Amount_Before = await clearingFacet.getClearedAmountFor(signer_A.address);
        const cleared_Amount_Before_Partition_1 = await clearingFacet.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        // adjustBalances
        await adjustBalancesFacet.connect(signer_C).adjustBalances(adjustFactor, adjustDecimals);

        // CLEARING AFTER BALANCE ADJUSTMENT
        // CLEARING TRANSFER
        clearingOperation.partition = _PARTITION_ID_1;
        await clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet
          .connect(signer_B)
          .clearingTransferFromByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);

        await clearingFacet
          .connect(signer_B)
          .operatorClearingTransferByPartition(clearingOperationFrom, _AMOUNT, signer_C.address);
        // CLEARING CREATE HOLD
        await clearingFacet.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet.connect(signer_B).clearingCreateHoldFromByPartition(clearingOperationFrom, hold);
        await clearingFacet.connect(signer_B).operatorClearingCreateHoldByPartition(clearingOperationFrom, hold);
        // CLEARING REDEEM
        await clearingFacet.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        await erc20Facet.increaseAllowance(signer_B.address, _AMOUNT);
        await clearingFacet.connect(signer_B).clearingRedeemFromByPartition(clearingOperationFrom, _AMOUNT);
        await clearingFacet.connect(signer_B).operatorClearingRedeemByPartition(clearingOperationFrom, _AMOUNT);

        const balance_After_Clearing = await erc1410Facet.balanceOf(signer_A.address);
        const balance_After_Clearing_Partition_1 = await erc1410Facet.balanceOfByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );
        const cleared_Amount_After = await clearingFacet.getClearedAmountFor(signer_A.address);
        const cleared_Amount_After_Partition_1 = await clearingFacet.getClearedAmountForByPartition(
          _PARTITION_ID_1,
          signer_A.address,
        );

        expect(balance_After_Clearing).to.be.equal(
          balance_Before
            .sub(9 * _AMOUNT)
            .mul(adjustFactor)
            .sub(9 * _AMOUNT),
        );
        expect(balance_After_Clearing_Partition_1).to.be.equal(
          balance_Before_Partition_1
            .sub(9 * _AMOUNT)
            .mul(adjustFactor)
            .sub(9 * _AMOUNT),
        );
        expect(cleared_Amount_After).to.be.equal(cleared_Amount_Before.mul(adjustFactor).add(9 * _AMOUNT));
        expect(cleared_Amount_After_Partition_1).to.be.equal(
          cleared_Amount_Before_Partition_1.mul(adjustFactor).add(9 * _AMOUNT),
        );
        expect(balance_After_Clearing.add(cleared_Amount_After)).to.be.equal(balance_Before.mul(adjustFactor));
        expect(balance_After_Clearing_Partition_1.add(cleared_Amount_After_Partition_1)).to.be.equal(
          balance_Before_Partition_1.mul(adjustFactor),
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
        await clearingActionsFacet.deactivateClearing();

        // Issue tokens to signer_A so they can create a hold
        await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await erc1410Facet.issueByPartition({
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

        await holdFacet.connect(signer_A).createHoldByPartition(_DEFAULT_PARTITION, holdToCreate);

        // Now activate clearing
        await clearingActionsFacet.activateClearing();

        const holdId = 1;
        const holdIdentifierForTest = {
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          holdId: holdId,
        };

        // Execute hold - should succeed because executeHoldByPartition doesn't have onlyClearingDisabled modifier
        await expect(
          holdFacet.connect(signer_C).executeHoldByPartition(holdIdentifierForTest, signer_B.address, holdAmount),
        ).to.not.be.reverted;
      });

      it("GIVEN clearing is activated WHEN attempting releaseHold THEN transaction succeeds (releaseHold does not have onlyClearingDisabled modifier)", async () => {
        // First create a hold when clearing is not yet activated
        await clearingActionsFacet.deactivateClearing();

        // Issue tokens to signer_A so they can create a hold
        await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await erc1410Facet.issueByPartition({
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

        await holdFacet.connect(signer_A).createHoldByPartition(_DEFAULT_PARTITION, holdToCreate);

        // Now activate clearing
        await clearingActionsFacet.activateClearing();

        const holdId = 1;
        const holdIdentifierForTest = {
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          holdId: holdId,
        };

        // Release hold - should succeed because releaseHoldByPartition doesn't have onlyClearingDisabled modifier
        await expect(holdFacet.connect(signer_C).releaseHoldByPartition(holdIdentifierForTest, holdAmount)).to.not.be
          .reverted;
      });
    });

    describe("validateAddress modifier", () => {
      it("GIVEN zero address as destination WHEN calling clearingTransferByPartition THEN transaction fails with ZeroAddressNotAllowed", async () => {
        await expect(
          clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, ADDRESS_ZERO),
        ).to.be.revertedWithCustomError(clearingFacet, "ZeroAddressNotAllowed");
      });
    });

    describe("onlyUninitialized modifier", () => {
      it("GIVEN clearing already initialized WHEN calling initializeClearing THEN transaction fails with AlreadyInitialized", async () => {
        await expect(clearingActionsFacet.initializeClearing(true)).to.be.revertedWithCustomError(
          clearingActionsFacet,
          "AlreadyInitialized",
        );
      });
    });

    describe("onlyDefaultPartitionWithSinglePartition modifier", () => {
      it("GIVEN non-default partition WHEN calling cancelClearingOperationByPartition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        const wrongPartitionIdentifier = {
          ...clearingIdentifier,
          partition: _WRONG_PARTITION,
        };

        await expect(
          clearingActionsFacet.cancelClearingOperationByPartition(wrongPartitionIdentifier),
        ).to.be.revertedWithCustomError(clearingActionsFacet, "PartitionNotAllowedInSinglePartitionMode");
      });

      it("GIVEN non-default partition WHEN calling reclaimClearingOperationByPartition THEN transaction fails with PartitionNotAllowedInSinglePartitionMode", async () => {
        const wrongPartitionIdentifier = {
          ...clearingIdentifier,
          partition: _WRONG_PARTITION,
        };

        await expect(
          clearingActionsFacet.reclaimClearingOperationByPartition(wrongPartitionIdentifier),
        ).to.be.revertedWithCustomError(clearingActionsFacet, "PartitionNotAllowedInSinglePartitionMode");
      });
    });

    describe("onlyUnrecoveredAddress modifier", () => {
      describe("clearingCreateHoldByPartition", () => {
        it("GIVEN a recovered msgSender WHEN calling clearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
          // Grant _AGENT_ROLE to call recoveryAddress
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          // First recover signer_A's address
          await erc3643ManagementFacet.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          // Try to create clearing hold with recovered address
          await expect(
            clearingFacet.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });

        it("GIVEN a recovered hold.to address WHEN calling clearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
          // Grant _AGENT_ROLE to call recoveryAddress
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          // Recover the hold.to address (signer_C - the actual hold.to)
          await erc3643ManagementFacet.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);

          // Try to create clearing hold with recovered hold.to
          await expect(
            clearingFacet.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });
      });

      describe("clearingCreateHoldFromByPartition", () => {
        it("GIVEN a recovered msgSender WHEN calling clearingCreateHoldFromByPartition THEN transaction fails with WalletRecovered", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          await erc3643ManagementFacet.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet.connect(signer_A).clearingCreateHoldFromByPartition(clearingOperationFromB, hold),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });

        it("GIVEN a recovered hold.to WHEN calling clearingCreateHoldFromByPartition THEN transaction fails with WalletRecovered", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          // Recover the hold.to address (signer_C)
          await erc3643ManagementFacet.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet.connect(signer_A).clearingCreateHoldFromByPartition(clearingOperationFromB, hold),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });

        it("GIVEN a recovered from address WHEN calling clearingCreateHoldFromByPartition THEN transaction fails with WalletRecovered", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          await erc3643ManagementFacet.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet.connect(signer_A).clearingCreateHoldFromByPartition(clearingOperationFromB, hold),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });
      });

      describe("operatorClearingCreateHoldByPartition", () => {
        it("GIVEN a recovered msgSender WHEN calling operatorClearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          await erc3643ManagementFacet.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet.connect(signer_A).operatorClearingCreateHoldByPartition(clearingOperationFromB, hold),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });

        it("GIVEN a recovered from address WHEN calling operatorClearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          await erc3643ManagementFacet.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet.connect(signer_A).operatorClearingCreateHoldByPartition(clearingOperationFromB, hold),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });

        it("GIVEN a recovered hold.to WHEN calling operatorClearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
          // Give signer_B some tokens and authorize operator
          await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
          await erc1410Facet.issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_B.address,
            value: _AMOUNT,
            data: _DATA,
          });
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          // Recover the hold.to address (signer_C - the actual hold.to)
          await erc3643ManagementFacet.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet.connect(signer_A).operatorClearingCreateHoldByPartition(clearingOperationFromB, hold),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });
      });

      describe("clearingRedeemByPartition", () => {
        it("GIVEN a recovered msgSender WHEN calling clearingRedeemByPartition THEN transaction fails with WalletRecovered", async () => {
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          await erc3643ManagementFacet.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          await expect(
            clearingFacet.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });
      });

      describe("clearingRedeemFromByPartition", () => {
        it("GIVEN a recovered msgSender WHEN calling clearingRedeemFromByPartition THEN transaction fails with WalletRecovered", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          await erc3643ManagementFacet.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet.connect(signer_A).clearingRedeemFromByPartition(clearingOperationFromB, _AMOUNT),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });

        it("GIVEN a recovered from address WHEN calling clearingRedeemFromByPartition THEN transaction fails with WalletRecovered", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          await erc3643ManagementFacet.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet.connect(signer_A).clearingRedeemFromByPartition(clearingOperationFromB, _AMOUNT),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });
      });

      describe("operatorClearingRedeemByPartition", () => {
        it("GIVEN a recovered msgSender WHEN calling operatorClearingRedeemByPartition THEN transaction fails with WalletRecovered", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          await erc3643ManagementFacet.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet.connect(signer_A).operatorClearingRedeemByPartition(clearingOperationFromB, _AMOUNT),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });

        it("GIVEN a recovered from address WHEN calling operatorClearingRedeemByPartition THEN transaction fails with WalletRecovered", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          await erc3643ManagementFacet.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet.connect(signer_A).operatorClearingRedeemByPartition(clearingOperationFromB, _AMOUNT),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });
      });

      describe("clearingTransferByPartition", () => {
        it("GIVEN a recovered msgSender WHEN calling clearingTransferByPartition THEN transaction fails with WalletRecovered", async () => {
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          await erc3643ManagementFacet.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          await expect(
            clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });

        it("GIVEN a recovered to address WHEN calling clearingTransferByPartition THEN transaction fails with WalletRecovered", async () => {
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          await erc3643ManagementFacet.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);

          await expect(
            clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });
      });

      describe("clearingTransferFromByPartition", () => {
        it("GIVEN a recovered msgSender WHEN calling clearingTransferFromByPartition THEN transaction fails with WalletRecovered", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          await erc3643ManagementFacet.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet
              .connect(signer_A)
              .clearingTransferFromByPartition(clearingOperationFromB, _AMOUNT, signer_C.address),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });

        it("GIVEN a recovered to address WHEN calling clearingTransferFromByPartition THEN transaction fails with WalletRecovered", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          await erc3643ManagementFacet.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet
              .connect(signer_A)
              .clearingTransferFromByPartition(clearingOperationFromB, _AMOUNT, signer_C.address),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });

        it("GIVEN a recovered from address WHEN calling clearingTransferFromByPartition THEN transaction fails with WalletRecovered", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          await erc3643ManagementFacet.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet
              .connect(signer_A)
              .clearingTransferFromByPartition(clearingOperationFromB, _AMOUNT, signer_C.address),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });
      });

      describe("operatorClearingTransferByPartition", () => {
        it("GIVEN a recovered msgSender WHEN calling operatorClearingTransferByPartition THEN transaction fails with WalletRecovered", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          await erc3643ManagementFacet.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet
              .connect(signer_A)
              .operatorClearingTransferByPartition(clearingOperationFromB, _AMOUNT, signer_C.address),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });

        it("GIVEN a recovered to address WHEN calling operatorClearingTransferByPartition THEN transaction fails with WalletRecovered", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          await erc3643ManagementFacet.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet
              .connect(signer_A)
              .operatorClearingTransferByPartition(clearingOperationFromB, _AMOUNT, signer_C.address),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });

        it("GIVEN a recovered from address WHEN calling operatorClearingTransferByPartition THEN transaction fails with WalletRecovered", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
          await erc3643ManagementFacet.recoveryAddress(signer_B.address, signer_D.address, ADDRESS_ZERO);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet
              .connect(signer_A)
              .operatorClearingTransferByPartition(clearingOperationFromB, _AMOUNT, signer_C.address),
          ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
        });
      });
    });

    describe("onlyUnProtectedPartitionsOrWildCardRole modifier", () => {
      beforeEach(async () => {
        // Grant _PROTECTED_PARTITIONS_ROLE to call protectPartitions
        await accessControlFacet.grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
        // Protect partitions
        protectedPartitionsFacet = await ethers.getContractAt("ProtectedPartitions", diamond.address);
        await protectedPartitionsFacet.protectPartitions();
      });

      it("GIVEN protected partitions without wildcard role WHEN calling clearingCreateHoldByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        // Try to create clearing hold without having wildcard role
        await expect(
          clearingFacet.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold),
        ).to.be.revertedWithCustomError(clearingFacet, "PartitionsAreProtectedAndNoRole");
      });

      it("GIVEN protected partitions with wildcard role WHEN calling clearingCreateHoldByPartition THEN transaction succeeds", async () => {
        // Grant wildcard role to signer_A
        await accessControlFacet.grantRole(ATS_ROLES._WILD_CARD_ROLE, signer_A.address);

        // Should succeed now
        await expect(clearingFacet.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold)).to.not.be
          .reverted;
      });

      it("GIVEN protected partitions without wildcard role WHEN calling clearingCreateHoldFromByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        // Grant allowance for clearing from
        await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);

        const clearingOperationFromB = {
          ...clearingOperationFrom,
          from: signer_B.address,
        };

        // Try to create clearing hold from without having wildcard role
        await expect(
          clearingFacet.connect(signer_A).clearingCreateHoldFromByPartition(clearingOperationFromB, hold),
        ).to.be.revertedWithCustomError(clearingFacet, "PartitionsAreProtectedAndNoRole");
      });

      it("GIVEN protected partitions without wildcard role WHEN calling operatorClearingCreateHoldByPartition THEN transaction fails with PartitionsAreProtectedAndNoRole", async () => {
        // Make signer_A an operator
        await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);

        const clearingOperationFromB = {
          ...clearingOperationFrom,
          from: signer_B.address,
        };

        // Try to create operator clearing hold without having wildcard role
        await expect(
          clearingFacet.connect(signer_A).operatorClearingCreateHoldByPartition(clearingOperationFromB, hold),
        ).to.be.revertedWithCustomError(clearingFacet, "PartitionsAreProtectedAndNoRole");
      });

      describe("additional clearing methods", () => {
        it("GIVEN protected partitions with wildcard role WHEN calling clearingCreateHoldFromByPartition THEN transaction succeeds", async () => {
          // Give signer_B some tokens
          await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
          await erc1410Facet.issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_B.address,
            value: _AMOUNT,
            data: _DATA,
          });
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._WILD_CARD_ROLE, signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          // Need to increase allowance for signer_A from signer_B
          await erc20Facet.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);

          await clearingFacet.connect(signer_A).clearingCreateHoldFromByPartition(clearingOperationFromB, hold);
        });

        it("GIVEN protected partitions with wildcard role WHEN calling operatorClearingCreateHoldByPartition THEN transaction succeeds", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._WILD_CARD_ROLE, signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await clearingFacet.connect(signer_A).operatorClearingCreateHoldByPartition(clearingOperationFromB, hold);
        });

        it("GIVEN protected partitions without wildcard role WHEN calling clearingRedeemByPartition THEN transaction fails", async () => {
          await expect(
            clearingFacet.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT),
          ).to.be.revertedWithCustomError(clearingFacet, "PartitionsAreProtectedAndNoRole");
        });

        it("GIVEN protected partitions with wildcard role WHEN calling clearingRedeemByPartition THEN transaction succeeds", async () => {
          await accessControlFacet.grantRole(ATS_ROLES._WILD_CARD_ROLE, signer_A.address);

          await clearingFacet.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);
        });

        it("GIVEN protected partitions without wildcard role WHEN calling clearingRedeemFromByPartition THEN transaction fails", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet.connect(signer_A).clearingRedeemFromByPartition(clearingOperationFromB, _AMOUNT),
          ).to.be.revertedWithCustomError(clearingFacet, "PartitionsAreProtectedAndNoRole");
        });

        it("GIVEN protected partitions with wildcard role WHEN calling clearingRedeemFromByPartition THEN transaction succeeds", async () => {
          // Give signer_B some tokens
          await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
          await erc1410Facet.issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_B.address,
            value: _AMOUNT,
            data: _DATA,
          });
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._WILD_CARD_ROLE, signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          // Need to increase allowance for signer_A from signer_B
          await erc20Facet.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);

          await clearingFacet.connect(signer_A).clearingRedeemFromByPartition(clearingOperationFromB, _AMOUNT);
        });

        it("GIVEN protected partitions without wildcard role WHEN calling operatorClearingRedeemByPartition THEN transaction fails", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet.connect(signer_A).operatorClearingRedeemByPartition(clearingOperationFromB, _AMOUNT),
          ).to.be.revertedWithCustomError(clearingFacet, "PartitionsAreProtectedAndNoRole");
        });

        it("GIVEN protected partitions with wildcard role WHEN calling operatorClearingRedeemByPartition THEN transaction succeeds", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._WILD_CARD_ROLE, signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await clearingFacet.connect(signer_A).operatorClearingRedeemByPartition(clearingOperationFromB, _AMOUNT);
        });

        it("GIVEN protected partitions without wildcard role WHEN calling clearingTransferByPartition THEN transaction fails", async () => {
          await expect(
            clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address),
          ).to.be.revertedWithCustomError(clearingFacet, "PartitionsAreProtectedAndNoRole");
        });

        it("GIVEN protected partitions with wildcard role WHEN calling clearingTransferByPartition THEN transaction succeeds", async () => {
          await accessControlFacet.grantRole(ATS_ROLES._WILD_CARD_ROLE, signer_A.address);

          await clearingFacet
            .connect(signer_A)
            .clearingTransferByPartition(clearingOperation, _AMOUNT, signer_B.address);
        });

        it("GIVEN protected partitions without wildcard role WHEN calling clearingTransferFromByPartition THEN transaction fails", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet
              .connect(signer_A)
              .clearingTransferFromByPartition(clearingOperationFromB, _AMOUNT, signer_C.address),
          ).to.be.revertedWithCustomError(clearingFacet, "PartitionsAreProtectedAndNoRole");
        });

        it("GIVEN protected partitions with wildcard role WHEN calling clearingTransferFromByPartition THEN transaction succeeds", async () => {
          // Give signer_B some tokens
          await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
          await erc1410Facet.issueByPartition({
            partition: _DEFAULT_PARTITION,
            tokenHolder: signer_B.address,
            value: _AMOUNT,
            data: _DATA,
          });
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._WILD_CARD_ROLE, signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          // Need to increase allowance for signer_A from signer_B
          await erc20Facet.connect(signer_B).increaseAllowance(signer_A.address, _AMOUNT);

          await clearingFacet
            .connect(signer_A)
            .clearingTransferFromByPartition(clearingOperationFromB, _AMOUNT, signer_C.address);
        });

        it("GIVEN protected partitions without wildcard role WHEN calling operatorClearingTransferByPartition THEN transaction fails", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await expect(
            clearingFacet
              .connect(signer_A)
              .operatorClearingTransferByPartition(clearingOperationFromB, _AMOUNT, signer_C.address),
          ).to.be.revertedWithCustomError(clearingFacet, "PartitionsAreProtectedAndNoRole");
        });

        it("GIVEN protected partitions with wildcard role WHEN calling operatorClearingTransferByPartition THEN transaction succeeds", async () => {
          await erc1410Facet.connect(signer_B).authorizeOperator(signer_A.address);
          await accessControlFacet.grantRole(ATS_ROLES._WILD_CARD_ROLE, signer_A.address);

          const clearingOperationFromB = {
            ...clearingOperationFrom,
            from: signer_B.address,
          };

          await clearingFacet
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
          clearingFacet.protectedClearingTransferByPartition(
            protectedClearingOperation,
            _AMOUNT,
            signer_B.address,
            signature,
          ),
        ).to.be.revertedWithCustomError(clearingFacet, "PartitionsAreUnProtected");
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
          clearingFacet.protectedClearingRedeemByPartition(protectedClearingOperation, _AMOUNT, signature),
        ).to.be.revertedWithCustomError(clearingFacet, "PartitionsAreUnProtected");
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
          clearingFacet.protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, signature),
        ).to.be.revertedWithCustomError(clearingFacet, "PartitionsAreUnProtected");
      });
    });

    describe("onlyUnpaused modifier for protected clearing functions", () => {
      beforeEach(async () => {
        await pauseFacet.pause();
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
          clearingFacet.protectedClearingTransferByPartition(
            protectedClearingOperation,
            _AMOUNT,
            signer_B.address,
            signature,
          ),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
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
          clearingFacet.protectedClearingRedeemByPartition(protectedClearingOperation, _AMOUNT, signature),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
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
          clearingFacet.protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, signature),
        ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
      });
    });

    describe("onlyUnrecoveredAddress modifier for protectedClearingCreateHoldByPartition", () => {
      it("GIVEN a recovered from address WHEN calling protectedClearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
        await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
        await erc3643ManagementFacet.recoveryAddress(signer_A.address, signer_D.address, ADDRESS_ZERO);

        const protectedClearingOperation = {
          clearingOperation: clearingOperation,
          from: signer_A.address,
          deadline: expirationTimestamp,
          nonce: 1,
        };

        const signature = "0x1234"; // Dummy signature

        await expect(
          clearingFacet.protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, signature),
        ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
      });

      it("GIVEN a recovered hold.to address WHEN calling protectedClearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
        await accessControlFacet.grantRole(ATS_ROLES._AGENT_ROLE, signer_A.address);
        // Recover the hold.to address (signer_C)
        await erc3643ManagementFacet.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);

        const protectedClearingOperation = {
          clearingOperation: clearingOperation,
          from: signer_A.address,
          deadline: expirationTimestamp,
          nonce: 1,
        };

        const signature = "0x1234"; // Dummy signature

        await expect(
          clearingFacet.protectedClearingCreateHoldByPartition(protectedClearingOperation, hold, signature),
        ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
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
          clearingFacet.clearingTransferByPartition(clearingOperation_wrong_partition, _AMOUNT, signer_B.address),
        ).to.be.revertedWithCustomError(erc1410Facet, "InvalidPartition");
        await erc1410Facet.authorizeOperator(signer_A.address);
        await expect(
          clearingFacet.operatorClearingTransferByPartition(
            clearingOperationFromB_wrong_partition,
            _AMOUNT,
            signer_A.address,
          ),
        ).to.be.revertedWithCustomError(erc1410Facet, "InvalidPartition");

        // Holds
        const hold_wrong = {
          ...hold,
          amount: _AMOUNT,
        };
        await expect(
          clearingFacet.clearingCreateHoldByPartition(clearingOperation_wrong_partition, hold_wrong),
        ).to.be.revertedWithCustomError(erc1410Facet, "InvalidPartition");
        await expect(
          clearingFacet.operatorClearingCreateHoldByPartition(clearingOperationFromB_wrong_partition, hold_wrong),
        ).to.be.revertedWithCustomError(erc1410Facet, "InvalidPartition");

        // Redeems
        await expect(
          clearingFacet.clearingRedeemByPartition(clearingOperation_wrong_partition, _AMOUNT),
        ).to.be.revertedWithCustomError(erc1410Facet, "InvalidPartition");
        await expect(
          clearingFacet.operatorClearingRedeemByPartition(clearingOperationFromB_wrong_partition, _AMOUNT),
        ).to.be.revertedWithCustomError(erc1410Facet, "InvalidPartition");
      });
    });

    describe("Manage clearing with wrong input arguments", async () => {
      it("GIVEN a clearing transfer WHEN approveClearingOperationByPartition with wrong input arguments THEN transaction fails with WrongClearingId", async () => {
        await clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, _AMOUNT, signer_C.address);

        // Wrong Partition Id
        const clearingIdentifier_WrongPartition = {
          ...clearingIdentifier,
          partition: _WRONG_PARTITION,
        };

        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifier_WrongPartition),
        ).to.be.revertedWithCustomError(clearingActionsFacet, "WrongClearingId");

        // Wrong Token Holder
        const clearingIdentifier_WrongTokenHolder = {
          ...clearingIdentifier,
          tokenHolder: signer_B.address,
        };

        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifier_WrongTokenHolder),
        ).to.be.revertedWithCustomError(clearingActionsFacet, "WrongClearingId");

        // Wrong Clearing Id
        const clearingIdentifier_ClearingId = {
          ...clearingIdentifier,
          clearingId: 100,
        };

        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifier_ClearingId),
        ).to.be.revertedWithCustomError(clearingActionsFacet, "WrongClearingId");

        // Wrong Clearing Operation Type

        const clearingIdentifier_ClearingOperationType = {
          ...clearingIdentifier,
          clearingOperationType: ClearingOperationType.Redeem,
        };

        await expect(
          clearingActionsFacet.approveClearingOperationByPartition(clearingIdentifier_ClearingOperationType),
        ).to.be.revertedWithCustomError(clearingActionsFacet, "WrongClearingId");
      });
    });
    it("GIVEN a clearing transfer WHEN cancelClearingOperationByPartition with wrong input arguments THEN transaction fails with WrongClearingId", async () => {
      await clearingFacet.connect(signer_A).clearingRedeemByPartition(clearingOperation, _AMOUNT);

      // Wrong Partition Id
      const clearingIdentifier_WrongPartition = {
        ...clearingIdentifier,
        partition: _WRONG_PARTITION,
      };

      await expect(
        clearingActionsFacet.cancelClearingOperationByPartition(clearingIdentifier_WrongPartition),
      ).to.be.revertedWithCustomError(clearingActionsFacet, "WrongClearingId");

      // Wrong Token Holder
      const clearingIdentifier_WrongTokenHolder = {
        ...clearingIdentifier,
        tokenHolder: signer_B.address,
      };

      await expect(
        clearingActionsFacet.cancelClearingOperationByPartition(clearingIdentifier_WrongTokenHolder),
      ).to.be.revertedWithCustomError(clearingActionsFacet, "WrongClearingId");

      // Wrong Clearing Id
      const clearingIdentifier_ClearingId = {
        ...clearingIdentifier,
        clearingId: 100,
      };

      await expect(
        clearingActionsFacet.cancelClearingOperationByPartition(clearingIdentifier_ClearingId),
      ).to.be.revertedWithCustomError(clearingActionsFacet, "WrongClearingId");

      // Wrong Clearing Operation Type

      const clearingIdentifier_ClearingOperationType = {
        ...clearingIdentifier,
        clearingOperationType: ClearingOperationType.HoldCreation,
      };

      await expect(
        clearingActionsFacet.cancelClearingOperationByPartition(clearingIdentifier_ClearingOperationType),
      ).to.be.revertedWithCustomError(clearingActionsFacet, "WrongClearingId");
    });

    it("GIVEN a clearing transfer WHEN reclaimClearingOperationByPartition with wrong input arguments THEN transaction fails with WrongClearingId", async () => {
      await clearingFacet.connect(signer_A).clearingCreateHoldByPartition(clearingOperation, hold);

      // Wrong Partition Id
      const clearingIdentifier_WrongPartition = {
        ...clearingIdentifier,
        partition: _WRONG_PARTITION,
      };

      await expect(
        clearingActionsFacet.reclaimClearingOperationByPartition(clearingIdentifier_WrongPartition),
      ).to.be.revertedWithCustomError(clearingActionsFacet, "WrongClearingId");

      // Wrong Token Holder
      const clearingIdentifier_WrongTokenHolder = {
        ...clearingIdentifier,
        tokenHolder: signer_B.address,
      };

      await expect(
        clearingActionsFacet.reclaimClearingOperationByPartition(clearingIdentifier_WrongTokenHolder),
      ).to.be.revertedWithCustomError(clearingActionsFacet, "WrongClearingId");

      // Wrong Clearing Id
      const clearingIdentifier_ClearingId = {
        ...clearingIdentifier,
        clearingId: 100,
      };

      await expect(
        clearingActionsFacet.reclaimClearingOperationByPartition(clearingIdentifier_ClearingId),
      ).to.be.revertedWithCustomError(clearingActionsFacet, "WrongClearingId");

      // Wrong Clearing Operation Type

      const clearingIdentifier_ClearingOperationType = {
        ...clearingIdentifier,
        clearingOperationType: ClearingOperationType.Transfer,
      };

      await expect(
        clearingActionsFacet.reclaimClearingOperationByPartition(clearingIdentifier_ClearingOperationType),
      ).to.be.revertedWithCustomError(clearingActionsFacet, "WrongClearingId");
    });
  });
});
