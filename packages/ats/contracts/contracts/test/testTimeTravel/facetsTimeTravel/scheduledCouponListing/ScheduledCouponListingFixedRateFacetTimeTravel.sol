// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ScheduledCouponListingFixedRateFacet
} from "../../../../facets/assetCapabilities/scheduledTasks/scheduledCouponListing/fixedRate/ScheduledCouponListingFixedRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ScheduledCouponListingFixedRateFacetTimeTravel is
    ScheduledCouponListingFixedRateFacet,
    TimeTravelStorageWrapper
{}
