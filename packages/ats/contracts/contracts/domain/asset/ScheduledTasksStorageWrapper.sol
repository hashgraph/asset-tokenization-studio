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
import { ISnapshots } from "../../facets/layer_1/snapshot/ISnapshots.sol";
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
    BALANCE_ADJUSTMENT_TASK_TYPE,
    COUPON_LISTING_TASK_TYPE
} from "../../constants/values.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { CouponStorageWrapper } from "./coupon/CouponStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { InterestRateStorageWrapper } from "./InterestRateStorageWrapper.sol";
import { SustainabilityPerformanceTargetRateLib } from "./SustainabilityPerformanceTargetRateLib.sol";
import { ICouponTypes } from "../../facets/layer_2/coupon/ICouponTypes.sol";
import { KpiLinkedRateLib } from "./KpiLinkedRateLib.sol";

/**
 * @title ScheduledTasksStorageWrapper
 * @notice Storage and execution layer for managing time‑based scheduled tasks
 *         (snapshots, coupon listings, balance adjustments, cross‑ordered tasks).
 * @dev Provides internal helpers to add, trigger, query and dispatch scheduled
 *      tasks by type. Relies on `ScheduledTasksLib` for core queue logic and on
 *      dedicated storage wrappers for per‑type state.
 * @author Asset Tokenization Studio Team
 */
library ScheduledTasksStorageWrapper {
    error WrongTimestamp(uint256 timeStamp);

    function triggerScheduledTasks(
        ScheduledTasksDataStorage storage _scheduledTasks,
        bytes32 callbackType,
        uint256 _max
    ) internal returns (uint256 processed_) {
        uint256 scheduledTasksLength = ScheduledTasksLib.getScheduledTaskCount(_scheduledTasks);
        if (scheduledTasksLength == 0) return 0;

        uint256 limit;
        uint256 currentBlockTimestamp = TimeTravelStorageWrapper.getBlockTimestamp();
        uint256 pos;
        unchecked {
            limit = (_max == 0 || _max > scheduledTasksLength ? scheduledTasksLength : _max) + 1;
        }
        for (uint256 j = 1; j < limit; ) {
            unchecked {
                pos = scheduledTasksLength - j;
            }

            ScheduledTask memory currentScheduledTask = ScheduledTasksLib.getScheduledTasksByIndex(
                _scheduledTasks,
                pos
            );

            if (currentScheduledTask.scheduledTimestamp >= currentBlockTimestamp) break;

            ScheduledTasksLib.popScheduledTask(_scheduledTasks);
            _dispatchScheduledTask(callbackType, pos, scheduledTasksLength, currentScheduledTask);

            unchecked {
                ++processed_;
                ++j;
            }
        }
    }

    function addScheduledSnapshot(uint256 _newScheduledTimestamp, bytes32 _actionId) internal {
        ScheduledTasksLib.addScheduledTask(scheduledSnapshotStorage(), _newScheduledTimestamp, abi.encode(_actionId));
    }

    function triggerScheduledSnapshots(uint256 _max) internal returns (uint256) {
        return triggerScheduledTasks(scheduledSnapshotStorage(), bytes32("snapshot"), _max);
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

    // TODO: REMOVE IT!!! Ya no es necesario el delegate call entre facetas, que se explote la librería externa.
    function callTriggerPendingScheduledCrossOrderedTasks() internal returns (uint256) {
        return IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();
    }

    function requireValidTimestamp(uint256 _timestamp) internal view {
        if (_timestamp <= TimeTravelStorageWrapper.getBlockTimestamp()) revert WrongTimestamp(_timestamp);
    }

    function getScheduledSnapshotCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(scheduledSnapshotStorage());
    }

    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledSnapshots_) {
        return ScheduledTasksLib.getScheduledTasks(scheduledSnapshotStorage(), _pageIndex, _pageLength);
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
        ScheduledTasksDataStorage storage scheduledCouponListing = scheduledCouponListingStorage();

        uint256 length = ScheduledTasksLib.getScheduledTaskCount(scheduledCouponListing);
        uint256 pos;

        for (uint256 i; i < length; ) {
            unchecked {
                pos = length - 1 - i;
            }

            ScheduledTask memory scheduledTask = ScheduledTasksLib.getScheduledTasksByIndex(
                scheduledCouponListing,
                pos
            );

            if (scheduledTask.scheduledTimestamp < _timestamp) {
                unchecked {
                    ++total_;
                    ++i;
                }
                continue;
            }
            break;
        }
    }

    function getScheduledCouponListingIdAtIndex(uint256 _index) internal view returns (uint256 couponID_) {
        ScheduledTask memory couponListing = ScheduledTasksLib.getScheduledTasksByIndex(
            scheduledCouponListingStorage(),
            _index
        );

        (, couponID_, , ) = CorporateActionsStorageWrapper.getCorporateAction(
            abi.decode(couponListing.data, (bytes32))
        );
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

        ScheduledTasksDataStorage storage scheduledBalanceAdjustments = scheduledBalanceAdjustmentStorage();

        uint256 length = ScheduledTasksLib.getScheduledTaskCount(scheduledBalanceAdjustments);
        uint256 pos;

        for (uint256 i; i < length; ) {
            unchecked {
                pos = length - 1 - i;
            }
            ScheduledTask memory scheduledTask = ScheduledTasksLib.getScheduledTasksByIndex(
                scheduledBalanceAdjustments,
                pos
            );

            if (scheduledTask.scheduledTimestamp < _timestamp) {
                bytes memory balanceAdjustmentData = CorporateActionsStorageWrapper.getCorporateActionData(
                    abi.decode(scheduledTask.data, (bytes32))
                );

                IEquity.ScheduledBalanceAdjustment memory balanceAdjustment = abi.decode(
                    balanceAdjustmentData,
                    (IEquity.ScheduledBalanceAdjustment)
                );
                pendingABAF_ *= balanceAdjustment.factor;
                pendingDecimals_ += balanceAdjustment.decimals;
                unchecked {
                    ++i;
                }
                continue;
            }
            break;
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

    // Internal Pure Functions (Storage Accessors)

    function scheduledSnapshotStorage() internal pure returns (ScheduledTasksDataStorage storage scheduledSnapshots_) {
        bytes32 position = _SCHEDULED_SNAPSHOTS_STORAGE_POSITION;
        assembly {
            scheduledSnapshots_.slot := position
        }
    }

    function scheduledCouponListingStorage()
        internal
        pure
        returns (ScheduledTasksDataStorage storage scheduledCouponListing_)
    {
        bytes32 position = _SCHEDULED_COUPON_LISTING_STORAGE_POSITION;
        assembly {
            scheduledCouponListing_.slot := position
        }
    }

    function scheduledBalanceAdjustmentStorage()
        internal
        pure
        returns (ScheduledTasksDataStorage storage scheduledBalanceAdjustments_)
    {
        bytes32 position = _SCHEDULED_BALANCE_ADJUSTMENTS_STORAGE_POSITION;
        assembly {
            scheduledBalanceAdjustments_.slot := position
        }
    }

    function scheduledCrossOrderedTaskStorage()
        internal
        pure
        returns (ScheduledTasksDataStorage storage scheduledCrossOrderedTasks_)
    {
        bytes32 position = _SCHEDULED_CROSS_ORDERED_TASKS_STORAGE_POSITION;
        assembly {
            scheduledCrossOrderedTasks_.slot := position
        }
    }

    // ============================================================================
    // Private Callback Functions
    // ============================================================================

    function _dispatchScheduledTask(
        bytes32 callbackType,
        uint256 pos,
        uint256 scheduledTasksLength,
        ScheduledTask memory currentScheduledTask
    ) private {
        if (callbackType == bytes32("snapshot")) {
            _onScheduledSnapshotTriggered(pos, scheduledTasksLength, currentScheduledTask);
            return;
        }

        if (callbackType == bytes32("coupon")) {
            _onScheduledCouponListingTriggered(pos, scheduledTasksLength, currentScheduledTask);
            return;
        }

        if (callbackType == bytes32("balance")) {
            _onScheduledBalanceAdjustmentTriggered(pos, scheduledTasksLength, currentScheduledTask);
            return;
        }

        if (callbackType == bytes32("crossOrdered")) {
            _onScheduledCrossOrderedTaskTriggered(pos, scheduledTasksLength, currentScheduledTask);
        }
    }

    function _onScheduledSnapshotTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        ScheduledTask memory _scheduledTask
    ) private {
        bytes32 actionId = abi.decode(_scheduledTask.data, (bytes32));
        if (CorporateActionsStorageWrapper.isCorporateActionDisabled(actionId)) {
            return;
        }

        uint256 newSnapShotID = SnapshotsStorageWrapper.takeSnapshot();
        emit ISnapshots.SnapshotTriggered(newSnapShotID, abi.encodePacked(actionId));
        CorporateActionsStorageWrapper.updateCorporateActionResult(
            actionId,
            SNAPSHOT_RESULT_ID,
            abi.encodePacked(newSnapShotID)
        );
    }

    function _onScheduledCouponListingTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        ScheduledTask memory _scheduledTask
    ) private {
        bytes32 actionId = _getActionIdFromScheduledTask(_scheduledTask);
        if (CorporateActionsStorageWrapper.isCorporateActionDisabled(actionId)) {
            return;
        }

        uint256 couponID = _getCouponIdFromAction(actionId);

        CouponStorageWrapper.addToCouponsOrderedList(couponID);
        uint256 orderedListPos = CouponStorageWrapper.getCouponsOrderedListTotal();

        _updateCouponRatesIfNeeded(couponID);

        CorporateActionsStorageWrapper.updateCorporateActionResult(
            actionId,
            COUPON_LISTING_RESULT_ID,
            abi.encodePacked(orderedListPos)
        );
    }

    function _onScheduledBalanceAdjustmentTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        ScheduledTask memory _scheduledTask
    ) private {
        (, , bytes memory balanceAdjustmentData, bool isDisabled_) = CorporateActionsStorageWrapper.getCorporateAction(
            _getActionIdFromScheduledTask(_scheduledTask)
        );

        if (isDisabled_) return;

        IEquity.ScheduledBalanceAdjustment memory balanceAdjustment = abi.decode(
            balanceAdjustmentData,
            (IEquity.ScheduledBalanceAdjustment)
        );

        AdjustBalancesStorageWrapper.adjustBalances(balanceAdjustment.factor, balanceAdjustment.decimals);
    }

    function _onScheduledCrossOrderedTaskTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        ScheduledTask memory _scheduledTask
    ) private {
        bytes32 taskType = _getActionIdFromScheduledTask(_scheduledTask);

        if (taskType == SNAPSHOT_TASK_TYPE) {
            triggerScheduledSnapshots(1);
            return;
        }

        if (taskType == BALANCE_ADJUSTMENT_TASK_TYPE) {
            triggerScheduledBalanceAdjustments(1);
            return;
        }

        if (taskType == COUPON_LISTING_TASK_TYPE) {
            triggerScheduledCouponListing(1);
        }
    }

    function _updateCouponRatesIfNeeded(uint256 couponID) private {
        (ICouponTypes.RegisteredCoupon memory registeredCoupon, , ) = CouponStorageWrapper.getCoupon(couponID);

        if (InterestRateStorageWrapper.isSustainabilityPerformanceTargetRateInitialized()) {
            (uint256 rate, uint8 rateDecimals) = SustainabilityPerformanceTargetRateLib
                .calculateSustainabilityPerformanceTargetInterestRate(couponID, registeredCoupon.coupon);

            CouponStorageWrapper.updateCouponRate(couponID, registeredCoupon.coupon, rate, rateDecimals);
        }

        if (InterestRateStorageWrapper.isKpiLinkedRateInitialized()) {
            (uint256 rate, uint8 rateDecimals) = KpiLinkedRateLib.calculateKpiLinkedInterestRate(
                couponID,
                registeredCoupon.coupon
            );

            CouponStorageWrapper.updateCouponRate(couponID, registeredCoupon.coupon, rate, rateDecimals);
        }
    }

    function _getCouponIdFromAction(bytes32 actionId) private view returns (uint256 couponID_) {
        (, couponID_, , ) = CorporateActionsStorageWrapper.getCorporateAction(actionId);
    }

    function _getActionIdFromScheduledTask(
        ScheduledTask memory _scheduledTask
    ) private pure returns (bytes32 actionId_) {
        return abi.decode(_scheduledTask.data, (bytes32));
    }
}
