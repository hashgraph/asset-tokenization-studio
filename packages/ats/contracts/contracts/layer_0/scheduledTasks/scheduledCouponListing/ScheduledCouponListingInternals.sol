// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ScheduledBalanceAdjustmentsInternals
} from "../scheduledBalanceAdjustments/ScheduledBalanceAdjustmentsInternals.sol";
import {
    ScheduledTask
} from "../../../layer_2/interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";

abstract contract ScheduledCouponListingInternals is ScheduledBalanceAdjustmentsInternals {
    function _addScheduledCouponListing(uint256 _newScheduledTimestamp, bytes32 _actionId) internal virtual;
    function _onScheduledCouponListingTriggered(
        uint256 _pos,
        uint256 _scheduledTasksLength,
        ScheduledTask memory _scheduledTask
    ) internal virtual;
    function _triggerScheduledCouponListing(uint256 _max) internal virtual returns (uint256);
    function _getPendingScheduledCouponListingTotalAt(
        uint256 _timestamp
    ) internal view virtual returns (uint256 total_);
    function _getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (ScheduledTask[] memory scheduledCouponListing_);
    function _getScheduledCouponListingCount() internal view virtual returns (uint256);
    function _getScheduledCouponListingIdAtIndex(uint256 _index) internal view virtual returns (uint256 couponID_);
}
