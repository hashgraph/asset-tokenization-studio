// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ScheduledSnapshotsStorageWrapper
} from '../scheduledSnapshots/ScheduledSnapshotsStorageWrapper.sol';
import {
    ScheduledTasksLib
} from '../../../layer_2/scheduledTasks/ScheduledTasksLib.sol';
import {
    _SCHEDULED_BALANCE_ADJUSTMENTS_STORAGE_POSITION
} from '../../constants/storagePositions.sol';
import {IEquity} from '../../../layer_2/interfaces/equity/IEquity.sol';
import {
    ScheduledTask,
    ScheduledTasksDataStorage
} from '../../../layer_2/interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol';

abstract contract ScheduledBalanceAdjustmentsStorageWrapper is
    ScheduledSnapshotsStorageWrapper
{
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
        IEquity.ScheduledBalanceAdjustment memory balanceAdjustment = abi
            .decode(
                balanceAdjustmentData,
                (IEquity.ScheduledBalanceAdjustment)
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

                IEquity.ScheduledBalanceAdjustment
                    memory balanceAdjustment = abi.decode(
                        balanceAdjustmentData,
                        (IEquity.ScheduledBalanceAdjustment)
                    );
                pendingABAF_ *= balanceAdjustment.factor;
                pendingDecimals_ += balanceAdjustment.decimals;
            } else {
                break;
            }
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
