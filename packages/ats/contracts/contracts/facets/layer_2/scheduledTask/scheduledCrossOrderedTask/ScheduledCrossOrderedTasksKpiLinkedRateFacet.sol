// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IScheduledCrossOrderedTasks,
    RESOLVER_KEY_SCHEDULED_CROSS_ORDERED_TASKS_KPI_LINKED_RATE
} from "./IScheduledCrossOrderedTasks.sol";
import { ScheduledCrossOrderedTasks } from "./ScheduledCrossOrderedTasks.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../../infrastructure/proxy/Bytes4Builder.sol";

contract ScheduledCrossOrderedTasksKpiLinkedRateFacet is ScheduledCrossOrderedTasks, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _getResolverKey();
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeScheduledCrossOrderedTasks.selector,
                this.triggerPendingScheduledCrossOrderedTasks.selector,
                this.triggerScheduledCrossOrderedTasks.selector,
                this.scheduledCrossOrderedTaskCount.selector,
                this.getScheduledCrossOrderedTasks.selector
            );
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IScheduledCrossOrderedTasks).interfaceId);
    }

    function _getResolverKey() internal pure override returns (bytes32) {
        return RESOLVER_KEY_SCHEDULED_CROSS_ORDERED_TASKS_KPI_LINKED_RATE;
    }
}
