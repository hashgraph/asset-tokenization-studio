// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

// ═══════════════════════════════════════════════════════════════════════════════
// NEW APPROACH: CouponPaymentFacet with EXPLICIT library imports
//
// ✅ LOOK AT THE IMPORTS — they tell you EXACTLY what this facet can do:
//
//    LibPause            → pause checks
//    LibAccess           → role-based authorization
//    LibCompliance       → KYC verification for each holder
//    LibScheduledTasks   → trigger pending tasks before payment
//    LibBond             → coupon data (get, update, mark executed)
//    LibInterestRate     → KPI-linked rate calculation
//    LibSnapshots        → take record-date snapshot, get holder balances
//    LibCorporateActions → register the payment as corporate action
//
// That's 8 libraries. Compare to OLD: inherits 1 monster with 60+ functions
// across 10 sections. Here you know EXACTLY what this facet touches.
//
// ✅ "If I change LibABAF, is this facet affected?"
//    → LibABAF is NOT in the imports. So NO. Instant answer.
//    → (LibScheduledTasks uses LibABAF internally, but this facet
//       doesn't call ABAF directly — the composition is layered.)
//
// ✅ An auditor reads: 8 imports + 80 lines = complete picture.
//    vs. OLD: 1 import (OldInternals) + 400 lines of monster = ???
//
// ═══════════════════════════════════════════════════════════════════════════════

import "../../storage/ComplexStorage.sol";
import "../lib/LibPause.sol";
import "../lib/LibAccess.sol";
import "../lib/LibCompliance.sol";
import "../lib/LibScheduledTasks.sol";
import "../lib/LibBond.sol";
import "../lib/LibInterestRate.sol";
import "../lib/LibSnapshots.sol";
import "../lib/LibCorporateActions.sol";

contract NewCouponPaymentFacet {

    event CouponPaymentExecuted(uint256 indexed couponId, uint256 snapshotId, uint256 totalPaid);

    /// @notice Full coupon payment lifecycle — THE SAME LOGIC as OldCouponPaymentFacet
    ///         but with EXPLICIT, TRACEABLE composition.
    ///
    /// COMPOSITION FLOW:
    /// ┌─────────────────────────────────────────────────────────────────────┐
    /// │  executeCouponPayment(couponId)                                     │
    /// │    ├── LibAccess.checkRole()           ← WHO can call this         │
    /// │    ├── LibPause.requireNotPaused()     ← WHEN it can be called     │
    /// │    ├── LibScheduledTasks.triggerPendingTasks()                      │
    /// │    │     ├── LibABAF.updateAbaf()      ← adjustments first         │
    /// │    │     ├── LibSnapshots.takeSnapshot() ← then snapshots          │
    /// │    │     └── LibBond.setCouponSnapshotId() ← link to coupon        │
    /// │    ├── LibInterestRate.calculateKpiLinkedRate()                     │
    /// │    │     └── LibBond.getCoupon()        ← reads previous rate      │
    /// │    ├── LibBond.updateCouponRate()       ← sets calculated rate     │
    /// │    ├── LibSnapshots.takeSnapshot()      ← record-date snapshot     │
    /// │    ├── LibBond.setCouponSnapshotId()    ← link snapshot to coupon  │
    /// │    ├── FOR EACH HOLDER:                                             │
    /// │    │     ├── LibCompliance.requireCompliant() ← KYC check          │
    /// │    │     └── LibBond.calculateCouponAmount()                        │
    /// │    │           └── LibSnapshots.getSnapshotBalanceByPartition()     │
    /// │    ├── LibBond.markCouponExecuted()                                 │
    /// │    └── LibCorporateActions.registerAction() ← audit trail          │
    /// └─────────────────────────────────────────────────────────────────────┘
    ///
    /// EVERY dependency is visible. EVERY call is traceable. EVERY library
    /// is independently auditable, testable, and replaceable.
    function executeCouponPayment(uint256 couponId)
        external
        returns (uint256 totalPaid)
    {
        // Guards — EXPLICIT library calls, not hidden modifiers
        LibAccess.checkRole(COUPON_MANAGER_ROLE);
        LibPause.requireNotPaused();

        // STEP 1: Trigger all pending scheduled tasks first
        // LibScheduledTasks internally coordinates LibABAF + LibSnapshots + LibBond
        LibScheduledTasks.triggerPendingTasks();

        // STEP 2: Calculate KPI-linked interest rate
        // LibInterestRate internally reads LibBond for previous coupon data
        (uint256 rate, uint8 rateDecimals) = LibInterestRate.calculateKpiLinkedRate(couponId);

        // STEP 3: Set the calculated rate on the coupon
        LibBond.updateCouponRate(couponId, rate, rateDecimals);

        // STEP 4: Take record-date snapshot and link to coupon
        uint256 snapshotId = LibSnapshots.takeSnapshot();
        LibBond.setCouponSnapshotId(couponId, snapshotId);

        // STEP 5: Calculate payment for each holder at the snapshot
        address[] memory holders = LibSnapshots.getHoldersAtSnapshot(snapshotId);
        for (uint256 i = 0; i < holders.length; i++) {
            LibCompliance.requireCompliant(holders[i]);

            // Pass LibSnapshots.getSnapshotBalanceByPartition as a callback
            // This avoids LibBond needing to import LibSnapshots directly
            (uint256 numerator, uint256 denominator) = LibBond.calculateCouponAmount(
                couponId,
                holders[i],
                LibSnapshots.getSnapshotBalanceByPartition
            );

            totalPaid += numerator / denominator;
        }

        // STEP 6: Finalize — mark executed & register corporate action
        LibBond.markCouponExecuted(couponId);
        LibCorporateActions.registerAction(
            COUPON_ACTION_TYPE,
            abi.encode(couponId, rate, rateDecimals),
            abi.encode(snapshotId, totalPaid)
        );

        emit CouponPaymentExecuted(couponId, snapshotId, totalPaid);
    }

    /// @notice Schedule a future coupon payment (snapshot + listing tasks)
    function scheduleCouponPayment(
        uint256 couponId,
        uint256 recordDate,
        uint256 executionDate
    ) external {
        LibAccess.checkRole(SCHEDULER_ROLE);
        LibPause.requireNotPaused();

        // Schedule snapshot at record date
        LibScheduledTasks.addTask(ScheduledTask({
            timestamp: recordDate,
            taskType: ScheduledTaskType.SNAPSHOT,
            data: abi.encode(couponId)
        }));

        // Schedule coupon listing at execution date
        LibScheduledTasks.addTask(ScheduledTask({
            timestamp: executionDate,
            taskType: ScheduledTaskType.COUPON_LISTING,
            data: abi.encode(couponId)
        }));
    }

    /// @notice View: Get coupon payment amount for a specific holder
    function getCouponAmountFor(uint256 couponId, address holder)
        external view returns (uint256 numerator, uint256 denominator)
    {
        return LibBond.calculateCouponAmount(
            couponId, holder, LibSnapshots.getSnapshotBalanceByPartition
        );
    }
}
