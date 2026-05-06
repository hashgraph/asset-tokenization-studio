// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IFreezeAtSnapshotByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface exposing partition-aware historical frozen-balance queries against captured
 *         snapshots.
 * @dev Read-only counterpart of `IFreezeAtSnapshot` for multi-partition mode. Returns the
 *      frozen amount on a specific partition as it was at the time the snapshot was taken,
 *      including time-based adjustments scheduled before that block.
 */
interface IFreezeAtSnapshotByPartition {
    /**
     * @notice Returns the frozen balance of an account for a given partition at the time of a
     *         given snapshot.
     * @param _partition The partition the frozen balance is queried in.
     * @param _snapshotID The identifier of the snapshot to query.
     * @param _tokenHolder The address whose frozen balance is being queried.
     * @return balance_ The frozen balance of `_tokenHolder` on `_partition` at snapshot
     *         `_snapshotID`.
     */
    function frozenBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);
}
