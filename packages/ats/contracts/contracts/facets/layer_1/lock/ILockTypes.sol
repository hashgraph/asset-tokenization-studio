// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ILockTypes
 * @author Asset Tokenization Studio Team
 * @notice Lock domain events and errors shared across the Lock facets.
 * @dev Holds the `LockedByPartition` and `LockByPartitionReleased` events (emitted from
 *      both `Lock` and `LockByPartition`) and the `LockExpirationNotReached` / `WrongLockId`
 *      errors (reverted from modifiers and `LockStorageWrapper`, which both facets use).
 *      Both `ILock` and `ILockByPartition` inherit from this interface. Structs that are
 *      I/O of external methods on a single facet (e.g. `LockData`) live in that facet's
 *      interface instead.
 */
interface ILockTypes {
    /**
     * @notice Emitted when an amount of tokens is locked on a specific partition until an
     *         expiration timestamp.
     * @dev Emitted by both `lock` (default partition) and `lockByPartition` (any partition)
     *      so consumers can monitor every lock creation through a single topic.
     * @param operator The caller that requested the lock (typically holds `LOCKER_ROLE`).
     * @param tokenHolder The address whose tokens are locked.
     * @param partition The partition the tokens are locked on.
     * @param lockId The identifier assigned to the new lock for `(partition, tokenHolder)`.
     * @param amount The amount of tokens locked.
     * @param expirationTimestamp The Unix timestamp at which the lock becomes releasable.
     */
    event LockedByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 lockId,
        uint256 amount,
        uint256 expirationTimestamp
    );

    /**
     * @notice Emitted when a previously created lock is released back to its token holder.
     * @dev Emitted by `release`, `releaseByPartition` and `forceReleaseByPartition`. The
     *      released amount is not part of the event because the underlying lock entry is
     *      removed atomically; consumers can correlate with the prior `LockedByPartition`
     *      via `(partition, tokenHolder, lockId)`.
     * @param operator The caller that requested the release.
     * @param tokenHolder The address the tokens are returned to.
     * @param partition The partition the lock was held on.
     * @param lockId The identifier of the lock that has been released.
     */
    event LockByPartitionReleased(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 lockId
    );

    /**
     * @notice Reverts when a release is attempted before the lock's expiration timestamp.
     * @dev Used by the `onlyWithLockedExpirationTimestamp` modifier and by
     *      `LockStorageWrapper.checkLockedExpirationTimestamp`.
     */
    error LockExpirationNotReached();

    /**
     * @notice Reverts when a lock identifier does not exist for the given
     *         `(partition, tokenHolder)` pair.
     * @dev Used by the `onlyWithValidLockId` modifier and by
     *      `LockStorageWrapper.checkValidLockId`.
     */
    error WrongLockId();

    /**
     * @notice Reverts when a lock creation is attempted with a zero amount.
     * @dev Checked at the start of `LockStorageWrapper.lockByPartition`, which is the
     *      single entry point shared by both `Lock.lock` and `LockByPartition.lockByPartition`.
     */
    error InvalidLockAmount();
}
