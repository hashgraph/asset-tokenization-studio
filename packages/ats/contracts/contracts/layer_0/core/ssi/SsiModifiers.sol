// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1644Modifiers } from "../../ERC1400/ERC1644/ERC1644Modifiers.sol";

abstract contract SsiModifiers is ERC1644Modifiers {
    // ===== SSI Modifiers =====
    modifier onlyIssuerListed(address _issuer) virtual;
}
