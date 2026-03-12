// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _SCHEDULED_COUPON_LISTING_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY
} from "../../../../../constants/resolverKeys.sol";
import { ScheduledCouponListingFacetBase } from "../ScheduledCouponListingFacetBase.sol";
// prettier-ignore
/* solhint-disable max-line-length */
import { CommonSustainabilityPerformanceTargetInterestRate } from "../../../../../domain/asset/extension/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Common.sol";
/* solhint-enable max-line-length */

contract ScheduledCouponListingSustainabilityPerformanceTargetRateFacet is
    ScheduledCouponListingFacetBase,
    CommonSustainabilityPerformanceTargetInterestRate
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SCHEDULED_COUPON_LISTING_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }
}
