// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISnapshotsTypes } from "./ISnapshotsTypes.sol";
import { ScheduledTask } from "../../layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon.sol";

/// @custom:hash resolverKey Snapshots
bytes32 constant RESOLVER_KEY_SNAPSHOTS = 0xbc4e3ace00cf7d347ee7bf90737d3091c02f7d6607c195bf0d4b81e33644f0e1;

// Snapshot values have arrays of ids and the value corresponding to that id. These could be an array of a
// Snapshot struct, but that would impede usage of functions that work on an array.
/**
 * @notice Stores numeric values indexed by snapshot identifier.
 * @param ids Snapshot identifiers associated with the recorded values.
 * @param values Numeric values recorded for each snapshot identifier.
 */
struct Snapshots {
    uint256[] ids;
    uint256[] values;
}

/**
 * @notice Stores address values indexed by snapshot identifier.
 * @param ids Snapshot identifiers associated with the recorded addresses.
 * @param values Address values recorded for each snapshot identifier.
 */
struct SnapshotsAddress {
    uint256[] ids;
    address[] values;
}

/**
 * @notice Represents a set of token partitions.
 * @param partitions Partition identifiers included in the set.
 */
struct ListOfPartitions {
    bytes32[] partitions;
}

/**
 * @notice Stores partition lists indexed by snapshot identifier.
 * @param ids Snapshot identifiers associated with the recorded partition lists.
 * @param values Partition lists recorded for each snapshot identifier.
 */
struct PartitionSnapshots {
    uint256[] ids;
    ListOfPartitions[] values;
}

/**
 * @notice Represents a holder balance at a specific point in time.
 * @param holder Account whose balance is represented.
 * @param balance Token balance associated with the holder.
 */
struct HolderBalance {
    address holder;
    uint256 balance;
}

/**
 * @title Snapshots Interface
 * @notice Defines the external API for token balance and supply snapshot management.
 * @dev Extends `ISnapshotsTypes` and exposes initialisation, immediate snapshot creation,
 *      and scheduled snapshot inspection. Implementations are expected to preserve
 *      snapshot identifiers as stable historical references for downstream features.
 * @author Asset Tokenization Studio Team
 */
interface ISnapshots is ISnapshotsTypes {
    /**
     * @notice Emitted when an operator creates a new snapshot.
     * @param operator Account that initiated the snapshot creation.
     * @param snapshotID Identifier assigned to the created snapshot.
     */
    event SnapshotTaken(address indexed operator, uint256 indexed snapshotID);

    /**
     * @notice Emitted when a scheduled snapshot is executed.
     * @param snapshotId Identifier assigned to the triggered snapshot.
     * @param metadata Arbitrary metadata associated with the scheduled execution.
     */
    event SnapshotTriggered(uint256 snapshotId, bytes metadata);

    /**
     * @notice Emitted once when the snapshots capability is initialised on a token.
     * @dev Fires exclusively from `initializeSnapshots`.
     */
    event SnapshotsInitialized();

    /**
     * @notice Initialises the snapshots capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     *      Emits `SnapshotsInitialized` after successful registration.
     */
    function initializeSnapshots() external;

    /**
     * @notice Creates a snapshot of current balances and total supplies.
     * @dev Records a new snapshot identifier and defers per-account and supply writes until
     *      the next relevant balance mutation. Implementations may revert if the caller is
     *      not authorised. Emits `SnapshotTaken` on success.
     * @return snapshotID_ Identifier assigned to the created snapshot.
     */
    function takeSnapshot() external returns (uint256 snapshotID_);

    /**
     * @notice Returns the number of snapshots scheduled to run on this asset.
     * @dev Does not mutate state and reflects the current scheduled-task registry state.
     * @return Number of scheduled snapshot tasks.
     */
    function scheduledSnapshotCount() external view returns (uint256);

    /**
     * @notice Returns a paginated list of scheduled snapshots.
     * @dev Does not mutate state. Pagination bounds are interpreted by the implementation
     *      and should be selected to avoid excessive gas in on-chain callers.
     * @param _pageIndex Zero-based page index or start offset, as defined by the scheduler.
     * @param _pageLength Maximum number of scheduled snapshot tasks to return.
     * @return scheduledSnapshot_ Scheduled snapshot tasks in the requested page.
     */
    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (ScheduledTask[] memory scheduledSnapshot_);
}
