// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SnapshotsStorageWrapper1 } from "../snapshots/SnapshotsStorageWrapper1.sol";
import { ScheduledTasksLib } from "../../layer_2/scheduledTasks/ScheduledTasksLib.sol";
import {
    ScheduledTask,
    ScheduledTasksDataStorage
} from "../../layer_2/interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";

abstract contract ScheduledTasksCommon is SnapshotsStorageWrapper1 {
    error WrongTimestamp(uint256 timeStamp);
    error NotAutocalling();

    modifier onlyValidTimestamp(uint256 _timestamp) override {
        _checkTimestamp(_timestamp);
        _;
    }

    modifier onlyAutoCalling(bool _autoCalling) override {
        _checkAutoCalling(_autoCalling);
        _;
    }

    function _triggerScheduledTasks(
        ScheduledTasksDataStorage storage _scheduledTasks,
        function(uint256, uint256, ScheduledTask memory) internal callBack,
        uint256 _max,
        uint256 _timestamp
    ) internal override returns (uint256) {
        uint256 scheduledTasksLength = ScheduledTasksLib.getScheduledTaskCount(_scheduledTasks);

        if (scheduledTasksLength == 0) {
            return 0;
        }

        uint256 max = _max;

        uint256 newTaskID;

        if (max > scheduledTasksLength || max == 0) {
            max = scheduledTasksLength;
        }

        for (uint256 j = 1; j <= max; j++) {
            uint256 pos = scheduledTasksLength - j;

            ScheduledTask memory currentScheduledTask = ScheduledTasksLib.getScheduledTasksByIndex(
                _scheduledTasks,
                pos
            );

            if (currentScheduledTask.scheduledTimestamp < _timestamp) {
                ScheduledTasksLib.popScheduledTask(_scheduledTasks);
                callBack(pos, scheduledTasksLength, currentScheduledTask);
            } else {
                break;
            }
        }

        return newTaskID;
    }

    function _checkTimestamp(uint256 _timestamp) private view {
        if (_timestamp <= _blockTimestamp()) revert WrongTimestamp(_timestamp);
    }

    function _checkAutoCalling(bool _autoCalling) private pure {
        if (!_autoCalling) revert NotAutocalling();
    }
}
