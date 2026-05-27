// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

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
