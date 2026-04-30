// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICouponListing } from "./ICouponListing.sol";
import { CouponListing } from "./CouponListing.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _COUPON_LISTING_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title CouponListingFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes coupon and scheduled-coupon listing queries via
 *         `ICouponListing`, registered under `_COUPON_LISTING_RESOLVER_KEY`.
 * @dev Consolidates read-only listing methods previously distributed across `CouponFacet`
 *      (ordered coupon list) and the former `ScheduledCouponListingFacet` (scheduled listing).
 *      Exposes 5 selectors: `getCouponFromOrderedListAt`, `getCouponsOrderedList`,
 *      `getCouponsOrderedListTotal`, `scheduledCouponListingCount`,
 *      `getScheduledCouponListing`.
 */
contract CouponListingFacet is CouponListing, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _COUPON_LISTING_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 5;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getScheduledCouponListing.selector;
            staticFunctionSelectors_[--selectorIndex] = this.scheduledCouponListingCount.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getCouponsOrderedListTotal.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getCouponsOrderedList.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getCouponFromOrderedListAt.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(ICouponListing).interfaceId;
        }
    }
}
