// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IScheduledCrossOrderedTasks } from "./IScheduledCrossOrderedTasks.sol";
import { ScheduledTask } from "../scheduledTasksCommon/IScheduledTasksCommon.sol";
import { PauseModifiers } from "../../../../domain/core/PauseModifiers.sol";
import { ScheduledTasksStorageWrapper } from "../../../../domain/asset/ScheduledTasksStorageWrapper.sol";

abstract contract ScheduledCrossOrderedTasks is IScheduledCrossOrderedTasks, PauseModifiers {
    function triggerPendingScheduledCrossOrderedTasks() external override onlyUnpaused returns (uint256) {
        return ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks(0);
    }

    function triggerScheduledCrossOrderedTasks(uint256 _max) external override onlyUnpaused returns (uint256) {
        return ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks(_max);
    }

    function scheduledCrossOrderedTaskCount() external view override returns (uint256) {
        return ScheduledTasksStorageWrapper.getScheduledCrossOrderedTaskCount();
    }

    function getScheduledCrossOrderedTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledCrossOrderedTask_) {
        scheduledCrossOrderedTask_ = ScheduledTasksStorageWrapper.getScheduledCrossOrderedTasks(
            _pageIndex,
            _pageLength
        );
    }
}
