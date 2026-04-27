// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EquityStorageWrapper } from "../../domain/asset/EquityStorageWrapper.sol";
import { checkNotInitialized } from "../InitializationErrors.sol";

/**
 * @title EquityModifiers
 * @notice Abstract contract providing equity-related modifiers
 * @dev Provides modifiers for equity state validation using _check* pattern
 *      from EquityStorageWrapper
 * @author Asset Tokenization Studio Team
 */
abstract contract EquityModifiers {
    /**
     * @notice Modifier to ensure equity has not been initialized
     * @dev Reverts with AlreadyInitialized if equity is already initialized
     */
    modifier onlyNotEquityInitialized() {
        checkNotInitialized(EquityStorageWrapper.isEquityInitialized());
        _;
    }
}
