// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPause } from "../interfaces/pause/IPause.sol";
import { _PAUSER_ROLE } from "../constants/roles.sol";
import { Common } from "../common/Common.sol";

abstract contract Pause is IPause, Common {
    function pause() external override onlyRole(_PAUSER_ROLE) onlyUnpaused returns (bool success_) {
        _setPause(true);
        success_ = true;
    }

    function unpause() external override onlyRole(_PAUSER_ROLE) onlyPaused returns (bool success_) {
        _setPause(false);
        success_ = true;
    }

    function isPaused() external view override returns (bool) {
        return _isPaused();
    }
}
