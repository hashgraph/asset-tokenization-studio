// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CouponFacetBase } from "../CouponFacetBase.sol";
import { _COUPON_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

contract CouponKpiLinkedRateFacet is CouponFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _COUPON_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
