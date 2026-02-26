// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _REGS_DEAL_SIZE,
    _REGS_ACCREDITED_INVESTORS,
    _REGS_MAX_NON_ACCREDITED_INVESTORS,
    _REGS_MANUAL_INVESTOR_VERIFICATION,
    _REGS_INTERNATIONAL_INVESTORS,
    _REGS_RESALE_HOLD_PERIOD,
    _REGD_506_B_DEAL_SIZE,
    _REGD_506_B_ACCREDITED_INVESTORS,
    _REGD_506_B_MAX_NON_ACCREDITED_INVESTORS,
    _REGD_506_B_MANUAL_INVESTOR_VERIFICATION,
    _REGD_506_B_INTERNATIONAL_INVESTORS,
    _REGD_506_B_RESALE_HOLD_PERIOD,
    _REGD_506_C_DEAL_SIZE,
    _REGD_506_C_ACCREDITED_INVESTORS,
    _REGD_506_C_MAX_NON_ACCREDITED_INVESTORS,
    _REGD_506_C_MANUAL_INVESTOR_VERIFICATION,
    _REGD_506_C_INTERNATIONAL_INVESTORS,
    _REGD_506_C_RESALE_HOLD_PERIOD,
    RegulationType,
    RegulationSubType,
    AccreditedInvestors,
    ManualInvestorVerification,
    InternationalInvestors,
    ResaleHoldPeriod,
    RegulationData,
    RegulationTypeAndSubTypeForbidden
} from "../../facets/regulation/constants/regulation.sol";

library LibRegulation {
    function buildRegulationData(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) internal pure returns (RegulationData memory regulationData_) {
        regulationData_ = RegulationData({
            regulationType: _regulationType,
            regulationSubType: _regulationSubType,
            dealSize: buildDealSize(_regulationType, _regulationSubType),
            accreditedInvestors: buildAccreditedInvestors(_regulationType, _regulationSubType),
            maxNonAccreditedInvestors: buildMaxNonAccreditedInvestors(_regulationType, _regulationSubType),
            manualInvestorVerification: buildManualInvestorVerification(_regulationType, _regulationSubType),
            internationalInvestors: buildInternationalInvestors(_regulationType, _regulationSubType),
            resaleHoldPeriod: buildResaleHoldPeriod(_regulationType, _regulationSubType)
        });
    }

    function buildDealSize(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) internal pure returns (uint256 dealSize_) {
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
    ) internal pure returns (AccreditedInvestors accreditedInvestors_) {
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
    ) internal pure returns (uint256 maxNonAccreditedInvestors_) {
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
    ) internal pure returns (ManualInvestorVerification manualInvestorVerification_) {
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
    ) internal pure returns (InternationalInvestors internationalInvestors_) {
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
    ) internal pure returns (ResaleHoldPeriod resaleHoldPeriod_) {
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
    ) internal pure {
        if (isValidTypeAndSubType(_regulationType, _regulationSubType)) {
            return;
        }
        revert RegulationTypeAndSubTypeForbidden(_regulationType, _regulationSubType);
    }

    function isValidTypeAndSubType(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) internal pure returns (bool isValid_) {
        isValid_ =
            isValidTypeAndSubTypeForRegS(_regulationType, _regulationSubType) ||
            isValidTypeAndSubTypeForRegD(_regulationType, _regulationSubType);
    }

    function isValidTypeAndSubTypeForRegS(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) internal pure returns (bool isValid_) {
        isValid_ = _regulationType == RegulationType.REG_S && _regulationSubType == RegulationSubType.NONE;
    }

    function isValidTypeAndSubTypeForRegD(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) internal pure returns (bool isValid_) {
        isValid_ = _regulationType == RegulationType.REG_D && _regulationSubType != RegulationSubType.NONE;
    }
}
