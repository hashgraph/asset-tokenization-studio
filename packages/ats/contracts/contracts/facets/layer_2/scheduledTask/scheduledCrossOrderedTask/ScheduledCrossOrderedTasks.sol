// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IScheduledCrossOrderedTasks } from "./IScheduledCrossOrderedTasks.sol";
import { ScheduledTask } from "../scheduledTasksCommon/IScheduledTasksCommon.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../../../domain/asset/ScheduledTasksStorageWrapper.sol";

abstract contract ScheduledCrossOrderedTasks is IScheduledCrossOrderedTasks {
    function triggerPendingScheduledCrossOrderedTasks() external override returns (uint256) {
        PauseStorageWrapper._requireNotPaused();
        return ScheduledTasksStorageWrapper._triggerScheduledCrossOrderedTasks(0);
    }

    function triggerScheduledCrossOrderedTasks(uint256 _max) external override returns (uint256) {
        PauseStorageWrapper._requireNotPaused();
        return ScheduledTasksStorageWrapper._triggerScheduledCrossOrderedTasks(_max);
    }

    function scheduledCrossOrderedTaskCount() external view override returns (uint256) {
        return ScheduledTasksStorageWrapper._getScheduledCrossOrderedTaskCount();
    }

    function getScheduledCrossOrderedTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledCrossOrderedTask_) {
        scheduledCrossOrderedTask_ = ScheduledTasksStorageWrapper._getScheduledCrossOrderedTasks(
            _pageIndex,
            _pageLength
        );
    }
}
