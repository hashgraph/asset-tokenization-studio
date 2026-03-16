// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoupon } from "../../../../../../facets/layer_2/coupon/ICoupon.sol";
import { InternalsFixedInterestRate } from "../Internals.sol";
import { Common } from "../../../../../../domain/Common.sol";
import { Internals } from "../../../../../../domain/Internals.sol";
import { CouponStorageWrapper } from "../../../../../../domain/asset/coupon/CouponStorageWrapper.sol";

abstract contract BondStorageWrapperFixedInterestRate is InternalsFixedInterestRate, Common {
    error InterestRateIsFixed();

    function _setCoupon(
        ICoupon.Coupon memory _newCoupon
    )
        internal
        virtual
        override(Internals, CouponStorageWrapper)
        returns (bytes32 corporateActionId_, uint256 couponID_)
    {
        if (
            _newCoupon.rateStatus != ICoupon.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) revert InterestRateIsFixed();

        (_newCoupon.rate, _newCoupon.rateDecimals) = _getRate();
        _newCoupon.rateStatus = ICoupon.RateCalculationStatus.SET;

        return super._setCoupon(_newCoupon);
    }
}
