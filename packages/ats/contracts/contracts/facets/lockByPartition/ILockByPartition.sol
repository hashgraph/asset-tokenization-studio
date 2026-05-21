// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILockTypes } from "../layer_1/lock/ILockTypes.sol";

/**
 * @title ILockByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for partition-aware token lock operations and partition-scoped read
 *         queries.
 * @dev Aggregates the partition-aware write methods (`lockByPartition`, `releaseByPartition`)
 *      and the partition-scoped read methods (`getLockedAmountForByPartition`,
 *      `getLockCountForByPartition`, `getLocksIdForByPartition`, `getLockForByPartition`)
 *      into a single interface separate from the default-partition `ILock` surface.
 *      Inherits `ILockTypes` for the events and errors shared with `ILock`.
 */
interface ILockByPartition is ILockTypes {
    /**
     * @notice Emitted once when the lock-by-partition capability is initialised on a token.
     * @dev Fires exclusively from `initializeLockByPartition`.
     */
    event LockByPartitionInitialized();

    /**
     * @notice Initialises the lock-by-partition capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeLockByPartition() external;

    /**
     * @notice Locks `_amount` tokens of `_tokenHolder` on `_partition` until
     *         `_expirationTimestamp`.
     * @dev Callers must hold `LOCKER_ROLE`. The implementation enforces the unpaused state,
     *      a future expiration timestamp, an unrecovered token holder and the
     *      single-partition / default-partition rule. Emits `LockedByPartition`.
     * @param _partition The partition the tokens are locked on.
     * @param _amount The amount of tokens to lock.
     * @param _tokenHolder The address whose tokens are locked.
     * @param _expirationTimestamp Unix timestamp at which the lock becomes releasable.
     * @return success_ True when the lock has been recorded.
     * @return lockId_ Identifier assigned to the new lock for `(partition, tokenHolder)`.
     */
    function lockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) external returns (bool success_, uint256 lockId_);

    /**
     * @notice Releases a lock on `_partition` previously created with `lockByPartition`.
     * @dev Pause-gated and validated against single-partition mode. Reverts with
     *      `WrongLockId` when `_lockId` is unknown for `(_partition, _tokenHolder)` and with
     *      `LockExpirationNotReached` before the lock expires. Emits
     *      `LockByPartitionReleased`.
     * @param _partition The partition the lock lives on.
     * @param _lockId Identifier of the lock to release.
     * @param _tokenHolder The address whose tokens are returned.
     * @return success_ True when the lock has been removed and the balance returned.
     */
    function releaseByPartition(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    ) external returns (bool success_);

    /**
     * @notice Returns the total locked amount of `_tokenHolder` on `_partition`, adjusted
     *         by any pending balance-adjustment factors.
     * @param _partition The partition the query is scoped to.
     * @param _tokenHolder The address whose locked amount is queried.
     * @return amount_ The locked amount on the given partition.
     */
    function getLockedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256 amount_);

    /**
     * @notice Returns the number of active locks held by `_tokenHolder` on `_partition`.
     * @param _partition The partition the query is scoped to.
     * @param _tokenHolder The address whose lock count is queried.
     * @return lockCount_ The number of active locks on the given partition.
     */
    function getLockCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256 lockCount_);

    /**
     * @notice Returns a paginated list of lock identifiers for `_tokenHolder` on
     *         `_partition`.
     * @dev Pagination is bounded by the caller through `_pageLength`; the returned array
     *      length is at most `_pageLength`. A query past the available range returns an
     *      empty array.
     * @param _partition The partition the query is scoped to.
     * @param _tokenHolder The address whose locks are listed.
     * @param _pageIndex Zero-based index of the page to retrieve.
     * @param _pageLength Maximum number of identifiers to return on the page.
     * @return locksId_ Array of lock identifiers for the requested page.
     */
    function getLocksIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory locksId_);

    /**
     * @notice Returns the amount and expiration of a lock on `_partition`.
     * @dev Both fields are zero when the identifier does not exist for the given
     *      `(_partition, _tokenHolder)` pair. The amount is adjusted by any pending
     *      balance-adjustment factors.
     * @param _partition The partition the lock lives on.
     * @param _tokenHolder The address whose lock is queried.
     * @param _lockId Identifier of the lock to read.
     * @return amount_ The locked amount, in token base units.
     * @return expirationTimestamp_ Unix timestamp at which the lock becomes releasable.
     */
    function getLockForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) external view returns (uint256 amount_, uint256 expirationTimestamp_);
}
