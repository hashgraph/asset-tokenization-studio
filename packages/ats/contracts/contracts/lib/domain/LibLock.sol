// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import { lockStorage, LockDataStorage } from "../../storage/AssetStorage.sol";
import { ILock } from "../../facets/features/interfaces/ILock.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { LibABAF } from "./LibABAF.sol";

/// @title LibLock
/// @notice Leaf library for lock management functionality
/// @dev Extracted from LockStorageWrapper for library-based diamond migration
library LibLock {
    using EnumerableSet for EnumerableSet.UintSet;

    error WrongLockId();
    error WrongExpirationTimestamp();
    error LockExpirationNotReached();

    // ═══════════════════════════════════════════════════════════════════════════════
    // LOCK CREATION & RELEASE
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Creates a lock on tokens held by a token holder for a specific partition
    /// @param _partition The partition to lock tokens from
    /// @param _amount The amount of tokens to lock
    /// @param _tokenHolder The address of the token holder
    /// @param _expirationTimestamp The timestamp when the lock expires
    /// @return lockId_ The ID of the newly created lock
    function createLockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) internal returns (uint256 lockId_) {
        LockDataStorage storage ls = lockStorage();

        lockId_ = ++ls.nextLockIdByAccountAndPartition[_tokenHolder][_partition];

        ILock.LockData memory lock = ILock.LockData(lockId_, _amount, _expirationTimestamp);

        ls.locksByAccountPartitionAndId[_tokenHolder][_partition][lockId_] = lock;
        ls.lockIdsByAccountAndPartition[_tokenHolder][_partition].add(lockId_);
        ls.totalLockedAmountByAccountAndPartition[_tokenHolder][_partition] += _amount;
        ls.totalLockedAmountByAccount[_tokenHolder] += _amount;
    }

    /// @notice Releases a lock by removing it from storage and returning the locked amount
    /// @param _partition The partition of the lock
    /// @param _lockId The ID of the lock to release
    /// @param _tokenHolder The address of the token holder
    /// @return amount_ The amount that was locked
    function releaseLockByPartition(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    ) internal returns (uint256 amount_) {
        LockDataStorage storage ls = lockStorage();

        ILock.LockData memory lock = ls.locksByAccountPartitionAndId[_tokenHolder][_partition][_lockId];
        amount_ = lock.amount;

        ls.totalLockedAmountByAccountAndPartition[_tokenHolder][_partition] -= amount_;
        ls.totalLockedAmountByAccount[_tokenHolder] -= amount_;
        ls.lockIdsByAccountAndPartition[_tokenHolder][_partition].remove(_lockId);

        delete ls.locksByAccountPartitionAndId[_tokenHolder][_partition][_lockId];
    }

    /// @notice Updates the lock amount for a specific lock
    /// @param _partition The partition of the lock
    /// @param _lockId The ID of the lock
    /// @param _tokenHolder The address of the token holder
    /// @param _newAmount The new amount to set
    function updateLockAmount(bytes32 _partition, uint256 _lockId, address _tokenHolder, uint256 _newAmount) internal {
        lockStorage().locksByAccountPartitionAndId[_tokenHolder][_partition][_lockId].amount = _newAmount;
    }

    /// @notice Sync lock LABAF with current ABAF
    /// @dev Replaces _updateTotalLock from LockStorageWrapper2
    function updateTotalLock(bytes32 _partition, address _tokenHolder) internal returns (uint256 abaf_) {
        abaf_ = LibABAF.getAbaf();
        uint256 labaf = LibABAF.getTotalLockLabaf(_tokenHolder);
        uint256 labafByPartition = LibABAF.getTotalLockLabafByPartition(_partition, _tokenHolder);

        if (abaf_ != labaf) {
            uint256 factor = LibABAF.calculateFactor(abaf_, labaf);
            lockStorage().totalLockedAmountByAccount[_tokenHolder] *= factor;
            LibABAF.setTotalLockLabaf(_tokenHolder, abaf_);
        }

        if (abaf_ != labafByPartition) {
            uint256 factorByPartition = LibABAF.calculateFactor(abaf_, labafByPartition);
            lockStorage().totalLockedAmountByAccountAndPartition[_tokenHolder][_partition] *= factorByPartition;
            LibABAF.setTotalLockLabafByPartition(_partition, _tokenHolder, abaf_);
        }
    }

    /// @notice Update a specific lock's amount by its ABAF factor
    /// @dev Replaces _updateLockByIndex from LockStorageWrapper2
    function updateLockByIndex(bytes32 _partition, uint256 _lockId, address _tokenHolder, uint256 _abaf) internal {
        uint256 lockLabaf = LibABAF.getLockLabafById(_partition, _tokenHolder, _lockId);
        if (_abaf != lockLabaf) {
            uint256 factorLock = LibABAF.calculateFactor(_abaf, lockLabaf);
            lockStorage().locksByAccountPartitionAndId[_tokenHolder][_partition][_lockId].amount *= factorLock;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // LOCK QUERIES (By Partition)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Gets the total amount of tokens locked for a token holder in a partition
    /// @param _partition The partition to query
    /// @param _tokenHolder The address of the token holder
    /// @return The total locked amount for the partition
    function getLockedAmountForByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return lockStorage().totalLockedAmountByAccountAndPartition[_tokenHolder][_partition];
    }

    /// @notice Gets the number of locks for a token holder in a partition
    /// @param _partition The partition to query
    /// @param _tokenHolder The address of the token holder
    /// @return lockCount_ The number of locks in the partition
    function getLockCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view returns (uint256 lockCount_) {
        return lockStorage().lockIdsByAccountAndPartition[_tokenHolder][_partition].length();
    }

    /// @notice Gets a paginated list of lock IDs for a token holder in a partition
    /// @param _partition The partition to query
    /// @param _tokenHolder The address of the token holder
    /// @param _pageIndex The index of the page to retrieve (0-based)
    /// @param _pageLength The length of the page
    /// @return locksId_ Array of lock IDs for the page
    function getLocksIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory locksId_) {
        EnumerableSet.UintSet storage lockIds = lockStorage().lockIdsByAccountAndPartition[_tokenHolder][_partition];
        return _paginate(lockIds, _pageIndex, _pageLength);
    }

    /// @notice Gets the lock details for a specific lock in a partition
    /// @param _partition The partition to query
    /// @param _tokenHolder The address of the token holder
    /// @param _lockId The ID of the lock
    /// @return amount_ The locked amount
    /// @return expirationTimestamp_ The expiration timestamp of the lock
    function getLockForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view returns (uint256 amount_, uint256 expirationTimestamp_) {
        ILock.LockData memory lock = lockStorage().locksByAccountPartitionAndId[_tokenHolder][_partition][_lockId];
        amount_ = lock.amount;
        expirationTimestamp_ = lock.expirationTimestamp;
    }

    /// @notice Gets a specific lock data structure
    /// @param _partition The partition to query
    /// @param _tokenHolder The address of the token holder
    /// @param _lockId The ID of the lock
    /// @return The lock data structure
    function getLock(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view returns (ILock.LockData memory) {
        return lockStorage().locksByAccountPartitionAndId[_tokenHolder][_partition][_lockId];
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // LOCK QUERIES (All Partitions)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Gets the total amount of tokens locked for a token holder (across all partitions)
    /// @param _tokenHolder The address of the token holder
    /// @return amount_ The total locked amount
    function getLockedAmountFor(address _tokenHolder) internal view returns (uint256 amount_) {
        return lockStorage().totalLockedAmountByAccount[_tokenHolder];
    }

    /// @notice Gets the total number of locks for a token holder (across all partitions)
    /// @param _tokenHolder The address of the token holder
    /// @return lockCount_ The total number of locks
    function getLockCountFor(address _tokenHolder) internal view returns (uint256 lockCount_) {
        return getLockCountForByPartition(_DEFAULT_PARTITION, _tokenHolder);
    }

    /// @notice Gets paginated list of lock IDs for a token holder (across all partitions)
    /// @param _tokenHolder The address of the token holder
    /// @param _pageIndex The index of the page to retrieve (0-based)
    /// @param _pageLength The length of the page
    /// @return locksId_ Array of lock IDs for the page
    function getLocksIdFor(
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory locksId_) {
        return getLocksIdForByPartition(_DEFAULT_PARTITION, _tokenHolder, _pageIndex, _pageLength);
    }

    /// @notice Gets lock details for a token holder (across all partitions)
    /// @param _tokenHolder The address of the token holder
    /// @param _lockId The ID of the lock
    /// @return amount_ The locked amount
    /// @return expirationTimestamp_ The expiration timestamp
    function getLockFor(
        address _tokenHolder,
        uint256 _lockId
    ) internal view returns (uint256 amount_, uint256 expirationTimestamp_) {
        return getLockForByPartition(_DEFAULT_PARTITION, _tokenHolder, _lockId);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // LOCK STATE VALIDATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Checks if a lock ID is valid for a token holder in a partition
    /// @param _partition The partition to check
    /// @param _tokenHolder The address of the token holder
    /// @param _lockId The ID of the lock
    /// @return True if the lock ID exists
    function isLockIdValid(bytes32 _partition, address _tokenHolder, uint256 _lockId) internal view returns (bool) {
        return lockStorage().lockIdsByAccountAndPartition[_tokenHolder][_partition].contains(_lockId);
    }

    /// @notice Checks if a lock has expired (expiration timestamp is in the past)
    /// @param _partition The partition to check
    /// @param _tokenHolder The address of the token holder
    /// @param _lockId The ID of the lock
    /// @return True if the lock has expired
    function isLockedExpirationTimestamp(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId,
        uint256 _currentTimestamp
    ) internal view returns (bool) {
        ILock.LockData memory lock = lockStorage().locksByAccountPartitionAndId[_tokenHolder][_partition][_lockId];
        return lock.expirationTimestamp <= _currentTimestamp;
    }

    /// @notice Checks if a token holder has any locked amount
    /// @param _tokenHolder The address of the token holder
    /// @return True if the token holder has locked tokens
    function hasLockedAmount(address _tokenHolder) internal view returns (bool) {
        return lockStorage().totalLockedAmountByAccount[_tokenHolder] > 0;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ABAF-ADJUSTED QUERIES
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get ABAF-adjusted locked amount by partition at a timestamp
    /// @dev Replaces _getLockedAmountForByPartitionAdjustedAt from LockStorageWrapper1
    function getLockedAmountByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256) {
        uint256 factor = LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(_timestamp),
            LibABAF.getTotalLockLabafByPartition(_partition, _tokenHolder)
        );
        return lockStorage().totalLockedAmountByAccountAndPartition[_tokenHolder][_partition] * factor;
    }

    /// @notice Get ABAF-adjusted locked amount across all partitions at a timestamp
    /// @dev Replaces _getLockedAmountForAdjustedAt from LockStorageWrapper1
    function getLockedAmountAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view returns (uint256) {
        uint256 factor = LibABAF.calculateFactorForLockedAmountAdjustedAt(_tokenHolder, _timestamp);
        return lockStorage().totalLockedAmountByAccount[_tokenHolder] * factor;
    }

    /// @notice Get ABAF-adjusted lock details for a specific lock
    /// @dev Replaces _getLockForByPartitionAdjustedAt from LockStorageWrapper1
    function getLockForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId,
        uint256 _timestamp
    ) internal view returns (uint256 amount_, uint256 expirationTimestamp_) {
        ILock.LockData memory lock = lockStorage().locksByAccountPartitionAndId[_tokenHolder][_partition][_lockId];
        uint256 factor = LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(_timestamp),
            LibABAF.getLockLabafById(_partition, _tokenHolder, _lockId)
        );
        amount_ = lock.amount * factor;
        expirationTimestamp_ = lock.expirationTimestamp;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Paginates through an EnumerableSet of lock IDs
    /// @param lockIds The set of lock IDs
    /// @param _pageIndex The page index (0-based)
    /// @param _pageLength The length of the page
    /// @return Array of lock IDs for the requested page
    function _paginate(
        EnumerableSet.UintSet storage lockIds,
        uint256 _pageIndex,
        uint256 _pageLength
    ) private view returns (uint256[] memory) {
        uint256 totalLength = lockIds.length();
        uint256 startIndex = _pageIndex * _pageLength;

        if (startIndex >= totalLength) {
            return new uint256[](0);
        }

        uint256 endIndex = startIndex + _pageLength;
        if (endIndex > totalLength) {
            endIndex = totalLength;
        }

        uint256[] memory result = new uint256[](endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = lockIds.at(i);
        }

        return result;
    }
}
