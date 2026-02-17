// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ExternalListInternals } from "../externalLists/ExternalListInternals.sol";

abstract contract ExternalControlListInternals is ExternalListInternals {
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ExternalControlLists(address[] calldata _controlLists) internal virtual;
    function _isExternalControlListInitialized() internal view virtual returns (bool);
}
