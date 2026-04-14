// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _COUPON_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { ICoupon } from "./ICoupon.sol";
import { Coupon } from "./Coupon.sol";

contract CouponFacet is Coupon, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _COUPON_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](12);
        staticFunctionSelectors_[selectorIndex++] = this.setCoupon.selector;
        staticFunctionSelectors_[selectorIndex++] = this.cancelCoupon.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCoupon.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponsFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponAmountFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalCouponHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponFromOrderedListAt.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponsOrderedList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponsOrderedListTotal.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(ICoupon).interfaceId;
    }
}
