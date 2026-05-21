// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILockTypes } from "./ILockTypes.sol";

/// @custom:hash resolverKey Lock
bytes32 constant RESOLVER_KEY_LOCK = 0xc2e37f639e1d61db1015540583b9d71f8a33da6410aed2826c6caef1304ebd3a;

/**
 * @title ILock
 * @author Asset Tokenization Studio Team
 * @notice Interface for default-partition token lock operations and global (all-partition)
 *         read queries.
 * @dev Exposes the single-partition write methods (`lock`, `release`) and the global read
 *      methods. Partition-aware writes and partition-scoped reads live in
 *      `ILockByPartition`. Inherits `ILockTypes` for the `LockedByPartition` /
 *      `LockByPartitionReleased` events and the `LockExpirationNotReached` / `WrongLockId`
 *      errors that both Lock facets share. The `LockData` struct is declared here because
 *      it is the I/O of `getLockByPartition`, exposed only by `LockFacet`.
 */
interface ILock is ILockTypes {
    /**
     * @notice On-chain representation of an individual lock entry.
     * @dev Mirrors the storage layout maintained by `LockStorageWrapper`. Returned by
     *      `LockFacet.getLockByPartition`. The `amount` field reflects the value adjusted
     *      by any balance-adjustment factors applied since the lock was created.
     * @param id Lock identifier, unique within `(partition, tokenHolder)`.
     * @param amount The locked amount, expressed in token base units.
     * @param expirationTimestamp Unix timestamp at which the lock becomes releasable.
     */
    struct LockData {
        uint256 id;
        uint256 amount;
        uint256 expirationTimestamp;
    }

    /**
     * @notice Emitted once when the lock capability is initialised on a token.
     * @dev Fires exclusively from `initializeLock`.
     */
    event LockInitialized();

    /**
     * @notice Initialises the lock capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeLock() external;

    /**
     * @notice Locks `_amount` tokens of `_tokenHolder` on the default partition until
     *         `_expirationTimestamp`.
     * @dev Single-partition convenience for `lockByPartition` against the default
     *      partition. The implementation enforces the unpaused state, the `ROLE_LOCKER`,
     *      single-partition mode, an unrecovered token holder and a future expiration
     *      timestamp; it emits `LockedByPartition`.
     * @param _amount The amount of tokens to lock.
     * @param _tokenHolder The address whose tokens are locked.
     * @param _expirationTimestamp Unix timestamp at which the lock becomes releasable.
     * @return lockId_ Identifier assigned to the new lock for the token holder.
     */
    function lock(
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) external returns (uint256 lockId_);

    /**
     * @notice Releases a lock on the default partition previously created with `lock`.
     * @dev Reverts with `WrongLockId` when `_lockId` is unknown for `_tokenHolder` and with
     *      `LockExpirationNotReached` before the lock's expiration. Emits
     *      `LockByPartitionReleased`.
     * @param _lockId Identifier of the lock to release.
     * @param _tokenHolder The address whose tokens are unlocked.
     * @return success_ True when the lock has been removed and the balance returned.
     */
    function release(uint256 _lockId, address _tokenHolder) external returns (bool success_);

    /**
     * @notice Updates the expiration timestamp of an existing lock on the default partition.
     * @dev Callers must hold `ROLE_LOCKER`. The new timestamp must be in the future. Both
     *      shortening and extending are allowed — this is an intentional trusted-role design: a
     *      second locker can correct an excessively far expiration set by a compromised account,
     *      while an admin can revoke the malicious locker's role if needed. Emits
     *      `LockExpirationUpdated`.
     * @param _tokenHolder The address whose lock expiration is being updated.
     * @param _lockId Identifier of the lock to update.
     * @param _newExpirationTimestamp New Unix timestamp at which the lock becomes releasable.
     * @return success_ True when the expiration timestamp has been updated.
     */
    function updateLockExpiration(
        address _tokenHolder,
        uint256 _lockId,
        uint256 _newExpirationTimestamp
    ) external returns (bool success_);

    /**
     * @notice Returns the total amount currently locked for `_tokenHolder` across every
     *         partition, adjusted by any pending balance-adjustment factors.
     * @param _tokenHolder The address whose total locked amount is queried.
     * @return amount_ The aggregate locked amount across all partitions.
     */
    function getLockedAmountFor(address _tokenHolder) external view returns (uint256 amount_);

    /**
     * @notice Returns the number of active locks held by `_tokenHolder` across every
     *         partition.
     * @param _tokenHolder The address whose lock count is queried.
     * @return lockCount_ The number of active locks across all partitions.
     */
    function getLockCountFor(address _tokenHolder) external view returns (uint256 lockCount_);

    /**
     * @notice Returns a paginated list of lock identifiers held by `_tokenHolder` across
     *         every partition.
     * @dev Pagination is bounded by the caller through `_pageLength`; the returned array
     *      length is at most `_pageLength`. A query past the available range returns an
     *      empty array.
     * @param _tokenHolder The address whose locks are listed.
     * @param _pageIndex Zero-based index of the page to retrieve.
     * @param _pageLength Maximum number of identifiers to return on the page.
     * @return locksId_ Array of lock identifiers for the requested page.
     */
    function getLocksIdFor(
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory locksId_);

    /**
     * @notice Returns the amount and expiration of a lock created on the default partition.
     * @dev Convenience wrapper that delegates to the partition-aware lookup using the
     *      default partition; both fields are zero when the identifier does not exist.
     *      The returned amount is adjusted by any pending balance-adjustment factors.
     * @param _tokenHolder The address whose lock is queried.
     * @param _lockId Identifier of the lock to read.
     * @return amount_ The locked amount, in token base units.
     * @return expirationTimestamp_ Unix timestamp at which the lock becomes releasable.
     */
    function getLockFor(
        address _tokenHolder,
        uint256 _lockId
    ) external view returns (uint256 amount_, uint256 expirationTimestamp_);
}
