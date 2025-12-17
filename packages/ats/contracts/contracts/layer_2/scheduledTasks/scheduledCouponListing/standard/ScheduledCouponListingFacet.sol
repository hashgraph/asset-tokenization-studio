// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _SCHEDULED_COUPON_LISTING_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { ScheduledCouponListingFacetBase } from "../ScheduledCouponListingFacetBase.sol";
import { Common } from "../../../../layer_0/common/Common.sol";

contract ScheduledCouponListingFacet is ScheduledCouponListingFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SCHEDULED_COUPON_LISTING_RESOLVER_KEY;
    }
}
