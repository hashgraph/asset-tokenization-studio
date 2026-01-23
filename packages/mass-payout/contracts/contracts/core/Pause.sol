// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.22;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import { IPause } from "./interfaces/IPause.sol";
import { _PAUSER_ROLE } from "../constants/roles.sol";
import { Common } from "../common/Common.sol";

abstract contract Pause is IPause, Common {
    function pause() external override onlyUnpaused onlyRole(_PAUSER_ROLE) returns (bool success_) {
        _setPause(true);
        success_ = true;
    }

    function unpause() external override onlyPaused onlyRole(_PAUSER_ROLE) returns (bool success_) {
        _setPause(false);
        success_ = true;
    }

    function isPaused() external view override returns (bool) {
        return _isPaused();
    }
}
