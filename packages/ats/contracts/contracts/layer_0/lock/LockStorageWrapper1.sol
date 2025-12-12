// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LibCommon } from "../common/libraries/LibCommon.sol";
import { _LOCK_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { CapStorageWrapper1 } from "../cap/CapStorageWrapper1.sol";
import { ILock } from "../../layer_1/interfaces/lock/ILock.sol";

abstract contract LockStorageWrapper1 is CapStorageWrapper1 {
    using LibCommon for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;

    struct LockDataStorage {
        mapping(address => uint256) totalLockedAmountByAccount;
        mapping(address => mapping(bytes32 => uint256)) totalLockedAmountByAccountAndPartition;
        mapping(address => mapping(bytes32 => mapping(uint256 => ILock.LockData))) locksByAccountPartitionAndId;
        mapping(address => mapping(bytes32 => EnumerableSet.UintSet)) lockIdsByAccountAndPartition;
        mapping(address => mapping(bytes32 => uint256)) nextLockIdByAccountAndPartition;
    }

    error WrongLockId();
    error WrongExpirationTimestamp();
    error LockExpirationNotReached();

    modifier onlyWithValidExpirationTimestamp(uint256 _expirationTimestamp) override {
        _checkExpirationTimestamp(_expirationTimestamp);
        _;
    }

    modifier onlyWithValidLockId(bytes32 _partition, address _tokenHolder, uint256 _lockId) {
        _checkValidLockId(_partition, _tokenHolder, _lockId);
        _;
    }

    modifier onlyWithLockedExpirationTimestamp(bytes32 _partition, address _tokenHolder, uint256 _lockId) {
        _checkLockedExpirationTimestamp(_partition, _tokenHolder, _lockId);
        _;
    }

    function _getLockedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view override returns (uint256) {
        return _lockStorage().totalLockedAmountByAccountAndPartition[_tokenHolder][_partition];
    }

    function _getLockCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view override returns (uint256 lockCount_) {
        return _lockStorage().lockIdsByAccountAndPartition[_tokenHolder][_partition].length();
    }

    function _getLocksIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (uint256[] memory locksId_) {
        return
            _lockStorage().lockIdsByAccountAndPartition[_tokenHolder][_partition].getFromSet(_pageIndex, _pageLength);
    }

    function _getLockForByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 lockId
    ) internal view override returns (uint256 amount, uint256 expirationTimestamp) {
        ILock.LockData memory lock = _getLock(partition, tokenHolder, lockId);
        amount = lock.amount;
        expirationTimestamp = lock.expirationTimestamp;
    }

    function _getLockForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view override returns (uint256 amount_, uint256 expirationTimestamp_) {
        uint256 factor = _calculateFactor(_getAbafAdjusted(), _getLockLabafById(_partition, _tokenHolder, _lockId));

        (amount_, expirationTimestamp_) = _getLockForByPartition(_partition, _tokenHolder, _lockId);
        amount_ *= factor;
    }

    function _getLockedAmountFor(address _tokenHolder) internal view override returns (uint256 amount_) {
        return _lockStorage().totalLockedAmountByAccount[_tokenHolder];
    }

    //note: previous was _getLockedAmountForAdjusted
    function _getLockedAmountForAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view override returns (uint256 amount_) {
        uint256 factor = _calculateFactorForLockedAmountByTokenHolderAdjustedAt(tokenHolder, timestamp);
        return _getLockedAmountFor(tokenHolder) * factor;
    }

    function _getTotalBalanceForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual override returns (uint256) {
        return _getLockedAmountForByPartitionAdjusted(_partition, _tokenHolder);
    }

    function _getTotalBalanceForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual override returns (uint256) {
        return
            super._getTotalBalanceForAdjustedAt(_tokenHolder, _timestamp) +
            _getLockedAmountForAdjustedAt(_tokenHolder, _timestamp);
    }

    function _getTotalBalance(address _tokenHolder) internal view virtual override returns (uint256) {
        return super._getTotalBalance(_tokenHolder) + _getLockedAmountForAdjustedAt(_tokenHolder, _blockTimestamp());
    }

    function _getLockedAmountForByPartitionAdjusted(
        bytes32 _partition,
        address _tokenHolder
    ) internal view override returns (uint256 amount_) {
        uint256 factor = _calculateFactor(_getAbafAdjusted(), _getTotalLockLabafByPartition(_partition, _tokenHolder));
        return _getLockedAmountForByPartition(_partition, _tokenHolder) * factor;
    }

    function _getLock(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view override returns (ILock.LockData memory) {
        return _lockStorage().locksByAccountPartitionAndId[_tokenHolder][_partition][_lockId];
    }

    function _getLockByIndex(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockIndex
    ) internal view override returns (ILock.LockData memory) {
        LockDataStorage storage lockStorage = _lockStorage();

        if (_lockIndex == 0) return ILock.LockData(0, 0, 0);

        _lockIndex--;

        assert(_lockIndex < lockStorage.lockIdsByAccountAndPartition[_tokenHolder][_partition].length());

        uint256 lockId = lockStorage.lockIdsByAccountAndPartition[_tokenHolder][_partition].at(_lockIndex);

        return lockStorage.locksByAccountPartitionAndId[_tokenHolder][_partition][lockId];
    }

    function _isLockedExpirationTimestamp(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view override returns (bool) {
        ILock.LockData memory lock = _getLock(_partition, _tokenHolder, _lockId);

        if (lock.expirationTimestamp > _blockTimestamp()) return false;

        return true;
    }

    function _isLockIdValid(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view override returns (bool) {
        return _lockStorage().lockIdsByAccountAndPartition[_tokenHolder][_partition].contains(_lockId);
    }

    function _checkExpirationTimestamp(uint256 _expirationTimestamp) internal view override {
        if (_expirationTimestamp < _blockTimestamp()) revert WrongExpirationTimestamp();
    }

    function _lockStorage() internal pure returns (LockDataStorage storage lock_) {
        bytes32 position = _LOCK_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            lock_.slot := position
        }
    }

    function _checkValidLockId(bytes32 _partition, address _tokenHolder, uint256 _lockId) private view {
        if (!_isLockIdValid(_partition, _tokenHolder, _lockId)) revert WrongLockId();
    }

    function _checkLockedExpirationTimestamp(bytes32 _partition, address _tokenHolder, uint256 _lockId) private view {
        if (!_isLockedExpirationTimestamp(_partition, _tokenHolder, _lockId)) revert LockExpirationNotReached();
    }
}
