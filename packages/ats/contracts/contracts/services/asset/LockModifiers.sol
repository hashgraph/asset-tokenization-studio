// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LockStorageWrapper } from "../../domain/asset/LockStorageWrapper.sol";

/**
 * @title LockModifiers
 * @author Hashgraph
 * @notice Abstract contract providing lock-related modifiers
 *
 * This contract wraps LockStorageWrapper library functions into modifiers
 * for convenient use in facets. It allows facets to use modifier syntax while
 * keeping LockStorageWrapper as a library.
 *
 * @notice Inherit from this contract to gain access to lock modifiers
 */
abstract contract LockModifiers {
    /**
     * @dev Modifier that validates expiration timestamp is in the future
     *
     * Requirements:
     * - Expiration timestamp must be greater than current block timestamp
     * - Used for lock operations with time-based expiration
     *
     * @param _expirationTimestamp The timestamp to validate
     */
    modifier onlyValidExpirationTimestamp(uint256 _expirationTimestamp) {
        LockStorageWrapper.requireValidExpirationTimestamp(_expirationTimestamp);
        _;
    }

    /**
     * @dev Modifier that validates lock ID exists for the given partition and token holder
     *
     * Requirements:
     * - Lock ID must be valid for the partition and token holder
     * - Used for release operations to ensure lock exists
     *
     * @param _partition The partition identifier
     * @param _tokenHolder The token holder address
     * @param _lockId The lock identifier to validate
     */
    modifier onlyWithValidLockId(bytes32 _partition, address _tokenHolder, uint256 _lockId) {
        LockStorageWrapper.requireValidLockId(_partition, _tokenHolder, _lockId);
        _;
    }

    /**
     * @dev Modifier that validates lock expiration timestamp has been reached
     *
     * Requirements:
     * - Lock expiration timestamp must be less than or equal to current block timestamp
     * - Used for release operations to ensure lock can be released
     *
     * @param _partition The partition identifier
     * @param _tokenHolder The token holder address
     * @param _lockId The lock identifier to validate
     */
    modifier onlyWithLockedExpirationTimestamp(bytes32 _partition, address _tokenHolder, uint256 _lockId) {
        LockStorageWrapper.requireLockedExpirationTimestamp(_partition, _tokenHolder, _lockId);
        _;
    }
}
