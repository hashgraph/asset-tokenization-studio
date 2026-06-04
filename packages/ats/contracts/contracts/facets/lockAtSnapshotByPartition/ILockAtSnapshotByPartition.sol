// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey LockAtSnapshotByPartition
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_LOCK_AT_SNAPSHOT_BY_PARTITION = 0x7740456ff352a04830411a3fdc359bd086a5d78fd7119bbb62a53c62c1911691;

/**
 * @title  ILockAtSnapshotByPartition
 * @notice Interface for querying a token holder's locked balance for a specific partition at the
 *         time of a previously taken snapshot.
 * @dev    Reads are delegated to `SnapshotsStorageWrapper` and depend on the snapshot index
 *         recorded by `takeSnapshot`. Reverts with `SnapshotIdNull` when `_snapshotID == 0` and
 *         with `SnapshotIdDoesNotExists` for unknown identifiers.
 * @author Asset Tokenization Studio Team
 */
interface ILockAtSnapshotByPartition {
    /**
     * @notice Emitted once when the lock-at-snapshot-by-partition capability is initialised on a token.
     * @dev Fires exclusively from `initializeLockAtSnapshotByPartition`.
     */
    event LockAtSnapshotByPartitionInitialized();

    /**
     * @notice Initialises the lock-at-snapshot-by-partition capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeLockAtSnapshotByPartition() external;

    /**
     * @notice Returns the locked balance of a token holder for a given partition at the time of a
     *         given snapshot.
     * @param _partition   The partition identifier.
     * @param _snapshotID  The snapshot identifier returned by a prior `takeSnapshot` call.
     * @param _tokenHolder The address of the token holder.
     * @return balance_ The locked balance of `_tokenHolder` in `_partition` recorded at `_snapshotID`.
     */
    function lockedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);
}
