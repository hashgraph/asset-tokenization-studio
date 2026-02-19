// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ScheduledCouponListingSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/assetCapabilities/scheduledTasks/scheduledCouponListing/sustainabilityPerformanceTargetRate/ScheduledCouponListingSustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ScheduledCouponListingSustainabilityPerformanceTargetRateFacetTimeTravel is
    ScheduledCouponListingSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{}
