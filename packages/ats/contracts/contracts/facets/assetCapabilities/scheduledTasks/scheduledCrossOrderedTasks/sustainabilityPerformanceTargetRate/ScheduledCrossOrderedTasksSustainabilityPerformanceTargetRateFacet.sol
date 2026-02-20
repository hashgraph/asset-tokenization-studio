// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _SCHEDULED_CROSS_ORDERED_TASKS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY
} from "../../../../../constants/resolverKeys/assets.sol";
// solhint-disable-next-line max-line-length
import {
    ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRate
} from "./ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRate.sol";
import {
    IScheduledCrossOrderedTasks
} from "../../../interfaces/scheduledTasks/scheduledCrossOrderedTasks/IScheduledCrossOrderedTasks.sol";
import { IStaticFunctionSelectors } from "../../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";

contract ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacet is
    ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRate,
    IStaticFunctionSelectors
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SCHEDULED_CROSS_ORDERED_TASKS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](4);
        staticFunctionSelectors_[selectorIndex++] = this.triggerPendingScheduledCrossOrderedTasks.selector;
        staticFunctionSelectors_[selectorIndex++] = this.triggerScheduledCrossOrderedTasks.selector;
        staticFunctionSelectors_[selectorIndex++] = this.scheduledCrossOrderedTaskCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getScheduledCrossOrderedTasks.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IScheduledCrossOrderedTasks).interfaceId;
    }
}
