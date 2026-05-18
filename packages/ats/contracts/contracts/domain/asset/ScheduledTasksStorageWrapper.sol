// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledTasksLib } from "../../facets/layer_2/scheduledTask/ScheduledTasksLib.sol";
import {
    ScheduledTask,
    ScheduledTasksDataStorage
} from "../../facets/layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { IScheduledBalanceAdjustment } from "../../facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol";
import {
    _SCHEDULED_SNAPSHOTS_STORAGE_POSITION,
    _SCHEDULED_COUPON_LISTING_STORAGE_POSITION,
    _SCHEDULED_BALANCE_ADJUSTMENTS_STORAGE_POSITION,
    _SCHEDULED_CROSS_ORDERED_TASKS_STORAGE_POSITION
} from "../../constants/storagePositions.sol";
import { SNAPSHOT_TASK_TYPE, BALANCE_ADJUSTMENT_TASK_TYPE, COUPON_LISTING_TASK_TYPE } from "../../constants/values.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { ScheduledTasksDispatchOps } from "../orchestrator/ScheduledTasksDispatchOps.sol";
import {
    IScheduledCrossOrderedTasks
} from "../../facets/layer_2/scheduledTask/scheduledCrossOrderedTask/IScheduledCrossOrderedTasks.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title Scheduled Tasks Storage Wrapper
 * @notice Manages storage, execution and queries for time-based scheduled task queues.
 * @dev Uses dedicated unstructured storage slots per task type and delegates task execution
 *      through `ScheduledTasksDispatchOps` to isolate failures. Queues are expected to be
 *      ordered so that the next executable task is located at the top index.
 * @author Asset Tokenization Studio Team
 */
library ScheduledTasksStorageWrapper {
    /**
     * @notice Reverts when a scheduled timestamp is not strictly in the future.
     * @dev The current timestamp is read through `TimeTravelStorageWrapper`.
     * @param timeStamp Timestamp rejected for scheduling.
     */
    error WrongTimestamp(uint256 timeStamp);

    /**
     * @notice Executes due scheduled tasks from a queue up to the requested limit.
     * @dev Pops each due task before dispatch. Failed executions cancel the related
     *      corporate action or pending sub-task action and emit `TaskExecutionFailed`.
     *      If a cross-ordered task returns a recognised sub-task type, one due task from
     *      the corresponding sub-queue is triggered in the same call.
     * @param _scheduledTasks Queue storage containing the scheduled tasks to process.
     * @param callbackType Dispatch discriminator used by `ScheduledTasksDispatchOps`.
     * @param _max Maximum number of tasks to process; zero means all currently queued tasks.
     * @return processed_ Number of tasks removed from the supplied queue.
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

            try
                ScheduledTasksDispatchOps.execute(callbackType, pos, scheduledTasksLength, currentScheduledTask)
            returns (bytes32 subTaskType) {
                if (subTaskType != bytes32(0)) {
                    _triggerOneSubTask(subTaskType, currentBlockTimestamp);
                }
            } catch {
                _onTaskExecutionFailed(callbackType, currentScheduledTask);
            }

            unchecked {
                ++processed_;
                ++j;
            }
        }
    }

    /**
     * @notice Adds a snapshot task to the scheduled snapshot queue.
     * @dev The action identifier is ABI-encoded as task data. Callers should validate the
     *      timestamp before calling when future-only scheduling is required.
     * @param _newScheduledTimestamp Timestamp at which the snapshot may be triggered.
     * @param _actionId Corporate action identifier associated with the snapshot.
     */
    function addScheduledSnapshot(uint256 _newScheduledTimestamp, bytes32 _actionId) internal {
        ScheduledTasksLib.addScheduledTask(scheduledSnapshotStorage(), _newScheduledTimestamp, abi.encode(_actionId));
    }

    /**
     * @notice Executes due scheduled snapshot tasks.
     * @dev Uses the `snapshot` callback type and may update snapshot-related corporate
     *      action results through the dispatch layer.
     * @param _max Maximum number of snapshot tasks to process; zero means all due tasks.
     * @return Number of snapshot tasks removed from the queue.
     */
    function triggerScheduledSnapshots(uint256 _max) internal returns (uint256) {
        return triggerScheduledTasks(scheduledSnapshotStorage(), bytes32("snapshot"), _max);
    }

    /**
     * @notice Adds a coupon listing task to the scheduled coupon listing queue.
     * @dev The action identifier is ABI-encoded as task data and later resolved through
     *      corporate action storage by the dispatch layer.
     * @param _newScheduledTimestamp Timestamp at which the coupon listing may be triggered.
     * @param _actionId Corporate action identifier associated with the coupon listing.
     */
    function addScheduledCouponListing(uint256 _newScheduledTimestamp, bytes32 _actionId) internal {
        ScheduledTasksLib.addScheduledTask(
            scheduledCouponListingStorage(),
            _newScheduledTimestamp,
            abi.encode(_actionId)
        );
    }

    /**
     * @notice Executes due scheduled coupon listing tasks.
     * @dev Uses the `coupon` callback type. Dispatch may add coupons to the ordered list
     *      and update corporate action results.
     * @param _max Maximum number of coupon listing tasks to process; zero means all due tasks.
     * @return Number of coupon listing tasks removed from the queue.
     */
    function triggerScheduledCouponListing(uint256 _max) internal returns (uint256) {
        return triggerScheduledTasks(scheduledCouponListingStorage(), bytes32("coupon"), _max);
    }

    /**
     * @notice Adds a balance adjustment task to the scheduled balance adjustment queue.
     * @dev The action identifier is ABI-encoded as task data and later used to load the
     *      balance adjustment parameters from corporate action storage.
     * @param _newScheduledTimestamp Timestamp at which the adjustment may be triggered.
     * @param _actionId Corporate action identifier associated with the adjustment.
     */
    function addScheduledBalanceAdjustment(uint256 _newScheduledTimestamp, bytes32 _actionId) internal {
        ScheduledTasksLib.addScheduledTask(
            scheduledBalanceAdjustmentStorage(),
            _newScheduledTimestamp,
            abi.encode(_actionId)
        );
    }

    /**
     * @notice Executes due scheduled balance adjustment tasks.
     * @dev Uses the `balance` callback type. Dispatch may mutate balances according to the
     *      stored adjustment factor and decimals.
     * @param _max Maximum number of adjustment tasks to process; zero means all due tasks.
     * @return Number of balance adjustment tasks removed from the queue.
     */
    function triggerScheduledBalanceAdjustments(uint256 _max) internal returns (uint256) {
        return triggerScheduledTasks(scheduledBalanceAdjustmentStorage(), bytes32("balance"), _max);
    }

    /**
     * @notice Adds a cross-ordered task that coordinates execution of another task queue.
     * @dev The task type is ABI-encoded as task data. When triggered, the dispatcher returns
     *      the sub-task type and this library attempts to execute one due task from that queue.
     * @param _newScheduledTimestamp Timestamp at which the cross-ordered task may run.
     * @param _taskType Encoded task type identifier for the sub-queue to coordinate.
     */
    function addScheduledCrossOrderedTask(uint256 _newScheduledTimestamp, bytes32 _taskType) internal {
        ScheduledTasksLib.addScheduledTask(
            scheduledCrossOrderedTaskStorage(),
            _newScheduledTimestamp,
            abi.encode(_taskType)
        );
    }

    /**
     * @notice Executes due cross-ordered tasks and their due recognised sub-tasks.
     * @dev Uses the `crossOrdered` callback type. A failed cross-ordered task cancels the
     *      pending top action in the referenced sub-queue when the task type is recognised.
     * @param _max Maximum number of cross-ordered tasks to process; zero means all due tasks.
     * @return Number of cross-ordered tasks removed from the queue.
     */
    function triggerScheduledCrossOrderedTasks(uint256 _max) internal returns (uint256) {
        return triggerScheduledTasks(scheduledCrossOrderedTaskStorage(), bytes32("crossOrdered"), _max);
    }

    /**
     * @notice Validates that a timestamp is strictly greater than the current block time.
     * @dev Reverts with `WrongTimestamp` when the timestamp is in the past or present.
     * @param _timestamp Timestamp to validate.
     */
    function requireValidTimestamp(uint256 _timestamp) internal view {
        if (_timestamp <= TimeTravelStorageWrapper.getBlockTimestamp()) revert WrongTimestamp(_timestamp);
    }

    /**
     * @notice Returns the number of scheduled snapshot tasks.
     * @dev Reads only the snapshot task queue.
     * @return Number of queued snapshot tasks.
     */
    function getScheduledSnapshotCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(scheduledSnapshotStorage());
    }

    /**
     * @notice Returns a paginated list of scheduled snapshot tasks.
     * @dev Pagination semantics are delegated to `ScheduledTasksLib`.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of tasks to return.
     * @return scheduledSnapshots_ Snapshot tasks contained in the requested page.
     */
    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledSnapshots_) {
        return ScheduledTasksLib.getScheduledTasks(scheduledSnapshotStorage(), _pageIndex, _pageLength);
    }

    /**
     * @notice Returns the number of scheduled coupon listing tasks.
     * @dev Reads only the coupon listing task queue.
     * @return Number of queued coupon listing tasks.
     */
    function getScheduledCouponListingCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(scheduledCouponListingStorage());
    }

    /**
     * @notice Returns a paginated list of scheduled coupon listing tasks.
     * @dev Pagination semantics are delegated to `ScheduledTasksLib`.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of tasks to return.
     * @return scheduledCouponListing_ Coupon listing tasks contained in the requested page.
     */
    function getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledCouponListing_) {
        return ScheduledTasksLib.getScheduledTasks(scheduledCouponListingStorage(), _pageIndex, _pageLength);
    }

    /**
     * @notice Counts pending coupon listings scheduled before a timestamp.
     * @dev Iterates from the queue top and stops at the first task not earlier than the
     *      timestamp. Gas cost grows linearly with the number of matching pending tasks.
     * @param _timestamp Exclusive upper bound for scheduled timestamps.
     * @return total_ Number of pending coupon listings scheduled before `_timestamp`.
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
     * @notice Returns the coupon identifier associated with a queued coupon listing task.
     * @dev Decodes the task action identifier and reads the coupon ID from corporate action
     *      storage. Reverts if the queue index is invalid in `ScheduledTasksLib`.
     * @param _index Queue index of the scheduled coupon listing task.
     * @return couponID_ Coupon identifier stored in the related corporate action.
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

    /**
     * @notice Returns the number of scheduled balance adjustment tasks.
     * @dev Reads only the balance adjustment task queue.
     * @return Number of queued balance adjustment tasks.
     */
    function getScheduledBalanceAdjustmentCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(scheduledBalanceAdjustmentStorage());
    }

    /**
     * @notice Returns a paginated list of scheduled balance adjustment tasks.
     * @dev Pagination semantics are delegated to `ScheduledTasksLib`.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of tasks to return.
     * @return scheduledBalanceAdjustment_ Adjustment tasks contained in the requested page.
     */
    function getScheduledBalanceAdjustments(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledBalanceAdjustment_) {
        return ScheduledTasksLib.getScheduledTasks(scheduledBalanceAdjustmentStorage(), _pageIndex, _pageLength);
    }

    /**
     * @notice Aggregates pending balance adjustment factors scheduled before a timestamp.
     * @dev Iterates from the queue top and stops at the first task not earlier than the
     *      timestamp. Gas cost grows linearly with the number of matching pending tasks.
     * @param _timestamp Exclusive upper bound for scheduled timestamps.
     * @return pendingABAF_ Product of pending adjustment factors, initialised to one.
     * @return pendingDecimals_ Sum of decimal adjustments for matching pending tasks.
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

                IScheduledBalanceAdjustment.ScheduledBalanceAdjustment memory balanceAdjustment = abi.decode(
                    balanceAdjustmentData,
                    (IScheduledBalanceAdjustment.ScheduledBalanceAdjustment)
                );

                // Apply each adjustment via 512-bit mulDiv so the accumulator stays the integer
                // ratio at every step instead of compounding the 1e18-scale factor unchecked.
                pendingABAF_ = Math.mulDiv(pendingABAF_, balanceAdjustment.factor, 10 ** balanceAdjustment.decimals);
                pendingDecimals_ += balanceAdjustment.decimals;

                unchecked {
                    ++i;
                }
                continue;
            }

            break;
        }
    }

    /**
     * @notice Returns the number of scheduled cross-ordered tasks.
     * @dev Reads only the cross-ordered task queue.
     * @return Number of queued cross-ordered tasks.
     */
    function getScheduledCrossOrderedTaskCount() internal view returns (uint256) {
        return ScheduledTasksLib.getScheduledTaskCount(scheduledCrossOrderedTaskStorage());
    }

    /**
     * @notice Returns a paginated list of scheduled cross-ordered tasks.
     * @dev Pagination semantics are delegated to `ScheduledTasksLib`.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of tasks to return.
     * @return scheduledTask_ Cross-ordered tasks contained in the requested page.
     */
    function getScheduledCrossOrderedTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledTask_) {
        return ScheduledTasksLib.getScheduledTasks(scheduledCrossOrderedTaskStorage(), _pageIndex, _pageLength);
    }

    /**
     * @notice Returns the storage pointer for scheduled snapshot tasks.
     * @dev Uses the fixed unstructured storage slot reserved for scheduled snapshots.
     * @return scheduledSnapshots_ Storage reference for the snapshot task queue.
     */
    function scheduledSnapshotStorage() internal pure returns (ScheduledTasksDataStorage storage scheduledSnapshots_) {
        bytes32 position = _SCHEDULED_SNAPSHOTS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledSnapshots_.slot := position
        }
    }

    /**
     * @notice Returns the storage pointer for scheduled coupon listing tasks.
     * @dev Uses the fixed unstructured storage slot reserved for coupon listing tasks.
     * @return scheduledCouponListing_ Storage reference for the coupon listing task queue.
     */
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

    /**
     * @notice Returns the storage pointer for scheduled balance adjustment tasks.
     * @dev Uses the fixed unstructured storage slot reserved for balance adjustment tasks.
     * @return scheduledBalanceAdjustments_ Storage reference for the adjustment task queue.
     */
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

    /**
     * @notice Returns the storage pointer for scheduled cross-ordered tasks.
     * @dev Uses the fixed unstructured storage slot reserved for cross-ordered tasks.
     * @return scheduledCrossOrderedTasks_ Storage reference for the cross-ordered task queue.
     */
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

    /**
     * @notice Triggers one due sub-task for a recognised cross-ordered task type.
     * @dev Returns silently for unknown task types, empty queues or sub-tasks that are not due.
     *      Pops the sub-task before dispatch and handles execution failure by cancellation.
     * @param subTaskType Task type identifying the sub-queue to process.
     * @param currentBlockTimestamp Timestamp used as the due-task threshold.
     */
    function _triggerOneSubTask(bytes32 subTaskType, uint256 currentBlockTimestamp) private {
        ScheduledTasksDataStorage storage subQueue_;
        bytes32 subCallbackType;

        if (subTaskType == SNAPSHOT_TASK_TYPE) {
            subQueue_ = scheduledSnapshotStorage();
            subCallbackType = bytes32("snapshot");
        } else if (subTaskType == BALANCE_ADJUSTMENT_TASK_TYPE) {
            subQueue_ = scheduledBalanceAdjustmentStorage();
            subCallbackType = bytes32("balance");
        } else if (subTaskType == COUPON_LISTING_TASK_TYPE) {
            subQueue_ = scheduledCouponListingStorage();
            subCallbackType = bytes32("coupon");
        } else {
            return;
        }

        uint256 count = ScheduledTasksLib.getScheduledTaskCount(subQueue_);
        if (count == 0) return;

        uint256 pos;
        unchecked {
            pos = count - 1;
        }

        ScheduledTask memory subTask = ScheduledTasksLib.getScheduledTasksByIndex(subQueue_, pos);
        if (subTask.scheduledTimestamp >= currentBlockTimestamp) return;

        ScheduledTasksLib.popScheduledTask(subQueue_);

        try ScheduledTasksDispatchOps.execute(subCallbackType, pos, count, subTask) returns (bytes32) {} catch {
            _onTaskExecutionFailed(subCallbackType, subTask);
        }
    }

    /**
     * @notice Handles a failed scheduled task execution.
     * @dev Cross-ordered failures cancel the pending top action in the referenced sub-queue.
     *      Other failures cancel the corporate action encoded in the failed task. Always emits
     *      `TaskExecutionFailed` with the failed action or task identifier.
     * @param callbackType Dispatch discriminator of the failed task.
     * @param task Failed scheduled task.
     */
    function _onTaskExecutionFailed(bytes32 callbackType, ScheduledTask memory task) private {
        bytes32 actionId = _getActionIdFromScheduledTask(task);

        if (callbackType == bytes32("crossOrdered")) {
            _cancelPendingSubTaskAction(actionId);
            emit IScheduledCrossOrderedTasks.TaskExecutionFailed(actionId, callbackType, task.scheduledTimestamp);
            return;
        }

        CorporateActionsStorageWrapper.cancelCorporateAction(actionId);
        emit IScheduledCrossOrderedTasks.TaskExecutionFailed(actionId, callbackType, task.scheduledTimestamp);
    }

    /**
     * @notice Cancels the pending action at the top of a recognised sub-task queue.
     * @dev Returns silently for unknown task types and empty queues.
     * @param taskType Task type identifying the sub-queue whose top action should be cancelled.
     */
    function _cancelPendingSubTaskAction(bytes32 taskType) private {
        if (taskType == SNAPSHOT_TASK_TYPE) {
            _cancelTopQueueAction(scheduledSnapshotStorage());
            return;
        }

        if (taskType == BALANCE_ADJUSTMENT_TASK_TYPE) {
            _cancelTopQueueAction(scheduledBalanceAdjustmentStorage());
            return;
        }

        if (taskType == COUPON_LISTING_TASK_TYPE) {
            _cancelTopQueueAction(scheduledCouponListingStorage());
        }
    }

    /**
     * @notice Cancels the corporate action encoded in the top task of a queue.
     * @dev Does not remove the task from the queue. Returns silently when the queue is empty.
     * @param subQueue Queue whose top task contains the action identifier to cancel.
     */
    function _cancelTopQueueAction(ScheduledTasksDataStorage storage subQueue) private {
        uint256 count = ScheduledTasksLib.getScheduledTaskCount(subQueue);
        if (count == 0) return;

        ScheduledTask memory pendingTask = ScheduledTasksLib.getScheduledTasksByIndex(subQueue, count - 1);
        CorporateActionsStorageWrapper.cancelCorporateAction(abi.decode(pendingTask.data, (bytes32)));
    }

    /**
     * @notice Decodes the corporate action identifier from a scheduled task.
     * @dev Assumes the task data was encoded as a single `bytes32` value.
     * @param _scheduledTask Scheduled task containing ABI-encoded action data.
     * @return actionId_ Decoded corporate action identifier.
     */
    function _getActionIdFromScheduledTask(
        ScheduledTask memory _scheduledTask
    ) private pure returns (bytes32 actionId_) {
        return abi.decode(_scheduledTask.data, (bytes32));
    }
}
