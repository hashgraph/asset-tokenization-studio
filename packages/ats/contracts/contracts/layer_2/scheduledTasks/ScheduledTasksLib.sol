// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LibCommon } from "../../layer_0/common/libraries/LibCommon.sol";
import {
    ScheduledTask,
    ScheduledTasksDataStorage
} from "../../layer_2/interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";

library ScheduledTasksLib {
    function addScheduledTask(
        ScheduledTasksDataStorage storage _scheduledTasks,
        uint256 _newScheduledTimestamp,
        bytes memory _newData
    ) internal {
        ScheduledTask memory newScheduledTask = ScheduledTask(_newScheduledTimestamp, _newData);

        uint256 scheduledTasksLength = getScheduledTaskCount(_scheduledTasks);

        uint256 newScheduledTaskId = scheduledTasksLength;

        bool added = false;

        if (scheduledTasksLength > 0) {
            for (uint256 index = 1; index <= scheduledTasksLength; index++) {
                uint256 scheduledTaskPosition = scheduledTasksLength - index;

                if (_scheduledTasks.scheduledTasks[scheduledTaskPosition].scheduledTimestamp < _newScheduledTimestamp) {
                    _slideScheduledTasks(_scheduledTasks, scheduledTaskPosition);
                } else {
                    newScheduledTaskId = scheduledTaskPosition + 1;
                    _insertScheduledTask(_scheduledTasks, newScheduledTaskId, newScheduledTask);
                    added = true;
                    break;
                }
            }
        }
        if (!added) {
            _insertScheduledTask(_scheduledTasks, 0, newScheduledTask);
        }
    }

    function popScheduledTask(ScheduledTasksDataStorage storage _scheduledTasks) internal {
        uint256 scheduledTasksLength = getScheduledTaskCount(_scheduledTasks);
        assert(scheduledTasksLength > 0);
        delete (_scheduledTasks.scheduledTasks[scheduledTasksLength - 1]);
        _scheduledTasks.scheduledTaskCount--;
    }

    function getScheduledTaskCount(ScheduledTasksDataStorage storage _scheduledTasks) internal view returns (uint256) {
        return _scheduledTasks.scheduledTaskCount;
    }

    function getScheduledTasksByIndex(
        ScheduledTasksDataStorage storage _scheduledTasks,
        uint256 _index
    ) internal view returns (ScheduledTask memory) {
        return _scheduledTasks.scheduledTasks[_index];
    }

    function getScheduledTasks(
        ScheduledTasksDataStorage storage _scheduledTasks,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledTask_) {
        (uint256 start, uint256 end) = LibCommon.getStartAndEnd(_pageIndex, _pageLength);

        scheduledTask_ = new ScheduledTask[](LibCommon.getSize(start, end, getScheduledTaskCount(_scheduledTasks)));

        for (uint256 i = 0; i < scheduledTask_.length; i++) {
            scheduledTask_[i] = getScheduledTasksByIndex(_scheduledTasks, start + i);
        }
    }

    function _slideScheduledTasks(ScheduledTasksDataStorage storage _scheduledTasks, uint256 _pos) private {
        _scheduledTasks.scheduledTasks[_pos + 1].scheduledTimestamp = _scheduledTasks
            .scheduledTasks[_pos]
            .scheduledTimestamp;
        _scheduledTasks.scheduledTasks[_pos + 1].data = _scheduledTasks.scheduledTasks[_pos].data;
    }

    function _insertScheduledTask(
        ScheduledTasksDataStorage storage _scheduledTasks,
        uint256 _pos,
        ScheduledTask memory scheduledTaskToInsert
    ) private {
        _scheduledTasks.scheduledTasks[_pos].scheduledTimestamp = scheduledTaskToInsert.scheduledTimestamp;
        _scheduledTasks.scheduledTasks[_pos].data = scheduledTaskToInsert.data;
        _scheduledTasks.scheduledTaskCount++;
    }
}
