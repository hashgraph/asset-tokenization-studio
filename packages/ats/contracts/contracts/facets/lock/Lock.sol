// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ROLE_LOCKER, ROLE_CONTROLLER } from "../../constants/roles.sol";
import { ILock, RESOLVER_KEY_LOCK } from "./ILock.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { LockStorageWrapper } from "../../domain/asset/LockStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { DEFAULT_PARTITION } from "../../constants/values.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title Lock
 * @author Asset Tokenization Studio Team
 * @notice Abstract base for the default-partition lock surface and the all-partition read
 *         queries exposed by `LockFacet`.
 * @dev Implements `lock` / `release` for single-partition mode, the controller-or-locker
 *      `forceReleaseByPartition`, the partition-aware `getLockByPartition` lookup and the
 *      all-partition read methods declared in `ILock`. Partition-aware writes and
 *      partition-scoped reads live in the `LockByPartition` facet. All write operations
 *      delegate persistence to `LockStorageWrapper`; balance-adjusted reads are timestamped
 *      via `TimeTravelStorageWrapper.getBlockTimestamp` so they remain deterministic under
 *      time-travel testing.
 */
abstract contract Lock is ILock, Modifiers {
    /// @inheritdoc ILock
    function initializeLock() external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_LOCK) {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_LOCK);
        emit LockInitialized();
    }

    /**
     * @inheritdoc ILock
     * @dev Pause-gated, restricted to `ROLE_LOCKER`, only valid in single-partition mode and
     *      against unrecovered token holders. Delegates to
     *      `LockStorageWrapper.lockByPartition` against the default partition and emits
     *      `LockedByPartition`.
     */
    function lock(
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_LOCKER)
        onlyWithoutMultiPartition
        onlyUnrecoveredAddress(_tokenHolder)
        onlyValidExpirationTimestamp(_expirationTimestamp)
        returns (uint256 lockId_)
    {
        lockId_ = LockStorageWrapper.lockByPartition(
            DEFAULT_PARTITION,
            _amount,
            _tokenHolder,
            _expirationTimestamp,
            EvmAccessors.getMsgSender()
        );
        emit LockedByPartition(
            EvmAccessors.getMsgSender(),
            _tokenHolder,
            DEFAULT_PARTITION,
            lockId_,
            _amount,
            _expirationTimestamp
        );
    }

    /**
     * @inheritdoc ILock
     * @dev Pause-gated, only valid in single-partition mode. Reverts with `WrongLockId`
     *      when `_lockId` is unknown and with `LockExpirationNotReached` before the lock
     *      expires. Emits `LockByPartitionReleased`.
     */
    function release(
        uint256 _lockId,
        address _tokenHolder
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyWithoutMultiPartition
        onlyUnrecoveredAddress(_tokenHolder)
        onlyWithValidLockId(DEFAULT_PARTITION, _tokenHolder, _lockId)
        onlyWithLockedExpirationTimestamp(DEFAULT_PARTITION, _tokenHolder, _lockId)
        returns (bool success_)
    {
        success_ = LockStorageWrapper.releaseByPartition(
            DEFAULT_PARTITION,
            _lockId,
            _tokenHolder,
            EvmAccessors.getMsgSender()
        );
        emit LockByPartitionReleased(EvmAccessors.getMsgSender(), _tokenHolder, DEFAULT_PARTITION, _lockId);
    }

    /**
     * @notice Releases a lock unconditionally, before its expiration timestamp.
     * @dev Authorised path used to recover locked balances when the holder is unable to do
     *      so. Pause-gated, partition validated against single-partition mode and
     *      restricted to callers holding `ROLE_LOCKER` or `ROLE_CONTROLLER` (checked
     *      explicitly via `AccessControlStorageWrapper.checkAnyRole`). Skips the
     *      `LockExpirationNotReached` guard that `releaseByPartition` enforces. Emits
     *      `LockByPartitionReleased`.
     * @param _partition The partition the lock lives on.
     * @param _lockId Identifier of the lock to release.
     * @param _tokenHolder The address whose tokens are returned.
     * @return success_ True when the lock has been removed and the balance returned.
     */
    function forceReleaseByPartition(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        returns (bool success_)
    {
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = ROLE_LOCKER;
        roles[1] = ROLE_CONTROLLER;
        AccessControlStorageWrapper.checkAnyRole(roles, EvmAccessors.getMsgSender());
        success_ = LockStorageWrapper.releaseByPartition(
            _partition,
            _lockId,
            _tokenHolder,
            EvmAccessors.getMsgSender()
        );
        emit LockByPartitionReleased(EvmAccessors.getMsgSender(), _tokenHolder, _partition, _lockId);
    }

    /**
     * @inheritdoc ILock
     * @dev Pause-gated, restricted to `ROLE_LOCKER`, only valid in single-partition mode and
     *      against a valid lock id. Delegates the storage mutation to
     *      `LockStorageWrapper.updateLockExpiration` against the default partition and emits
     *      `LockExpirationUpdated` with both the old and new timestamps.
     */
    function updateLockExpiration(
        address _tokenHolder,
        uint256 _lockId,
        uint256 _newExpirationTimestamp
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_LOCKER)
        onlyWithoutMultiPartition
        onlyWithValidLockId(DEFAULT_PARTITION, _tokenHolder, _lockId)
        onlyValidExpirationTimestamp(_newExpirationTimestamp)
        returns (bool success_)
    {
        uint256 oldExpirationTimestamp = LockStorageWrapper.updateLockExpiration(
            DEFAULT_PARTITION,
            _tokenHolder,
            _lockId,
            _newExpirationTimestamp
        );
        emit LockExpirationUpdated(
            EvmAccessors.getMsgSender(),
            _tokenHolder,
            DEFAULT_PARTITION,
            _lockId,
            oldExpirationTimestamp,
            _newExpirationTimestamp
        );
        success_ = true;
    }

    /**
     * @notice Returns the raw `LockData` entry for a given partition, scoped to the caller.
     * @dev Reads the lock keyed by the message sender (resolved through `EvmAccessors`),
     *      not by an explicit token holder. Returns the unadjusted on-chain entry — callers
     *      that need balance-adjusted figures should use the partition-scoped reads on
     *      `LockByPartitionFacet`. Marked `virtual` so test doubles such as
     *      `LockFacetTimeTravel` can override it.
     * @param _partition The partition the lock lives on.
     * @param _lockId Identifier of the lock to read.
     * @return lockData_ The stored lock entry. All fields are zero when the identifier does
     *         not exist for the caller.
     */
    function getLockByPartition(
        bytes32 _partition,
        uint256 _lockId
    ) external view virtual returns (LockData memory lockData_) {
        lockData_ = LockStorageWrapper.getLock(_partition, EvmAccessors.getMsgSender(), _lockId);
    }

    /**
     * @inheritdoc ILock
     * @dev Returns the default-partition figure adjusted by any pending balance-adjustment
     *      factors, evaluated at `TimeTravelStorageWrapper.getBlockTimestamp()`.
     */
    function getLockedAmountFor(address _tokenHolder) external view override returns (uint256 amount_) {
        amount_ = LockStorageWrapper.getLockedAmountForByPartitionAdjustedAt(
            DEFAULT_PARTITION,
            _tokenHolder,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );
    }

    /// @inheritdoc ILock
    function getLockCountFor(address _tokenHolder) external view override returns (uint256 lockCount_) {
        lockCount_ = LockStorageWrapper.getLockCountFor(_tokenHolder);
    }

    /// @inheritdoc ILock
    function getLocksIdFor(
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory locksId_) {
        locksId_ = LockStorageWrapper.getLocksIdFor(_tokenHolder, _pageIndex, _pageLength);
    }

    /**
     * @inheritdoc ILock
     * @dev Returns the default-partition figures adjusted by any pending balance-adjustment
     *      factors, evaluated at `TimeTravelStorageWrapper.getBlockTimestamp()`.
     */
    function getLockFor(
        address _tokenHolder,
        uint256 _lockId
    ) external view override returns (uint256 amount_, uint256 expirationTimestamp_) {
        (amount_, expirationTimestamp_) = LockStorageWrapper.getLockForByPartitionAdjustedAt(
            DEFAULT_PARTITION,
            _tokenHolder,
            _lockId,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );
    }
}
