// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {Common} from '../../../layer_1/common/Common.sol';
import {
    IScheduledTasks
} from '../../interfaces/scheduledTasks/scheduledTasks/IScheduledTasks.sol';
import {ScheduledTasksLib} from '../ScheduledTasksLib.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

abstract contract ScheduledTasks is IScheduledTasks, Common {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    function onScheduledTaskTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        bytes memory _data
    ) external override onlyAutoCalling(_scheduledTaskStorage().autoCalling) {
        _onScheduledTaskTriggered(_data);
    }

    function triggerPendingScheduledTasks()
        external
        override
        onlyUnpaused
        returns (uint256)
    {
        return _triggerScheduledTasks(0);
    }

    function triggerScheduledTasks(
        uint256 _max
    ) external override onlyUnpaused returns (uint256) {
        return _triggerScheduledTasks(_max);
    }

    function scheduledTaskCount() external view override returns (uint256) {
        return _getScheduledTaskCount();
    }

    function getScheduledTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        returns (ScheduledTasksLib.ScheduledTask[] memory scheduledTask_)
    {
        scheduledTask_ = _getScheduledTasks(_pageIndex, _pageLength);
    }
}
