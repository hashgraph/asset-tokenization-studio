// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "../../storage/ComplexStorage.sol";
import "./LibBond.sol";  // ← EXPLICIT: reads coupon data and previous rates

/// @title LibInterestRate — KPI-linked interest rate calculation (85 lines of logic)
/// @notice Calculates interest rates based on KPI performance reports.
///
/// @dev COMPOSITION: LibInterestRate → LibBond (to read coupon/previous rate data)
///
///   This is where the power of library composition really shines.
///   In the OLD architecture, this rate calculation logic lives INSIDE
///   the same Internals.sol as pause, access, transfers, snapshots...
///   An auditor reviewing interest rate logic must navigate 400+ lines.
///
///   Here? Just this file + LibBond. That's it. 85 + 65 = 150 lines total.
library LibInterestRate {
    event KpiReportSubmitted(address indexed project, uint256 value, uint256 timestamp);

    /// @dev Calculate KPI-linked rate for a coupon
    /// COMPOSITION: calls LibBond.getCoupon() for coupon data
    function calculateKpiLinkedRate(uint256 couponId)
        internal view returns (uint256 rate, uint8 rateDecimals)
    {
        InterestRateStorage storage irs = interestRateStorage();
        Coupon memory coupon = LibBond.getCoupon(couponId);
        KpiLinkedRateConfig memory config = irs.config;

        // Before start period → use start rate
        if (coupon.fixingDate < config.startPeriod) {
            return (config.startRate, config.rateDecimals);
        }

        // Get previous coupon rate via LibBond — COMPOSITION
        uint256 previousRate = config.startRate;
        if (couponId > 1) {
            Coupon memory prevCoupon = LibBond.getCoupon(couponId - 1);
            if (prevCoupon.rateStatus != RateCalculationStatus.PENDING) {
                previousRate = prevCoupon.rate;
            }
        }

        // Check KPI reports from all projects
        bool reportFound = false;
        uint256 totalDeviation = 0;
        uint256 projectCount = irs.kpiProjects.length;

        for (uint256 i = 0; i < projectCount; i++) {
            KpiReport[] storage reports = irs.kpiReports[irs.kpiProjects[i]];
            for (uint256 j = reports.length; j > 0; j--) {
                if (reports[j - 1].timestamp <= coupon.fixingDate &&
                    reports[j - 1].timestamp >= coupon.fixingDate - config.reportPeriod) {
                    reportFound = true;
                    KpiImpactData memory impact = irs.impactData;
                    uint256 deviation;
                    if (reports[j - 1].value > impact.baseLine) {
                        deviation = reports[j - 1].value - impact.baseLine;
                        if (deviation > impact.maxDeviationCap) deviation = impact.maxDeviationCap;
                    } else {
                        deviation = impact.baseLine - reports[j - 1].value;
                        if (deviation > impact.maxDeviationFloor) deviation = impact.maxDeviationFloor;
                    }
                    totalDeviation += deviation;
                    break;
                }
            }
        }

        // No report → apply missed penalty
        if (!reportFound) {
            rate = previousRate + config.missedPenalty;
            if (rate > config.maxRate) rate = config.maxRate;
            return (rate, config.rateDecimals);
        }

        // Calculate rate adjustment based on KPI deviation
        uint256 adjustment = (totalDeviation * config.baseRate) /
            (irs.impactData.adjustmentPrecision * projectCount);
        rate = previousRate > adjustment ? previousRate - adjustment : 0;

        // Clamp to [minRate, maxRate]
        if (rate < config.minRate) rate = config.minRate;
        if (rate > config.maxRate) rate = config.maxRate;
        rateDecimals = config.rateDecimals;
    }

    function submitKpiReport(address project, uint256 value) internal {
        InterestRateStorage storage irs = interestRateStorage();
        irs.kpiReports[project].push(KpiReport({
            value: value,
            timestamp: block.timestamp,
            exists: true
        }));
        emit KpiReportSubmitted(project, value, block.timestamp);
    }

    function getConfig() internal view returns (KpiLinkedRateConfig memory) {
        return interestRateStorage().config;
    }

    function getImpactData() internal view returns (KpiImpactData memory) {
        return interestRateStorage().impactData;
    }
}
