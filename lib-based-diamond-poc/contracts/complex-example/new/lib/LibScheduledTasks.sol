// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "../../storage/ComplexStorage.sol";
import "./LibABAF.sol";              // ← For BALANCE_ADJUSTMENT tasks
import "./LibSnapshots.sol";         // ← For SNAPSHOT tasks
import "./LibBond.sol";              // ← For COUPON_LISTING tasks
import "./LibCorporateActions.sol";  // ← To record each triggered task

/// @title LibScheduledTasks — Cross-ordered task orchestration (80 lines of logic)
/// @notice Manages and executes scheduled tasks in chronological order.
///
/// @dev THIS IS THE COMPOSITION SHOWCASE.
///
///   This single library coordinates FOUR other libraries:
///     LibScheduledTasks → LibABAF              (balance adjustment tasks)
///     LibScheduledTasks → LibSnapshots          (snapshot tasks)
///     LibScheduledTasks → LibBond               (coupon listing tasks)
///     LibScheduledTasks → LibCorporateActions   (recording task execution)
///
///   In the OLD architecture, _executeScheduledTask() lives inside
///   OldInternals alongside ALL other functions. You can't tell that
///   scheduled tasks orchestrate ABAF + Snapshots + Coupons without
///   reading the entire 400+ line file.
///
///   Here? The imports at the top tell you EVERYTHING:
///     "This library touches: ABAF, Snapshots, Bond data, and Corporate Actions."
///   That's it. No guessing. No grep. No scrolling through 400 lines.
///
///   CROSS-ORDERED EXECUTION:
///   Tasks are sorted by timestamp. When triggered, they execute in order
///   regardless of type. This means a snapshot ALWAYS happens before a
///   coupon listing if scheduled first — critical for data consistency.
library LibScheduledTasks {
    error NoScheduledTasks();
    error TaskNotYetDue(uint256 taskTimestamp, uint256 currentTimestamp);
    error InvalidTimestamp();
    event ScheduledTaskTriggered(uint256 indexed taskIndex, ScheduledTaskType taskType);

    /// @dev Add a task, maintaining chronological sort order
    function addTask(ScheduledTask memory task) internal {
        if (task.timestamp == 0 || task.timestamp <= block.timestamp) revert InvalidTimestamp();

        ScheduledTasksStorage storage sts = scheduledTasksStorage();
        sts.tasks.push(task);
        // Bubble-sort insert (tasks are usually added in order)
        uint256 i = sts.tasks.length - 1;
        while (i > 0 && sts.tasks[i].timestamp < sts.tasks[i - 1].timestamp) {
            ScheduledTask memory temp = sts.tasks[i];
            sts.tasks[i] = sts.tasks[i - 1];
            sts.tasks[i - 1] = temp;
            i--;
        }
    }

    /// @dev Trigger ALL pending tasks (those with timestamp <= now)
    /// COMPOSITION: delegates to LibABAF, LibSnapshots, LibBond, LibCorporateActions
    function triggerPendingTasks() internal returns (uint256 triggered) {
        ScheduledTasksStorage storage sts = scheduledTasksStorage();
        uint256 index = sts.lastTriggeredIndex;

        while (index < sts.tasks.length && sts.tasks[index].timestamp <= block.timestamp) {
            executeTask(sts.tasks[index], index);
            index++;
            triggered++;
        }

        sts.lastTriggeredIndex = index;
    }

    /// @dev Trigger up to `max` pending tasks
    function triggerTasks(uint256 max) internal returns (uint256 triggered) {
        ScheduledTasksStorage storage sts = scheduledTasksStorage();
        uint256 index = sts.lastTriggeredIndex;

        while (triggered < max && index < sts.tasks.length &&
               sts.tasks[index].timestamp <= block.timestamp) {
            executeTask(sts.tasks[index], index);
            index++;
            triggered++;
        }

        sts.lastTriggeredIndex = index;
    }

    /// @dev Execute a single task — THE COMPOSITION HUB
    ///
    ///   BALANCE_ADJUSTMENT → LibABAF.updateAbaf() + LibCorporateActions.registerAction()
    ///   SNAPSHOT           → LibSnapshots.takeSnapshot() + LibCorporateActions.registerAction()
    ///   COUPON_LISTING     → LibSnapshots.takeSnapshot() + LibBond.setCouponSnapshotId()
    ///
    ///   Each path is EXPLICIT and TRACEABLE. Compare to OldInternals where
    ///   _executeScheduledTask() calls _updateAbaf(), _takeSnapshot(),
    ///   _setCouponSnapshotId(), _registerCorporateAction() — all just
    ///   unadorned function names with no indication of which "section" they're from.
    function executeTask(ScheduledTask memory task, uint256 index) internal {
        if (task.taskType == ScheduledTaskType.BALANCE_ADJUSTMENT) {
            // COMPOSITION: LibABAF for adjustment + LibCorporateActions for recording
            (uint256 factor, ) = abi.decode(task.data, (uint256, uint8));
            LibABAF.updateAbaf(factor);
            LibCorporateActions.registerAction(
                ADJUSTMENT_ACTION_TYPE, task.data, abi.encode(factor)
            );

        } else if (task.taskType == ScheduledTaskType.SNAPSHOT) {
            // COMPOSITION: LibSnapshots + LibCorporateActions
            uint256 snapshotId = LibSnapshots.takeSnapshot();
            LibCorporateActions.registerAction(
                SNAPSHOT_ACTION_TYPE, task.data, abi.encode(snapshotId)
            );

        } else if (task.taskType == ScheduledTaskType.COUPON_LISTING) {
            // COMPOSITION: LibSnapshots + LibBond
            uint256 couponId = abi.decode(task.data, (uint256));
            uint256 snapshotId = LibSnapshots.takeSnapshot();
            LibBond.setCouponSnapshotId(couponId, snapshotId);
        }

        emit ScheduledTaskTriggered(index, task.taskType);
    }

    // ─── View functions ─────────────────────────────────────────────────

    function getTaskCount() internal view returns (uint256) {
        return scheduledTasksStorage().tasks.length;
    }

    function getTask(uint256 index) internal view returns (ScheduledTask memory) {
        return scheduledTasksStorage().tasks[index];
    }

    function getPendingCount() internal view returns (uint256) {
        ScheduledTasksStorage storage sts = scheduledTasksStorage();
        uint256 pending = 0;
        for (uint256 i = sts.lastTriggeredIndex; i < sts.tasks.length; i++) {
            if (sts.tasks[i].timestamp <= block.timestamp) pending++;
            else break;
        }
        return pending;
    }
}
