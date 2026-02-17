// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { PauseModifiers } from "../../core/pause/PauseModifiers.sol";

abstract contract ERC1410Modifiers is PauseModifiers {
    // ===== ERC1410 Modifiers =====
    modifier validateAddress(address account) virtual;
    modifier onlyDefaultPartitionWithSinglePartition(bytes32 partition) virtual;
}
