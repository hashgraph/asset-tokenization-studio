pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {LocalContext} from '../context/LocalContext.sol';
import {ILockStorageWrapper} from '../interfaces/lock/ILockStorageWrapper.sol';
import {_LOCK_STORAGE_POSITION} from '../constants/storagePositions.sol';
import {
    ERC1410BasicStorageWrapperRead
} from '../ERC1400/ERC1410/ERC1410BasicStorageWrapperRead.sol';
import {LibCommon} from '../common/LibCommon.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

abstract contract LockStorageWrapper is
    ILockStorageWrapper,
    LocalContext,
    ERC1410BasicStorageWrapperRead
{
    using LibCommon for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;

    struct LockData {
        uint256 id;
        uint256 amount;
        uint256 expirationTimestamp;
    }

    struct LockDataStorage {
        mapping(address => mapping(bytes32 => uint256)) lockedAmount;
        mapping(address => mapping(bytes32 => LockData[])) locks;
        mapping(address => mapping(bytes32 => EnumerableSet.UintSet)) lockIds;
        mapping(address => mapping(bytes32 => mapping(uint256 => uint256))) locksIndex;
        mapping(address => mapping(bytes32 => uint256)) lockNextId;
    }

    modifier onlyWithValidExpirationTimestamp(uint256 _expirationTimestamp) {
        if (_expirationTimestamp < _blockTimestamp())
            revert WrongExpirationTimestamp();
        _;
    }

    modifier onlyWithValidLockId(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) {
        if (!_isLockIdValid(_partition, _tokenHolder, _lockId))
            revert WrongLockId();
        _;
    }

    modifier onlyWithLockedExpirationTimestamp(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) {
        if (!_isLockedExpirationTimestamp(_partition, _tokenHolder, _lockId))
            revert LockExpirationNotReached();
        _;
    }

    function _lockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) internal virtual returns (bool success_, uint256 lockId_) {
        _reduceBalanceByPartition(_tokenHolder, _amount, _partition);

        LockDataStorage storage lockStorage = _lockStorage();

        lockId_ = ++lockStorage.lockNextId[_tokenHolder][_partition];

        LockData memory lock = LockData(lockId_, _amount, _expirationTimestamp);

        lockStorage.locks[_tokenHolder][_partition].push(lock);
        lockStorage.lockIds[_tokenHolder][_partition].add(lockId_);
        lockStorage.locksIndex[_tokenHolder][_partition][lockId_] = lockStorage
        .locks[_tokenHolder][_partition].length;
        lockStorage.lockedAmount[_tokenHolder][_partition] += _amount;

        success_ = true;
    }

    function _releaseByPartition(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    ) internal virtual returns (bool success_) {
        uint256 lockIndex = _getLockIndex(_partition, _tokenHolder, _lockId);

        LockData memory lock = _getLockByIndex(
            _partition,
            _tokenHolder,
            lockIndex
        );

        //_removeLock(_partition, _tokenHolder, _lockId);
        LockDataStorage storage lockStorage = _lockStorage();

        lockStorage.lockedAmount[_tokenHolder][_partition] -= lock.amount;
        lockStorage.locksIndex[_tokenHolder][_partition][lock.id] = 0;
        lockStorage.lockIds[_tokenHolder][_partition].remove(lock.id);

        uint256 lastIndex = _getLockCountForByPartition(
            _partition,
            _tokenHolder
        );

        if (lockIndex < lastIndex) {
            LockData memory lastLock = _getLockByIndex(
                _partition,
                _tokenHolder,
                lastIndex
            );
            _setLockAtIndex(_partition, _tokenHolder, lockIndex, lastLock);
        }

        lockStorage.locks[_tokenHolder][_partition].pop();

        _increaseBalanceByPartition(_tokenHolder, lock.amount, _partition);

        success_ = true;
    }

    function _setLockAtIndex(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockIndex,
        LockData memory lock
    ) private {
        LockDataStorage storage lockStorage = _lockStorage();

        lockStorage.locks[_tokenHolder][_partition][_lockIndex - 1].id = lock
            .id;
        lockStorage
        .locks[_tokenHolder][_partition][_lockIndex - 1].amount = lock.amount;
        lockStorage
        .locks[_tokenHolder][_partition][_lockIndex - 1]
            .expirationTimestamp = lock.expirationTimestamp;

        lockStorage.locksIndex[_tokenHolder][_partition][lock.id] = _lockIndex;
    }

    function _getLockedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 amount_) {
        return _lockStorage().lockedAmount[_tokenHolder][_partition];
    }

    function _getLockCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 lockCount_) {
        return _lockStorage().locks[_tokenHolder][_partition].length;
    }

    function _getLocksIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (uint256[] memory locksId_) {
        return
            _lockStorage().lockIds[_tokenHolder][_partition].getFromSet(
                _pageIndex,
                _pageLength
            );
    }

    function _getLockForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    )
        internal
        view
        virtual
        returns (uint256 amount_, uint256 expirationTimestamp_)
    {
        LockData memory lock = _getLock(_partition, _tokenHolder, _lockId);
        amount_ = lock.amount;
        expirationTimestamp_ = lock.expirationTimestamp;
    }

    function _isLockIdValid(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) private view returns (bool) {
        if (_getLockIndex(_partition, _tokenHolder, _lockId) == 0) return false;
        return true;
    }

    function _getLockIndex(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) private view returns (uint256) {
        return _lockStorage().locksIndex[_tokenHolder][_partition][_lockId];
    }

    function _getLock(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) private view returns (LockData memory) {
        uint256 lockIndex = _getLockIndex(_partition, _tokenHolder, _lockId);

        return _getLockByIndex(_partition, _tokenHolder, lockIndex);
    }

    function _getLockByIndex(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockIndex
    ) private view returns (LockData memory) {
        LockDataStorage storage lockStorage = _lockStorage();

        if (_lockIndex == 0) return LockData(0, 0, 0);

        _lockIndex--;

        assert(_lockIndex < lockStorage.locks[_tokenHolder][_partition].length);

        return lockStorage.locks[_tokenHolder][_partition][_lockIndex];
    }

    function _isLockedExpirationTimestamp(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) private view returns (bool) {
        LockData memory lock = _getLock(_partition, _tokenHolder, _lockId);

        if (lock.expirationTimestamp > block.timestamp) return false;

        return true;
    }

    function _lockStorage()
        internal
        pure
        virtual
        returns (LockDataStorage storage lock_)
    {
        bytes32 position = _LOCK_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            lock_.slot := position
        }
    }
}
