// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IScheduledSnapshots } from "../../interfaces/scheduledTasks/scheduledSnapshots/IScheduledSnapshots.sol";
import { ScheduledTask } from "../../interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { LibScheduledTasks } from "../../../../lib/domain/LibScheduledTasks.sol";

/// @title ScheduledSnapshots
/// @notice Abstract read-only facade for scheduled snapshots
abstract contract ScheduledSnapshots is IScheduledSnapshots {
    function scheduledSnapshotCount() external view override returns (uint256) {
        return LibScheduledTasks.getScheduledSnapshotCount();
    }

    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledSnapshot_) {
        scheduledSnapshot_ = LibScheduledTasks.getScheduledSnapshots(_pageIndex, _pageLength);
    }
}
