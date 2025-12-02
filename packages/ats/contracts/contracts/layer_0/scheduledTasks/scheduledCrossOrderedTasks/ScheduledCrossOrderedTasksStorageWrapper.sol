// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IScheduledCrossOrderedTasks
} from "../../../layer_2/interfaces/scheduledTasks/scheduledCrossOrderedTasks/IScheduledCrossOrderedTasks.sol";
import { ScheduledTasksLib } from "../../../layer_2/scheduledTasks/ScheduledTasksLib.sol";
import { _SCHEDULED_CROSS_ORDERED_TASKS_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import {
    ScheduledBalanceAdjustmentsStorageWrapper
} from "../scheduledBalanceAdjustments/ScheduledBalanceAdjustmentsStorageWrapper.sol";
import { SNAPSHOT_TASK_TYPE, BALANCE_ADJUSTMENT_TASK_TYPE, COUPON_LISTING_TASK_TYPE } from "../../constants/values.sol";
import {
    ScheduledTask,
    ScheduledTasksDataStorage
} from "../../../layer_2/interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";

abstract contract ScheduledCrossOrderedTasksStorageWrapper is ScheduledBalanceAdjustmentsStorageWrapper {
    function _addScheduledCrossOrderedTask(uint256 _newScheduledTimestamp, bytes memory _newData) internal {
        ScheduledTasksLib.addScheduledTask(_scheduledCrossOrderedTaskStorage(), _newScheduledTimestamp, _newData);
    }

    function _triggerScheduledCrossOrderedTasks(uint256 _max) internal override returns (uint256) {
        return
            _triggerScheduledTasks(
                _scheduledCrossOrderedTaskStorage(),
                _onScheduledCrossOrderedTaskTriggered,
                _max,
                _blockTimestamp()
            );
    }

    function _onScheduledCrossOrderedTaskTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        ScheduledTask memory _scheduledTask
    ) internal {
        bytes memory data = _scheduledTask.data;

        if (data.length == 0) return;

        bytes32 taskType = abi.decode(data, (bytes32));

        if (taskType == SNAPSHOT_TASK_TYPE) {
            _triggerScheduledSnapshots(1);
            return;
        }
        if (taskType == BALANCE_ADJUSTMENT_TASK_TYPE) {
            _triggerScheduledBalanceAdjustments(1);
            return;
        }
        if (taskType == COUPON_LISTING_TASK_TYPE) {
            _triggerScheduledCouponListing(1);
            return;
        }
    }

    function _getScheduledCrossOrderedTaskCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(_scheduledCrossOrderedTaskStorage());
    }

    function _getScheduledCrossOrderedTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledTask_) {
        return ScheduledTasksLib.getScheduledTasks(_scheduledCrossOrderedTaskStorage(), _pageIndex, _pageLength);
    }

    function _scheduledCrossOrderedTaskStorage()
        internal
        pure
        returns (ScheduledTasksDataStorage storage scheduledCrossOrderedTasks_)
    {
        bytes32 position = _SCHEDULED_CROSS_ORDERED_TASKS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledCrossOrderedTasks_.slot := position
        }
    }
}
