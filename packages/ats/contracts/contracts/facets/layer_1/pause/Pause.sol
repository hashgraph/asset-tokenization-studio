// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPause } from "./IPause.sol";
import { _PAUSER_ROLE } from "../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";

abstract contract Pause is IPause {
    function pause() external override returns (bool success_) {
        AccessControlStorageWrapper._checkRole(_PAUSER_ROLE, msg.sender);
        PauseStorageWrapper._requireNotPaused();
        PauseStorageWrapper._setPause(true);
        success_ = true;
    }

    function unpause() external override returns (bool success_) {
        AccessControlStorageWrapper._checkRole(_PAUSER_ROLE, msg.sender);
        PauseStorageWrapper._requirePaused();
        PauseStorageWrapper._setPause(false);
        success_ = true;
    }

    function isPaused() external view override returns (bool) {
        return PauseStorageWrapper._isPaused();
    }
}
