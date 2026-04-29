// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IBalanceTrackerAtSnapshotByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for querying snapshotted partition-scoped token balances and total supply,
 *         resolved against a previously taken snapshot identifier.
 * @dev Reads are delegated to `SnapshotsStorageWrapper` and operate on the snapshot index recorded
 *      by `takeSnapshot`. Reverts with `SnapshotIdNull` for `_snapshotID == 0` and with
 *      `SnapshotIdDoesNotExists` for unknown identifiers.
 */
interface IBalanceTrackerAtSnapshotByPartition {
    /**
     * @notice Returns the balance of an account for a given partition at the time of a given snapshot.
     * @param _partition   The partition identifier.
     * @param _snapshotID  The snapshot identifier returned by a prior `takeSnapshot` call.
     * @param _tokenHolder The address of the token holder.
     * @return balance_ The balance of `_tokenHolder` in `_partition` recorded at `_snapshotID`.
     */
    function balanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);

    /**
     * @notice Returns the total supply for a given partition at the time of a given snapshot.
     * @param _partition  The partition identifier.
     * @param _snapshotID The snapshot identifier returned by a prior `takeSnapshot` call.
     * @return totalSupply_ The total supply for `_partition` recorded at `_snapshotID`.
     */
    function totalSupplyAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID
    ) external view returns (uint256 totalSupply_);
}
