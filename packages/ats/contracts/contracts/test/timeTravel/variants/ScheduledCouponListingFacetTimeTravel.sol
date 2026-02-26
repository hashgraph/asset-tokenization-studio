// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ScheduledCouponListingFacet
} from "../../../facets/assetCapabilities/scheduledTasks/scheduledCouponListing/ScheduledCouponListingFacet.sol";
import { TimeTravelProvider } from "../TimeTravelProvider.sol";

contract ScheduledCouponListingFacetTimeTravel is ScheduledCouponListingFacet, TimeTravelProvider {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelProvider._getBlockTimestamp();
    }

    function _getBlockNumber() internal view override returns (uint256) {
        return TimeTravelProvider._getBlockNumber();
    }
}
