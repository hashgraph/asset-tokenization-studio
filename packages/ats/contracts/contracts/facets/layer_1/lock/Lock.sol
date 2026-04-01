// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _LOCKER_ROLE, _CONTROLLER_ROLE } from "../../../constants/roles.sol";
import { ILock } from "./ILock.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { LockStorageWrapper } from "../../../domain/asset/LockStorageWrapper.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Lock
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract for locking tokens by partition
 *
 * Provides functionality for locking tokens with expiration timestamps
 * and role-based access control. Inherits LockModifiers for expiration validation.
 */
abstract contract Lock is ILock, TimestampProvider, Modifiers {
    /**
     * @notice Lock tokens by partition
     * @dev Only callable by LOCKER_ROLE
     *
     * Requirements:
     * - Partition must be valid and single
     * - Token holder must not be recovered
     * - Expiration timestamp must be in the future
     * - Caller must have LOCKER_ROLE
     *
     * @param _partition The partition identifier
     * @param _amount The amount to lock
     * @param _tokenHolder The token holder address
     * @param _expirationTimestamp The lock expiration timestamp
     * @return success_ Boolean indicating success
     * @return lockId_ The created lock identifier
     */
    function lockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    )
        external
        override
        onlyUnpaused
        onlyRole(_LOCKER_ROLE)
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

    /**
     * @notice Release tokens by partition
     *
     * Requirements:
     * - Contract must not be paused
     * - Partition must be valid and single
     * - Lock ID must be valid
     * - Lock expiration timestamp must have been reached
     *
     * @param _partition The partition identifier
     * @param _lockId The lock identifier
     * @param _tokenHolder The token holder address
     * @return success_ Boolean indicating success
     */
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

    /**
     * @notice Force release tokens by partition
     * @dev Only callable by LOCKER_ROLE or CONTROLLER_ROLE
     *
     * Requirements:
     * - Partition must be valid and single
     * - Lock ID must be valid
     * - Caller must have LOCKER_ROLE or CONTROLLER_ROLE
     *
     * @param _partition The partition identifier
     * @param _lockId The lock identifier
     * @param _tokenHolder The token holder address
     * @return success_ Boolean indicating success
     */
    function forceReleaseByPartition(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    ) external onlyUnpaused onlyDefaultPartitionWithSinglePartition(_partition) returns (bool success_) {
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = _LOCKER_ROLE;
        roles[1] = _CONTROLLER_ROLE;
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
     * @notice Get lock data by partition
     * @param _partition The partition identifier
     * @param _lockId The lock identifier
     * @return lockData_ Lock data structure
     */
    function getLockByPartition(
        bytes32 _partition,
        uint256 _lockId
    ) external view virtual returns (LockData memory lockData_) {
        lockData_ = LockStorageWrapper.getLock(_partition, EvmAccessors.getMsgSender(), _lockId);
    }
}
