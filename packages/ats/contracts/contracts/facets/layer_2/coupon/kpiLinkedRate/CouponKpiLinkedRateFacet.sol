// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CouponFacetBase } from "../CouponFacetBase.sol";
import { ICoupon } from "../ICoupon.sol";
import { ICouponTypes } from "../ICouponTypes.sol";
import { _COUPON_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

/**
 * @title CouponKpiLinkedRateFacet
 * @notice Facet for coupon management in KPI-linked rate bonds
 * @dev Validates that coupons for KPI-linked rate bonds have rateStatus=PENDING,
 *      rate=0, and rateDecimals=0. These values are calculated dynamically based on KPI data.
 */
contract CouponKpiLinkedRateFacet is CouponFacetBase {
    /// @notice Returns the static resolver key for this facet
    /// @return staticResolverKey_ The bytes32 resolver key identifying this facet
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _COUPON_KPI_LINKED_RATE_RESOLVER_KEY;
    }

    /**
     * @notice Prepares coupon data with KPI-linked rate validation
     * @param _newCoupon The new coupon data to validate
     * @return coupon_ The validated coupon data
     * @dev For KPI-linked rate bonds, rate parameters must be zero/empty because
     *      the actual rate is determined dynamically at execution time based on
     *      the bond's KPI data. Reverts with InterestRateIsKpiLinked if validation fails.
     *      Overrides the base implementation from CouponFacetBase.
     */
    function _prepareCoupon(
        ICouponTypes.Coupon calldata _newCoupon
    ) internal pure override returns (ICouponTypes.Coupon memory coupon_) {
        if (
            _newCoupon.rateStatus != ICouponTypes.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) {
            revert ICoupon.InterestRateIsKpiLinked();
        }
        coupon_ = _newCoupon;
    }
}
