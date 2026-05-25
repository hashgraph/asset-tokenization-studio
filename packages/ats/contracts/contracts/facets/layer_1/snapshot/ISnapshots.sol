// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISnapshotsTypes } from "./ISnapshotsTypes.sol";
import { ScheduledTask } from "../../layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon.sol";

/// @custom:hash resolverKey Snapshots
bytes32 constant RESOLVER_KEY_SNAPSHOTS = 0xbc4e3ace00cf7d347ee7bf90737d3091c02f7d6607c195bf0d4b81e33644f0e1;

// Snapshot values have arrays of ids and the value corresponding to that id. These could be an array of a
// Snapshot struct, but that would impede usage of functions that work on an array.
struct Snapshots {
    uint256[] ids;
    uint256[] values;
}

struct SnapshotsAddress {
    uint256[] ids;
    address[] values;
}

struct ListOfPartitions {
    bytes32[] partitions;
}
struct PartitionSnapshots {
    uint256[] ids;
    ListOfPartitions[] values;
}

struct HolderBalance {
    address holder;
    uint256 balance;
}

interface ISnapshots is ISnapshotsTypes {
    event SnapshotTaken(address indexed operator, uint256 indexed snapshotID);
    event SnapshotTriggered(uint256 snapshotId, bytes metadata);

    /**
     * @notice Takes a snapshot of the current balances and total supplies
     * @dev Taking a snapshot means the next time a user modifies their balance, the current balance will be stored
     *      in a mapping for the current snapshot id. The same applies to total supplies.
     */
    function takeSnapshot() external returns (uint256 snapshotID_);

    /**
     * @notice Returns the number of snapshots scheduled to run on this asset.
     * @param _includeDisabled When true, snapshots belonging to cancelled corporate actions are
     *                         counted; when false, only active scheduled snapshots are counted.
     * @return Count of scheduled snapshot tasks.
     */
    function scheduledSnapshotCount(bool _includeDisabled) external view returns (uint256);

    /**
     * @notice Returns a paginated list of scheduled snapshots.
     * @param _pageIndex       Zero-based page number.
     * @param _pageLength      Maximum number of tasks to return per page.
     * @param _includeDisabled When true, snapshots belonging to cancelled corporate actions are
     *                         included; when false, only active scheduled snapshots are returned.
     * @return scheduledSnapshot_ Array of `ScheduledTask` structs for the requested page.
     */
    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength,
        bool _includeDisabled
    ) external view returns (ScheduledTask[] memory scheduledSnapshot_);
}
