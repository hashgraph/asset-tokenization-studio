// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/scheduledTasksCommon/IScheduledTasksCommon.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

/**
 * @notice A single scheduled-task queue entry.
 * @dev Value-object used as both the mapping value in the on-chain queue layout and as the
 *      element type of the array returned by `getScheduledTasks(...)`.
 * @param scheduledTimestamp Unix timestamp at which the task becomes due.
 * @param data Opaque payload consumed by the task executor.
 */
struct ScheduledTask {
    uint256 scheduledTimestamp;
    bytes data;
}
