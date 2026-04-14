// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  type ResolverProxy,
  type EquityUSA,
  type Pause,
  type AccessControl,
  type IERC1410,
  Kyc,
  SsiManagement,
  ScheduledCrossOrderedTasks,
  TimeTravelFacet,
  type DividendFacetTimeTravel,
  Lock,
  type VotingFacetTimeTravel,
} from "@contract-types";
import { DEFAULT_PARTITION, EMPTY_STRING, ZERO, ATS_ROLES, CURRENCIES } from "@scripts";
import { getEquityDetails, grantRoleAndPauseToken } from "@test";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployEquityTokenFixture, MAX_UINT256 } from "@test";
import { executeRbac } from "@test";

let balanceAdjustmentExecutionDateInSeconds = 0;
const balanceAdjustmentFactor = 356;
const balanceAdjustmentDecimals = 2;

let balanceAdjustmentData = {
  executionDate: balanceAdjustmentExecutionDateInSeconds.toString(),
  factor: balanceAdjustmentFactor,
  decimals: balanceAdjustmentDecimals,
};

let votingRecordDateInSeconds = 0;
const voteData = "0x";
let votingData = {
  recordDate: votingRecordDateInSeconds.toString(),
  data: voteData,
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
  let timeTravelFacet: TimeTravelFacet;
  let kycFacet: Kyc;
  let ssiManagementFacet: SsiManagement;
  let erc1410Facet: IERC1410;
  let scheduledTasksFacet: ScheduledCrossOrderedTasks;
  let lockFacet: Lock;
  let votingFacet: VotingFacetTimeTravel;

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
    timeTravelFacet = await ethers.getContractAt("TimeTravelFacet", diamond.target, signer_A);
    accessControlFacet = await ethers.getContractAt("AccessControl", diamond.target, signer_A);
    equityFacet = await ethers.getContractAt("EquityUSAFacetTimeTravel", diamond.target, signer_A);
    kycFacet = await ethers.getContractAt("Kyc", diamond.target, signer_B);
    ssiManagementFacet = await ethers.getContractAt("SsiManagement", diamond.target, signer_A);
    erc1410Facet = await ethers.getContractAt("IERC1410", diamond.target, signer_A);
    scheduledTasksFacet = await ethers.getContractAt("ScheduledCrossOrderedTasks", diamond.target, signer_A);
    lockFacet = await ethers.getContractAt("Lock", diamond.target, signer_A);
    votingFacet = await ethers.getContractAt("VotingFacetTimeTravel", diamond.target, signer_A);

    await ssiManagementFacet.connect(signer_A).addIssuer(signer_A.address);
    await kycFacet.grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deploySecurityFixtureSinglePartition);

    const currentTimestamp = await timeTravelFacet.blockTimestamp();
    const ONE_DAY = 86400n;

    balanceAdjustmentExecutionDateInSeconds = Number(currentTimestamp + ONE_DAY);

    balanceAdjustmentData = {
      executionDate: balanceAdjustmentExecutionDateInSeconds.toString(),
      factor: balanceAdjustmentFactor,
      decimals: balanceAdjustmentDecimals,
    };

    votingRecordDateInSeconds = Number(currentTimestamp + ONE_DAY);
    votingData = {
      recordDate: votingRecordDateInSeconds.toString(),
      data: voteData,
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
      ).to.be.revertedWithCustomError(equityFacet, "AlreadyInitialized");
    });

    it("GIVEN an equity token WHEN getEquityDetails is called THEN returns correct equity details", async () => {
      const equityDetails = await equityFacet.getEquityDetails();

      expect(equityDetails.nominalValue).to.be.gt(0);
      expect(equityDetails.currency).to.equal(CURRENCIES.USD);
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

      await expect(votingFacet.connect(signer_C).setVoting(votingData))
        .to.emit(votingFacet, "VotingSet")
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

      const [voting] = await votingFacet.getVoting(1);
      expect(voting.snapshotId).to.not.equal(0);

      const votingHolders = await votingFacet.getVotingHolders(1, 0, 99);
      expect([...votingHolders]).to.have.members([signer_A.address]);

      const totalHolders = await votingFacet.getTotalVotingHolders(1);
      expect(totalHolders).to.equal(1);

      const votingFor = await votingFacet.getVotingFor(1, signer_A.address);
      expect(votingFor.tokenBalance).to.equal(1000n);
      expect(votingFor.recordDateReached).to.equal(true);
    });

    it("GIVEN voting without executed snapshot WHEN getting total voting holders THEN returns current total holders", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: 1000n,
        data: "0x",
      });

      await expect(votingFacet.connect(signer_C).setVoting(votingData))
        .to.emit(votingFacet, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      await timeTravelFacet.changeSystemTimestamp(votingRecordDateInSeconds + 1);

      const [voting] = await votingFacet.getVoting(1);
      expect(voting.snapshotId).to.equal(0);

      const totalHolders = await votingFacet.getTotalVotingHolders(1);
      expect(totalHolders).to.equal(1);

      const holders = await votingFacet.getVotingHolders(1, 0, 99);
      expect([...holders]).to.have.members([signer_A.address]);
    });

    it("GIVEN an account without corporateActions role WHEN setVoting THEN transaction fails with AccountHasNoRole", async () => {
      await expect(votingFacet.connect(signer_C).setVoting(votingData)).to.be.revertedWithCustomError(
        accessControlFacet,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a paused Token WHEN setVoting THEN transaction fails with TokenIsPaused", async () => {
      await grantRoleAndPauseToken(
        accessControlFacet,
        pauseFacet,
        ATS_ROLES._CORPORATE_ACTION_ROLE,
        signer_A,
        signer_B,
        signer_C.address,
      );

      await expect(votingFacet.connect(signer_C).setVoting(votingData)).to.be.revertedWithCustomError(
        pauseFacet,
        "TokenIsPaused",
      );
    });

    it("GIVEN an account with corporateActions role WHEN setVoting with invalid timestamp THEN transaction fails with WrongTimestamp", async () => {
      const currentTimestamp = await timeTravelFacet.blockTimestamp();
      await timeTravelFacet.changeSystemTimestamp(currentTimestamp + 100n);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      const invalidVotingData = {
        recordDate: (currentTimestamp - 100n).toString(),
        data: voteData,
      };

      await expect(votingFacet.connect(signer_C).setVoting(invalidVotingData)).to.be.revertedWithCustomError(
        votingFacet,
        "WrongTimestamp",
      );
    });

    it("GIVEN voting created WHEN trying to get voting with wrong ID type THEN transaction fails with WrongIndexForAction", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await votingFacet.connect(signer_C).setVoting(votingData);

      const currentTimestamp = await timeTravelFacet.blockTimestamp();
      const ONE_DAY = 86400n;
      const dividendFacet = await ethers.getContractAt("DividendFacetTimeTravel", diamond.target, signer_A);
      await dividendFacet.connect(signer_C).setDividend({
        recordDate: (currentTimestamp + ONE_DAY).toString(),
        executionDate: (currentTimestamp + ONE_DAY + 1000n).toString(),
        amount: 10,
        amountDecimals: 1,
      });

      await expect(votingFacet.getVoting(2)).to.be.revertedWithCustomError(votingFacet, "WrongIndexForAction");

      await expect(votingFacet.getVotingFor(2, signer_A.address)).to.be.revertedWithCustomError(
        votingFacet,
        "WrongIndexForAction",
      );
    });

    it("GIVEN a duplicate voting WHEN setVoting THEN transaction fails with VotingRightsCreationFailed", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await votingFacet.connect(signer_C).setVoting(votingData);

      await expect(votingFacet.connect(signer_C).setVoting(votingData)).to.be.revertedWithCustomError(
        votingFacet,
        "VotingRightsCreationFailed",
      );
    });

    it("GIVEN an account with corporateActions role WHEN setVoting THEN transaction succeeds", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await expect(votingFacet.connect(signer_C).setVoting(votingData))
        .to.emit(votingFacet, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      const listCount = await votingFacet.getVotingCount();
      const [voting] = await votingFacet.getVoting(1);
      const votingFor = await votingFacet.getVotingFor(1, signer_A.address);
      const votingTotalHolder = await votingFacet.getTotalVotingHolders(1);
      const votingHolders = await votingFacet.getVotingHolders(1, 0, votingTotalHolder);

      expect(listCount).to.equal(1);
      expect(voting.snapshotId).to.equal(0);
      expect(voting.voting.recordDate).to.equal(votingRecordDateInSeconds);
      expect(voting.voting.data).to.equal(voteData);
      expect(votingFor.recordDate).to.equal(votingRecordDateInSeconds);
      expect(votingFor.data).to.equal(voteData);
      expect(votingFor.tokenBalance).to.equal(0);
      expect(votingFor.recordDateReached).to.equal(false);
      expect(votingTotalHolder).to.equal(0);
      expect(votingHolders.length).to.equal(votingTotalHolder);
    });

    it("GIVEN an account with corporateActions role WHEN setVoting and lock THEN transaction succeeds", async () => {
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

      await expect(votingFacet.connect(signer_C).setVoting(votingData))
        .to.emit(votingFacet, "VotingSet")
        .withArgs(
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          1,
          signer_C.address,
          votingRecordDateInSeconds,
          voteData,
        );

      await timeTravelFacet.changeSystemTimestamp(votingRecordDateInSeconds + 1);
      const votingFor = await votingFacet.getVotingFor(1, signer_A.address);
      const votingTotalHolder = await votingFacet.getTotalVotingHolders(1);
      const votingHolders = await votingFacet.getVotingHolders(1, 0, votingTotalHolder);

      expect(votingFor.tokenBalance).to.equal(TotalAmount);
      expect(votingFor.recordDateReached).to.equal(true);
      expect(votingTotalHolder).to.equal(1);
      expect(votingHolders.length).to.equal(votingTotalHolder);
      expect([...votingHolders]).to.have.members([signer_A.address]);
    });

    describe("Cancel Voting", () => {
      it("GIVEN an account without corporateActions role WHEN cancelVoting THEN transaction fails with AccountHasNoRole", async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_B.address);
        await votingFacet.connect(signer_B).setVoting(votingData);
        await expect(votingFacet.connect(signer_C).cancelVoting(1)).to.be.revertedWithCustomError(
          accessControlFacet,
          "AccountHasNoRole",
        );
      });

      it("GIVEN a paused Token WHEN cancelVoting THEN transaction fails with TokenIsPaused", async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_B.address);
        await votingFacet.connect(signer_B).setVoting(votingData);
        await pauseFacet.connect(signer_B).pause();

        await expect(votingFacet.connect(signer_B).cancelVoting(1)).to.be.revertedWithCustomError(
          pauseFacet,
          "TokenIsPaused",
        );
      });

      it("GIVEN a voting already recorded WHEN cancelVoting THEN transaction fails with VotingAlreadyRecorded", async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

        await votingFacet.connect(signer_C).setVoting(votingData);

        await timeTravelFacet.changeSystemTimestamp(votingRecordDateInSeconds + 1);

        await expect(votingFacet.connect(signer_C).cancelVoting(1)).to.be.revertedWithCustomError(
          votingFacet,
          "VotingAlreadyRecorded",
        );
      });

      it("GIVEN a voting not yet recorded WHEN cancelVoting THEN transaction succeeds", async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

        await votingFacet.connect(signer_C).setVoting(votingData);

        await expect(votingFacet.connect(signer_C).cancelVoting(1))
          .to.emit(votingFacet, "VotingCancelled")
          .withArgs(1, signer_C.address);
        const [, isDisabled] = await votingFacet.getVoting(1);
        expect(isDisabled).to.equal(true);
        const votingFor = await votingFacet.getVotingFor(1, signer_A.address);
        expect(votingFor.recordDate).to.equal(votingRecordDateInSeconds);
      });

      it("GIVEN a non-existent voting WHEN cancelVoting THEN transaction fails", async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

        await expect(votingFacet.connect(signer_C).cancelVoting(999)).to.be.reverted;
      });

      it("GIVEN multiple votings WHEN cancelVoting on one THEN only that voting is cancelled", async () => {
        await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

        await votingFacet.connect(signer_C).setVoting(votingData);

        const secondVotingData = {
          recordDate: (votingRecordDateInSeconds + 10000).toString(),
          data: "0xAABBCC",
        };
        await votingFacet.connect(signer_C).setVoting(secondVotingData);

        await expect(votingFacet.connect(signer_C).cancelVoting(1))
          .to.emit(votingFacet, "VotingCancelled")
          .withArgs(1, signer_C.address);

        const [, isDisabled1] = await votingFacet.getVoting(1);
        expect(isDisabled1).to.equal(true);

        const [voting2, isDisabled2] = await votingFacet.getVoting(2);
        expect(isDisabled2).to.equal(false);
        expect(voting2.voting.recordDate).to.equal(votingRecordDateInSeconds + 10000);
      });
    });
  });

  describe("Balance adjustments", () => {
    it("GIVEN an account without corporateActions role WHEN setBalanceAdjustment THEN transaction fails with AccountHasNoRole", async () => {
      await expect(
        equityFacet.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData),
      ).to.be.revertedWithCustomError(accessControlFacet, "AccountHasNoRole");
    });

    it("GIVEN a paused Token WHEN setBalanceAdjustment THEN transaction fails with TokenIsPaused", async () => {
      await grantRoleAndPauseToken(
        accessControlFacet,
        pauseFacet,
        ATS_ROLES._CORPORATE_ACTION_ROLE,
        signer_A,
        signer_B,
        signer_C.address,
      );

      await expect(
        equityFacet.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData),
      ).to.be.revertedWithCustomError(pauseFacet, "TokenIsPaused");
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

      // Create a dividend (via DividendFacet) to have different action types
      const dividendFacet: DividendFacetTimeTravel = await ethers.getContractAt(
        "DividendFacetTimeTravel",
        diamond.target,
        signer_A,
      );
      const currentTimestamp = await timeTravelFacet.blockTimestamp();
      const ONE_DAY = 86400n;
      await dividendFacet.connect(signer_C).setDividend({
        recordDate: (currentTimestamp + ONE_DAY).toString(),
        executionDate: (currentTimestamp + ONE_DAY + 1000n).toString(),
        amount: 10,
        amountDecimals: 1,
      });

      // Try to access balance adjustment with dividend ID (should fail)
      await expect(equityFacet.getScheduledBalanceAdjustment(2)).to.be.revertedWithCustomError(
        equityFacet,
        "WrongIndexForAction",
      );
    });

    it("GIVEN an account with corporateActions role WHEN setBalanceAdjustment THEN transaction succeeds", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

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
      const [balanceAdjustment] = await equityFacet.getScheduledBalanceAdjustment(1);

      expect(listCount).to.equal(1);
      expect(balanceAdjustment.executionDate).to.equal(balanceAdjustmentExecutionDateInSeconds);
      expect(balanceAdjustment.factor).to.equal(balanceAdjustmentFactor);
      expect(balanceAdjustment.decimals).to.equal(balanceAdjustmentDecimals);
    });
  });

  describe("Cancel Scheduled Balance Adjustment", () => {
    it("GIVEN an account without corporateActions role WHEN cancelScheduledBalanceAdjustment THEN transaction fails with AccountHasNoRole", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_B.address);
      await equityFacet.connect(signer_B).setScheduledBalanceAdjustment(balanceAdjustmentData);
      await expect(equityFacet.connect(signer_C).cancelScheduledBalanceAdjustment(1)).to.be.revertedWithCustomError(
        accessControlFacet,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a paused Token WHEN cancelScheduledBalanceAdjustment THEN transaction fails with TokenIsPaused", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_B.address);
      await equityFacet.connect(signer_B).setScheduledBalanceAdjustment(balanceAdjustmentData);
      await pauseFacet.connect(signer_B).pause();

      await expect(equityFacet.connect(signer_B).cancelScheduledBalanceAdjustment(1)).to.be.revertedWithCustomError(
        pauseFacet,
        "TokenIsPaused",
      );
    });

    it("GIVEN a balance adjustment already executed WHEN cancelScheduledBalanceAdjustment THEN transaction fails with BalanceAdjustmentAlreadyExecuted", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await equityFacet.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);

      await timeTravelFacet.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds + 1000);

      await expect(equityFacet.connect(signer_C).cancelScheduledBalanceAdjustment(1)).to.be.revertedWithCustomError(
        equityFacet,
        "BalanceAdjustmentAlreadyExecuted",
      );
    });

    it("GIVEN a balance adjustment not yet executed WHEN cancelScheduledBalanceAdjustment THEN transaction succeeds", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await equityFacet.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);

      await expect(equityFacet.connect(signer_C).cancelScheduledBalanceAdjustment(1))
        .to.emit(equityFacet, "ScheduledBalanceAdjustmentCancelled")
        .withArgs(1, signer_C.address);
      const [balanceAdjustment, isDisabled] = await equityFacet.getScheduledBalanceAdjustment(1);
      expect(isDisabled).to.equal(true);
      expect(balanceAdjustment.factor).to.equal(balanceAdjustmentFactor);
      expect(balanceAdjustment.decimals).to.equal(balanceAdjustmentDecimals);
    });

    it("GIVEN a non-existent balance adjustment WHEN cancelScheduledBalanceAdjustment THEN transaction fails", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await expect(equityFacet.connect(signer_C).cancelScheduledBalanceAdjustment(999)).to.be.reverted;
    });

    it("GIVEN multiple balance adjustments WHEN cancelScheduledBalanceAdjustment on one THEN only that adjustment is cancelled", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);

      await equityFacet.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);

      const secondBalanceAdjustmentData = {
        executionDate: (balanceAdjustmentExecutionDateInSeconds + 10000).toString(),
        factor: 500,
        decimals: 3,
      };
      await equityFacet.connect(signer_C).setScheduledBalanceAdjustment(secondBalanceAdjustmentData);

      await expect(equityFacet.connect(signer_C).cancelScheduledBalanceAdjustment(1))
        .to.emit(equityFacet, "ScheduledBalanceAdjustmentCancelled")
        .withArgs(1, signer_C.address);

      const [balanceAdjustment1, isDisabled1] = await equityFacet.getScheduledBalanceAdjustment(1);
      expect(isDisabled1).to.equal(true);
      expect(balanceAdjustment1.factor).to.equal(balanceAdjustmentFactor);

      const [balanceAdjustment2, isDisabled2] = await equityFacet.getScheduledBalanceAdjustment(2);
      expect(isDisabled2).to.equal(false);
      expect(balanceAdjustment2.factor).to.equal(500);
      expect(balanceAdjustment2.decimals).to.equal(3);
    });

    it("GIVEN a cancelled balance adjustment WHEN triggerScheduledCrossOrderedTasks is called THEN scheduled task executes but token balance remains unchanged", async () => {
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._CORPORATE_ACTION_ROLE, signer_C.address);
      await accessControlFacet.connect(signer_A).grantRole(ATS_ROLES._ISSUER_ROLE, signer_C.address);

      const tokenAmount = 1000n;
      await erc1410Facet.connect(signer_C).issueByPartition({
        partition: DEFAULT_PARTITION,
        tokenHolder: signer_A.address,
        value: tokenAmount,
        data: "0x",
      });

      const balanceBeforeAdjustment = await erc1410Facet.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address);
      expect(balanceBeforeAdjustment).to.equal(tokenAmount);

      await equityFacet.connect(signer_C).setScheduledBalanceAdjustment(balanceAdjustmentData);

      await equityFacet.connect(signer_C).cancelScheduledBalanceAdjustment(1);

      const balanceAfterCancel = await erc1410Facet.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address);
      expect(balanceAfterCancel).to.equal(balanceBeforeAdjustment);

      await timeTravelFacet.changeSystemTimestamp(balanceAdjustmentExecutionDateInSeconds + 1);

      await scheduledTasksFacet.connect(signer_A).triggerScheduledCrossOrderedTasks(100);

      const balanceAfterTrigger = await erc1410Facet.balanceOfByPartition(DEFAULT_PARTITION, signer_A.address);
      expect(balanceAfterTrigger).to.equal(balanceBeforeAdjustment);
    });
  });
});
