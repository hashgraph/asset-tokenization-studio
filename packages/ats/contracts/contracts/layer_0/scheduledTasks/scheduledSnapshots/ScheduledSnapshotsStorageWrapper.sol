// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledTasksLib } from "../../../layer_2/scheduledTasks/ScheduledTasksLib.sol";
import { ScheduledTasksCommon } from "../ScheduledTasksCommon.sol";
import { _SCHEDULED_SNAPSHOTS_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { SNAPSHOT_RESULT_ID } from "../../constants/values.sol";
import {
    ScheduledTask,
    ScheduledTasksDataStorage
} from "../../../layer_2/interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";

abstract contract ScheduledSnapshotsStorageWrapper is ScheduledTasksCommon {
    function _addScheduledSnapshot(uint256 _newScheduledTimestamp, bytes32 _actionId) internal override {
        ScheduledTasksLib.addScheduledTask(_scheduledSnapshotStorage(), _newScheduledTimestamp, abi.encode(_actionId));
    }

    function _triggerScheduledSnapshots(uint256 _max) internal override returns (uint256) {
        return
            _triggerScheduledTasks(_scheduledSnapshotStorage(), _onScheduledSnapshotTriggered, _max, _blockTimestamp());
    }

    function _onScheduledSnapshotTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        ScheduledTask memory _scheduledTask
    ) internal override {
        uint256 newSnapShotID = _snapshot();

        bytes memory data = _scheduledTask.data;

        bytes32 actionId = abi.decode(data, (bytes32));
        _updateCorporateActionResult(actionId, SNAPSHOT_RESULT_ID, abi.encodePacked(newSnapShotID));
    }

    function _getScheduledSnapshotCount() internal view override returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(_scheduledSnapshotStorage());
    }

    function _getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (ScheduledTask[] memory scheduledSnapshot_) {
        return ScheduledTasksLib.getScheduledTasks(_scheduledSnapshotStorage(), _pageIndex, _pageLength);
    }

    function _scheduledSnapshotStorage() internal pure returns (ScheduledTasksDataStorage storage scheduledSnapshots_) {
        bytes32 position = _SCHEDULED_SNAPSHOTS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledSnapshots_.slot := position
        }
    }
}
