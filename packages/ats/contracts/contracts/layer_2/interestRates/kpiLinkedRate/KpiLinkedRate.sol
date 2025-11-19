// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Common } from "../../../layer_1/common/Common.sol";
import { IKpiLinkedRate } from "../../interfaces/interestRates/kpiLinkedRate/IKpiLinkedRate.sol";
import { _INTEREST_RATE_MANAGER_ROLE } from "../../constants/roles.sol";

contract KpiLinkedRate is IKpiLinkedRate, Common {
    function initialize_KpiLinkedRate(
        InterestRate calldata _interestRate,
        ImpactData calldata _impactData,
        address kpiOracle
    ) external override onlyUninitialized(_kpiLinkedRateStorage().initialized) {
        _setInterestRate(_interestRate);
        _setImpactData(_impactData);
        _setKpiOracle(kpiOracle);
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

    function setKpiOracle(address _kpiOracle) external onlyRole(_INTEREST_RATE_MANAGER_ROLE) onlyUnpaused {
        _setKpiOracle(_kpiOracle);
        emit KpiOracleUpdated(_msgSender(), _kpiOracle);
    }

    function getInterestRate() external view returns (InterestRate memory interestRate_) {
        interestRate_ = _getInterestRate();
    }

    function getImpactData() external view returns (ImpactData memory impactData_) {
        impactData_ = _getImpactData();
    }

    function getKpiOracle() external view returns (address kpiOracle_) {
        return _getKpiOracle();
    }
}
