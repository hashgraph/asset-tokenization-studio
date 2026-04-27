// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondStorageWrapper } from "../../domain/asset/BondStorageWrapper.sol";
import { _checkNotInitialized } from "../InitializationErrors.sol";

/**
 * @title BondModifiers
 * @notice Abstract contract providing bond-related modifiers
 * @dev Provides modifiers for bond state validation using _check* pattern
 *      from BondStorageWrapper
 * @author Asset Tokenization Studio Team
 */
abstract contract BondModifiers {
    /**
     * @notice Modifier to ensure bond has not been initialized
     * @dev Reverts with AlreadyInitialized if bond is already initialized
     */
    modifier onlyNotBondInitialized() {
        _checkNotInitialized(BondStorageWrapper.isBondInitialized());
        _;
    }
}
