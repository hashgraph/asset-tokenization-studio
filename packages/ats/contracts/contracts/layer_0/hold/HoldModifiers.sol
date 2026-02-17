// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LockModifiers } from "../lock/LockModifiers.sol";
import { HoldIdentifier } from "../../layer_1/interfaces/hold/IHold.sol";

abstract contract HoldModifiers is LockModifiers {
    // ===== Hold Modifiers =====
    modifier onlyWithValidHoldId(HoldIdentifier calldata _holdIdentifier) virtual;
}
