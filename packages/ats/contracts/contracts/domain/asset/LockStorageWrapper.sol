// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _LOCK_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ILock } from "../../facets/layer_1/lock/ILock.sol";
import { IERC20 } from "../../facets/layer_1/ERC1400/ERC20/IERC20.sol";
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { ICommonErrors } from "../../infrastructure/errors/ICommonErrors.sol";

/**
 * @notice Diamond Storage struct for the token lock mechanism.
 * @dev    Stored at `_LOCK_STORAGE_POSITION`. `totalLockedAmountByAccount` and
 *         `totalLockedAmountByAccountAndPartition` track tokens removed from the
 *         spendable balance. Both accumulators must remain consistent with the sum of
 *         individual lock amounts for a given holder. Lock IDs are one-based monotonic
 *         counters per (account, partition); a value of `0` for `LockData.id` indicates
 *         a deleted or non-existent lock.
 * @param totalLockedAmountByAccount
 *        Aggregate quantity of locked tokens per account across all partitions.
 * @param totalLockedAmountByAccountAndPartition
 *        Aggregate quantity of locked tokens per account and partition.
 * @param locksByAccountPartitionAndId
 *        Maps (account, partition, lockId) to the full `LockData` record.
 * @param lockIdsByAccountAndPartition
 *        Enumerable set of active lock IDs per account and partition.
 * @param nextLockIdByAccountAndPartition
 *        Monotonically increasing counter tracking the last assigned lock ID per
 *        account and partition; the next ID is `current + 1`.
 */
struct LockDataStorage {
    mapping(address => uint256) totalLockedAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) totalLockedAmountByAccountAndPartition;
    mapping(address => mapping(bytes32 => mapping(uint256 => ILock.LockData))) locksByAccountPartitionAndId;
    mapping(address => mapping(bytes32 => EnumerableSet.UintSet)) lockIdsByAccountAndPartition;
    mapping(address => mapping(bytes32 => uint256)) nextLockIdByAccountAndPartition;
}

/**
 * @title  LockStorageWrapper
 * @notice Internal library providing storage operations for the token lock mechanism,
 *         including lock creation, release, ABAF adjustment, and locked balance queries.
 * @dev    Anchors `LockDataStorage` at `_LOCK_STORAGE_POSITION` following the ERC-2535
 *         Diamond Storage Pattern. All functions are `internal` and intended exclusively
 *         for use within facets or other internal libraries of the same diamond.
 *
 *         Lock IDs are one-based, per-account, per-partition monotonic counters. A lock
 *         is active if and only if its ID is present in
 *         `lockIdsByAccountAndPartition[holder][partition]`.
 *
 *         Both aggregate and per-partition locked amount accumulators are subject to
 *         ABAF scaling via dedicated LABAF tracking managed by
 *         `AdjustBalancesStorageWrapper`. Individual lock amounts are also ABAF-adjusted
 *         at the lock level. The lock-level LABAF is intentionally not updated on
 *         release (`updateLockByIndex`) because the lock record is deleted immediately
 *         afterwards, avoiding an unnecessary storage write.
 *
 *         Lock creation moves tokens out of the holder's spendable partition balance.
 *         Release restores those tokens to the spendable balance, creating a new
 *         partition entry if necessary.
 *
 *         Block timestamps are sourced from `TimeTravelStorageWrapper` to support
 *         test-environment time manipulation without affecting production logic.
 * @author Hashgraph
 */
library LockStorageWrapper {
    using Pagination for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;

    /**
     * @notice Locks `amount` tokens for `tokenHolder` under `partition` until
     *         `expirationTimestamp`, moving them out of the spendable balance.
     * @dev    Execution order:
     *           1. `_prepareLock` — triggers pending scheduled tasks and syncs balance
     *              adjustments.
     *           2. `updateTotalLock` — syncs ABAF on aggregate locked accumulators.
     *           3. `_applyLockBeforePersistence` — updates snapshots and reduces the
     *              partition balance.
     *           4. `_storeLock` — persists the lock record and increments accumulators.
     *           5. `_emitLockEvents` — emits `TransferByPartition` and `IERC20.Transfer`
     *              to `address(0)`.
     *         Reverts with `IERC20.InsufficientBalance` if the partition balance is
     *         insufficient.
     *         Emits: `IERC1410Types.TransferByPartition`, `IERC20.Transfer`.
     * @param partition           Partition under which the lock is created.
     * @param amount              Token quantity to lock.
     * @param tokenHolder         Address whose tokens are locked.
     * @param expirationTimestamp Unix timestamp after which the lock may be released.
     * @param operator            Address initiating the lock, recorded in the emitted
     *                            event.
     * @return success_  Always `true` on successful creation.
     * @return lockId_   One-based lock ID assigned to the new lock.
     */
    function lockByPartition(
        bytes32 partition,
        uint256 amount,
        address tokenHolder,
        uint256 expirationTimestamp,
        address operator
    ) internal returns (bool success_, uint256 lockId_) {
        _prepareLock(partition, tokenHolder);
        uint256 abaf = updateTotalLock(partition, tokenHolder);
        _applyLockBeforePersistence(partition, amount, tokenHolder, expirationTimestamp);
        lockId_ = _storeLock(partition, amount, tokenHolder, expirationTimestamp, abaf);
        _emitLockEvents(partition, operator, tokenHolder, amount);
        return (true, lockId_);
    }

    /**
     * @notice Releases a lock identified by `lockId`, restoring the held tokens to the
     *         token holder's spendable balance.
     * @dev    Execution order:
     *           1. `_prepareRelease` — triggers pending scheduled tasks and syncs
     *              balance adjustments.
     *           2. `updateTotalLock` — syncs aggregate locked ABAF.
     *           3. `updateLockByIndex` — applies the per-lock ABAF factor before the
     *              lock is consumed.
     *           4. `updateLockedBalancesBeforeRelease` — updates account and
     *              locked-balance snapshots.
     *           5. `_removeLock` — decrements accumulators, removes the lock from the
     *              active set, and deletes the record.
     *           6. `_restoreReleasedAmount` — credits the released amount back to the
     *              holder's partition balance.
     *           7. `_emitReleaseEvents` — emits `TransferByPartition` and
     *              `IERC20.Transfer` from `address(0)`.
     *         Callers must validate `lockId` and expiration state before calling.
     *         Emits: `IERC1410Types.TransferByPartition`, `IERC20.Transfer`.
     * @param partition    Partition under which the lock was created.
     * @param lockId       One-based lock ID to release.
     * @param tokenHolder  Address whose lock is being released.
     * @param operator     Address initiating the release, recorded in the emitted event.
     * @return success_    Always `true` on successful release.
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
        _restoreReleasedAmount(partition, tokenHolder, lockAmount);
        _emitReleaseEvents(partition, operator, tokenHolder, lockAmount);
        return true;
    }

    /**
     * @notice Synchronises the aggregate and per-partition locked ABAF for a token
     *         holder, scaling the stored locked amounts by any outstanding adjustment
     *         factor, and returns the current ABAF.
     * @dev    Reads the current ABAF and compares it against both the aggregate lock
     *         LABAF and the partition-specific lock LABAF. If either diverges, the
     *         corresponding accumulator is multiplied by the calculated factor and the
     *         LABAF is updated. Must be called before any locked amount mutation to
     *         ensure stored amounts reflect the current adjustment state.
     * @param partition    Partition whose lock LABAF is to be synchronised.
     * @param tokenHolder  Account whose locked amounts are to be adjusted.
     * @return abaf_  Current global ABAF value at the time of the call.
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
     * @notice Applies the current ABAF to a specific lock's stored amount if the
     *         lock-level LABAF has diverged from `abaf`.
     * @dev    The lock-level LABAF is not updated after the amount adjustment because
     *         this function is called immediately before lock deletion, making the LABAF
     *         write redundant and saving a storage operation. Returns immediately (no-op)
     *         if `abaf` already matches the stored lock LABAF.
     * @param partition    Partition of the lock.
     * @param lockId       Lock ID to update.
     * @param tokenHolder  Account that owns the lock.
     * @param abaf         Current ABAF value to apply.
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
     * @notice Scales the stored amount of a specific lock by a multiplicative factor.
     * @dev    Intended to be called only from `updateLockByIndex` after confirming the
     *         lock-level LABAF has diverged. Callers must ensure `factor` is non-zero.
     * @param partition    Partition of the lock.
     * @param lockId       Lock ID whose amount is scaled.
     * @param tokenHolder  Account that owns the lock.
     * @param factor       Multiplicative scaling factor.
     */
    function updateLockAmountById(bytes32 partition, uint256 lockId, address tokenHolder, uint256 factor) internal {
        lockStorage().locksByAccountPartitionAndId[tokenHolder][partition][lockId].amount *= factor;
    }

    /**
     * @notice Scales the aggregate locked token amount for a holder by `factor` and
     *         updates the stored aggregate lock LABAF to `abaf`.
     * @dev    Intended to be called only from `updateTotalLock` after confirming that
     *         the current ABAF diverges from the stored LABAF. Callers must ensure
     *         `factor` is non-zero.
     * @param tokenHolder  Account whose aggregate locked amount is scaled.
     * @param factor       Multiplicative scaling factor.
     * @param abaf         Current ABAF value to store as the updated LABAF.
     */
    function updateTotalLockedAmountAndLabaf(address tokenHolder, uint256 factor, uint256 abaf) internal {
        lockStorage().totalLockedAmountByAccount[tokenHolder] *= factor;
        AdjustBalancesStorageWrapper.setTotalLockLabaf(tokenHolder, abaf);
    }

    /**
     * @notice Scales the per-partition locked token amount for a holder by `factor` and
     *         updates the stored partition lock LABAF to `abaf`.
     * @dev    Intended to be called only from `updateTotalLock` after confirming that
     *         the current ABAF diverges from the stored partition LABAF. Callers must
     *         ensure `factor` is non-zero.
     * @param partition    Partition whose locked amount is scaled.
     * @param tokenHolder  Account whose partition locked amount is scaled.
     * @param factor       Multiplicative scaling factor.
     * @param abaf         Current ABAF value to store as the updated partition LABAF.
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
     * @notice Updates the account and locked-balance snapshots immediately before a lock
     *         is created.
     * @dev    Must be called after ABAF synchronisation and before the partition balance
     *         reduction to capture a consistent pre-lock snapshot state. The `amount`
     *         and `expirationTimestamp` parameters are accepted for interface
     *         compatibility but are unused in the current implementation.
     * @param partition    Partition under which the lock is being created.
     * @param tokenHolder  Address whose snapshots are to be updated.
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
     * @notice Updates the account and locked-balance snapshots immediately before a lock
     *         is released.
     * @dev    Must be called after ABAF synchronisation and before the lock record is
     *         removed. The `lockId` parameter is accepted for interface compatibility but
     *         is unused in the current implementation.
     * @param partition    Partition under which the lock was created.
     * @param tokenHolder  Address whose snapshots are to be updated.
     */
    function updateLockedBalancesBeforeRelease(bytes32 partition, uint256 /*lockId*/, address tokenHolder) internal {
        SnapshotsStorageWrapper.updateAccountSnapshot(tokenHolder, partition);
        SnapshotsStorageWrapper.updateAccountLockedBalancesSnapshot(tokenHolder, partition);
    }

    /**
     * @notice Returns the raw aggregate locked token amount for an address without ABAF
     *         adjustment.
     * @dev    Use `getLockedAmountForAdjustedAt` for a timestamp-adjusted view.
     * @param tokenHolder  Address to query.
     * @return amount_  Raw aggregate locked token quantity.
     */
    function getLockedAmountFor(address tokenHolder) internal view returns (uint256 amount_) {
        return lockStorage().totalLockedAmountByAccount[tokenHolder];
    }

    /**
     * @notice Returns the raw stored lock record for the given lock identifier.
     * @dev    Returns a zero-value struct if the lock does not exist. Callers should
     *         validate the lock ID via `isLockIdValid` before relying on the returned
     *         data.
     * @param partition    Partition under which the lock was created.
     * @param tokenHolder  Address that owns the lock.
     * @param lockId       One-based lock ID to retrieve.
     * @return Full `LockData` struct for the specified lock; zero-value if absent.
     */
    function getLock(
        bytes32 partition,
        address tokenHolder,
        uint256 lockId
    ) internal view returns (ILock.LockData memory) {
        return lockStorage().locksByAccountPartitionAndId[tokenHolder][partition][lockId];
    }

    /**
     * @notice Returns whether the expiration timestamp of the specified lock has been
     *         reached relative to the current block timestamp.
     * @dev    A lock with `expirationTimestamp == block.timestamp` is considered expired.
     *         Uses `TimeTravelStorageWrapper.getBlockTimestamp` for timestamp resolution.
     * @param partition    Partition under which the lock was created.
     * @param tokenHolder  Address that owns the lock.
     * @param lockId       One-based lock ID to evaluate.
     * @return True if `expirationTimestamp <= block.timestamp`; false otherwise.
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
     * @notice Returns whether the given lock ID is currently active for the specified
     *         account and partition.
     * @dev    Checks membership in the `lockIdsByAccountAndPartition` enumerable set.
     *         Returns `false` for deleted or never-created lock IDs.
     * @param partition    Partition to check.
     * @param tokenHolder  Address to check.
     * @param lockId       Lock ID to validate.
     * @return True if the lock ID is active; false otherwise.
     */
    function isLockIdValid(bytes32 partition, address tokenHolder, uint256 lockId) internal view returns (bool) {
        return lockStorage().lockIdsByAccountAndPartition[tokenHolder][partition].contains(lockId);
    }

    /**
     * @notice Reverts if the provided expiration timestamp is in the past relative to
     *         the current block timestamp.
     * @dev    Reverts with `ICommonErrors.WrongExpirationTimestamp`. Use as a guard
     *         before lock creation to ensure the lock is valid for a future date.
     * @param expirationTimestamp  Unix timestamp to validate.
     */
    function requireValidExpirationTimestamp(uint256 expirationTimestamp) internal view {
        if (expirationTimestamp < TimeTravelStorageWrapper.getBlockTimestamp())
            revert ICommonErrors.WrongExpirationTimestamp();
    }

    /**
     * @notice Reverts if the given lock ID is not active for the specified account and
     *         partition.
     * @dev    Delegates to `isLockIdValid`. Reverts with `ILock.WrongLockId`.
     * @param partition    Partition to check.
     * @param tokenHolder  Address to check.
     * @param lockId       Lock ID to validate.
     */
    function requireValidLockId(bytes32 partition, address tokenHolder, uint256 lockId) internal view {
        if (!isLockIdValid(partition, tokenHolder, lockId)) revert ILock.WrongLockId();
    }

    /**
     * @notice Reverts if the expiration timestamp of the specified lock has not yet been
     *         reached.
     * @dev    Delegates to `isLockedExpirationTimestamp`. Reverts with
     *         `ILock.LockExpirationNotReached`. Use as a guard before release operations
     *         that require expiry.
     * @param partition    Partition of the lock.
     * @param tokenHolder  Address that owns the lock.
     * @param lockId       Lock ID to check.
     */
    function requireLockedExpirationTimestamp(bytes32 partition, address tokenHolder, uint256 lockId) internal view {
        if (!isLockedExpirationTimestamp(partition, tokenHolder, lockId)) revert ILock.LockExpirationNotReached();
    }

    /**
     * @notice Returns the raw per-partition locked token amount for an address without
     *         ABAF adjustment.
     * @dev    Use `getLockedAmountForByPartitionAdjustedAt` for a timestamp-adjusted
     *         view.
     * @param partition    Partition to query.
     * @param tokenHolder  Address to query.
     * @return Raw locked token quantity for `tokenHolder` in `partition`.
     */
    function getLockedAmountForByPartition(bytes32 partition, address tokenHolder) internal view returns (uint256) {
        return lockStorage().totalLockedAmountByAccountAndPartition[tokenHolder][partition];
    }

    /**
     * @notice Returns the number of active locks for a token holder under a specific
     *         partition.
     * @dev    Reads the length of the underlying `EnumerableSet.UintSet`; O(1) gas cost.
     * @param partition    Partition to query.
     * @param tokenHolder  Address to query.
     * @return lockCount_  Number of active lock IDs for `tokenHolder` in `partition`.
     */
    function getLockCountForByPartition(
        bytes32 partition,
        address tokenHolder
    ) internal view returns (uint256 lockCount_) {
        return lockStorage().lockIdsByAccountAndPartition[tokenHolder][partition].length();
    }

    /**
     * @notice Returns a paginated slice of active lock IDs for a token holder under a
     *         specific partition.
     * @dev    Delegates to the `Pagination` library extension on `EnumerableSet.UintSet`.
     *         Enumeration order is not guaranteed to be stable across lock creations or
     *         removals.
     * @param partition    Partition to query.
     * @param tokenHolder  Address to query.
     * @param pageIndex    Zero-based page number to retrieve.
     * @param pageLength   Maximum number of lock IDs to return per page.
     * @return locksId_  Array of active lock IDs for the requested page.
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
     * @notice Returns the raw amount and expiration timestamp for a specific lock
     *         without ABAF adjustment.
     * @dev    Returns zero values if the lock does not exist. Use
     *         `getLockForByPartitionAdjustedAt` for a timestamp-adjusted view of the
     *         amount.
     * @param partition    Partition under which the lock was created.
     * @param tokenHolder  Address that owns the lock.
     * @param lockId       Lock ID to retrieve.
     * @return amount              Raw locked token quantity.
     * @return expirationTimestamp Unix timestamp after which the lock may be released.
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
     * @notice Returns the ABAF-adjusted lock amount and expiration timestamp for a
     *         specific lock at the given timestamp.
     * @dev    Applies `calculateFactor(abafAt(timestamp), lockLabafById)` to the raw
     *         amount. Expiration timestamp is returned unmodified. Read-only projection;
     *         no state is mutated.
     * @param partition    Partition under which the lock was created.
     * @param tokenHolder  Address that owns the lock.
     * @param lockId       Lock ID to retrieve.
     * @param timestamp    Unix timestamp at which to evaluate the ABAF adjustment.
     * @return amount_              ABAF-adjusted locked token quantity.
     * @return expirationTimestamp_ Unix timestamp after which the lock may be released.
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
     * @notice Returns the aggregate locked amount for an address scaled by the ABAF
     *         ratio at the given timestamp.
     * @dev    Multiplies the raw aggregate locked amount by
     *         `calculateFactor(abafAt(timestamp), totalLockLabaf)`. Read-only projection.
     * @param tokenHolder  Address to query.
     * @param timestamp    Unix timestamp at which to evaluate the ABAF adjustment.
     * @return amount_  ABAF-adjusted aggregate locked token amount.
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
     * @notice Returns the per-partition locked amount for an address scaled by the ABAF
     *         ratio at the given timestamp.
     * @dev    Applies `calculateFactor(abafAt(timestamp), totalLockLabafByPartition)` to
     *         the raw partition locked amount. Read-only projection.
     * @param partition    Partition to query.
     * @param tokenHolder  Address to query.
     * @param timestamp    Unix timestamp at which to evaluate the ABAF adjustment.
     * @return amount_  ABAF-adjusted locked token amount for `tokenHolder` in `partition`.
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
     * @notice Returns the number of active locks for a token holder under the default
     *         partition.
     * @dev    Convenience accessor scoped to `_DEFAULT_PARTITION`.
     * @param tokenHolder  Address to query.
     * @return lockCount_  Number of active lock IDs for `tokenHolder` in
     *                     `_DEFAULT_PARTITION`.
     */
    function getLockCountFor(address tokenHolder) internal view returns (uint256 lockCount_) {
        lockCount_ = lockStorage().lockIdsByAccountAndPartition[tokenHolder][_DEFAULT_PARTITION].length();
    }

    /**
     * @notice Returns a paginated slice of active lock IDs for a token holder under the
     *         default partition.
     * @dev    Convenience accessor scoped to `_DEFAULT_PARTITION`. Enumeration order is
     *         not guaranteed to be stable across lock creations or removals.
     * @param tokenHolder  Address to query.
     * @param pageIndex    Zero-based page number to retrieve.
     * @param pageLength   Maximum number of lock IDs to return per page.
     * @return locksId_  Array of active lock IDs for the requested page.
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
     * @notice Triggers all pending scheduled tasks and synchronises balance adjustments
     *         for the token holder before a lock is created.
     * @dev    Delegates to `ERC1410StorageWrapper.triggerAndSyncAll` with `address(0)`
     *         as the destination, as lock creation has no recipient.
     * @param partition    Partition under which the lock is being created.
     * @param tokenHolder  Token holder whose balance adjustments are synchronised.
     */
    function _prepareLock(bytes32 partition, address tokenHolder) private {
        ERC1410StorageWrapper.triggerAndSyncAll(partition, tokenHolder, address(0));
    }

    /**
     * @notice Triggers all pending scheduled tasks and synchronises balance adjustments
     *         for the token holder before a lock is released.
     * @dev    Delegates to `ERC1410StorageWrapper.triggerAndSyncAll` with `address(0)`
     *         as the source and `tokenHolder` as the destination, matching the release
     *         direction of the token flow.
     * @param partition    Partition under which the lock was created.
     * @param tokenHolder  Token holder whose balance adjustments are synchronised.
     */
    function _prepareRelease(bytes32 partition, address tokenHolder) private {
        ERC1410StorageWrapper.triggerAndSyncAll(partition, address(0), tokenHolder);
    }

    /**
     * @notice Updates snapshots and reduces the token holder's partition balance by
     *         `amount` as part of lock creation preparation.
     * @dev    Calls `updateLockedBalancesBeforeLock` for snapshot updates, then
     *         delegates the partition balance reduction to
     *         `ERC1410StorageWrapper.reduceBalanceByPartition`. Reverts with
     *         `IERC20.InsufficientBalance` if the partition balance is insufficient.
     * @param partition           Partition from which tokens are locked.
     * @param amount              Token quantity to deduct from the spendable balance.
     * @param tokenHolder         Address whose balance is reduced.
     * @param expirationTimestamp Passed through to `updateLockedBalancesBeforeLock`
     *                            for interface compatibility.
     */
    function _applyLockBeforePersistence(
        bytes32 partition,
        uint256 amount,
        address tokenHolder,
        uint256 expirationTimestamp
    ) private {
        updateLockedBalancesBeforeLock(partition, amount, tokenHolder, expirationTimestamp);
        ERC1410StorageWrapper.reduceBalanceByPartition(tokenHolder, amount, partition);
    }

    /**
     * @notice Persists a new lock record, registers it in the active set, increments
     *         the locked amount accumulators, and records the lock-level ABAF baseline.
     * @dev    Assigns a one-based lock ID via pre-increment of
     *         `nextLockIdByAccountAndPartition`. Records `abaf` as the lock-level LABAF
     *         so that future ABAF scaling can be computed correctly.
     * @param partition           Partition under which the lock is stored.
     * @param amount              Token quantity to lock.
     * @param tokenHolder         Token holder that owns the lock.
     * @param expirationTimestamp Unix timestamp after which the lock may be released.
     * @param abaf                Current ABAF value at lock creation time, stored as the
     *                            lock-level LABAF baseline.
     * @return lockId_  One-based lock ID assigned to the newly created lock.
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
     * @notice Removes a lock record from storage, decrements the locked amount
     *         accumulators, removes the lock ID from the active set, and clears the
     *         lock-level LABAF entry.
     * @dev    Reads the lock amount before deletion for use in subsequent balance
     *         restoration. Callers must ensure ABAF has been applied to the lock amount
     *         via `updateLockByIndex` before calling to ensure the correct amount is
     *         returned and decremented.
     * @param partition    Partition of the lock.
     * @param tokenHolder  Address that owns the lock.
     * @param lockId       Lock ID to remove.
     * @return lockAmount_  Token quantity released from the lock (post-ABAF adjustment).
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
     * @notice Restores `lockAmount` tokens to the token holder's spendable partition
     *         balance, creating a new partition entry if one does not yet exist.
     * @dev    If the holder already holds a position in `partition`, increments it via
     *         `increaseBalanceByPartition`. Otherwise creates a new entry via
     *         `addPartitionTo`. Must only be called after the lock amount accumulators
     *         have been decremented.
     * @param partition    Partition to which tokens are restored.
     * @param tokenHolder  Address to receive the released balance.
     * @param lockAmount   Token quantity to restore.
     */
    function _restoreReleasedAmount(bytes32 partition, address tokenHolder, uint256 lockAmount) private {
        if (!ERC1410StorageWrapper.validPartitionForReceiver(partition, tokenHolder)) {
            ERC1410StorageWrapper.addPartitionTo(lockAmount, tokenHolder, partition);
            return;
        }
        ERC1410StorageWrapper.increaseBalanceByPartition(tokenHolder, lockAmount, partition);
    }

    /**
     * @notice Emits `IERC1410Types.TransferByPartition` and `IERC20.Transfer` to
     *         `address(0)` to signal that tokens have been locked and removed from the
     *         spendable supply.
     * @param partition    Partition under which the lock was created.
     * @param operator     Address that initiated the lock.
     * @param tokenHolder  Address whose tokens were locked.
     * @param amount       Token quantity locked.
     */
    function _emitLockEvents(bytes32 partition, address operator, address tokenHolder, uint256 amount) private {
        emit IERC1410Types.TransferByPartition(partition, operator, tokenHolder, address(0), amount, "", "");
        emit IERC20.Transfer(tokenHolder, address(0), amount);
    }

    /**
     * @notice Emits `IERC1410Types.TransferByPartition` from `address(0)` and
     *         `IERC20.Transfer` from `address(0)` to signal that locked tokens have
     *         been released back to the spendable supply.
     * @param partition    Partition under which the lock was held.
     * @param operator     Address that initiated the release.
     * @param tokenHolder  Address receiving the released tokens.
     * @param lockAmount   Token quantity released.
     */
    function _emitReleaseEvents(bytes32 partition, address operator, address tokenHolder, uint256 lockAmount) private {
        emit IERC1410Types.TransferByPartition(partition, operator, address(0), tokenHolder, lockAmount, "", "");
        emit IERC20.Transfer(address(0), tokenHolder, lockAmount);
    }

    /**
     * @notice Returns the Diamond Storage pointer for `LockDataStorage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot
     *         defined by `_LOCK_STORAGE_POSITION`, following the ERC-2535 Diamond
     *         Storage Pattern. Slot isolation prevents collisions with other facet
     *         storage structs in the same proxy. Must only be called from within this
     *         library.
     * @return lock_  Storage pointer to the `LockDataStorage` struct.
     */
    function lockStorage() private pure returns (LockDataStorage storage lock_) {
        bytes32 position = _LOCK_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            lock_.slot := position
        }
    }
}
