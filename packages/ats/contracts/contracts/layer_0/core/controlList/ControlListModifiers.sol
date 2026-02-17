// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LocalContext } from "../../context/LocalContext.sol";

abstract contract ControlListModifiers is LocalContext {
    // ===== ControlList Modifiers =====
    modifier onlyListedAllowed(address _account) virtual;
}
