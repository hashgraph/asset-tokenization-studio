// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  type ResolverProxy,
  type EquityUSA,
  type Pause,
  type AccessControl,
  Lock,
  IHold,
  type IERC1410,
  Kyc,
  SsiManagement,
  ClearingActionsFacet,
  ClearingTransferFacet,
  FreezeFacet,
  TimeTravelFacet,
  type DividendFacetTimeTravel,
} from "@contract-types";
import {
  DEFAULT_PARTITION,
  ADDRESS_ZERO,
  dateToUnixTimestamp,
  EMPTY_STRING,
  ZERO,
  EMPTY_HEX_BYTES,
  ATS_ROLES,
} from "@scripts";
import { grantRoleAndPauseToken } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

let dividendsRecordDateInSeconds = 0;
let dividendsExecutionDateInSeconds = 0;
const dividendsAmountPerEquity = 10;
const dividendsAmountDecimalsPerEquity = 1;

let dividendData = {
  recordDate: dividendsRecordDateInSeconds.toString(),
  executionDate: dividendsExecutionDateInSeconds.toString(),
  amount: dividendsAmountPerEquity,
  amountDecimals: dividendsAmountDecimalsPerEquity,
};

let balanceAdjustmentData = {
  executionDate: "0",
  factor: 356,
  decimals: 2,
};

const number_Of_Shares = 100000n;
const EMPTY_VC_ID = EMPTY_STRING;

describe("Dividend Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let dividendFacet: DividendFacetTimeTravel;
  let equityFacet: EquityUSA;
  let accessControlFacet: AccessControl;
  let pauseFacet: Pause;
  let lockFacet: Lock;
  let holdFacet: IHold;
  let erc1410Facet: IERC1410;
  let timeTravelFacet: TimeTravelFacet;
  let kycFacet: Kyc;
  let ssiManagementFacet: SsiManagement;
  let clearingActionsFacet: ClearingActionsFacet;
  let clearingTransferFacet: ClearingTransferFacet;
  let freezeFacet: FreezeFacet;

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    await executeRbac(base.accessControlFacet, [
      {
        role: ATS_ROLES._PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES._SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
    ]);

    pauseFacet = await ethers.getContractAt("Pause", diamond.target, signer_A);
    lockFacet = await ethers.getContractAt("Lock", diamond.target, signer_A);
    holdFacet = await ethers.getContractAt("IHold", diamond.target, signer_A);
    erc1410Facet = await ethers.getContractAt("IERC1410", diamond.target, signer_A);
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.target, signer_A);
    accessControlFacet = await ethers.getContractAt("AccessControl", diamond.target, signer_A);
    dividendFacet = await ethers.getContractAt("DividendFacetTimeTravel", diamond.target, signer_A);
    equityFacet = await ethers.getContractAt("EquityUSAFacetTimeTravel", diamond.target, signer_A);
    kycFacet = await ethers.getContractAt("Kyc", diamond.target, signer_B);
    ssiManagementFacet = await ethers.getContractAt("SsiManagement", diamond.target, signer_A);
    clearingTransferFacet = await ethers.getContractAt("ClearingTransferFacet", diamond.target, signer_A);
    clearingActionsFacet = await ethers.getContractAt("ClearingActionsFacet", diamond.target, signer_A);
    freezeFacet = await ethers.getContractAt("FreezeFacet", diamond.target, signer_A);

    await ssiManagementFacet.connect(signer_A).addIssuer(signer_A.address);
    await kycFacet.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureSinglePartition);

    const currentTimestamp = await timeTravelFacet.blockTimestamp();
    const ONE_DAY = 86400n;

    dividendsRecordDateInSeconds = Number(currentTimestamp + ONE_DAY);
    dividendsExecutionDateInSeconds = Number(currentTimestamp + ONE_DAY + 1000n);

    dividendData = {
      recordDate: dividendsRecordDateInSeconds.toString(),
      executionDate: dividendsExecutionDateInSeconds.toString(),
      amount: dividendsAmountPerEquity,
      amountDecimals: dividendsAmountDecimalsPerEquity,
    };
    balanceAdjustmentData = {
      executionDate: Number(currentTimestamp + ONE_DAY).toString(),
      factor: 356,
      decimals: 2,
    };
  });

  describe("Dividends", () => {
    it("GIVEN dividend with executed snapshot WHEN getting dividend holders THEN returns holders from snapshot", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
      await kycFacet.grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1000n,
        data: "0x",
      });

      await expect(dividendFacet.connect(signer_C).setDividend(dividendData))
        .to.emit(dividendFacet, "DividendSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          dividendsRecordDateInSeconds,
          dividendsExecutionDateInSeconds,
          dividendsAmountPerEquity,
          dividendsAmountDecimalsPerEquity,
        );

      await timeTravelFacet.changeSystemTimestamp(dividendsRecordDateInSeconds + 1);

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: 500n,
        data: "0x",
      });

      const [dividend] = await dividendFacet.getDividend(1);
      expect(dividend.snapshotId).to.not.equal(0);

      const dividendHolders = await dividendFacet.getDividendHolders(1, 0, 99);
      expect([...dividendHolders]).to.have.members([signer_A.address]);

      const totalHolders = await dividendFacet.getTotalDividendHolders(1);
      expect(totalHolders).to.equal(1);

      const dividendFor = await dividendFacet.getDividendFor(1, signer_A.address);
      expect(dividendFor.tokenBalance).to.equal(1000n);
      expect(dividendFor.recordDateReached).to.equal(true);
    });

    it("GIVEN dividend without executed snapshot WHEN getting total dividend holders THEN returns current total holders", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1000n,
        data: "0x",
      });

      await expect(dividendFacet.connect(signer_C).setDividend(dividendData))
        .to.emit(dividendFacet, "DividendSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          dividendsRecordDateInSeconds,
          dividendsExecutionDateInSeconds,
          dividendsAmountPerEquity,
          dividendsAmountDecimalsPerEquity,
        );

      await timeTravelFacet.changeSystemTimestamp(dividendsRecordDateInSeconds + 1);

      const [dividend] = await dividendFacet.getDividend(1);
      expect(dividend.snapshotId).to.equal(0);

      const totalHolders = await dividendFacet.getTotalDividendHolders(1);
      expect(totalHolders).to.equal(1);

      const holders = await dividendFacet.getDividendHolders(1, 0, 99);
      expect([...holders]).to.have.members([signer_A.address]);
    });

    it("GIVEN an account without corporateActions role WHEN setDividend THEN transaction fails with AccountHasNoRole", async () => {
      await expect(dividendFacet.connect(signer_C).setDividend(dividendData)).to.be.revertedWithCustomError(
        accessControlFacet,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a paused Token WHEN setDividend THEN transaction fails with TokenIsPaused", async () => {
      await grantRoleAndPauseToken(
        accessControlFacet,
        pauseFacet,
        ATS_ROLES._CORPORATE_ACTION_ROLE,
        signer_A,
        signer_B,
        signer_C.address,
      );

      await expect(dividendFacet.connect(signer_C).setDividend(dividendData)).to.be.revertedWithCustomError(
        pauseFacet,
        "TokenIsPaused",
      );
    });

    it("GIVEN an account with corporateActions role WHEN setDividend with wrong dates THEN transaction fails", async () => {
      const currentTimestamp = await timeTravelFacet.blockTimestamp();
      await timeTravelFacet.changeSystemTimestamp(currentTimestamp + 100n);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      const wrongDividendData_1 = {
        recordDate: dividendsExecutionDateInSeconds.toString(),
        executionDate: dividendsRecordDateInSeconds.toString(),
        amount: dividendsAmountPerEquity,
        amountDecimals: dividendsAmountDecimalsPerEquity,
      };

      await expect(dividendFacet.connect(signer_C).setDividend(wrongDividendData_1)).to.be.revertedWithCustomError(
        dividendFacet,
        "WrongDates",
      );

      const wrongDividendData_2 = {
        recordDate: (currentTimestamp - 100n).toString(),
        executionDate: dividendsExecutionDateInSeconds.toString(),
        amount: dividendsAmountPerEquity,
        amountDecimals: dividendsAmountDecimalsPerEquity,
      };

      await expect(dividendFacet.connect(signer_C).setDividend(wrongDividendData_2)).to.be.revertedWithCustomError(
        dividendFacet,
        "WrongTimestamp",
      );
    });

    it("GIVEN an account with corporateActions role WHEN setDividend THEN transaction succeeds", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await expect(dividendFacet.connect(signer_C).setDividend(dividendData))
        .to.emit(dividendFacet, "DividendSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          dividendsRecordDateInSeconds,
          dividendsExecutionDateInSeconds,
          dividendsAmountPerEquity,
          dividendsAmountDecimalsPerEquity,
        );

      await expect(dividendFacet.getDividend(1000)).to.be.revertedWithCustomError(dividendFacet, "WrongIndexForAction");

      const listCount = await dividendFacet.getDividendsCount();
      const [dividend] = await dividendFacet.getDividend(1);
      const dividendFor = await dividendFacet.getDividendFor(1, signer_A.address);
      const dividendAmountFor = await dividendFacet.getDividendAmountFor(1, signer_A.address);
      const dividendTotalHolder = await dividendFacet.getTotalDividendHolders(1);
      const dividendHolders = await dividendFacet.getDividendHolders(1, 0, dividendTotalHolder);

      expect(listCount).to.equal(1);
      expect(dividend.snapshotId).to.equal(0);
      expect(dividend.dividend.recordDate).to.equal(dividendsRecordDateInSeconds);
      expect(dividend.dividend.executionDate).to.equal(dividendsExecutionDateInSeconds);
      expect(dividend.dividend.amount).to.equal(dividendsAmountPerEquity);
      expect(dividend.dividend.amountDecimals).to.equal(dividendsAmountDecimalsPerEquity);
      expect(dividendFor.recordDate).to.equal(dividendsRecordDateInSeconds);
      expect(dividendFor.executionDate).to.equal(dividendsExecutionDateInSeconds);
      expect(dividendFor.amount).to.equal(dividendsAmountPerEquity);
      expect(dividendFor.amountDecimals).to.equal(dividendsAmountDecimalsPerEquity);
      expect(dividendFor.tokenBalance).to.equal(0);
      expect(dividendFor.recordDateReached).to.equal(false);
      expect(dividendFor.decimals).to.equal(0);
      expect(dividendTotalHolder).to.equal(0);
      expect(dividendHolders.length).to.equal(dividendTotalHolder);
      expect(dividendAmountFor.recordDateReached).to.equal(dividendFor.recordDateReached);
      expect(dividendAmountFor.numerator).to.equal(0);
      expect(dividendAmountFor.denominator).to.equal(0);
    });

    it("GIVEN an account with corporateActions role WHEN setDividend and lock THEN transaction succeeds", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._LOCKER_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

      const TotalAmount = number_Of_Shares;
      const LockedAmount = TotalAmount - 5n;

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: TotalAmount,
        data: "0x",
      });

      await lockFacet.connect(signer_C).lock(LockedAmount, signer_A.address, 99999999999);

      await expect(dividendFacet.connect(signer_C).setDividend(dividendData))
        .to.emit(dividendFacet, "DividendSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          dividendsRecordDateInSeconds,
          dividendsExecutionDateInSeconds,
          dividendsAmountPerEquity,
          dividendsAmountDecimalsPerEquity,
        );

      await timeTravelFacet.changeSystemTimestamp(dividendsRecordDateInSeconds + 1);
      const dividendFor = await dividendFacet.getDividendFor(1, signer_A.address);
      const dividendAmountFor = await dividendFacet.getDividendAmountFor(1, signer_A.address);
      const dividendTotalHolder = await dividendFacet.getTotalDividendHolders(1);
      const dividendHolders = await dividendFacet.getDividendHolders(1, 0, dividendTotalHolder);

      expect(dividendFor.tokenBalance).to.equal(TotalAmount);
      expect(dividendFor.recordDateReached).to.equal(true);
      expect(dividendTotalHolder).to.equal(1);
      expect(dividendHolders.length).to.equal(dividendTotalHolder);
      expect([...dividendHolders]).to.have.members([signer_A.address]);
      expect(dividendAmountFor.recordDateReached).to.equal(dividendFor.recordDateReached);
      expect(dividendAmountFor.numerator).to.equal(dividendFor.tokenBalance * dividendFor.amount);
      expect(dividendAmountFor.denominator).to.equal(10n ** (dividendFor.decimals + dividendFor.amountDecimals));
    });

    it("GIVEN an account with corporateActions role WHEN setDividend and hold THEN transaction succeeds", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

      const TotalAmount = number_Of_Shares;
      const HeldAmount = TotalAmount - 5n;

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: TotalAmount,
        data: "0x",
      });

      const hold = {
        amount: HeldAmount,
        expirationTimestamp: 999999999999999,
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: "0x",
      };

      await holdFacet.createHoldByPartition(DEFAULT_PARTITION, hold);

      await expect(dividendFacet.connect(signer_C).setDividend(dividendData))
        .to.emit(dividendFacet, "DividendSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          dividendsRecordDateInSeconds,
          dividendsExecutionDateInSeconds,
          dividendsAmountPerEquity,
          dividendsAmountDecimalsPerEquity,
        );

      await timeTravelFacet.changeSystemTimestamp(dividendsRecordDateInSeconds + 1);
      const dividendFor = await dividendFacet.getDividendFor(1, signer_A.address);
      const dividendAmountFor = await dividendFacet.getDividendAmountFor(1, signer_A.address);
      const dividendTotalHolder = await dividendFacet.getTotalDividendHolders(1);
      const dividendHolders = await dividendFacet.getDividendHolders(1, 0, dividendTotalHolder);

      expect(dividendFor.tokenBalance).to.equal(TotalAmount);
      expect(dividendFor.recordDateReached).to.equal(true);
      expect(dividendTotalHolder).to.equal(1);
      expect(dividendHolders.length).to.equal(dividendTotalHolder);
      expect([...dividendHolders]).to.have.members([signer_A.address]);
      expect(dividendAmountFor.recordDateReached).to.equal(dividendFor.recordDateReached);
      expect(dividendAmountFor.numerator).to.equal(dividendFor.tokenBalance * dividendFor.amount);
      expect(dividendAmountFor.denominator).to.equal(10n ** (dividendFor.decimals + dividendFor.amountDecimals));
    });

    it("GIVEN scheduled dividends WHEN record date is reached AND scheduled balance adjustments is set after record date THEN dividends are paid without adjusted balance", async () => {
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
      await accessControlFacet.grantRole(ATS_ROLES._LOCKER_ROLE, signer_C.address);
      await accessControlFacet.grantRole(ATS_ROLES._CLEARING_ROLE, signer_C.address);
      await accessControlFacet.grantRole(ATS_ROLES._FREEZE_MANAGER_ROLE, signer_C.address);

      const TotalAmount = number_Of_Shares;
      const amounts = TotalAmount / 5n;

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: TotalAmount,
        data: "0x",
      });

      const hold = {
        amount: amounts,
        expirationTimestamp: 999999999999999,
        escrow: signer_B.address,
        to: ADDRESS_ZERO,
        data: "0x",
      };

      await lockFacet.connect(signer_C).lock(amounts, signer_A.address, 99999999999);

      await holdFacet.createHoldByPartition(DEFAULT_PARTITION, hold);

      await freezeFacet.connect(signer_C).freezePartialTokens(signer_A.address, amounts);

      await clearingActionsFacet.connect(signer_C).activateClearing();

      const clearingOperation = {
        partition: DEFAULT_PARTITION,
        expirationTimestamp: 99999999999,
        data: EMPTY_HEX_BYTES,
      };

      await clearingTransferFacet.clearingTransferByPartition(clearingOperation, amounts, signer_B.address);

      balanceAdjustmentData.executionDate = dateToUnixTimestamp("2030-01-01T00:00:15Z").toString();

      await dividendFacet.connect(signer_C).setDividend(dividendData);
      await equityFacet.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);

      await timeTravelFacet.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:20Z").toString());

      const dividendFor = await dividendFacet.getDividendFor(1, signer_A.address);
      const dividendAmountFor = await dividendFacet.getDividendAmountFor(1, signer_A.address);
      expect(dividendFor.tokenBalance).to.equal(TotalAmount);
      expect(dividendFor.recordDateReached).to.equal(true);
      expect(dividendFor.amount).to.equal(dividendsAmountPerEquity);
      expect(dividendFor.amountDecimals).to.equal(dividendsAmountDecimalsPerEquity);
      expect(dividendAmountFor.recordDateReached).to.equal(dividendFor.recordDateReached);
      expect(dividendAmountFor.numerator).to.equal(dividendFor.tokenBalance * dividendFor.amount);
      expect(dividendAmountFor.denominator).to.equal(10n ** (dividendFor.decimals + dividendFor.amountDecimals));
    });

    it("GIVEN frozen tokens WHEN calculating dividends without snapshot THEN frozen tokens are included in dividend calculation", async () => {
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
      await accessControlFacet.grantRole(ATS_ROLES._FREEZE_MANAGER_ROLE, signer_A.address);

      const totalAmount = 1000n;
      const frozenAmount = 300n;

      await erc1410Facet.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: totalAmount,
        data: "0x",
      });

      await freezeFacet.freezePartialTokens(signer_A.address, frozenAmount);

      const dividendDataNoSnapshot = {
        recordDate: dateToUnixTimestamp("2030-01-01T00:00:10Z").toString(),
        executionDate: dateToUnixTimestamp("2030-01-01T00:00:20Z").toString(),
        amount: 10,
        amountDecimals: 0,
      };
      await dividendFacet.setDividend(dividendDataNoSnapshot);

      await timeTravelFacet.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:00:15Z"));

      const dividendFor = await dividendFacet.getDividendFor(1, signer_A.address);

      expect(dividendFor.tokenBalance).to.equal(totalAmount);
      expect(dividendFor.recordDateReached).to.equal(true);

      const expectedDividendNumerator = dividendFor.tokenBalance * dividendFor.amount;
      const expectedDividendDenominator = 10n ** (dividendFor.decimals + dividendFor.amountDecimals);

      const dividendAmountFor = await dividendFacet.getDividendAmountFor(1, signer_A.address);
      expect(dividendAmountFor.numerator).to.equal(expectedDividendNumerator);
      expect(dividendAmountFor.denominator).to.equal(expectedDividendDenominator);
    });

    it("GIVEN a dividend created WHEN calling dividend methods with a wrong dividendId THEN transactions fail with WrongIndexForAction", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await dividendFacet.connect(signer_C).setDividend(dividendData);

      await expect(dividendFacet.getDividend(2)).to.be.revertedWithCustomError(dividendFacet, "WrongIndexForAction");
      await expect(dividendFacet.getDividendFor(2, signer_A.address)).to.be.revertedWithCustomError(
        dividendFacet,
        "WrongIndexForAction",
      );
      await expect(dividendFacet.getDividendAmountFor(2, signer_A.address)).to.be.revertedWithCustomError(
        dividendFacet,
        "WrongIndexForAction",
      );
      await expect(dividendFacet.connect(signer_C).cancelDividend(2)).to.be.revertedWithCustomError(
        dividendFacet,
        "WrongIndexForAction",
      );
      await expect(dividendFacet.getDividendHolders(2, 0, 99)).to.be.revertedWithCustomError(
        dividendFacet,
        "WrongIndexForAction",
      );
      await expect(dividendFacet.getTotalDividendHolders(2)).to.be.revertedWithCustomError(
        dividendFacet,
        "WrongIndexForAction",
      );
    });
  });

  describe("Cancel Dividend", () => {
    it("GIVEN an account without corporateActions role WHEN cancelDividend THEN transaction fails with AccountHasNoRole", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_B.address);
      await dividendFacet.connect(signer_B).setDividend(dividendData);
      await expect(dividendFacet.connect(signer_C).cancelDividend(1)).to.be.revertedWithCustomError(
        accessControlFacet,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a paused Token WHEN cancelDividend THEN transaction fails with TokenIsPaused", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_B.address);
      await dividendFacet.connect(signer_B).setDividend(dividendData);
      await pauseFacet.connect(signer_B).pause();

      await expect(dividendFacet.connect(signer_B).cancelDividend(1)).to.be.revertedWithCustomError(
        pauseFacet,
        "TokenIsPaused",
      );
    });

    it("GIVEN a dividend already executed WHEN cancelDividend THEN transaction fails with DividendAlreadyExecuted", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await dividendFacet.connect(signer_C).setDividend(dividendData);

      await timeTravelFacet.changeSystemTimestamp(dividendsExecutionDateInSeconds + 1000);

      await expect(dividendFacet.connect(signer_C).cancelDividend(1)).to.be.revertedWithCustomError(
        dividendFacet,
        "DividendAlreadyExecuted",
      );
    });

    it("GIVEN a dividend not yet executed WHEN cancelDividend THEN transaction succeeds", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await dividendFacet.connect(signer_C).setDividend(dividendData);

      await expect(dividendFacet.connect(signer_C).cancelDividend(1))
        .to.emit(dividendFacet, "DividendCancelled")
        .withArgs(1, signer_C.address);
      const [, isDisabled] = await dividendFacet.getDividend(1);
      expect(isDisabled).to.equal(true);
      const dividendFor = await dividendFacet.getDividendFor(1, signer_A.address);
      expect(dividendFor.amount).to.equal(dividendsAmountPerEquity);
      expect(dividendFor.amountDecimals).to.equal(dividendsAmountDecimalsPerEquity);
    });

    it("GIVEN a cancelled dividend WHEN getDividend THEN isDisabled is true", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await dividendFacet.connect(signer_C).setDividend(dividendData);

      await dividendFacet.connect(signer_C).cancelDividend(1);

      const [dividend, isDisabled] = await dividendFacet.getDividend(1);
      expect(isDisabled).to.equal(true);
      expect(dividend.dividend.recordDate).to.equal(dividendsRecordDateInSeconds);
      expect(dividend.dividend.executionDate).to.equal(dividendsExecutionDateInSeconds);
    });

    it("GIVEN a cancelled dividend WHEN getDividendFor THEN isDisabled is true and amount is still available", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1000n,
        data: "0x",
      });

      await dividendFacet.connect(signer_C).setDividend(dividendData);

      await dividendFacet.connect(signer_C).cancelDividend(1);

      const [, isDisabled] = await dividendFacet.getDividend(1);
      expect(isDisabled).to.equal(true);
      const dividendFor = await dividendFacet.getDividendFor(1, signer_A.address);
      expect(dividendFor.amount).to.equal(dividendsAmountPerEquity);
      expect(dividendFor.amountDecimals).to.equal(dividendsAmountDecimalsPerEquity);
    });

    it("GIVEN a non-existent dividend WHEN cancelDividend THEN transaction fails", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await expect(dividendFacet.connect(signer_C).cancelDividend(999)).to.be.reverted;
    });

    it("GIVEN multiple dividends WHEN cancelDividend on one THEN only that dividend is cancelled", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      // Create first dividend
      await dividendFacet.connect(signer_C).setDividend(dividendData);

      // Create second dividend with different execution date
      const secondDividendData = {
        recordDate: dividendsRecordDateInSeconds.toString(),
        executionDate: (dividendsExecutionDateInSeconds + 10000).toString(),
        amount: 20,
        amountDecimals: 0,
      };
      await dividendFacet.connect(signer_C).setDividend(secondDividendData);

      // Cancel only first dividend
      await expect(dividendFacet.connect(signer_C).cancelDividend(1))
        .to.emit(dividendFacet, "DividendCancelled")
        .withArgs(1, signer_C.address);

      // Check first dividend is cancelled
      const [, isDisabled1] = await dividendFacet.getDividend(1);
      expect(isDisabled1).to.equal(true);

      // Check second dividend is still active
      const [dividend2, isDisabled2] = await dividendFacet.getDividend(2);
      expect(isDisabled2).to.equal(false);
      expect(dividend2.dividend.amount).to.equal(20);
    });
  });
});
