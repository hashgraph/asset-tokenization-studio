// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPause } from "./IPause.sol";
import { _PAUSER_ROLE } from "../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseModifiers } from "../../../domain/core/PauseModifiers.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseModifiers.sol";
import { AccessControlModifiers } from "../../../infrastructure/utils/AccessControlModifiers.sol";

abstract contract Pause is IPause, PauseModifiers, AccessControlModifiers {
    function pause() external override onlyUnpaused onlyRole(_PAUSER_ROLE) returns (bool success_) {
        PauseStorageWrapper.setPause(true);
        success_ = true;
    }

    function unpause() external override onlyPaused onlyRole(_PAUSER_ROLE) returns (bool success_) {
        PauseStorageWrapper.setPause(false);
        success_ = true;
    }

    function isPaused() external view override returns (bool) {
        return PauseStorageWrapper.isPaused();
    }
}
