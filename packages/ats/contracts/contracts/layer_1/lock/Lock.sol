// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION } from "../../layer_0/constants/values.sol";
import { _LOCKER_ROLE } from "../constants/roles.sol";
import { ILock } from "../interfaces/lock/ILock.sol";
import { Common } from "../../layer_0/common/Common.sol";

abstract contract Lock is ILock, Common {
    // Functions
    function lockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    )
        external
        override
        onlyUnpaused
        onlyUnrecoveredAddress(_tokenHolder)
        onlyRole(_LOCKER_ROLE)
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyWithValidExpirationTimestamp(_expirationTimestamp)
        returns (bool success_, uint256 lockId_)
    {
        (success_, lockId_) = _lockByPartition(_partition, _amount, _tokenHolder, _expirationTimestamp);
        emit LockedByPartition(_msgSender(), _tokenHolder, _partition, lockId_, _amount, _expirationTimestamp);
    }

    function releaseByPartition(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyWithValidLockId(_partition, _tokenHolder, _lockId)
        onlyWithLockedExpirationTimestamp(_partition, _tokenHolder, _lockId)
        returns (bool success_)
    {
        success_ = _releaseByPartition(_partition, _lockId, _tokenHolder);
        emit LockByPartitionReleased(_msgSender(), _tokenHolder, _partition, _lockId);
    }

    // Uses default parititon in case Multipartition is not activated
    function lock(
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    )
        external
        override
        onlyUnpaused
        onlyUnrecoveredAddress(_tokenHolder)
        onlyRole(_LOCKER_ROLE)
        onlyWithoutMultiPartition
        onlyWithValidExpirationTimestamp(_expirationTimestamp)
        returns (bool success_, uint256 lockId_)
    {
        (success_, lockId_) = _lockByPartition(_DEFAULT_PARTITION, _amount, _tokenHolder, _expirationTimestamp);
        emit LockedByPartition(_msgSender(), _tokenHolder, _DEFAULT_PARTITION, lockId_, _amount, _expirationTimestamp);
    }

    function release(
        uint256 _lockId,
        address _tokenHolder
    )
        external
        override
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyWithValidLockId(_DEFAULT_PARTITION, _tokenHolder, _lockId)
        onlyWithLockedExpirationTimestamp(_DEFAULT_PARTITION, _tokenHolder, _lockId)
        returns (bool success_)
    {
        success_ = _releaseByPartition(_DEFAULT_PARTITION, _lockId, _tokenHolder);
        emit LockByPartitionReleased(_msgSender(), _tokenHolder, _DEFAULT_PARTITION, _lockId);
    }

    function getLockedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 amount_) {
        return _getLockedAmountForByPartitionAdjusted(_partition, _tokenHolder);
    }

    function getLockCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 lockCount_) {
        return _getLockCountForByPartition(_partition, _tokenHolder);
    }

    function getLocksIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory locksId_) {
        return _getLocksIdForByPartition(_partition, _tokenHolder, _pageIndex, _pageLength);
    }

    function getLockForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) external view override returns (uint256 amount_, uint256 expirationTimestamp_) {
        return _getLockForByPartitionAdjusted(_partition, _tokenHolder, _lockId);
    }

    function getLockedAmountFor(address _tokenHolder) external view override returns (uint256 amount_) {
        return _getLockedAmountForByPartitionAdjusted(_DEFAULT_PARTITION, _tokenHolder);
    }

    function getLockCountFor(address _tokenHolder) external view override returns (uint256 lockCount_) {
        return _getLockCountForByPartition(_DEFAULT_PARTITION, _tokenHolder);
    }

    function getLocksIdFor(
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory locksId_) {
        return _getLocksIdForByPartition(_DEFAULT_PARTITION, _tokenHolder, _pageIndex, _pageLength);
    }

    function getLockFor(
        address _tokenHolder,
        uint256 _lockId
    ) external view override returns (uint256 amount_, uint256 expirationTimestamp_) {
        return _getLockForByPartitionAdjusted(_DEFAULT_PARTITION, _tokenHolder, _lockId);
    }
}
