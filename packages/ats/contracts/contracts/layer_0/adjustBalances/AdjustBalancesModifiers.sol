// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldModifiers } from "../hold/HoldModifiers.sol";

abstract contract AdjustBalancesModifiers is HoldModifiers {
    // ===== AdjustBalances Modifiers =====
    modifier validateFactor(uint256 _factor) virtual;
}
