// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Internals } from "../../../layer_0/Internals.sol";
import {
    IScheduledCouponListing
} from "../../interfaces/scheduledTasks/scheduledCouponListing/IScheduledCouponListing.sol";
import { ScheduledTask } from "../../interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

abstract contract ScheduledCouponListing is IScheduledCouponListing, Internals {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    function scheduledCouponListingCount() external view override returns (uint256) {
        return _getScheduledCouponListingCount();
    }

    function getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledCouponListing_) {
        scheduledCouponListing_ = _getScheduledCouponListing(_pageIndex, _pageLength);
    }
}
