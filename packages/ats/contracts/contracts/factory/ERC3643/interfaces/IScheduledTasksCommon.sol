// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

struct ScheduledTask {
    uint256 scheduledTimestamp;
    bytes data;
}

struct ScheduledTasksDataStorage {
    mapping(uint256 => ScheduledTask) scheduledTasks;
    uint256 scheduledTaskCount;
}
