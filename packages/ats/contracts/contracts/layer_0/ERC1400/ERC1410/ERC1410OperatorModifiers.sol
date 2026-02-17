// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SsiModifiers } from "../../core/ssi/SsiModifiers.sol";

abstract contract ERC1410OperatorModifiers is SsiModifiers {
    // ===== ERC1410 Operator Modifiers =====
    modifier onlyOperator(bytes32 _partition, address _from) virtual;
}
