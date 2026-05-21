// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IHoldAtSnapshotByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for querying the snapshotted partition-scoped held balance of a token holder.
 * @dev Reads are delegated to `SnapshotsStorageWrapper` and operate on the snapshot index recorded
 *      by `takeSnapshot`. Reverts with `SnapshotIdNull` for `_snapshotID == 0` and with
 *      `SnapshotIdDoesNotExists` for unknown identifiers.
 */
interface IHoldAtSnapshotByPartition {
    /**
     * @notice Emitted once when the hold-at-snapshot-by-partition capability is initialised on a token.
     * @dev Fires exclusively from `initializeHoldAtSnapshotByPartition`.
     */
    event HoldAtSnapshotByPartitionInitialized();

    /**
     * @notice Initialises the hold-at-snapshot-by-partition capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeHoldAtSnapshotByPartition() external;

    /**
     * @notice Returns the held balance of a token holder for a given partition at the time of a
     *         given snapshot.
     * @param _partition   The partition identifier.
     * @param _snapshotID  The snapshot identifier returned by a prior `takeSnapshot` call.
     * @param _tokenHolder The address of the token holder.
     * @return balance_ The held balance of `_tokenHolder` in `_partition` recorded at
     *         `_snapshotID`.
     */
    function heldBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);
}
