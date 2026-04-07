// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTypes } from "../../facets/layer_1/clearing/IClearingTypes.sol";
import { LockStorageWrapper } from "../../domain/asset/LockStorageWrapper.sol";
import { ClearingStorageWrapper } from "../../domain/asset/ClearingStorageWrapper.sol";

/**
 * @title ExpirationModifiers
 * @dev Abstract contract providing expiration timestamp validation modifiers
 *
 * This contract wraps LockStorageWrapper and ClearingStorageWrapper library
 * functions into modifiers for convenient use in facets.
 *
 * @notice Inherit from this contract to gain access to expiration modifiers
 * @author Asset Tokenization Studio Team
 */
abstract contract ExpirationModifiers {
    /**
     * @dev Modifier that validates expiration timestamp is in the future
     *
     * Requirements:
     * - Expiration timestamp must be greater than current block timestamp
     * - Used for lock creation and expiration validation
     *
     * @param _expirationTimestamp The expiration timestamp to validate
     */
    modifier onlyWithValidExpirationTimestamp(uint256 _expirationTimestamp) {
        LockStorageWrapper.requireValidExpirationTimestamp(_expirationTimestamp);
        _;
    }

    /**
     * @dev Modifier that validates expiration timestamp for clearing operation
     *
     * Requirements:
     * - If _mustBeExpired is true, clearing operation must be expired
     * - If _mustBeExpired is false, clearing operation must not be expired
     *
     * @param _clearingOperationIdentifier The clearing operation identifier
     * @param _mustBeExpired Whether the operation must be expired
     */
    modifier validateExpirationTimestamp(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bool _mustBeExpired
    ) {
        ClearingStorageWrapper.requireExpirationTimestamp(_clearingOperationIdentifier, _mustBeExpired);
        _;
    }
}
