// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type ResolverProxy, type IAsset } from "@contract-types";
import {
  DEFAULT_PARTITION,
  ADDRESS_ZERO,
  dateToUnixTimestamp,
  EMPTY_STRING,
  ZERO,
  EMPTY_HEX_BYTES,
  ATS_ROLES,
  CURRENCIES,
} from "@scripts";
import { getEquityDetails, grantRoleAndPauseToken } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

let dividendsRecordDateInSeconds = 0;
let dividendsExecutionDateInSeconds = 0;
const dividendsAmountPerEquity = 10;
const dividendsAmountDecimalsPerEquity = 1;

let votingRecordDateInSeconds = 0;

let balanceAdjustmentExecutionDateInSeconds = 0;
const balanceAdjustmentFactor = 356;
const balanceAdjustmentDecimals = 2;

const voteData = "0x";
let votingData = {
  recordDate: votingRecordDateInSeconds.toString(),
  data: voteData,
};
let dividendData = {
  recordDate: dividendsRecordDateInSeconds.toString(),
  executionDate: dividendsExecutionDateInSeconds.toString(),
  amount: dividendsAmountPerEquity,
  amountDecimals: dividendsAmountDecimalsPerEquity,
};
let balanceAdjustmentData = {
  executionDate: balanceAdjustmentExecutionDateInSeconds.toString(),
  factor: balanceAdjustmentFactor,
  decimals: balanceAdjustmentDecimals,
};
const number_Of_Shares = 100000n;
const EMPTY_VC_ID = EMPTY_STRING;

describe("Equity Tests", () => {
  let diamond: ResolverProxy;
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  async function deploySecurityFixtureSinglePartition() {
    const base = await deployEquityTokenFixture();
    diamond = base.diamond;
    signer_A = base.deployer;
    signer_B = base.user1;
    signer_C = base.user2;

    asset = await ethers.getContractAt("IAsset", diamond.target);
    await executeRbac(asset, [
      {
        role: ATS_ROLES.PAUSER_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.KYC_ROLE,
        members: [signer_B.address],
      },
      {
        role: ATS_ROLES.SSI_MANAGER_ROLE,
        members: [signer_A.address],
      },
    ]);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureSinglePartition);

    // Use dynamic timestamps based on current block time
    const currentTimestamp = await asset.blockTimestamp();
    const ONE_DAY = 86400n; // 24 hours in seconds

    dividendsRecordDateInSeconds = Number(currentTimestamp + ONE_DAY);
    dividendsExecutionDateInSeconds = Number(currentTimestamp + ONE_DAY + 1000n);
    votingRecordDateInSeconds = Number(currentTimestamp + ONE_DAY);
    balanceAdjustmentExecutionDateInSeconds = Number(currentTimestamp + ONE_DAY);

    votingData = {
      recordDate: votingRecordDateInSeconds.toString(),
      data: voteData,
    };
    dividendData = {
      recordDate: dividendsRecordDateInSeconds.toString(),
      executionDate: dividendsExecutionDateInSeconds.toString(),
      amount: dividendsAmountPerEquity,
      amountDecimals: dividendsAmountDecimalsPerEquity,
    };
    balanceAdjustmentData = {
      executionDate: balanceAdjustmentExecutionDateInSeconds.toString(),
      factor: balanceAdjustmentFactor,
      decimals: balanceAdjustmentDecimals,
    };
  });

  describe("Initialization", () => {
    it("GIVEN an initialized equity WHEN trying to initialize again THEN transaction fails with AlreadyInitialized", async () => {
      const regulationData = {
        regulationType: 1, // REG_S
        regulationSubType: 0, // NONE
        dealSize: 0,
        accreditedInvestors: 1, // ACCREDITATION_REQUIRED
        maxNonAccreditedInvestors: 0,
        manualInvestorVerification: 1, // VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED
        internationalInvestors: 1, // ALLOWED
        resaleHoldPeriod: 0, // NOT_APPLICABLE
      };

      const additionalSecurityData = {
        countriesControlListType: false,
        listOfCountries: "",
        info: "",
      };

      await expect(
        asset._initialize_equityUSA(getEquityDetails(), regulationData, additionalSecurityData),
      ).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
    });

    it("GIVEN an equity token WHEN getEquityDetails is called THEN returns correct equity details", async () => {
      const equityDetails = await asset.getEquityDetails();

      expect(equityDetails.nominalValue).to.be.gt(0);
      expect(equityDetails.currency).to.equal(CURRENCIES.USD);
    });
  });

  describe("Dividends", () => {
    it("GIVEN dividend with executed snapshot WHEN getting dividend holders THEN returns holders from snapshot", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);
      await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await asset.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1000n,
        data: "0x",
      });

      await expect(asset.connect(signer_C).setDividend(dividendData))
        .to.emit(asset, "DividendSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          dividendsRecordDateInSeconds,
          dividendsExecutionDateInSeconds,
          dividendsAmountPerEquity,
          dividendsAmountDecimalsPerEquity,
        );

      await asset.changeSystemTimestamp(dividendsRecordDateInSeconds + 1);

      await asset.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: 500n,
        data: "0x",
      });

      const [dividend, isDisabled] = await asset.getDividend(1);
      expect(dividend.snapshotId).to.not.equal(0);
      expect(isDisabled).to.equal(false);

      // Verify getDividendHolders returns holders from snapshot (line 211-212)
      const dividendHolders = await asset.getDividendHolders(1, 0, 99);
      expect([...dividendHolders]).to.have.members([signer_A.address]);

      // Verify getTotalDividendHolders returns count from snapshot (line 222)
      const totalHolders = await asset.getTotalDividendHolders(1);
      expect(totalHolders).to.equal(1);

      const dividendFor = await asset.getDividendFor(1, signer_A.address);
      expect(dividendFor.tokenBalance).to.equal(1000n);
      expect(dividendFor.recordDateReached).to.equal(true);
    });

    it("GIVEN dividend without executed snapshot WHEN getting total dividend holders THEN returns current total holders", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);

      // Issue tokens before creating dividend
      await asset.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1000n,
        data: "0x",
      });

      // Create dividend (schedules a snapshot for recordDate)
      await expect(asset.connect(signer_C).setDividend(dividendData))
        .to.emit(asset, "DividendSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          dividendsRecordDateInSeconds,
          dividendsExecutionDateInSeconds,
          dividendsAmountPerEquity,
          dividendsAmountDecimalsPerEquity,
        );

      // Travel to after recordDate BUT DON'T trigger any operation
      // This keeps snapshotId at 0
      await asset.changeSystemTimestamp(dividendsRecordDateInSeconds + 1);

      // Verify snapshot was NOT executed (snapshotId == 0)
      const [dividend, isDisabled] = await asset.getDividend(1);
      expect(dividend.snapshotId).to.equal(0);
      expect(isDisabled).to.equal(false);

      // Get total dividend holders using _getTotalTokenHolders (line 224 in EquityStorageWrapper.sol)
      const totalHolders = await asset.getTotalDividendHolders(1);
      expect(totalHolders).to.equal(1);

      // Also verify getDividendHolders returns current holders (line 214)
      const holders = await asset.getDividendHolders(1, 0, 99);
      expect([...holders]).to.have.members([signer_A.address]);
    });

    it("GIVEN an account without corporateActions role WHEN setDividend THEN transaction fails with AccountHasNoRole", async () => {
      // set dividend fails
      await expect(asset.connect(signer_C).setDividend(dividendData)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a paused Token WHEN setDividend THEN transaction fails with TokenIsPaused", async () => {
      // Granting Role to account C and Pause
      await grantRoleAndPauseToken(asset, ATS_ROLES.CORPORATE_ACTION_ROLE, signer_A, signer_B, signer_C.address);

      // set dividend fails
      await expect(asset.connect(signer_C).setDividend(dividendData)).to.be.revertedWithCustomError(
        asset,
        "TokenIsPaused",
      );
    });

    it("GIVEN an account with corporateActions role WHEN setDividend with wrong dates THEN transaction fails", async () => {
      const currentTimestamp = await asset.blockTimestamp();
      await asset.changeSystemTimestamp(currentTimestamp + 100n);
      // Granting Role to account C
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      // set dividend
      const wrongDividendData_1 = {
        recordDate: dividendsExecutionDateInSeconds.toString(),
        executionDate: dividendsRecordDateInSeconds.toString(),
        amount: dividendsAmountPerEquity,
        amountDecimals: dividendsAmountDecimalsPerEquity,
      };

      await expect(asset.connect(signer_C).setDividend(wrongDividendData_1)).to.be.revertedWithCustomError(
        asset,
        "WrongDates",
      );

      const wrongDividendData_2 = {
        recordDate: (currentTimestamp - 100n).toString(), // Past timestamp
        executionDate: dividendsExecutionDateInSeconds.toString(),
        amount: dividendsAmountPerEquity,
        amountDecimals: dividendsAmountDecimalsPerEquity,
      };

      await expect(asset.connect(signer_C).setDividend(wrongDividendData_2)).to.be.revertedWithCustomError(
        asset,
        "WrongTimestamp",
      );
    });

    it("GIVEN an account with corporateActions role WHEN setDividend THEN transaction succeeds", async () => {
      // Granting Role to account C
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      // set dividend
      await expect(asset.connect(signer_C).setDividend(dividendData))
        .to.emit(asset, "DividendSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          dividendsRecordDateInSeconds,
          dividendsExecutionDateInSeconds,
          dividendsAmountPerEquity,
          dividendsAmountDecimalsPerEquity,
        );

      // check list members
      await expect(asset.getDividend(1000)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");

      const listCount = await asset.getDividendsCount();
      const [dividend, isDisabled] = await asset.getDividend(1);
      const dividendFor = await asset.getDividendFor(1, signer_A.address);
      const dividendAmountFor = await asset.getDividendAmountFor(1, signer_A.address);
      const dividendTotalHolder = await asset.getTotalDividendHolders(1);
      const dividendHolders = await asset.getDividendHolders(1, 0, dividendTotalHolder);

      expect(listCount).to.equal(1);
      expect(isDisabled).to.equal(false);
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
      // Granting Role to account C
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.LOCKER_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);

      // issue and lock
      const TotalAmount = number_Of_Shares;
      const LockedAmount = TotalAmount - 5n;

      await asset.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: TotalAmount,
        data: "0x",
      });

      await asset.connect(signer_C).lock(LockedAmount, signer_A.address, 99999999999);

      // set dividend
      await expect(asset.connect(signer_C).setDividend(dividendData))
        .to.emit(asset, "DividendSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          dividendsRecordDateInSeconds,
          dividendsExecutionDateInSeconds,
          dividendsAmountPerEquity,
          dividendsAmountDecimalsPerEquity,
        );

      // check list members
      await asset.changeSystemTimestamp(dividendsRecordDateInSeconds + 1);
      const dividendFor = await asset.getDividendFor(1, signer_A.address);
      const dividendAmountFor = await asset.getDividendAmountFor(1, signer_A.address);
      const dividendTotalHolder = await asset.getTotalDividendHolders(1);
      const dividendHolders = await asset.getDividendHolders(1, 0, dividendTotalHolder);

      expect(dividendFor.tokenBalance).to.equal(TotalAmount);
      expect(dividendFor.recordDateReached).to.equal(true);
      expect(dividendFor.isDisabled).to.be.false;
      expect(dividendTotalHolder).to.equal(1);
      expect(dividendHolders.length).to.equal(dividendTotalHolder);
      expect([...dividendHolders]).to.have.members([signer_A.address]);
      expect(dividendAmountFor.recordDateReached).to.equal(dividendFor.recordDateReached);
      expect(dividendAmountFor.numerator).to.equal(dividendFor.tokenBalance * dividendFor.amount);
      expect(dividendAmountFor.denominator).to.equal(10n ** (dividendFor.decimals + dividendFor.amountDecimals));
    });

    it("GIVEN an account with corporateActions role WHEN setDividend and hold THEN transaction succeeds", async () => {
      // Granting Role to account C
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);

      // issue and hold
      const TotalAmount = number_Of_Shares;
      const HeldAmount = TotalAmount - 5n;

      await asset.connect(signer_C).issueByPartition({
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

      await asset.createHoldByPartition(DEFAULT_PARTITION, hold);

      // set dividend
      await expect(asset.connect(signer_C).setDividend(dividendData))
        .to.emit(asset, "DividendSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          dividendsRecordDateInSeconds,
          dividendsExecutionDateInSeconds,
          dividendsAmountPerEquity,
          dividendsAmountDecimalsPerEquity,
        );

      // check list members
      await asset.changeSystemTimestamp(dividendsRecordDateInSeconds + 1);
      const dividendFor = await asset.getDividendFor(1, signer_A.address);
      const dividendAmountFor = await asset.getDividendAmountFor(1, signer_A.address);
      const dividendTotalHolder = await asset.getTotalDividendHolders(1);
      const dividendHolders = await asset.getDividendHolders(1, 0, dividendTotalHolder);

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
      await asset.grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);
      await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);
      await asset.grantRole(ATS_ROLES.LOCKER_ROLE, signer_C.address);
      await asset.grantRole(ATS_ROLES.CLEARING_ROLE, signer_C.address);
      await asset.grantRole(ATS_ROLES.FREEZE_MANAGER_ROLE, signer_C.address);

      const TotalAmount = number_Of_Shares;
      const amounts = TotalAmount / 5n;

      await asset.connect(signer_C).issueByPartition({
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

      await asset.connect(signer_C).lock(amounts, signer_A.address, 99999999999);

      await asset.createHoldByPartition(DEFAULT_PARTITION, hold);

      await asset.connect(signer_C).freezePartialTokens(signer_A.address, amounts);

      await asset.connect(signer_C).activateClearing();

      const clearingOperation = {
        partition: DEFAULT_PARTITION,
        expirationTimestamp: 99999999999,
        data: EMPTY_HEX_BYTES,
      };

      await asset.clearingTransferByPartition(clearingOperation, amounts, signer_B.address);

      balanceAdjustmentData.executionDate = dateToUnixTimestamp("2030-01-01T00:00:15Z").toString(); // 5 seconds after dividend record date

      await asset.connect(signer_C).setDividend(dividendData);
      await asset.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);

      // Travel to 5 seconds after balance adjustment execution date
      await asset.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:20Z").toString());

      // Check user dividend balance does not include balance adjustment
      const dividendFor = await asset.getDividendFor(1, signer_A.address);
      const dividendAmountFor = await asset.getDividendAmountFor(1, signer_A.address);
      expect(dividendFor.tokenBalance).to.equal(TotalAmount);
      expect(dividendFor.recordDateReached).to.equal(true);
      expect(dividendFor.amount).to.equal(dividendsAmountPerEquity);
      expect(dividendFor.amountDecimals).to.equal(dividendsAmountDecimalsPerEquity);
      expect(dividendAmountFor.recordDateReached).to.equal(dividendFor.recordDateReached);
      expect(dividendAmountFor.numerator).to.equal(dividendFor.tokenBalance * dividendFor.amount);
      expect(dividendAmountFor.denominator).to.equal(10n ** (dividendFor.decimals + dividendFor.amountDecimals));
    });

    it("GIVEN frozen tokens WHEN calculating dividends without snapshot THEN frozen tokens are included in dividend calculation", async () => {
      await asset.grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_A.address);
      await asset.grantRole(ATS_ROLES.ISSUER_ROLE, signer_A.address);
      await asset.grantRole(ATS_ROLES.FREEZE_MANAGER_ROLE, signer_A.address);

      const totalAmount = 1000n;
      const frozenAmount = 300n;

      // Issue tokens
      await asset.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: totalAmount,
        data: "0x",
      });

      // Freeze some tokens
      await asset.freezePartialTokens(signer_A.address, frozenAmount);

      // Set dividend WITHOUT snapshot (snapshotId will be 0) - this will call _getTotalBalanceForAdjustedAt
      const dividendDataNoSnapshot = {
        recordDate: dateToUnixTimestamp("2030-01-01T00:00:10Z").toString(),
        executionDate: dateToUnixTimestamp("2030-01-01T00:00:20Z").toString(),
        amount: 10,
        amountDecimals: 0,
      };
      await asset.setDividend(dividendDataNoSnapshot);

      // Travel to after record date but before execution date
      await asset.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:00:15Z"));

      // Get dividend - this triggers _getTotalBalanceForAdjustedAt which includes frozen tokens
      const dividendFor = await asset.getDividendFor(1, signer_A.address);

      // The total balance should include frozen tokens (700 free + 300 frozen = 1000)
      expect(dividendFor.tokenBalance).to.equal(totalAmount);
      expect(dividendFor.recordDateReached).to.equal(true);

      // Verify dividend calculation: (tokenBalance * amount) / (10^(decimals + amountDecimals))
      const expectedDividendNumerator = dividendFor.tokenBalance * dividendFor.amount;
      const expectedDividendDenominator = 10n ** (dividendFor.decimals + dividendFor.amountDecimals);
      // Division result: expectedDividendNumerator / expectedDividendDenominator

      // Also get the dividendAmountFor to verify
      const dividendAmountFor = await asset.getDividendAmountFor(1, signer_A.address);
      expect(dividendAmountFor.numerator).to.equal(expectedDividendNumerator);
      expect(dividendAmountFor.denominator).to.equal(expectedDividendDenominator);
    });

    describe("Cancel Dividend", () => {
      it("GIVEN an account without corporateActions role WHEN cancelDividend THEN transaction fails with AccountHasNoRole", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_B.address);
        await asset.connect(signer_B).setDividend(dividendData);
        await expect(asset.connect(signer_C).cancelDividend(1)).to.be.revertedWithCustomError(
          asset,
          "AccountHasNoRole",
        );
      });

      it("GIVEN a paused Token WHEN cancelDividend THEN transaction fails with TokenIsPaused", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_B.address);
        await asset.connect(signer_B).setDividend(dividendData);
        await asset.connect(signer_B).pause();

        await expect(asset.connect(signer_B).cancelDividend(1)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN a dividend already executed WHEN cancelDividend THEN transaction fails with DividendAlreadyExecuted", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

        await asset.connect(signer_C).setDividend(dividendData);

        await asset.changeSystemTimestamp(dividendsExecutionDateInSeconds + 1000);

        await expect(asset.connect(signer_C).cancelDividend(1)).to.be.revertedWithCustomError(
          asset,
          "DividendAlreadyExecuted",
        );
      });

      it("GIVEN a dividend not yet executed WHEN cancelDividend THEN transaction succeeds", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

        await asset.connect(signer_C).setDividend(dividendData);

        await expect(asset.connect(signer_C).cancelDividend(1))
          .to.emit(asset, "DividendCancelled")
          .withArgs(1, signer_C.address);
        expect((await asset.getDividend(1)).isDisabled_).to.equal(true);
        const dividendFor = await asset.getDividendFor(1, signer_A.address);
        expect(dividendFor.amount).to.equal(dividendsAmountPerEquity);
        expect(dividendFor.amountDecimals).to.equal(dividendsAmountDecimalsPerEquity);
        expect(dividendFor.isDisabled).to.be.true;
      });

      it("GIVEN a cancelled dividend WHEN getDividend THEN isDisabled is true", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

        await asset.connect(signer_C).setDividend(dividendData);

        await asset.connect(signer_C).cancelDividend(1);

        const [dividend, isDisabled] = await asset.getDividend(1);
        expect(isDisabled).to.equal(true);
        expect(dividend.dividend.recordDate).to.equal(dividendsRecordDateInSeconds);
        expect(dividend.dividend.executionDate).to.equal(dividendsExecutionDateInSeconds);
      });

      it("GIVEN a cancelled dividend WHEN getDividendFor THEN isDisabled is true and amount is still available", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);
        await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);

        await asset.connect(signer_C).issueByPartition({
          partition: DEFAULT_PARTITION,
          tokenHolder: signer_A.address,
          value: 1000n,
          data: "0x",
        });

        await asset.connect(signer_C).setDividend(dividendData);

        await asset.connect(signer_C).cancelDividend(1);

        const dividendFor = await asset.getDividendFor(1, signer_A.address);
        expect(dividendFor.isDisabled).to.equal(true);
        expect(dividendFor.amount).to.equal(dividendsAmountPerEquity);
        expect(dividendFor.amountDecimals).to.equal(dividendsAmountDecimalsPerEquity);
      });

      it("GIVEN a non-existent dividend WHEN cancelDividend THEN transaction fails", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

        await expect(asset.connect(signer_C).cancelDividend(999)).to.be.rejected;
      });

      it("GIVEN multiple dividends WHEN cancelDividend on one THEN only that dividend is cancelled", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

        // Create first dividend
        await asset.connect(signer_C).setDividend(dividendData);

        // Create second dividend with different execution date
        const secondDividendData = {
          recordDate: dividendsRecordDateInSeconds.toString(),
          executionDate: (dividendsExecutionDateInSeconds + 10000).toString(),
          amount: 20,
          amountDecimals: 0,
        };
        await asset.connect(signer_C).setDividend(secondDividendData);

        // Cancel only first dividend
        await expect(asset.connect(signer_C).cancelDividend(1))
          .to.emit(asset, "DividendCancelled")
          .withArgs(1, signer_C.address);

        // Check first dividend is cancelled
        const [, isDisabled1] = await asset.getDividend(1);
        expect(isDisabled1).to.equal(true);

        // Check second dividend is still active
        const [dividend2, isDisabled2] = await asset.getDividend(2);
        expect(isDisabled2).to.equal(false);
        expect(dividend2.dividend.amount).to.equal(20);
      });
    });
  });
  describe("Voting rights", () => {
    it("GIVEN voting with executed snapshot WHEN getting voting holders THEN returns holders from snapshot", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);
      await asset.connect(signer_B).grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await asset.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1000n,
        data: "0x",
      });

      await expect(asset.connect(signer_C).setVoting(votingData))
        .to.emit(asset, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      await asset.changeSystemTimestamp(votingRecordDateInSeconds + 1);

      await asset.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: 500n,
        data: "0x",
      });

      const [voting, isDisabled] = await asset.getVoting(1);
      expect(voting.snapshotId).to.not.equal(0);
      expect(isDisabled).to.equal(false);

      // Verify getVotingHolders returns holders from snapshot (line 279)
      const votingHolders = await asset.getVotingHolders(1, 0, 99);
      expect([...votingHolders]).to.have.members([signer_A.address]);

      // Verify getTotalVotingHolders returns count from snapshot (line 292)
      const totalHolders = await asset.getTotalVotingHolders(1);
      expect(totalHolders).to.equal(1);

      const votingFor = await asset.getVotingFor(1, signer_A.address);
      expect(votingFor.tokenBalance).to.equal(1000n);
      expect(votingFor.recordDateReached).to.equal(true);
      expect(votingFor.isDisabled).to.be.false;
    });

    it("GIVEN voting without executed snapshot WHEN getting total voting holders THEN returns current total holders", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);

      // Issue tokens before creating voting
      await asset.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1000n,
        data: "0x",
      });

      // Create voting (schedules a snapshot for recordDate)
      await expect(asset.connect(signer_C).setVoting(votingData))
        .to.emit(asset, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      // Travel to after recordDate BUT DON'T trigger any operation
      // This keeps snapshotId at 0
      await asset.changeSystemTimestamp(votingRecordDateInSeconds + 1);

      // Verify snapshot was NOT executed (snapshotId == 0)
      const [voting, isDisabled] = await asset.getVoting(1);
      expect(voting.snapshotId).to.equal(0);
      expect(isDisabled).to.equal(false);

      // Get total voting holders using _getTotalTokenHolders (line 294 in EquityStorageWrapper.sol)
      const totalHolders = await asset.getTotalVotingHolders(1);
      expect(totalHolders).to.equal(1);

      // Also verify getVotingHolders returns current holders (line 281)
      const holders = await asset.getVotingHolders(1, 0, 99);
      expect([...holders]).to.have.members([signer_A.address]);
    });

    it("GIVEN an account without corporateActions role WHEN setVoting THEN transaction fails with AccountHasNoRole", async () => {
      // set voting fails
      await expect(asset.connect(signer_C).setVoting(votingData)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a paused Token WHEN setVoting THEN transaction fails with TokenIsPaused", async () => {
      // Granting Role to account C and Pause
      await grantRoleAndPauseToken(asset, ATS_ROLES.CORPORATE_ACTION_ROLE, signer_A, signer_B, signer_C.address);

      // set voting fails
      await expect(asset.connect(signer_C).setVoting(votingData)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN an account with corporateActions role WHEN setVoting with invalid timestamp THEN transaction fails with WrongTimestamp", async () => {
      const currentTimestamp = await asset.blockTimestamp();
      await asset.changeSystemTimestamp(currentTimestamp + 100n);
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      const invalidVotingData = {
        recordDate: (currentTimestamp - 100n).toString(), // Past timestamp
        data: voteData,
      };

      await expect(asset.connect(signer_C).setVoting(invalidVotingData)).to.be.revertedWithCustomError(
        asset,
        "WrongTimestamp",
      );
    });

    it("GIVEN voting created WHEN trying to get voting with wrong ID type THEN transaction fails with WrongIndexForAction", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      // Create a voting
      await asset.connect(signer_C).setVoting(votingData);

      // Create a dividend to have different action types
      await asset.connect(signer_C).setDividend(dividendData);

      // Try to access voting with dividend ID (should fail)
      await expect(asset.getVoting(2)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");

      // Try to access voting details with wrong ID (getVotingFor has the modifier)
      await expect(asset.getVotingFor(2, signer_A.address)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");

      // Note: getVotingHolders and getTotalVotingHolders don't have onlyMatchingActionType modifier
    });

    it("GIVEN dividends created WHEN trying to get dividend with wrong ID type THEN transaction fails with WrongIndexForAction", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      // Create a dividend
      await asset.connect(signer_C).setDividend(dividendData);

      // Create a voting to have different action types
      await asset.connect(signer_C).setVoting(votingData);

      // Try to access dividend with voting ID (should fail)
      await expect(asset.getDividend(2)).to.be.revertedWithCustomError(asset, "WrongIndexForAction");
      await expect(asset.getDividendFor(2, signer_A.address)).to.be.revertedWithCustomError(
        asset,
        "WrongIndexForAction",
      );
      await expect(asset.getDividendAmountFor(2, signer_A.address)).to.be.revertedWithCustomError(
        asset,
        "WrongIndexForAction",
      );
    });
    it("GIVEN an account without corporateActions role WHEN setVoting THEN transaction fails with AccountHasNoRole", async () => {
      // set dividend fails
      await expect(asset.connect(signer_C).setVoting(votingData)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a paused Token WHEN setVoting THEN transaction fails with TokenIsPaused", async () => {
      // Granting Role to account C and Pause
      await grantRoleAndPauseToken(asset, ATS_ROLES.CORPORATE_ACTION_ROLE, signer_A, signer_B, signer_C.address);

      // set dividend fails
      await expect(asset.connect(signer_C).setVoting(votingData)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
    });

    it("GIVEN a duplicate voting WHEN setVoting THEN transaction fails with VotingRightsCreationFailed", async () => {
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      await asset.connect(signer_C).setVoting(votingData);

      await expect(asset.connect(signer_C).setVoting(votingData)).to.be.revertedWithCustomError(
        asset,
        "VotingRightsCreationFailed",
      );
    });

    it("GIVEN an account with corporateActions role WHEN setVoting THEN transaction succeeds", async () => {
      // Granting Role to account C
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

      // set dividend
      await expect(asset.connect(signer_C).setVoting(votingData))
        .to.emit(asset, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      // check list members
      // await expect(asset.getVoting(1000)).to.be.revertedWithCustomError(asset,
      //     'WrongIndexForAction'
      // )

      const listCount = await asset.getVotingCount();
      const [voting, isDisabled] = await asset.getVoting(1);
      const votingFor = await asset.getVotingFor(1, signer_A.address);
      const votingTotalHolder = await asset.getTotalVotingHolders(1);
      const votingHolders = await asset.getVotingHolders(1, 0, votingTotalHolder);

      expect(listCount).to.equal(1);
      expect(voting.snapshotId).to.equal(0);
      expect(voting.voting.recordDate).to.equal(votingRecordDateInSeconds);
      expect(voting.voting.data).to.equal(voteData);
      expect(isDisabled).to.equal(false);
      expect(votingFor.tokenBalance).to.equal(0);
      expect(votingFor.recordDateReached).to.equal(false);
      expect(votingFor.isDisabled).to.be.false;
      expect(votingTotalHolder).to.equal(0);
      expect(votingHolders.length).to.equal(votingTotalHolder);
    });

    it("GIVEN an account with corporateActions role WHEN setVoting and lock THEN transaction succeeds", async () => {
      // Granting Role to account C
      await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.LOCKER_ROLE, signer_C.address);
      await asset.connect(signer_A).grantRole(ATS_ROLES.ISSUER_ROLE, signer_C.address);

      // issue and lock
      const TotalAmount = number_Of_Shares;
      const LockedAmount = TotalAmount - 5n;

      await asset.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: TotalAmount,
        data: "0x",
      });
      await asset.connect(signer_C).lock(LockedAmount, signer_A.address, 99999999999);

      // set dividend
      await expect(asset.connect(signer_C).setVoting(votingData))
        .to.emit(asset, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      await asset.changeSystemTimestamp(votingRecordDateInSeconds + 1);
      const votingFor = await asset.getVotingFor(1, signer_A.address);
      const votingTotalHolder = await asset.getTotalVotingHolders(1);
      const votingHolders = await asset.getVotingHolders(1, 0, votingTotalHolder);

      expect(votingFor.tokenBalance).to.equal(TotalAmount);
      expect(votingFor.recordDateReached).to.equal(true);
      expect(votingFor.isDisabled).to.be.false;
      expect(votingTotalHolder).to.equal(1);
      expect(votingHolders.length).to.equal(votingTotalHolder);
      expect([...votingHolders]).to.have.members([signer_A.address]);
    });
    describe("Cancel Voting", () => {
      it("GIVEN an account without corporateActions role WHEN cancelVoting THEN transaction fails with AccountHasNoRole", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_B.address);
        await asset.connect(signer_B).setVoting(votingData);
        await expect(asset.connect(signer_C).cancelVoting(1)).to.be.revertedWithCustomError(asset, "AccountHasNoRole");
      });

      it("GIVEN a paused Token WHEN cancelVoting THEN transaction fails with TokenIsPaused", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_B.address);
        await asset.connect(signer_B).setVoting(votingData);
        await asset.connect(signer_B).pause();

        await expect(asset.connect(signer_B).cancelVoting(1)).to.be.revertedWithCustomError(asset, "TokenIsPaused");
      });

      it("GIVEN a voting already recorded WHEN cancelVoting THEN transaction fails with VotingAlreadyRecorded", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

        await asset.connect(signer_C).setVoting(votingData);

        await asset.changeSystemTimestamp(votingRecordDateInSeconds + 1);

        await expect(asset.connect(signer_C).cancelVoting(1)).to.be.revertedWithCustomError(
          asset,
          "VotingAlreadyRecorded",
        );
      });

      it("GIVEN a voting not yet recorded WHEN cancelVoting THEN transaction succeeds", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

        await asset.connect(signer_C).setVoting(votingData);

        await expect(asset.connect(signer_C).cancelVoting(1))
          .to.emit(asset, "VotingCancelled")
          .withArgs(1, signer_C.address);
        expect((await asset.getVoting(1)).isDisabled_).to.equal(true);
        const votingFor = await asset.getVotingFor(1, signer_A.address);
        expect(votingFor.recordDate).to.equal(votingRecordDateInSeconds);
        expect(votingFor.isDisabled).to.be.true;
      });

      it("GIVEN a non-existent voting WHEN cancelVoting THEN transaction fails", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

        await expect(asset.connect(signer_C).cancelVoting(999)).to.be.rejected;
      });

      it("GIVEN multiple votings WHEN cancelVoting on one THEN only that voting is cancelled", async () => {
        await asset.connect(signer_A).grantRole(ATS_ROLES.CORPORATE_ACTION_ROLE, signer_C.address);

        await asset.connect(signer_C).setVoting(votingData);

        const secondVotingData = {
          recordDate: (votingRecordDateInSeconds + 10000).toString(),
          data: "0xAABBCC",
        };
        await asset.connect(signer_C).setVoting(secondVotingData);

        await expect(asset.connect(signer_C).cancelVoting(1))
          .to.emit(asset, "VotingCancelled")
          .withArgs(1, signer_C.address);

        const [, isDisabled1] = await asset.getVoting(1);
        expect(isDisabled1).to.equal(true);

        const [voting2, isDisabled2] = await asset.getVoting(2);
        expect(isDisabled2).to.equal(false);
        expect(voting2.voting.recordDate).to.equal(votingRecordDateInSeconds + 10000);
      });
    });
  });
});
