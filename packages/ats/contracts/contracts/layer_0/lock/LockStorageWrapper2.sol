// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {
    CorporateActionsStorageWrapper2
} from '../corporateActions/CorporateActionsStorageWrapper2.sol';

abstract contract LockStorageWrapper2 is CorporateActionsStorageWrapper2 {
    using EnumerableSet for EnumerableSet.UintSet;

    function _lockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) internal returns (bool success_, uint256 lockId_) {
        _triggerAndSyncAll(_partition, _tokenHolder, address(0));

        uint256 abaf = _updateTotalLock(_partition, _tokenHolder);

        _updateLockedBalancesBeforeLock(
            _partition,
            _amount,
            _tokenHolder,
            _expirationTimestamp
        );
        _reduceBalanceByPartition(_tokenHolder, _amount, _partition);

        LockDataStorage storage lockStorage = _lockStorage();

        lockId_ = ++lockStorage.nextLockIdByAccountAndPartition[_tokenHolder][
            _partition
        ];

        LockData memory lock = LockData(lockId_, _amount, _expirationTimestamp);
        _setLockLabafById(_partition, _tokenHolder, lockId_, abaf);

        lockStorage.locksByAccountPartitionAndId[_tokenHolder][_partition][
            lockId_
        ] = lock;
        lockStorage.lockIdsByAccountAndPartition[_tokenHolder][_partition].add(
            lockId_
        );
        lockStorage.totalLockedAmountByAccountAndPartition[_tokenHolder][
            _partition
        ] += _amount;
        lockStorage.totalLockedAmountByAccount[_tokenHolder] += _amount;

        success_ = true;
    }

    function _releaseByPartition(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    ) internal returns (bool success_) {
        _triggerAndSyncAll(_partition, address(0), _tokenHolder);

        uint256 abaf = _updateTotalLock(_partition, _tokenHolder);

        _updateLockByIndex(_partition, _lockId, _tokenHolder, abaf);

        _updateLockedBalancesBeforeRelease(_partition, _lockId, _tokenHolder);

        uint256 lockAmount = _getLock(_partition, _tokenHolder, _lockId).amount;

        LockDataStorage storage lockStorage = _lockStorage();
        lockStorage.totalLockedAmountByAccountAndPartition[_tokenHolder][
            _partition
        ] -= lockAmount;
        lockStorage.totalLockedAmountByAccount[_tokenHolder] -= lockAmount;
        lockStorage
        .lockIdsByAccountAndPartition[_tokenHolder][_partition].remove(_lockId);

        delete lockStorage.locksByAccountPartitionAndId[_tokenHolder][
            _partition
        ][_lockId];
        _removeLabafLock(_partition, _tokenHolder, _lockId);

        if (!_validPartitionForReceiver(_partition, _tokenHolder)) {
            _addPartitionTo(lockAmount, _tokenHolder, _partition);
        } else {
            _increaseBalanceByPartition(_tokenHolder, lockAmount, _partition);
        }

        success_ = true;
        _removeLabafLock(_partition, _tokenHolder, _lockId);
    }

    function _updateTotalLock(
        bytes32 _partition,
        address _tokenHolder
    ) internal returns (uint256 abaf_) {
        abaf_ = _getAbaf();

        uint256 labaf = _getTotalLockLabaf(_tokenHolder);
        uint256 labafByPartition = _getTotalLockLabafByPartition(
            _partition,
            _tokenHolder
        );

        if (abaf_ != labaf) {
            uint256 factor = _calculateFactor(abaf_, labaf);

            _updateTotalLockedAmountAndLabaf(_tokenHolder, factor, abaf_);
        }

        if (abaf_ != labafByPartition) {
            uint256 factorByPartition = _calculateFactor(
                abaf_,
                labafByPartition
            );

            _updateTotalLockedAmountAndLabafByPartition(
                _partition,
                _tokenHolder,
                factorByPartition,
                abaf_
            );
        }
    }

    /**
     * @dev Updates the lock by its index for the specified partition and token holder.
     * LABAF (Locked Amount Before Adjustment Factor) for each lock is not updated
     * because the lock is deleted right after, optimizing gas usage.
     */
    function _updateLockByIndex(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder,
        uint256 _abaf
    ) internal {
        uint256 lockLabaf = _getLockLabafById(
            _partition,
            _tokenHolder,
            _lockId
        );

        if (_abaf != lockLabaf) {
            uint256 factorLock = _calculateFactor(_abaf, lockLabaf);

            _updateLockAmountById(
                _partition,
                _lockId,
                _tokenHolder,
                factorLock
            );
        }
    }

    function _updateLockAmountById(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder,
        uint256 _factor
    ) internal {
        if (_factor == 1) return;
        _lockStorage()
        .locksByAccountPartitionAndId[_tokenHolder][_partition][_lockId]
            .amount *= _factor;
    }

    function _updateTotalLockedAmountAndLabaf(
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal {
        if (_factor == 1) return;
        LockDataStorage storage lockStorage = _lockStorage();

        lockStorage.totalLockedAmountByAccount[_tokenHolder] *= _factor;
        _setTotalLockLabaf(_tokenHolder, _abaf);
    }

    function _updateTotalLockedAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal {
        if (_factor == 1) return;
        LockDataStorage storage lockStorage = _lockStorage();

        lockStorage.totalLockedAmountByAccountAndPartition[_tokenHolder][
            _partition
        ] *= _factor;
        _setTotalLockLabafByPartition(_partition, _tokenHolder, _abaf);
    }

    function _updateLockedBalancesBeforeLock(
        bytes32 _partition,
        uint256 /*_amount*/,
        address _tokenHolder,
        uint256 /*_expirationTimestamp*/
    ) internal {
        _updateAccountLockedBalancesSnapshot(_tokenHolder, _partition);
    }

    function _updateLockedBalancesBeforeRelease(
        bytes32 _partition,
        uint256 /*_lockId*/,
        address _tokenHolder
    ) internal {
        _updateAccountLockedBalancesSnapshot(_tokenHolder, _partition);
    }
}
