// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IScheduledBalanceAdjustments
} from '../../../layer_2/interfaces/scheduledTasks/scheduledBalanceAdjustments/IScheduledBalanceAdjustments.sol';
import {
    ScheduledSnapshotsStorageWrapper
} from '../scheduledSnapshots/ScheduledSnapshotsStorageWrapper.sol';
import {
    ScheduledTasksLib
} from '../../../layer_2/scheduledTasks/ScheduledTasksLib.sol';
import {
    _SCHEDULED_BALANCE_ADJUSTMENTS_STORAGE_POSITION
} from '../../constants/storagePositions.sol';
import {
    ScheduledTask,
    ScheduledTasksDataStorage
} from '../../../layer_2/interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol';
import {
    BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
    BALANCE_ADJUSTMENT_TASK_TYPE
} from '../../../layer_2/constants/values.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

abstract contract ScheduledBalanceAdjustmentsStorageWrapper is
    ScheduledSnapshotsStorageWrapper
{
    using EnumerableSet for EnumerableSet.Bytes32Set;

    function _setScheduledBalanceAdjustment(
        IScheduledBalanceAdjustments.ScheduledBalanceAdjustment
            calldata _newBalanceAdjustment
    )
        internal
        returns (
            bool success_,
            bytes32 corporateActionId_,
            uint256 balanceAdjustmentID_
        )
    {
        bytes memory data = abi.encode(_newBalanceAdjustment);

        (
            success_,
            corporateActionId_,
            balanceAdjustmentID_
        ) = _addCorporateAction(BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE, data);

        _initBalanceAdjustment(success_, corporateActionId_, data);
    }

    function _initBalanceAdjustment(
        bool _success,
        bytes32 _actionId,
        bytes memory _data
    ) internal {
        if (!_success) {
            revert IScheduledBalanceAdjustments
                .BalanceAdjustmentCreationFailed();
        }

        IScheduledBalanceAdjustments.ScheduledBalanceAdjustment
            memory newBalanceAdjustment = abi.decode(
                _data,
                (IScheduledBalanceAdjustments.ScheduledBalanceAdjustment)
            );

        _addScheduledCrossOrderedTask(
            newBalanceAdjustment.executionDate,
            abi.encode(BALANCE_ADJUSTMENT_TASK_TYPE)
        );
        _addScheduledBalanceAdjustment(
            newBalanceAdjustment.executionDate,
            abi.encode(_actionId)
        );
    }

    function _addScheduledCrossOrderedTask(
        uint256 _newScheduledTimestamp,
        bytes memory _newData
    ) internal virtual;

    function _addScheduledBalanceAdjustment(
        uint256 _newScheduledTimestamp,
        bytes memory _newData
    ) internal {
        ScheduledTasksLib.addScheduledTask(
            _scheduledBalanceAdjustmentStorage(),
            _newScheduledTimestamp,
            _newData
        );
    }

    function _triggerScheduledBalanceAdjustments(
        uint256 _max
    ) internal returns (uint256) {
        return
            _triggerScheduledTasks(
                _scheduledBalanceAdjustmentStorage(),
                _onScheduledBalanceAdjustmentTriggered,
                _max,
                _blockTimestamp()
            );
    }

    function _onScheduledBalanceAdjustmentTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        ScheduledTask memory _scheduledTask
    ) internal {
        bytes memory data = _scheduledTask.data;

        if (data.length == 0) return;
        (, bytes memory balanceAdjustmentData) = _getCorporateAction(
            abi.decode(data, (bytes32))
        );
        if (balanceAdjustmentData.length == 0) return;
        IScheduledBalanceAdjustments.ScheduledBalanceAdjustment
            memory balanceAdjustment = abi.decode(
                balanceAdjustmentData,
                (IScheduledBalanceAdjustments.ScheduledBalanceAdjustment)
            );
        _adjustBalances(balanceAdjustment.factor, balanceAdjustment.decimals);
    }

    function _adjustBalances(uint256 _factor, uint8 _decimals) internal virtual;

    function _getScheduledBalanceAdjustmentCount()
        internal
        view
        returns (uint256)
    {
        return
            ScheduledTasksLib.getScheduledTaskCount(
                _scheduledBalanceAdjustmentStorage()
            );
    }

    function _getScheduledBalanceAdjustments(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        internal
        view
        returns (ScheduledTask[] memory scheduledBalanceAdjustment_)
    {
        return
            ScheduledTasksLib.getScheduledTasks(
                _scheduledBalanceAdjustmentStorage(),
                _pageIndex,
                _pageLength
            );
    }

    function _getPendingScheduledBalanceAdjustmentsAt(
        uint256 _timestamp
    ) internal view returns (uint256 pendingABAF_, uint8 pendingDecimals_) {
        // * Initialization
        pendingABAF_ = 1;
        pendingDecimals_ = 0;

        ScheduledTasksDataStorage
            storage scheduledBalanceAdjustments = _scheduledBalanceAdjustmentStorage();

        uint256 scheduledTaskCount = ScheduledTasksLib.getScheduledTaskCount(
            scheduledBalanceAdjustments
        );

        for (uint256 i = 1; i <= scheduledTaskCount; i++) {
            uint256 pos = scheduledTaskCount - i;

            ScheduledTask memory scheduledTask = ScheduledTasksLib
                .getScheduledTasksByIndex(scheduledBalanceAdjustments, pos);

            if (scheduledTask.scheduledTimestamp < _timestamp) {
                bytes32 actionId = abi.decode(scheduledTask.data, (bytes32));

                bytes memory balanceAdjustmentData = _getCorporateActionData(
                    actionId
                );

                IScheduledBalanceAdjustments.ScheduledBalanceAdjustment
                    memory balanceAdjustment = abi.decode(
                        balanceAdjustmentData,
                        (
                            IScheduledBalanceAdjustments
                                .ScheduledBalanceAdjustment
                        )
                    );
                pendingABAF_ *= balanceAdjustment.factor;
                pendingDecimals_ += balanceAdjustment.decimals;
            } else {
                break;
            }
        }
    }

    function _getScheduledBalanceAdjusment(
        uint256 _balanceAdjustmentID
    )
        internal
        view
        returns (
            IScheduledBalanceAdjustments.ScheduledBalanceAdjustment
                memory balanceAdjustment_
        )
    {
        bytes32 actionId = _corporateActionsStorage()
            .actionsByType[BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE]
            .at(_balanceAdjustmentID - 1);

        (, bytes memory data) = _getCorporateAction(actionId);

        if (data.length > 0) {
            (balanceAdjustment_) = abi.decode(
                data,
                (IScheduledBalanceAdjustments.ScheduledBalanceAdjustment)
            );
        }
    }

    function _scheduledBalanceAdjustmentStorage()
        internal
        pure
        returns (ScheduledTasksDataStorage storage scheduledBalanceAdjustments_)
    {
        bytes32 position = _SCHEDULED_BALANCE_ADJUSTMENTS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledBalanceAdjustments_.slot := position
        }
    }
}
