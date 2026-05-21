// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICouponSecurityHolders } from "./ICouponSecurityHolders.sol";
import { CouponSecurityHolders } from "./CouponSecurityHolders.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
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
