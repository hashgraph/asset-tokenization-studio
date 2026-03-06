// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IScheduledBalanceAdjustments
} from "../../scheduledTask/scheduledBalanceAdjustment/IScheduledBalanceAdjustments.sol";
import { ScheduledTask } from "../../scheduledTask/IScheduledTasksCommon.sol";
import { LibScheduledTasks } from "../../../../domain/asset/LibScheduledTasks.sol";

/// @title ScheduledBalanceAdjustments
/// @notice Abstract read-only facade for scheduled balance adjustments
abstract contract ScheduledBalanceAdjustments is IScheduledBalanceAdjustments {
    function scheduledBalanceAdjustmentCount() external view override returns (uint256) {
        return LibScheduledTasks.getScheduledBalanceAdjustmentCount();
    }

    function getScheduledBalanceAdjustments(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledBalanceAdjustment_) {
        scheduledBalanceAdjustment_ = LibScheduledTasks.getScheduledBalanceAdjustments(_pageIndex, _pageLength);
    }
}
