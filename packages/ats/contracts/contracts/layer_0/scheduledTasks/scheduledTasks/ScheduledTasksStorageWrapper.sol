// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IScheduledTasks
} from '../../../layer_2/interfaces/scheduledTasks/scheduledTasks/IScheduledTasks.sol';
import {
    ScheduledTasksLib
} from '../../../layer_2/scheduledTasks/ScheduledTasksLib.sol';
import {
    _SCHEDULED_TASKS_STORAGE_POSITION
} from '../../constants/storagePositions.sol';
import {ScheduledTasksCommon} from '../ScheduledTasksCommon.sol';

abstract contract ScheduledTasksStorageWrapper is ScheduledTasksCommon {
    function _addScheduledTask(
        uint256 _newScheduledTimestamp,
        bytes memory _newData
    ) internal {
        ScheduledTasksLib.addScheduledTask(
            _scheduledTaskStorage(),
            _newScheduledTimestamp,
            _newData
        );
    }

    function _triggerScheduledTasks(uint256 _max) internal returns (uint256) {
        return
            ScheduledTasksLib.triggerScheduledTasks(
                _scheduledTaskStorage(),
                IScheduledTasks.onScheduledTaskTriggered.selector,
                _max,
                _blockTimestamp()
            );
    }

    function _getScheduledTaskCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(_scheduledTaskStorage());
    }

    function _getScheduledTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        internal
        view
        returns (ScheduledTasksLib.ScheduledTask[] memory scheduledTask_)
    {
        return
            ScheduledTasksLib.getScheduledTasks(
                _scheduledTaskStorage(),
                _pageIndex,
                _pageLength
            );
    }

    function _scheduledTaskStorage()
        internal
        pure
        returns (
            ScheduledTasksLib.ScheduledTasksDataStorage storage scheduledTasks_
        )
    {
        bytes32 position = _SCHEDULED_TASKS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledTasks_.slot := position
        }
    }
}
