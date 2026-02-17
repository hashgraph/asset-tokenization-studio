// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ExternalControlListInternals } from "../externalControlLists/ExternalControlListInternals.sol";

abstract contract ExternalKycListInternals is ExternalControlListInternals {
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ExternalKycLists(address[] calldata _kycLists) internal virtual;
    function _isKycExternalInitialized() internal view virtual returns (bool);
}
