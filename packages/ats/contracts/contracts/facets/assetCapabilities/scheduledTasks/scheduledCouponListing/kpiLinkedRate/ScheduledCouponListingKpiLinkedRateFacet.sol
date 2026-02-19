// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _SCHEDULED_COUPON_LISTING_KPI_LINKED_RATE_RESOLVER_KEY
} from "../../../../../constants/resolverKeys/assets.sol";
import { ScheduledCouponListingFacetBase } from "../ScheduledCouponListingFacetBase.sol";

contract ScheduledCouponListingKpiLinkedRateFacet is ScheduledCouponListingFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SCHEDULED_COUPON_LISTING_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
