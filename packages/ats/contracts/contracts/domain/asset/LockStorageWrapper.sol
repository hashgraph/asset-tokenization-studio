// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _LOCK_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ILock } from "../../facets/layer_1/lock/ILock.sol";
import { IERC20StorageWrapper } from "./ERC1400/ERC20/IERC20StorageWrapper.sol";
import { IERC1410StorageWrapper } from "./ERC1400/ERC1410/IERC1410StorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";

struct LockDataStorage {
    mapping(address => uint256) totalLockedAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) totalLockedAmountByAccountAndPartition;
    mapping(address => mapping(bytes32 => mapping(uint256 => ILock.LockData))) locksByAccountPartitionAndId;
    mapping(address => mapping(bytes32 => EnumerableSet.UintSet)) lockIdsByAccountAndPartition;
    mapping(address => mapping(bytes32 => uint256)) nextLockIdByAccountAndPartition;
}

library LockStorageWrapper {
    using Pagination for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;

    error WrongLockId();
    error WrongExpirationTimestamp();
    error LockExpirationNotReached();

    // --- Storage accessor ---

    function _lockStorage() internal pure returns (LockDataStorage storage lock_) {
        bytes32 position = _LOCK_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            lock_.slot := position
        }
    }

    // --- Guard functions ---

    // solhint-disable-next-line ordering
    function _requireValidExpirationTimestamp(uint256 expirationTimestamp) internal view {
        if (expirationTimestamp < block.timestamp) revert WrongExpirationTimestamp();
    }

    function _requireValidLockId(bytes32 partition, address tokenHolder, uint256 lockId) internal view {
        if (!_isLockIdValid(partition, tokenHolder, lockId)) revert WrongLockId();
    }

    function _requireLockedExpirationTimestamp(bytes32 partition, address tokenHolder, uint256 lockId) internal view {
        if (!_isLockedExpirationTimestamp(partition, tokenHolder, lockId)) revert LockExpirationNotReached();
    }

    // --- Query functions ---

    // solhint-disable-next-line ordering
    function _getLockedAmountForByPartition(bytes32 partition, address tokenHolder) internal view returns (uint256) {
        return _lockStorage().totalLockedAmountByAccountAndPartition[tokenHolder][partition];
    }

    function _getLockCountForByPartition(
        bytes32 partition,
        address tokenHolder
    ) internal view returns (uint256 lockCount_) {
        return _lockStorage().lockIdsByAccountAndPartition[tokenHolder][partition].length();
    }

    function _getLocksIdForByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (uint256[] memory locksId_) {
        return _lockStorage().lockIdsByAccountAndPartition[tokenHolder][partition].getFromSet(pageIndex, pageLength);
    }

    function _getLockForByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 lockId
    ) internal view returns (uint256 amount, uint256 expirationTimestamp) {
        ILock.LockData memory lock = _getLock(partition, tokenHolder, lockId);
        amount = lock.amount;
        expirationTimestamp = lock.expirationTimestamp;
    }

    function _getLockForByPartitionAdjustedAt(
        bytes32 partition,
        address tokenHolder,
        uint256 lockId,
        uint256 timestamp
    ) internal view returns (uint256 amount_, uint256 expirationTimestamp_) {
        uint256 factor = AdjustBalancesStorageWrapper._calculateFactor(
            AdjustBalancesStorageWrapper._getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper._getLockLabafById(partition, tokenHolder, lockId)
        );

        (amount_, expirationTimestamp_) = _getLockForByPartition(partition, tokenHolder, lockId);
        amount_ *= factor;
    }

    function _getLockedAmountFor(address tokenHolder) internal view returns (uint256 amount_) {
        return _lockStorage().totalLockedAmountByAccount[tokenHolder];
    }

    function _getLockedAmountForAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 amount_) {
        uint256 factor = AdjustBalancesStorageWrapper._calculateFactor(
            AdjustBalancesStorageWrapper._getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper._getTotalLockLabaf(tokenHolder)
        );
        return _getLockedAmountFor(tokenHolder) * factor;
    }

    function _getLockedAmountForByPartitionAdjustedAt(
        bytes32 partition,
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 amount_) {
        uint256 factor = AdjustBalancesStorageWrapper._calculateFactor(
            AdjustBalancesStorageWrapper._getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper._getTotalLockLabafByPartition(partition, tokenHolder)
        );
        return _getLockedAmountForByPartition(partition, tokenHolder) * factor;
    }

    function _getLock(
        bytes32 partition,
        address tokenHolder,
        uint256 lockId
    ) internal view returns (ILock.LockData memory) {
        return _lockStorage().locksByAccountPartitionAndId[tokenHolder][partition][lockId];
    }

    function _isLockedExpirationTimestamp(
        bytes32 partition,
        address tokenHolder,
        uint256 lockId
    ) internal view returns (bool) {
        ILock.LockData memory lock = _getLock(partition, tokenHolder, lockId);

        if (lock.expirationTimestamp > block.timestamp) return false;

        return true;
    }

    function _isLockIdValid(bytes32 partition, address tokenHolder, uint256 lockId) internal view returns (bool) {
        return _lockStorage().lockIdsByAccountAndPartition[tokenHolder][partition].contains(lockId);
    }

    // --- Lock operation functions ---

    function _lockByPartition(
        bytes32 partition,
        uint256 amount,
        address tokenHolder,
        uint256 expirationTimestamp,
        address operator
    ) internal returns (bool success_, uint256 lockId_) {
        ERC1410StorageWrapper._triggerAndSyncAll(partition, tokenHolder, address(0));

        uint256 abaf = _updateTotalLock(partition, tokenHolder);

        _updateLockedBalancesBeforeLock(partition, amount, tokenHolder, expirationTimestamp);
        ERC1410StorageWrapper._reduceBalanceByPartition(tokenHolder, amount, partition);

        LockDataStorage storage lockStorageRef = _lockStorage();

        lockId_ = ++lockStorageRef.nextLockIdByAccountAndPartition[tokenHolder][partition];

        ILock.LockData memory lock = ILock.LockData(lockId_, amount, expirationTimestamp);
        AdjustBalancesStorageWrapper._setLockLabafById(partition, tokenHolder, lockId_, abaf);

        lockStorageRef.locksByAccountPartitionAndId[tokenHolder][partition][lockId_] = lock;
        lockStorageRef.lockIdsByAccountAndPartition[tokenHolder][partition].add(lockId_);
        lockStorageRef.totalLockedAmountByAccountAndPartition[tokenHolder][partition] += amount;
        lockStorageRef.totalLockedAmountByAccount[tokenHolder] += amount;

        emit IERC1410StorageWrapper.TransferByPartition(partition, operator, tokenHolder, address(0), amount, "", "");
        emit IERC20StorageWrapper.Transfer(tokenHolder, address(0), amount);

        success_ = true;
    }

    function _releaseByPartition(
        bytes32 partition,
        uint256 lockId,
        address tokenHolder,
        address operator
    ) internal returns (bool success_) {
        ERC1410StorageWrapper._triggerAndSyncAll(partition, address(0), tokenHolder);

        uint256 abaf = _updateTotalLock(partition, tokenHolder);

        _updateLockByIndex(partition, lockId, tokenHolder, abaf);

        _updateLockedBalancesBeforeRelease(partition, lockId, tokenHolder);

        uint256 lockAmount = _getLock(partition, tokenHolder, lockId).amount;

        LockDataStorage storage lockStorageRef = _lockStorage();
        lockStorageRef.totalLockedAmountByAccountAndPartition[tokenHolder][partition] -= lockAmount;
        lockStorageRef.totalLockedAmountByAccount[tokenHolder] -= lockAmount;
        lockStorageRef.lockIdsByAccountAndPartition[tokenHolder][partition].remove(lockId);

        delete lockStorageRef.locksByAccountPartitionAndId[tokenHolder][partition][lockId];
        AdjustBalancesStorageWrapper._removeLabafLock(partition, tokenHolder, lockId);

        if (!ERC1410StorageWrapper._validPartitionForReceiver(partition, tokenHolder)) {
            ERC1410StorageWrapper._addPartitionTo(lockAmount, tokenHolder, partition);
        } else {
            ERC1410StorageWrapper._increaseBalanceByPartition(tokenHolder, lockAmount, partition);
        }

        emit IERC1410StorageWrapper.TransferByPartition(
            partition,
            operator,
            address(0),
            tokenHolder,
            lockAmount,
            "",
            ""
        );
        emit IERC20StorageWrapper.Transfer(address(0), tokenHolder, lockAmount);

        success_ = true;
    }

    function _updateTotalLock(bytes32 partition, address tokenHolder) internal returns (uint256 abaf_) {
        abaf_ = AdjustBalancesStorageWrapper._getAbaf();

        uint256 labaf = AdjustBalancesStorageWrapper._getTotalLockLabaf(tokenHolder);
        uint256 labafByPartition = AdjustBalancesStorageWrapper._getTotalLockLabafByPartition(partition, tokenHolder);

        if (abaf_ != labaf) {
            uint256 factor = AdjustBalancesStorageWrapper._calculateFactor(abaf_, labaf);

            _updateTotalLockedAmountAndLabaf(tokenHolder, factor, abaf_);
        }

        if (abaf_ != labafByPartition) {
            uint256 factorByPartition = AdjustBalancesStorageWrapper._calculateFactor(abaf_, labafByPartition);

            _updateTotalLockedAmountAndLabafByPartition(partition, tokenHolder, factorByPartition, abaf_);
        }
    }

    /**
     * @dev Updates the lock by its index for the specified partition and token holder.
     * LABAF (Locked Amount Before Adjustment Factor) for each lock is not updated
     * because the lock is deleted right after, optimizing gas usage.
     */
    function _updateLockByIndex(bytes32 partition, uint256 lockId, address tokenHolder, uint256 abaf) internal {
        uint256 lockLabaf = AdjustBalancesStorageWrapper._getLockLabafById(partition, tokenHolder, lockId);

        if (abaf != lockLabaf) {
            uint256 factorLock = AdjustBalancesStorageWrapper._calculateFactor(abaf, lockLabaf);

            _updateLockAmountById(partition, lockId, tokenHolder, factorLock);
        }
    }

    function _updateLockAmountById(bytes32 partition, uint256 lockId, address tokenHolder, uint256 factor) internal {
        _lockStorage().locksByAccountPartitionAndId[tokenHolder][partition][lockId].amount *= factor;
    }

    function _updateTotalLockedAmountAndLabaf(address tokenHolder, uint256 factor, uint256 abaf) internal {
        LockDataStorage storage lockStorageRef = _lockStorage();

        lockStorageRef.totalLockedAmountByAccount[tokenHolder] *= factor;
        AdjustBalancesStorageWrapper._setTotalLockLabaf(tokenHolder, abaf);
    }

    function _updateTotalLockedAmountAndLabafByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 factor,
        uint256 abaf
    ) internal {
        LockDataStorage storage lockStorageRef = _lockStorage();

        lockStorageRef.totalLockedAmountByAccountAndPartition[tokenHolder][partition] *= factor;
        AdjustBalancesStorageWrapper._setTotalLockLabafByPartition(partition, tokenHolder, abaf);
    }

    function _updateLockedBalancesBeforeLock(
        bytes32 partition,
        uint256 /*amount*/,
        address tokenHolder,
        uint256 /*expirationTimestamp*/
    ) internal {
        SnapshotsStorageWrapper._updateAccountSnapshot(tokenHolder, partition);
        SnapshotsStorageWrapper._updateAccountLockedBalancesSnapshot(tokenHolder, partition);
    }

    function _updateLockedBalancesBeforeRelease(bytes32 partition, uint256 /*lockId*/, address tokenHolder) internal {
        SnapshotsStorageWrapper._updateAccountSnapshot(tokenHolder, partition);
        SnapshotsStorageWrapper._updateAccountLockedBalancesSnapshot(tokenHolder, partition);
    }
}
