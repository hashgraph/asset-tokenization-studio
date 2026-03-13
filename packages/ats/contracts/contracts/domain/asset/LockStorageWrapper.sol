// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _LOCK_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ILock } from "../../facets/layer_1/lock/ILock.sol";
import { IERC20StorageWrapper } from "./ERC1400/ERC20/IERC20StorageWrapper.sol";
import { IERC1410StorageWrapper } from "./ERC1400/ERC1410/IERC1410StorageWrapper.sol";
// Forward references to other Phase 4 libraries
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

    function lockStorage() internal pure returns (LockDataStorage storage lock_) {
        bytes32 position = _LOCK_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            lock_.slot := position
        }
    }

    // --- Guard functions ---

    // solhint-disable-next-line ordering
    function requireValidExpirationTimestamp(uint256 expirationTimestamp) internal view {
        if (expirationTimestamp < block.timestamp) revert WrongExpirationTimestamp();
    }

    function requireValidLockId(bytes32 partition, address tokenHolder, uint256 lockId) internal view {
        if (!isLockIdValid(partition, tokenHolder, lockId)) revert WrongLockId();
    }

    function requireLockedExpirationTimestamp(bytes32 partition, address tokenHolder, uint256 lockId) internal view {
        if (!isLockedExpirationTimestamp(partition, tokenHolder, lockId)) revert LockExpirationNotReached();
    }

    // --- Query functions ---

    // solhint-disable-next-line ordering
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
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper.getLockLabafById(partition, tokenHolder, lockId)
        );

        (amount_, expirationTimestamp_) = getLockForByPartition(partition, tokenHolder, lockId);
        amount_ *= factor;
    }

    function getLockedAmountFor(address tokenHolder) internal view returns (uint256 amount_) {
        return lockStorage().totalLockedAmountByAccount[tokenHolder];
    }

    function getLockedAmountForAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 amount_) {
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper.getTotalLockLabaf(tokenHolder)
        );
        return getLockedAmountFor(tokenHolder) * factor;
    }

    function getLockedAmountForByPartitionAdjustedAt(
        bytes32 partition,
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 amount_) {
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
            AdjustBalancesStorageWrapper.getTotalLockLabafByPartition(partition, tokenHolder)
        );
        return getLockedAmountForByPartition(partition, tokenHolder) * factor;
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
        ILock.LockData memory lock = getLock(partition, tokenHolder, lockId);

        if (lock.expirationTimestamp > block.timestamp) return false;

        return true;
    }

    function isLockIdValid(bytes32 partition, address tokenHolder, uint256 lockId) internal view returns (bool) {
        return lockStorage().lockIdsByAccountAndPartition[tokenHolder][partition].contains(lockId);
    }

    // --- Lock operation functions ---

    function lockByPartition(
        bytes32 partition,
        uint256 amount,
        address tokenHolder,
        uint256 expirationTimestamp,
        address operator
    ) internal returns (bool success_, uint256 lockId_) {
        ERC1410StorageWrapper.triggerAndSyncAll(partition, tokenHolder, address(0));

        uint256 abaf = updateTotalLock(partition, tokenHolder);

        updateLockedBalancesBeforeLock(partition, amount, tokenHolder, expirationTimestamp);
        ERC1410StorageWrapper.reduceBalanceByPartition(tokenHolder, amount, partition);

        LockDataStorage storage lockStorageRef = lockStorage();

        lockId_ = ++lockStorageRef.nextLockIdByAccountAndPartition[tokenHolder][partition];

        ILock.LockData memory lock = ILock.LockData(lockId_, amount, expirationTimestamp);
        AdjustBalancesStorageWrapper.setLockLabafById(partition, tokenHolder, lockId_, abaf);

        lockStorageRef.locksByAccountPartitionAndId[tokenHolder][partition][lockId_] = lock;
        lockStorageRef.lockIdsByAccountAndPartition[tokenHolder][partition].add(lockId_);
        lockStorageRef.totalLockedAmountByAccountAndPartition[tokenHolder][partition] += amount;
        lockStorageRef.totalLockedAmountByAccount[tokenHolder] += amount;

        emit IERC1410StorageWrapper.TransferByPartition(partition, operator, tokenHolder, address(0), amount, "", "");
        emit IERC20StorageWrapper.Transfer(tokenHolder, address(0), amount);

        success_ = true;
    }

    function releaseByPartition(
        bytes32 partition,
        uint256 lockId,
        address tokenHolder,
        address operator
    ) internal returns (bool success_) {
        ERC1410StorageWrapper.triggerAndSyncAll(partition, address(0), tokenHolder);

        uint256 abaf = updateTotalLock(partition, tokenHolder);

        updateLockByIndex(partition, lockId, tokenHolder, abaf);

        updateLockedBalancesBeforeRelease(partition, lockId, tokenHolder);

        uint256 lockAmount = getLock(partition, tokenHolder, lockId).amount;

        LockDataStorage storage lockStorageRef = lockStorage();
        lockStorageRef.totalLockedAmountByAccountAndPartition[tokenHolder][partition] -= lockAmount;
        lockStorageRef.totalLockedAmountByAccount[tokenHolder] -= lockAmount;
        lockStorageRef.lockIdsByAccountAndPartition[tokenHolder][partition].remove(lockId);

        delete lockStorageRef.locksByAccountPartitionAndId[tokenHolder][partition][lockId];
        AdjustBalancesStorageWrapper.removeLabafLock(partition, tokenHolder, lockId);

        if (!ERC1410StorageWrapper.validPartitionForReceiver(partition, tokenHolder)) {
            ERC1410StorageWrapper.addPartitionTo(lockAmount, tokenHolder, partition);
        } else {
            ERC1410StorageWrapper.increaseBalanceByPartition(tokenHolder, lockAmount, partition);
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

    function updateTotalLock(bytes32 partition, address tokenHolder) internal returns (uint256 abaf_) {
        abaf_ = AdjustBalancesStorageWrapper.getAbaf();

        uint256 labaf = AdjustBalancesStorageWrapper.getTotalLockLabaf(tokenHolder);
        uint256 labafByPartition = AdjustBalancesStorageWrapper.getTotalLockLabafByPartition(partition, tokenHolder);

        if (abaf_ != labaf) {
            uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(abaf_, labaf);

            updateTotalLockedAmountAndLabaf(tokenHolder, factor, abaf_);
        }

        if (abaf_ != labafByPartition) {
            uint256 factorByPartition = AdjustBalancesStorageWrapper.calculateFactor(abaf_, labafByPartition);

            updateTotalLockedAmountAndLabafByPartition(partition, tokenHolder, factorByPartition, abaf_);
        }
    }

    /**
     * @dev Updates the lock by its index for the specified partition and token holder.
     * LABAF (Locked Amount Before Adjustment Factor) for each lock is not updated
     * because the lock is deleted right after, optimizing gas usage.
     */
    function updateLockByIndex(bytes32 partition, uint256 lockId, address tokenHolder, uint256 abaf) internal {
        uint256 lockLabaf = AdjustBalancesStorageWrapper.getLockLabafById(partition, tokenHolder, lockId);

        if (abaf != lockLabaf) {
            uint256 factorLock = AdjustBalancesStorageWrapper.calculateFactor(abaf, lockLabaf);

            updateLockAmountById(partition, lockId, tokenHolder, factorLock);
        }
    }

    function updateLockAmountById(bytes32 partition, uint256 lockId, address tokenHolder, uint256 factor) internal {
        lockStorage().locksByAccountPartitionAndId[tokenHolder][partition][lockId].amount *= factor;
    }

    function updateTotalLockedAmountAndLabaf(address tokenHolder, uint256 factor, uint256 abaf) internal {
        LockDataStorage storage lockStorageRef = lockStorage();

        lockStorageRef.totalLockedAmountByAccount[tokenHolder] *= factor;
        AdjustBalancesStorageWrapper.setTotalLockLabaf(tokenHolder, abaf);
    }

    function updateTotalLockedAmountAndLabafByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 factor,
        uint256 abaf
    ) internal {
        LockDataStorage storage lockStorageRef = lockStorage();

        lockStorageRef.totalLockedAmountByAccountAndPartition[tokenHolder][partition] *= factor;
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
}
