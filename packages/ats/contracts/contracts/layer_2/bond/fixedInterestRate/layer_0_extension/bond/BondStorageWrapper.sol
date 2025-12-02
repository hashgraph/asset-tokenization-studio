// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Common } from "../../../../../layer_1/common/Common.sol";
import { IBondRead } from "../../../../interfaces/bond/IBondRead.sol";

abstract contract BondStorageWrapperFixedInterestRate is Common {
    error InterestRateIsFixed();

    function _setCoupon(
        IBondRead.Coupon memory _newCoupon
    ) internal virtual override returns (bytes32 corporateActionId_, uint256 couponID_) {
        if (
            _newCoupon.rateStatus != IBondRead.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) revert InterestRateIsFixed();

        (_newCoupon.rate, _newCoupon.rateDecimals) = _getRate();
        _newCoupon.rateStatus = IBondRead.RateCalculationStatus.SET;

        return super._setCoupon(_newCoupon);
    }
}
