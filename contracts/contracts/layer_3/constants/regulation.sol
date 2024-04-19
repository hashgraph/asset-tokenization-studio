// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

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

error RegulationTypeAndSubTypeForbidden(
    RegulationType regulationType,
    RegulationSubType regulationSubType
);

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

uint256 constant _REGS_DEAL_SIZE = 0;
AccreditedInvestors constant _REGS_ACCREDITED_INVESTORS = AccreditedInvestors
    .ACCREDITATION_REQUIRED;
uint256 constant _REGS_MAX_NON_ACCREDITED_INVESTORS = 0;
ManualInvestorVerification constant _REGS_MANUAL_INVESTOR_VERIFICATION = ManualInvestorVerification
    .VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED;
InternationalInvestors constant _REGS_INTERNATIONAL_INVESTORS = InternationalInvestors
    .ALLOWED;
ResaleHoldPeriod constant _REGS_RESALE_HOLD_PERIOD = ResaleHoldPeriod
    .NOT_APPLICABLE;

uint256 constant _REGD_506_B_DEAL_SIZE = 0;
AccreditedInvestors constant _REGD_506_B_ACCREDITED_INVESTORS = AccreditedInvestors
    .ACCREDITATION_REQUIRED;
uint256 constant _REGD_506_B_MAX_NON_ACCREDITED_INVESTORS = 35;
ManualInvestorVerification constant _REGD_506_B_MANUAL_INVESTOR_VERIFICATION = ManualInvestorVerification
    .VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED;
InternationalInvestors constant _REGD_506_B_INTERNATIONAL_INVESTORS = InternationalInvestors
    .NOT_ALLOWED;
ResaleHoldPeriod constant _REGD_506_B_RESALE_HOLD_PERIOD = ResaleHoldPeriod
    .APPLICABLE_FROM_6_MOTHS_TO_1_YEAR;

uint256 constant _REGD_506_C_DEAL_SIZE = 0;
AccreditedInvestors constant _REGD_506_C_ACCREDITED_INVESTORS = AccreditedInvestors
    .ACCREDITATION_REQUIRED;
uint256 constant _REGD_506_C_MAX_NON_ACCREDITED_INVESTORS = 0;
ManualInvestorVerification constant _REGD_506_C_MANUAL_INVESTOR_VERIFICATION = ManualInvestorVerification
    .VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED;
InternationalInvestors constant _REGD_506_C_INTERNATIONAL_INVESTORS = InternationalInvestors
    .NOT_ALLOWED;
ResaleHoldPeriod constant _REGD_506_C_RESALE_HOLD_PERIOD = ResaleHoldPeriod
    .APPLICABLE_FROM_6_MOTHS_TO_1_YEAR;

function buildRegulationData(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (RegulationData memory regulationData_) {
    regulationData_ = RegulationData({
        regulationType: _regulationType,
        regulationSubType: _regulationSubType,
        dealSize: buildDealSize(_regulationType, _regulationSubType),
        accreditedInvestors: buildAccreditedInvestors(
            _regulationType,
            _regulationSubType
        ),
        maxNonAccreditedInvestors: buildMaxNonAccreditedInvestors(
            _regulationType,
            _regulationSubType
        ),
        manualInvestorVerification: buildManualInvestorVerification(
            _regulationType,
            _regulationSubType
        ),
        internationalInvestors: buildInternationalInvestors(
            _regulationType,
            _regulationSubType
        ),
        resaleHoldPeriod: buildResaleHoldPeriod(
            _regulationType,
            _regulationSubType
        )
    });
}

function buildDealSize(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (uint256 dealSize_) {
    if (_regulationType == RegulationType.REG_S) {
        return _REGS_DEAL_SIZE;
    }
    if (_regulationSubType == RegulationSubType.REG_D_506_B) {
        return _REGD_506_B_DEAL_SIZE;
    }
    dealSize_ = _REGD_506_C_DEAL_SIZE;
}

function buildAccreditedInvestors(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (AccreditedInvestors accreditedInvestors_) {
    if (_regulationType == RegulationType.REG_S) {
        return _REGS_ACCREDITED_INVESTORS;
    }
    if (_regulationSubType == RegulationSubType.REG_D_506_B) {
        return _REGD_506_B_ACCREDITED_INVESTORS;
    }
    accreditedInvestors_ = _REGD_506_C_ACCREDITED_INVESTORS;
}

function buildMaxNonAccreditedInvestors(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (uint256 maxNonAccreditedInvestors_) {
    if (_regulationType == RegulationType.REG_S) {
        return _REGS_MAX_NON_ACCREDITED_INVESTORS;
    }
    if (_regulationSubType == RegulationSubType.REG_D_506_B) {
        return _REGD_506_B_MAX_NON_ACCREDITED_INVESTORS;
    }
    maxNonAccreditedInvestors_ = _REGD_506_C_MAX_NON_ACCREDITED_INVESTORS;
}

function buildManualInvestorVerification(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (ManualInvestorVerification manualInvestorVerification_) {
    if (_regulationType == RegulationType.REG_S) {
        return _REGS_MANUAL_INVESTOR_VERIFICATION;
    }
    if (_regulationSubType == RegulationSubType.REG_D_506_B) {
        return _REGD_506_B_MANUAL_INVESTOR_VERIFICATION;
    }
    manualInvestorVerification_ = _REGD_506_C_MANUAL_INVESTOR_VERIFICATION;
}

function buildInternationalInvestors(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (InternationalInvestors internationalInvestors_) {
    if (_regulationType == RegulationType.REG_S) {
        return _REGS_INTERNATIONAL_INVESTORS;
    }
    if (_regulationSubType == RegulationSubType.REG_D_506_B) {
        return _REGD_506_B_INTERNATIONAL_INVESTORS;
    }
    internationalInvestors_ = _REGD_506_C_INTERNATIONAL_INVESTORS;
}

function buildResaleHoldPeriod(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (ResaleHoldPeriod resaleHoldPeriod_) {
    if (_regulationType == RegulationType.REG_S) {
        return _REGS_RESALE_HOLD_PERIOD;
    }
    if (_regulationSubType == RegulationSubType.REG_D_506_B) {
        return _REGD_506_B_RESALE_HOLD_PERIOD;
    }
    resaleHoldPeriod_ = _REGD_506_C_RESALE_HOLD_PERIOD;
}

function checkRegulationTypeAndSubType(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure {
    if (isValidTypeAndSubType(_regulationType, _regulationSubType)) {
        return;
    }
    revert RegulationTypeAndSubTypeForbidden(
        _regulationType,
        _regulationSubType
    );
}

function isValidTypeAndSubType(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (bool isValid_) {
    isValid_ =
        isValidTypeAndSubTypeForRegS(_regulationType, _regulationSubType) ||
        isValidTypeAndSubTypeForRegD(_regulationType, _regulationSubType);
}

function isValidTypeAndSubTypeForRegS(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (bool isValid_) {
    isValid_ =
        _regulationType == RegulationType.REG_S &&
        _regulationSubType == RegulationSubType.NONE;
}

function isValidTypeAndSubTypeForRegD(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (bool isValid_) {
    isValid_ =
        _regulationType == RegulationType.REG_D &&
        _regulationSubType != RegulationSubType.NONE;
}
