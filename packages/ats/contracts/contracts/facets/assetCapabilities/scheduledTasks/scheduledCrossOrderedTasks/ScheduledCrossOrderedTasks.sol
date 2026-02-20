// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IScheduledCrossOrderedTasks
} from "../../interfaces/scheduledTasks/scheduledCrossOrderedTasks/IScheduledCrossOrderedTasks.sol";
import { ScheduledTask } from "../../interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { IAdjustBalances } from "../../interfaces/adjustBalances/IAdjustBalances.sol";
import { IEquity } from "../../interfaces/equity/IEquity.sol";
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { LibCorporateActions } from "../../../../lib/core/LibCorporateActions.sol";
import { LibCap } from "../../../../lib/core/LibCap.sol";
import { LibScheduledTasks } from "../../../../lib/domain/LibScheduledTasks.sol";
import { LibSnapshots } from "../../../../lib/domain/LibSnapshots.sol";
import { LibERC1410 } from "../../../../lib/domain/LibERC1410.sol";
import { LibERC20 } from "../../../../lib/domain/LibERC20.sol";
import { LibABAF } from "../../../../lib/domain/LibABAF.sol";
import { LibBond } from "../../../../lib/domain/LibBond.sol";
import {
    SNAPSHOT_TASK_TYPE,
    BALANCE_ADJUSTMENT_TASK_TYPE,
    COUPON_LISTING_TASK_TYPE,
    SNAPSHOT_RESULT_ID,
    COUPON_LISTING_RESULT_ID
} from "../../../../constants/values.sol";
import { LibTimeTravel } from "../../../../test/timeTravel/LibTimeTravel.sol";

abstract contract ScheduledCrossOrderedTasks is IScheduledCrossOrderedTasks {
    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL STATE-CHANGING FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function triggerPendingScheduledCrossOrderedTasks() external override returns (uint256) {
        LibPause.requireNotPaused();
        return _triggerCrossOrderedTasks(0);
    }

    function triggerScheduledCrossOrderedTasks(uint256 _max) external override returns (uint256) {
        LibPause.requireNotPaused();
        return _triggerCrossOrderedTasks(_max);
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function scheduledCrossOrderedTaskCount() external view override returns (uint256) {
        return LibScheduledTasks.getScheduledCrossOrderedTaskCount();
    }

    function getScheduledCrossOrderedTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledCrossOrderedTask_) {
        return LibScheduledTasks.getScheduledCrossOrderedTasks(_pageIndex, _pageLength);
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // INTERNAL HOOKS & HELPERS
    // ════════════════════════════════════════════════════════════════════════════════════

    /// @dev Hook called after a coupon is added to the ordered list during trigger.
    ///      Override in KPI-linked/sustainability variants to calculate and store the coupon rate.
    // solhint-disable-next-line no-empty-blocks,ordering
    function _onCouponListed(uint256 _couponID, uint256 _timestamp) internal virtual {}

    // ════════════════════════════════════════════════════════════════════════════════════
    // PRIVATE ORCHESTRATION — replaces callback-based _triggerScheduledTasks pattern
    // ════════════════════════════════════════════════════════════════════════════════════

    function _triggerCrossOrderedTasks(uint256 _max) private returns (uint256) {
        uint256 count = LibScheduledTasks.getScheduledCrossOrderedTaskCount();
        if (count == 0) return 0;

        uint256 max = (_max > count || _max == 0) ? count : _max;
        uint256 timestamp = LibTimeTravel.getBlockTimestamp();

        for (uint256 j = 1; j <= max; j++) {
            uint256 pos = count - j;
            ScheduledTask memory task = LibScheduledTasks.getScheduledCrossOrderedTaskByIndex(pos);

            if (task.scheduledTimestamp < timestamp) {
                LibScheduledTasks.popScheduledCrossOrderedTask();
                _dispatchTask(task);
            } else {
                break;
            }
        }
        return 0;
    }

    function _dispatchTask(ScheduledTask memory _task) private {
        bytes32 taskType = abi.decode(_task.data, (bytes32));

        if (taskType == SNAPSHOT_TASK_TYPE) {
            _triggerSnapshots(1);
        } else if (taskType == BALANCE_ADJUSTMENT_TASK_TYPE) {
            _triggerBalanceAdjustments(1);
        } else if (taskType == COUPON_LISTING_TASK_TYPE) {
            _triggerCouponListings(1);
        }
    }

    function _triggerSnapshots(uint256 _max) private {
        uint256 count = LibScheduledTasks.getScheduledSnapshotCount();
        if (count == 0) return;

        uint256 max = (_max > count || _max == 0) ? count : _max;
        uint256 timestamp = LibTimeTravel.getBlockTimestamp();

        for (uint256 j = 1; j <= max; j++) {
            uint256 pos = count - j;
            ScheduledTask memory task = LibScheduledTasks.getScheduledSnapshotByIndex(pos);

            if (task.scheduledTimestamp < timestamp) {
                LibScheduledTasks.popScheduledSnapshot();

                uint256 snapshotId = LibSnapshots.snapshot();
                bytes32 actionId = abi.decode(task.data, (bytes32));
                LibCorporateActions.updateCorporateActionResult(
                    actionId,
                    SNAPSHOT_RESULT_ID,
                    abi.encodePacked(snapshotId)
                );
            } else {
                break;
            }
        }
    }

    function _triggerBalanceAdjustments(uint256 _max) private {
        uint256 count = LibScheduledTasks.getScheduledBalanceAdjustmentCount();
        if (count == 0) return;

        uint256 max = (_max > count || _max == 0) ? count : _max;
        uint256 timestamp = LibTimeTravel.getBlockTimestamp();

        for (uint256 j = 1; j <= max; j++) {
            uint256 pos = count - j;
            ScheduledTask memory task = LibScheduledTasks.getScheduledBalanceAdjustmentByIndex(pos);

            if (task.scheduledTimestamp < timestamp) {
                LibScheduledTasks.popScheduledBalanceAdjustment();

                bytes32 actionId = abi.decode(task.data, (bytes32));
                (, , bytes memory balanceAdjustmentData) = LibCorporateActions.getCorporateAction(actionId);
                IEquity.ScheduledBalanceAdjustment memory ba = abi.decode(
                    balanceAdjustmentData,
                    (IEquity.ScheduledBalanceAdjustment)
                );

                // Same logic as _adjustBalances: update snapshots + adjust all
                LibSnapshots.updateDecimalsSnapshot();
                LibSnapshots.updateAbafSnapshot();
                LibSnapshots.updateAssetTotalSupplySnapshot();
                LibERC1410.adjustTotalSupply(ba.factor);
                LibERC20.adjustDecimals(ba.decimals);
                LibCap.adjustMaxSupply(ba.factor);
                LibABAF.updateAbaf(ba.factor);
                emit IAdjustBalances.AdjustmentBalanceSet(msg.sender, ba.factor, ba.decimals);
            } else {
                break;
            }
        }
    }

    function _triggerCouponListings(uint256 _max) private {
        uint256 count = LibScheduledTasks.getScheduledCouponListingCount();
        if (count == 0) return;

        uint256 max = (_max > count || _max == 0) ? count : _max;
        uint256 timestamp = LibTimeTravel.getBlockTimestamp();

        for (uint256 j = 1; j <= max; j++) {
            uint256 pos = count - j;
            ScheduledTask memory task = LibScheduledTasks.getScheduledCouponListingByIndex(pos);

            if (task.scheduledTimestamp < timestamp) {
                LibScheduledTasks.popScheduledCouponListing();

                bytes32 actionId = abi.decode(task.data, (bytes32));
                uint256 couponID = uint256(actionId);
                LibBond.addToCouponsOrderedList(couponID);
                _onCouponListed(couponID, timestamp);
                uint256 listPos = LibBond.getCouponsOrderedListTotal();
                LibCorporateActions.updateCorporateActionResult(
                    actionId,
                    COUPON_LISTING_RESULT_ID,
                    abi.encodePacked(listPos)
                );
            } else {
                break;
            }
        }
    }
}
