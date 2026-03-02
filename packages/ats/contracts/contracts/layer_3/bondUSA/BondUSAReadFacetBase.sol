// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondRead } from "../../layer_2/bond/BondRead.sol";
import { Security } from "../../layer_2/security/Security.sol";
import { IBondRead } from "../../layer_2/interfaces/bond/IBondRead.sol";
import { ISecurity } from "../../layer_2/interfaces/security/ISecurity.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";

abstract contract BondUSAReadFacetBase is BondRead, IStaticFunctionSelectors, Security {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](14);
        staticFunctionSelectors_[selectorIndex++] = this.getBondDetails.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCoupon.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getPrincipalFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponAmountFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalCouponHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getSecurityRegulationData.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getSecurityHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalSecurityHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponFromOrderedListAt.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponsOrderedList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getCouponsOrderedListTotal.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](2);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IBondRead).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(ISecurity).interfaceId;
    }
}
