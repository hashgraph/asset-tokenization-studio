// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CommonModifiers } from "../common/CommonModifiers.sol";

abstract contract ScheduledTasksModifiers is CommonModifiers {
    // ===== ScheduledTasks Modifiers =====
    modifier onlyValidTimestamp(uint256 _timestamp) virtual;
}
