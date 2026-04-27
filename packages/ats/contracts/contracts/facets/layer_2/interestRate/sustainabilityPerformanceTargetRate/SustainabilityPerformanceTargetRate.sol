// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISustainabilityPerformanceTargetRate } from "./ISustainabilityPerformanceTargetRate.sol";
import { INTEREST_RATE_MANAGER_ROLE } from "../../../../constants/roles.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";
import { ProceedRecipientsStorageWrapper } from "../../../../domain/asset/ProceedRecipientsStorageWrapper.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

contract SustainabilityPerformanceTargetRate is ISustainabilityPerformanceTargetRate, Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_SustainabilityPerformanceTargetRate(
        InterestRate calldata _interestRate,
        ImpactData[] calldata _impactData,
        address[] calldata _projects
    )
        external
        override
        onlyNotSustainabilityPerformanceTargetRateInitialized
        onlyValidEqualLength(_impactData.length, _projects.length)
    {
        InterestRateStorageWrapper.initializeSustainabilityPerformanceTargetRate(
            _interestRate,
            _impactData,
            _projects,
            ProceedRecipientsStorageWrapper.isProceedRecipient
        );
    }

    function setInterestRate(
        InterestRate calldata _newInterestRate
    ) external onlyUnpaused onlyRole(INTEREST_RATE_MANAGER_ROLE) {
        InterestRateStorageWrapper.setSPTInterestRate(_newInterestRate);
        emit InterestRateUpdated(EvmAccessors.getMsgSender(), _newInterestRate);
    }

    function setImpactData(
        ImpactData[] calldata _newImpactData,
        address[] calldata _projects
    )
        external
        onlyUnpaused
        onlyRole(INTEREST_RATE_MANAGER_ROLE)
        onlyValidEqualLength(_newImpactData.length, _projects.length)
    {
        for (uint256 index = 0; index < _newImpactData.length; index++) {
            if (!ProceedRecipientsStorageWrapper.isProceedRecipient(_projects[index])) {
                revert NotExistingProject(_projects[index]);
            }
            InterestRateStorageWrapper.setSPTImpactData(_newImpactData[index], _projects[index]);
        }
        emit ImpactDataUpdated(EvmAccessors.getMsgSender(), _newImpactData, _projects);
    }

    function getInterestRate() external view returns (InterestRate memory interestRate_) {
        interestRate_ = InterestRateStorageWrapper.getSPTInterestRate();
    }

    function getImpactDataFor(address _project) external view returns (ImpactData memory impactData_) {
        impactData_ = InterestRateStorageWrapper.getSPTImpactDataFor(_project);
    }
}
