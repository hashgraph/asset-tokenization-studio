// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoupon } from "../../../facets/coupon/ICoupon.sol";
import { ICouponTypes } from "../../../facets/coupon/ICouponTypes.sol";
import { IInterestRate } from "../../../facets/interestRate/IInterestRate.sol";
import { IFixedRate } from "../../../facets/layer_2/interestRate/fixedRate/IFixedRate.sol";
import { InterestRateStorageWrapper } from "../InterestRateStorageWrapper.sol";
import { KpiLinkedRateLib } from "../KpiLinkedRateLib.sol";

/**
 * @title CouponRateDispatch
 * @notice Central dispatcher for coupon rate resolution across all supported rate types.
 * @dev To add a new rate type: (1) add the variant to `ICouponTypes.RateType`, then
 *      (2) add the corresponding branch in `resolveRate` (if the rate is computed at
 *      read/trigger time) or `validateAndStamp` (if the rate is stamped at write time).
 *      `InterestRateFacet` is the single source of truth for which type is active on an asset.
 *      If the relevant facet has not been initialized when its branch is reached, the
 *      library returns (0, 0) rather than reverting — the admin is responsible for correct
 *      configuration.
 * @author Asset Tokenization Studio Team
 */
library CouponRateDispatch {
    /**
     * @notice Resolves the coupon rate at read or listing-trigger time for variants that
     *         compute the rate lazily.
     * @dev Rate-type dispatch:
     *      - NONE: rate was forced to (0, 0) at write time — no override needed here.
     *              Returns shouldOverride_=false.
     *      - STANDARD: user-supplied rate is already SET — no override needed here.
     *              Returns shouldOverride_=false.
     *      - FIXED: rate was stamped at write time — no override needed here.
     *              Returns shouldOverride_=false.
     *      - KPI_LINKED: rate is calculated on-demand. Returns the computed (rate, decimals)
     *              with shouldOverride_=true. Returns (0, 0) if the KPI-linked facet has not
     *              been initialized.
     * @param couponID The coupon identifier.
     * @param coupon   The coupon data struct.
     * @return resolvedCoupon_  Coupon with the resolved rate value.
     */
    function resolveRate(
        uint256 couponID,
        ICouponTypes.Coupon memory coupon
    ) internal view returns (ICouponTypes.Coupon memory resolvedCoupon_) {
        if (InterestRateStorageWrapper.getCouponRateType() == IInterestRate.RateType.KPI_LINKED) {
            (coupon.rate, coupon.rateDecimals, coupon.rateStatus) = KpiLinkedRateLib.calculateKpiLinkedInterestRate(
                couponID,
                coupon
            );
        }
        return coupon;
        // NONE, STANDARD, FIXED: rate is owned at write time; no action needed at read/trigger time.
    }

    /**
     * @notice Validates and stamps the coupon rate at creation (write) time.
     * @dev Rate-type dispatch:
     *      - NONE: forces rate to (0, 0) with status SET, regardless of user input.
     *              No coupon payments will ever be owed for this asset.
     *      - FIXED: rejects any non-pending rate triplet, then stamps the rate from storage.
     *              Returns (0, 0) if the fixed-rate facet has not been initialized.
     *      - KPI_LINKED: rejects any non-pending rate triplet; rate stays PENDING and is
     *              resolved lazily at read time.
     *      - STANDARD: passes the user-supplied rate through unchanged.
     * @param newCoupon User-supplied coupon parameters.
     * @return resolved_ The same coupon, with rate/rateDecimals/rateStatus potentially overwritten.
     * @custom:revert IFixedRate.InterestRateIsFixed    If FIXED and the caller supplied a non-pending rate.
     * @custom:revert ICoupon.InterestRateIsKpiLinked   If KPI_LINKED and the caller supplied a non-pending rate.
     */
    function validateAndStamp(
        ICouponTypes.Coupon memory newCoupon
    ) internal view returns (ICouponTypes.Coupon memory resolved_) {
        IInterestRate.RateType rateType = InterestRateStorageWrapper.getCouponRateType();

        if (rateType == IInterestRate.RateType.NONE) {
            newCoupon.rate = 0;
            newCoupon.rateDecimals = 0;
            newCoupon.rateStatus = ICouponTypes.RateCalculationStatus.SET;
            return newCoupon;
        }

        if (rateType == IInterestRate.RateType.FIXED) {
            if (!_isPendingRate(newCoupon)) revert IFixedRate.InterestRateIsFixed();
            (newCoupon.rate, newCoupon.rateDecimals) = InterestRateStorageWrapper.getRate();
            newCoupon.rateStatus = ICouponTypes.RateCalculationStatus.SET;
            return newCoupon;
        }

        if (rateType == IInterestRate.RateType.KPI_LINKED) {
            if (!_isPendingRate(newCoupon)) revert ICoupon.InterestRateIsKpiLinked();
            return newCoupon;
        }

        if (rateType == IInterestRate.RateType.STANDARD) {
            if (newCoupon.rateStatus != ICouponTypes.RateCalculationStatus.SET) revert ICoupon.InterestRateIsStandard();
            return newCoupon;
        }

        // STANDARD: pass the user-supplied rate through unchanged.
        resolved_ = newCoupon;
    }

    /**
     * @dev Returns true when a coupon's rate triplet is in the pending shape:
     *      rateStatus=PENDING, rate=0, rateDecimals=0.
     *      Protocol-owned variants reject any non-pending triplet so callers cannot
     *      pre-stamp a rate that the protocol must control.
     */
    function _isPendingRate(ICouponTypes.Coupon memory coupon) private pure returns (bool ok_) {
        ok_ =
            coupon.rateStatus == ICouponTypes.RateCalculationStatus.PENDING &&
            coupon.rate == 0 &&
            coupon.rateDecimals == 0;
    }
}
