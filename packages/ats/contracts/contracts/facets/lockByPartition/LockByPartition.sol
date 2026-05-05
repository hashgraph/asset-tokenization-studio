// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILockByPartition } from "./ILockByPartition.sol";
import { LOCKER_ROLE } from "../../constants/roles.sol";
import { LockStorageWrapper } from "../../domain/asset/LockStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title LockByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `ILockByPartition`, providing partition-aware lock writes
 *         and partition-scoped read queries.
 * @dev Combines the partition write operations (`lockByPartition`, `releaseByPartition`) with
 *      the partition-scoped reads (`getLockedAmountForByPartition`, `getLockCountForByPartition`,
 *      `getLocksIdForByPartition`, `getLockForByPartition`). All write methods delegate to
 *      `LockStorageWrapper`. Intended to be inherited by `LockByPartitionFacet`.
 */
abstract contract LockByPartition is ILockByPartition, Modifiers {
    /// @inheritdoc ILockByPartition
    function lockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    )
        external
        override
        onlyUnpaused
        onlyRole(LOCKER_ROLE)
        onlyValidExpirationTimestamp(_expirationTimestamp)
        onlyUnrecoveredAddress(_tokenHolder)
        onlyDefaultPartitionWithSinglePartition(_partition)
        returns (bool success_, uint256 lockId_)
    {
        (success_, lockId_) = LockStorageWrapper.lockByPartition(
            _partition,
            _amount,
            _tokenHolder,
            _expirationTimestamp,
            EvmAccessors.getMsgSender()
        );
        emit LockedByPartition(
            EvmAccessors.getMsgSender(),
            _tokenHolder,
            _partition,
            lockId_,
            _amount,
            _expirationTimestamp
        );
    }

    /// @inheritdoc ILockByPartition
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
        success_ = LockStorageWrapper.releaseByPartition(
            _partition,
            _lockId,
            _tokenHolder,
            EvmAccessors.getMsgSender()
        );
        emit LockByPartitionReleased(EvmAccessors.getMsgSender(), _tokenHolder, _partition, _lockId);
    }

    /// @inheritdoc ILockByPartition
    function getLockedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 amount_) {
        amount_ = LockStorageWrapper.getLockedAmountForByPartitionAdjustedAt(
            _partition,
            _tokenHolder,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );
    }

    /// @inheritdoc ILockByPartition
    function getLockCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view override returns (uint256 lockCount_) {
        lockCount_ = LockStorageWrapper.getLockCountForByPartition(_partition, _tokenHolder);
    }

    /// @inheritdoc ILockByPartition
    function getLocksIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory locksId_) {
        locksId_ = LockStorageWrapper.getLocksIdForByPartition(_partition, _tokenHolder, _pageIndex, _pageLength);
    }

    /// @inheritdoc ILockByPartition
    function getLockForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) external view override returns (uint256 amount_, uint256 expirationTimestamp_) {
        (amount_, expirationTimestamp_) = LockStorageWrapper.getLockForByPartitionAdjustedAt(
            _partition,
            _tokenHolder,
            _lockId,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );
    }
}
