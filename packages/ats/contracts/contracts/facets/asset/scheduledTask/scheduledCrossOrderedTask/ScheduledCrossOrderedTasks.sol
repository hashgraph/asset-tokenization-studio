// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IScheduledCrossOrderedTasks
} from "../../scheduledTask/scheduledCrossOrderedTask/IScheduledCrossOrderedTasks.sol";
import { ScheduledTask } from "../../scheduledTask/IScheduledTasksCommon.sol";
import { IAdjustBalances } from "../../adjustBalances/IAdjustBalances.sol";
import { IEquity } from "../../equity/IEquity.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../../../../domain/core/CorporateActionsStorageWrapper.sol";
import { CapStorageWrapper } from "../../../../domain/core/CapStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../../../../domain/asset/SnapshotsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../../../../domain/asset/ERC20StorageWrapper.sol";
import { ABAFStorageWrapper } from "../../../../domain/asset/ABAFStorageWrapper.sol";
import { BondStorageWrapper } from "../../../../domain/asset/BondStorageWrapper.sol";
import {
    SNAPSHOT_TASK_TYPE,
    BALANCE_ADJUSTMENT_TASK_TYPE,
    COUPON_LISTING_TASK_TYPE,
    SNAPSHOT_RESULT_ID,
    COUPON_LISTING_RESULT_ID
} from "../../../../constants/values.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";

abstract contract ScheduledCrossOrderedTasks is IScheduledCrossOrderedTasks, TimestampProvider {
    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL STATE-CHANGING FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function triggerPendingScheduledCrossOrderedTasks() external override returns (uint256) {
        PauseStorageWrapper.requireNotPaused();
        return _triggerCrossOrderedTasks(0);
    }

    function triggerScheduledCrossOrderedTasks(uint256 _max) external override returns (uint256) {
        PauseStorageWrapper.requireNotPaused();
        return _triggerCrossOrderedTasks(_max);
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════

    function scheduledCrossOrderedTaskCount() external view override returns (uint256) {
        return ScheduledTasksStorageWrapper.getScheduledCrossOrderedTaskCount();
    }

    function getScheduledCrossOrderedTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledCrossOrderedTask_) {
        return ScheduledTasksStorageWrapper.getScheduledCrossOrderedTasks(_pageIndex, _pageLength);
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
        uint256 count = ScheduledTasksStorageWrapper.getScheduledCrossOrderedTaskCount();
        if (count == 0) return 0;

        uint256 max = (_max > count || _max == 0) ? count : _max;
        uint256 timestamp = _getBlockTimestamp();

        for (uint256 j = 1; j <= max; j++) {
            uint256 pos = count - j;
            ScheduledTask memory task = ScheduledTasksStorageWrapper.getScheduledCrossOrderedTaskByIndex(pos);

            if (task.scheduledTimestamp < timestamp) {
                ScheduledTasksStorageWrapper.popScheduledCrossOrderedTask();
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
        uint256 count = ScheduledTasksStorageWrapper.getScheduledSnapshotCount();
        if (count == 0) return;

        uint256 max = (_max > count || _max == 0) ? count : _max;
        uint256 timestamp = _getBlockTimestamp();

        for (uint256 j = 1; j <= max; j++) {
            uint256 pos = count - j;
            ScheduledTask memory task = ScheduledTasksStorageWrapper.getScheduledSnapshotByIndex(pos);

            if (task.scheduledTimestamp < timestamp) {
                ScheduledTasksStorageWrapper.popScheduledSnapshot();

                uint256 snapshotId = SnapshotsStorageWrapper.snapshot();
                bytes32 actionId = abi.decode(task.data, (bytes32));
                CorporateActionsStorageWrapper.updateCorporateActionResult(
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
        uint256 count = ScheduledTasksStorageWrapper.getScheduledBalanceAdjustmentCount();
        if (count == 0) return;

        uint256 max = (_max > count || _max == 0) ? count : _max;
        uint256 timestamp = _getBlockTimestamp();

        for (uint256 j = 1; j <= max; j++) {
            uint256 pos = count - j;
            ScheduledTask memory task = ScheduledTasksStorageWrapper.getScheduledBalanceAdjustmentByIndex(pos);

            if (task.scheduledTimestamp < timestamp) {
                ScheduledTasksStorageWrapper.popScheduledBalanceAdjustment();

                bytes32 actionId = abi.decode(task.data, (bytes32));
                (, , bytes memory balanceAdjustmentData) = CorporateActionsStorageWrapper.getCorporateAction(actionId);
                IEquity.ScheduledBalanceAdjustment memory ba = abi.decode(
                    balanceAdjustmentData,
                    (IEquity.ScheduledBalanceAdjustment)
                );

                // Same logic as _adjustBalances: update snapshots + adjust all
                SnapshotsStorageWrapper.updateDecimalsSnapshot();
                SnapshotsStorageWrapper.updateAbafSnapshot();
                SnapshotsStorageWrapper.updateAssetTotalSupplySnapshot();
                ERC1410StorageWrapper.adjustTotalSupply(ba.factor);
                ERC20StorageWrapper.adjustDecimals(ba.decimals);
                CapStorageWrapper.adjustMaxSupply(ba.factor);
                ABAFStorageWrapper.updateAbaf(ba.factor);
                emit IAdjustBalances.AdjustmentBalanceSet(msg.sender, ba.factor, ba.decimals);
            } else {
                break;
            }
        }
    }

    function _triggerCouponListings(uint256 _max) private {
        uint256 count = ScheduledTasksStorageWrapper.getScheduledCouponListingCount();
        if (count == 0) return;

        uint256 max = (_max > count || _max == 0) ? count : _max;
        uint256 timestamp = _getBlockTimestamp();

        for (uint256 j = 1; j <= max; j++) {
            uint256 pos = count - j;
            ScheduledTask memory task = ScheduledTasksStorageWrapper.getScheduledCouponListingByIndex(pos);

            if (task.scheduledTimestamp < timestamp) {
                ScheduledTasksStorageWrapper.popScheduledCouponListing();

                bytes32 actionId = abi.decode(task.data, (bytes32));
                uint256 couponID = uint256(actionId);
                BondStorageWrapper.addToCouponsOrderedList(couponID);
                _onCouponListed(couponID, timestamp);
                uint256 listPos = BondStorageWrapper.getCouponsOrderedListTotal();
                CorporateActionsStorageWrapper.updateCorporateActionResult(
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
