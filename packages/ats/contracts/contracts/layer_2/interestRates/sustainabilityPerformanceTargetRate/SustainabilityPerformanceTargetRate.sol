// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CommonSustainabilityPerformanceTargetInterestRate } from "contracts/layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Common.sol";
import {
    ISustainabilityPerformanceTargetRate
} from "../../interfaces/interestRates/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
import { _INTEREST_RATE_MANAGER_ROLE } from "../../constants/roles.sol";

contract SustainabilityPerformanceTargetRate is
    ISustainabilityPerformanceTargetRate,
    CommonSustainabilityPerformanceTargetInterestRate
{
    // solhint-disable-next-line func-name-mixedcase
    function initialize_SustainabilityPerformanceTargetRate(
        InterestRate calldata _interestRate,
        ImpactData[] calldata _impactData,
        address[] calldata _projects
    ) external override onlyUninitialized(_sustainabilityPerformanceTargetRateStorage().initialized) {
        _setSPTInterestRate(_interestRate);
        for (uint256 index = 0; index < _impactData.length; index++) {
            if (!_isProceedRecipient(_projects[index])) revert NotExistingProject(_projects[index]);
            _setSPTImpactData(_impactData[index], _projects[index]);
        }

        _sustainabilityPerformanceTargetRateStorage().initialized = true;
    }

    function setInterestRate(
        InterestRate calldata _newInterestRate
    ) external onlyRole(_INTEREST_RATE_MANAGER_ROLE) onlyUnpaused {
        _setSPTInterestRate(_newInterestRate);
        emit InterestRateUpdated(_msgSender(), _newInterestRate);
    }

    function setImpactData(
        ImpactData[] calldata _newImpactData,
        address[] calldata _projects
    ) external onlyRole(_INTEREST_RATE_MANAGER_ROLE) onlyUnpaused {
        for (uint256 index = 0; index < _newImpactData.length; index++) {
            if (!_isProceedRecipient(_projects[index])) revert NotExistingProject(_projects[index]);
            _setSPTImpactData(_newImpactData[index], _projects[index]);
        }

        emit ImpactDataUpdated(_msgSender(), _newImpactData, _projects);
    }

    function getInterestRate() external view returns (InterestRate memory interestRate_) {
        interestRate_ = _getSPTInterestRate();
    }

    function getImpactDataFor(address _project) external view returns (ImpactData memory impactData_) {
        impactData_ = _getSPTImpactDataFor(_project);
    }
}
