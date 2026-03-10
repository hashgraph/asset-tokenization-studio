// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILock } from "../lock/ILock.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { ComplianceStorageWrapper } from "../../../domain/core/ComplianceStorageWrapper.sol";
import { LockStorageWrapper } from "../../../domain/asset/LockStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ABAFStorageWrapper } from "../../../domain/asset/ABAFStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../../../domain/asset/SnapshotsStorageWrapper.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";
import { _LOCKER_ROLE } from "../../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../../constants/values.sol";

abstract contract Lock is ILock, TimestampProvider {
    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL STATE-CHANGING FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function lockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) external override returns (bool success_, uint256 lockId_) {
        PauseStorageWrapper.requireNotPaused();
        ComplianceStorageWrapper.requireNotRecovered(_tokenHolder);
        AccessStorageWrapper.checkRole(_LOCKER_ROLE);
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_partition);
        if (_expirationTimestamp < _getBlockTimestamp()) {
            revert LockStorageWrapper.WrongExpirationTimestamp();
        }

        (success_, lockId_) = _lockByPartitionHelper(_partition, _amount, _tokenHolder, _expirationTimestamp);
        emit LockedByPartition(msg.sender, _tokenHolder, _partition, lockId_, _amount, _expirationTimestamp);
    }

    function releaseByPartition(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    ) external override returns (bool success_) {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_partition);
        if (!LockStorageWrapper.isLockIdValid(_partition, _tokenHolder, _lockId)) {
            revert LockStorageWrapper.WrongLockId();
        }
        if (!LockStorageWrapper.isLockedExpirationTimestamp(_partition, _tokenHolder, _lockId, _getBlockTimestamp())) {
            revert LockStorageWrapper.LockExpirationNotReached();
        }

        success_ = _releaseByPartitionHelper(_partition, _lockId, _tokenHolder);
        emit LockByPartitionReleased(msg.sender, _tokenHolder, _partition, _lockId);
    }

    function lock(
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) external override returns (bool success_, uint256 lockId_) {
        PauseStorageWrapper.requireNotPaused();
        ComplianceStorageWrapper.requireNotRecovered(_tokenHolder);
        AccessStorageWrapper.checkRole(_LOCKER_ROLE);
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        if (_expirationTimestamp < _getBlockTimestamp()) {
            revert LockStorageWrapper.WrongExpirationTimestamp();
        }

        (success_, lockId_) = _lockByPartitionHelper(_DEFAULT_PARTITION, _amount, _tokenHolder, _expirationTimestamp);
        emit LockedByPartition(msg.sender, _tokenHolder, _DEFAULT_PARTITION, lockId_, _amount, _expirationTimestamp);
    }

    function release(uint256 _lockId, address _tokenHolder) external override returns (bool success_) {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkWithoutMultiPartition();
        if (!LockStorageWrapper.isLockIdValid(_DEFAULT_PARTITION, _tokenHolder, _lockId)) {
            revert LockStorageWrapper.WrongLockId();
        }
        if (
            !LockStorageWrapper.isLockedExpirationTimestamp(
                _DEFAULT_PARTITION,
                _tokenHolder,
                _lockId,
                _getBlockTimestamp()
            )
        ) {
            revert LockStorageWrapper.LockExpirationNotReached();
        }

        success_ = _releaseByPartitionHelper(_DEFAULT_PARTITION, _lockId, _tokenHolder);
        emit LockByPartitionReleased(msg.sender, _tokenHolder, _DEFAULT_PARTITION, _lockId);
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function getLockedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 amount_) {
        return LockStorageWrapper.getLockedAmountByPartitionAdjustedAt(_partition, _tokenHolder, _getBlockTimestamp());
    }

    function getLockCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 lockCount_) {
        return LockStorageWrapper.getLockCountForByPartition(_partition, _tokenHolder);
    }

    function getLocksIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory locksId_) {
        return LockStorageWrapper.getLocksIdForByPartition(_partition, _tokenHolder, _pageIndex, _pageLength);
    }

    function getLockForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) external view override returns (uint256 amount_, uint256 expirationTimestamp_) {
        return
            LockStorageWrapper.getLockForByPartitionAdjustedAt(_partition, _tokenHolder, _lockId, _getBlockTimestamp());
    }

    function getLockedAmountFor(address _tokenHolder) external view override returns (uint256 amount_) {
        return
            LockStorageWrapper.getLockedAmountByPartitionAdjustedAt(
                _DEFAULT_PARTITION,
                _tokenHolder,
                _getBlockTimestamp()
            );
    }

    function getLockCountFor(address _tokenHolder) external view override returns (uint256 lockCount_) {
        return LockStorageWrapper.getLockCountForByPartition(_DEFAULT_PARTITION, _tokenHolder);
    }

    function getLocksIdFor(
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory locksId_) {
        return LockStorageWrapper.getLocksIdForByPartition(_DEFAULT_PARTITION, _tokenHolder, _pageIndex, _pageLength);
    }

    function getLockFor(
        address _tokenHolder,
        uint256 _lockId
    ) external view override returns (uint256 amount_, uint256 expirationTimestamp_) {
        return
            LockStorageWrapper.getLockForByPartitionAdjustedAt(
                _DEFAULT_PARTITION,
                _tokenHolder,
                _lockId,
                _getBlockTimestamp()
            );
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // INTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    // ════════════════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPER FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    /// @dev Lock tokens by partition - orchestrates library calls in correct order
    function _lockByPartitionHelper(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) private returns (bool, uint256) {
        // Step 1: Trigger and sync ABAF
        ABAFStorageWrapper.triggerAndSyncAll(_partition, _tokenHolder, address(0));

        // Step 2: Update total lock LABAF
        uint256 abaf = LockStorageWrapper.updateTotalLock(_partition, _tokenHolder);

        // Step 3: Update account balance snapshot
        SnapshotsStorageWrapper.updateAccountSnapshot(_tokenHolder, _partition);

        // Step 4: Update locked balance snapshot
        SnapshotsStorageWrapper.updateAccountLockedBalancesSnapshot(_tokenHolder, _partition);

        // Step 5: Reduce available balance by locked amount
        ERC1410StorageWrapper.reduceBalanceByPartition(_tokenHolder, _amount, _partition);

        // Step 6: Create lock record and get lock ID
        uint256 lockId = LockStorageWrapper.createLockByPartition(
            _partition,
            _amount,
            _tokenHolder,
            _expirationTimestamp
        );

        // Step 7: Set LABAF for new lock
        ABAFStorageWrapper.setLockLabafById(_partition, _tokenHolder, lockId, abaf);

        return (true, lockId);
    }

    /// @dev Release locked tokens by partition - orchestrates library calls in correct order
    function _releaseByPartitionHelper(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    ) private returns (bool) {
        // Step 1: Trigger and sync ABAF (note: sender/receiver flipped vs lock)
        ABAFStorageWrapper.triggerAndSyncAll(_partition, address(0), _tokenHolder);

        // Step 2: Update total lock LABAF
        uint256 abaf = LockStorageWrapper.updateTotalLock(_partition, _tokenHolder);

        // Step 3: ABAF-adjust the specific lock
        LockStorageWrapper.updateLockByIndex(_partition, _lockId, _tokenHolder, abaf);

        // Step 4: Update account balance snapshot
        SnapshotsStorageWrapper.updateAccountSnapshot(_tokenHolder, _partition);

        // Step 5: Update locked balance snapshot
        SnapshotsStorageWrapper.updateAccountLockedBalancesSnapshot(_tokenHolder, _partition);

        // Step 6: Release lock and get amount
        uint256 lockAmount = LockStorageWrapper.releaseLockByPartition(_partition, _lockId, _tokenHolder);

        // Step 7: Remove LABAF for lock
        ABAFStorageWrapper.removeLabafLock(_partition, _tokenHolder, _lockId);

        // Step 8: Restore balance (increase existing partition or add new)
        if (ERC1410StorageWrapper.validPartitionForReceiver(_partition, _tokenHolder)) {
            ERC1410StorageWrapper.increaseBalanceByPartition(_tokenHolder, lockAmount, _partition);
        } else {
            ERC1410StorageWrapper.addPartitionTo(lockAmount, _tokenHolder, _partition);
        }

        return true;
    }
}
