// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "contracts/layer_2/interfaces/bond/IBondRead.sol";
import { InternalsFixedInterestRate } from "../Internals.sol";
import { Common } from "contracts/layer_0/common/Common.sol";
import { Internals } from "contracts/layer_0/Internals.sol";
import { BondStorageWrapper } from "contracts/layer_0/bond/BondStorageWrapper.sol";

abstract contract BondStorageWrapperFixedInterestRate is InternalsFixedInterestRate, Common {
    error InterestRateIsFixed();

    function _setCoupon(
        IBondRead.Coupon memory _newCoupon
    ) internal virtual override(Internals, BondStorageWrapper) returns (bytes32 corporateActionId_, uint256 couponID_) {
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
