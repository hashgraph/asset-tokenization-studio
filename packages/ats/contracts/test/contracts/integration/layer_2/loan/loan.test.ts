// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { type IAsset } from "@contract-types";
import { ZERO, EMPTY_STRING, ATS_ROLES } from "@scripts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployLoanTokenFixture, DEFAULT_LOAN_PARAMS, MAX_UINT256, executeRbac } from "@test";

const EMPTY_VC_ID = EMPTY_STRING;

describe("Loan Tests", () => {
  let signer_A: HardhatEthersSigner;
  let signer_B: HardhatEthersSigner;
  let signer_C: HardhatEthersSigner;

  let asset: IAsset;

  let startingDate: number;
  let maturityDate: number;

  function buildLoanDetails(overrides?: Record<string, object>) {
    return {
      loanBasicData: {
        currency: "0x455552",
        startingDate,
        maturityDate,
        loanStructureType: 0,
        repaymentType: 0,
        interestType: 0,
        signingDate: startingDate,
        originatorAccount: signer_A.address,
        servicerAccount: signer_B.address,
        ...(overrides?.loanBasicData ?? {}),
      },
      loanInterestData: {
        baseReferenceRate: 0,
        floorRate: 0,
        capRate: 0,
        rateMargin: 0,
        dayCount: 0,
        paymentFrequency: 0,
        firstAccrualDate: startingDate,
        prepaymentPenalty: 0,
        commitmentFee: 0,
        utilizationFee: 0,
        utilizationFeeType: 0,
        servicingFee: 0,
        ...(overrides?.loanInterestData ?? {}),
      },
      riskData: {
        internalRiskGrade: "test",
        defaultProbability: 0,
        lossGivenDefault: 0,
        ...(overrides?.riskData ?? {}),
      },
      collateral: {
        totalCollateralValue: 0,
        loanToValue: 0,
        ...(overrides?.collateral ?? {}),
      },
      loanPerformanceStatus: {
        performanceStatus: 0,
        daysPastDue: 0,
        ...(overrides?.loanPerformanceStatus ?? {}),
      },
    };
  }

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

  describe("Deploy", () => {
    it("GIVEN a deployed loan token WHEN querying name and symbol THEN returns the configured values", async () => {
      const name = await asset.name();
      const symbol = await asset.symbol();
      const nominalValue = await asset.getNominalValue();
      const nominalValueDecimals = await asset.getNominalValueDecimals();

      expect(name).to.equal(DEFAULT_LOAN_PARAMS.name);
      expect(symbol).to.equal(DEFAULT_LOAN_PARAMS.symbol);
      expect(nominalValue).to.equal(DEFAULT_LOAN_PARAMS.nominalValue);
      expect(nominalValueDecimals).to.equal(DEFAULT_LOAN_PARAMS.nominalValueDecimals);
    });
  });

  describe("Loan facet functionality tests", () => {
    it("GIVEN a loan token WHEN setLoanDetails THEN loan details are set correctly", async () => {
      const loanDetails = buildLoanDetails();
      await asset.connect(signer_A).setLoanDetails(loanDetails);
      const result = await asset.getLoanDetails();
      expect(result.loanBasicData.currency).to.equal(loanDetails.loanBasicData.currency);
      expect(result.loanBasicData.startingDate).to.equal(loanDetails.loanBasicData.startingDate);
    });

    it("GIVEN a loan token WHEN updating loan details THEN new values are returned", async () => {
      const loanDetails = buildLoanDetails();
      await asset.connect(signer_A).setLoanDetails(loanDetails);

      const updatedDetails = buildLoanDetails({
        riskData: { internalRiskGrade: "test2" },
      });
      await asset.connect(signer_A).setLoanDetails(updatedDetails);

      const result = await asset.getLoanDetails();
      expect(result.riskData.internalRiskGrade).to.equal("test2");
    });

    it("GIVEN an account without loan manager role WHEN setLoanDetails THEN transaction fails with AccountHasNoRole", async () => {
      const loanDetails = buildLoanDetails();
      await expect(asset.connect(signer_C).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "AccountHasNoRole",
      );
    });

    it("GIVEN an initialized loan WHEN trying to initialize again THEN transaction fails with AlreadyInitialized", async () => {
      const loanDetails = buildLoanDetails();
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

      await expect(
        asset.connect(signer_A).initialize_Loan(loanDetails, regulationData, additionalSecurityData),
      ).to.be.rejectedWith("AlreadyInitialized");
    });

    it("GIVEN a paused token WHEN setLoanDetails THEN transaction fails with TokenIsPaused", async () => {
      await asset.connect(signer_B).pause();
      const loanDetails = buildLoanDetails();
      await expect(asset.connect(signer_A).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "TokenIsPaused",
      );
    });
  });

  describe("initialize_Loan validations", () => {
    it("GIVEN startingDate is 0 WHEN deploying loan THEN transaction fails with WrongTimestamp", async () => {
      await expect(
        deployLoanTokenFixture({
          loanInit: {
            startingDate: 0,
            maturityDate: 100_000,
            signingDate: 50_000,
            originatorAccount: "0x1234567890123456789012345678901234567890",
            servicerAccount: "0x1234567890123456789012345678901234567891",
          },
        }),
      ).to.be.rejectedWith("WrongTimestamp");
    });

    it("GIVEN startingDate after maturityDate WHEN deploying loan THEN transaction fails with WrongDates", async () => {
      const now = Math.floor(Date.now() / 1000);
      await expect(
        deployLoanTokenFixture({
          loanInit: {
            startingDate: now + 200_000,
            maturityDate: now + 100_000,
            signingDate: now + 1800,
            originatorAccount: "0x1234567890123456789012345678901234567890",
            servicerAccount: "0x1234567890123456789012345678901234567891",
          },
        }),
      ).to.be.rejectedWith("WrongDates");
    });
  });

  describe("setLoanDetails validations", () => {
    it("GIVEN startingDate is 0 WHEN setLoanDetails THEN transaction fails with WrongTimestamp", async () => {
      const loanDetails = buildLoanDetails({ loanBasicData: { startingDate: 0 } });
      await expect(asset.connect(signer_A).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "WrongTimestamp",
      );
    });

    it("GIVEN maturityDate is 0 WHEN setLoanDetails THEN transaction fails with WrongTimestamp", async () => {
      const loanDetails = buildLoanDetails({ loanBasicData: { maturityDate: 0 } });
      await expect(asset.connect(signer_A).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "WrongTimestamp",
      );
    });

    it("GIVEN startingDate after maturityDate WHEN setLoanDetails THEN transaction fails with WrongDates", async () => {
      const loanDetails = buildLoanDetails({ loanBasicData: { startingDate: maturityDate + 1 } });
      await expect(asset.connect(signer_A).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "WrongDates",
      );
    });

    it("GIVEN signingDate is 0 WHEN setLoanDetails THEN transaction fails with WrongTimestamp", async () => {
      const loanDetails = buildLoanDetails({ loanBasicData: { signingDate: 0 } });
      await expect(asset.connect(signer_A).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "WrongTimestamp",
      );
    });

    it("GIVEN originatorAccount is zero address WHEN setLoanDetails THEN transaction fails with ZeroAddressNotAllowed", async () => {
      const loanDetails = buildLoanDetails({ loanBasicData: { originatorAccount: ethers.ZeroAddress } });
      await expect(asset.connect(signer_A).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "ZeroAddressNotAllowed",
      );
    });

    it("GIVEN servicerAccount is zero address WHEN setLoanDetails THEN transaction fails with ZeroAddressNotAllowed", async () => {
      const loanDetails = buildLoanDetails({ loanBasicData: { servicerAccount: ethers.ZeroAddress } });
      await expect(asset.connect(signer_A).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "ZeroAddressNotAllowed",
      );
    });

    it("GIVEN firstAccrualDate is 0 WHEN setLoanDetails THEN transaction fails with WrongTimestamp", async () => {
      const loanDetails = buildLoanDetails({ loanInterestData: { firstAccrualDate: 0 } });
      await expect(asset.connect(signer_A).setLoanDetails(loanDetails)).to.be.revertedWithCustomError(
        asset,
        "WrongTimestamp",
      );
    });
  });
});
