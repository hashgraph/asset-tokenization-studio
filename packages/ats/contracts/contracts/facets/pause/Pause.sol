// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { PauseRead } from "./PauseRead.sol";
import { IPause, RESOLVER_KEY_PAUSE } from "./IPause.sol";
import { ROLE_PAUSER } from "../../constants/roles.sol";
import { PauseStorageWrapper } from "../../domain/core/PauseStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title Pause
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing pause and unpause logic for a security token.
 * @dev Implements `IPause`. Pause state is stored via `PauseStorageWrapper`, which evaluates
 *      both the internal flag and any registered external onlyOperational pause contracts. Event emission is
 *      handled inside `PauseStorageWrapper.setPause`. Intended to be inherited exclusively by
 *      `PauseFacet`.
 */
abstract contract Pause is PauseRead {
    /// @inheritdoc IPause
    function initializePause()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_PAUSE)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_PAUSE);
        emit PauseInitialized();
    }

    /// @inheritdoc IPause
    function pause() external override onlyUnpaused onlyRole(ROLE_PAUSER) returns (bool success_) {
        PauseStorageWrapper.setPause(true);
        emit IPause.Paused(EvmAccessors.getMsgSender());
        success_ = true;
    }

    /// @inheritdoc IPause
    function unpause() external override onlyRole(ROLE_PAUSER) onlyPaused returns (bool success_) {
        PauseStorageWrapper.setPause(false);
        emit IPause.Unpaused(EvmAccessors.getMsgSender());
        success_ = true;
    }
}
