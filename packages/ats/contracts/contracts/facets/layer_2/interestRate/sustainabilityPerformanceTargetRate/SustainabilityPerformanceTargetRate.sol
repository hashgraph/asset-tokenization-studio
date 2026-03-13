// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISustainabilityPerformanceTargetRate } from "./ISustainabilityPerformanceTargetRate.sol";
import { _INTEREST_RATE_MANAGER_ROLE } from "../../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";
import { ProceedRecipientsStorageWrapper } from "../../../../domain/asset/ProceedRecipientsStorageWrapper.sol";

contract SustainabilityPerformanceTargetRate is ISustainabilityPerformanceTargetRate {
    error AlreadyInitialized();
    // solhint-disable-next-line func-name-mixedcase
    function initialize_SustainabilityPerformanceTargetRate(
        InterestRate calldata _interestRate,
        ImpactData[] calldata _impactData,
        address[] calldata _projects
    ) external override {
        if (InterestRateStorageWrapper._isSustainabilityPerformanceTargetRateInitialized()) {
            revert AlreadyInitialized();
        }
        InterestRateStorageWrapper._requireEqualLength(_impactData.length, _projects.length);
        InterestRateStorageWrapper._initialize_SustainabilityPerformanceTargetRate(
            _interestRate,
            _impactData,
            _projects
        );
    }

    function setInterestRate(InterestRate calldata _newInterestRate) external {
        AccessControlStorageWrapper._checkRole(_INTEREST_RATE_MANAGER_ROLE, msg.sender);
        PauseStorageWrapper._requireNotPaused();
        InterestRateStorageWrapper._setSPTInterestRate(_newInterestRate);
        emit InterestRateUpdated(msg.sender, _newInterestRate);
    }

    function setImpactData(ImpactData[] calldata _newImpactData, address[] calldata _projects) external {
        AccessControlStorageWrapper._checkRole(_INTEREST_RATE_MANAGER_ROLE, msg.sender);
        PauseStorageWrapper._requireNotPaused();
        InterestRateStorageWrapper._requireEqualLength(_newImpactData.length, _projects.length);
        for (uint256 index = 0; index < _newImpactData.length; index++) {
            if (!ProceedRecipientsStorageWrapper._isProceedRecipient(_projects[index])) {
                revert NotExistingProject(_projects[index]);
            }
            InterestRateStorageWrapper._setSPTImpactData(_newImpactData[index], _projects[index]);
        }
        emit ImpactDataUpdated(msg.sender, _newImpactData, _projects);
    }

    function getInterestRate() external view returns (InterestRate memory interestRate_) {
        interestRate_ = InterestRateStorageWrapper._getSPTInterestRate();
    }

    function getImpactDataFor(address _project) external view returns (ImpactData memory impactData_) {
        impactData_ = InterestRateStorageWrapper._getSPTImpactDataFor(_project);
    }
}
