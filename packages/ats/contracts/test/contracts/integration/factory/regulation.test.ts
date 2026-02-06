import { expect } from "chai";
import { ethers } from "hardhat";
import { MockedRegulation } from "@contract-types";

describe("Regulation Tests", () => {
  let regulationHelper: MockedRegulation;

  // Enum values
  const RegulationType = { NONE: 0, REG_S: 1, REG_D: 2 };
  const RegulationSubType = { NONE: 0, REG_D_506_B: 1, REG_D_506_C: 2 };
  const AccreditedInvestors = { NONE: 0, ACCREDITATION_REQUIRED: 1 };
  const ManualInvestorVerification = {
    NOTHING_TO_VERIFY: 0,
    VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED: 1,
  };
  const InternationalInvestors = { NOT_ALLOWED: 0, ALLOWED: 1 };
  const ResaleHoldPeriod = { NOT_APPLICABLE: 0, APPLICABLE_FROM_6_MOTHS_TO_1_YEAR: 1 };

  beforeEach(async () => {
    const MockedRegulationFactory = await ethers.getContractFactory("MockedRegulation");
    regulationHelper = await MockedRegulationFactory.deploy();
    await regulationHelper.waitForDeployment();
  });

  describe("buildRegulationData", () => {
    it("GIVEN REG_S type WHEN buildRegulationData THEN returns correct REG_S data", async () => {
      const result = await regulationHelper.testBuildRegulationData(RegulationType.REG_S, RegulationSubType.NONE);

      expect(result.regulationType).to.equal(RegulationType.REG_S);
      expect(result.regulationSubType).to.equal(RegulationSubType.NONE);
      expect(result.dealSize).to.equal(0);
      expect(result.accreditedInvestors).to.equal(AccreditedInvestors.ACCREDITATION_REQUIRED);
      expect(result.maxNonAccreditedInvestors).to.equal(0);
      expect(result.manualInvestorVerification).to.equal(
        ManualInvestorVerification.VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED,
      );
      expect(result.internationalInvestors).to.equal(InternationalInvestors.ALLOWED);
      expect(result.resaleHoldPeriod).to.equal(ResaleHoldPeriod.NOT_APPLICABLE);
    });

    it("GIVEN REG_D 506_B type WHEN buildRegulationData THEN returns correct REG_D 506_B data", async () => {
      const result = await regulationHelper.testBuildRegulationData(
        RegulationType.REG_D,
        RegulationSubType.REG_D_506_B,
      );

      expect(result.regulationType).to.equal(RegulationType.REG_D);
      expect(result.regulationSubType).to.equal(RegulationSubType.REG_D_506_B);
      expect(result.dealSize).to.equal(0);
      expect(result.accreditedInvestors).to.equal(AccreditedInvestors.ACCREDITATION_REQUIRED);
      expect(result.maxNonAccreditedInvestors).to.equal(35);
      expect(result.manualInvestorVerification).to.equal(
        ManualInvestorVerification.VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED,
      );
      expect(result.internationalInvestors).to.equal(InternationalInvestors.NOT_ALLOWED);
      expect(result.resaleHoldPeriod).to.equal(ResaleHoldPeriod.APPLICABLE_FROM_6_MOTHS_TO_1_YEAR);
    });

    it("GIVEN REG_D 506_C type WHEN buildRegulationData THEN returns correct REG_D 506_C data", async () => {
      const result = await regulationHelper.testBuildRegulationData(
        RegulationType.REG_D,
        RegulationSubType.REG_D_506_C,
      );

      expect(result.regulationType).to.equal(RegulationType.REG_D);
      expect(result.regulationSubType).to.equal(RegulationSubType.REG_D_506_C);
      expect(result.dealSize).to.equal(0);
      expect(result.accreditedInvestors).to.equal(AccreditedInvestors.ACCREDITATION_REQUIRED);
      expect(result.maxNonAccreditedInvestors).to.equal(0);
      expect(result.manualInvestorVerification).to.equal(
        ManualInvestorVerification.VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED,
      );
      expect(result.internationalInvestors).to.equal(InternationalInvestors.NOT_ALLOWED);
      expect(result.resaleHoldPeriod).to.equal(ResaleHoldPeriod.APPLICABLE_FROM_6_MOTHS_TO_1_YEAR);
    });
  });

  describe("buildDealSize", () => {
    it("GIVEN REG_S WHEN buildDealSize THEN returns REG_S deal size", async () => {
      const result = await regulationHelper.testBuildDealSize(RegulationType.REG_S, RegulationSubType.NONE);
      expect(result).to.equal(0);
    });

    it("GIVEN REG_D 506_B WHEN buildDealSize THEN returns REG_D 506_B deal size", async () => {
      const result = await regulationHelper.testBuildDealSize(RegulationType.REG_D, RegulationSubType.REG_D_506_B);
      expect(result).to.equal(0);
    });

    it("GIVEN REG_D 506_C WHEN buildDealSize THEN returns REG_D 506_C deal size", async () => {
      const result = await regulationHelper.testBuildDealSize(RegulationType.REG_D, RegulationSubType.REG_D_506_C);
      expect(result).to.equal(0);
    });
  });

  describe("buildAccreditedInvestors", () => {
    it("GIVEN REG_S WHEN buildAccreditedInvestors THEN returns REG_S accredited investors", async () => {
      const result = await regulationHelper.testBuildAccreditedInvestors(RegulationType.REG_S, RegulationSubType.NONE);
      expect(result).to.equal(AccreditedInvestors.ACCREDITATION_REQUIRED);
    });

    it("GIVEN REG_D 506_B WHEN buildAccreditedInvestors THEN returns REG_D 506_B accredited investors", async () => {
      const result = await regulationHelper.testBuildAccreditedInvestors(
        RegulationType.REG_D,
        RegulationSubType.REG_D_506_B,
      );
      expect(result).to.equal(AccreditedInvestors.ACCREDITATION_REQUIRED);
    });

    it("GIVEN REG_D 506_C WHEN buildAccreditedInvestors THEN returns REG_D 506_C accredited investors", async () => {
      const result = await regulationHelper.testBuildAccreditedInvestors(
        RegulationType.REG_D,
        RegulationSubType.REG_D_506_C,
      );
      expect(result).to.equal(AccreditedInvestors.ACCREDITATION_REQUIRED);
    });
  });

  describe("buildMaxNonAccreditedInvestors", () => {
    it("GIVEN REG_S WHEN buildMaxNonAccreditedInvestors THEN returns REG_S max non-accredited investors", async () => {
      const result = await regulationHelper.testBuildMaxNonAccreditedInvestors(
        RegulationType.REG_S,
        RegulationSubType.NONE,
      );
      expect(result).to.equal(0);
    });

    it("GIVEN REG_D 506_B WHEN buildMaxNonAccreditedInvestors THEN returns REG_D 506_B max non-accredited investors", async () => {
      const result = await regulationHelper.testBuildMaxNonAccreditedInvestors(
        RegulationType.REG_D,
        RegulationSubType.REG_D_506_B,
      );
      expect(result).to.equal(35);
    });

    it("GIVEN REG_D 506_C WHEN buildMaxNonAccreditedInvestors THEN returns REG_D 506_C max non-accredited investors", async () => {
      const result = await regulationHelper.testBuildMaxNonAccreditedInvestors(
        RegulationType.REG_D,
        RegulationSubType.REG_D_506_C,
      );
      expect(result).to.equal(0);
    });
  });

  describe("buildManualInvestorVerification", () => {
    it("GIVEN REG_S WHEN buildManualInvestorVerification THEN returns REG_S manual investor verification", async () => {
      const result = await regulationHelper.testBuildManualInvestorVerification(
        RegulationType.REG_S,
        RegulationSubType.NONE,
      );
      expect(result).to.equal(ManualInvestorVerification.VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED);
    });

    it("GIVEN REG_D 506_B WHEN buildManualInvestorVerification THEN returns REG_D 506_B manual investor verification", async () => {
      const result = await regulationHelper.testBuildManualInvestorVerification(
        RegulationType.REG_D,
        RegulationSubType.REG_D_506_B,
      );
      expect(result).to.equal(ManualInvestorVerification.VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED);
    });

    it("GIVEN REG_D 506_C WHEN buildManualInvestorVerification THEN returns REG_D 506_C manual investor verification", async () => {
      const result = await regulationHelper.testBuildManualInvestorVerification(
        RegulationType.REG_D,
        RegulationSubType.REG_D_506_C,
      );
      expect(result).to.equal(ManualInvestorVerification.VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED);
    });
  });

  describe("buildInternationalInvestors", () => {
    it("GIVEN REG_S WHEN buildInternationalInvestors THEN returns REG_S international investors", async () => {
      const result = await regulationHelper.testBuildInternationalInvestors(
        RegulationType.REG_S,
        RegulationSubType.NONE,
      );
      expect(result).to.equal(InternationalInvestors.ALLOWED);
    });

    it("GIVEN REG_D 506_B WHEN buildInternationalInvestors THEN returns REG_D 506_B international investors", async () => {
      const result = await regulationHelper.testBuildInternationalInvestors(
        RegulationType.REG_D,
        RegulationSubType.REG_D_506_B,
      );
      expect(result).to.equal(InternationalInvestors.NOT_ALLOWED);
    });

    it("GIVEN REG_D 506_C WHEN buildInternationalInvestors THEN returns REG_D 506_C international investors", async () => {
      const result = await regulationHelper.testBuildInternationalInvestors(
        RegulationType.REG_D,
        RegulationSubType.REG_D_506_C,
      );
      expect(result).to.equal(InternationalInvestors.NOT_ALLOWED);
    });
  });

  describe("buildResaleHoldPeriod", () => {
    it("GIVEN REG_S WHEN buildResaleHoldPeriod THEN returns REG_S resale hold period", async () => {
      const result = await regulationHelper.testBuildResaleHoldPeriod(RegulationType.REG_S, RegulationSubType.NONE);
      expect(result).to.equal(ResaleHoldPeriod.NOT_APPLICABLE);
    });

    it("GIVEN REG_D 506_B WHEN buildResaleHoldPeriod THEN returns REG_D 506_B resale hold period", async () => {
      const result = await regulationHelper.testBuildResaleHoldPeriod(
        RegulationType.REG_D,
        RegulationSubType.REG_D_506_B,
      );
      expect(result).to.equal(ResaleHoldPeriod.APPLICABLE_FROM_6_MOTHS_TO_1_YEAR);
    });

    it("GIVEN REG_D 506_C WHEN buildResaleHoldPeriod THEN returns REG_D 506_C resale hold period", async () => {
      const result = await regulationHelper.testBuildResaleHoldPeriod(
        RegulationType.REG_D,
        RegulationSubType.REG_D_506_C,
      );
      expect(result).to.equal(ResaleHoldPeriod.APPLICABLE_FROM_6_MOTHS_TO_1_YEAR);
    });
  });

  describe("checkRegulationTypeAndSubType", () => {
    it("GIVEN valid REG_S type and NONE subtype WHEN checkRegulationTypeAndSubType THEN does not revert", async () => {
      await expect(regulationHelper.testCheckRegulationTypeAndSubType(RegulationType.REG_S, RegulationSubType.NONE)).to
        .not.be.reverted;
    });

    it("GIVEN valid REG_D type and 506_B subtype WHEN checkRegulationTypeAndSubType THEN does not revert", async () => {
      await expect(
        regulationHelper.testCheckRegulationTypeAndSubType(RegulationType.REG_D, RegulationSubType.REG_D_506_B),
      ).to.not.be.reverted;
    });

    it("GIVEN valid REG_D type and 506_C subtype WHEN checkRegulationTypeAndSubType THEN does not revert", async () => {
      await expect(
        regulationHelper.testCheckRegulationTypeAndSubType(RegulationType.REG_D, RegulationSubType.REG_D_506_C),
      ).to.not.be.reverted;
    });

    it("GIVEN invalid REG_S type and non-NONE subtype WHEN checkRegulationTypeAndSubType THEN reverts", async () => {
      await expect(
        regulationHelper.testCheckRegulationTypeAndSubType(RegulationType.REG_S, RegulationSubType.REG_D_506_B),
      ).to.be.revertedWithCustomError(regulationHelper, "RegulationTypeAndSubTypeForbidden");
    });

    it("GIVEN invalid REG_D type and NONE subtype WHEN checkRegulationTypeAndSubType THEN reverts", async () => {
      await expect(
        regulationHelper.testCheckRegulationTypeAndSubType(RegulationType.REG_D, RegulationSubType.NONE),
      ).to.be.revertedWithCustomError(regulationHelper, "RegulationTypeAndSubTypeForbidden");
    });

    it("GIVEN invalid NONE type WHEN checkRegulationTypeAndSubType THEN reverts", async () => {
      await expect(
        regulationHelper.testCheckRegulationTypeAndSubType(RegulationType.NONE, RegulationSubType.NONE),
      ).to.be.revertedWithCustomError(regulationHelper, "RegulationTypeAndSubTypeForbidden");
    });
  });

  describe("isValidTypeAndSubType", () => {
    it("GIVEN valid REG_S and NONE WHEN isValidTypeAndSubType THEN returns true", async () => {
      const result = await regulationHelper.testIsValidTypeAndSubType(RegulationType.REG_S, RegulationSubType.NONE);
      expect(result).to.be.true;
    });

    it("GIVEN valid REG_D and 506_B WHEN isValidTypeAndSubType THEN returns true", async () => {
      const result = await regulationHelper.testIsValidTypeAndSubType(
        RegulationType.REG_D,
        RegulationSubType.REG_D_506_B,
      );
      expect(result).to.be.true;
    });

    it("GIVEN valid REG_D and 506_C WHEN isValidTypeAndSubType THEN returns true", async () => {
      const result = await regulationHelper.testIsValidTypeAndSubType(
        RegulationType.REG_D,
        RegulationSubType.REG_D_506_C,
      );
      expect(result).to.be.true;
    });

    it("GIVEN invalid REG_S and 506_B WHEN isValidTypeAndSubType THEN returns false", async () => {
      const result = await regulationHelper.testIsValidTypeAndSubType(
        RegulationType.REG_S,
        RegulationSubType.REG_D_506_B,
      );
      expect(result).to.be.false;
    });

    it("GIVEN invalid REG_D and NONE WHEN isValidTypeAndSubType THEN returns false", async () => {
      const result = await regulationHelper.testIsValidTypeAndSubType(RegulationType.REG_D, RegulationSubType.NONE);
      expect(result).to.be.false;
    });

    it("GIVEN invalid NONE types WHEN isValidTypeAndSubType THEN returns false", async () => {
      const result = await regulationHelper.testIsValidTypeAndSubType(RegulationType.NONE, RegulationSubType.NONE);
      expect(result).to.be.false;
    });
  });

  describe("isValidTypeAndSubTypeForRegS", () => {
    it("GIVEN valid REG_S and NONE WHEN isValidTypeAndSubTypeForRegS THEN returns true", async () => {
      const result = await regulationHelper.testIsValidTypeAndSubTypeForRegS(
        RegulationType.REG_S,
        RegulationSubType.NONE,
      );
      expect(result).to.be.true;
    });

    it("GIVEN invalid REG_S and non-NONE WHEN isValidTypeAndSubTypeForRegS THEN returns false", async () => {
      const result = await regulationHelper.testIsValidTypeAndSubTypeForRegS(
        RegulationType.REG_S,
        RegulationSubType.REG_D_506_B,
      );
      expect(result).to.be.false;
    });

    it("GIVEN invalid REG_D WHEN isValidTypeAndSubTypeForRegS THEN returns false", async () => {
      const result = await regulationHelper.testIsValidTypeAndSubTypeForRegS(
        RegulationType.REG_D,
        RegulationSubType.REG_D_506_B,
      );
      expect(result).to.be.false;
    });
  });

  describe("isValidTypeAndSubTypeForRegD", () => {
    it("GIVEN valid REG_D and 506_B WHEN isValidTypeAndSubTypeForRegD THEN returns true", async () => {
      const result = await regulationHelper.testIsValidTypeAndSubTypeForRegD(
        RegulationType.REG_D,
        RegulationSubType.REG_D_506_B,
      );
      expect(result).to.be.true;
    });

    it("GIVEN valid REG_D and 506_C WHEN isValidTypeAndSubTypeForRegD THEN returns true", async () => {
      const result = await regulationHelper.testIsValidTypeAndSubTypeForRegD(
        RegulationType.REG_D,
        RegulationSubType.REG_D_506_C,
      );
      expect(result).to.be.true;
    });

    it("GIVEN invalid REG_D and NONE WHEN isValidTypeAndSubTypeForRegD THEN returns false", async () => {
      const result = await regulationHelper.testIsValidTypeAndSubTypeForRegD(
        RegulationType.REG_D,
        RegulationSubType.NONE,
      );
      expect(result).to.be.false;
    });

    it("GIVEN invalid REG_S WHEN isValidTypeAndSubTypeForRegD THEN returns false", async () => {
      const result = await regulationHelper.testIsValidTypeAndSubTypeForRegD(
        RegulationType.REG_S,
        RegulationSubType.NONE,
      );
      expect(result).to.be.false;
    });

    it("GIVEN invalid NONE type WHEN isValidTypeAndSubTypeForRegD THEN returns false", async () => {
      const result = await regulationHelper.testIsValidTypeAndSubTypeForRegD(
        RegulationType.NONE,
        RegulationSubType.NONE,
      );
      expect(result).to.be.false;
    });
  });
});
