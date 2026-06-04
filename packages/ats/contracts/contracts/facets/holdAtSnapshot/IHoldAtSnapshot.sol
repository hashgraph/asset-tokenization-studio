// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey HoldAtSnapshot
bytes32 constant RESOLVER_KEY_HOLD_AT_SNAPSHOT = 0xe4ec7231213c656d430571c2b40cf204f87a626b5ccf0db85527f72470e54a9e;

/**
 * @title  IHoldAtSnapshot
 * @notice Interface for querying a token holder's held (escrowed) balance at the time of a
 *         previously taken snapshot.
 * @dev    Reads are delegated to `SnapshotsStorageWrapper` and depend on the snapshot index
 *         recorded by `takeSnapshot`. The held amount is computed against the adjustment
 *         factor active at the snapshot timestamp via
 *         `HoldStorageWrapper.getHeldAmountForAdjustedAt`.
 *         Reverts with `SnapshotIdNull` when `_snapshotID == 0` and with
 *         `SnapshotIdDoesNotExists` for unknown identifiers.
 * @author Asset Tokenization Studio Team
 */
interface IHoldAtSnapshot {
    /**
     * @notice Emitted once when the hold-at-snapshot capability is initialised on a token.
     * @dev Fires exclusively from `initializeHoldAtSnapshot`.
     */
    event HoldAtSnapshotInitialized();

    /**
     * @notice Initialises the hold-at-snapshot capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeHoldAtSnapshot() external;

    /**
     * @notice Returns the held balance of a token holder at the time of a given snapshot.
     * @dev    Sums all hold escrow amounts active at `_snapshotID`, adjusted for any
     *         balance-adjustment factor recorded at that snapshot timestamp.
     * @param _snapshotID  The snapshot identifier returned by a prior `takeSnapshot` call.
     * @param _tokenHolder The address of the token holder.
     * @return balance_ The held balance of `_tokenHolder` recorded at `_snapshotID`.
     */
    function heldBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);
}
