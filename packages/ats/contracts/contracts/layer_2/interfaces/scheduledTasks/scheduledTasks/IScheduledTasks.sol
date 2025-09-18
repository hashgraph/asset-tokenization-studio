// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {ScheduledTasksLib} from '../../../scheduledTasks/ScheduledTasksLib.sol';

struct ScheduledTask {
    uint256 scheduledTimestamp;
    bytes data;
}

interface IScheduledTasks {
    function onScheduledTaskTriggered(
        uint256 _pos,
        uint256 _scheduledTasksLength,
        bytes memory _data
    ) external;

    function triggerPendingScheduledTasks() external returns (uint256);

    function triggerScheduledTasks(uint256 _max) external returns (uint256);

    function scheduledTaskCount() external view returns (uint256);

    function getScheduledTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        returns (ScheduledTasksLib.ScheduledTask[] memory scheduledTask_);
}
