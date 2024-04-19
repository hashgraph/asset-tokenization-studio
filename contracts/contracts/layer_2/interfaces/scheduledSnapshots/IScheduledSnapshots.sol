// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

interface IScheduledSnapshots {
    struct ScheduledSnapshot {
        uint256 scheduledTimestamp;
        bytes data;
    }

    function triggerPendingScheduledSnapshots() external returns (uint256);

    function triggerScheduledSnapshots(uint256 max) external returns (uint256);

    function scheduledSnapshotCount() external view returns (uint256);

    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (ScheduledSnapshot[] memory scheduledSnapshot_);
}
