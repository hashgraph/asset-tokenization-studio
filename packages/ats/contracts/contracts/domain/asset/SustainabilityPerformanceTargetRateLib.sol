// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "../../facets/layer_2/bond/IBondRead.sol";
import {
    ISustainabilityPerformanceTargetRate
} from "../../facets/layer_2/interestRate/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
import { InterestRateStorageWrapper } from "./InterestRateStorageWrapper.sol";
import { KpisStorageWrapper } from "./KpisStorageWrapper.sol";
import { ProceedRecipientsStorageWrapper } from "./ProceedRecipientsStorageWrapper.sol";
import { BondStorageWrapper } from "./BondStorageWrapper.sol";

/**
 * @title SustainabilityPerformanceTargetRateLib
 * @dev Library for calculating Sustainability Performance Target (SPT) interest rates.
 * This library implements the rate calculation logic for bonds with sustainability performance targets.
 *
 * The rate is calculated based on:
 * - Base rate: The minimum rate that applies
 * - Start rate: The rate before the start period
 * - Impact data per project: Penalty or bonus adjustments based on KPI performance
 *
 * Rate calculation formula:
 * 1. If fixing date is before start period: use start rate
 * 2. Otherwise: base rate + total bonuses - total penalties
 */
library SustainabilityPerformanceTargetRateLib {
    /**
     * @dev Calculates the Sustainability Performance Target interest rate for a coupon.
     * @param couponID The ID of the coupon to calculate the rate for.
     * @param coupon The coupon data.
     * @return rate_ The calculated interest rate.
     * @return rateDecimals_ The decimals of the calculated rate.
     */
    function calculateSustainabilityPerformanceTargetInterestRate(
        uint256 couponID,
        IBondRead.Coupon memory coupon
    ) internal view returns (uint256 rate_, uint8 rateDecimals_) {
        // Get SPT interest rate configuration
        ISustainabilityPerformanceTargetRate.InterestRate memory interestRate = InterestRateStorageWrapper
            .getSPTInterestRate();

        // If fixing date is before start period, use start rate
        if (coupon.fixingDate < interestRate.startPeriod) {
            return (interestRate.startRate, interestRate.rateDecimals);
        }

        // Initialize with base rate
        rate_ = interestRate.baseRate;
        rateDecimals_ = interestRate.rateDecimals;

        // Get all proceed recipients (projects)
        uint256 projectCount = ProceedRecipientsStorageWrapper.getProceedRecipientsCount();
        uint256 totalRateToAdd = 0;
        uint256 totalRateToSubtract = 0;

        // Get previous fixing date for KPI data range
        uint256 previousFixingDate = _getPreviousFixingDate(couponID);

        // Iterate through all projects and calculate rate adjustments
        for (uint256 index = 0; index < projectCount; index++) {
            // Get project address
            address[] memory projects = ProceedRecipientsStorageWrapper.getProceedRecipients(index, 1);
            address project = projects[0];

            // Get impact data for this project
            ISustainabilityPerformanceTargetRate.ImpactData memory impactData = InterestRateStorageWrapper
                .getSPTImpactDataFor(project);

            // Get KPI data for the coupon period
            (uint256 value, bool exists) = KpisStorageWrapper.getLatestKpiData(
                previousFixingDate,
                coupon.fixingDate,
                project
            );

            // Calculate rate adjustment based on impact data mode
            if (impactData.impactDataMode == ISustainabilityPerformanceTargetRate.ImpactDataMode.PENALTY) {
                // Penalty mode: add to rate if KPI doesn't meet baseline
                if (!exists) {
                    // No KPI data: add penalty (project didn't report)
                    totalRateToAdd += impactData.deltaRate;
                    continue;
                }

                if (impactData.baseLineMode == ISustainabilityPerformanceTargetRate.BaseLineMode.MINIMUM) {
                    // Minimum baseline: penalty if value is below baseline
                    if (value < impactData.baseLine) {
                        totalRateToAdd += impactData.deltaRate;
                    }
                } else {
                    // Maximum baseline: penalty if value is above baseline
                    if (value > impactData.baseLine) {
                        totalRateToAdd += impactData.deltaRate;
                    }
                }
            } else {
                // Bonus mode: subtract from rate if KPI meets/exceeds target
                if (!exists) {
                    // No KPI data: no bonus
                    continue;
                }

                if (impactData.baseLineMode == ISustainabilityPerformanceTargetRate.BaseLineMode.MINIMUM) {
                    // Minimum baseline: bonus if value exceeds baseline
                    if (value > impactData.baseLine) {
                        totalRateToSubtract += impactData.deltaRate;
                    }
                } else {
                    // Maximum baseline: bonus if value is below baseline
                    if (value < impactData.baseLine) {
                        totalRateToSubtract += impactData.deltaRate;
                    }
                }
            }
        }

        // Calculate final rate
        rate_ += totalRateToAdd;

        // Ensure rate doesn't underflow
        if (rate_ > totalRateToSubtract) {
            rate_ -= totalRateToSubtract;
        } else {
            rate_ = 0;
        }
    }

    /**
     * @dev Gets the previous fixing date for calculating KPI data range.
     * @param couponID The ID of the current coupon.
     * @return fixingDate_ The fixing date of the previous coupon in the ordered list, or 0 if this is the first coupon.
     */
    function _getPreviousFixingDate(uint256 couponID) private view returns (uint256 fixingDate_) {
        uint256 previousCouponId = BondStorageWrapper.getPreviousCouponInOrderedList(couponID);

        if (previousCouponId == 0) {
            return 0;
        }

        IBondRead.RegisteredCoupon memory previousCoupon = BondStorageWrapper.getCoupon(previousCouponId);
        return previousCoupon.coupon.fixingDate;
    }
}
