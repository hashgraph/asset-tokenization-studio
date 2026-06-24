// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/constants/regulation.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

// CANONICAL SOURCE — single source of truth for ATS regulation types.
// A pragma-rewritten copy is auto-generated to
// `contracts/factory/ERC3643/interfaces/regulation.sol` on every compile by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts` for T-REX ABI compatibility.
// Do NOT edit the generated copy — it is rewritten on every `npx hardhat compile`.

uint256 constant REGS_DEAL_SIZE = 0;
AccreditedInvestors constant REGS_ACCREDITED_INVESTORS = AccreditedInvestors.ACCREDITATION_REQUIRED;
uint256 constant REGS_MAX_NON_ACCREDITED_INVESTORS = 0;
ManualInvestorVerification constant REGS_MANUAL_INVESTOR_VERIFICATION = ManualInvestorVerification
    .VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED;
InternationalInvestors constant REGS_INTERNATIONAL_INVESTORS = InternationalInvestors.ALLOWED;
ResaleHoldPeriod constant REGS_RESALE_HOLD_PERIOD = ResaleHoldPeriod.NOT_APPLICABLE;

uint256 constant REGD_506_B_DEAL_SIZE = 0;
AccreditedInvestors constant REGD_506_B_ACCREDITED_INVESTORS = AccreditedInvestors.ACCREDITATION_REQUIRED;
uint256 constant REGD_506_B_MAX_NON_ACCREDITED_INVESTORS = 35;
ManualInvestorVerification constant REGD_506_B_MANUAL_INVESTOR_VERIFICATION = ManualInvestorVerification
    .VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED;
InternationalInvestors constant REGD_506_B_INTERNATIONAL_INVESTORS = InternationalInvestors.NOT_ALLOWED;
ResaleHoldPeriod constant REGD_506_B_RESALE_HOLD_PERIOD = ResaleHoldPeriod.APPLICABLE_FROM_6_MOTHS_TO_1_YEAR;

uint256 constant REGD_506_C_DEAL_SIZE = 0;
AccreditedInvestors constant REGD_506_C_ACCREDITED_INVESTORS = AccreditedInvestors.ACCREDITATION_REQUIRED;
uint256 constant REGD_506_C_MAX_NON_ACCREDITED_INVESTORS = 0;
ManualInvestorVerification constant REGD_506_C_MANUAL_INVESTOR_VERIFICATION = ManualInvestorVerification
    .VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED;
InternationalInvestors constant REGD_506_C_INTERNATIONAL_INVESTORS = InternationalInvestors.NOT_ALLOWED;
ResaleHoldPeriod constant REGD_506_C_RESALE_HOLD_PERIOD = ResaleHoldPeriod.APPLICABLE_FROM_6_MOTHS_TO_1_YEAR;

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

function _buildRegulationData(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (RegulationData memory regulationData_) {
    regulationData_ = RegulationData({
        regulationType: _regulationType,
        regulationSubType: _regulationSubType,
        dealSize: _buildDealSize(_regulationType, _regulationSubType),
        accreditedInvestors: _buildAccreditedInvestors(_regulationType, _regulationSubType),
        maxNonAccreditedInvestors: _buildMaxNonAccreditedInvestors(_regulationType, _regulationSubType),
        manualInvestorVerification: _buildManualInvestorVerification(_regulationType, _regulationSubType),
        internationalInvestors: _buildInternationalInvestors(_regulationType, _regulationSubType),
        resaleHoldPeriod: _buildResaleHoldPeriod(_regulationType, _regulationSubType)
    });
}

function _buildDealSize(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (uint256 dealSize_) {
    if (_regulationType == RegulationType.REG_S) {
        return REGS_DEAL_SIZE;
    }
    if (_regulationSubType == RegulationSubType.REG_D_506_B) {
        return REGD_506_B_DEAL_SIZE;
    }
    dealSize_ = REGD_506_C_DEAL_SIZE;
}

function _buildAccreditedInvestors(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (AccreditedInvestors accreditedInvestors_) {
    if (_regulationType == RegulationType.REG_S) {
        return REGS_ACCREDITED_INVESTORS;
    }
    if (_regulationSubType == RegulationSubType.REG_D_506_B) {
        return REGD_506_B_ACCREDITED_INVESTORS;
    }
    accreditedInvestors_ = REGD_506_C_ACCREDITED_INVESTORS;
}

function _buildMaxNonAccreditedInvestors(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (uint256 maxNonAccreditedInvestors_) {
    if (_regulationType == RegulationType.REG_S) {
        return REGS_MAX_NON_ACCREDITED_INVESTORS;
    }
    if (_regulationSubType == RegulationSubType.REG_D_506_B) {
        return REGD_506_B_MAX_NON_ACCREDITED_INVESTORS;
    }
    maxNonAccreditedInvestors_ = REGD_506_C_MAX_NON_ACCREDITED_INVESTORS;
}

function _buildManualInvestorVerification(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (ManualInvestorVerification manualInvestorVerification_) {
    if (_regulationType == RegulationType.REG_S) {
        return REGS_MANUAL_INVESTOR_VERIFICATION;
    }
    if (_regulationSubType == RegulationSubType.REG_D_506_B) {
        return REGD_506_B_MANUAL_INVESTOR_VERIFICATION;
    }
    manualInvestorVerification_ = REGD_506_C_MANUAL_INVESTOR_VERIFICATION;
}

function _buildInternationalInvestors(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (InternationalInvestors internationalInvestors_) {
    if (_regulationType == RegulationType.REG_S) {
        return REGS_INTERNATIONAL_INVESTORS;
    }
    if (_regulationSubType == RegulationSubType.REG_D_506_B) {
        return REGD_506_B_INTERNATIONAL_INVESTORS;
    }
    internationalInvestors_ = REGD_506_C_INTERNATIONAL_INVESTORS;
}

function _buildResaleHoldPeriod(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (ResaleHoldPeriod resaleHoldPeriod_) {
    if (_regulationType == RegulationType.REG_S) {
        return REGS_RESALE_HOLD_PERIOD;
    }
    if (_regulationSubType == RegulationSubType.REG_D_506_B) {
        return REGD_506_B_RESALE_HOLD_PERIOD;
    }
    resaleHoldPeriod_ = REGD_506_C_RESALE_HOLD_PERIOD;
}

function _checkRegulationTypeAndSubType(RegulationType _regulationType, RegulationSubType _regulationSubType) pure {
    if (_isValidTypeAndSubType(_regulationType, _regulationSubType)) {
        return;
    }
    revert RegulationTypeAndSubTypeForbidden(_regulationType, _regulationSubType);
}

function _isValidTypeAndSubType(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (bool isValid_) {
    isValid_ =
        _isValidTypeAndSubTypeForRegS(_regulationType, _regulationSubType) ||
        _isValidTypeAndSubTypeForRegD(_regulationType, _regulationSubType);
}

function _isValidTypeAndSubTypeForRegS(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (bool isValid_) {
    isValid_ = _regulationType == RegulationType.REG_S && _regulationSubType == RegulationSubType.NONE;
}

function _isValidTypeAndSubTypeForRegD(
    RegulationType _regulationType,
    RegulationSubType _regulationSubType
) pure returns (bool isValid_) {
    isValid_ = _regulationType == RegulationType.REG_D && _regulationSubType != RegulationSubType.NONE;
}
