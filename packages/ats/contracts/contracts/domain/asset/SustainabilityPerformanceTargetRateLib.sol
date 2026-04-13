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
import { IBondTypes } from "../../facets/layer_2/bond/IBondTypes.sol";

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
    function calculateSustainabilityPerformanceTargetInterestRate(
        uint256 couponID,
        IBondRead.Coupon memory coupon
    ) internal view returns (uint256, uint8) {
        ISustainabilityPerformanceTargetRate.InterestRate memory interestRate = InterestRateStorageWrapper
            .getSPTInterestRate();

        if (coupon.fixingDate < interestRate.startPeriod) {
            return (interestRate.startRate, interestRate.rateDecimals);
        }

        uint256 previousFixingDate = _getPreviousFixingDate(couponID);
        uint256 projectCount = ProceedRecipientsStorageWrapper.getProceedRecipientsCount();

        uint256 totalPenaltyRate;
        uint256 totalBonusRate;

        for (uint256 index; index < projectCount; ) {
            address project = ProceedRecipientsStorageWrapper.getProceedRecipients(index, 1)[0];
            ISustainabilityPerformanceTargetRate.ImpactData memory impactData = InterestRateStorageWrapper
                .getSPTImpactDataFor(project);

            (uint256 kpiValue, bool kpiExists) = KpisStorageWrapper.getLatestKpiData(
                previousFixingDate,
                coupon.fixingDate,
                project
            );

            (uint256 penaltyRate, uint256 bonusRate) = _calculateRateAdjustmentForProject(
                impactData,
                kpiValue,
                kpiExists
            );

            totalPenaltyRate += penaltyRate;
            totalBonusRate += bonusRate;
            unchecked {
                ++index;
            }
        }

        return (
            _applyRateAdjustments(interestRate.baseRate, totalPenaltyRate, totalBonusRate),
            interestRate.rateDecimals
        );
    }

    function _calculateRateAdjustmentForProject(
        ISustainabilityPerformanceTargetRate.ImpactData memory impactData,
        uint256 kpiValue,
        bool kpiExists
    ) internal pure returns (uint256 penaltyRate_, uint256 bonusRate_) {
        if (impactData.impactDataMode == ISustainabilityPerformanceTargetRate.ImpactDataMode.PENALTY) {
            if (_shouldApplyPenalty(impactData, kpiValue, kpiExists)) penaltyRate_ = impactData.deltaRate;
            return (penaltyRate_, 0);
        }

        if (_shouldApplyBonus(impactData, kpiValue, kpiExists)) bonusRate_ = impactData.deltaRate;

        return (0, bonusRate_);
    }

    function _shouldApplyPenalty(
        ISustainabilityPerformanceTargetRate.ImpactData memory impactData,
        uint256 kpiValue,
        bool kpiExists
    ) internal pure returns (bool) {
        if (!kpiExists) return true;

        if (impactData.baseLineMode == ISustainabilityPerformanceTargetRate.BaseLineMode.MINIMUM)
            return kpiValue < impactData.baseLine;

        return kpiValue > impactData.baseLine;
    }

    function _shouldApplyBonus(
        ISustainabilityPerformanceTargetRate.ImpactData memory impactData,
        uint256 kpiValue,
        bool kpiExists
    ) internal pure returns (bool) {
        if (!kpiExists) return false;

        if (impactData.baseLineMode == ISustainabilityPerformanceTargetRate.BaseLineMode.MINIMUM)
            return kpiValue > impactData.baseLine;

        return kpiValue < impactData.baseLine;
    }

    function _applyRateAdjustments(
        uint256 baseRate,
        uint256 totalPenaltyRate,
        uint256 totalBonusRate
    ) internal pure returns (uint256 rate_) {
        unchecked {
            rate_ = baseRate + totalPenaltyRate;
            return rate_ > totalBonusRate ? rate_ - totalBonusRate : 0;
        }
    }

    /**
     * @dev Gets the previous fixing date for calculating KPI data range.
     * @param couponID The ID of the current coupon.
     * @return fixingDate_ The fixing date of the previous coupon in the ordered list, or 0 if this is the first coupon.
     */
    function _getPreviousFixingDate(uint256 couponID) private view returns (uint256 fixingDate_) {
        uint256 previousCouponId = BondStorageWrapper.getPreviousCouponInOrderedList(couponID);
        if (previousCouponId == 0) return 0;
        (IBondTypes.RegisteredCoupon memory registeredCoupon, , ) = BondStorageWrapper.getCoupon(previousCouponId);
        return registeredCoupon.coupon.fixingDate;
    }
}
