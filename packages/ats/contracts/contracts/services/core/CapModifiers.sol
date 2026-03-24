// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CapStorageWrapper } from "../../domain/core/CapStorageWrapper.sol";
import { _checkNotInitialized } from "../InitializationErrors.sol";

/**
 * @title CapModifiers
 * @notice Abstract contract providing cap-related modifiers
 * @dev Provides modifiers for cap validation using _check* pattern
 *      from CapStorageWrapper
 * @author Asset Tokenization Studio Team
 */
abstract contract CapModifiers {
    /// @notice Modifier to ensure cap has not been initialized
    /// @dev Calls _checkNotCapInitialized from CapStorageWrapper
    modifier onlyNotCapInitialized() {
        _checkNotInitialized(CapStorageWrapper.isCapInitialized());
        _;
    }
}
