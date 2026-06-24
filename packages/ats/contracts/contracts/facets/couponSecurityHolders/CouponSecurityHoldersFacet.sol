// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICouponSecurityHolders, RESOLVER_KEY_COUPON_SECURITY_HOLDERS } from "./ICouponSecurityHolders.sol";
import { CouponSecurityHolders } from "./CouponSecurityHolders.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title CouponSecurityHoldersFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes coupon security-holder queries via
 *         `ICouponSecurityHolders`, registered under
 *         `RESOLVER_KEY_COUPON_SECURITY_HOLDERS`.
 * @dev Consolidates holder-enumeration methods previously part of `CouponFacet`:
 *      `getCouponHolders`, `getCouponsFor`, `getTotalCouponHolders`.
 *      Must be registered alongside any `Coupon*Facet` variant in all token
 *      configurations that include coupon functionality.
 *      Exposes 3 selectors and declares `ICouponSecurityHolders` as its interface ID.
 */
contract CouponSecurityHoldersFacet is CouponSecurityHolders, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_COUPON_SECURITY_HOLDERS;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeCouponSecurityHolders.selector,
                this.getCouponHolders.selector,
                this.getCouponsFor.selector,
                this.getTotalCouponHolders.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ICouponSecurityHolders).interfaceId);
    }
}
