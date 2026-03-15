// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IScheduledCouponListing } from "./IScheduledCouponListing.sol";
import { ScheduledTask } from "../scheduledTasksCommon/IScheduledTasksCommon.sol";
import { ScheduledTasksStorageWrapper } from "../../../../domain/asset/ScheduledTasksStorageWrapper.sol";

abstract contract ScheduledCouponListing is IScheduledCouponListing {
    function scheduledCouponListingCount() external view override returns (uint256) {
        return ScheduledTasksStorageWrapper.getScheduledCouponListingCount();
    }

    function getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledCouponListing_) {
        scheduledCouponListing_ = ScheduledTasksStorageWrapper.getScheduledCouponListing(_pageIndex, _pageLength);
    }
}
