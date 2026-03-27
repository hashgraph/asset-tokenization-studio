// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _BOND_FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";
import { BondUSAFacetBase } from "../BondUSAFacetBase.sol";
import { IBondRead } from "../../../layer_2/bond/IBondRead.sol";
import { IFixedRate } from "../../../layer_2/interestRate/fixedRate/IFixedRate.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";

contract BondUSAFixedRateFacet is BondUSAFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_FIXED_RATE_RESOLVER_KEY;
    }

    function _prepareCoupon(
        IBondRead.Coupon calldata _newCoupon
    ) internal override returns (IBondRead.Coupon memory coupon_) {
        if (
            _newCoupon.rateStatus != IBondRead.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) {
            revert IFixedRate.InterestRateIsFixed();
        }
        coupon_ = _newCoupon;
        (coupon_.rate, coupon_.rateDecimals) = InterestRateStorageWrapper.getRate();
        coupon_.rateStatus = IBondRead.RateCalculationStatus.SET;
    }
}
