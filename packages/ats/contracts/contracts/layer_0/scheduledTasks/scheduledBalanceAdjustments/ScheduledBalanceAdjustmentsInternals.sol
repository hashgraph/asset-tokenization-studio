// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LockInternals } from "../../lock/LockInternals.sol";
import {
    ScheduledTask,
    ScheduledTasksDataStorage
} from "../../../layer_2/interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";

abstract contract ScheduledBalanceAdjustmentsInternals is LockInternals {
    function _addScheduledBalanceAdjustment(uint256 _newScheduledTimestamp, bytes32 _actionId) internal virtual;
    function _initBalanceAdjustment(bytes32 _actionId, bytes memory _data) internal virtual;
    function _onScheduledBalanceAdjustmentTriggered(
        uint256 _pos,
        uint256 _scheduledTasksLength,
        ScheduledTask memory _scheduledTask
    ) internal virtual;
    function _triggerScheduledBalanceAdjustments(uint256 _max) internal virtual returns (uint256);
    function _triggerScheduledTasks(
        ScheduledTasksDataStorage storage _scheduledTasks,
        function(uint256, uint256, ScheduledTask memory) internal callBack,
        uint256 _max,
        uint256 _timestamp
    ) internal virtual returns (uint256);
    function _getScheduledBalanceAdjustments(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (ScheduledTask[] memory scheduledBalanceAdjustment_);
    function _getScheduledBalanceAdjustmentsCount() internal view virtual returns (uint256 balanceAdjustmentCount_);
}
