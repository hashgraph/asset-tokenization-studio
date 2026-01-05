// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _SCHEDULED_COUPON_LISTING_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { ScheduledCouponListingFacetBase } from "../ScheduledCouponListingFacetBase.sol";
import {
    CommonKpiLinkedInterestRate
} from "../../../../layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/Common.sol";

contract ScheduledCouponListingKpiLinkedRateFacet is ScheduledCouponListingFacetBase, CommonKpiLinkedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SCHEDULED_COUPON_LISTING_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
