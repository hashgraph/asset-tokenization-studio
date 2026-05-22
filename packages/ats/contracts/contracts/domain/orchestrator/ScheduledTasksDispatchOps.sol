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
import { CouponRateDispatch } from "../../domain/asset/coupon/CouponRateDispatch.sol";
import { IInterestRate } from "../../facets/interestRate/IInterestRate.sol";
import {
    CORPORATE_ACTION_TYPE_COUPON,
    SCHEDULED_TASK_TYPE_COUPON_LISTING,
    SCHEDULED_TASK_TYPE_SNAPSHOT
} from "../../constants/dispatchTypes.sol";

/// @title ScheduledTasksDispatchOps - External library for isolated scheduled task dispatch
/// @notice Deployed once as a separate contract. Called via DELEGATECALL through try/catch for
///         failure isolation. Handles only leaf-task business logic (snapshot, coupon, balance).
///         Cross-ordered sub-task routing and all queue storage access live in
///         ScheduledTasksStorageWrapper to avoid circular imports.
library ScheduledTasksDispatchOps {
    /// @return subTaskType_ Non-zero only for crossOrdered tasks: the sub-task type to trigger.
    ///         ScheduledTasksStorageWrapper reads this value and dispatches the sub-queue internally.
    function execute(bytes32 callbackType, ScheduledTask calldata task) external returns (bytes32 subTaskType_) {
        if (callbackType == bytes32("snapshot")) {
            _onScheduledSnapshotTriggered(task);
            return bytes32(0);
        }

        if (callbackType == bytes32("coupon")) {
            _onScheduledCouponListingTriggered(task);
            return bytes32(0);
        }

        if (callbackType == bytes32("balance")) {
            _onScheduledBalanceAdjustmentTriggered(task);
            return bytes32(0);
        }

        if (callbackType == bytes32("crossOrdered")) {
            return abi.decode(task.data, (bytes32));
        }
    }

    function _onScheduledSnapshotTriggered(ScheduledTask memory _scheduledTask) private {
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

    function _onScheduledCouponListingTriggered(ScheduledTask memory _scheduledTask) private {
        bytes32 actionId = _getActionIdFromScheduledTask(_scheduledTask);
        if (CorporateActionsStorageWrapper.isCorporateActionDisabled(actionId)) {
            return;
        }

        uint256 couponID = _getCouponIdFromAction(actionId);

        CouponStorageWrapper.addToCouponsOrderedList(couponID);
        uint256 orderedListPos = CouponStorageWrapper.getCouponsOrderedListTotal();

        CorporateActionsStorageWrapper.updateCorporateActionResult(
            actionId,
            COUPON_LISTING_RESULT_ID,
            abi.encodePacked(orderedListPos)
        );

        if (InterestRateStorageWrapper.getCouponRateType() == IInterestRate.RateType.KPI_LINKED)
            updateCouponRate(couponID);
    }

    function _onScheduledBalanceAdjustmentTriggered(ScheduledTask memory _scheduledTask) private {
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

    function updateCouponRate(uint256 couponID) private {
        (ICouponTypes.RegisteredCoupon memory registeredCoupon, , ) = CouponStorageWrapper.getCoupon(couponID);

        CorporateActionsStorageWrapper.updateCorporateActionData(
            CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(CORPORATE_ACTION_TYPE_COUPON, couponID - 1),
            abi.encode(registeredCoupon.coupon)
        );
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
