// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey ClearingAtSnapshotByPartition
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_CLEARING_AT_SNAPSHOT_BY_PARTITION = 0xf55083b17a9ba346028d6a5c0772a7d913e0e90b4954f7a8b8e1912dcd383cbd;

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
