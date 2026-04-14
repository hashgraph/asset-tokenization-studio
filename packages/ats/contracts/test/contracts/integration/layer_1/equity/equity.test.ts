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
