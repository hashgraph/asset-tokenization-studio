// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CouponFacetBase } from "./CouponFacetBase.sol";
import { _COUPON_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title CouponFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing the standard (non-rate-variant) coupon writer surface
 *         (`setCoupon`, `cancelCoupon`) alongside the per-record reads under
 *         `_COUPON_RESOLVER_KEY`.
 * @dev Inherits `CouponFacetBase` for the shared 6-selector set + interfaceId list. Provides
 *      the resolver key only — the inherited default `_prepareCoupon` is a pass-through, which
 *      is correct for the standard variant. Read-only sibling facets `CouponSecurityHoldersFacet`
 *      and `CouponListingFacet` register under their own resolver keys and operate on the same
 *      underlying storage.
 */
contract CouponFacet is CouponFacetBase {
    /**
     * @notice Returns the static resolver key registering this facet with the Diamond proxy.
     * @return staticResolverKey_ The resolver key — `_COUPON_RESOLVER_KEY`.
     */
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _COUPON_RESOLVER_KEY;
    }
}
