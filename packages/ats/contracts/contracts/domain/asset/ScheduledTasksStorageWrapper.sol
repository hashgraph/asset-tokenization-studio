// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledTasksLib } from "../../facets/layer_2/scheduledTask/ScheduledTasksLib.sol";
import {
    ScheduledTask,
    ScheduledTasksDataStorage
} from "../../facets/layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon.sol";
import {
    IScheduledCrossOrderedTasks
} from "../../facets/layer_2/scheduledTask/scheduledCrossOrderedTask/IScheduledCrossOrderedTasks.sol";
import { IEquity } from "../../facets/layer_2/equity/IEquity.sol";
import { ISnapshotsStorageWrapper } from "../../facets/layer_1/snapshot/ISnapshots.sol";
import {
    _SCHEDULED_SNAPSHOTS_STORAGE_POSITION,
    _SCHEDULED_COUPON_LISTING_STORAGE_POSITION,
    _SCHEDULED_BALANCE_ADJUSTMENTS_STORAGE_POSITION,
    _SCHEDULED_CROSS_ORDERED_TASKS_STORAGE_POSITION
} from "../../constants/storagePositions.sol";
import {
    SNAPSHOT_RESULT_ID,
    COUPON_LISTING_RESULT_ID,
    SNAPSHOT_TASK_TYPE,
    BALANCE_ADJUSTMENT_TASK_TYPE
} from "../../constants/values.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { BondStorageWrapper } from "./BondStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";

library ScheduledTasksStorageWrapper {
    error WrongTimestamp(uint256 timeStamp);

    // --- Common ---

    // solhint-disable-next-line ordering
    function _requireValidTimestamp(uint256 _timestamp) internal view {
        if (_timestamp <= block.timestamp) revert WrongTimestamp(_timestamp);
    }

    // solhint-disable-next-line ordering
    function _triggerScheduledTasks(
        ScheduledTasksDataStorage storage _scheduledTasks,
        bytes32 callbackType,
        uint256 _max
    ) internal returns (uint256) {
        uint256 scheduledTasksLength = ScheduledTasksLib.getScheduledTaskCount(_scheduledTasks);

        if (scheduledTasksLength == 0) {
            return 0;
        }

        uint256 max = _max;

        if (max > scheduledTasksLength || max == 0) {
            max = scheduledTasksLength;
        }

        for (uint256 j = 1; j <= max; j++) {
            uint256 pos = scheduledTasksLength - j;

            ScheduledTask memory currentScheduledTask = ScheduledTasksLib.getScheduledTasksByIndex(
                _scheduledTasks,
                pos
            );

            if (currentScheduledTask.scheduledTimestamp < block.timestamp) {
                ScheduledTasksLib.popScheduledTask(_scheduledTasks);

                if (callbackType == bytes32("snapshot")) {
                    _onScheduledSnapshotTriggered(pos, scheduledTasksLength, currentScheduledTask);
                } else if (callbackType == bytes32("coupon")) {
                    _onScheduledCouponListingTriggered(pos, scheduledTasksLength, currentScheduledTask);
                } else if (callbackType == bytes32("balance")) {
                    _onScheduledBalanceAdjustmentTriggered(pos, scheduledTasksLength, currentScheduledTask);
                } else if (callbackType == bytes32("crossOrdered")) {
                    _onScheduledCrossOrderedTaskTriggered(pos, scheduledTasksLength, currentScheduledTask);
                }
            } else {
                break;
            }
        }

        return 0;
    }

    // --- Scheduled Snapshots ---

    function _scheduledSnapshotStorage() internal pure returns (ScheduledTasksDataStorage storage scheduledSnapshots_) {
        bytes32 position = _SCHEDULED_SNAPSHOTS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledSnapshots_.slot := position
        }
    }

    function _addScheduledSnapshot(uint256 _newScheduledTimestamp, bytes32 _actionId) internal {
        ScheduledTasksLib.addScheduledTask(_scheduledSnapshotStorage(), _newScheduledTimestamp, abi.encode(_actionId));
    }

    function _triggerScheduledSnapshots(uint256 _max) internal returns (uint256) {
        return _triggerScheduledTasks(_scheduledSnapshotStorage(), bytes32("snapshot"), _max);
    }

    function _onScheduledSnapshotTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        ScheduledTask memory _scheduledTask
    ) private {
        bytes memory data = _scheduledTask.data;
        bytes32 actionId = abi.decode(data, (bytes32));

        uint256 newSnapShotID = SnapshotsStorageWrapper._takeSnapshot();
        emit ISnapshotsStorageWrapper.SnapshotTriggered(newSnapShotID, abi.encodePacked(actionId));
        CorporateActionsStorageWrapper._updateCorporateActionResult(
            actionId,
            SNAPSHOT_RESULT_ID,
            abi.encodePacked(newSnapShotID)
        );
    }

    function _getScheduledSnapshotCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(_scheduledSnapshotStorage());
    }

    function _getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledSnapshot_) {
        return ScheduledTasksLib.getScheduledTasks(_scheduledSnapshotStorage(), _pageIndex, _pageLength);
    }

    // --- Scheduled Coupon Listing ---

    function _scheduledCouponListingStorage()
        internal
        pure
        returns (ScheduledTasksDataStorage storage scheduledCouponListing_)
    {
        bytes32 position = _SCHEDULED_COUPON_LISTING_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledCouponListing_.slot := position
        }
    }

    function _addScheduledCouponListing(uint256 _newScheduledTimestamp, bytes32 _actionId) internal {
        ScheduledTasksLib.addScheduledTask(
            _scheduledCouponListingStorage(),
            _newScheduledTimestamp,
            abi.encode(_actionId)
        );
    }

    function _triggerScheduledCouponListing(uint256 _max) internal returns (uint256) {
        return _triggerScheduledTasks(_scheduledCouponListingStorage(), bytes32("coupon"), _max);
    }

    function _onScheduledCouponListingTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        ScheduledTask memory _scheduledTask
    ) private {
        bytes memory data = _scheduledTask.data;

        bytes32 actionId = abi.decode(data, (bytes32));

        BondStorageWrapper._addToCouponsOrderedList(uint256(actionId));
        uint256 pos = BondStorageWrapper._getCouponsOrderedListTotal();

        CorporateActionsStorageWrapper._updateCorporateActionResult(
            actionId,
            COUPON_LISTING_RESULT_ID,
            abi.encodePacked(pos)
        );
    }

    function _getScheduledCouponListingCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(_scheduledCouponListingStorage());
    }

    function _getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledCouponListing_) {
        return ScheduledTasksLib.getScheduledTasks(_scheduledCouponListingStorage(), _pageIndex, _pageLength);
    }

    function _getPendingScheduledCouponListingTotalAt(uint256 _timestamp) internal view returns (uint256 total_) {
        total_ = 0;

        ScheduledTasksDataStorage storage scheduledCouponListing = _scheduledCouponListingStorage();

        uint256 scheduledTaskCount = ScheduledTasksLib.getScheduledTaskCount(scheduledCouponListing);

        for (uint256 i = 1; i <= scheduledTaskCount; i++) {
            uint256 pos = scheduledTaskCount - i;

            ScheduledTask memory scheduledTask = ScheduledTasksLib.getScheduledTasksByIndex(
                scheduledCouponListing,
                pos
            );

            if (scheduledTask.scheduledTimestamp < _timestamp) {
                total_++;
            } else {
                break;
            }
        }
    }

    function _getScheduledCouponListingIdAtIndex(uint256 _index) internal view returns (uint256 couponID_) {
        ScheduledTask memory couponListing = ScheduledTasksLib.getScheduledTasksByIndex(
            _scheduledCouponListingStorage(),
            _index
        );

        bytes32 actionId = abi.decode(couponListing.data, (bytes32));

        (, couponID_, ) = CorporateActionsStorageWrapper._getCorporateAction(actionId);
    }

    // --- Scheduled Balance Adjustments ---

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

    function _addScheduledBalanceAdjustment(uint256 _newScheduledTimestamp, bytes32 _actionId) internal {
        ScheduledTasksLib.addScheduledTask(
            _scheduledBalanceAdjustmentStorage(),
            _newScheduledTimestamp,
            abi.encode(_actionId)
        );
    }

    function _triggerScheduledBalanceAdjustments(uint256 _max) internal returns (uint256) {
        return _triggerScheduledTasks(_scheduledBalanceAdjustmentStorage(), bytes32("balance"), _max);
    }

    function _onScheduledBalanceAdjustmentTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        ScheduledTask memory _scheduledTask
    ) private {
        bytes memory data = _scheduledTask.data;

        (, , bytes memory balanceAdjustmentData) = CorporateActionsStorageWrapper._getCorporateAction(
            abi.decode(data, (bytes32))
        );
        IEquity.ScheduledBalanceAdjustment memory balanceAdjustment = abi.decode(
            balanceAdjustmentData,
            (IEquity.ScheduledBalanceAdjustment)
        );
        AdjustBalancesStorageWrapper._adjustBalances(balanceAdjustment.factor, balanceAdjustment.decimals);
    }

    function _getScheduledBalanceAdjustmentCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(_scheduledBalanceAdjustmentStorage());
    }

    function _getScheduledBalanceAdjustments(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledBalanceAdjustment_) {
        return ScheduledTasksLib.getScheduledTasks(_scheduledBalanceAdjustmentStorage(), _pageIndex, _pageLength);
    }

    function _getPendingScheduledBalanceAdjustmentsAt(
        uint256 _timestamp
    ) internal view returns (uint256 pendingABAF_, uint8 pendingDecimals_) {
        // * Initialization
        pendingABAF_ = 1;
        pendingDecimals_ = 0;

        ScheduledTasksDataStorage storage scheduledBalanceAdjustments = _scheduledBalanceAdjustmentStorage();

        uint256 scheduledTaskCount = ScheduledTasksLib.getScheduledTaskCount(scheduledBalanceAdjustments);

        for (uint256 i = 1; i <= scheduledTaskCount; i++) {
            uint256 pos = scheduledTaskCount - i;

            ScheduledTask memory scheduledTask = ScheduledTasksLib.getScheduledTasksByIndex(
                scheduledBalanceAdjustments,
                pos
            );

            if (scheduledTask.scheduledTimestamp < _timestamp) {
                bytes32 actionId = abi.decode(scheduledTask.data, (bytes32));

                bytes memory balanceAdjustmentData = CorporateActionsStorageWrapper._getCorporateActionData(actionId);

                IEquity.ScheduledBalanceAdjustment memory balanceAdjustment = abi.decode(
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

    // --- Scheduled Cross-Ordered Tasks ---

    function _scheduledCrossOrderedTaskStorage()
        internal
        pure
        returns (ScheduledTasksDataStorage storage scheduledCrossOrderedTasks_)
    {
        bytes32 position = _SCHEDULED_CROSS_ORDERED_TASKS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledCrossOrderedTasks_.slot := position
        }
    }

    function _addScheduledCrossOrderedTask(uint256 _newScheduledTimestamp, bytes32 _taskType) internal {
        ScheduledTasksLib.addScheduledTask(
            _scheduledCrossOrderedTaskStorage(),
            _newScheduledTimestamp,
            abi.encode(_taskType)
        );
    }

    function _triggerScheduledCrossOrderedTasks(uint256 _max) internal returns (uint256) {
        return _triggerScheduledTasks(_scheduledCrossOrderedTaskStorage(), bytes32("crossOrdered"), _max);
    }

    function _callTriggerPendingScheduledCrossOrderedTasks() internal returns (uint256) {
        return IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();
    }

    function _onScheduledCrossOrderedTaskTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        ScheduledTask memory _scheduledTask
    ) private {
        bytes memory data = _scheduledTask.data;

        bytes32 taskType = abi.decode(data, (bytes32));

        if (taskType == SNAPSHOT_TASK_TYPE) {
            _triggerScheduledSnapshots(1);
            return;
        }
        if (taskType == BALANCE_ADJUSTMENT_TASK_TYPE) {
            _triggerScheduledBalanceAdjustments(1);
            return;
        }
    }

    function _getScheduledCrossOrderedTaskCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(_scheduledCrossOrderedTaskStorage());
    }

    function _getScheduledCrossOrderedTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledTask_) {
        return ScheduledTasksLib.getScheduledTasks(_scheduledCrossOrderedTaskStorage(), _pageIndex, _pageLength);
    }
}
