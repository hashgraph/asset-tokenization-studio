// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {ScheduledTask} from '../scheduledTasksCommon/IScheduledTasksCommon.sol';

interface IScheduledBalanceAdjustments {
    struct ScheduledBalanceAdjustment {
        uint256 executionDate;
        uint256 factor;
        uint8 decimals;
    }

    event ScheduledBalanceAdjustmentSet(
        bytes32 corporateActionId,
        uint256 balanceAdjustmentId,
        address indexed operator,
        uint256 indexed executionDate,
        uint256 factor,
        uint256 decimals
    );

    error BalanceAdjustmentCreationFailed();

    /**
     * @notice Sets a new scheduled balance adjustment
     * @dev The task is added to the queue and executed when the execution date is reached
     */
    function setScheduledBalanceAdjustment(
        ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    ) external returns (bool success_, uint256 balanceAdjustmentID_);

    function scheduledBalanceAdjustmentCount() external view returns (uint256);

    function getScheduledBalanceAdjustments(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        returns (ScheduledTask[] memory scheduledBalanceAdjustment_);

    /**
     * @notice Returns the details of a previously scheduled balance adjustment
     */
    function getScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentID
    )
        external
        view
        returns (ScheduledBalanceAdjustment memory balanceAdjustment_);
}
