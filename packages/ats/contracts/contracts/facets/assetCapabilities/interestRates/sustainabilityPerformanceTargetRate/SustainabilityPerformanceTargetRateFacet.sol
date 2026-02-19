// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ISustainabilityPerformanceTargetRate
} from "../../interfaces/interestRates/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import {
    IScheduledCrossOrderedTasks
} from "../../interfaces/scheduledTasks/scheduledCrossOrderedTasks/IScheduledCrossOrderedTasks.sol";
import { LibInterestRate } from "../../../../lib/domain/LibInterestRate.sol";
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../../lib/core/LibAccess.sol";
import { LibProceedRecipients } from "../../../../lib/domain/LibProceedRecipients.sol";
import { _SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/assets.sol";
import { _INTEREST_RATE_MANAGER_ROLE } from "../../../../constants/roles.sol";

contract SustainabilityPerformanceTargetRateFacet is ISustainabilityPerformanceTargetRate, IStaticFunctionSelectors {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_SustainabilityPerformanceTargetRate(
        InterestRate calldata _interestRate,
        ImpactData[] calldata _impactData,
        address[] calldata _projects
    ) external override {
        if (LibInterestRate.isSustainabilityRateInitialized()) revert AlreadyInitialized();
        if (_impactData.length != _projects.length)
            revert ProvidedListsLengthMismatch(_impactData.length, _projects.length);

        LibInterestRate.initializeSustainabilityRate(
            _interestRate.baseRate,
            _interestRate.startPeriod,
            _interestRate.startRate,
            _interestRate.rateDecimals
        );

        for (uint256 index = 0; index < _impactData.length; index++) {
            if (!LibProceedRecipients.isProceedRecipient(_projects[index])) revert NotExistingProject(_projects[index]);
            LibInterestRate.setSustainabilityImpactData(_projects[index], _impactData[index]);
        }
    }

    function setInterestRate(InterestRate calldata _newInterestRate) external override {
        LibAccess.checkRole(_INTEREST_RATE_MANAGER_ROLE);
        LibPause.requireNotPaused();
        IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();
        LibInterestRate.setSustainabilityInterestRate(_newInterestRate);
        emit InterestRateUpdated(msg.sender, _newInterestRate);
    }

    function setImpactData(ImpactData[] calldata _newImpactData, address[] calldata _projects) external override {
        LibAccess.checkRole(_INTEREST_RATE_MANAGER_ROLE);
        LibPause.requireNotPaused();
        if (_newImpactData.length != _projects.length)
            revert ProvidedListsLengthMismatch(_newImpactData.length, _projects.length);

        for (uint256 index = 0; index < _newImpactData.length; index++) {
            if (!LibProceedRecipients.isProceedRecipient(_projects[index])) revert NotExistingProject(_projects[index]);
            IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();
            LibInterestRate.setSustainabilityImpactData(_projects[index], _newImpactData[index]);
        }

        emit ImpactDataUpdated(msg.sender, _newImpactData, _projects);
    }

    function getInterestRate() external view override returns (InterestRate memory interestRate_) {
        return LibInterestRate.getSustainabilityInterestRate();
    }

    function getImpactDataFor(address _project) external view override returns (ImpactData memory impactData_) {
        return LibInterestRate.getSustainabilityImpactData(_project);
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_SustainabilityPerformanceTargetRate.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setInterestRate.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setImpactData.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getInterestRate.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getImpactDataFor.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ISustainabilityPerformanceTargetRate).interfaceId;
    }
}
