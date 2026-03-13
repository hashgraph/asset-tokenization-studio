// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ScheduledCouponListingFacet
} from "../../../../facets/layer_2/scheduledTask/scheduledCouponListing/ScheduledCouponListingFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ScheduledCouponListingFacetTimeTravel is ScheduledCouponListingFacet, TimeTravelStorageWrapper {}
