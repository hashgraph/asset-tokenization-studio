// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldInternals } from "../hold/HoldInternals.sol";
import { ILock } from "../../layer_1/interfaces/lock/ILock.sol";

abstract contract LockInternals is HoldInternals {
    function _lockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) internal virtual returns (bool success_, uint256 lockId_);
    function _releaseByPartition(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    ) internal virtual returns (bool success_);
    function _removeLabafLock(bytes32 _partition, address _tokenHolder, uint256 _lockId) internal virtual;
    function _setLockLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId,
        uint256 _labaf
    ) internal virtual;
    function _setTotalLockLabaf(address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal virtual;
    function _updateAccountLockedBalancesSnapshot(address account, bytes32 partition) internal virtual;
    function _updateLockAmountById(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder,
        uint256 _factor
    ) internal virtual;
    function _updateLockByIndex(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder,
        uint256 _abaf
    ) internal virtual;
    function _updateLockedBalancesBeforeLock(
        bytes32 _partition,
        uint256 /*_amount*/,
        address _tokenHolder,
        uint256 /*_expirationTimestamp*/
    ) internal virtual;
    function _updateLockedBalancesBeforeRelease(
        bytes32 _partition,
        uint256 /*_lockId*/,
        address _tokenHolder
    ) internal virtual;
    function _updateTotalLock(bytes32 _partition, address _tokenHolder) internal virtual returns (uint256 abaf_);
    function _updateTotalLockedAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal virtual;
    function _updateTotalLockedAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal virtual;
    function _getLock(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view virtual returns (ILock.LockData memory);
    function _getLockCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 lockCount_);
    function _getLockForByPartition(
        bytes32 partition,
        address tokenHolder,
        uint256 lockId
    ) internal view virtual returns (uint256 amount, uint256 expirationTimestamp);
    function _getLockForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId,
        uint256 _timestamp
    ) internal view virtual returns (uint256 amount_, uint256 expirationTimestamp_);
    function _getLockLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view virtual returns (uint256);
    function _getLockedAmountFor(address _tokenHolder) internal view virtual returns (uint256 amount_);
    function _getLockedAmountForAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view virtual returns (uint256 amount_);
    function _getLockedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256);
    function _getLockedAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual returns (uint256 amount_);
    function _getLocksIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (uint256[] memory locksId_);
    function _getTotalLockLabaf(address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getTotalLockLabafByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 labaf_);
    function _isLockIdValid(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view virtual returns (bool);
    function _isLockedExpirationTimestamp(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view virtual returns (bool);
}
