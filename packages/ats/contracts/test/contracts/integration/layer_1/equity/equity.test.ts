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
} from "@contract-types";
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

    // Use dynamic timestamps based on current block time
    const currentTimestamp = await timeTravelFacet.blockTimestamp();
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
        equityFacet._initialize_equityUSA(getEquityDetails(), regulationData, additionalSecurityData),
      ).to.be.rejectedWith("AlreadyInitialized");
    });

    it("GIVEN an equity token WHEN getEquityDetails is called THEN returns correct equity details", async () => {
      const equityDetails = await equityFacet.getEquityDetails();

      expect(equityDetails.nominalValue).to.be.gt(0);
      expect(equityDetails.currency).to.equal(CURRENCIES.USD);
    });
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

      await expect(equityFacet.connect(signer_C).setDividends(dividendData))
        .to.emit(equityFacet, "DividendSet")
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

      const dividend = await equityFacet.getDividends(1);
      expect(dividend.snapshotId).to.not.equal(0);

      // Verify getDividendHolders returns holders from snapshot (line 211-212)
      const dividendHolders = await equityFacet.getDividendHolders(1, 0, 99);
      expect(dividendHolders).to.have.members([signer_A.address]);

      // Verify getTotalDividendHolders returns count from snapshot (line 222)
      const totalHolders = await equityFacet.getTotalDividendHolders(1);
      expect(totalHolders).to.equal(1);

      const dividendFor = await equityFacet.getDividendsFor(1, signer_A.address);
      expect(dividendFor.tokenBalance).to.equal(1000n);
      expect(dividendFor.recordDateReached).to.equal(true);
    });

    it("GIVEN dividend without executed snapshot WHEN getting total dividend holders THEN returns current total holders", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

      // Issue tokens before creating dividend
      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1000n,
        data: "0x",
      });

      // Create dividend (schedules a snapshot for recordDate)
      await expect(equityFacet.connect(signer_C).setDividends(dividendData))
        .to.emit(equityFacet, "DividendSet")
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
      await timeTravelFacet.changeSystemTimestamp(dividendsRecordDateInSeconds + 1);

      // Verify snapshot was NOT executed (snapshotId == 0)
      const dividend = await equityFacet.getDividends(1);
      expect(dividend.snapshotId).to.equal(0);

      // Get total dividend holders using _getTotalTokenHolders (line 224 in EquityStorageWrapper.sol)
      const totalHolders = await equityFacet.getTotalDividendHolders(1);
      expect(totalHolders).to.equal(1);

      // Also verify getDividendHolders returns current holders (line 214)
      const holders = await equityFacet.getDividendHolders(1, 0, 99);
      expect(holders).to.have.members([signer_A.address]);
    });

    it("GIVEN an account without corporateActions role WHEN setDividends THEN transaction fails with AccountHasNoRole", async () => {
      // set dividend fails
      await expect(equityFacet.connect(signer_C).setDividends(dividendData)).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN a paused Token WHEN setDividends THEN transaction fails with TokenIsPaused", async () => {
      // Granting Role to account C and Pause
      await grantRoleAndPauseToken(
        accessControlFacet,
        pauseFacet,
        ATS_ROLES._CORPORATE_ACTION_ROLE,
        signer_A,
        signer_B,
        signer_C.address,
      );

      // set dividend fails
      await expect(equityFacet.connect(signer_C).setDividends(dividendData)).to.be.rejectedWith("TokenIsPaused");
    });

    it("GIVEN an account with corporateActions role WHEN setDividends with wrong dates THEN transaction fails", async () => {
      const currentTimestamp = await timeTravelFacet.blockTimestamp();
      await timeTravelFacet.changeSystemTimestamp(currentTimestamp + 100n);
      // Granting Role to account C
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      // set dividend
      const wrongDividendData_1 = {
        recordDate: dividendsExecutionDateInSeconds.toString(),
        executionDate: dividendsRecordDateInSeconds.toString(),
        amount: dividendsAmountPerEquity,
        amountDecimals: dividendsAmountDecimalsPerEquity,
      };

      await expect(equityFacet.connect(signer_C).setDividends(wrongDividendData_1)).to.be.revertedWithCustomError(
        equityFacet,
        "WrongDates",
      );

      const wrongDividendData_2 = {
        recordDate: (currentTimestamp - 100n).toString(), // Past timestamp
        executionDate: dividendsExecutionDateInSeconds.toString(),
        amount: dividendsAmountPerEquity,
        amountDecimals: dividendsAmountDecimalsPerEquity,
      };

      await expect(equityFacet.connect(signer_C).setDividends(wrongDividendData_2)).to.be.revertedWithCustomError(
        equityFacet,
        "WrongTimestamp",
      );
    });

    it("GIVEN an account with corporateActions role WHEN setDividends THEN transaction succeeds", async () => {
      // Granting Role to account C
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      // set dividend
      await expect(equityFacet.connect(signer_C).setDividends(dividendData))
        .to.emit(equityFacet, "DividendSet")
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
      await expect(equityFacet.getDividends(1000)).to.be.rejectedWith("WrongIndexForAction");

      const listCount = await equityFacet.getDividendsCount();
      const dividend = await equityFacet.getDividends(1);
      const dividendFor = await equityFacet.getDividendsFor(1, signer_A.address);
      const dividendAmountFor = await equityFacet.getDividendAmountFor(1, signer_A.address);
      const dividendTotalHolder = await equityFacet.getTotalDividendHolders(1);
      const dividendHolders = await equityFacet.getDividendHolders(1, 0, dividendTotalHolder);

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

    it("GIVEN an account with corporateActions role WHEN setDividends and lock THEN transaction succeeds", async () => {
      // Granting Role to account C
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._LOCKER_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

      // issue and lock
      const TotalAmount = number_Of_Shares;
      const LockedAmount = TotalAmount - 5n;

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: TotalAmount,
        data: "0x",
      });

      await lockFacet.connect(signer_C).lock(LockedAmount, signer_A.address, 99999999999);

      // set dividend
      await expect(equityFacet.connect(signer_C).setDividends(dividendData))
        .to.emit(equityFacet, "DividendSet")
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
      await timeTravelFacet.changeSystemTimestamp(dividendsRecordDateInSeconds + 1);
      const dividendFor = await equityFacet.getDividendsFor(1, signer_A.address);
      const dividendAmountFor = await equityFacet.getDividendAmountFor(1, signer_A.address);
      const dividendTotalHolder = await equityFacet.getTotalDividendHolders(1);
      const dividendHolders = await equityFacet.getDividendHolders(1, 0, dividendTotalHolder);

      expect(dividendFor.tokenBalance).to.equal(TotalAmount);
      expect(dividendFor.recordDateReached).to.equal(true);
      expect(dividendTotalHolder).to.equal(1);
      expect(dividendHolders.length).to.equal(dividendTotalHolder);
      expect(dividendHolders).to.have.members([signer_A.address]);
      expect(dividendAmountFor.recordDateReached).to.equal(dividendFor.recordDateReached);
      expect(dividendAmountFor.numerator).to.equal(dividendFor.tokenBalance * dividendFor.amount);
      expect(dividendAmountFor.denominator).to.equal(BigInt(10 ** (dividendFor.decimals + dividendFor.amountDecimals)));
    });

    it("GIVEN an account with corporateActions role WHEN setDividends and hold THEN transaction succeeds", async () => {
      // Granting Role to account C
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

      // issue and hold
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

      // set dividend
      await expect(equityFacet.connect(signer_C).setDividends(dividendData))
        .to.emit(equityFacet, "DividendSet")
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
      await timeTravelFacet.changeSystemTimestamp(dividendsRecordDateInSeconds + 1);
      const dividendFor = await equityFacet.getDividendsFor(1, signer_A.address);
      const dividendAmountFor = await equityFacet.getDividendAmountFor(1, signer_A.address);
      const dividendTotalHolder = await equityFacet.getTotalDividendHolders(1);
      const dividendHolders = await equityFacet.getDividendHolders(1, 0, dividendTotalHolder);

      expect(dividendFor.tokenBalance).to.equal(TotalAmount);
      expect(dividendFor.recordDateReached).to.equal(true);
      expect(dividendTotalHolder).to.equal(1);
      expect(dividendHolders.length).to.equal(dividendTotalHolder);
      expect(dividendHolders).to.have.members([signer_A.address]);
      expect(dividendAmountFor.recordDateReached).to.equal(dividendFor.recordDateReached);
      expect(dividendAmountFor.numerator).to.equal(dividendFor.tokenBalance * dividendFor.amount);
      expect(dividendAmountFor.denominator).to.equal(BigInt(10 ** (dividendFor.decimals + dividendFor.amountDecimals)));
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

      balanceAdjustmentData.executionDate = dateToUnixTimestamp("2030-01-01T00:00:15Z").toString(); // 5 seconds after dividend record date

      await equityFacet.connect(signer_C).setDividends(dividendData);
      await equityFacet.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);

      // Travel to 5 seconds after balance adjustment execution date
      await timeTravelFacet.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:20Z").toString());

      // Check user dividend balance does not include balance adjustment
      const dividendFor = await equityFacet.getDividendsFor(1, signer_A.address);
      const dividendAmountFor = await equityFacet.getDividendAmountFor(1, signer_A.address);
      expect(dividendFor.tokenBalance).to.equal(TotalAmount);
      expect(dividendFor.recordDateReached).to.equal(true);
      expect(dividendFor.amount).to.equal(dividendsAmountPerEquity);
      expect(dividendFor.amountDecimals).to.equal(dividendsAmountDecimalsPerEquity);
      expect(dividendAmountFor.recordDateReached).to.equal(dividendFor.recordDateReached);
      expect(dividendAmountFor.numerator).to.equal(dividendFor.tokenBalance * dividendFor.amount);
      expect(dividendAmountFor.denominator).to.equal(BigInt(10 ** (dividendFor.decimals + dividendFor.amountDecimals)));
    });

    it("GIVEN frozen tokens WHEN calculating dividends without snapshot THEN frozen tokens are included in dividend calculation", async () => {
      await accessControlFacet.grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_A.address);
      await accessControlFacet.grantRole(ATS_ROLES._ISSUER_ROLE, signer_A.address);
      await accessControlFacet.grantRole(ATS_ROLES._FREEZE_MANAGER_ROLE, signer_A.address);

      const totalAmount = 1000n;
      const frozenAmount = 300n;

      // Issue tokens
      await erc1410Facet.issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: totalAmount,
        data: "0x",
      });

      // Freeze some tokens
      await freezeFacet.freezePartialTokens(signer_A.address, frozenAmount);

      // Set dividend WITHOUT snapshot (snapshotId will be 0) - this will call _getTotalBalanceForAdjustedAt
      const dividendDataNoSnapshot = {
        recordDate: dateToUnixTimestamp("2030-01-01T00:00:10Z").toString(),
        executionDate: dateToUnixTimestamp("2030-01-01T00:00:20Z").toString(),
        amount: 10,
        amountDecimals: 0,
      };
      await equityFacet.setDividends(dividendDataNoSnapshot);

      // Travel to after record date but before execution date
      await timeTravelFacet.changeSystemTimestamp(dateToUnixTimestamp("2030-01-01T00:00:15Z"));

      // Get dividend - this triggers _getTotalBalanceForAdjustedAt which includes frozen tokens
      const dividendFor = await equityFacet.getDividendsFor(1, signer_A.address);

      // The total balance should include frozen tokens (700 free + 300 frozen = 1000)
      expect(dividendFor.tokenBalance).to.equal(totalAmount);
      expect(dividendFor.recordDateReached).to.equal(true);

      // Verify dividend calculation: (tokenBalance * amount) / (10^(decimals + amountDecimals))
      const expectedDividendNumerator = dividendFor.tokenBalance * dividendFor.amount;
      const expectedDividendDenominator = BigInt(10 ** (dividendFor.decimals + dividendFor.amountDecimals));
      // Division result: expectedDividendNumerator / expectedDividendDenominator

      // Also get the dividendAmountFor to verify
      const dividendAmountFor = await equityFacet.getDividendAmountFor(1, signer_A.address);
      expect(dividendAmountFor.numerator).to.equal(expectedDividendNumerator);
      expect(dividendAmountFor.denominator).to.equal(expectedDividendDenominator);
    });
  });

  describe("Voting rights", () => {
    it("GIVEN voting with executed snapshot WHEN getting voting holders THEN returns holders from snapshot", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);
      await kycFacet.grantKyc(signer_B.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1000n,
        data: "0x",
      });

      await expect(equityFacet.connect(signer_C).setVoting(votingData))
        .to.emit(equityFacet, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      await timeTravelFacet.changeSystemTimestamp(votingRecordDateInSeconds + 1);

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_B.address,
        value: 500n,
        data: "0x",
      });

      const voting = await equityFacet.getVoting(1);
      expect(voting.snapshotId).to.not.equal(0);

      // Verify getVotingHolders returns holders from snapshot (line 279)
      const votingHolders = await equityFacet.getVotingHolders(1, 0, 99);
      expect(votingHolders).to.have.members([signer_A.address]);

      // Verify getTotalVotingHolders returns count from snapshot (line 292)
      const totalHolders = await equityFacet.getTotalVotingHolders(1);
      expect(totalHolders).to.equal(1);

      const votingFor = await equityFacet.getVotingFor(1, signer_A.address);
      expect(votingFor.tokenBalance).to.equal(1000n);
      expect(votingFor.recordDateReached).to.equal(true);
    });

    it("GIVEN voting without executed snapshot WHEN getting total voting holders THEN returns current total holders", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

      // Issue tokens before creating voting
      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1000n,
        data: "0x",
      });

      // Create voting (schedules a snapshot for recordDate)
      await expect(equityFacet.connect(signer_C).setVoting(votingData))
        .to.emit(equityFacet, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      // Travel to after recordDate BUT DON'T trigger any operation
      // This keeps snapshotId at 0
      await timeTravelFacet.changeSystemTimestamp(votingRecordDateInSeconds + 1);

      // Verify snapshot was NOT executed (snapshotId == 0)
      const voting = await equityFacet.getVoting(1);
      expect(voting.snapshotId).to.equal(0);

      // Get total voting holders using _getTotalTokenHolders (line 294 in EquityStorageWrapper.sol)
      const totalHolders = await equityFacet.getTotalVotingHolders(1);
      expect(totalHolders).to.equal(1);

      // Also verify getVotingHolders returns current holders (line 281)
      const holders = await equityFacet.getVotingHolders(1, 0, 99);
      expect(holders).to.have.members([signer_A.address]);
    });

    it("GIVEN an account without corporateActions role WHEN setVoting THEN transaction fails with AccountHasNoRole", async () => {
      // set voting fails
      await expect(equityFacet.connect(signer_C).setVoting(votingData)).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN a paused Token WHEN setVoting THEN transaction fails with TokenIsPaused", async () => {
      // Granting Role to account C and Pause
      await grantRoleAndPauseToken(
        accessControlFacet,
        pauseFacet,
        ATS_ROLES._CORPORATE_ACTION_ROLE,
        signer_A,
        signer_B,
        signer_C.address,
      );

      // set voting fails
      await expect(equityFacet.connect(signer_C).setVoting(votingData)).to.be.rejectedWith("TokenIsPaused");
    });

    it("GIVEN an account with corporateActions role WHEN setVoting with invalid timestamp THEN transaction fails with WrongTimestamp", async () => {
      const currentTimestamp = await timeTravelFacet.blockTimestamp();
      await timeTravelFacet.changeSystemTimestamp(currentTimestamp + 100n);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      const invalidVotingData = {
        recordDate: (currentTimestamp - 100n).toString(), // Past timestamp
        data: voteData,
      };

      await expect(equityFacet.connect(signer_C).setVoting(invalidVotingData)).to.be.revertedWithCustomError(
        equityFacet,
        "WrongTimestamp",
      );
    });

    it("GIVEN voting created WHEN trying to get voting with wrong ID type THEN transaction fails with WrongIndexForAction", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      // Create a voting
      await equityFacet.connect(signer_C).setVoting(votingData);

      // Create a dividend to have different action types
      await equityFacet.connect(signer_C).setDividends(dividendData);

      // Try to access voting with dividend ID (should fail)
      await expect(equityFacet.getVoting(2)).to.be.rejectedWith("WrongIndexForAction");

      // Try to access voting details with wrong ID (getVotingFor has the modifier)
      await expect(equityFacet.getVotingFor(2, signer_A.address)).to.be.rejectedWith("WrongIndexForAction");

      // Note: getVotingHolders and getTotalVotingHolders don't have onlyMatchingActionType modifier
    });

    it("GIVEN dividends created WHEN trying to get dividend with wrong ID type THEN transaction fails with WrongIndexForAction", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      // Create a dividend
      await equityFacet.connect(signer_C).setDividends(dividendData);

      // Create a voting to have different action types
      await equityFacet.connect(signer_C).setVoting(votingData);

      // Try to access dividend with voting ID (should fail)
      await expect(equityFacet.getDividends(2)).to.be.rejectedWith("WrongIndexForAction");
      await expect(equityFacet.getDividendsFor(2, signer_A.address)).to.be.rejectedWith("WrongIndexForAction");
      await expect(equityFacet.getDividendAmountFor(2, signer_A.address)).to.be.rejectedWith("WrongIndexForAction");
    });
    it("GIVEN an account without corporateActions role WHEN setVoting THEN transaction fails with AccountHasNoRole", async () => {
      // set dividend fails
      await expect(equityFacet.connect(signer_C).setVoting(votingData)).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN a paused Token WHEN setVoting THEN transaction fails with TokenIsPaused", async () => {
      // Granting Role to account C and Pause
      await grantRoleAndPauseToken(
        accessControlFacet,
        pauseFacet,
        ATS_ROLES._CORPORATE_ACTION_ROLE,
        signer_A,
        signer_B,
        signer_C.address,
      );

      // set dividend fails
      await expect(equityFacet.connect(signer_C).setVoting(votingData)).to.be.rejectedWith("TokenIsPaused");
    });

    it("GIVEN an account with corporateActions role WHEN setVoting THEN transaction succeeds", async () => {
      // Granting Role to account C
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      // set dividend
      await expect(equityFacet.connect(signer_C).setVoting(votingData))
        .to.emit(equityFacet, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      // check list members
      // await expect(equityFacet.getVoting(1000)).to.be.rejectedWith(
      //     'WrongIndexForAction'
      // )

      const listCount = await equityFacet.getVotingCount();
      const voting = await equityFacet.getVoting(1);
      const votingFor = await equityFacet.getVotingFor(1, signer_A.address);
      const votingTotalHolder = await equityFacet.getTotalVotingHolders(1);
      const votingHolders = await equityFacet.getVotingHolders(1, 0, votingTotalHolder);

      expect(listCount).to.equal(1);
      expect(voting.snapshotId).to.equal(0);
      expect(voting.voting.recordDate).to.equal(votingRecordDateInSeconds);
      expect(voting.voting.data).to.equal(voteData);
      expect(votingFor.recordDate).to.equal(dividendsRecordDateInSeconds);
      expect(votingFor.data).to.equal(voteData);
      expect(votingFor.tokenBalance).to.equal(0);
      expect(votingFor.recordDateReached).to.equal(false);
      expect(votingTotalHolder).to.equal(0);
      expect(votingHolders.length).to.equal(votingTotalHolder);
    });

    it("GIVEN an account with corporateActions role WHEN setVoting and lock THEN transaction succeeds", async () => {
      // Granting Role to account C
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._LOCKER_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

      // issue and lock
      const TotalAmount = number_Of_Shares;
      const LockedAmount = TotalAmount - 5n;

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: TotalAmount,
        data: "0x",
      });
      await lockFacet.connect(signer_C).lock(LockedAmount, signer_A.address, 99999999999);

      // set dividend
      await expect(equityFacet.connect(signer_C).setVoting(votingData))
        .to.emit(equityFacet, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      await timeTravelFacet.changeSystemTimestamp(votingRecordDateInSeconds + 1);
      const votingFor = await equityFacet.getVotingFor(1, signer_A.address);
      const votingTotalHolder = await equityFacet.getTotalVotingHolders(1);
      const votingHolders = await equityFacet.getVotingHolders(1, 0, votingTotalHolder);

      expect(votingFor.tokenBalance).to.equal(TotalAmount);
      expect(votingFor.recordDateReached).to.equal(true);
      expect(votingTotalHolder).to.equal(1);
      expect(votingHolders.length).to.equal(votingTotalHolder);
      expect(votingHolders).to.have.members([signer_A.address]);
    });
  });

  describe("Balance adjustments", () => {
    it("GIVEN an account without corporateActions role WHEN setBalanceAdjustment THEN transaction fails with AccountHasNoRole", async () => {
      // set dividend fails
      await expect(
        equityFacet.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData),
      ).to.be.rejectedWith("AccountHasNoRole");
    });

    it("GIVEN a paused Token WHEN setBalanceAdjustment THEN transaction fails with TokenIsPaused", async () => {
      // Granting Role to account C and Pause
      await grantRoleAndPauseToken(
        accessControlFacet,
        pauseFacet,
        ATS_ROLES._CORPORATE_ACTION_ROLE,
        signer_A,
        signer_B,
        signer_C.address,
      );

      // set dividend fails
      await expect(
        equityFacet.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData),
      ).to.be.rejectedWith("TokenIsPaused");
    });

    it("GIVEN an account with corporateActions role WHEN setScheduledBalanceAdjustment with invalid timestamp THEN transaction fails with WrongTimestamp", async () => {
      const currentTimestamp = await timeTravelFacet.blockTimestamp();
      await timeTravelFacet.changeSystemTimestamp(currentTimestamp + 100n);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      const invalidBalanceAdjustmentData = {
        executionDate: (currentTimestamp - 100n).toString(), // Past timestamp
        factor: balanceAdjustmentFactor,
        decimals: balanceAdjustmentDecimals,
      };

      await expect(
        equityFacet.connect(signer_C).setScheduledBalanceAdjustment(invalidBalanceAdjustmentData),
      ).to.be.revertedWithCustomError(equityFacet, "WrongTimestamp");
    });

    it("GIVEN an account with corporateActions role WHEN setScheduledBalanceAdjustment with invalid factor THEN transaction fails with FactorIsZero", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      const invalidBalanceAdjustmentData = {
        executionDate: balanceAdjustmentExecutionDateInSeconds.toString(),
        factor: 0, // Invalid factor: 0
        decimals: balanceAdjustmentDecimals,
      };

      await expect(
        equityFacet.connect(signer_C).setScheduledBalanceAdjustment(invalidBalanceAdjustmentData),
      ).to.be.revertedWithCustomError(equityFacet, "FactorIsZero");
    });

    it("GIVEN balance adjustment created WHEN trying to get balance adjustment with wrong ID type THEN transaction fails with WrongIndexForAction", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      // Create a balance adjustment
      await equityFacet.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);

      // Create a dividend to have different action types
      await equityFacet.connect(signer_C).setDividends(dividendData);

      // Try to access balance adjustment with dividend ID (should fail)
      await expect(equityFacet.getScheduledBalanceAdjustment(2)).to.be.rejectedWith("WrongIndexForAction");
    });

    it("GIVEN an account with corporateActions role WHEN setBalanceAdjustment THEN transaction succeeds", async () => {
      // Granting Role to account C
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      // set dividend
      await expect(equityFacet.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData))
        .to.emit(equityFacet, "ScheduledBalanceAdjustmentSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          balanceAdjustmentExecutionDateInSeconds,
          balanceAdjustmentFactor,
          balanceAdjustmentDecimals,
        );

      const listCount = await equityFacet.getScheduledBalanceAdjustmentCount();
      const balanceAdjustment = await equityFacet.getScheduledBalanceAdjustment(1);

      expect(listCount).to.equal(1);
      expect(balanceAdjustment.executionDate).to.equal(balanceAdjustmentExecutionDateInSeconds);
      expect(balanceAdjustment.factor).to.equal(balanceAdjustmentFactor);
      expect(balanceAdjustment.decimals).to.equal(balanceAdjustmentDecimals);
    });
  });
});
