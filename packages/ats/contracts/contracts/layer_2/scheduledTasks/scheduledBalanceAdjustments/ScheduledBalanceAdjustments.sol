// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {Common} from '../../../layer_1/common/Common.sol';
import {
    IScheduledBalanceAdjustments
} from '../../interfaces/scheduledTasks/scheduledBalanceAdjustments/IScheduledBalanceAdjustments.sol';
import {ScheduledTasksLib} from '../ScheduledTasksLib.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

abstract contract ScheduledBalanceAdjustments is
    IScheduledBalanceAdjustments,
    Common
{
    using EnumerableSet for EnumerableSet.Bytes32Set;

    function onScheduledBalanceAdjustmentTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        bytes memory _data
    )
        external
        override
        onlyAutoCalling(_scheduledBalanceAdjustmentStorage().autoCalling)
    {
        _onScheduledBalanceAdjustmentTriggered(_data);
    }

    function scheduledBalanceAdjustmentCount()
        external
        view
        override
        returns (uint256)
    {
        return _getScheduledBalanceAdjustmentCount();
    }

    function getScheduledBalanceAdjustments(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        override
        returns (
            ScheduledTasksLib.ScheduledTask[] memory scheduledBalanceAdjustment_
        )
    {
        scheduledBalanceAdjustment_ = _getScheduledBalanceAdjustments(
            _pageIndex,
            _pageLength
        );
    }
}
