// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledTask } from "../scheduledTasksCommon/IScheduledTasksCommon.sol";

interface IScheduledCouponListing {
    function scheduledCouponListingCount() external view returns (uint256);

    function getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (ScheduledTask[] memory scheduledCouponListing_);
}
