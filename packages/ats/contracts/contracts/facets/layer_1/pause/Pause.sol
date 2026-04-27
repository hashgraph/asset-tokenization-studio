// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPause } from "./IPause.sol";
import { PAUSER_ROLE } from "../../../constants/roles.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";

abstract contract Pause is IPause, Modifiers {
    function pause() external override onlyUnpaused onlyRole(PAUSER_ROLE) returns (bool success_) {
        PauseStorageWrapper.setPause(true);
        success_ = true;
    }

    function unpause() external override onlyRole(PAUSER_ROLE) onlyPaused returns (bool success_) {
        PauseStorageWrapper.setPause(false);
        success_ = true;
    }

    function isPaused() external view override returns (bool) {
        return PauseStorageWrapper.isPaused();
    }
}
