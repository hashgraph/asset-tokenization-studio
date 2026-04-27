// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1644StorageWrapper } from "../../domain/asset/ERC1644StorageWrapper.sol";
import { checkNotInitialized } from "../InitializationErrors.sol";

/**
 * @title StateModifiers
 * @dev Abstract contract providing state-related modifiers
 *
 * This contract wraps ERC1644StorageWrapper library functions into modifiers
 * for convenient use in facets.
 *
 * @notice Inherit from this contract to gain access to state modifiers
 * @author Asset Tokenization Studio Team
 */
abstract contract StateModifiers {
    /**
     * @dev Modifier that checks token is in controllable state
     *
     * Requirements:
     * - Token must be marked as controllable (isControllable == true)
     * - Used for ERC1644 controller operations
     * - Once finalized, token is no longer controllable
     */
    modifier onlyControllable() {
        ERC1644StorageWrapper.requireControllable();
        _;
    }

    /**
     * @dev Modifier that checks storage is uninitialized
     *
     * Requirements:
     * - Storage must not be initialized yet
     * - Used for initialization functions to prevent re-initialization
     *
     * @param _initialized The initialized flag to check
     */
    modifier onlyUninitialized(bool _initialized) {
        checkNotInitialized(_initialized);
        _;
    }
}
