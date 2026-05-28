// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ILock } from "../../facets/layer_1/lock/ILock.sol";
import { ILockTypes } from "../../facets/layer_1/lock/ILockTypes.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { ICommonErrors } from "../../infrastructure/errors/ICommonErrors.sol";

/// @custom:hash storage Lock
bytes32 constant STORAGE_LOCATION_LOCK = 0xd42ee8bdd326f30f9a4764fdaf28dd719168978dba1e4949fbeb1a3fd1c09000;

/**
 * @notice ERC-7201 namespaced storage for the time-bound lock capability.
 * @dev Tracks per-holder and per-partition aggregate locked amounts, the indexed `LockData`
 *      record for each individual lock, the live lock-id enumerable set per
 *      (holder, partition), and the monotonically-incrementing lock-id counter. Fields above
 *      the APPEND-ONLY marker must not be reordered; new fields land in the append-only zone.
 * @custom:storage-location erc7201:security.token.standard.storage.Lock
 */
struct LockDataStorage {
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    mapping(address => uint256) totalLockedAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) totalLockedAmountByAccountAndPartition;
    mapping(address => mapping(bytes32 => mapping(uint256 => ILock.LockData))) locksByAccountPartitionAndId;
    mapping(address => mapping(bytes32 => EnumerableSet.UintSet)) lockIdsByAccountAndPartition;
    mapping(address => mapping(bytes32 => uint256)) nextLockIdByAccountAndPartition;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title LockStorageWrapper
 * @notice Storage wrapper for lock management operations
 * @dev Manages lock data storage including locks by account, partition, and lock ID
 * @author Hashgraph
 */
library LockStorageWrapper {
    using Pagination for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;

    /**
     * @notice Locks `amount` of `tokenHolder`'s partition balance until `expirationTimestamp`.
     * @dev Pipeline: validates the amount is non-zero, refreshes ERC1410 state on the
     *      (partition, holder) pair, brings the holder's locked aggregates up to date with the
     *      active ABAF, applies the snapshot mutations and partition-balance reduction, then
     *      persists the lock under a fresh monotonically-increasing id. Finally emits the
     *      synthetic ERC1410 zero-address transfer that mirrors the lock on the unified ledger.
     * @param partition Partition whose balance is being locked.
     * @param amount Quantity to lock.
     * @param tokenHolder Holder whose tokens are being locked.
     * @param expirationTimestamp Unix timestamp from which the lock becomes releasable.
     * @param operator Address that authored the lock; surfaced in the emitted ERC1410 event.
     * @return lockId_ The freshly-minted identifier assigned to this lock.
     */
    function lockByPartition(
        bytes32 partition,
        uint256 amount,
        address tokenHolder,
        uint256 expirationTimestamp,
        address operator
    ) internal returns (uint256 lockId_) {
        checkNonZeroLockAmount(amount);

        _prepareLock(partition, tokenHolder);

        uint256 abaf = updateTotalLock(partition, tokenHolder);

        _applyLockBeforePersistence(partition, amount, tokenHolder, expirationTimestamp);
        lockId_ = _storeLock(partition, amount, tokenHolder, expirationTimestamp, abaf);

        _emitLockEvents(partition, operator, tokenHolder, amount);

        return (lockId_);
    }

    /**
     * @notice Releases the specified lock and restores its amount to the holder's partition
     *         balance.
     * @dev Caller is expected to have validated lock existence and expiration via
     *      `checkValidLockId` and `checkLockedExpirationTimestamp`. Pipeline: refreshes ERC1410
     *      state, syncs the holder's aggregate and per-lock LABAFs, refreshes the snapshots,
     *      deletes the lock from storage, restores the partition balance (creating the
     *      partition entry if absent), emits the mirror ERC1410 transfer and runs the ERC1410
     *      after-token-transfer hook.
     * @param partition Partition the lock is bound to.
     * @param lockId Identifier of the lock being released.
     * @param tokenHolder Holder whose lock is being released.
     * @param operator Address that authored the release; surfaced in the emitted ERC1410 event.
     * @return success_ Always `true` on successful return; the function reverts otherwise.
     */
    function releaseByPartition(
        bytes32 partition,
        uint256 lockId,
        address tokenHolder,
        address operator
    ) internal returns (bool success_) {
        _prepareRelease(partition, tokenHolder);

        uint256 abaf = updateTotalLock(partition, tokenHolder);
        updateLockByIndex(partition, lockId, tokenHolder, abaf);

        updateLockedBalancesBeforeRelease(partition, lockId, tokenHolder);

        uint256 lockAmount = _removeLock(partition, tokenHolder, lockId);
        _restoreReleasedAmountOnly(partition, tokenHolder, lockAmount);

        _emitReleaseEvents(partition, operator, tokenHolder, lockAmount);

        ERC1410StorageWrapper.afterTokenTransfer(partition, tokenHolder, tokenHolder, lockAmount);

        return true;
    }

    /**
     * @notice Brings the holder's aggregate locked balances up to date with the current
     *         adjust-balance factor.
     * @dev Compares the active ABAF against the holder's stored global and per-partition LABAFs;
     *      when either diverges, scales the corresponding aggregate by the computed factor and
     *      writes back the fresh LABAF. Returns the active ABAF so callers (e.g. `_storeLock`)
     *      can persist it directly against the lock being created.
     * @param partition Partition whose per-partition aggregate may need adjustment.
     * @param tokenHolder Holder whose aggregates are being reconciled.
     * @return abaf_ The active ABAF at the moment of the call.
     */
    function updateTotalLock(bytes32 partition, address tokenHolder) internal returns (uint256 abaf_) {
        abaf_ = AdjustBalancesStorageWrapper.getAbaf();

        uint256 labaf = AdjustBalancesStorageWrapper.getTotalLockLabaf(tokenHolder);
        uint256 labafByPartition = AdjustBalancesStorageWrapper.getTotalLockLabafByPartition(partition, tokenHolder);

        if (abaf_ != labaf) {
            updateTotalLockedAmountAndLabaf(
                tokenHolder,
                AdjustBalancesStorageWrapper.calculateFactor(abaf_, labaf),
                abaf_
            );
        }

        if (abaf_ != labafByPartition) {
            updateTotalLockedAmountAndLabafByPartition(
                partition,
                tokenHolder,
                AdjustBalancesStorageWrapper.calculateFactor(abaf_, labafByPartition),
                abaf_
            );
        }
    }

    /**
     * @notice Synchronises a single lock's stored amount with the active adjust-balance factor
     *         immediately before it is removed.
     * @dev Reads the per-lock LABAF and, when it diverges from `abaf`, scales the lock's
     *      stored amount in place via `updateLockAmountById`. The lock's per-lock LABAF is
     *      intentionally left stale because the caller (`releaseByPartition`) deletes the lock
     *      record right after, so writing back the new LABAF would be wasted gas.
     * @param partition Partition the lock belongs to.
     * @param lockId Identifier of the lock being synchronised.
     * @param tokenHolder Holder that owns the lock.
     * @param abaf Active ABAF returned by `updateTotalLock`.
     */
    function updateLockByIndex(bytes32 partition, uint256 lockId, address tokenHolder, uint256 abaf) internal {
        uint256 lockLabaf = AdjustBalancesStorageWrapper.getLockLabafById(partition, tokenHolder, lockId);

        if (abaf == lockLabaf) return;
        updateLockAmountById(
            partition,
            lockId,
            tokenHolder,
            AdjustBalancesStorageWrapper.calculateFactor(abaf, lockLabaf)
        );
    }

    /**
     * @notice Scales a single lock's stored amount by `factor`.
     * @dev Helper used by `updateLockByIndex` to apply the freshly-computed adjustment in a
     *      single multiplication.
     * @param partition Partition the lock belongs to.
     * @param lockId Identifier of the lock being scaled.
     * @param tokenHolder Holder that owns the lock.
     * @param factor Multiplicative factor derived from the current ABAF and the stored LABAF.
     */
    function updateLockAmountById(bytes32 partition, uint256 lockId, address tokenHolder, uint256 factor) internal {
        lockStorage().locksByAccountPartitionAndId[tokenHolder][partition][lockId].amount *= factor;
    }

    /**
     * @notice Scales the holder's global aggregate locked amount by `factor` and stores the
     *         matching LABAF.
     * @dev Used by `updateTotalLock` to apply an aggregate balance adjustment without iterating
     *      individual locks.
     * @param tokenHolder Holder whose aggregate locked amount is being scaled.
     * @param factor Multiplicative factor derived from the current ABAF and the stored LABAF.
     * @param abaf Active ABAF value to persist as the new LABAF.
     */
    function updateTotalLockedAmountAndLabaf(address tokenHolder, uint256 factor, uint256 abaf) internal {
        lockStorage().totalLockedAmountByAccount[tokenHolder] *= factor;
        AdjustBalancesStorageWrapper.setTotalLockLabaf(tokenHolder, abaf);
    }

    /**
     * @notice Scales the holder's per-partition aggregate locked amount by `factor` and stores
     *         the matching per-partition LABAF.
     * @dev Per-partition counterpart of `updateTotalLockedAmountAndLabaf`.
     * @param partition Partition whose aggregate is being scaled.
     * @param tokenHolder Holder whose partition aggregate is being scaled.
     * @param factor Multiplicative factor derived from the current ABAF and the stored LABAF.
     * @param abaf Active ABAF value to persist as the new per-partition LABAF.
     */
    function updateTotalLockedAmountAndLabafByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 factor,
        uint256 abaf
    ) internal {
        lockStorage().totalLockedAmountByAccountAndPartition[tokenHolder][partition] *= factor;
        AdjustBalancesStorageWrapper.setTotalLockLabafByPartition(partition, tokenHolder, abaf);
    }

    /**
     * @notice Refreshes the snapshot machinery for a holder/partition pair ahead of a lock
     *         write.
     * @dev Updates both the account snapshot and the dedicated locked-balances snapshot so that
     *      any subsequent snapshot read sees the pre-mutation state captured exactly once. The
     *      second (`amount`) and fourth (`expirationTimestamp`) arguments are deliberately unused;
     *      they exist only to keep the helper signature-compatible with the locking pipeline's
     *      call-site.
     * @param partition Partition being mutated.
     * @param tokenHolder Holder whose snapshots are being refreshed.
     */
    function updateLockedBalancesBeforeLock(
        bytes32 partition,
        uint256 /*amount*/,
        address tokenHolder,
        uint256 /*expirationTimestamp*/
    ) internal {
        SnapshotsStorageWrapper.updateAccountSnapshot(tokenHolder, partition);
        SnapshotsStorageWrapper.updateAccountLockedBalancesSnapshot(tokenHolder, partition);
    }

    /**
     * @notice Refreshes the snapshot machinery for a holder/partition pair ahead of a release.
     * @dev Mirror of `updateLockedBalancesBeforeLock`. The second (`lockId`) argument is
     *      deliberately unused; it exists only to keep the helper signature-compatible with
     *      the release pipeline's call-site.
     * @param partition Partition being mutated.
     * @param tokenHolder Holder whose snapshots are being refreshed.
     */
    function updateLockedBalancesBeforeRelease(bytes32 partition, uint256 /*lockId*/, address tokenHolder) internal {
        SnapshotsStorageWrapper.updateAccountSnapshot(tokenHolder, partition);
        SnapshotsStorageWrapper.updateAccountLockedBalancesSnapshot(tokenHolder, partition);
    }

    /**
     * @notice Updates the expiration timestamp of an existing lock without touching balances.
     * @dev Only the `expirationTimestamp` field of the `LockData` record is mutated; amount,
     *      lock-id set, and ABAF/LABAF aggregates are left untouched because this operation does
     *      not move any tokens. Callers are responsible for validating the lock id and the new
     *      timestamp before invoking this function.
     * @param partition Partition the lock belongs to.
     * @param tokenHolder Holder that owns the lock.
     * @param lockId Identifier of the lock being updated.
     * @param newExpirationTimestamp The replacement expiration timestamp.
     * @return oldExpirationTimestamp_ The expiration timestamp that was stored before the update.
     */
    function updateLockExpiration(
        bytes32 partition,
        address tokenHolder,
        uint256 lockId,
        uint256 newExpirationTimestamp
    ) internal returns (uint256 oldExpirationTimestamp_) {
        ILock.LockData storage lock = lockStorage().locksByAccountPartitionAndId[tokenHolder][partition][lockId];
        oldExpirationTimestamp_ = lock.expirationTimestamp;
        lock.expirationTimestamp = newExpirationTimestamp;
    }

    /**
     * @notice Returns the holder's aggregate locked amount across every partition.
     * @param tokenHolder Holder whose aggregate is being queried.
     * @return amount_ Sum of all locked amounts held under `tokenHolder`.
     */
    function getLockedAmountFor(address tokenHolder) internal view returns (uint256 amount_) {
        return lockStorage().totalLockedAmountByAccount[tokenHolder];
    }

    /**
     * @notice Returns the persisted `LockData` record for a single lock.
     * @dev Returns the zero-valued record if no lock exists at `lockId`; callers should pair
     *      this with `isLockIdValid` when distinguishing "absent" from "stored as zero".
     * @param partition Partition the lock belongs to.
     * @param tokenHolder Holder that owns the lock.
     * @param lockId Identifier of the lock being queried.
     * @return data_ The stored lock record.
     */
    function getLock(
        bytes32 partition,
        address tokenHolder,
        uint256 lockId
    ) internal view returns (ILock.LockData memory data_) {
        return lockStorage().locksByAccountPartitionAndId[tokenHolder][partition][lockId];
    }

    /**
     * @notice Reports whether the lock's expiration timestamp has elapsed.
     * @dev Reads block time through `TimeTravelStorageWrapper` so that on test networks the
     *      virtual clock is honoured rather than `block.timestamp`. The lock is considered
     *      expired (releasable) when its stored expiration is less than or equal to the active
     *      timestamp.
     * @param partition Partition the lock belongs to.
     * @param tokenHolder Holder that owns the lock.
     * @param lockId Identifier of the lock being inspected.
     * @return `true` if the lock can be released, `false` otherwise.
     */
    function isLockedExpirationTimestamp(
        bytes32 partition,
        address tokenHolder,
        uint256 lockId
    ) internal view returns (bool) {
        return
            getLock(partition, tokenHolder, lockId).expirationTimestamp <= TimeTravelStorageWrapper.getBlockTimestamp();
    }

    /**
     * @notice Reports whether `lockId` corresponds to a live lock for the given pair.
     * @dev Backed by the `EnumerableSet` of lock ids, so this is O(1) and reflects deletions
     *      done by `_removeLock`.
     * @param partition Partition the lock would belong to.
     * @param tokenHolder Holder that would own the lock.
     * @param lockId Identifier being checked.
     * @return `true` when the lock exists; `false` otherwise.
     */
    function isLockIdValid(bytes32 partition, address tokenHolder, uint256 lockId) internal view returns (bool) {
        return lockStorage().lockIdsByAccountAndPartition[tokenHolder][partition].contains(lockId);
    }

    /**
     * @notice Reverts unless the supplied expiration timestamp is at or after the active block
     *         time.
     * @dev Uses `TimeTravelStorageWrapper` for the active time so the guard honours the virtual
     *      clock on test networks. Raises `ICommonErrors.WrongExpirationTimestamp`.
     * @param expirationTimestamp Candidate expiration being validated.
     */
    function requireValidExpirationTimestamp(uint256 expirationTimestamp) internal view {
        if (expirationTimestamp < TimeTravelStorageWrapper.getBlockTimestamp())
            revert ICommonErrors.WrongExpirationTimestamp();
    }

    /**
     * @notice Reverts unless the supplied lock id exists for the given (partition, holder).
     * @dev Raises `ILockTypes.WrongLockId` on miss.
     * @param partition Partition the lock should belong to.
     * @param tokenHolder Holder that should own the lock.
     * @param lockId Identifier being validated.
     */
    function checkValidLockId(bytes32 partition, address tokenHolder, uint256 lockId) internal view {
        if (!isLockIdValid(partition, tokenHolder, lockId)) revert ILockTypes.WrongLockId();
    }

    /**
     * @notice Reverts unless the lock at `lockId` has reached its expiration timestamp.
     * @dev Raises `ILockTypes.LockExpirationNotReached` when the lock is still active.
     * @param partition Partition the lock belongs to.
     * @param tokenHolder Holder that owns the lock.
     * @param lockId Identifier of the lock being inspected.
     */
    function checkLockedExpirationTimestamp(bytes32 partition, address tokenHolder, uint256 lockId) internal view {
        if (!isLockedExpirationTimestamp(partition, tokenHolder, lockId)) revert ILockTypes.LockExpirationNotReached();
    }

    /**
     * @notice Returns the holder's aggregate locked amount on a single partition.
     * @param partition Partition being queried.
     * @param tokenHolder Holder whose partition aggregate is being read.
     * @return Per-partition aggregate locked amount.
     */
    function getLockedAmountForByPartition(bytes32 partition, address tokenHolder) internal view returns (uint256) {
        return lockStorage().totalLockedAmountByAccountAndPartition[tokenHolder][partition];
    }

    /**
     * @notice Returns the number of live locks for the given (partition, holder).
     * @param partition Partition being queried.
     * @param tokenHolder Holder being queried.
     * @return lockCount_ Cardinality of the live lock-id set.
     */
    function getLockCountForByPartition(
        bytes32 partition,
        address tokenHolder
    ) internal view returns (uint256 lockCount_) {
        return lockStorage().lockIdsByAccountAndPartition[tokenHolder][partition].length();
    }

    /**
     * @notice Returns a paginated slice of live lock ids for the given (partition, holder).
     * @dev Pagination is delegated to the `Pagination` library so callers do not have to bound
     *      the return size manually; the underlying read iterates the `EnumerableSet`.
     * @param partition Partition being queried.
     * @param tokenHolder Holder being queried.
     * @param pageIndex Zero-based page index.
     * @param pageLength Maximum entries per page.
     * @return locksId_ The requested slice of lock identifiers.
     */
    function getLocksIdForByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (uint256[] memory locksId_) {
        return lockStorage().lockIdsByAccountAndPartition[tokenHolder][partition].getFromSet(pageIndex, pageLength);
    }

    /**
     * @notice Returns the lock's stored amount and expiration timestamp.
     * @dev Convenience accessor that decomposes the `LockData` record into its scalar fields;
     *      reads the zero-record when the lock is absent.
     * @param partition Partition the lock belongs to.
     * @param tokenHolder Holder that owns the lock.
     * @param lockId Identifier of the lock being queried.
     * @return amount Stored locked amount.
     * @return expirationTimestamp Stored expiration timestamp.
     */
    function getLockForByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 lockId
    ) internal view returns (uint256 amount, uint256 expirationTimestamp) {
        ILock.LockData memory lock = getLock(partition, tokenHolder, lockId);
        amount = lock.amount;
        expirationTimestamp = lock.expirationTimestamp;
    }

    /**
     * @notice Returns the lock's amount adjusted to `timestamp` alongside its expiration.
     * @dev Multiplies the stored amount by the factor derived from the ABAF at `timestamp` and
     *      the lock's stored per-lock LABAF. The expiration timestamp is returned unmodified.
     * @param partition Partition the lock belongs to.
     * @param tokenHolder Holder that owns the lock.
     * @param lockId Identifier of the lock being queried.
     * @param timestamp Reference timestamp for the adjustment factor.
     * @return amount_ Adjusted locked amount at `timestamp`.
     * @return expirationTimestamp_ Stored expiration timestamp.
     */
    function getLockForByPartitionAdjustedAt(
        bytes32 partition,
        address tokenHolder,
        uint256 lockId,
        uint256 timestamp
    ) internal view returns (uint256 amount_, uint256 expirationTimestamp_) {
        (amount_, expirationTimestamp_) = getLockForByPartition(partition, tokenHolder, lockId);
        amount_ *= AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper.getLockLabafById(partition, tokenHolder, lockId)
        );
    }

    /**
     * @notice Returns the holder's global aggregate locked amount adjusted to `timestamp`.
     * @dev Applies the historical adjust-balance factor relevant to `timestamp` to the stored
     *      global aggregate.
     * @param tokenHolder Holder whose aggregate is being queried.
     * @param timestamp Reference timestamp for the adjustment factor.
     * @return amount_ Adjusted global aggregate locked amount at `timestamp`.
     */
    function getLockedAmountForAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 amount_) {
        return
            getLockedAmountFor(tokenHolder) *
            AdjustBalancesStorageWrapper.calculateFactor(
                AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
                AdjustBalancesStorageWrapper.getTotalLockLabaf(tokenHolder)
            );
    }

    /**
     * @notice Returns the holder's per-partition aggregate locked amount adjusted to
     *         `timestamp`.
     * @dev Per-partition counterpart of `getLockedAmountForAdjustedAt`.
     * @param partition Partition being queried.
     * @param tokenHolder Holder whose partition aggregate is being queried.
     * @param timestamp Reference timestamp for the adjustment factor.
     * @return amount_ Adjusted per-partition aggregate locked amount at `timestamp`.
     */
    function getLockedAmountForByPartitionAdjustedAt(
        bytes32 partition,
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 amount_) {
        return
            getLockedAmountForByPartition(partition, tokenHolder) *
            AdjustBalancesStorageWrapper.calculateFactor(
                AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
                AdjustBalancesStorageWrapper.getTotalLockLabafByPartition(partition, tokenHolder)
            );
    }

    /**
     * @notice Returns the number of live locks the holder has on the default partition.
     * @dev Convenience accessor for callers that ignore custom partitions.
     * @param tokenHolder Holder being queried.
     * @return lockCount_ Cardinality of the default-partition lock-id set.
     */
    function getLockCountFor(address tokenHolder) internal view returns (uint256 lockCount_) {
        lockCount_ = lockStorage().lockIdsByAccountAndPartition[tokenHolder][_DEFAULT_PARTITION].length();
    }

    /**
     * @notice Returns a paginated slice of the holder's lock ids on the default partition.
     * @dev Convenience accessor for callers that ignore custom partitions.
     * @param tokenHolder Holder being queried.
     * @param pageIndex Zero-based page index.
     * @param pageLength Maximum entries per page.
     * @return locksId_ The requested slice of lock identifiers.
     */
    function getLocksIdFor(
        address tokenHolder,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (uint256[] memory locksId_) {
        locksId_ = lockStorage().lockIdsByAccountAndPartition[tokenHolder][_DEFAULT_PARTITION].getFromSet(
            pageIndex,
            pageLength
        );
    }

    /**
     * @notice Returns a storage pointer to the Lock namespace.
     * @dev Uses inline assembly to bind the returned reference to the deterministic ERC-7201
     *      slot `STORAGE_LOCATION_LOCK`. Marked `pure` because Solidity treats slot literals
     *      as pure even though the returned reference reads/writes storage.
     * @return lock_ Storage reference for the Lock namespace.
     */
    function lockStorage() internal pure returns (LockDataStorage storage lock_) {
        bytes32 position = STORAGE_LOCATION_LOCK;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            lock_.slot := position
        }
    }

    /**
     * @notice Reverts when the supplied lock amount is zero.
     * @dev Cheap sanity check used by `lockByPartition`; raises `ILockTypes.InvalidLockAmount`.
     * @param amount Lock amount being validated.
     */
    function checkNonZeroLockAmount(uint256 amount) internal pure {
        if (amount == 0) revert ILockTypes.InvalidLockAmount();
    }

    /**
     * @notice Drives any pending ERC1410 mutations ahead of a lock write.
     * @dev Calls `triggerAndSyncAll` with `address(0)` as the destination so the holder's
     *      partition state is flushed without triggering a fictitious transfer.
     * @param partition Partition being prepared.
     * @param tokenHolder Holder being prepared.
     */
    function _prepareLock(bytes32 partition, address tokenHolder) private {
        ERC1410StorageWrapper.triggerAndSyncAll(partition, tokenHolder, address(0));
    }

    /**
     * @notice Drives any pending ERC1410 mutations ahead of a release.
     * @dev Mirror of `_prepareLock`; uses `address(0)` as the source to flush the receiving-side
     *      state of the holder.
     * @param partition Partition being prepared.
     * @param tokenHolder Holder being prepared.
     */
    function _prepareRelease(bytes32 partition, address tokenHolder) private {
        ERC1410StorageWrapper.triggerAndSyncAll(partition, address(0), tokenHolder);
    }

    /**
     * @notice Performs the snapshot refresh and partition-balance reduction that must precede
     *         persisting a new lock.
     * @dev Refreshes the locked-balances snapshot via `updateLockedBalancesBeforeLock`, then
     *      decrements the holder's partition balance by `amount` using `reducePartitionOnly`.
     * @param partition Partition whose balance is being reduced.
     * @param amount Lock amount being applied.
     * @param tokenHolder Holder whose balance is being reduced.
     * @param expirationTimestamp Lock expiration timestamp; forwarded for snapshot bookkeeping.
     */
    function _applyLockBeforePersistence(
        bytes32 partition,
        uint256 amount,
        address tokenHolder,
        uint256 expirationTimestamp
    ) private {
        updateLockedBalancesBeforeLock(partition, amount, tokenHolder, expirationTimestamp);
        ERC1410StorageWrapper.reducePartitionOnly(tokenHolder, amount, partition);
    }

    /**
     * @notice Persists a fresh lock record under a newly-minted identifier.
     * @dev Increments the holder's per-partition `nextLockId` monotonically (so identifiers are
     *      never reused even after deletion), stores the active ABAF as the per-lock LABAF,
     *      writes the `LockData` record, and bumps both the global and per-partition aggregate
     *      locked counters by `amount`. The lock id is also added to the holder's lock-id set
     *      so enumeration queries see it.
     * @param partition Partition the lock belongs to.
     * @param amount Locked amount.
     * @param tokenHolder Holder that owns the new lock.
     * @param expirationTimestamp Unix timestamp from which the lock becomes releasable.
     * @param abaf Active ABAF persisted as the lock's LABAF.
     * @return lockId_ Identifier assigned to the new lock.
     */
    function _storeLock(
        bytes32 partition,
        uint256 amount,
        address tokenHolder,
        uint256 expirationTimestamp,
        uint256 abaf
    ) private returns (uint256 lockId_) {
        LockDataStorage storage lockStorageRef = lockStorage();

        lockId_ = ++lockStorageRef.nextLockIdByAccountAndPartition[tokenHolder][partition];

        AdjustBalancesStorageWrapper.setLockLabafById(partition, tokenHolder, lockId_, abaf);

        lockStorageRef.locksByAccountPartitionAndId[tokenHolder][partition][lockId_] = ILock.LockData(
            lockId_,
            amount,
            expirationTimestamp
        );
        lockStorageRef.lockIdsByAccountAndPartition[tokenHolder][partition].add(lockId_);
        lockStorageRef.totalLockedAmountByAccountAndPartition[tokenHolder][partition] += amount;
        lockStorageRef.totalLockedAmountByAccount[tokenHolder] += amount;
    }

    /**
     * @notice Removes a lock record and decrements the affected aggregate counters.
     * @dev Reads the locked amount before deletion so the caller can credit it back to the
     *      partition balance, then decrements both the per-partition and global aggregate
     *      counters, removes the id from the enumerable set, deletes the `LockData` record,
     *      and clears the per-lock LABAF in the adjust-balance namespace.
     * @param partition Partition the lock belongs to.
     * @param tokenHolder Holder that owns the lock.
     * @param lockId Identifier of the lock being removed.
     * @return lockAmount_ Stored amount that was held by the removed lock.
     */
    function _removeLock(bytes32 partition, address tokenHolder, uint256 lockId) private returns (uint256 lockAmount_) {
        LockDataStorage storage lockStorageRef = lockStorage();

        lockAmount_ = lockStorageRef.locksByAccountPartitionAndId[tokenHolder][partition][lockId].amount;

        lockStorageRef.totalLockedAmountByAccountAndPartition[tokenHolder][partition] -= lockAmount_;
        lockStorageRef.totalLockedAmountByAccount[tokenHolder] -= lockAmount_;
        lockStorageRef.lockIdsByAccountAndPartition[tokenHolder][partition].remove(lockId);

        delete lockStorageRef.locksByAccountPartitionAndId[tokenHolder][partition][lockId];
        AdjustBalancesStorageWrapper.removeLabafLock(partition, tokenHolder, lockId);
    }

    /**
     * @notice Restores a released lock amount to the holder's partition balance.
     * @dev Chooses between `addPartitionToOnly` (when the holder does not yet have an entry for
     *      the partition) and `increasePartitionOnly` (when the entry already exists), keeping
     *      the ERC1410 partition bookkeeping consistent without callers having to branch.
     * @param partition Partition being credited.
     * @param tokenHolder Holder being credited.
     * @param lockAmount Amount to restore.
     */
    function _restoreReleasedAmountOnly(bytes32 partition, address tokenHolder, uint256 lockAmount) private {
        if (!ERC1410StorageWrapper.validPartitionForReceiver(partition, tokenHolder)) {
            ERC1410StorageWrapper.addPartitionToOnly(lockAmount, tokenHolder, partition);
            return;
        }
        ERC1410StorageWrapper.increasePartitionOnly(tokenHolder, lockAmount, partition);
    }

    /**
     * @notice Mirrors a lock as a synthetic transfer-to-zero on the unified ledger and emits
     *         the matching ERC1410 partition event.
     * @dev `performTransfer` updates the ERC20-level balance so off-chain indexers that read
     *      the ERC20 view see the lock as a balance reduction; the `TransferByPartition` event
     *      preserves the partition context.
     * @param partition Partition the lock belongs to.
     * @param operator Address that authored the lock.
     * @param tokenHolder Holder whose tokens were locked.
     * @param amount Locked amount.
     */
    function _emitLockEvents(bytes32 partition, address operator, address tokenHolder, uint256 amount) private {
        ERC20StorageWrapper.performTransfer(tokenHolder, address(0), amount);
        emit IERC1410Types.TransferByPartition(partition, operator, tokenHolder, address(0), amount, "", "");
    }

    /**
     * @notice Mirrors a release as a synthetic transfer-from-zero on the unified ledger and
     *         emits the matching ERC1410 partition event.
     * @dev Counterpart of `_emitLockEvents`; restores the ERC20-level balance and emits the
     *      reverse `TransferByPartition`.
     * @param partition Partition the lock belonged to.
     * @param operator Address that authored the release.
     * @param tokenHolder Holder whose tokens were released.
     * @param lockAmount Released amount.
     */
    function _emitReleaseEvents(bytes32 partition, address operator, address tokenHolder, uint256 lockAmount) private {
        ERC20StorageWrapper.performTransfer(address(0), tokenHolder, lockAmount);
        emit IERC1410Types.TransferByPartition(partition, operator, address(0), tokenHolder, lockAmount, "", "");
    }
}
