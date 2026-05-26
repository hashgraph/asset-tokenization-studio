// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IClearingAtSnapshot
 * @author Asset Tokenization Studio Team
 * @notice Interface for querying the snapshotted aggregate cleared balance of a token holder
 *         across all partitions.
 * @dev Reads are delegated to `SnapshotsStorageWrapper` and operate on the snapshot index recorded
 *      by `takeSnapshot`. Reverts with `SnapshotIdNull` for `_snapshotID == 0` and with
 *      `SnapshotIdDoesNotExists` for unknown identifiers.
 */
interface IClearingAtSnapshot {
    /**
     * @notice Emitted once when the clearing-at-snapshot capability is initialised on a token.
     * @dev Fires exclusively from `initializeClearingAtSnapshot`.
     */
    event ClearingAtSnapshotInitialized();

    /**
     * @notice Initialises the clearing-at-snapshot capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeClearingAtSnapshot() external;

    /**
     * @notice Returns the aggregate cleared balance of a token holder at the time of a given
     *         snapshot, summed across every partition.
     * @param _snapshotID  The snapshot identifier returned by a prior `takeSnapshot` call.
     * @param _tokenHolder The address of the token holder.
     * @return balance_ The total cleared balance of `_tokenHolder` recorded at `_snapshotID`.
     */
    function clearedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);
}
