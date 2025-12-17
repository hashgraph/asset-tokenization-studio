// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ScheduledCrossOrderedTasksKpiLinkedRateFacet
} from "../../../layer_2/scheduledTasks/scheduledCrossOrderedTasks/kpiLinkedRate/ScheduledCrossOrderedTasksKpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../timeTravel/TimeTravelStorageWrapper.sol";
import { LocalContext } from "../../../layer_0/context/LocalContext.sol";

contract ScheduledCrossOrderedTasksKpiLinkedRateFacetTimeTravel is
    ScheduledCrossOrderedTasksKpiLinkedRateFacet,
    TimeTravelStorageWrapper
{
    function _blockTimestamp() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }

    function _blockNumber() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockNumber();
    }
}
