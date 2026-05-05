// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Coupon } from "./Coupon.sol";
import { ICoupon } from "./ICoupon.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";

/**
 * @title CouponFacetBase
 * @author Asset Tokenization Studio Team
 * @notice Shared scaffold inherited by every concrete coupon facet (`CouponFacet` plus the
 *         three rate variants — fixed rate, KPI-linked rate, sustainability-performance-target
 *         rate). Carries the 6-selector array and the EIP-165 interfaceId list common to all
 *         variants; concrete facets only have to supply the resolver key and (optionally) the
 *         rate-resolution hook.
 * @dev This is a legitimate three-tier scaffold (`Coupon` → `CouponFacetBase` → `CouponFacet*`)
 *      because the same 6 selectors and interfaceId set are reused by 4 concrete facets. The
 *      modern post-MAF-split two-tier shape is reserved for facets with no variant fan-out.
 */
abstract contract CouponFacetBase is Coupon, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    /// @dev Selectors are written in reverse via `--selectorIndex` inside an `unchecked`
    ///      block; the resulting array reads in declaration order (`setCoupon`,
    ///      `cancelCoupon`, `getCoupon`, `getCouponFor`, `getCouponAmountFor`,
    ///      `getCouponCount`). All four concrete coupon facets share this selector set.
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 6;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getCouponCount.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getCouponAmountFor.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getCouponFor.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getCoupon.selector;
            staticFunctionSelectors_[--selectorIndex] = this.cancelCoupon.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setCoupon.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorsIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorsIndex);
        unchecked {
            staticInterfaceIds_[--selectorsIndex] = type(ICoupon).interfaceId;
        }
    }
}
