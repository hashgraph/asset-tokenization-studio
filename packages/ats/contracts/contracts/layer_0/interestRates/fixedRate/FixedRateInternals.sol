// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SecurityInternals } from "../../security/SecurityInternals.sol";

abstract contract FixedRateInternals is SecurityInternals {
    function _setRate(uint256 _newRate, uint8 _newRateDecimals) internal virtual;
    function _getRate() internal view virtual returns (uint256 rate_, uint8 decimals_);
}
