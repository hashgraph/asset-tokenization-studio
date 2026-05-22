// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SecurityStorageWrapper } from "../../domain/asset/SecurityStorageWrapper.sol";
import { _checkNotInitialized } from "../InitializationErrors.sol";

/**
 * @title SecurityModifiers
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract providing security regulation-related modifiers.
 * @dev Wraps `SecurityStorageWrapper` initialisation checks into modifier syntax for use in
 *      security facets. Inherit from this contract to gain access to security state modifiers.
 */
abstract contract SecurityModifiers {
    /**
     * @dev Modifier that validates the security regulation capability has not yet been initialised.
     *
     * Requirements:
     * - `SecurityStorageWrapper.isSecurityInitialized()` must return `false`
     * - Reverts with `AlreadyInitialized` if the capability has already been set up
     */
    modifier onlyNotSecurityInitialized() {
        _checkNotInitialized(SecurityStorageWrapper.isSecurityInitialized());
        _;
    }
}
