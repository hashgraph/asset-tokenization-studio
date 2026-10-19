// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { PauseStorageWrapper } from "../core/PauseStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../asset/ScheduledTasksStorageWrapper.sol";

/// @title ScheduledTasksOps - Orchestrator for scheduled-task triggering
/// @author Asset Tokenization Studio Team
/// @notice Deployed once as a separate contract. Facets and storage wrappers call via
/// DELEGATECALL, keeping their bytecode out of the 24 KB EIP-170 limit. The body of
/// `ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks` (a fat loop) is inlined
/// here exactly once.
/// @dev Replaces the legacy `ScheduledTasksStorageWrapper.callTriggerPendingScheduledCrossOrderedTasks`
/// self-CALL helper. The selector-based self-CALL added one diamond fallback dispatch per
/// invocation (~2700 gas); DELEGATECALL via the orchestrator address is ~700 gas and bypasses
/// the dispatch while preserving `msg.sender`.
library ScheduledTasksOps {
    /// @notice Trigger every pending cross-ordered task whose timestamp has elapsed.
    /// @dev Maps to `ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks(0)`.
    /// Idempotent when no tasks are pending. Used by ERC-1410 transfer paths,
    /// ERC-20-Votes delegation, NominalValue setters, KPI-linked-rate setters, and
    /// proceed-recipient management flows.
    /// @dev Reverts with `IsPaused` when the token is paused. This preserves the
    /// pause-revert behaviour of the legacy self-CALL helper, which transited the
    /// diamond fallback to `ScheduledCrossOrderedTasks.triggerPendingScheduledCrossOrderedTasks()`
    /// — an `onlyUnpaused`-gated facet entry point. Several caller facets (Burn,
    /// Transfer, ERC1594, BurnByPartition) relied on this cascading pause guard
    /// rather than declaring their own `onlyUnpaused`; retaining the check here
    /// keeps their pause semantics intact at the orchestrator boundary.
    /// @return processed_ Count of tasks dispatched in this call.
    function triggerPendingScheduledCrossOrderedTasks() external returns (uint256 processed_) {
        PauseStorageWrapper.checkUnpaused();
        return ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks(0);
    }
}
