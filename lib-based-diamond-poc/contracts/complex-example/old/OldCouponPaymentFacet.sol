// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "./OldInternals.sol";

// ═══════════════════════════════════════════════════════════════════════════════
// OLD APPROACH: CouponPaymentFacet inherits the ENTIRE Internals monster
//
// ❌ PROBLEM 1: "What can this facet do?"
//    → Read 400+ lines of OldInternals to find out.
//    → Answer: EVERYTHING. It can pause, unpause, grant roles, transfer tokens,
//      adjust balances, take snapshots, submit KPI reports, schedule tasks,
//      register corporate actions... even though it only NEEDS ~15 functions.
//
// ❌ PROBLEM 2: "What functions from Internals does this facet actually use?"
//    → You have to read every line of this file to find internal calls.
//    → There's no import list to give you a quick answer.
//
// ❌ PROBLEM 3: "If I change _updateAbaf(), what facets are affected?"
//    → ALL 152 facets, because they ALL inherit Internals.
//    → No way to know which ones actually call it without grep.
//
// ═══════════════════════════════════════════════════════════════════════════════

contract OldCouponPaymentFacet is OldInternals {
    // ┌─────────────────────────────────────────────────────────────────────┐
    // │ LOOK: We inherit OldInternals. That's 400+ lines, 10 sections,    │
    // │ 60+ functions. This facet uses maybe 15 of them.                  │
    // │                                                                    │
    // │ An auditor reading this file has NO IDEA which 15 without         │
    // │ carefully reading every line below.                                │
    // └─────────────────────────────────────────────────────────────────────┘

    /// @notice Full coupon payment lifecycle:
    ///   1. Trigger all pending scheduled tasks (ABAF adjustments + snapshots)
    ///   2. Calculate the KPI-linked interest rate for this coupon
    ///   3. Set the coupon rate
    ///   4. Take a final snapshot for the record date
    ///   5. Calculate payments for all holders at the snapshot
    ///   6. Register as corporate action
    function executeCouponPayment(uint256 couponId)
        external
        onlyRole(COUPON_MANAGER_ROLE)    // from Internals section 2
        onlyUnpaused()                    // from Internals section 1
        returns (uint256 totalPaid)
    {
        // STEP 1: Trigger all pending scheduled tasks first.
        //   This calls into: _triggerPendingScheduledTasks() → _executeScheduledTask()
        //   Which calls: _updateAbaf() (section 5), _takeSnapshot() (section 6),
        //                _registerCorporateAction() (section 10)
        //   Hidden dependency chain: 3 sections, 8 functions, INVISIBLE from imports.
        _triggerPendingScheduledTasks();

        // STEP 2: Get coupon data and calculate interest rate
        Coupon memory coupon = _getCoupon(couponId);  // section 7

        // Calculate KPI-linked rate (section 8)
        // This internally reads: interestRateStorage, bondStorage (for previous coupon),
        // kpiReports... NONE of which is visible from the function signature.
        (uint256 rate, uint8 rateDecimals) = _calculateKpiLinkedRate(couponId);

        // STEP 3: Set the rate on the coupon
        _updateCouponRate(couponId, rate, rateDecimals);  // section 7

        // STEP 4: Take a snapshot at record date for holder balances
        // This needs: ERC1410 (section 4) for holder list + balances
        //             ABAF (section 5) for adjusted values
        uint256 snapshotId = _takeSnapshot();  // section 6
        _setCouponSnapshotId(couponId, snapshotId);  // section 7

        // STEP 5: Calculate payment for each holder
        address[] memory holders = _getHoldersAtSnapshot(snapshotId);  // section 6
        for (uint256 i = 0; i < holders.length; i++) {
            _requireCompliant(holders[i]);  // section 3

            // Calculate amount based on ABAF-adjusted snapshot balance
            (uint256 numerator, uint256 denominator) =
                _calculateCouponAmount(couponId, holders[i]);  // section 7
            //   ↑ THIS function internally calls:
            //     _getCoupon() (section 7)
            //     _getSnapshotBalanceByPartition() (section 6)
            //     Which uses snapshotStorage... INVISIBLE from here.

            totalPaid += numerator / denominator;
        }

        // STEP 6: Mark coupon as executed & register corporate action
        _markCouponExecuted(couponId);  // section 7
        _registerCorporateAction(        // section 10
            COUPON_ACTION_TYPE,
            abi.encode(couponId, rate, rateDecimals),
            abi.encode(snapshotId, totalPaid)
        );

        emit CouponPaymentExecuted(couponId, snapshotId, totalPaid);
    }

    /// @notice Schedule a future coupon payment.
    /// Creates scheduled tasks for: snapshot at record date, coupon listing.
    function scheduleCouponPayment(
        uint256 couponId,
        uint256 recordDate,
        uint256 executionDate
    )
        external
        onlyRole(SCHEDULER_ROLE)
        onlyUnpaused()
        onlyValidTimestamp(recordDate)
    {
        // Schedule a snapshot task before the coupon record date
        _addScheduledTask(ScheduledTask({
            timestamp: recordDate,
            taskType: ScheduledTaskType.SNAPSHOT,
            data: abi.encode(couponId)
        }));

        // Schedule coupon listing at execution date
        _addScheduledTask(ScheduledTask({
            timestamp: executionDate,
            taskType: ScheduledTaskType.COUPON_LISTING,
            data: abi.encode(couponId)
        }));
    }

    /// @notice View: Get coupon payment amount for a specific holder
    function getCouponAmountFor(uint256 couponId, address holder)
        external view returns (uint256 numerator, uint256 denominator)
    {
        return _calculateCouponAmount(couponId, holder);
    }
}
