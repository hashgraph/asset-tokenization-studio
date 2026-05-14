// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledTask } from "../../facets/layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { IScheduledBalanceAdjustment } from "../../facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol";
import { ISnapshots } from "../../facets/layer_1/snapshot/ISnapshots.sol";
import { SNAPSHOT_RESULT_ID, COUPON_LISTING_RESULT_ID } from "../../constants/values.sol";
import { SnapshotsStorageWrapper } from "../asset/SnapshotsStorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { CouponStorageWrapper } from "../asset/coupon/CouponStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";
import { InterestRateStorageWrapper } from "../asset/InterestRateStorageWrapper.sol";
import { KpiLinkedRateLib } from "../asset/KpiLinkedRateLib.sol";
import { ICouponTypes } from "../../facets/coupon/ICouponTypes.sol";

/// @title ScheduledTasksDispatchOps - External library for isolated scheduled task dispatch
/// @notice Deployed once as a separate contract. Called via DELEGATECALL through try/catch for
///         failure isolation. Handles only leaf-task business logic (snapshot, coupon, balance).
///         Cross-ordered sub-task routing and all queue storage access live in
///         ScheduledTasksStorageWrapper to avoid circular imports.
library ScheduledTasksDispatchOps {
    /// @return subTaskType_ Non-zero only for crossOrdered tasks: the sub-task type to trigger.
    ///         ScheduledTasksStorageWrapper reads this value and dispatches the sub-queue internally.
    function execute(
        bytes32 callbackType,
        uint256 pos,
        uint256 scheduledTasksLength,
        ScheduledTask calldata task
    ) external returns (bytes32 subTaskType_) {
        if (callbackType == bytes32("snapshot")) {
            _onScheduledSnapshotTriggered(pos, scheduledTasksLength, task);
            return bytes32(0);
        }

        if (callbackType == bytes32("coupon")) {
            _onScheduledCouponListingTriggered(pos, scheduledTasksLength, task);
            return bytes32(0);
        }

        if (callbackType == bytes32("balance")) {
            _onScheduledBalanceAdjustmentTriggered(pos, scheduledTasksLength, task);
            return bytes32(0);
        }

        if (callbackType == bytes32("crossOrdered")) {
            return abi.decode(task.data, (bytes32));
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

    function _updateCouponRatesIfNeeded(uint256 couponID) private {
        (ICouponTypes.RegisteredCoupon memory registeredCoupon, , ) = CouponStorageWrapper.getCoupon(couponID);

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
