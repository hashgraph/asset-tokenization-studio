// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IScheduledSnapshots
} from '../../../layer_2/interfaces/scheduledTasks/scheduledSnapshots/IScheduledSnapshots.sol';
import {
    ScheduledTasksLib
} from '../../../layer_2/scheduledTasks/ScheduledTasksLib.sol';
import {
    ScheduledTasksStorageWrapper
} from '../scheduledTasks/ScheduledTasksStorageWrapper.sol';
import {
    _SCHEDULED_SNAPSHOTS_STORAGE_POSITION
} from '../../constants/storagePositions.sol';

abstract contract ScheduledSnapshotsStorageWrapperRead is
    ScheduledTasksStorageWrapper
{
    function _addScheduledSnapshot(
        uint256 _newScheduledTimestamp,
        bytes memory _newData
    ) internal {
        ScheduledTasksLib.addScheduledTask(
            _scheduledSnapshotStorage(),
            _newScheduledTimestamp,
            _newData
        );
    }

    function _triggerScheduledSnapshots(
        uint256 _max
    ) internal returns (uint256) {
        return
            ScheduledTasksLib.triggerScheduledTasks(
                _scheduledSnapshotStorage(),
                IScheduledSnapshots.onScheduledSnapshotTriggered.selector,
                _max,
                _blockTimestamp()
            );
    }

    function _getScheduledSnapshotCount() internal view returns (uint256) {
        return
            ScheduledTasksLib.getScheduledTaskCount(
                _scheduledSnapshotStorage()
            );
    }

    function _getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        internal
        view
        returns (ScheduledTasksLib.ScheduledTask[] memory scheduledSnapshot_)
    {
        return
            ScheduledTasksLib.getScheduledTasks(
                _scheduledSnapshotStorage(),
                _pageIndex,
                _pageLength
            );
    }

    function _scheduledSnapshotStorage()
        internal
        pure
        returns (
            ScheduledTasksLib.ScheduledTasksDataStorage
                storage scheduledSnapshots_
        )
    {
        bytes32 position = _SCHEDULED_SNAPSHOTS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledSnapshots_.slot := position
        }
    }
}
