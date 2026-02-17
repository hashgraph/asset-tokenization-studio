// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC3643Modifiers } from "../ERC3643/ERC3643Modifiers.sol";

abstract contract BondModifiers is ERC3643Modifiers {
    // ===== Bond Modifiers =====
    modifier onlyAfterCurrentMaturityDate(uint256 _maturityDate) virtual;
}
