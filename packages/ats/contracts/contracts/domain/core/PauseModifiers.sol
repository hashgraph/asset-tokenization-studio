// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { PauseStorageWrapper } from "./PauseStorageWrapper.sol";
import { IPauseStorageWrapper } from "./pause/IPauseStorageWrapper.sol";

/**
 * @title PauseModifiers
 * @dev Abstract contract providing pause-related modifiers
 *
 * This contract provides reusable modifiers for validating pause state.
 * It uses the PauseStorageWrapper library for actual pause checking.
 *
 * @notice Inherit from this contract to gain pause modifiers
 * @author Asset Tokenization Studio Team
 */
abstract contract PauseModifiers {
    /**
     * @dev Modifier that validates the contract is not paused
     *
     * Requirements:
     * - Contract must not be paused
     */
    modifier onlyUnpaused() {
        if (PauseStorageWrapper.isPaused()) {
            revert IPauseStorageWrapper.TokenIsPaused();
        }
        _;
    }

    /**
     * @dev Modifier that validates the contract is paused
     *
     * Requirements:
     * - Contract must be paused
     */
    modifier onlyPaused() {
        if (!PauseStorageWrapper.isPaused()) {
            revert IPauseStorageWrapper.TokenIsUnpaused();
        }
        _;
    }
}
