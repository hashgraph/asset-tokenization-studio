// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {Common} from '../../../layer_1/common/Common.sol';
import {
    IScheduledSnapshots
} from '../../interfaces/scheduledTasks/scheduledSnapshots/IScheduledSnapshots.sol';
import {ScheduledTasksLib} from '../ScheduledTasksLib.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

abstract contract ScheduledSnapshots is IScheduledSnapshots, Common {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    function onScheduledSnapshotTriggered(
        uint256 _pos,
        uint256 _scheduledTasksLength,
        bytes memory _data
    )
        external
        override
        onlyAutoCalling(_scheduledSnapshotStorage().autoCalling)
    {
        uint256 newSnapShotID;
        if (_pos == _scheduledTasksLength - 1) {
            newSnapShotID = _snapshot();
        } else newSnapShotID = _getCurrentSnapshotId();

        _onScheduledSnapshotTriggered(newSnapShotID, _data);
    }

    function scheduledSnapshotCount() external view override returns (uint256) {
        return _getScheduledSnapshotCount();
    }

    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        returns (ScheduledTasksLib.ScheduledTask[] memory scheduledSnapshot_)
    {
        scheduledSnapshot_ = _getScheduledSnapshots(_pageIndex, _pageLength);
    }
}
