// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ScheduledCouponListingKpiLinkedRateFacet
} from "../../../../facets/assetCapabilities/scheduledTasks/scheduledCouponListing/kpiLinkedRate/ScheduledCouponListingKpiLinkedRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ScheduledCouponListingKpiLinkedRateFacetTimeTravel is
    ScheduledCouponListingKpiLinkedRateFacet,
    TimeTravelStorageWrapper
{}
