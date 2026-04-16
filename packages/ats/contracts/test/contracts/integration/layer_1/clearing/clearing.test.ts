// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers, network } from "hardhat";
import { Contract } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import {
  AccessControl,
  AdjustBalances,
  type ClearingActionsFacet,
  ClearingActionsFacet__factory,
  ControlListFacet,
  DiamondFacet,
  DividendFacet,
  Equity,
  ERC20Facet,
  ERC3643Management,
  type IERC1410,
  type IERC3643,
  type IHold,
  Kyc,
  NoncesFacet,
  Pause,
  ProtectedPartitions,
  type ResolverProxy,
  Snapshots,
  SsiManagement,
  TimeTravelFacet,
} from "@contract-types";
import { ADDRESS_ZERO, ATS_ROLES, dateToUnixTimestamp, EMPTY_HEX_BYTES, EMPTY_STRING, ZERO } from "@scripts";
import { deployEquityTokenFixture, executeRbac, MAX_UINT256 } from "@test";

type ClearingFacetCombined = any;

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
        role: ATS_ROLES._ISSUER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_D.address],
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
        role: ATS_ROLES._CORPORATE_ACTION_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._CONTROL_LIST_ROLE,
        members: [signer_E.address],
      },
      {
        role: ATS_ROLES._CONTROLLER_ROLE,
        members: [signer_C.address],
      },
      {
        role: ATS_ROLES._PROTECTED_PARTITIONS_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._AGENT_ROLE,
        members: [signer_A.address],
      },
    ];
  }

  let clearingFacet: ClearingFacetCombined;
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
  let erc3643Facet: IERC3643;
  let protectedPartitionsFacet: ProtectedPartitions;
  let noncesFacet: NoncesFacet;
  let diamondCutFacet: DiamondFacet;
  let dividendFacet: DividendFacet;

  const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
  let currentTimestamp = 0;
  let expirationTimestamp = 0;

  async function setFacets({ diamond }: { diamond: ResolverProxy }) {
    const clearingTransferFacet = await ethers.getContractAt("ClearingTransferFacet", diamond.target, signer_A);

    const clearingRedeemFacet = await ethers.getContractAt("ClearingRedeemFacet", diamond.target, signer_A);
    const clearingHoldCreationFacet = await ethers.getContractAt("ClearingHoldCreationFacet", diamond.target, signer_A);
    const clearingReadFacet = await ethers.getContractAt("ClearingReadFacet", diamond.target, signer_A);
    clearingActionsFacet = ClearingActionsFacet__factory.connect(diamond.target.toString(), signer_A);

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

    clearingFacet = new Contract(diamond.target, uniqueFragments, signer_A) as unknown as ClearingFacetCombined;

    holdFacet = await ethers.getContractAt("IHold", diamond.target, signer_A);
    equityFacet = await ethers.getContractAt("Equity", diamond.target, signer_A);
    accessControlFacet = await ethers.getContractAt("AccessControlFacet", diamond.target, signer_A);
    adjustBalancesFacet = await ethers.getContractAt("AdjustBalances", diamond.target, signer_A);
    pauseFacet = await ethers.getContractAt("Pause", diamond.target, signer_D);
    erc1410Facet = await ethers.getContractAt("IERC1410", diamond.target, signer_B);
    controlListFacet = await ethers.getContractAt("ControlListFacet", diamond.target, signer_E);
    erc20Facet = await ethers.getContractAt("ERC20Facet", diamond.target, signer_A);
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.target, signer_A);
    kycFacet = await ethers.getContractAt("Kyc", diamond.target, signer_B);
    ssiManagementFacet = await ethers.getContractAt("SsiManagement", diamond.target, signer_A);
    snapshotFacet = await ethers.getContractAt("Snapshots", diamond.target);
    erc3643ManagementFacet = await ethers.getContractAt("ERC3643ManagementFacet", diamond.target, signer_A);
    erc3643Facet = await ethers.getContractAt("IERC3643", diamond.target, signer_A);
    protectedPartitionsFacet = await ethers.getContractAt("ProtectedPartitions", diamond.target, signer_A);
    noncesFacet = await ethers.getContractAt("NoncesFacet", diamond.target, signer_A);
    diamondCutFacet = await ethers.getContractAt("DiamondFacet", diamond.target, signer_A);
    dividendFacet = await ethers.getContractAt("DividendFacet", diamond.target, signer_A);

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

    await executeRbac(base.asset, [
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

    await executeRbac(base.asset, [
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

  async function _checkClearingValues(
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
        const recordDate = currentTime + 100n;
        const executionDate = recordDate + 100n;

        clearingOperation.expirationTimestamp = Number(executionDate + BigInt(ONE_YEAR_IN_SECONDS));

        await clearingFacet.connect(signer_A).clearingTransferByPartition(clearingOperation, 10, signer_B.address);

        const dividendInput = {
          recordDate,
          executionDate,
          amount: 100,
          amountDecimals: 0,
        };

        const dividendId = await dividendFacet.connect(signer_A).setDividend.staticCall(dividendInput);
        await dividendFacet.connect(signer_A).setDividend(dividendInput);

        await timeTravelFacet.changeSystemTimestamp(recordDate + 1n);

        const dividendFor = await dividendFacet.getDividendFor(dividendId, signer_A.address);

        const currentBalance = await erc1410Facet.balanceOf(signer_A.address);
        const clearedAmount = await clearingFacet.getClearedAmountFor(signer_A.address);

        expect(dividendFor.recordDateReached).to.equal(true);
        expect(dividendFor.tokenBalance).to.equal(currentBalance + clearedAmount);
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
            ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [1]),
          );

        const balance_A_final_HoldCreation = await erc1410Facet.balanceOf(signer_A.address);
        const balance_B_final_HoldCreation = await erc1410Facet.balanceOf(signer_B.address);

        expect(balance_B_final_Transfer).to.equal(balance_B_original + BigInt(_AMOUNT));
        expect(balance_A_final_Transfer).to.equal(balance_A_original - BigInt(_AMOUNT));
        expect(balance_B_final_Redeem).to.equal(balance_B_original + BigInt(_AMOUNT));
        expect(balance_A_final_Redeem).to.equal(balance_A_original - BigInt(2 * _AMOUNT));
        expect(balance_B_final_HoldCreation).to.equal(balance_B_original + BigInt(_AMOUNT));
        expect(balance_A_final_HoldCreation).to.equal(balance_A_original - BigInt(3 * _AMOUNT));
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

        expect(balance_B_final_Transfer).to.equal(balance_B_original);
        expect(balance_A_final_Transfer).to.equal(balance_A_original);
        expect(balance_B_final_Redeem).to.equal(balance_B_original);
        expect(balance_A_final_Redeem).to.equal(balance_A_original);
        expect(balance_B_final_HoldCreation).to.equal(balance_B_original);
        expect(balance_A_final_HoldCreation).to.equal(balance_A_original);
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

        expect(balance_B_final_Transfer).to.equal(balance_B_original);
        expect(balance_A_final_Transfer).to.equal(balance_A_original);
        expect(balance_B_final_Redeem).to.equal(balance_B_original);
        expect(balance_A_final_Redeem).to.equal(balance_A_original);
        expect(balance_B_final_HoldCreation).to.equal(balance_B_original);
        expect(balance_A_final_HoldCreation).to.equal(balance_A_original);
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
        protectedPartitionsFacet = await ethers.getContractAt("ProtectedPartitions", diamond.target.toString());
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

        await executeRbac(base.asset, set_initRbacs());
        await setFacets({ diamond });
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
        await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Enable protected partitions - grant role first
        await accessControlFacet.grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
        await protectedPartitionsFacet.protectPartitions();

        // Grant role for protected partition
        const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
          ["bytes32", "bytes32"],
          [ATS_ROLES._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
        );
        const packedDataWithoutPrefix = packedData.slice(2);
        const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
        await accessControlFacet.grantRole(protectedPartitionRole, signer_A.address);

        // Get the nonce for signer_A
        const nonce = Number(await noncesFacet.nonces(signer_A.address)) + 1;

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
        const name = (await erc20Facet.getERC20Metadata()).info.name;
        const version = (await diamondCutFacet.getConfigInfo()).version_.toString();
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
        await clearingFacet
          .connect(signer_A)
          .protectedClearingTransferByPartition(protectedClearingOperation, _AMOUNT, signer_C.address, signature);

        // Check cleared amount
        const clearedAmount = await clearingFacet.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address);
        expect(clearedAmount).to.equal(_AMOUNT);
      });

      it("GIVEN a valid signature WHEN calling protectedClearingRedeemByPartition THEN transaction succeeds", async () => {
        // Setup: Issue tokens to signer_A
        await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Enable protected partitions - grant role first
        await accessControlFacet.grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
        await protectedPartitionsFacet.protectPartitions();

        // Grant role for protected partition
        const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
          ["bytes32", "bytes32"],
          [ATS_ROLES._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
        );
        const packedDataWithoutPrefix = packedData.slice(2);
        const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
        await accessControlFacet.grantRole(protectedPartitionRole, signer_A.address);

        // Get the nonce for signer_A
        const nonce = Number(await noncesFacet.nonces(signer_A.address)) + 1;

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
        const name = (await erc20Facet.getERC20Metadata()).info.name;
        const version = (await diamondCutFacet.getConfigInfo()).version_.toString();
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
        await clearingFacet
          .connect(signer_A)
          .protectedClearingRedeemByPartition(protectedClearingOperation, _AMOUNT, signature);

        // Check cleared amount
        const clearedAmount = await clearingFacet.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address);
        expect(clearedAmount).to.equal(_AMOUNT);
      });

      it("GIVEN a valid signature WHEN calling protectedClearingCreateHoldByPartition THEN transaction succeeds", async () => {
        // Setup: Issue tokens to signer_A
        await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Enable protected partitions - grant role first
        await accessControlFacet.grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
        await protectedPartitionsFacet.protectPartitions();

        // Grant role for protected partition
        const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
          ["bytes32", "bytes32"],
          [ATS_ROLES._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
        );
        const packedDataWithoutPrefix = packedData.slice(2);
        const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
        await accessControlFacet.grantRole(protectedPartitionRole, signer_A.address);

        // Get the nonce for signer_A
        const nonce = Number(await noncesFacet.nonces(signer_A.address)) + 1;

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
        const name = (await erc20Facet.getERC20Metadata()).info.name;
        const version = (await diamondCutFacet.getConfigInfo()).version_.toString();
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
        await clearingFacet
          .connect(signer_A)
          .protectedClearingCreateHoldByPartition(protectedClearingOperation, holdForClearing, signature);

        // Check cleared amount
        const clearedAmount = await clearingFacet.getClearedAmountForByPartition(_DEFAULT_PARTITION, signer_A.address);
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
              clearingFacet
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
            await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
            await erc1410Facet.issueByPartition({
              partition: _DEFAULT_PARTITION,
              tokenHolder: signer_A.address,
              value: _AMOUNT,
              data: _DATA,
            });

            await accessControlFacet.grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
            await protectedPartitionsFacet.protectPartitions();

            const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
              ["bytes32", "bytes32"],
              [ATS_ROLES._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
            );
            const packedDataWithoutPrefix = packedData.slice(2);
            const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
            await accessControlFacet.grantRole(protectedPartitionRole, signer_A.address);

            const nonce = Number(await noncesFacet.nonces(signer_A.address)) + 1;

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
              clearingFacet
                .connect(signer_A)
                .protectedClearingTransferByPartition(protectedClearingOp, _AMOUNT, ethers.ZeroAddress, sig),
            ).to.be.reverted;
          });

          it("SHOULD revert WHEN expiration timestamp is invalid (onlyWithValidExpirationTimestamp modifier)", async () => {
            await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
            await erc1410Facet.issueByPartition({
              partition: _DEFAULT_PARTITION,
              tokenHolder: signer_A.address,
              value: _AMOUNT,
              data: _DATA,
            });

            await accessControlFacet.grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
            await protectedPartitionsFacet.protectPartitions();

            const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
              ["bytes32", "bytes32"],
              [ATS_ROLES._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
            );
            const packedDataWithoutPrefix = packedData.slice(2);
            const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
            await accessControlFacet.grantRole(protectedPartitionRole, signer_A.address);

            const nonce = Number(await noncesFacet.nonces(signer_A.address)) + 1;

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
              clearingFacet
                .connect(signer_A)
                .protectedClearingTransferByPartition(protectedClearingOp, _AMOUNT, signer_C.address, sig),
            ).to.be.reverted;
          });

          it("SHOULD revert WHEN missing required role (onlyRole modifier)", async () => {
            await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
            await erc1410Facet.issueByPartition({
              partition: _DEFAULT_PARTITION,
              tokenHolder: signer_A.address,
              value: _AMOUNT,
              data: _DATA,
            });

            await accessControlFacet.grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
            await protectedPartitionsFacet.protectPartitions();

            // Don't grant protectedPartitionRole

            const nonce = Number(await noncesFacet.nonces(signer_A.address)) + 1;

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
              clearingFacet
                .connect(signer_A)
                .protectedClearingTransferByPartition(protectedClearingOp, _AMOUNT, signer_C.address, sig),
            ).to.be.reverted;
          });

          it("SHOULD revert WHEN clearing not activated (onlyClearingActivated modifier)", async () => {
            await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
            await erc1410Facet.issueByPartition({
              partition: _DEFAULT_PARTITION,
              tokenHolder: signer_A.address,
              value: _AMOUNT,
              data: _DATA,
            });

            await accessControlFacet.grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
            await protectedPartitionsFacet.protectPartitions();

            const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
              ["bytes32", "bytes32"],
              [ATS_ROLES._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
            );
            const packedDataWithoutPrefix = packedData.slice(2);
            const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
            await accessControlFacet.grantRole(protectedPartitionRole, signer_A.address);

            // Activate then deactivate clearing
            await clearingActionsFacet.activateClearing();
            await clearingActionsFacet.deactivateClearing();

            const nonce = Number(await noncesFacet.nonces(signer_A.address)) + 1;

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
              clearingFacet
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
              clearingFacet
                .connect(signer_A)
                .protectedClearingRedeemByPartition(protectedClearingOperationInvalid, _AMOUNT, sig),
            ).to.be.reverted;
          });

          it("SHOULD revert WHEN clearing not activated (onlyClearingActivated modifier)", async () => {
            await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
            await erc1410Facet.issueByPartition({
              partition: _DEFAULT_PARTITION,
              tokenHolder: signer_A.address,
              value: _AMOUNT,
              data: _DATA,
            });

            await accessControlFacet.grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
            await protectedPartitionsFacet.protectPartitions();

            const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
              ["bytes32", "bytes32"],
              [ATS_ROLES._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
            );
            const packedDataWithoutPrefix = packedData.slice(2);
            const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
            await accessControlFacet.grantRole(protectedPartitionRole, signer_A.address);

            // Activate then deactivate clearing to test the modifier
            await clearingActionsFacet.activateClearing();
            await clearingActionsFacet.deactivateClearing();

            const nonce = Number(await noncesFacet.nonces(signer_A.address)) + 1;

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

            await expect(
              clearingFacet.connect(signer_A).protectedClearingRedeemByPartition(protectedClearingOp, _AMOUNT, sig),
            ).to.be.reverted;
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
              clearingFacet
                .connect(signer_A)
                .protectedClearingCreateHoldByPartition(protectedClearingOperationInvalid, holdForClearing, sig),
            ).to.be.reverted;
          });

          it("SHOULD revert WHEN clearing not activated (onlyClearingActivated modifier)", async () => {
            await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
            await erc1410Facet.issueByPartition({
              partition: _DEFAULT_PARTITION,
              tokenHolder: signer_A.address,
              value: _AMOUNT,
              data: _DATA,
            });

            await accessControlFacet.grantRole(ATS_ROLES._PROTECTED_PARTITIONS_ROLE, signer_A.address);
            await protectedPartitionsFacet.protectPartitions();

            const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
              ["bytes32", "bytes32"],
              [ATS_ROLES._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
            );
            const packedDataWithoutPrefix = packedData.slice(2);
            const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
            await accessControlFacet.grantRole(protectedPartitionRole, signer_A.address);

            // Activate then deactivate clearing to test the modifier
            await clearingActionsFacet.activateClearing();
            await clearingActionsFacet.deactivateClearing();

            const nonce = Number(await noncesFacet.nonces(signer_A.address)) + 1;

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
              clearingFacet
                .connect(signer_A)
                .protectedClearingCreateHoldByPartition(protectedClearingOp, holdForClearing, sig),
            ).to.be.reverted;
          });
        });
      });

      // Recovery tests following hold.test.ts pattern
      it("GIVEN a from user recovering WHEN protectedClearingTransferByPartition THEN transaction fails with WalletRecovered", async () => {
        // Setup: Issue tokens to signer_A
        await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Recover signer_A's address to signer_B
        await erc3643Facet.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

        const message = {
          _protectedClearingOperation: protectedClearingTransfer,
          _to: signer_C.address,
          _amount: _AMOUNT,
        };

        const signature = await signer_A.signTypedData(domain, clearingTransferType, message);

        await expect(
          clearingFacet
            .connect(signer_B)
            .protectedClearingTransferByPartition(protectedClearingTransfer, _AMOUNT, signer_C.address, signature),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
      });

      it("GIVEN a to user recovering WHEN protectedClearingTransferByPartition THEN transaction fails with WalletRecovered", async () => {
        // Setup: Issue tokens to signer_A
        await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Recover signer_C's address to signer_D
        await erc3643Facet.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);

        const message = {
          _protectedClearingOperation: protectedClearingTransfer,
          _to: signer_C.address,
          _amount: _AMOUNT,
        };

        const signature = await signer_A.signTypedData(domain, clearingTransferType, message);

        await expect(
          clearingFacet
            .connect(signer_B)
            .protectedClearingTransferByPartition(protectedClearingTransfer, _AMOUNT, signer_C.address, signature),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
      });

      it("GIVEN missing partition role WHEN protectedClearingRedeemByPartition THEN transaction fails with AccountHasNoRole", async () => {
        // Setup: Issue tokens to signer_A
        await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Do NOT grant partition-specific role to signer_B - this will test the onlyRole modifier

        // Try to call - should fail with AccountHasNoRole due to missing partition-specific role
        await expect(
          clearingFacet
            .connect(signer_B)
            .protectedClearingRedeemByPartition(protectedClearingRedeem, _AMOUNT, "0x1234"),
        ).to.be.revertedWithCustomError(accessControlFacet, "AccountHasNoRole");
      });

      it("GIVEN a from user recovering WHEN protectedClearingRedeemByPartition THEN transaction fails with WalletRecovered", async () => {
        // Setup: Issue tokens to signer_A
        await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Grant partition-specific role to signer_B
        const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
          ["bytes32", "bytes32"],
          [ATS_ROLES._PROTECTED_PARTITIONS_PARTICIPANT_ROLE, _DEFAULT_PARTITION],
        );
        const packedDataWithoutPrefix = packedData.slice(2);
        const protectedPartitionRole = ethers.keccak256("0x" + packedDataWithoutPrefix);
        await accessControlFacet.grantRole(protectedPartitionRole, signer_B.address);

        // Recover signer_A's address to signer_B
        await erc3643Facet.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

        // Try to call - should hit onlyUnrecoveredAddress before signature validation
        await expect(
          clearingFacet
            .connect(signer_B)
            .protectedClearingRedeemByPartition(protectedClearingRedeem, _AMOUNT, "0x1234"),
        ).to.be.revertedWithCustomError(clearingFacet, "WalletRecovered");
      });

      it("GIVEN a from user recovering WHEN protectedClearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
        // Setup: Issue tokens to signer_A
        await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Recover signer_A's address to signer_B
        await erc3643Facet.recoveryAddress(signer_A.address, signer_B.address, ADDRESS_ZERO);

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
          clearingFacet
            .connect(signer_B)
            .protectedClearingCreateHoldByPartition(protectedClearingHoldCreation, holdForClearing, signature),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
      });

      it("GIVEN a to user recovering WHEN protectedClearingCreateHoldByPartition THEN transaction fails with WalletRecovered", async () => {
        // Setup: Issue tokens to signer_A
        await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Recover signer_C's address (the "to" address in hold) to signer_D
        await erc3643Facet.recoveryAddress(signer_C.address, signer_D.address, ADDRESS_ZERO);

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
          clearingFacet
            .connect(signer_B)
            .protectedClearingCreateHoldByPartition(protectedClearingHoldCreation, holdForClearing, signature),
        ).to.be.revertedWithCustomError(erc3643Facet, "WalletRecovered");
      });

      // Additional tests for missing branch coverage
      it("SHOULD revert WHEN expiration timestamp is invalid for protectedClearingRedeemByPartition", async () => {
        await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        const nonce = Number(await noncesFacet.nonces(signer_A.address)) + 1;

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
          clearingFacet
            .connect(signer_B)
            .protectedClearingRedeemByPartition(protectedClearingOpExpired, _AMOUNT, signature),
        ).to.be.reverted;
      });

      it("SHOULD revert WHEN expiration timestamp is invalid for protectedClearingCreateHoldByPartition", async () => {
        await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        const nonce = Number(await noncesFacet.nonces(signer_A.address)) + 1;

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
          clearingFacet
            .connect(signer_B)
            .protectedClearingCreateHoldByPartition(protectedClearingOpExpired, holdForClearing, signature),
        ).to.be.reverted;
      });

      it("SHOULD revert WHEN missing required role for protectedClearingCreateHoldByPartition", async () => {
        await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
        await erc1410Facet.issueByPartition({
          partition: _DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: _AMOUNT,
          data: _DATA,
        });

        // Don't grant the protected partition role for signer_A
        const nonce = Number(await noncesFacet.nonces(signer_A.address)) + 1;

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
          clearingFacet
            .connect(signer_B)
            .protectedClearingCreateHoldByPartition(protectedClearingOp, holdForClearing, signature),
        ).to.be.reverted;
      });
    });
  });
});
