// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    CommonKpiLinkedInterestRate
} from "../../../layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/Common.sol";
import { IKpiLinkedRate } from "../../interfaces/interestRates/kpiLinkedRate/IKpiLinkedRate.sol";
import { _INTEREST_RATE_MANAGER_ROLE } from "../../constants/roles.sol";

contract KpiLinkedRate is IKpiLinkedRate, CommonKpiLinkedInterestRate {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_KpiLinkedRate(
        InterestRate calldata _interestRate,
        ImpactData calldata _impactData
    ) external override onlyUninitialized(_kpiLinkedRateStorage().initialized) {
        _setInterestRate(_interestRate);
        _setImpactData(_impactData);
        _kpiLinkedRateStorage().initialized = true;
    }

    function setInterestRate(
        InterestRate calldata _newInterestRate
    ) external onlyRole(_INTEREST_RATE_MANAGER_ROLE) onlyUnpaused checkInterestRate(_newInterestRate) {
        _setInterestRate(_newInterestRate);
        emit InterestRateUpdated(_msgSender(), _newInterestRate);
    }

    function setImpactData(
        ImpactData calldata _newImpactData
    ) external onlyRole(_INTEREST_RATE_MANAGER_ROLE) onlyUnpaused checkImpactData(_newImpactData) {
        _setImpactData(_newImpactData);
        emit ImpactDataUpdated(_msgSender(), _newImpactData);
    }

    function getInterestRate() external view returns (InterestRate memory interestRate_) {
        interestRate_ = _getInterestRate();
    }

    function getImpactData() external view returns (ImpactData memory impactData_) {
        impactData_ = _getImpactData();
    }
}
