// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CouponFacetBase } from "../CouponFacetBase.sol";
import { ICouponTypes } from "../ICouponTypes.sol";
import { IFixedRate } from "../../interestRate/fixedRate/IFixedRate.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";
import { _COUPON_FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

contract CouponFixedRateFacet is CouponFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _COUPON_FIXED_RATE_RESOLVER_KEY;
    }

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
