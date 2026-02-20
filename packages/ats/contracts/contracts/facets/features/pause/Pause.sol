// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPause } from "../interfaces/IPause.sol";
import { _PAUSER_ROLE } from "../../../constants/roles.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";

abstract contract Pause is IPause {
    function pause() external override returns (bool success_) {
        LibAccess.checkRole(_PAUSER_ROLE);
        LibPause.requireNotPaused();
        LibPause.pause();
        success_ = true;
    }

    function unpause() external override returns (bool success_) {
        LibAccess.checkRole(_PAUSER_ROLE);
        LibPause.requirePaused();
        LibPause.unpause();
        success_ = true;
    }

    function isPaused() external view override returns (bool) {
        return LibPause.isPaused();
    }
}
