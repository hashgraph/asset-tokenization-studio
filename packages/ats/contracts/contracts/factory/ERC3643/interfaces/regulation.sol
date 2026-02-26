// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

uint256 constant _REGS_DEAL_SIZE = 0;
AccreditedInvestors constant _REGS_ACCREDITED_INVESTORS = AccreditedInvestors.ACCREDITATION_REQUIRED;
uint256 constant _REGS_MAX_NON_ACCREDITED_INVESTORS = 0;
ManualInvestorVerification constant _REGS_MANUAL_INVESTOR_VERIFICATION = ManualInvestorVerification
    .VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED;
InternationalInvestors constant _REGS_INTERNATIONAL_INVESTORS = InternationalInvestors.ALLOWED;
ResaleHoldPeriod constant _REGS_RESALE_HOLD_PERIOD = ResaleHoldPeriod.NOT_APPLICABLE;

uint256 constant _REGD_506_B_DEAL_SIZE = 0;
AccreditedInvestors constant _REGD_506_B_ACCREDITED_INVESTORS = AccreditedInvestors.ACCREDITATION_REQUIRED;
uint256 constant _REGD_506_B_MAX_NON_ACCREDITED_INVESTORS = 35;
ManualInvestorVerification constant _REGD_506_B_MANUAL_INVESTOR_VERIFICATION = ManualInvestorVerification
    .VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED;
InternationalInvestors constant _REGD_506_B_INTERNATIONAL_INVESTORS = InternationalInvestors.NOT_ALLOWED;
ResaleHoldPeriod constant _REGD_506_B_RESALE_HOLD_PERIOD = ResaleHoldPeriod.APPLICABLE_FROM_6_MOTHS_TO_1_YEAR;

uint256 constant _REGD_506_C_DEAL_SIZE = 0;
AccreditedInvestors constant _REGD_506_C_ACCREDITED_INVESTORS = AccreditedInvestors.ACCREDITATION_REQUIRED;
uint256 constant _REGD_506_C_MAX_NON_ACCREDITED_INVESTORS = 0;
ManualInvestorVerification constant _REGD_506_C_MANUAL_INVESTOR_VERIFICATION = ManualInvestorVerification
    .VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED;
InternationalInvestors constant _REGD_506_C_INTERNATIONAL_INVESTORS = InternationalInvestors.NOT_ALLOWED;
ResaleHoldPeriod constant _REGD_506_C_RESALE_HOLD_PERIOD = ResaleHoldPeriod.APPLICABLE_FROM_6_MOTHS_TO_1_YEAR;

enum RegulationType {
    NONE,
    REG_S,
    REG_D
}

enum RegulationSubType {
    NONE,
    REG_D_506_B,
    REG_D_506_C
}

enum AccreditedInvestors {
    NONE,
    ACCREDITATION_REQUIRED
}

enum ManualInvestorVerification {
    NOTHING_TO_VERIFY,
    VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED
}

enum InternationalInvestors {
    NOT_ALLOWED,
    ALLOWED
}

enum ResaleHoldPeriod {
    NOT_APPLICABLE,
    APPLICABLE_FROM_6_MOTHS_TO_1_YEAR
}

struct AdditionalSecurityData {
    bool countriesControlListType;
    string listOfCountries;
    string info;
}

struct FactoryRegulationData {
    RegulationType regulationType;
    RegulationSubType regulationSubType;
    AdditionalSecurityData additionalSecurityData;
}

struct RegulationData {
    RegulationType regulationType;
    RegulationSubType regulationSubType;
    uint256 dealSize;
    AccreditedInvestors accreditedInvestors;
    uint256 maxNonAccreditedInvestors;
    ManualInvestorVerification manualInvestorVerification;
    InternationalInvestors internationalInvestors;
    ResaleHoldPeriod resaleHoldPeriod;
}

error RegulationTypeAndSubTypeForbidden(RegulationType regulationType, RegulationSubType regulationSubType);
