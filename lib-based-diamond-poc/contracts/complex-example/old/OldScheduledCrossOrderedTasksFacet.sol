// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "./OldInternals.sol";

// ═══════════════════════════════════════════════════════════════════════════════
// OLD APPROACH: ScheduledCrossOrderedTasksFacet
//
// Coordinates execution of multiple scheduled task types in chronological order:
//   - Balance adjustments (ABAF updates)
//   - Snapshots
//   - Coupon listings
//
// ❌ Inherits ALL of OldInternals — but only uses ~6 functions:
//    _triggerPendingScheduledTasks(), _getPendingTaskCount(),
//    _getScheduledTaskCount(), _getScheduledTask(),
//    _requireNotPaused(), _checkRole()
//
// The other 54+ functions? Dead weight in the source code. The compiler
// removes them from bytecode, but they pollute the codebase:
//   → 60+ functions an auditor must verify are NOT called
//   → 60+ functions that show up in IDE autocomplete
//   → 60+ functions that could be accidentally called
// ═══════════════════════════════════════════════════════════════════════════════

contract OldScheduledCrossOrderedTasksFacet is OldInternals {

    /// @notice Trigger ALL pending scheduled tasks (ABAF + Snapshots + Coupons)
    /// Tasks are executed in chronological order regardless of type.
    function triggerPendingScheduledCrossOrderedTasks()
        external
        onlyRole(SCHEDULER_ROLE)
        onlyUnpaused()
        returns (uint256 triggered)
    {
        // This single call cascades into:
        //   → _executeScheduledTask() → _updateAbaf() (for BALANCE_ADJUSTMENT)
        //   → _executeScheduledTask() → _takeSnapshot() (for SNAPSHOT)
        //   → _executeScheduledTask() → _setCouponSnapshotId() (for COUPON_LISTING)
        //   → _registerCorporateAction() (for each)
        // ALL invisible from this file. You'd need to read OldInternals to know.
        return _triggerPendingScheduledTasks();
    }

    /// @notice Trigger up to `max` scheduled tasks
    function triggerScheduledCrossOrderedTasks(uint256 max)
        external
        onlyRole(SCHEDULER_ROLE)
        onlyUnpaused()
        returns (uint256 triggered)
    {
        ScheduledTasksStorage storage sts = scheduledTasksStorage();
        uint256 index = sts.lastTriggeredIndex;

        while (triggered < max && index < sts.tasks.length &&
               sts.tasks[index].timestamp <= block.timestamp) {
            _executeScheduledTask(sts.tasks[index], index);
            index++;
            triggered++;
        }

        sts.lastTriggeredIndex = index;
    }

    function scheduledCrossOrderedTaskCount() external view returns (uint256) {
        return _getScheduledTaskCount();
    }

    function pendingCrossOrderedTaskCount() external view returns (uint256) {
        return _getPendingTaskCount();
    }
}
