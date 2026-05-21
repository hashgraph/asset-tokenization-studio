// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILockByPartition } from "./ILockByPartition.sol";
import { LOCKER_ROLE } from "../../constants/roles.sol";
import { LockStorageWrapper } from "../../domain/asset/LockStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _LOCK_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title LockByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract base for the partition-aware lock writes and partition-scoped read
 *         queries declared in `ILockByPartition`.
 * @dev Combines the partition write operations (`lockByPartition`, `releaseByPartition`)
 *      with the partition-scoped reads (`getLockedAmountForByPartition`,
 *      `getLockCountForByPartition`, `getLocksIdForByPartition`, `getLockForByPartition`).
 *      All write methods delegate persistence to `LockStorageWrapper`; balance-adjusted
 *      reads are timestamped via `TimeTravelStorageWrapper.getBlockTimestamp` so they
 *      remain deterministic under time-travel testing. Intended to be inherited by
 *      `LockByPartitionFacet`.
 */
abstract contract LockByPartition is ILockByPartition, Modifiers {
    /// @inheritdoc ILockByPartition
    function initializeLockByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_LOCK_BY_PARTITION_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_LOCK_BY_PARTITION_RESOLVER_KEY);
        emit LockByPartitionInitialized();
    }

    /// @inheritdoc ILockByPartition
    function lockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(LOCKER_ROLE)
        onlyValidExpirationTimestamp(_expirationTimestamp)
        onlyUnrecoveredAddress(_tokenHolder)
        onlyDefaultPartitionWithSinglePartition(_partition)
        returns (bool success_, uint256 lockId_)
    {
        address sender = EvmAccessors.getMsgSender();
        (success_, lockId_) = LockStorageWrapper.lockByPartition(
            _partition,
            _amount,
            _tokenHolder,
            _expirationTimestamp,
            sender
        );
        emit LockedByPartition(sender, _tokenHolder, _partition, lockId_, _amount, _expirationTimestamp);
    }

    /**
     * @inheritdoc ILockByPartition
     * @dev Pause-gated and validated against the single-partition / default-partition
     *      rule. Reverts with `WrongLockId` when `_lockId` is unknown for
     *      `(_partition, _tokenHolder)` and with `LockExpirationNotReached` before the
     *      lock expires. Emits `LockByPartitionReleased`.
     */
    function releaseByPartition(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyUnrecoveredAddress(_tokenHolder)
        onlyWithValidLockId(_partition, _tokenHolder, _lockId)
        onlyWithLockedExpirationTimestamp(_partition, _tokenHolder, _lockId)
        returns (bool success_)
    {
        address sender = EvmAccessors.getMsgSender();
        success_ = LockStorageWrapper.releaseByPartition(_partition, _lockId, _tokenHolder, sender);
        emit LockByPartitionReleased(sender, _tokenHolder, _partition, _lockId);
    }

    /**
     * @inheritdoc ILockByPartition
     * @dev Returns the partition figure adjusted by any pending balance-adjustment factors,
     *      evaluated at `TimeTravelStorageWrapper.getBlockTimestamp()`.
     */
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

    /**
     * @inheritdoc ILockByPartition
     * @dev Returns the partition figures adjusted by any pending balance-adjustment factors,
     *      evaluated at `TimeTravelStorageWrapper.getBlockTimestamp()`.
     */
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
