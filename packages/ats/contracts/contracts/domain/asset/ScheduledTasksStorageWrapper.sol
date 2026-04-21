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
 * @title Scheduled Tasks Storage Wrapper
 * @notice Manages scheduling, retrieval, and execution of time-based corporate
 *         action tasks across four independent queues: snapshots, coupon listings,
 *         balance adjustments, and cross-ordered tasks.
 * @dev Each queue occupies a dedicated diamond storage slot (EIP-2535). Tasks are
 *      stored in ascending timestamp order and consumed from the tail. Execution
 *      is bounded by a caller-supplied `_max` parameter to control gas usage.
 *      Cross-ordered tasks act as a meta-queue that delegates to the three primary
 *      queues, enforcing a deterministic inter-queue ordering. Block timestamps are
 *      sourced via `TimeTravelStorageWrapper` to support test-environment overrides.
 * @author Hashgraph
 */
library ScheduledTasksStorageWrapper {
    /**
     * @notice Raised when a provided timestamp does not satisfy the future-only
     *         constraint enforced by `requireValidTimestamp`.
     * @dev Thrown if `_timestamp` is less than or equal to the current block
     *      timestamp. Callers scheduling tasks must ensure timestamps are strictly
     *      in the future relative to the simulated or real block time.
     * @param timeStamp The invalid timestamp that triggered the revert.
     */
    error WrongTimestamp(uint256 timeStamp);

    // =========================================================================
    // Internal — Task Execution
    // =========================================================================

    /**
     * @notice Executes up to `_max` matured tasks from the given queue, dispatching
     *         each to its corresponding callback handler.
     * @dev Iterates the queue from the tail (earliest scheduled task) and stops at
     *      the first task whose `scheduledTimestamp` is greater than or equal to the
     *      current block timestamp. Each consumed task is popped before dispatch to
     *      prevent re-entrancy from re-processing the same entry. Arithmetic in the
     *      loop counter and bounds calculation is performed in an `unchecked` block
     *      for gas efficiency. Passing `_max == 0` processes all matured tasks.
     * @param _scheduledTasks The storage reference to the target task queue.
     * @param callbackType    A `bytes32` key identifying the queue type; used by
     *                        `_dispatchScheduledTask` to select the correct handler.
     * @param _max            Maximum number of tasks to process in this call;
     *                        pass `0` to process all currently matured tasks.
     * @return processed_     The number of tasks successfully executed.
     */
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

    /**
     * @notice Enqueues a snapshot task to be triggered at the specified timestamp.
     * @dev Encodes `_actionId` as the task payload and inserts it into the snapshot
     *      queue via `ScheduledTasksLib`, which maintains ascending timestamp order.
     * @param _newScheduledTimestamp Unix timestamp at which the snapshot should fire.
     * @param _actionId             Corporate action identifier linked to this snapshot.
     */
    function addScheduledSnapshot(uint256 _newScheduledTimestamp, bytes32 _actionId) internal {
        ScheduledTasksLib.addScheduledTask(scheduledSnapshotStorage(), _newScheduledTimestamp, abi.encode(_actionId));
    }

    /**
     * @notice Executes up to `_max` matured snapshot tasks from the snapshot queue.
     * @dev Delegates to `triggerScheduledTasks` with the `"snapshot"` callback key.
     *      Each triggered task calls `onScheduledSnapshotTriggered` if not disabled.
     * @param _max    Maximum number of snapshot tasks to process; `0` processes all.
     * @return        The number of snapshot tasks executed.
     */
    function triggerScheduledSnapshots(uint256 _max) internal returns (uint256) {
        return triggerScheduledTasks(scheduledSnapshotStorage(), bytes32("snapshot"), _max);
    }

    /**
     * @notice Enqueues a coupon listing task to be triggered at the specified timestamp.
     * @dev Encodes `_actionId` as the task payload and inserts it into the coupon
     *      listing queue, maintaining ascending timestamp order.
     * @param _newScheduledTimestamp Unix timestamp at which the coupon listing fires.
     * @param _actionId             Corporate action identifier linked to this coupon.
     */
    function addScheduledCouponListing(uint256 _newScheduledTimestamp, bytes32 _actionId) internal {
        ScheduledTasksLib.addScheduledTask(
            scheduledCouponListingStorage(),
            _newScheduledTimestamp,
            abi.encode(_actionId)
        );
    }

    /**
     * @notice Executes up to `_max` matured coupon listing tasks from the coupon queue.
     * @dev Delegates to `triggerScheduledTasks` with the `"coupon"` callback key.
     *      Each triggered task calls `onScheduledCouponListingTriggered` if not
     *      disabled, which also conditionally updates the coupon rate.
     * @param _max    Maximum number of coupon listing tasks to process; `0` for all.
     * @return        The number of coupon listing tasks executed.
     */
    function triggerScheduledCouponListing(uint256 _max) internal returns (uint256) {
        return triggerScheduledTasks(scheduledCouponListingStorage(), bytes32("coupon"), _max);
    }

    /**
     * @notice Enqueues a balance adjustment task at the specified timestamp.
     * @dev Encodes `_actionId` as the task payload and inserts it into the balance
     *      adjustment queue, maintaining ascending timestamp order.
     * @param _newScheduledTimestamp Unix timestamp at which the adjustment fires.
     * @param _actionId             Corporate action identifier for the balance adjustment.
     */
    function addScheduledBalanceAdjustment(uint256 _newScheduledTimestamp, bytes32 _actionId) internal {
        ScheduledTasksLib.addScheduledTask(
            scheduledBalanceAdjustmentStorage(),
            _newScheduledTimestamp,
            abi.encode(_actionId)
        );
    }

    /**
     * @notice Executes up to `_max` matured balance adjustment tasks from the queue.
     * @dev Delegates to `triggerScheduledTasks` with the `"balance"` callback key.
     *      Each triggered task calls `onScheduledBalanceAdjustmentTriggered` if not
     *      disabled, which mutates token holder balances via `AdjustBalancesStorageWrapper`.
     * @param _max    Maximum number of balance adjustment tasks to process; `0` for all.
     * @return        The number of balance adjustment tasks executed.
     */
    function triggerScheduledBalanceAdjustments(uint256 _max) internal returns (uint256) {
        return triggerScheduledTasks(scheduledBalanceAdjustmentStorage(), bytes32("balance"), _max);
    }

    /**
     * @notice Enqueues a cross-ordered task at the specified timestamp.
     * @dev Encodes `_taskType` as the task payload. Cross-ordered tasks encode a
     *      task-type constant rather than a corporate action ID, which the dispatcher
     *      uses to delegate to the appropriate primary queue trigger.
     * @param _newScheduledTimestamp Unix timestamp at which the cross-ordered task fires.
     * @param _taskType             One of `SNAPSHOT_TASK_TYPE`, `BALANCE_ADJUSTMENT_TASK_TYPE`,
     *                              or `COUPON_LISTING_TASK_TYPE`.
     */
    function addScheduledCrossOrderedTask(uint256 _newScheduledTimestamp, bytes32 _taskType) internal {
        ScheduledTasksLib.addScheduledTask(
            scheduledCrossOrderedTaskStorage(),
            _newScheduledTimestamp,
            abi.encode(_taskType)
        );
    }

    /**
     * @notice Executes up to `_max` matured cross-ordered tasks from the queue.
     * @dev Delegates to `triggerScheduledTasks` with the `"crossOrdered"` callback
     *      key. Each triggered task dispatches a single item from the appropriate
     *      primary queue based on the encoded task type.
     * @param _max    Maximum number of cross-ordered tasks to process; `0` for all.
     * @return        The number of cross-ordered tasks executed.
     */
    function triggerScheduledCrossOrderedTasks(uint256 _max) internal returns (uint256) {
        return triggerScheduledTasks(scheduledCrossOrderedTaskStorage(), bytes32("crossOrdered"), _max);
    }

    /**
     * @notice Triggers pending cross-ordered tasks via an external call to the diamond
     *         proxy rather than an internal library call.
     * @dev Issues a self-call to `IScheduledCrossOrderedTasks.triggerPendingScheduledCrossOrderedTasks`
     *      using `address(this)`. This function is marked for removal; the external
     *      cross-facet call is no longer necessary once the library is called directly.
     *      TODO: REMOVE — delegate call between facets is no longer required.
     * @return The number of cross-ordered tasks executed.
     */
    function callTriggerPendingScheduledCrossOrderedTasks() internal returns (uint256) {
        return IScheduledCrossOrderedTasks(address(this)).triggerPendingScheduledCrossOrderedTasks();
    }

    /**
     * @notice Reverts if the provided timestamp is not strictly in the future.
     * @dev Compares `_timestamp` against the simulated or real block timestamp from
     *      `TimeTravelStorageWrapper`. Must be called as a precondition before
     *      enqueuing any scheduled task to prevent retroactive scheduling.
     * @param _timestamp The Unix timestamp to validate.
     */
    function requireValidTimestamp(uint256 _timestamp) internal view {
        if (_timestamp <= TimeTravelStorageWrapper.getBlockTimestamp()) revert WrongTimestamp(_timestamp);
    }

    // =========================================================================
    // Internal — Snapshot Queue Reads
    // =========================================================================

    /**
     * @notice Returns the total number of pending scheduled snapshots.
     * @return The count of entries currently in the snapshot queue.
     */
    function getScheduledSnapshotCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(scheduledSnapshotStorage());
    }

    /**
     * @notice Returns a paginated slice of the snapshot queue.
     * @param _pageIndex            Zero-based page index.
     * @param _pageLength           Maximum number of entries to return per page.
     * @return scheduledSnapshots_  Array of `ScheduledTask` entries for the requested page.
     */
    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledSnapshots_) {
        return ScheduledTasksLib.getScheduledTasks(scheduledSnapshotStorage(), _pageIndex, _pageLength);
    }

    // =========================================================================
    // Internal — Coupon Listing Queue Reads
    // =========================================================================

    /**
     * @notice Returns the total number of pending scheduled coupon listings.
     * @return The count of entries currently in the coupon listing queue.
     */
    function getScheduledCouponListingCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(scheduledCouponListingStorage());
    }

    /**
     * @notice Returns a paginated slice of the coupon listing queue.
     * @param _pageIndex                Zero-based page index.
     * @param _pageLength               Maximum number of entries to return per page.
     * @return scheduledCouponListing_  Array of `ScheduledTask` entries for the requested page.
     */
    function getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledCouponListing_) {
        return ScheduledTasksLib.getScheduledTasks(scheduledCouponListingStorage(), _pageIndex, _pageLength);
    }

    /**
     * @notice Counts the number of coupon listing tasks whose scheduled timestamp is
     *         strictly before `_timestamp`.
     * @dev Iterates the queue from the tail. Stops at the first task scheduled at or
     *      after `_timestamp`, exploiting the ascending sort order for early exit.
     *      Gas cost scales linearly with the number of matching tasks.
     * @param _timestamp The reference Unix timestamp for the pending count.
     * @return total_    The number of coupon listing tasks pending before `_timestamp`.
     */
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

    /**
     * @notice Returns the coupon ID linked to the coupon listing task at the given
     *         queue index.
     * @dev Decodes the task payload to retrieve the corporate action ID, then resolves
     *      the associated coupon ID via `CorporateActionsStorageWrapper`.
     * @param _index     Zero-based index into the coupon listing queue.
     * @return couponID_ The coupon ID associated with the task at `_index`.
     */
    function getScheduledCouponListingIdAtIndex(uint256 _index) internal view returns (uint256 couponID_) {
        ScheduledTask memory couponListing = ScheduledTasksLib.getScheduledTasksByIndex(
            scheduledCouponListingStorage(),
            _index
        );
        (, couponID_, , ) = CorporateActionsStorageWrapper.getCorporateAction(
            abi.decode(couponListing.data, (bytes32))
        );
    }

    // =========================================================================
    // Internal — Balance Adjustment Queue Reads
    // =========================================================================

    /**
     * @notice Returns the total number of pending scheduled balance adjustments.
     * @return The count of entries currently in the balance adjustment queue.
     */
    function getScheduledBalanceAdjustmentCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(scheduledBalanceAdjustmentStorage());
    }

    /**
     * @notice Returns a paginated slice of the balance adjustment queue.
     * @param _pageIndex                    Zero-based page index.
     * @param _pageLength                   Maximum number of entries to return per page.
     * @return scheduledBalanceAdjustment_  Array of `ScheduledTask` entries for the page.
     */
    function getScheduledBalanceAdjustments(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledBalanceAdjustment_) {
        return ScheduledTasksLib.getScheduledTasks(scheduledBalanceAdjustmentStorage(), _pageIndex, _pageLength);
    }

    /**
     * @notice Computes the aggregate balance adjustment factor and accumulated decimal
     *         precision for all tasks scheduled strictly before `_timestamp`.
     * @dev `pendingABAF_` is initialised to `1` (multiplicative identity) and is
     *      multiplied by each qualifying task's `factor`. `pendingDecimals_` is
     *      accumulated additively. Iterates from the tail of the queue and exits
     *      early on the first task at or after `_timestamp`. The caller is responsible
     *      for interpreting the combined factor with the correct decimal offset.
     * @param _timestamp        The reference Unix timestamp for the pending calculation.
     * @return pendingABAF_     Cumulative product of all pending balance adjustment factors.
     * @return pendingDecimals_ Cumulative sum of the decimal precisions for each factor.
     */
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

    // =========================================================================
    // Internal — Cross-Ordered Task Queue Reads
    // =========================================================================

    /**
     * @notice Returns the total number of pending scheduled cross-ordered tasks.
     * @return The count of entries currently in the cross-ordered task queue.
     */
    function getScheduledCrossOrderedTaskCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(scheduledCrossOrderedTaskStorage());
    }

    /**
     * @notice Returns a paginated slice of the cross-ordered task queue.
     * @param _pageIndex        Zero-based page index.
     * @param _pageLength       Maximum number of entries to return per page.
     * @return scheduledTask_   Array of `ScheduledTask` entries for the requested page.
     */
    function getScheduledCrossOrderedTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledTask_) {
        return ScheduledTasksLib.getScheduledTasks(scheduledCrossOrderedTaskStorage(), _pageIndex, _pageLength);
    }

    // =========================================================================
    // Internal — Storage Slot Accessors (public queues)
    // =========================================================================

    /**
     * @notice Returns a storage pointer to the coupon listing task queue.
     * @dev Resolves the slot via inline assembly using
     *      `_SCHEDULED_COUPON_LISTING_STORAGE_POSITION`. Follows the diamond storage
     *      pattern to prevent layout collisions with other facets.
     * @return scheduledCouponListing_ Storage reference to the coupon listing queue.
     */
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

    /**
     * @notice Returns a storage pointer to the balance adjustment task queue.
     * @dev Resolves the slot via inline assembly using
     *      `_SCHEDULED_BALANCE_ADJUSTMENTS_STORAGE_POSITION`. Follows the diamond
     *      storage pattern to prevent layout collisions with other facets.
     * @return scheduledBalanceAdjustments_ Storage reference to the balance adjustment queue.
     */
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

    /**
     * @notice Returns a storage pointer to the cross-ordered task queue.
     * @dev Resolves the slot via inline assembly using
     *      `_SCHEDULED_CROSS_ORDERED_TASKS_STORAGE_POSITION`. Follows the diamond
     *      storage pattern to prevent layout collisions with other facets.
     * @return scheduledCrossOrderedTasks_ Storage reference to the cross-ordered task queue.
     */
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

    /**
     * @notice Routes a matured task to its corresponding handler based on queue type.
     * @dev Evaluated in priority order: `"snapshot"` → `"coupon"` → `"balance"` →
     *      `"crossOrdered"`. An unrecognised `callbackType` results in a silent no-op.
     *      `pos` and `scheduledTasksLength` are forwarded for positional context but
     *      are currently unused by all handlers.
     * @param callbackType          Queue identifier key used to select the handler.
     * @param pos                   Zero-based index of the task within the queue.
     * @param scheduledTasksLength  Total queue length at the time of dispatch.
     * @param currentScheduledTask  The matured `ScheduledTask` to be processed.
     */
    function _dispatchScheduledTask(
        bytes32 callbackType,
        uint256 pos,
        uint256 scheduledTasksLength,
        ScheduledTask memory currentScheduledTask
    ) private {
        if (callbackType == bytes32("snapshot")) {
            onScheduledSnapshotTriggered(pos, scheduledTasksLength, currentScheduledTask);
            return;
        }
        if (callbackType == bytes32("coupon")) {
            onScheduledCouponListingTriggered(pos, scheduledTasksLength, currentScheduledTask);
            return;
        }
        if (callbackType == bytes32("balance")) {
            onScheduledBalanceAdjustmentTriggered(pos, scheduledTasksLength, currentScheduledTask);
            return;
        }
        if (callbackType == bytes32("crossOrdered")) {
            onScheduledCrossOrderedTaskTriggered(pos, scheduledTasksLength, currentScheduledTask);
        }
    }

    /**
     * @notice Executes a matured snapshot task by taking a new ERC-20 balance snapshot
     *         and recording its ID against the corporate action result.
     * @dev Exits silently if the linked corporate action is disabled. Emits
     *      `ISnapshots.SnapshotTriggered` with the new snapshot ID and the encoded
     *      action ID. The result is persisted via `CorporateActionsStorageWrapper`
     *      under `SNAPSHOT_RESULT_ID`.
     * @param _scheduledTask  The matured `ScheduledTask` containing the encoded action ID.
     */
    function onScheduledSnapshotTriggered(
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

    /**
     * @notice Executes a matured coupon listing task by appending the coupon to the
     *         ordered list and optionally recalculating its interest rate.
     * @dev Exits silently if the linked corporate action is disabled. After appending,
     *      conditionally updates the coupon rate if a Sustainability Performance Target
     *      or KPI-linked rate is initialised (see `_updateCouponRatesIfNeeded`). The
     *      resulting ordered list position is persisted under `COUPON_LISTING_RESULT_ID`.
     * @param _scheduledTask  The matured `ScheduledTask` containing the encoded action ID.
     */
    function onScheduledCouponListingTriggered(
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

    /**
     * @notice Executes a matured balance adjustment task by applying the encoded
     *         factor and decimal precision to all token holder balances.
     * @dev Exits silently if the linked corporate action is disabled. Decodes the
     *      corporate action data into `IEquity.ScheduledBalanceAdjustment` and
     *      delegates the mutation to `AdjustBalancesStorageWrapper.adjustBalances`.
     *      This operation is a global state mutation affecting all holder balances.
     * @param _scheduledTask  The matured `ScheduledTask` containing the encoded action ID.
     */
    function onScheduledBalanceAdjustmentTriggered(
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

    /**
     * @notice Executes a matured cross-ordered task by triggering a single item from
     *         the appropriate primary queue based on the encoded task type.
     * @dev Decodes the task payload as a task-type constant and routes to
     *      `triggerScheduledSnapshots`, `triggerScheduledBalanceAdjustments`, or
     *      `triggerScheduledCouponListing`, each with a limit of `1`. An unrecognised
     *      task type results in a silent no-op.
     * @param _scheduledTask  The matured `ScheduledTask` containing the encoded task type.
     */
    function onScheduledCrossOrderedTaskTriggered(
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

    /**
     * @notice Conditionally recalculates and persists the interest rate for a coupon
     *         if a Sustainability Performance Target or KPI-linked rate is active.
     * @dev Checks for each rate type independently; both may apply and overwrite in
     *      sequence. Rate recalculation involves cross-library calls to
     *      `SustainabilityPerformanceTargetRateLib` and `KpiLinkedRateLib`. If neither
     *      rate type is initialised, the coupon rate is left unchanged.
     * @param couponID  The identifier of the coupon whose rate may be updated.
     */
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

    /**
     * @notice Resolves the coupon ID associated with a given corporate action.
     * @dev Delegates to `CorporateActionsStorageWrapper.getCorporateAction` and
     *      extracts the second return value.
     * @param actionId    The corporate action identifier to look up.
     * @return couponID_  The coupon ID linked to the given action.
     */
    function _getCouponIdFromAction(bytes32 actionId) private view returns (uint256 couponID_) {
        (, couponID_, , ) = CorporateActionsStorageWrapper.getCorporateAction(actionId);
    }

    /**
     * @notice Decodes and returns the action or task-type identifier from a scheduled
     *         task's ABI-encoded payload.
     * @param _scheduledTask  The `ScheduledTask` whose `data` field is to be decoded.
     * @return actionId_      The `bytes32` identifier encoded within the task payload.
     */
    function _getActionIdFromScheduledTask(
        ScheduledTask memory _scheduledTask
    ) private pure returns (bytes32 actionId_) {
        return abi.decode(_scheduledTask.data, (bytes32));
    }

    /**
     * @notice Returns a storage pointer to the snapshot task queue.
     * @dev Resolves the slot via inline assembly using
     *      `_SCHEDULED_SNAPSHOTS_STORAGE_POSITION`. Follows the diamond storage pattern
     *      to prevent layout collisions with other facets.
     * @return scheduledSnapshots_ Storage reference to the snapshot task queue.
     */
    function scheduledSnapshotStorage() private pure returns (ScheduledTasksDataStorage storage scheduledSnapshots_) {
        bytes32 position = _SCHEDULED_SNAPSHOTS_STORAGE_POSITION;
        assembly {
            scheduledSnapshots_.slot := position
        }
    }
}
