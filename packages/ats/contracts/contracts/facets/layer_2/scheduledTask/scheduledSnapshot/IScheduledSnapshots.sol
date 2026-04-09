// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledTask } from "../scheduledTasksCommon/IScheduledTasksCommon.sol";

interface IScheduledSnapshots {
    // Re-export events from storage wrappers for test compatibility
    event SnapshotTriggered(uint256 snapshotId, bytes metadata);

    function scheduledSnapshotCount() external view returns (uint256);

    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (ScheduledTask[] memory scheduledSnapshot_);
}
