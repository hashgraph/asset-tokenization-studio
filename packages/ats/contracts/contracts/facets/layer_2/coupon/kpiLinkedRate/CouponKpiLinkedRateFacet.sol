// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CouponFacetBase } from "../CouponFacetBase.sol";
import { ICouponTypes } from "../ICouponTypes.sol";
import { IKpiLinkedRate } from "../../interestRate/kpiLinkedRate/IKpiLinkedRate.sol";
import { _COUPON_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

contract CouponKpiLinkedRateFacet is CouponFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _COUPON_KPI_LINKED_RATE_RESOLVER_KEY;
    }

    function _prepareCoupon(
        ICouponTypes.Coupon calldata _newCoupon
    ) internal view override returns (ICouponTypes.Coupon memory coupon_) {
        if (
            _newCoupon.rateStatus != ICouponTypes.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) {
            revert IKpiLinkedRate.InterestRateIsKpiLinked();
        }
        coupon_ = _newCoupon;
    }
}
