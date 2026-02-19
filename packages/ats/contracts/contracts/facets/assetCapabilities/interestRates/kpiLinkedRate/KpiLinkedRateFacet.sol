// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpiLinkedRate } from "../../interfaces/interestRates/kpiLinkedRate/IKpiLinkedRate.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import {
    IScheduledCrossOrderedTasks
} from "../../interfaces/scheduledTasks/scheduledCrossOrderedTasks/IScheduledCrossOrderedTasks.sol";
import { LibInterestRate } from "../../../../lib/domain/LibInterestRate.sol";
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../../lib/core/LibAccess.sol";
import { _KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/assets.sol";
import { _INTEREST_RATE_MANAGER_ROLE } from "../../../../constants/roles.sol";

contract KpiLinkedRateFacet is IKpiLinkedRate, IStaticFunctionSelectors {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_KpiLinkedRate(
        InterestRate calldata _interestRate,
        ImpactData calldata _impactData
    ) external override {
        if (LibInterestRate.isKpiLinkedRateInitialized()) revert AlreadyInitialized();
        LibInterestRate.initializeKpiLinkedRate(
            _interestRate.maxRate,
            _interestRate.baseRate,
            _interestRate.minRate,
            _interestRate.startPeriod,
            _interestRate.startRate,
            _interestRate.missedPenalty,
            _interestRate.reportPeriod,
            _interestRate.rateDecimals,
            _impactData.maxDeviationCap,
            _impactData.baseLine,
            _impactData.maxDeviationFloor,
            _impactData.adjustmentPrecision,
            _impactData.impactDataDecimals
        );
    }

    function setInterestRate(InterestRate calldata _newInterestRate) external override {
        LibAccess.checkRole(_INTEREST_RATE_MANAGER_ROLE);
        LibPause.requireNotPaused();
        LibInterestRate.requireValidKpiLinkedRate(_newInterestRate);
        IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();
        LibInterestRate.setKpiLinkedInterestRate(_newInterestRate);
        emit InterestRateUpdated(msg.sender, _newInterestRate);
    }

    function setImpactData(ImpactData calldata _newImpactData) external override {
        LibAccess.checkRole(_INTEREST_RATE_MANAGER_ROLE);
        LibPause.requireNotPaused();
        LibInterestRate.requireValidKpiLinkedImpactData(_newImpactData);
        IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();
        LibInterestRate.setKpiLinkedImpactData(_newImpactData);
        emit ImpactDataUpdated(msg.sender, _newImpactData);
    }

    function getInterestRate() external view override returns (InterestRate memory interestRate_) {
        return LibInterestRate.getKpiLinkedInterestRate();
    }

    function getImpactData() external view override returns (ImpactData memory impactData_) {
        return LibInterestRate.getKpiLinkedImpactData();
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _KPI_LINKED_RATE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_KpiLinkedRate.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setInterestRate.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setImpactData.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getInterestRate.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getImpactData.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IKpiLinkedRate).interfaceId;
    }
}
