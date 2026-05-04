// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICouponSecurityHolders } from "./ICouponSecurityHolders.sol";
import { CouponSecurityHolders } from "./CouponSecurityHolders.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _COUPON_SECURITY_HOLDERS_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title CouponSecurityHoldersFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes coupon security-holder queries via
 *         `ICouponSecurityHolders`, registered under
 *         `_COUPON_SECURITY_HOLDERS_RESOLVER_KEY`.
 * @dev Consolidates holder-enumeration methods previously part of `CouponFacet`:
 *      `getCouponHolders`, `getCouponsFor`, `getTotalCouponHolders`.
 *      Must be registered alongside any `Coupon*Facet` variant in all token
 *      configurations that include coupon functionality.
 *      Exposes 3 selectors and declares `ICouponSecurityHolders` as its interface ID.
 */
contract CouponSecurityHoldersFacet is CouponSecurityHolders, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _COUPON_SECURITY_HOLDERS_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 3;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getTotalCouponHolders.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getCouponsFor.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getCouponHolders.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(ICouponSecurityHolders).interfaceId;
        }
    }
}
