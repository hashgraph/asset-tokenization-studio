// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {ScheduledTask} from '../scheduledTasksCommon/IScheduledTasksCommon.sol';

interface IScheduledCrossOrderedTasks {
    function triggerPendingScheduledCrossOrderedTasks()
        external
        returns (uint256);

    function triggerScheduledCrossOrderedTasks(
        uint256 _max
    ) external returns (uint256);

    function scheduledCrossOrderedTaskCount() external view returns (uint256);

    function getScheduledCrossOrderedTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (ScheduledTask[] memory scheduledTask_);
}
