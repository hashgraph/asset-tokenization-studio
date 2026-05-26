// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IClearingAtSnapshotByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for querying the snapshotted partition-scoped cleared balance of a token
 *         holder.
 * @dev Reads are delegated to `SnapshotsStorageWrapper` and operate on the snapshot index recorded
 *      by `takeSnapshot`. Reverts with `SnapshotIdNull` for `_snapshotID == 0` and with
 *      `SnapshotIdDoesNotExists` for unknown identifiers.
 */
interface IClearingAtSnapshotByPartition {
    /**
     * @notice Emitted once when the clearing-at-snapshot-by-partition capability is initialised on a token.
     * @dev Fires exclusively from `initializeClearingAtSnapshotByPartition`.
     */
    event ClearingAtSnapshotByPartitionInitialized();

    /**
     * @notice Initialises the clearing-at-snapshot-by-partition capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeClearingAtSnapshotByPartition() external;

    /**
     * @notice Returns the cleared balance of a token holder for a given partition at the time of
     *         a given snapshot.
     * @param _partition   The partition identifier.
     * @param _snapshotID  The snapshot identifier returned by a prior `takeSnapshot` call.
     * @param _tokenHolder The address of the token holder.
     * @return balance_ The cleared balance of `_tokenHolder` in `_partition` recorded at
     *         `_snapshotID`.
     */
    function clearedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);
}
