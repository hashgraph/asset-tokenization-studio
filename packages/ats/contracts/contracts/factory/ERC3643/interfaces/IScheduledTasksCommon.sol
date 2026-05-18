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

/// @dev Generic ordered-task-queue layout. ScheduledTasksStorageWrapper instantiates this
///      struct at four independent ERC-7201 namespaces, one per task family:
///        - erc7201:security.token.standard.storage.ScheduledSnapshots
///        - erc7201:security.token.standard.storage.ScheduledCouponListing
///        - erc7201:security.token.standard.storage.ScheduledBalanceAdjustments
///        - erc7201:security.token.standard.storage.ScheduledCrossOrderedTasks
///      No single `@custom:storage-location` annotation can capture the four-slot binding;
///      tooling that needs per-slot layout resolution must consult the four storage-location
///      constants in ScheduledTasksStorageWrapper.sol directly.
struct ScheduledTasksDataStorage {
    mapping(uint256 => ScheduledTask) scheduledTasks;
    uint256 scheduledTaskCount;
}
