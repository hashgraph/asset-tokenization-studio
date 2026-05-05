// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

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
