// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { PauseStorageWrapper } from "../../domain/core/PauseStorageWrapper.sol";
import { ExternalListManagementStorageWrapper } from "../../domain/core/ExternalListManagementStorageWrapper.sol";
import { _checkNotInitialized } from "../InitializationErrors.sol";

/**
 * @title PauseModifiers
 * @notice Abstract contract providing pause-related modifiers
 * @dev Provides modifiers for pause state validation using _check* pattern
 *      from PauseStorageWrapper
 * @author Hashgraph
 */
abstract contract PauseModifiers {
    /**
     * @notice Restricts function execution to when the contract is unpaused
     * @dev Reverts if the contract is currently paused
     */
    modifier onlyUnpaused() {
        PauseStorageWrapper._checkUnpaused();
        _;
    }

    /**
     * @notice Restricts function execution to when the contract is paused
     * @dev Reverts if the contract is currently unpaused
     */
    modifier onlyPaused() {
        PauseStorageWrapper._checkPaused();
        _;
    }

    /**
     * @notice Ensures external pause initialisation has not yet occurred
     * @dev Reverts if the external pause mechanism has already been initialised
     */
    modifier onlyNotExternalPauseInitialized() {
        _checkNotInitialized(ExternalListManagementStorageWrapper.isExternalPauseInitialized());
        _;
    }
}
