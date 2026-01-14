// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import { ScheduledTask } from "./IScheduledTasksCommon.sol";

interface TRexIScheduledCouponListing {
    function scheduledCouponListingCount() external view returns (uint256);

    function getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (ScheduledTask[] memory scheduledCouponListing_);
}
