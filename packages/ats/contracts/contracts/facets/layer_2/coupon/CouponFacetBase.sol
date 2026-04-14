// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Coupon } from "./Coupon.sol";
import { ICoupon } from "./ICoupon.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";

abstract contract CouponFacetBase is Coupon, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](12);
        uint256 selectorIndex;
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
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ICoupon).interfaceId;
    }
}
