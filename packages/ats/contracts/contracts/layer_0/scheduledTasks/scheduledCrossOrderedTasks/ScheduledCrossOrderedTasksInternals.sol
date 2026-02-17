// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledCouponListingInternals } from "../scheduledCouponListing/ScheduledCouponListingInternals.sol";
import {
    ScheduledTask
} from "../../../layer_2/interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";

abstract contract ScheduledCrossOrderedTasksInternals is ScheduledCouponListingInternals {
    function _addScheduledCrossOrderedTask(uint256 _newScheduledTimestamp, bytes32 _taskType) internal virtual;
    function _callTriggerPendingScheduledCrossOrderedTasks() internal virtual returns (uint256);
    function _onScheduledCrossOrderedTaskTriggered(
        uint256 _pos,
        uint256 _scheduledTasksLength,
        ScheduledTask memory _scheduledTask
    ) internal virtual;
    function _triggerScheduledCrossOrderedTasks(uint256 _max) internal virtual returns (uint256);
    function _getScheduledCrossOrderedTaskCount() internal view virtual returns (uint256);
    function _getScheduledCrossOrderedTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (ScheduledTask[] memory scheduledTask_);
}
