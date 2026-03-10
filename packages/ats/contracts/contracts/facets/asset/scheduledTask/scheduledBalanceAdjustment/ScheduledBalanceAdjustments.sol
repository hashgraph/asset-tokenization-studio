// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IScheduledBalanceAdjustments
} from "../../scheduledTask/scheduledBalanceAdjustment/IScheduledBalanceAdjustments.sol";
import { ScheduledTask } from "../../scheduledTask/IScheduledTasksCommon.sol";
import { ScheduledTasksStorageWrapper } from "../../../../domain/asset/ScheduledTasksStorageWrapper.sol";

/// @title ScheduledBalanceAdjustments
/// @notice Abstract read-only facade for scheduled balance adjustments
abstract contract ScheduledBalanceAdjustments is IScheduledBalanceAdjustments {
    function scheduledBalanceAdjustmentCount() external view override returns (uint256) {
        return ScheduledTasksStorageWrapper.getScheduledBalanceAdjustmentCount();
    }

    function getScheduledBalanceAdjustments(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledBalanceAdjustment_) {
        scheduledBalanceAdjustment_ = ScheduledTasksStorageWrapper.getScheduledBalanceAdjustments(
            _pageIndex,
            _pageLength
        );
    }
}
