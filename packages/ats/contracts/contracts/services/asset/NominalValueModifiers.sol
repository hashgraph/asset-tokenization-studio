// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { NominalValueStorageWrapper } from "../../domain/asset/NominalValueStorageWrapper.sol";
import { _checkNotInitialized } from "../InitializationErrors.sol";

/**
 * @title NominalValueModifiers
 * @notice Abstract contract providing nominal value-related modifiers
 * @dev Provides modifiers for nominal value state validation using _check* pattern
 *      from NominalValueStorageWrapper
 * @author Asset Tokenization Studio Team
 */
abstract contract NominalValueModifiers {
    /**
     * @notice Modifier to ensure nominal value has not been initialized
     * @dev Reverts with AlreadyInitialized if nominal value is already initialized
     */
    modifier onlyNotNominalValueInitialized() {
        _checkNotInitialized(NominalValueStorageWrapper.isNominalValueInitialized());
        _;
    }
}
