// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { PauseStorageWrapper } from "../../domain/core/PauseStorageWrapper.sol";
import { _checkNotInitialized } from "../InitializationErrors.sol";

/**
 * @title PauseModifiers
 * @notice Abstract contract providing pause-related modifiers
 * @dev Provides modifiers for pause state validation using _check* pattern
 *      from PauseStorageWrapper
 * @author Asset Tokenization Studio Team
 */
abstract contract PauseModifiers {
    modifier onlyUnpaused() {
        PauseStorageWrapper.checkUnpaused();
        _;
    }

    modifier onlyPaused() {
        PauseStorageWrapper.checkPaused();
        _;
    }

    modifier onlyNotExternalPauseInitialized() {
        _checkNotInitialized(PauseStorageWrapper.isExternalPauseInitialized());
        _;
    }
}
