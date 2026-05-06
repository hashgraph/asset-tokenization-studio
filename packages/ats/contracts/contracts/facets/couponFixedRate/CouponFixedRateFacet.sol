// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CouponFixedRate } from "./CouponFixedRate.sol";
import { ICoupon } from "../coupon/ICoupon.sol";
import { _COUPON_FIXED_RATE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";

/**
 * @title CouponFixedRateFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet variant of the coupon writer that resolves the rate from the
 *         configured fixed-rate setting of the bond at scheduling time. Registered under
 *         `_COUPON_FIXED_RATE_RESOLVER_KEY`.
 * @dev Inherits the writer logic from `CouponFixedRate` and satisfies
 *      `IStaticFunctionSelectors` for Diamond proxy selector registration.
 */
contract CouponFixedRateFacet is CouponFixedRate, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _COUPON_FIXED_RATE_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    /// @dev Selectors are written in reverse via `--selectorIndex` inside an `unchecked`
    ///      block; the resulting array reads in declaration order (`setCoupon`,
    ///      `cancelCoupon`, `getCoupon`, `getCouponFor`, `getCouponAmountFor`,
    ///      `getCouponCount`).
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
