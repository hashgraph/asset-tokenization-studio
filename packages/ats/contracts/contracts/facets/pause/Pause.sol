// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPause } from "./IPause.sol";
import { ROLE_PAUSER } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { PauseStorageWrapper } from "../../domain/core/PauseStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Pause
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing pause and unpause logic for a security token.
 * @dev Implements `IPause`. Pause state is stored via `PauseStorageWrapper`, which evaluates
 *      both the internal flag and any registered external pause contracts. Event emission is
 *      handled inside `PauseStorageWrapper.setPause`. Intended to be inherited exclusively by
 *      `PauseFacet`.
 */
abstract contract Pause is IPause, Modifiers {
    /// @inheritdoc IPause
    function pause() external override onlyActivated onlyUnpaused onlyRole(ROLE_PAUSER) returns (bool success_) {
        PauseStorageWrapper.setPause(true);
        emit IPause.Paused(EvmAccessors.getMsgSender());
        success_ = true;
    }

    /// @inheritdoc IPause
    function unpause() external override onlyActivated onlyRole(ROLE_PAUSER) onlyPaused returns (bool success_) {
        PauseStorageWrapper.setPause(false);
        emit IPause.Unpaused(EvmAccessors.getMsgSender());
        success_ = true;
    }

    /// @inheritdoc IPause
    function paused() external view override returns (bool) {
        return PauseStorageWrapper.isPaused();
    }
}
