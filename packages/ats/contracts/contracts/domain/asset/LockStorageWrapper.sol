// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _LOCK_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ILock } from "../../facets/layer_1/lock/ILock.sol";
import {ITransfer} from "../../facets/transfer/ITransfer.sol";
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { ICommonErrors } from "../../infrastructure/errors/ICommonErrors.sol";

struct LockDataStorage {
    mapping(address => uint256) totalLockedAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) totalLockedAmountByAccountAndPartition;
    mapping(address => mapping(bytes32 => mapping(uint256 => ILock.LockData))) locksByAccountPartitionAndId;
    mapping(address => mapping(bytes32 => EnumerableSet.UintSet)) lockIdsByAccountAndPartition;
    mapping(address => mapping(bytes32 => uint256)) nextLockIdByAccountAndPartition;
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
     * @dev Updates the lock by its index for the specified partition and token holder.
     * LABAF (Locked Amount Before Adjustment Factor) for each lock is not updated
     * because the lock is deleted right after, optimizing gas usage.
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

    function updateLockAmountById(bytes32 partition, uint256 lockId, address tokenHolder, uint256 factor) internal {
        lockStorage().locksByAccountPartitionAndId[tokenHolder][partition][lockId].amount *= factor;
    }

    function updateTotalLockedAmountAndLabaf(address tokenHolder, uint256 factor, uint256 abaf) internal {
        lockStorage().totalLockedAmountByAccount[tokenHolder] *= factor;
        AdjustBalancesStorageWrapper.setTotalLockLabaf(tokenHolder, abaf);
    }

    function updateTotalLockedAmountAndLabafByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 factor,
        uint256 abaf
    ) internal {
        lockStorage().totalLockedAmountByAccountAndPartition[tokenHolder][partition] *= factor;
        AdjustBalancesStorageWrapper.setTotalLockLabafByPartition(partition, tokenHolder, abaf);
    }

    function updateLockedBalancesBeforeLock(
        bytes32 partition,
        uint256 /*amount*/,
        address tokenHolder,
        uint256 /*expirationTimestamp*/
    ) internal {
        SnapshotsStorageWrapper.updateAccountSnapshot(tokenHolder, partition);
        SnapshotsStorageWrapper.updateAccountLockedBalancesSnapshot(tokenHolder, partition);
    }

    function updateLockedBalancesBeforeRelease(bytes32 partition, uint256 /*lockId*/, address tokenHolder) internal {
        SnapshotsStorageWrapper.updateAccountSnapshot(tokenHolder, partition);
        SnapshotsStorageWrapper.updateAccountLockedBalancesSnapshot(tokenHolder, partition);
    }

    function getLockedAmountFor(address tokenHolder) internal view returns (uint256 amount_) {
        return lockStorage().totalLockedAmountByAccount[tokenHolder];
    }

    function getLock(
        bytes32 partition,
        address tokenHolder,
        uint256 lockId
    ) internal view returns (ILock.LockData memory) {
        return lockStorage().locksByAccountPartitionAndId[tokenHolder][partition][lockId];
    }

    function isLockedExpirationTimestamp(
        bytes32 partition,
        address tokenHolder,
        uint256 lockId
    ) internal view returns (bool) {
        return
            getLock(partition, tokenHolder, lockId).expirationTimestamp <= TimeTravelStorageWrapper.getBlockTimestamp();
    }

    function isLockIdValid(bytes32 partition, address tokenHolder, uint256 lockId) internal view returns (bool) {
        return lockStorage().lockIdsByAccountAndPartition[tokenHolder][partition].contains(lockId);
    }

    function requireValidExpirationTimestamp(uint256 expirationTimestamp) internal view {
        if (expirationTimestamp < TimeTravelStorageWrapper.getBlockTimestamp())
            revert ICommonErrors.WrongExpirationTimestamp();
    }

    function requireValidLockId(bytes32 partition, address tokenHolder, uint256 lockId) internal view {
        if (!isLockIdValid(partition, tokenHolder, lockId)) revert ILock.WrongLockId();
    }

    function requireLockedExpirationTimestamp(bytes32 partition, address tokenHolder, uint256 lockId) internal view {
        if (!isLockedExpirationTimestamp(partition, tokenHolder, lockId)) revert ILock.LockExpirationNotReached();
    }

    function getLockedAmountForByPartition(bytes32 partition, address tokenHolder) internal view returns (uint256) {
        return lockStorage().totalLockedAmountByAccountAndPartition[tokenHolder][partition];
    }

    function getLockCountForByPartition(
        bytes32 partition,
        address tokenHolder
    ) internal view returns (uint256 lockCount_) {
        return lockStorage().lockIdsByAccountAndPartition[tokenHolder][partition].length();
    }

    function getLocksIdForByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (uint256[] memory locksId_) {
        return lockStorage().lockIdsByAccountAndPartition[tokenHolder][partition].getFromSet(pageIndex, pageLength);
    }

    function getLockForByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 lockId
    ) internal view returns (uint256 amount, uint256 expirationTimestamp) {
        ILock.LockData memory lock = getLock(partition, tokenHolder, lockId);
        amount = lock.amount;
        expirationTimestamp = lock.expirationTimestamp;
    }

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

    function getLockCountFor(address tokenHolder) internal view returns (uint256 lockCount_) {
        lockCount_ = lockStorage().lockIdsByAccountAndPartition[tokenHolder][_DEFAULT_PARTITION].length();
    }

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

    function lockStorage() internal pure returns (LockDataStorage storage lock_) {
        bytes32 position = _LOCK_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            lock_.slot := position
        }
    }

    // --- Private helper functions ---

    function _prepareLock(bytes32 partition, address tokenHolder) private {
        ERC1410StorageWrapper.triggerAndSyncAll(partition, tokenHolder, address(0));
    }

    function _prepareRelease(bytes32 partition, address tokenHolder) private {
        ERC1410StorageWrapper.triggerAndSyncAll(partition, address(0), tokenHolder);
    }

    function _applyLockBeforePersistence(
        bytes32 partition,
        uint256 amount,
        address tokenHolder,
        uint256 expirationTimestamp
    ) private {
        updateLockedBalancesBeforeLock(partition, amount, tokenHolder, expirationTimestamp);
        ERC1410StorageWrapper.reduceBalanceByPartition(tokenHolder, amount, partition);
    }

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

    function _removeLock(bytes32 partition, address tokenHolder, uint256 lockId) private returns (uint256 lockAmount_) {
        LockDataStorage storage lockStorageRef = lockStorage();

        lockAmount_ = lockStorageRef.locksByAccountPartitionAndId[tokenHolder][partition][lockId].amount;

        lockStorageRef.totalLockedAmountByAccountAndPartition[tokenHolder][partition] -= lockAmount_;
        lockStorageRef.totalLockedAmountByAccount[tokenHolder] -= lockAmount_;
        lockStorageRef.lockIdsByAccountAndPartition[tokenHolder][partition].remove(lockId);

        delete lockStorageRef.locksByAccountPartitionAndId[tokenHolder][partition][lockId];
        AdjustBalancesStorageWrapper.removeLabafLock(partition, tokenHolder, lockId);
    }

    function _restoreReleasedAmount(bytes32 partition, address tokenHolder, uint256 lockAmount) private {
        if (!ERC1410StorageWrapper.validPartitionForReceiver(partition, tokenHolder)) {
            ERC1410StorageWrapper.addPartitionTo(lockAmount, tokenHolder, partition);
            return;
        }

        ERC1410StorageWrapper.increaseBalanceByPartition(tokenHolder, lockAmount, partition);
    }

    function _emitLockEvents(bytes32 partition, address operator, address tokenHolder, uint256 amount) private {
        emit IERC1410Types.TransferByPartition(partition, operator, tokenHolder, address(0), amount, "", "");
        emit ITransfer.Transfer(tokenHolder, address(0), amount);
    }

    function _emitReleaseEvents(bytes32 partition, address operator, address tokenHolder, uint256 lockAmount) private {
        emit IERC1410Types.TransferByPartition(partition, operator, address(0), tokenHolder, lockAmount, "", "");
        emit ITransfer.Transfer(address(0), tokenHolder, lockAmount);
    }
}
