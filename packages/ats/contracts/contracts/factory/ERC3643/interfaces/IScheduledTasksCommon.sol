// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

struct ScheduledTask {
    uint256 scheduledTimestamp;
    bytes data;
}

struct ScheduledTasksDataStorage {
    mapping(uint256 => ScheduledTask) scheduledTasks;
    uint256 scheduledTaskCount;
}
