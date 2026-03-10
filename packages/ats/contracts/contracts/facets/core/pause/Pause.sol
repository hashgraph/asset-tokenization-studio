// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPause } from "../pause/IPause.sol";
import { _PAUSER_ROLE } from "../../../constants/roles.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";

abstract contract Pause is IPause {
    function pause() external override returns (bool success_) {
        AccessStorageWrapper.checkRole(_PAUSER_ROLE);
        PauseStorageWrapper.requireNotPaused();
        PauseStorageWrapper.pause();
        success_ = true;
    }

    function unpause() external override returns (bool success_) {
        AccessStorageWrapper.checkRole(_PAUSER_ROLE);
        PauseStorageWrapper.requirePaused();
        PauseStorageWrapper.unpause();
        success_ = true;
    }

    function isPaused() external view override returns (bool) {
        return PauseStorageWrapper.isPaused();
    }
}
