// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LockStorageWrapper } from "../../domain/asset/LockStorageWrapper.sol";

/**
 * @title LockModifiers
 * @author Asset Tokenization Studio Team
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
}
