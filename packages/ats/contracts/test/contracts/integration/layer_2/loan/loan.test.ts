// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset } from "@contract-types";
import { ZERO, EMPTY_STRING, ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployLoanTokenFixture, MAX_UINT256, executeRbac, getLoanDetails } from "@test";

const EMPTY_VC_ID = EMPTY_STRING;

describe("Loan Tests", () => {
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  let startingDate: number;
  let maturityDate: number;

  async function deployLoanFixture() {
    const base = await deployLoanTokenFixture();

    signer_A = base.deployer;
    signer_B = base.user2;
    signer_C = base.user3;

    const now = Math.floor(Date.now() / 1000);
    startingDate = now + 3600;
    maturityDate = startingDate + 100_000;

    asset = await ethers.getContractAt("IAsset", base.tokenAddress);

    await executeRbac(asset, [
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
      {
        role: ATS_ROLES._LOAN_MANAGER_ROLE,
        members: [signer_A.address],
      },
    ]);

    await asset.connect(signer_A).addIssuer(signer_A.address);
    await asset.connect(signer_B).grantKyc(signer_A.address, EMPTY_VC_ID, ZERO, MAX_UINT256, signer_A.address);
  }

  beforeEach(async () => {
    await loadFixture(deployLoanFixture);
  });
  describe("setLoanDetails", () => {
    it("GIVEN a loan token WHEN setLoanDetails THEN loan details are set correctly", async () => {
      const loanDetails = await getLoanDetails();
      await asset.connect(signer_A).setLoanDetails(loanDetails);
      const result = await asset.getLoanDetails();
      // LoanBasicData
      expect(result.loanBasicData.currency).to.equal(loanDetails.loanBasicData.currency);
      expect(result.loanBasicData.startingDate).to.equal(loanDetails.loanBasicData.startingDate);
      expect(result.loanBasicData.maturityDate).to.equal(loanDetails.loanBasicData.maturityDate);
      expect(result.loanBasicData.loanStructureType).to.equal(loanDetails.loanBasicData.loanStructureType);
      expect(result.loanBasicData.repaymentType).to.equal(loanDetails.loanBasicData.repaymentType);
      expect(result.loanBasicData.interestType).to.equal(loanDetails.loanBasicData.interestType);
      expect(result.loanBasicData.signingDate).to.equal(loanDetails.loanBasicData.signingDate);
      expect(result.loanBasicData.originatorAccount).to.equal(loanDetails.loanBasicData.originatorAccount);
      expect(result.loanBasicData.servicerAccount).to.equal(loanDetails.loanBasicData.servicerAccount);
      // LoanInterestData
      expect(result.loanInterestData.baseReferenceRate).to.equal(loanDetails.loanInterestData.baseReferenceRate);
      expect(result.loanInterestData.floorRate).to.equal(loanDetails.loanInterestData.floorRate);
      expect(result.loanInterestData.capRate).to.equal(loanDetails.loanInterestData.capRate);
      expect(result.loanInterestData.rateMargin).to.equal(loanDetails.loanInterestData.rateMargin);
      expect(result.loanInterestData.dayCount).to.equal(loanDetails.loanInterestData.dayCount);
      expect(result.loanInterestData.paymentFrequency).to.equal(loanDetails.loanInterestData.paymentFrequency);
      expect(result.loanInterestData.firstAccrualDate).to.equal(loanDetails.loanInterestData.firstAccrualDate);
      expect(result.loanInterestData.prepaymentPenalty).to.equal(loanDetails.loanInterestData.prepaymentPenalty);
      expect(result.loanInterestData.commitmentFee).to.equal(loanDetails.loanInterestData.commitmentFee);
      expect(result.loanInterestData.utilizationFee).to.equal(loanDetails.loanInterestData.utilizationFee);
      expect(result.loanInterestData.utilizationFeeType).to.equal(loanDetails.loanInterestData.utilizationFeeType);
      expect(result.loanInterestData.servicingFee).to.equal(loanDetails.loanInterestData.servicingFee);
      // RiskData
      expect(result.riskData.internalRiskGrade).to.equal(loanDetails.riskData.internalRiskGrade);
      expect(result.riskData.defaultProbability).to.equal(loanDetails.riskData.defaultProbability);
      expect(result.riskData.lossGivenDefault).to.equal(loanDetails.riskData.lossGivenDefault);
      // Collateral
      expect(result.collateral.totalCollateralValue).to.equal(loanDetails.collateral.totalCollateralValue);
      expect(result.collateral.loanToValue).to.equal(loanDetails.collateral.loanToValue);
      // LoanPerformanceStatus
      expect(result.loanPerformanceStatus.performanceStatus).to.equal(
        loanDetails.loanPerformanceStatus.performanceStatus,
      );
      expect(result.loanPerformanceStatus.daysPastDue).to.equal(loanDetails.loanPerformanceStatus.daysPastDue);
    });

    it("GIVEN an account without loan manager role WHEN setLoanDetails THEN transaction fails with AccountHasNoRole", async () => {
      const loanDetails = await getLoanDetails();
      await expect(asset.connect(signer_C).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN a paused token WHEN setLoanDetails THEN transaction fails with TokenIsPaused", async () => {
      await asset.connect(signer_B).pause();
      const loanDetails = await getLoanDetails();
      await expect(asset.connect(signer_A).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "TokenIsPaused",
      );
    });

    it("GIVEN startingDate is 0 WHEN setLoanDetails THEN transaction fails with WrongTimestamp", async () => {
      const loanDetails = await getLoanDetails({ startingDate: 0 });
      await expect(asset.connect(signer_A).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "WrongTimestamp",
      );
    });

    it("GIVEN maturityDate is 0 WHEN setLoanDetails THEN transaction fails with WrongTimestamp", async () => {
      const loanDetails = await getLoanDetails({ maturityDate: 0 });
      await expect(asset.connect(signer_A).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "WrongTimestamp",
      );
    });

    it("GIVEN startingDate after maturityDate WHEN setLoanDetails THEN transaction fails with WrongDates", async () => {
      const loanDetails = await getLoanDetails({ startingDate: maturityDate + 1, maturityDate: maturityDate });
      await expect(asset.connect(signer_A).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "WrongDates",
      );
    });

    it("GIVEN signingDate is 0 WHEN setLoanDetails THEN transaction fails with WrongTimestamp", async () => {
      const loanDetails = await getLoanDetails({ signingDate: 0 });
      await expect(asset.connect(signer_A).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "WrongTimestamp",
      );
    });

    it("GIVEN originatorAccount is zero address WHEN setLoanDetails THEN transaction fails with ZeroAddressNotAllowed", async () => {
      const loanDetails = await getLoanDetails({ originatorAccount: ethers.ZeroAddress });
      await expect(asset.connect(signer_A).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "ZeroAddressNotAllowed",
      );
    });
    it("GIVEN servicerAccount is zero address WHEN setLoanDetails THEN transaction fails with ZeroAddressNotAllowed", async () => {
      const loanDetails = await getLoanDetails({ servicerAccount: ethers.ZeroAddress });
      await expect(asset.connect(signer_A).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "ZeroAddressNotAllowed",
      );
    });

    it("GIVEN firstAccrualDate is 0 WHEN setLoanDetails THEN transaction fails with WrongTimestamp", async () => {
      const loanDetails = await getLoanDetails({ firstAccrualDate: 0 });
      await expect(asset.connect(signer_A).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "WrongTimestamp",
      );
    });
  });

  describe("initialize_Loan validations", () => {
    const regulationData = {
      regulationType: 1,
      regulationSubType: 2,
      dealSize: 1,
      accreditedInvestors: 1,
      maxNonAccreditedInvestors: 1,
      manualInvestorVerification: 1,
      internationalInvestors: 0,
      resaleHoldPeriod: 1,
    };
    const additionalSecurityData = {
      countriesControlListType: true,
      listOfCountries: "US,CA",
      info: "Info",
      country: "US",
    };
    it("GIVEN an initialized loan WHEN trying to initialize again THEN transaction fails with AlreadyInitialized", async () => {
      const loanDetails = await getLoanDetails();
      await expect(
        asset.connect(signer_A).initialize_Loan(loanDetails, regulationData, additionalSecurityData),
      ).to.be.revertedWithCustomError(asset, "AlreadyInitialized");
    });

    it("GIVEN startingDate is 0 WHEN deploying loan THEN transaction fails with WrongTimestamp", async () => {
      await expect(
        deployLoanTokenFixture({
          loanParams: {
            loanInit: {
              startingDate: 0,
              maturityDate: 100_000,
              signingDate: 50_000,
              originatorAccount: "0x1234567890123456789012345678901234567890",
              servicerAccount: "0x1234567890123456789012345678901234567891",
            },
          },
        }),
      ).to.be.revertedWithCustomError(asset, "InvalidTimestamp");
    });

    it("GIVEN startingDate after maturityDate WHEN deploying loan THEN transaction fails with WrongDates", async () => {
      const now = Math.floor(Date.now() / 1000);
      await expect(
        deployLoanTokenFixture({
          loanParams: {
            loanInit: {
              startingDate: now + 200_000,
              maturityDate: now + 100_000,
              signingDate: now + 1800,
              originatorAccount: "0x1234567890123456789012345678901234567890",
              servicerAccount: "0x1234567890123456789012345678901234567891",
            },
          },
        }),
      ).to.be.revertedWithCustomError(asset, "WrongDates");
    });
  });
});
