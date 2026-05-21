// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IFreezeAtSnapshot
 * @author Asset Tokenization Studio Team
 * @notice Interface exposing historical frozen-balance queries against captured snapshots.
 * @dev Read-only counterpart to the freeze surface for snapshot-aware reporting. Returns the
 *      frozen amount as it was at the time the snapshot was taken, including time-based
 *      adjustments scheduled before that block.
 */
interface IFreezeAtSnapshot {
    /**
     * @notice Emitted once when the freeze-at-snapshot capability is initialised on a token.
     * @dev Fires exclusively from `initializeFreezeAtSnapshot`.
     */
    event FreezeAtSnapshotInitialized();

    /**
     * @notice Initialises the freeze-at-snapshot capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeFreezeAtSnapshot() external;

    /**
     * @notice Returns the frozen balance of an account at the time of a given snapshot.
     * @param _snapshotID The identifier of the snapshot to query.
     * @param _tokenHolder The address whose frozen balance is being queried.
     * @return balance_ The frozen balance of `_tokenHolder` at snapshot `_snapshotID`.
     */
    function frozenBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);
}
