// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ScheduledCouponListingFacet
} from "../../../../facets/layer_2/scheduledTask/scheduledCouponListing/ScheduledCouponListingFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ScheduledCouponListingFacetTimeTravel is ScheduledCouponListingFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
