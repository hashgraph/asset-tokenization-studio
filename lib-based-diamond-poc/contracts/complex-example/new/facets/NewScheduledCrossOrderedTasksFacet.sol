// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

// ═══════════════════════════════════════════════════════════════════════════════
// NEW APPROACH: ScheduledCrossOrderedTasksFacet
//
// ✅ IMPORTS TELL THE STORY:
//    LibPause          → pause checks
//    LibAccess         → role authorization
//    LibScheduledTasks → THE ONLY business logic this facet orchestrates
//
// That's 3 libraries. The OLD version inherits 60+ functions.
//
// ✅ "What does this facet do?"
//    → Triggers scheduled tasks. That's it. Look at the 3 imports.
//
// ✅ "What libraries does LibScheduledTasks use internally?"
//    → Open LibScheduledTasks.sol, read its 4 imports:
//      LibABAF, LibSnapshots, LibBond, LibCorporateActions
//    → LAYERED composition. This facet doesn't know about ABAF directly.
//      It delegates to LibScheduledTasks, which delegates further.
//
// ═══════════════════════════════════════════════════════════════════════════════

import "../../storage/ComplexStorage.sol";
import "../lib/LibPause.sol";
import "../lib/LibAccess.sol";
import "../lib/LibScheduledTasks.sol";

contract NewScheduledCrossOrderedTasksFacet {

    /// @notice Trigger ALL pending scheduled tasks
    /// Internally, LibScheduledTasks orchestrates:
    ///   BALANCE_ADJUSTMENT → LibABAF.updateAbaf()
    ///   SNAPSHOT           → LibSnapshots.takeSnapshot()
    ///   COUPON_LISTING     → LibSnapshots.takeSnapshot() + LibBond.setCouponSnapshotId()
    function triggerPendingScheduledCrossOrderedTasks()
        external returns (uint256 triggered)
    {
        LibAccess.checkRole(SCHEDULER_ROLE);
        LibPause.requireNotPaused();
        return LibScheduledTasks.triggerPendingTasks();
    }

    /// @notice Trigger up to `max` pending tasks (gas-bounded execution)
    function triggerScheduledCrossOrderedTasks(uint256 max)
        external returns (uint256 triggered)
    {
        LibAccess.checkRole(SCHEDULER_ROLE);
        LibPause.requireNotPaused();
        return LibScheduledTasks.triggerTasks(max);
    }

    /// @notice View: total scheduled tasks
    function scheduledCrossOrderedTaskCount() external view returns (uint256) {
        return LibScheduledTasks.getTaskCount();
    }

    /// @notice View: pending (due) tasks
    function pendingCrossOrderedTaskCount() external view returns (uint256) {
        return LibScheduledTasks.getPendingCount();
    }

    /// @notice View: get a specific task
    function getScheduledTask(uint256 index) external view returns (ScheduledTask memory) {
        return LibScheduledTasks.getTask(index);
    }
}
