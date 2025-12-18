// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Internals } from "../../../layer_0/Internals.sol";
import {
    IScheduledCrossOrderedTasks
} from "../../interfaces/scheduledTasks/scheduledCrossOrderedTasks/IScheduledCrossOrderedTasks.sol";
import { ScheduledTask } from "../../interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

abstract contract ScheduledCrossOrderedTasks is IScheduledCrossOrderedTasks, Internals {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    function triggerPendingScheduledCrossOrderedTasks() external override onlyUnpaused returns (uint256) {
        return _triggerScheduledCrossOrderedTasks(0);
    }

    function triggerScheduledCrossOrderedTasks(uint256 _max) external override onlyUnpaused returns (uint256) {
        return _triggerScheduledCrossOrderedTasks(_max);
    }

    function scheduledCrossOrderedTaskCount() external view override returns (uint256) {
        return _getScheduledCrossOrderedTaskCount();
    }

    function getScheduledCrossOrderedTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledCrossOrderedTask_) {
        scheduledCrossOrderedTask_ = _getScheduledCrossOrderedTasks(_pageIndex, _pageLength);
    }
}
