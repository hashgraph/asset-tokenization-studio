// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey LockAtSnapshot
bytes32 constant RESOLVER_KEY_LOCK_AT_SNAPSHOT = 0x91e5d78963175418e7eb62ff74343d1349d9522d316525e922e145c770cc4d18;

/**
 * @title  ILockAtSnapshot
 * @notice Interface for querying a token holder's locked balance at the time of a
 *         previously taken snapshot.
 * @dev    Reads are delegated to `SnapshotsStorageWrapper`, which in turn consults
 *         `LockStorageWrapper.getLockedAmountForAdjustedAt` to account for any
 *         balance-adjustment factor active at the snapshot timestamp.
 *         Reverts with `SnapshotIdNull` when `_snapshotID == 0` and with
 *         `SnapshotIdDoesNotExists` for unknown identifiers.
 * @author Asset Tokenization Studio Team
 */
interface ILockAtSnapshot {
    /**
     * @notice Emitted once when the lock-at-snapshot capability is initialised on a token.
     * @dev Fires exclusively from `initializeLockAtSnapshot`.
     */
    event LockAtSnapshotInitialized();

    /**
     * @notice Initialises the lock-at-snapshot capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeLockAtSnapshot() external;

    /**
     * @notice Returns the locked balance of a token holder at the time of a given snapshot.
     * @dev    Queries the adjusted locked-balance snapshot recorded by `LockStorageWrapper`
     *         at `_snapshotID`. The value reflects the lock escrow amount as it stood at
     *         the snapshot block, adjusted for any scheduled balance-adjustment factor.
     * @param  _snapshotID  The snapshot identifier returned by a prior `takeSnapshot` call.
     * @param  _tokenHolder The address of the token holder.
     * @return balance_     The locked balance of `_tokenHolder` recorded at `_snapshotID`.
     */
    function lockedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_);
}
