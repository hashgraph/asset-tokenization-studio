// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IScheduledCouponListing
} from "../../interfaces/scheduledTasks/scheduledCouponListing/IScheduledCouponListing.sol";
import { ScheduledTask } from "../../interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { LibScheduledTasks } from "../../../../lib/domain/LibScheduledTasks.sol";

/// @title ScheduledCouponListing
/// @notice Abstract read-only facade for scheduled coupon listings
abstract contract ScheduledCouponListing is IScheduledCouponListing {
    function scheduledCouponListingCount() external view override returns (uint256) {
        return LibScheduledTasks.getScheduledCouponListingCount();
    }

    function getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledCouponListing_) {
        scheduledCouponListing_ = LibScheduledTasks.getScheduledCouponListing(_pageIndex, _pageLength);
    }
}
