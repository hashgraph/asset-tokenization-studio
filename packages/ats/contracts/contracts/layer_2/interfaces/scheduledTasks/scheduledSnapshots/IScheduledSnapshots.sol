// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {ScheduledTasksLib} from '../../../scheduledTasks/ScheduledTasksLib.sol';

interface IScheduledSnapshots {
    function onScheduledSnapshotTriggered(
        uint256 _pos,
        uint256 _scheduledTasksLength,
        bytes memory _data
    ) external;

    function scheduledSnapshotCount() external view returns (uint256);

    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        returns (ScheduledTasksLib.ScheduledTask[] memory scheduledSnapshot_);
}
