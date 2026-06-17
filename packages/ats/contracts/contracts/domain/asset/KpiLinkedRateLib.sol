// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICouponTypes } from "../../facets/coupon/ICouponTypes.sol";
import { InterestRateStorageWrapper, KpiLinkedRateDataStorage } from "./InterestRateStorageWrapper.sol";
import { KpisStorageWrapper } from "./KpisStorageWrapper.sol";
import { ProceedRecipientsStorageWrapper } from "./ProceedRecipientsStorageWrapper.sol";
import { CouponStorageWrapper } from "./coupon/CouponStorageWrapper.sol";
import { DecimalsLib } from "../../infrastructure/utils/DecimalsLib.sol";
import { KPI_LINKED_RATE_COUPON } from "../../constants/values.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title KpiLinkedRateLib
 * @author Asset Tokenization Studio Team
 * @notice Library for calculating KPI-linked interest rates.
 * @dev This library implements the rate calculation logic for securities with KPI-linked rates.
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
     * @notice Calculates the KPI-linked interest rate for a coupon.
     * @dev Returns `PENDING` with zero values when the fixing date has not yet passed.
     *      Delegates to `_getRateWhenNoReport` or `_getRateFromImpact` depending on
     *      whether a KPI report exists within the report window.
     * @param couponID The ID of the coupon to calculate the rate for.
     * @param coupon The coupon data.
     * @return rate_ The calculated interest rate.
     * @return rateDecimals_ The decimals of the calculated rate.
     * @return rateStatus_ The status of the calculated rate.
     */
    function calculateKpiLinkedInterestRate(
        uint256 couponID,
        ICouponTypes.Coupon memory coupon
    ) internal view returns (uint256 rate_, uint8 rateDecimals_, ICouponTypes.RateCalculationStatus rateStatus_) {
        if (coupon.fixingDate > EvmAccessors.getBlockTimestamp()) {
            return (0, 0, ICouponTypes.RateCalculationStatus.PENDING);
        }

        if (coupon.fixingDate < InterestRateStorageWrapper.getStartPeriod()) {
            (rate_, rateDecimals_) = _getStartRate();
            return (rate_, rateDecimals_, ICouponTypes.RateCalculationStatus.SET);
        }

        (uint256 impactData, bool reportFound) = _collectImpactData(
            coupon.fixingDate,
            InterestRateStorageWrapper.getReportPeriod()
        );

        if (!reportFound) {
            (rate_, rateDecimals_) = _getRateWhenNoReport(couponID);
            return (rate_, rateDecimals_, ICouponTypes.RateCalculationStatus.SET);
        }

        (rate_, rateDecimals_) = _getRateFromImpact(impactData);
        return (rate_, rateDecimals_, ICouponTypes.RateCalculationStatus.SET);
    }

    /**
     * @notice Derives the applicable rate when no KPI report was found for the coupon's window.
     * @dev Uses the previous coupon's rate as the base if available, otherwise falls back to
     *      `baseRate`. Adds `missedPenalty` and caps the result at `maxRate`.
     * @param couponID The ID of the coupon whose predecessor rate is looked up.
     * @return rate_ The penalty-adjusted rate expressed in `getRateDecimals()` precision.
     * @return rateDecimals_ The number of decimals for `rate_`.
     */
    function _getRateWhenNoReport(uint256 couponID) private view returns (uint256 rate_, uint8 rateDecimals_) {
        (uint256 previousRate, uint8 previousRateDecimals, bool found) = _previousRate(couponID);

        rate_ =
            (
                (found)
                    ? DecimalsLib.calculateDecimalsAdjustment(
                        previousRate,
                        previousRateDecimals,
                        InterestRateStorageWrapper.getRateDecimals()
                    )
                    : InterestRateStorageWrapper.getBaseRate()
            ) +
            InterestRateStorageWrapper.getMissedPenalty();

        if (rate_ > InterestRateStorageWrapper.getMaxRate()) {
            rate_ = InterestRateStorageWrapper.getMaxRate();
        }

        return (rate_, InterestRateStorageWrapper.getRateDecimals());
    }

    /**
     * @notice Aggregates KPI impact data across all proceed recipients within the report window.
     * @dev Iterates every registered proceed recipient and sums the latest KPI value whose
     *      timestamp falls in `[windowStart, fixingDate]`. Sets `reportFound_` to true as soon
     *      as at least one report is located.
     * @param fixingDate Upper bound (inclusive) of the report lookup window.
     * @param reportPeriod Width of the lookup window; `windowStart = fixingDate - reportPeriod`.
     * @return impactData_ Sum of all KPI values found across recipients.
     * @return reportFound_ True when at least one recipient returned a report.
     */
    function _collectImpactData(
        uint256 fixingDate,
        uint256 reportPeriod
    ) private view returns (uint256 impactData_, bool reportFound_) {
        uint256 windowStart;
        unchecked {
            windowStart = fixingDate > reportPeriod ? fixingDate - reportPeriod : fixingDate;
        }
        uint256 projectCount = ProceedRecipientsStorageWrapper.getProceedRecipientsCount();

        for (uint256 index; index < projectCount; ) {
            address[] memory projects = ProceedRecipientsStorageWrapper.getProceedRecipients(index, 1);

            (uint256 value, bool exists) = KpisStorageWrapper.getLatestKpiData(windowStart, fixingDate, projects[0]);

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
     * @notice Returns the rate recorded on the coupon that immediately precedes `couponID` in
     *         the ordered coupon list.
     * @dev Reverts via `_checkUnexpectedError` when the predecessor coupon exists but its rate
     *      status is not `SET` — this should never occur in normal operation.
     * @param couponID The ID of the current coupon.
     * @return rate_ The rate of the previous coupon, or 0 if this is the first coupon.
     * @return rateDecimals_ The decimals of the previous coupon rate.
     * @return found_ True when a predecessor coupon exists.
     */
    function _previousRate(uint256 couponID) private view returns (uint256 rate_, uint8 rateDecimals_, bool found_) {
        uint256 previousCouponId = CouponStorageWrapper.getPreviousCouponInOrderedList(couponID, false);

        if (previousCouponId == 0) {
            return (0, 0, false);
        }

        (ICouponTypes.RegisteredCoupon memory previousCoupon, , ) = CouponStorageWrapper.getCoupon(previousCouponId);

        // Previous coupon rate must be set
        _checkUnexpectedError(
            previousCoupon.coupon.rateStatus != ICouponTypes.RateCalculationStatus.SET,
            KPI_LINKED_RATE_COUPON
        );

        return (previousCoupon.coupon.rate, previousCoupon.coupon.rateDecimals, true);
    }

    /**
     * @notice Returns the configured start rate and its precision.
     * @dev Used when the coupon's fixing date falls before the KPI start period.
     * @return rate_ The start rate value.
     * @return rateDecimals_ The number of decimals for `rate_`.
     */
    function _getStartRate() private view returns (uint256 rate_, uint8 rateDecimals_) {
        return (InterestRateStorageWrapper.getStartRate(), InterestRateStorageWrapper.getRateDecimals());
    }

    /**
     * @notice Selects the correct rate formula based on whether KPI impact exceeds the baseline.
     * @dev Delegates to `_getDecreasedRate` when `impactData < baseLine`, otherwise to
     *      `_getIncreasedRate`.
     * @param impactData Aggregated KPI impact value for the coupon window.
     * @return rate_ The calculated rate.
     * @return rateDecimals_ The number of decimals for `rate_`.
     */
    function _getRateFromImpact(uint256 impactData) private view returns (uint256 rate_, uint8 rateDecimals_) {
        uint256 factor = DecimalsLib.pow10(InterestRateStorageWrapper.getAdjustmentPrecision());

        if (impactData < InterestRateStorageWrapper.getBaseLine()) {
            return _getDecreasedRate(impactData, factor);
        }

        return _getIncreasedRate(impactData, factor);
    }

    /**
     * @notice Interpolates the rate linearly between `minRate` and `baseRate` when impact is
     *         below the baseline.
     * @dev The delta ratio is capped at `factor` to prevent the rate from dropping below
     *      `minRate` even if `impactData` undershoots `maxDeviationFloor`.
     * @param impactData KPI impact value, which is strictly less than `baseLine`.
     * @param factor Scaling factor derived from `adjustmentPrecision` (i.e. `10 ** precision`).
     * @return rate_ The interpolated rate.
     * @return rateDecimals_ The number of decimals for `rate_`.
     */
    function _getDecreasedRate(
        uint256 impactData,
        uint256 factor
    ) private view returns (uint256 rate_, uint8 rateDecimals_) {
        uint256 impactDeltaRate = (factor * (InterestRateStorageWrapper.getBaseLine() - impactData)) /
            (InterestRateStorageWrapper.getBaseLine() - InterestRateStorageWrapper.getMaxDeviationFloor());

        if (impactDeltaRate > factor) {
            impactDeltaRate = factor;
        }

        rate_ =
            InterestRateStorageWrapper.getBaseRate() -
            (((InterestRateStorageWrapper.getBaseRate() - InterestRateStorageWrapper.getMinRate()) * impactDeltaRate) /
                factor);
        return (rate_, InterestRateStorageWrapper.getRateDecimals());
    }

    /**
     * @notice Interpolates the rate linearly between `baseRate` and `maxRate` when impact is
     *         at or above the baseline.
     * @dev The delta ratio is capped at `factor` to prevent the rate from exceeding `maxRate`
     *      even if `impactData` overshoots `maxDeviationCap`.
     * @param impactData KPI impact value, which is greater than or equal to `baseLine`.
     * @param factor Scaling factor derived from `adjustmentPrecision` (i.e. `10 ** precision`).
     * @return rate_ The interpolated rate.
     * @return rateDecimals_ The number of decimals for `rate_`.
     */
    function _getIncreasedRate(
        uint256 impactData,
        uint256 factor
    ) private view returns (uint256 rate_, uint8 rateDecimals_) {
        uint256 impactDeltaRate = (factor * (impactData - InterestRateStorageWrapper.getBaseLine())) /
            (InterestRateStorageWrapper.getMaxDeviationCap() - InterestRateStorageWrapper.getBaseLine());

        if (impactDeltaRate > factor) {
            impactDeltaRate = factor;
        }

        rate_ =
            InterestRateStorageWrapper.getBaseRate() +
            (((InterestRateStorageWrapper.getMaxRate() - InterestRateStorageWrapper.getBaseRate()) * impactDeltaRate) /
                factor);
        return (rate_, InterestRateStorageWrapper.getRateDecimals());
    }
}
