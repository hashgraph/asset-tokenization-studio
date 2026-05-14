// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledTasksLib } from "../../facets/layer_2/scheduledTask/ScheduledTasksLib.sol";
import {
    ScheduledTask,
    ScheduledTasksDataStorage
} from "../../facets/layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { IScheduledBalanceAdjustment } from "../../facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol";
import { ISnapshots } from "../../facets/layer_1/snapshot/ISnapshots.sol";
import {
    _SCHEDULED_SNAPSHOTS_STORAGE_POSITION,
    _SCHEDULED_COUPON_LISTING_STORAGE_POSITION,
    _SCHEDULED_BALANCE_ADJUSTMENTS_STORAGE_POSITION
} from "../../constants/storagePositions.sol";
import {
    SNAPSHOT_RESULT_ID,
    COUPON_LISTING_RESULT_ID,
    SNAPSHOT_TASK_TYPE,
    BALANCE_ADJUSTMENT_TASK_TYPE,
    COUPON_LISTING_TASK_TYPE
} from "../../constants/values.sol";
import { SnapshotsStorageWrapper } from "../asset/SnapshotsStorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { CouponStorageWrapper } from "../asset/coupon/CouponStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { InterestRateStorageWrapper } from "../asset/InterestRateStorageWrapper.sol";
import { SustainabilityPerformanceTargetRateLib } from "../asset/SustainabilityPerformanceTargetRateLib.sol";
import { KpiLinkedRateLib } from "../asset/KpiLinkedRateLib.sol";
import { ICouponTypes } from "../../facets/coupon/ICouponTypes.sol";

/// @title ScheduledTasksDispatchOps - External library for isolated scheduled task dispatch
/// @notice Deployed once as a separate contract. Called via DELEGATECALL through try/catch for failure isolation.
library ScheduledTasksDispatchOps {
    function execute(
        bytes32 callbackType,
        uint256 pos,
        uint256 scheduledTasksLength,
        ScheduledTask calldata task
    ) external {
        _dispatch(callbackType, pos, scheduledTasksLength, task);
    }

    function _dispatch(
        bytes32 callbackType,
        uint256 pos,
        uint256 scheduledTasksLength,
        ScheduledTask memory task
    ) private {
        if (callbackType == bytes32("snapshot")) {
            _onScheduledSnapshotTriggered(pos, scheduledTasksLength, task);
            return;
        }

        if (callbackType == bytes32("coupon")) {
            _onScheduledCouponListingTriggered(pos, scheduledTasksLength, task);
            return;
        }

        if (callbackType == bytes32("balance")) {
            _onScheduledBalanceAdjustmentTriggered(pos, scheduledTasksLength, task);
            return;
        }

        if (callbackType == bytes32("crossOrdered")) {
            _onScheduledCrossOrderedTaskTriggered(pos, scheduledTasksLength, task);
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

        IScheduledBalanceAdjustment.ScheduledBalanceAdjustment memory balanceAdjustment = abi.decode(
            balanceAdjustmentData,
            (IScheduledBalanceAdjustment.ScheduledBalanceAdjustment)
        );

        AdjustBalancesStorageWrapper.adjustBalances(balanceAdjustment.factor, balanceAdjustment.decimals);
    }

    function _onScheduledCrossOrderedTaskTriggered(
        uint256 /*_pos*/,
        uint256 /*_scheduledTasksLength*/,
        ScheduledTask memory _scheduledTask
    ) private {
        bytes32 taskType = _getActionIdFromScheduledTask(_scheduledTask);
        uint256 currentBlockTimestamp = TimeTravelStorageWrapper.getBlockTimestamp();

        if (taskType == SNAPSHOT_TASK_TYPE) {
            _triggerOneTask(scheduledSnapshotStorage(), bytes32("snapshot"), currentBlockTimestamp);
            return;
        }

        if (taskType == BALANCE_ADJUSTMENT_TASK_TYPE) {
            _triggerOneTask(scheduledBalanceAdjustmentStorage(), bytes32("balance"), currentBlockTimestamp);
            return;
        }

        if (taskType == COUPON_LISTING_TASK_TYPE) {
            _triggerOneTask(scheduledCouponListingStorage(), bytes32("coupon"), currentBlockTimestamp);
        }
    }

    // Triggers at most one ready task of the given type, dispatching directly to the handler.
    // Used by the cross-ordered handler to avoid a self-referential external call back into this library.
    function _triggerOneTask(
        ScheduledTasksDataStorage storage tasks_,
        bytes32 callbackType,
        uint256 currentBlockTimestamp
    ) private {
        uint256 scheduledTasksLength = ScheduledTasksLib.getScheduledTaskCount(tasks_);
        if (scheduledTasksLength == 0) return;

        uint256 pos;
        unchecked {
            pos = scheduledTasksLength - 1;
        }

        ScheduledTask memory currentScheduledTask = ScheduledTasksLib.getScheduledTasksByIndex(tasks_, pos);
        if (currentScheduledTask.scheduledTimestamp >= currentBlockTimestamp) return;

        ScheduledTasksLib.popScheduledTask(tasks_);

        if (callbackType == bytes32("snapshot")) {
            _onScheduledSnapshotTriggered(pos, scheduledTasksLength, currentScheduledTask);
        } else if (callbackType == bytes32("balance")) {
            _onScheduledBalanceAdjustmentTriggered(pos, scheduledTasksLength, currentScheduledTask);
        } else if (callbackType == bytes32("coupon")) {
            _onScheduledCouponListingTriggered(pos, scheduledTasksLength, currentScheduledTask);
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

    function scheduledSnapshotStorage() private pure returns (ScheduledTasksDataStorage storage scheduledSnapshots_) {
        bytes32 position = _SCHEDULED_SNAPSHOTS_STORAGE_POSITION;
        assembly {
            scheduledSnapshots_.slot := position
        }
    }

    function scheduledCouponListingStorage()
        private
        pure
        returns (ScheduledTasksDataStorage storage scheduledCouponListing_)
    {
        bytes32 position = _SCHEDULED_COUPON_LISTING_STORAGE_POSITION;
        assembly {
            scheduledCouponListing_.slot := position
        }
    }

    function scheduledBalanceAdjustmentStorage()
        private
        pure
        returns (ScheduledTasksDataStorage storage scheduledBalanceAdjustments_)
    {
        bytes32 position = _SCHEDULED_BALANCE_ADJUSTMENTS_STORAGE_POSITION;
        assembly {
            scheduledBalanceAdjustments_.slot := position
        }
    }
}
