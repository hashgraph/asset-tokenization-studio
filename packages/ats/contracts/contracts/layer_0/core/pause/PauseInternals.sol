// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ExternalPauseInternals } from "../externalPauses/ExternalPauseInternals.sol";

abstract contract PauseInternals is ExternalPauseInternals {
    function _setPause(bool _paused) internal virtual;
    function _checkUnpaused() internal view virtual;
    function _isPaused() internal view virtual returns (bool);
}
