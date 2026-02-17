// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410Modifiers } from "../ERC1400/ERC1410/ERC1410Modifiers.sol";

abstract contract CommonModifiers is ERC1410Modifiers {
    // ===== Common Modifiers =====
    modifier onlyUnProtectedPartitionsOrWildCardRole() virtual;
    modifier onlyClearingDisabled() virtual;
    modifier onlyUninitialized(bool _initialized) virtual;
}
