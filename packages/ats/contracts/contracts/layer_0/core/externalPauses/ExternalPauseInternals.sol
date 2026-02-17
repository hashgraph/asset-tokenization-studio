// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ControlListInternals } from "../controlList/ControlListInternals.sol";

abstract contract ExternalPauseInternals is ControlListInternals {
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ExternalPauses(address[] calldata _pauses) internal virtual;
    function _isExternalPauseInitialized() internal view virtual returns (bool);
    function _isExternallyPaused() internal view virtual returns (bool);
}
