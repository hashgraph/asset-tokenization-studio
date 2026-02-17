// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1594Modifiers } from "../ERC1594/ERC1594Modifiers.sol";

abstract contract ERC1644Modifiers is ERC1594Modifiers {
    // ===== ERC1644 Modifiers =====
    modifier onlyControllable() virtual;
}
