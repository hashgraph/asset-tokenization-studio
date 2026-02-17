// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ScheduledCrossOrderedTasksInternals
} from "../scheduledCrossOrderedTasks/ScheduledCrossOrderedTasksInternals.sol";
import {
    ScheduledTask
} from "../../../layer_2/interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";

abstract contract ScheduledSnapshotsInternals is ScheduledCrossOrderedTasksInternals {
    function _addScheduledSnapshot(uint256 _newScheduledTimestamp, bytes32 _actionId) internal virtual;
    function _onScheduledSnapshotTriggered(
        uint256 _pos,
        uint256 _scheduledTasksLength,
        ScheduledTask memory _scheduledTask
    ) internal virtual;
    function _triggerScheduledSnapshots(uint256 _max) internal virtual returns (uint256);
    function _getScheduledSnapshotCount() internal view virtual returns (uint256);
    function _getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (ScheduledTask[] memory scheduledSnapshot_);
}
