// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION } from "../../../constants/values.sol";
import { _LOCKER_ROLE } from "../../../constants/roles.sol";
import { ILock } from "./ILock.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { LockStorageWrapper } from "../../../domain/asset/LockStorageWrapper.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract Lock is ILock, TimestampProvider {
    function lockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) external override returns (bool success_, uint256 lockId_) {
        PauseStorageWrapper._requireNotPaused();
        ERC3643StorageWrapper._requireUnrecoveredAddress(_tokenHolder);
        AccessControlStorageWrapper._checkRole(_LOCKER_ROLE, msg.sender);
        ERC1410StorageWrapper._requireDefaultPartitionWithSinglePartition(_partition);
        LockStorageWrapper._requireValidExpirationTimestamp(_expirationTimestamp);
        (success_, lockId_) = LockStorageWrapper._lockByPartition(
            _partition,
            _amount,
            _tokenHolder,
            _expirationTimestamp,
            msg.sender
        );
        emit LockedByPartition(msg.sender, _tokenHolder, _partition, lockId_, _amount, _expirationTimestamp);
    }

    function releaseByPartition(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    ) external override returns (bool success_) {
        PauseStorageWrapper._requireNotPaused();
        ERC1410StorageWrapper._requireDefaultPartitionWithSinglePartition(_partition);
        LockStorageWrapper._requireValidLockId(_partition, _tokenHolder, _lockId);
        LockStorageWrapper._requireLockedExpirationTimestamp(_partition, _tokenHolder, _lockId);
        success_ = LockStorageWrapper._releaseByPartition(_partition, _lockId, _tokenHolder, msg.sender);
        emit LockByPartitionReleased(msg.sender, _tokenHolder, _partition, _lockId);
    }

    function lock(
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) external override returns (bool success_, uint256 lockId_) {
        PauseStorageWrapper._requireNotPaused();
        ERC3643StorageWrapper._requireUnrecoveredAddress(_tokenHolder);
        AccessControlStorageWrapper._checkRole(_LOCKER_ROLE, msg.sender);
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        LockStorageWrapper._requireValidExpirationTimestamp(_expirationTimestamp);
        (success_, lockId_) = LockStorageWrapper._lockByPartition(
            _DEFAULT_PARTITION,
            _amount,
            _tokenHolder,
            _expirationTimestamp,
            msg.sender
        );
        emit LockedByPartition(msg.sender, _tokenHolder, _DEFAULT_PARTITION, lockId_, _amount, _expirationTimestamp);
    }

    function release(uint256 _lockId, address _tokenHolder) external override returns (bool success_) {
        PauseStorageWrapper._requireNotPaused();
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        LockStorageWrapper._requireValidLockId(_DEFAULT_PARTITION, _tokenHolder, _lockId);
        LockStorageWrapper._requireLockedExpirationTimestamp(_DEFAULT_PARTITION, _tokenHolder, _lockId);
        success_ = LockStorageWrapper._releaseByPartition(_DEFAULT_PARTITION, _lockId, _tokenHolder, msg.sender);
        emit LockByPartitionReleased(msg.sender, _tokenHolder, _DEFAULT_PARTITION, _lockId);
    }

    function getLockedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 amount_) {
        return
            LockStorageWrapper._getLockedAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _getBlockTimestamp());
    }

    function getLockCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 lockCount_) {
        return LockStorageWrapper._getLockCountForByPartition(_partition, _tokenHolder);
    }

    function getLocksIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory locksId_) {
        return LockStorageWrapper._getLocksIdForByPartition(_partition, _tokenHolder, _pageIndex, _pageLength);
    }

    function getLockForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) external view override returns (uint256 amount_, uint256 expirationTimestamp_) {
        return
            LockStorageWrapper._getLockForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _lockId,
                _getBlockTimestamp()
            );
    }

    function getLockedAmountFor(address _tokenHolder) external view override returns (uint256 amount_) {
        return
            LockStorageWrapper._getLockedAmountForByPartitionAdjustedAt(
                _DEFAULT_PARTITION,
                _tokenHolder,
                _getBlockTimestamp()
            );
    }

    function getLockCountFor(address _tokenHolder) external view override returns (uint256 lockCount_) {
        return LockStorageWrapper._getLockCountForByPartition(_DEFAULT_PARTITION, _tokenHolder);
    }

    function getLocksIdFor(
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory locksId_) {
        return LockStorageWrapper._getLocksIdForByPartition(_DEFAULT_PARTITION, _tokenHolder, _pageIndex, _pageLength);
    }

    function getLockFor(
        address _tokenHolder,
        uint256 _lockId
    ) external view override returns (uint256 amount_, uint256 expirationTimestamp_) {
        return
            LockStorageWrapper._getLockForByPartitionAdjustedAt(
                _DEFAULT_PARTITION,
                _tokenHolder,
                _lockId,
                _getBlockTimestamp()
            );
    }
}
