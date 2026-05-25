// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey HoldAtSnapshotByPartition
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_HOLD_AT_SNAPSHOT_BY_PARTITION = 0xe6aa6abeda5257bb9fda94cbd6583ff73bfc92f42edd2ace846ee45b3cf49f0f;

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
