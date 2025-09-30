// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {Common} from '../../../layer_1/common/Common.sol';
import {_CORPORATE_ACTION_ROLE} from '../../../layer_1/constants/roles.sol';
import {
    IScheduledBalanceAdjustments
} from '../../interfaces/scheduledTasks/scheduledBalanceAdjustments/IScheduledBalanceAdjustments.sol';
import {
    ScheduledTask
} from '../../interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {
    BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE
} from '../../constants/values.sol';

abstract contract ScheduledBalanceAdjustments is
    IScheduledBalanceAdjustments,
    Common
{
    using EnumerableSet for EnumerableSet.Bytes32Set;

    function setScheduledBalanceAdjustment(
        ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        onlyValidTimestamp(_newBalanceAdjustment.executionDate)
        validateFactor(_newBalanceAdjustment.factor)
        returns (bool success_, uint256 balanceAdjustmentID_)
    {
        bytes32 corporateActionID;
        (
            success_,
            corporateActionID,
            balanceAdjustmentID_
        ) = _setScheduledBalanceAdjustment(_newBalanceAdjustment);
        emit ScheduledBalanceAdjustmentSet(
            corporateActionID,
            balanceAdjustmentID_,
            _msgSender(),
            _newBalanceAdjustment.executionDate,
            _newBalanceAdjustment.factor,
            _newBalanceAdjustment.decimals
        );
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
        returns (ScheduledTask[] memory scheduledBalanceAdjustment_)
    {
        scheduledBalanceAdjustment_ = _getScheduledBalanceAdjustments(
            _pageIndex,
            _pageLength
        );
    }

    function getScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentID
    )
        external
        view
        override
        onlyMatchingActionType(
            BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
            _balanceAdjustmentID - 1
        )
        returns (ScheduledBalanceAdjustment memory balanceAdjustment_)
    {
        return _getScheduledBalanceAdjusment(_balanceAdjustmentID);
    }
}
