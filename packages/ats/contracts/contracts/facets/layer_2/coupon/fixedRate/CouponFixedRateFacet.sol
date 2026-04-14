// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _COUPON_FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";
import { CouponFacet } from "../CouponFacet.sol";
import { ICoupon } from "../ICoupon.sol";
import { IFixedRate } from "../../interestRate/fixedRate/IFixedRate.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";

contract CouponFixedRateFacet is CouponFacet {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _COUPON_FIXED_RATE_RESOLVER_KEY;
    }

    function _prepareCoupon(
        ICoupon.Coupon calldata _newCoupon
    ) internal view override returns (ICoupon.Coupon memory coupon_) {
        if (
            _newCoupon.rateStatus != ICoupon.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) {
            revert IFixedRate.InterestRateIsFixed();
        }
        coupon_ = _newCoupon;
        (coupon_.rate, coupon_.rateDecimals) = InterestRateStorageWrapper.getRate();
        coupon_.rateStatus = ICoupon.RateCalculationStatus.SET;
    }
}
