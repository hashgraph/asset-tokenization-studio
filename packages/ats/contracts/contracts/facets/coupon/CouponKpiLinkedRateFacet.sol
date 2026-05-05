// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CouponFacetBase } from "./CouponFacetBase.sol";
import { ICoupon } from "./ICoupon.sol";
import { ICouponTypes } from "./ICouponTypes.sol";
import { _COUPON_KPI_LINKED_RATE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title CouponKpiLinkedRateFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet variant of the coupon writer for KPI-linked-rate bonds. The rate is
 *         left pending at scheduling time and resolved dynamically at execution against the
 *         KPI data of the bond. Registered under `_COUPON_KPI_LINKED_RATE_RESOLVER_KEY`.
 * @dev Inherits `CouponFacetBase` for the shared 6-selector set + interfaceId list. Overrides
 *      `_prepareCoupon` to require the user to submit a coupon with `rateStatus = PENDING`,
 *      `rate = 0`, and `rateDecimals = 0`; the rate stays pending and is computed at
 *      execution. Reverts with `ICoupon.InterestRateIsKpiLinked` if the user attempts to
 *      specify rate parameters manually.
 */
contract CouponKpiLinkedRateFacet is CouponFacetBase {
    /**
     * @notice Returns the static resolver key registering this facet with the Diamond proxy.
     * @return staticResolverKey_ The resolver key — `_COUPON_KPI_LINKED_RATE_RESOLVER_KEY`.
     */
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _COUPON_KPI_LINKED_RATE_RESOLVER_KEY;
    }

    /**
     * @notice Validates a KPI-linked-rate coupon before persistence.
     * @dev Requires the user-supplied coupon to have `rateStatus = PENDING`, `rate = 0`, and
     *      `rateDecimals = 0` because the rate is computed dynamically at execution time
     *      against the KPI data of the bond. Reverts with `ICoupon.InterestRateIsKpiLinked`
     *      if any of those checks fail. Returns the coupon unchanged otherwise.
     * @param _newCoupon The user-supplied coupon parameters.
     * @return coupon_ The validated coupon, pending rate resolution.
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
