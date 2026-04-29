// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPause } from "./IPause.sol";
import { PAUSER_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { PauseStorageWrapper } from "../../domain/core/PauseStorageWrapper.sol";

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
    function pause() external override onlyUnpaused onlyRole(PAUSER_ROLE) returns (bool success_) {
        PauseStorageWrapper.setPause(true);
        success_ = true;
    }

    /// @inheritdoc IPause
    function unpause() external override onlyRole(PAUSER_ROLE) onlyPaused returns (bool success_) {
        PauseStorageWrapper.setPause(false);
        success_ = true;
    }

    /// @inheritdoc IPause
    function isPaused() external view override returns (bool) {
        return PauseStorageWrapper.isPaused();
    }
}
