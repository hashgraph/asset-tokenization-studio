// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CouponFacetBase } from "./CouponFacetBase.sol";
import { ICouponTypes } from "./ICouponTypes.sol";
import { IFixedRate } from "../layer_2/interestRate/fixedRate/IFixedRate.sol";
import { InterestRateStorageWrapper } from "../../domain/asset/InterestRateStorageWrapper.sol";
import { _COUPON_FIXED_RATE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title CouponFixedRateFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet variant of the coupon writer that resolves the rate from the
 *         configured fixed-rate setting of the bond at scheduling time. Registered under
 *         `_COUPON_FIXED_RATE_RESOLVER_KEY`.
 * @dev Inherits `CouponFacetBase` for the shared 6-selector set + interfaceId list. Overrides
 *      `_prepareCoupon` to require the user to submit a coupon with `rateStatus = PENDING`,
 *      `rate = 0`, and `rateDecimals = 0`, then reads the actual rate from
 *      `InterestRateStorageWrapper.getRate()` and stamps it into the coupon with
 *      `rateStatus = SET` before persistence. Reverts with `IFixedRate.InterestRateIsFixed`
 *      if the user attempts to specify rate parameters manually.
 */
contract CouponFixedRateFacet is CouponFacetBase {
    /**
     * @notice Returns the static resolver key registering this facet with the Diamond proxy.
     * @return staticResolverKey_ The resolver key — `_COUPON_FIXED_RATE_RESOLVER_KEY`.
     */
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _COUPON_FIXED_RATE_RESOLVER_KEY;
    }

    /**
     * @notice Validates and resolves the rate for a fixed-rate coupon before persistence.
     * @dev Rejects user-supplied rate parameters (must be `PENDING`/`0`/`0`) and overwrites
     *      them with the configured fixed rate of the bond read from
     *      `InterestRateStorageWrapper.getRate()`. Sets `rateStatus = SET` so downstream
     *      consumers can distinguish a resolved coupon from a still-pending one.
     * @param _newCoupon The user-supplied coupon parameters.
     * @return coupon_ The validated coupon with the rate fixed and `rateStatus = SET`.
     */
    function _prepareCoupon(
        ICouponTypes.Coupon calldata _newCoupon
    ) internal view override returns (ICouponTypes.Coupon memory coupon_) {
        if (
            _newCoupon.rateStatus != ICouponTypes.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) {
            revert IFixedRate.InterestRateIsFixed();
        }
        coupon_ = _newCoupon;
        (coupon_.rate, coupon_.rateDecimals) = InterestRateStorageWrapper.getRate();
        coupon_.rateStatus = ICouponTypes.RateCalculationStatus.SET;
    }
}
