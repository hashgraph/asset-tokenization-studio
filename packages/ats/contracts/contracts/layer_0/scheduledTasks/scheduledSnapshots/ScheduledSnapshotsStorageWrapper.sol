// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IScheduledSnapshots
} from '../../../layer_2/interfaces/scheduledTasks/scheduledSnapshots/IScheduledSnapshots.sol';
import {
    ScheduledTasksLib
} from '../../../layer_2/scheduledTasks/ScheduledTasksLib.sol';
import {ScheduledTasksCommon} from '../ScheduledTasksCommon.sol';
import {
    _SCHEDULED_SNAPSHOTS_STORAGE_POSITION
} from '../../constants/storagePositions.sol';
import {SNAPSHOT_RESULT_ID} from '../../constants/values.sol';
import {
    ScheduledTask,
    ScheduledTasksDataStorage
} from '../../../layer_2/interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol';

abstract contract ScheduledSnapshotsStorageWrapper is ScheduledTasksCommon {
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
            _triggerScheduledTasks(
                _scheduledSnapshotStorage(),
                _onScheduledSnapshotTriggered,
                _max,
                _blockTimestamp()
            );
    }

    function _onScheduledSnapshotTriggered(
        uint256 _pos,
        uint256 _scheduledTasksLength,
        ScheduledTask memory _scheduledTask
    ) internal {
        uint256 newSnapShotID;
        if (_pos == _scheduledTasksLength - 1) {
            newSnapShotID = _snapshot();
        } else newSnapShotID = _getCurrentSnapshotId();

        bytes memory data = _scheduledTask.data;

        if (data.length > 0) {
            bytes32 actionId = abi.decode(data, (bytes32));
            _updateCorporateActionResult(
                actionId,
                SNAPSHOT_RESULT_ID,
                abi.encodePacked(newSnapShotID)
            );
        }
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
    ) internal view returns (ScheduledTask[] memory scheduledSnapshot_) {
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
        returns (ScheduledTasksDataStorage storage scheduledSnapshots_)
    {
        bytes32 position = _SCHEDULED_SNAPSHOTS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledSnapshots_.slot := position
        }
    }
}
