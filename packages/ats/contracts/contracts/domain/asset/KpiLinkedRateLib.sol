// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "../../facets/layer_2/bond/IBondRead.sol";
import { IKpiLinkedRate } from "../../facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRate.sol";
import { InterestRateStorageWrapper, KpiLinkedRateDataStorage } from "./InterestRateStorageWrapper.sol";
import { KpisStorageWrapper } from "./KpisStorageWrapper.sol";
import { ProceedRecipientsStorageWrapper } from "./ProceedRecipientsStorageWrapper.sol";
import { BondStorageWrapper } from "./BondStorageWrapper.sol";
import { DecimalsLib } from "../../infrastructure/utils/DecimalsLib.sol";

/**
 * @title KpiLinkedRateLib
 * @dev Library for calculating KPI-linked interest rates.
 * This library implements the rate calculation logic for bonds with KPI-linked rates.
 *
 * The rate is calculated based on:
 * - Start rate: Rate applied before the start period
 * - Base rate: The target rate at baseline impact
 * - Min/Max rate: Rate boundaries
 * - Impact data: Aggregate KPI data from all proceed recipients
 * - Missed penalty: Applied when no KPI report is found
 *
 * Rate calculation formula:
 * 1. If fixing date is before start period: use start rate
 * 2. If no KPI report found: previousRate + missedPenalty (capped at maxRate)
 * 3. If KPI report found: proportional calculation between min/base/max based on impact vs baseline
 */
library KpiLinkedRateLib {
    /**
     * @dev Calculates the KPI-linked interest rate for a coupon.
     * @param couponID The ID of the coupon to calculate the rate for.
     * @param coupon The coupon data.
     * @return rate_ The calculated interest rate.
     * @return rateDecimals_ The decimals of the calculated rate.
     */
    function calculateKpiLinkedInterestRate(
        uint256 couponID,
        IBondRead.Coupon memory coupon
    ) internal view returns (uint256 rate_, uint8 rateDecimals_) {
        // Get KPI interest rate configuration
        KpiLinkedRateDataStorage memory kpiData = InterestRateStorageWrapper.kpiLinkedRateStorage();

        // Before start period → use start rate
        if (coupon.fixingDate < kpiData.startPeriod) {
            return (kpiData.startRate, kpiData.rateDecimals);
        }

        // Gather KPI data from all projects
        uint256 projectCount = ProceedRecipientsStorageWrapper.getProceedRecipientsCount();
        uint256 impactData = 0;
        bool reportFound = false;

        for (uint256 index = 0; index < projectCount; ) {
            // Get project address
            address[] memory projects = ProceedRecipientsStorageWrapper.getProceedRecipients(index, 1);

            // Get latest KPI data within the report period
            (uint256 value, bool exists) = KpisStorageWrapper.getLatestKpiData(
                coupon.fixingDate - kpiData.reportPeriod,
                coupon.fixingDate,
                projects[0]
            );

            if (exists) {
                impactData += value;
                if (!reportFound) reportFound = true;
            }

            unchecked {
                ++index;
            }
        }

        // No report → previousRate + missedPenalty (capped at maxRate)
        if (!reportFound) {
            (uint256 previousRate, uint8 previousRateDecimals) = _previousRate(couponID);

            // Adjust decimals to match current rate decimals
            uint256 adjustedPreviousRate = DecimalsLib.calculateDecimalsAdjustment(
                previousRate,
                previousRateDecimals,
                kpiData.rateDecimals
            );

            rate_ = adjustedPreviousRate + kpiData.missedPenalty;

            // Cap at maxRate
            if (rate_ > kpiData.maxRate) {
                rate_ = kpiData.maxRate;
            }

            return (rate_, kpiData.rateDecimals);
        }

        // Report found → calculate based on impact vs baseline
        uint256 factor = 10 ** kpiData.adjustmentPrecision;
        uint256 impactDeltaRate;

        if (kpiData.baseLine > impactData) {
            // Below baseline: rate decreases from baseRate toward minRate
            impactDeltaRate =
                (factor * (kpiData.baseLine - impactData)) /
                (kpiData.baseLine - kpiData.maxDeviationFloor);

            if (impactDeltaRate > factor) {
                impactDeltaRate = factor;
            }

            rate_ = kpiData.baseRate - (((kpiData.baseRate - kpiData.minRate) * impactDeltaRate) / factor);
        } else {
            // Above baseline: rate increases from baseRate toward maxRate
            impactDeltaRate = (factor * (impactData - kpiData.baseLine)) / (kpiData.maxDeviationCap - kpiData.baseLine);

            if (impactDeltaRate > factor) {
                impactDeltaRate = factor;
            }

            rate_ = kpiData.baseRate + (((kpiData.maxRate - kpiData.baseRate) * impactDeltaRate) / factor);
        }

        rateDecimals_ = kpiData.rateDecimals;
    }

    /**
     * @dev Gets the rate from the previous coupon in the ordered list.
     * @param couponID The ID of the current coupon.
     * @return rate_ The rate of the previous coupon, or 0 if this is the first coupon.
     * @return rateDecimals_ The decimals of the previous coupon rate.
     */
    function _previousRate(uint256 couponID) private view returns (uint256 rate_, uint8 rateDecimals_) {
        uint256 previousCouponId = BondStorageWrapper.getPreviousCouponInOrderedList(couponID);

        if (previousCouponId == 0) {
            return (0, 0);
        }

        IBondRead.RegisteredCoupon memory previousCoupon = BondStorageWrapper.getCoupon(previousCouponId);

        // Previous coupon rate must be set
        assert(previousCoupon.coupon.rateStatus == IBondRead.RateCalculationStatus.SET);

        return (previousCoupon.coupon.rate, previousCoupon.coupon.rateDecimals);
    }
}
