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
// Forward references
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { BondStorageWrapper } from "./BondStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";

library ScheduledTasksStorageWrapper {
    error WrongTimestamp(uint256 timeStamp);

    // --- Common ---

    // solhint-disable-next-line ordering
    function requireValidTimestamp(uint256 _timestamp) internal view {
        if (_timestamp <= block.timestamp) revert WrongTimestamp(_timestamp);
    }

    // solhint-disable-next-line ordering
    function triggerScheduledTasks(
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

    function scheduledSnapshotStorage() internal pure returns (ScheduledTasksDataStorage storage scheduledSnapshots_) {
        bytes32 position = _SCHEDULED_SNAPSHOTS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledSnapshots_.slot := position
        }
    }

    function addScheduledSnapshot(uint256 _newScheduledTimestamp, bytes32 _actionId) internal {
        ScheduledTasksLib.addScheduledTask(scheduledSnapshotStorage(), _newScheduledTimestamp, abi.encode(_actionId));
    }

    function triggerScheduledSnapshots(uint256 _max) internal returns (uint256) {
        return triggerScheduledTasks(scheduledSnapshotStorage(), bytes32("snapshot"), _max);
    }

    function _onScheduledSnapshotTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        ScheduledTask memory _scheduledTask
    ) private {
        bytes memory data = _scheduledTask.data;
        bytes32 actionId = abi.decode(data, (bytes32));

        uint256 newSnapShotID = SnapshotsStorageWrapper.takeSnapshot();
        emit ISnapshotsStorageWrapper.SnapshotTriggered(newSnapShotID, abi.encodePacked(actionId));
        CorporateActionsStorageWrapper.updateCorporateActionResult(
            actionId,
            SNAPSHOT_RESULT_ID,
            abi.encodePacked(newSnapShotID)
        );
    }

    function getScheduledSnapshotCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(scheduledSnapshotStorage());
    }

    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledSnapshot_) {
        return ScheduledTasksLib.getScheduledTasks(scheduledSnapshotStorage(), _pageIndex, _pageLength);
    }

    // --- Scheduled Coupon Listing ---

    function scheduledCouponListingStorage()
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

    function addScheduledCouponListing(uint256 _newScheduledTimestamp, bytes32 _actionId) internal {
        ScheduledTasksLib.addScheduledTask(
            scheduledCouponListingStorage(),
            _newScheduledTimestamp,
            abi.encode(_actionId)
        );
    }

    function triggerScheduledCouponListing(uint256 _max) internal returns (uint256) {
        return triggerScheduledTasks(scheduledCouponListingStorage(), bytes32("coupon"), _max);
    }

    function _onScheduledCouponListingTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        ScheduledTask memory _scheduledTask
    ) private {
        bytes memory data = _scheduledTask.data;

        bytes32 actionId = abi.decode(data, (bytes32));

        BondStorageWrapper.addToCouponsOrderedList(uint256(actionId));
        uint256 pos = BondStorageWrapper.getCouponsOrderedListTotal();

        CorporateActionsStorageWrapper.updateCorporateActionResult(
            actionId,
            COUPON_LISTING_RESULT_ID,
            abi.encodePacked(pos)
        );
    }

    function getScheduledCouponListingCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(scheduledCouponListingStorage());
    }

    function getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledCouponListing_) {
        return ScheduledTasksLib.getScheduledTasks(scheduledCouponListingStorage(), _pageIndex, _pageLength);
    }

    function getPendingScheduledCouponListingTotalAt(uint256 _timestamp) internal view returns (uint256 total_) {
        total_ = 0;

        ScheduledTasksDataStorage storage scheduledCouponListing = scheduledCouponListingStorage();

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

    function getScheduledCouponListingIdAtIndex(uint256 _index) internal view returns (uint256 couponID_) {
        ScheduledTask memory couponListing = ScheduledTasksLib.getScheduledTasksByIndex(
            scheduledCouponListingStorage(),
            _index
        );

        bytes32 actionId = abi.decode(couponListing.data, (bytes32));

        (, couponID_, ) = CorporateActionsStorageWrapper.getCorporateAction(actionId);
    }

    // --- Scheduled Balance Adjustments ---

    function scheduledBalanceAdjustmentStorage()
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

    function addScheduledBalanceAdjustment(uint256 _newScheduledTimestamp, bytes32 _actionId) internal {
        ScheduledTasksLib.addScheduledTask(
            scheduledBalanceAdjustmentStorage(),
            _newScheduledTimestamp,
            abi.encode(_actionId)
        );
    }

    function triggerScheduledBalanceAdjustments(uint256 _max) internal returns (uint256) {
        return triggerScheduledTasks(scheduledBalanceAdjustmentStorage(), bytes32("balance"), _max);
    }

    function _onScheduledBalanceAdjustmentTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        ScheduledTask memory _scheduledTask
    ) private {
        bytes memory data = _scheduledTask.data;

        (, , bytes memory balanceAdjustmentData) = CorporateActionsStorageWrapper.getCorporateAction(
            abi.decode(data, (bytes32))
        );
        IEquity.ScheduledBalanceAdjustment memory balanceAdjustment = abi.decode(
            balanceAdjustmentData,
            (IEquity.ScheduledBalanceAdjustment)
        );
        AdjustBalancesStorageWrapper.adjustBalances(balanceAdjustment.factor, balanceAdjustment.decimals);
    }

    function getScheduledBalanceAdjustmentCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(scheduledBalanceAdjustmentStorage());
    }

    function getScheduledBalanceAdjustments(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledBalanceAdjustment_) {
        return ScheduledTasksLib.getScheduledTasks(scheduledBalanceAdjustmentStorage(), _pageIndex, _pageLength);
    }

    function getPendingScheduledBalanceAdjustmentsAt(
        uint256 _timestamp
    ) internal view returns (uint256 pendingABAF_, uint8 pendingDecimals_) {
        // * Initialization
        pendingABAF_ = 1;
        pendingDecimals_ = 0;

        ScheduledTasksDataStorage storage scheduledBalanceAdjustments = scheduledBalanceAdjustmentStorage();

        uint256 scheduledTaskCount = ScheduledTasksLib.getScheduledTaskCount(scheduledBalanceAdjustments);

        for (uint256 i = 1; i <= scheduledTaskCount; i++) {
            uint256 pos = scheduledTaskCount - i;

            ScheduledTask memory scheduledTask = ScheduledTasksLib.getScheduledTasksByIndex(
                scheduledBalanceAdjustments,
                pos
            );

            if (scheduledTask.scheduledTimestamp < _timestamp) {
                bytes32 actionId = abi.decode(scheduledTask.data, (bytes32));

                bytes memory balanceAdjustmentData = CorporateActionsStorageWrapper.getCorporateActionData(actionId);

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

    function scheduledCrossOrderedTaskStorage()
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

    function addScheduledCrossOrderedTask(uint256 _newScheduledTimestamp, bytes32 _taskType) internal {
        ScheduledTasksLib.addScheduledTask(
            scheduledCrossOrderedTaskStorage(),
            _newScheduledTimestamp,
            abi.encode(_taskType)
        );
    }

    function triggerScheduledCrossOrderedTasks(uint256 _max) internal returns (uint256) {
        return triggerScheduledTasks(scheduledCrossOrderedTaskStorage(), bytes32("crossOrdered"), _max);
    }

    function callTriggerPendingScheduledCrossOrderedTasks() internal returns (uint256) {
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
            triggerScheduledSnapshots(1);
            return;
        }
        if (taskType == BALANCE_ADJUSTMENT_TASK_TYPE) {
            triggerScheduledBalanceAdjustments(1);
            return;
        }
    }

    function getScheduledCrossOrderedTaskCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(scheduledCrossOrderedTaskStorage());
    }

    function getScheduledCrossOrderedTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledTask_) {
        return ScheduledTasksLib.getScheduledTasks(scheduledCrossOrderedTaskStorage(), _pageIndex, _pageLength);
    }
}
