// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICouponTypes } from "../../facets/layer_2/coupon/ICouponTypes.sol";
import { InterestRateStorageWrapper, KpiLinkedRateDataStorage } from "./InterestRateStorageWrapper.sol";
import { KpisStorageWrapper } from "./KpisStorageWrapper.sol";
import { ProceedRecipientsStorageWrapper } from "./ProceedRecipientsStorageWrapper.sol";
import { CouponStorageWrapper } from "./coupon/CouponStorageWrapper.sol";
import { DecimalsLib } from "../../infrastructure/utils/DecimalsLib.sol";
import { KPI_LINKED_RATE_COUPON } from "../../constants/values.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

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
        ICouponTypes.Coupon memory coupon
    ) internal view returns (uint256 rate_, uint8 rateDecimals_) {
        KpiLinkedRateDataStorage memory kpiData = InterestRateStorageWrapper.kpiLinkedRateStorage();

        if (coupon.fixingDate < kpiData.startPeriod) {
            return _getStartRate(kpiData);
        }

        (uint256 impactData, bool reportFound) = _collectImpactData(coupon.fixingDate, kpiData.reportPeriod);

        if (!reportFound) {
            return _getRateWhenNoReport(couponID, kpiData);
        }

        return _getRateFromImpact(impactData, kpiData);
    }

    function _getRateWhenNoReport(
        uint256 couponID,
        KpiLinkedRateDataStorage memory kpiData
    ) private view returns (uint256 rate_, uint8 rateDecimals_) {
        (uint256 previousRate, uint8 previousRateDecimals) = _previousRate(couponID);

        uint256 adjustedPreviousRate = DecimalsLib.calculateDecimalsAdjustment(
            previousRate,
            previousRateDecimals,
            kpiData.rateDecimals
        );

        rate_ = adjustedPreviousRate + kpiData.missedPenalty;
        if (rate_ > kpiData.maxRate) {
            rate_ = kpiData.maxRate;
        }

        return (rate_, kpiData.rateDecimals);
    }

    function _collectImpactData(
        uint256 fixingDate,
        uint256 reportPeriod
    ) private view returns (uint256 impactData_, bool reportFound_) {
        uint256 projectCount = ProceedRecipientsStorageWrapper.getProceedRecipientsCount();

        for (uint256 index; index < projectCount; ) {
            address[] memory projects = ProceedRecipientsStorageWrapper.getProceedRecipients(index, 1);

            (uint256 value, bool exists) = KpisStorageWrapper.getLatestKpiData(
                fixingDate - reportPeriod,
                fixingDate,
                projects[0]
            );

            if (exists) {
                impactData_ += value;
                reportFound_ = true;
            }

            unchecked {
                ++index;
            }
        }
    }

    /**
     * @dev Gets the rate from the previous coupon in the ordered list.
     * @param couponID The ID of the current coupon.
     * @return rate_ The rate of the previous coupon, or 0 if this is the first coupon.
     * @return rateDecimals_ The decimals of the previous coupon rate.
     */
    function _previousRate(uint256 couponID) private view returns (uint256 rate_, uint8 rateDecimals_) {
        uint256 previousCouponId = CouponStorageWrapper.getPreviousCouponInOrderedList(couponID);

        if (previousCouponId == 0) {
            return (0, 0);
        }

        (ICouponTypes.RegisteredCoupon memory previousCoupon, , ) = CouponStorageWrapper.getCoupon(previousCouponId);

        // Previous coupon rate must be set
        _checkUnexpectedError(
            previousCoupon.coupon.rateStatus != ICouponTypes.RateCalculationStatus.SET,
            KPI_LINKED_RATE_COUPON
        );

        return (previousCoupon.coupon.rate, previousCoupon.coupon.rateDecimals);
    }

    function _getStartRate(
        KpiLinkedRateDataStorage memory kpiData
    ) private pure returns (uint256 rate_, uint8 rateDecimals_) {
        return (kpiData.startRate, kpiData.rateDecimals);
    }

    function _getRateFromImpact(
        uint256 impactData,
        KpiLinkedRateDataStorage memory kpiData
    ) private pure returns (uint256 rate_, uint8 rateDecimals_) {
        uint256 factor = 10 ** kpiData.adjustmentPrecision;

        if (impactData < kpiData.baseLine) {
            return _getDecreasedRate(impactData, kpiData, factor);
        }

        return _getIncreasedRate(impactData, kpiData, factor);
    }

    function _getDecreasedRate(
        uint256 impactData,
        KpiLinkedRateDataStorage memory kpiData,
        uint256 factor
    ) private pure returns (uint256 rate_, uint8 rateDecimals_) {
        uint256 impactDeltaRate = (factor * (kpiData.baseLine - impactData)) /
            (kpiData.baseLine - kpiData.maxDeviationFloor);

        if (impactDeltaRate > factor) {
            impactDeltaRate = factor;
        }

        rate_ = kpiData.baseRate - (((kpiData.baseRate - kpiData.minRate) * impactDeltaRate) / factor);
        return (rate_, kpiData.rateDecimals);
    }

    function _getIncreasedRate(
        uint256 impactData,
        KpiLinkedRateDataStorage memory kpiData,
        uint256 factor
    ) private pure returns (uint256 rate_, uint8 rateDecimals_) {
        uint256 impactDeltaRate = (factor * (impactData - kpiData.baseLine)) /
            (kpiData.maxDeviationCap - kpiData.baseLine);

        if (impactDeltaRate > factor) {
            impactDeltaRate = factor;
        }

        rate_ = kpiData.baseRate + (((kpiData.maxRate - kpiData.baseRate) * impactDeltaRate) / factor);
        return (rate_, kpiData.rateDecimals);
    }
}
