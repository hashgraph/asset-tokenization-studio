// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HolderBalance } from "../layer_1/snapshot/ISnapshots.sol";

/**
 * @title IBalanceTrackerAtSnapshot
 * @notice Interface for querying snapshotted token balances and total supply across all partitions,
 *         resolved against a previously taken snapshot identifier.
 * @dev Reads are delegated to `SnapshotsStorageWrapper` and operate on the snapshot index recorded
 *      by `takeSnapshot`. Reverts with `SnapshotIdNull` for `_snapshotID == 0` and with
 *      `SnapshotIdDoesNotExists` for unknown identifiers.
 */
interface IBalanceTrackerAtSnapshot {
    /**
     * @notice Returns the balance of a token holder at the time of a given snapshot.
     * @param _snapshotID  The snapshot identifier returned by a prior `takeSnapshot` call.
     * @param _tokenHolder The address of the token holder.
     * @return balance_ The balance of `_tokenHolder` recorded at `_snapshotID`.
     */
    function balanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_);

    /**
     * @notice Returns a paginated `HolderBalance` array with account and balance at the time of a given snapshot.
     * @param _snapshotID The snapshot identifier returned by a prior `takeSnapshot` call.
     * @param _pageIndex  Zero-based page index used to slice the holder set.
     * @param _pageLength Maximum number of entries returned in the page.
     * @return balances_ The page of `(holder, balance)` pairs recorded at `_snapshotID`.
     */
    function balancesOfAtSnapshot(
        uint256 _snapshotID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (HolderBalance[] memory balances_);

    /**
     * @notice Returns the total supply at the time of a given snapshot.
     * @param _snapshotID The snapshot identifier returned by a prior `takeSnapshot` call.
     * @return totalSupply_ The total supply recorded at `_snapshotID`.
     */
    function totalSupplyAtSnapshot(uint256 _snapshotID) external view returns (uint256 totalSupply_);
}
