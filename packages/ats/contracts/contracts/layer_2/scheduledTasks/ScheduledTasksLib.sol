// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {LibCommon} from '../../layer_0/common/libraries/LibCommon.sol';

library ScheduledTasksLib {
    struct ScheduledTask {
        uint256 scheduledTimestamp;
        bytes data;
    }

    struct ScheduledTasksDataStorage {
        mapping(uint256 => ScheduledTask) scheduledTasks;
        uint256 scheduledTaskCount;
        bool autoCalling;
    }

    function addScheduledTask(
        ScheduledTasksDataStorage storage _scheduledTasks,
        uint256 _newScheduledTimestamp,
        bytes memory _newData
    ) internal {
        ScheduledTask memory newScheduledTask = ScheduledTask(
            _newScheduledTimestamp,
            _newData
        );

        uint256 scheduledTasksLength = getScheduledTaskCount(_scheduledTasks);

        uint256 newScheduledTaskId = scheduledTasksLength;

        bool added = false;

        if (scheduledTasksLength > 0) {
            for (uint256 index = 1; index <= scheduledTasksLength; index++) {
                uint256 scheduledTaskPosition = scheduledTasksLength - index;

                if (
                    _scheduledTasks
                        .scheduledTasks[scheduledTaskPosition]
                        .scheduledTimestamp < _newScheduledTimestamp
                ) {
                    _slideScheduledTasks(
                        _scheduledTasks,
                        scheduledTaskPosition
                    );
                } else {
                    newScheduledTaskId = scheduledTaskPosition + 1;
                    _insertScheduledTask(
                        _scheduledTasks,
                        newScheduledTaskId,
                        newScheduledTask
                    );
                    added = true;
                    break;
                }
            }
        }
        if (!added) {
            _insertScheduledTask(_scheduledTasks, 0, newScheduledTask);
        }
    }

    function triggerScheduledTasks(
        ScheduledTasksDataStorage storage _scheduledTasks,
        bytes4 onScheduledTaskTriggeredSelector,
        uint256 _max,
        uint256 _timestamp
    ) internal returns (uint256) {
        uint256 scheduledTasksLength = getScheduledTaskCount(_scheduledTasks);

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

            ScheduledTask
                memory currentScheduledTask = getScheduledTasksByIndex(
                    _scheduledTasks,
                    pos
                );

            if (currentScheduledTask.scheduledTimestamp < _timestamp) {
                _popScheduledTask(_scheduledTasks);

                _scheduledTasks.autoCalling = true;

                // solhint-disable-next-line avoid-low-level-calls
                (bool success, bytes memory data) = address(this).delegatecall(
                    abi.encodeWithSelector(
                        onScheduledTaskTriggeredSelector,
                        pos,
                        scheduledTasksLength,
                        currentScheduledTask.data
                    )
                );
                if (!success) {
                    if (data.length > 0) {
                        // solhint-disable-next-line no-inline-assembly
                        assembly {
                            let returndata_size := mload(data)
                            revert(add(32, data), returndata_size)
                        }
                    } else {
                        // solhint-disable-next-line custom-errors
                        revert(
                            'onScheduledTaskTriggered method failed without reason'
                        );
                    }
                }

                _scheduledTasks.autoCalling = false;
            } else {
                break;
            }
        }

        return newTaskID;
    }

    function getScheduledTaskCount(
        ScheduledTasksDataStorage storage _scheduledTasks
    ) internal view returns (uint256) {
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
        (uint256 start, uint256 end) = LibCommon.getStartAndEnd(
            _pageIndex,
            _pageLength
        );

        scheduledTask_ = new ScheduledTask[](
            LibCommon.getSize(
                start,
                end,
                getScheduledTaskCount(_scheduledTasks)
            )
        );

        for (uint256 i = 0; i < scheduledTask_.length; i++) {
            scheduledTask_[i] = getScheduledTasksByIndex(
                _scheduledTasks,
                start + i
            );
        }
    }

    function _slideScheduledTasks(
        ScheduledTasksDataStorage storage _scheduledTasks,
        uint256 _pos
    ) private {
        _scheduledTasks
            .scheduledTasks[_pos + 1]
            .scheduledTimestamp = _scheduledTasks
            .scheduledTasks[_pos]
            .scheduledTimestamp;
        _scheduledTasks.scheduledTasks[_pos + 1].data = _scheduledTasks
            .scheduledTasks[_pos]
            .data;
    }

    function _insertScheduledTask(
        ScheduledTasksDataStorage storage _scheduledTasks,
        uint256 _pos,
        ScheduledTask memory scheduledTaskToInsert
    ) private {
        _scheduledTasks
            .scheduledTasks[_pos]
            .scheduledTimestamp = scheduledTaskToInsert.scheduledTimestamp;
        _scheduledTasks.scheduledTasks[_pos].data = scheduledTaskToInsert.data;
        _scheduledTasks.scheduledTaskCount++;
    }

    function _popScheduledTask(
        ScheduledTasksDataStorage storage _scheduledTasks
    ) private {
        uint256 scheduledTasksLength = getScheduledTaskCount(_scheduledTasks);
        if (scheduledTasksLength == 0) {
            return;
        }
        delete (_scheduledTasks.scheduledTasks[scheduledTasksLength - 1]);
        _scheduledTasks.scheduledTaskCount--;
    }
}
