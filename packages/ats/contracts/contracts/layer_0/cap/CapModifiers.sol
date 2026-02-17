// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledTasksModifiers } from "../scheduledTasks/ScheduledTasksModifiers.sol";

abstract contract CapModifiers is ScheduledTasksModifiers {
    // ===== Cap Modifiers =====
    modifier onlyValidNewMaxSupply(uint256 _newMaxSupply) virtual;
    modifier onlyValidNewMaxSupplyByPartition(bytes32 _partition, uint256 _newMaxSupply) virtual;
    modifier onlyWithinMaxSupply(uint256 _amount) virtual;
    modifier onlyWithinMaxSupplyByPartition(bytes32 _partition, uint256 _amount) virtual;
}
