// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledTasksLib } from "../../facets/layer_2/scheduledTask/ScheduledTasksLib.sol";
import { ScheduledTask } from "../../facets/layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { IScheduledBalanceAdjustment } from "../../facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol";
import {
    SCHEDULED_TASK_TYPE_SNAPSHOT,
    SCHEDULED_TASK_TYPE_BALANCE_ADJUSTMENT,
    SCHEDULED_TASK_TYPE_COUPON_LISTING
} from "../../constants/dispatchTypes.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { ScheduledTasksDispatchOps } from "../orchestrator/ScheduledTasksDispatchOps.sol";

/// @custom:hash storage ScheduledSnapshots
// solhint-disable-next-line max-line-length
bytes32 constant STORAGE_LOCATION_SCHEDULED_SNAPSHOTS = 0xe2e07c157b61a7bd819a93fb196f6ac3e8a94f8b21b80c29eef98c4d9b337100;

/// @custom:hash storage ScheduledCouponListing
// solhint-disable-next-line max-line-length
bytes32 constant STORAGE_LOCATION_SCHEDULED_COUPON_LISTING = 0xa0157ee35363346eb57cfbda57a41ce45f495ee1e325889bbdf25b28f39b3400;

/// @custom:hash storage ScheduledBalanceAdjustments
// solhint-disable-next-line max-line-length
bytes32 constant STORAGE_LOCATION_SCHEDULED_BALANCE_ADJUSTMENTS = 0x2585709bc5ff555bc3cb151d59074172c414752354c927dc0f683157ac009500;

/// @custom:hash storage ScheduledCrossOrderedTasks
// solhint-disable-next-line max-line-length
bytes32 constant STORAGE_LOCATION_SCHEDULED_CROSS_ORDERED_TASKS = 0xc0ba5b9a820688d8898770d2f45db1e829785cb69882e5bb2981fdd22d60f900;

/**
 * @notice Generic ordered-task-queue storage layout.
 * @dev Instantiated at four independent ERC-7201 namespaces by this wrapper, one per task family:
 *        - erc7201:security.token.standard.storage.ScheduledSnapshots
 *        - erc7201:security.token.standard.storage.ScheduledCouponListing
 *        - erc7201:security.token.standard.storage.ScheduledBalanceAdjustments
 *        - erc7201:security.token.standard.storage.ScheduledCrossOrderedTasks
 *      No single `@custom:storage-location` annotation can capture the four-slot binding;
 *      tooling that needs per-slot layout resolution must consult the four STORAGE_LOCATION_*
 *      constants in this file directly.
 */
struct ScheduledTasksDataStorage {
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    uint256 scheduledTaskCount;
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    mapping(uint256 => ScheduledTask) scheduledTasks;
    // ─── APPEND-ONLY ZONE BELOW ───
}

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
     * @dev Pops each due task before dispatch. A failed execution reverts the entire call,
     *      leaving the queue unchanged so the blocked task can be force-cancelled by an
     *      authorised caller. If a cross-ordered task returns a recognised sub-task type,
     *      one due task from the corresponding sub-queue is triggered in the same call.
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

            if (currentScheduledTask.scheduledTimestamp > currentBlockTimestamp) break;

            ScheduledTasksLib.popScheduledTask(_scheduledTasks);

            bytes32 subTaskType = ScheduledTasksDispatchOps.execute(callbackType, currentScheduledTask);
            if (subTaskType != bytes32(0)) {
                _triggerOneSubTask(subTaskType, currentBlockTimestamp);
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
     * @dev When `_includeDisabled` is `false`, iterates the queue and excludes tasks
     *      belonging to a disabled corporate action (O(n)). When `true`, returns the raw
     *      queue length in O(1).
     * @param _includeDisabled When `false`, disabled tasks are excluded from the count.
     * @return count_ Number of queued snapshot tasks, optionally filtered.
     */
    function getScheduledSnapshotCount(bool _includeDisabled) internal view returns (uint256 count_) {
        ScheduledTasksDataStorage storage store = scheduledSnapshotStorage();
        uint256 total = ScheduledTasksLib.getScheduledTaskCount(store);
        if (_includeDisabled) return total;

        for (uint256 i; i < total; ) {
            unchecked {
                count_ += CorporateActionsStorageWrapper.isCorporateActionDisabled(
                    abi.decode(ScheduledTasksLib.getScheduledTasksByIndex(store, i).data, (bytes32))
                )
                    ? 0
                    : 1;
                ++i;
            }
        }
    }

    /**
     * @notice Returns a paginated list of scheduled snapshot tasks.
     * @dev When `_includeDisabled` is `true`, delegates to `ScheduledTasksLib` using direct
     *      index arithmetic (O(1) per item). When `false`, iterates the full queue and skips
     *      disabled tasks before applying pagination (O(n)).
     * @param _pageIndex       Zero-based page index.
     * @param _pageLength      Maximum number of tasks to return.
     * @param _includeDisabled When `false`, tasks belonging to a disabled corporate action are
     *                         excluded from the page.
     * @return scheduledSnapshots_ Snapshot tasks contained in the requested page.
     */
    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength,
        bool _includeDisabled
    ) internal view returns (ScheduledTask[] memory scheduledSnapshots_) {
        scheduledSnapshots_ = _includeDisabled
            ? ScheduledTasksLib.getScheduledTasks(scheduledSnapshotStorage(), _pageIndex, _pageLength)
            : _getActivePage(scheduledSnapshotStorage(), _pageIndex, _pageLength);
    }

    /**
     * @notice Returns the number of scheduled coupon listing tasks.
     * @dev When `_includeDisabled` is `false`, iterates the queue and excludes tasks
     *      belonging to a disabled corporate action (O(n)). When `true`, returns the raw
     *      queue length in O(1) — use this form for internal iteration where the full
     *      queue size is needed.
     * @param _includeDisabled When `false`, disabled tasks are excluded from the count.
     * @return count_ Number of queued coupon listing tasks, optionally filtered.
     */
    function getScheduledCouponListingCount(bool _includeDisabled) internal view returns (uint256 count_) {
        uint256 total = ScheduledTasksLib.getScheduledTaskCount(scheduledCouponListingStorage());
        if (_includeDisabled) return total;

        for (uint256 i; i < total; ) {
            unchecked {
                count_ += isScheduledCouponListingDisabledAtIndex(i) ? 0 : 1;
                ++i;
            }
        }
    }

    /**
     * @notice Returns a paginated list of scheduled coupon listing tasks.
     * @dev When `_includeDisabled` is `true`, delegates to `ScheduledTasksLib` using direct
     *      index arithmetic (O(1) per item). When `false`, iterates the full queue and skips
     *      disabled tasks before applying pagination (O(n)).
     * @param _pageIndex       Zero-based page index.
     * @param _pageLength      Maximum number of tasks to return.
     * @param _includeDisabled When `false`, tasks belonging to a disabled corporate action are
     *                         excluded from the page.
     * @return scheduledCouponListing_ Coupon listing tasks contained in the requested page.
     */
    function getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength,
        bool _includeDisabled
    ) internal view returns (ScheduledTask[] memory scheduledCouponListing_) {
        scheduledCouponListing_ = _includeDisabled
            ? ScheduledTasksLib.getScheduledTasks(scheduledCouponListingStorage(), _pageIndex, _pageLength)
            : _getActivePage(scheduledCouponListingStorage(), _pageIndex, _pageLength);
    }

    /**
     * @notice Counts pending coupon listings scheduled before a timestamp.
     * @dev Iterates from the queue top and stops at the first task not earlier than the
     *      timestamp. Gas cost grows linearly with the number of matching pending tasks.
     * @param _timestamp      Exclusive upper bound for scheduled timestamps.
     * @param _includeDisabled When `false`, tasks belonging to a disabled corporate action are
     *                         excluded from the count.
     * @return total_ Number of pending coupon listings scheduled before `_timestamp`.
     */
    function getPendingScheduledCouponListingTotalAt(
        uint256 _timestamp,
        bool _includeDisabled
    ) internal view returns (uint256 total_) {
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
                if (
                    _includeDisabled ||
                    !CorporateActionsStorageWrapper.isCorporateActionDisabled(abi.decode(scheduledTask.data, (bytes32)))
                ) {
                    unchecked {
                        ++total_;
                    }
                }
                unchecked {
                    ++i;
                }
                continue;
            }

            break;
        }
    }

    /**
     * @notice Returns whether the coupon listing task at a given queue index belongs to a
     *         disabled corporate action.
     * @param _index Queue index of the scheduled coupon listing task.
     * @return True if the related corporate action is disabled.
     */
    function isScheduledCouponListingDisabledAtIndex(uint256 _index) internal view returns (bool) {
        ScheduledTask memory couponListing = ScheduledTasksLib.getScheduledTasksByIndex(
            scheduledCouponListingStorage(),
            _index
        );
        return CorporateActionsStorageWrapper.isCorporateActionDisabled(abi.decode(couponListing.data, (bytes32)));
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
     * @dev When `_includeDisabled` is `false`, iterates the queue and excludes tasks
     *      belonging to a disabled corporate action (O(n)). When `true`, returns the raw
     *      queue length in O(1).
     * @param _includeDisabled When `false`, disabled tasks are excluded from the count.
     * @return count_ Number of queued balance adjustment tasks, optionally filtered.
     */
    function getScheduledBalanceAdjustmentCount(bool _includeDisabled) internal view returns (uint256 count_) {
        ScheduledTasksDataStorage storage store = scheduledBalanceAdjustmentStorage();
        uint256 total = ScheduledTasksLib.getScheduledTaskCount(store);
        if (_includeDisabled) return total;

        for (uint256 i; i < total; ) {
            unchecked {
                count_ += CorporateActionsStorageWrapper.isCorporateActionDisabled(
                    abi.decode(ScheduledTasksLib.getScheduledTasksByIndex(store, i).data, (bytes32))
                )
                    ? 0
                    : 1;
                ++i;
            }
        }
    }

    /**
     * @notice Returns a paginated list of scheduled balance adjustment tasks.
     * @dev When `_includeDisabled` is `true`, delegates to `ScheduledTasksLib` using direct
     *      index arithmetic (O(1) per item). When `false`, iterates the full queue and skips
     *      disabled tasks before applying pagination (O(n)).
     * @param _pageIndex       Zero-based page index.
     * @param _pageLength      Maximum number of tasks to return.
     * @param _includeDisabled When `false`, tasks belonging to a disabled corporate action are
     *                         excluded from the page.
     * @return scheduledBalanceAdjustment_ Adjustment tasks contained in the requested page.
     */
    function getScheduledBalanceAdjustments(
        uint256 _pageIndex,
        uint256 _pageLength,
        bool _includeDisabled
    ) internal view returns (ScheduledTask[] memory scheduledBalanceAdjustment_) {
        scheduledBalanceAdjustment_ = _includeDisabled
            ? ScheduledTasksLib.getScheduledTasks(scheduledBalanceAdjustmentStorage(), _pageIndex, _pageLength)
            : _getActivePage(scheduledBalanceAdjustmentStorage(), _pageIndex, _pageLength);
    }

    /**
     * @notice Aggregates pending balance adjustment factors scheduled before a timestamp.
     * @dev Iterates from the queue top and stops at the first task not earlier than the
     *      timestamp. Gas cost grows linearly with the number of matching pending tasks.
     * @param _timestamp       Exclusive upper bound for scheduled timestamps.
     * @param _includeDisabled When `false`, tasks belonging to a disabled corporate action are
     *                         excluded from the aggregation.
     * @return pendingABAF_ Product of pending adjustment factors, initialised to one.
     * @return pendingDecimals_ Sum of decimal adjustments for matching pending tasks.
     */
    function getPendingScheduledBalanceAdjustmentsAt(
        uint256 _timestamp,
        bool _includeDisabled
    ) internal view returns (uint256 pendingABAF_, uint8 pendingDecimals_) {
        pendingABAF_ = 1;
        ScheduledTasksDataStorage storage scheduledBalanceAdjustments = scheduledBalanceAdjustmentStorage();
        uint256 length = ScheduledTasksLib.getScheduledTaskCount(scheduledBalanceAdjustments);
        uint256 pos = length;

        for (uint256 i; i < length; ) {
            unchecked {
                --pos;
                ++i;
            }

            ScheduledTask memory scheduledTask = ScheduledTasksLib.getScheduledTasksByIndex(
                scheduledBalanceAdjustments,
                pos
            );

            if (scheduledTask.scheduledTimestamp >= _timestamp) break;

            bytes32 actionId = abi.decode(scheduledTask.data, (bytes32));

            if (_includeDisabled || !CorporateActionsStorageWrapper.isCorporateActionDisabled(actionId)) {
                IScheduledBalanceAdjustment.ScheduledBalanceAdjustment memory balanceAdjustment = abi.decode(
                    CorporateActionsStorageWrapper.getCorporateActionData(actionId),
                    (IScheduledBalanceAdjustment.ScheduledBalanceAdjustment)
                );

                pendingABAF_ *= balanceAdjustment.factor;
                pendingDecimals_ += balanceAdjustment.decimals;
            }
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
        bytes32 position = STORAGE_LOCATION_SCHEDULED_SNAPSHOTS;
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
        bytes32 position = STORAGE_LOCATION_SCHEDULED_COUPON_LISTING;
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
        bytes32 position = STORAGE_LOCATION_SCHEDULED_BALANCE_ADJUSTMENTS;
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
        bytes32 position = STORAGE_LOCATION_SCHEDULED_CROSS_ORDERED_TASKS;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledCrossOrderedTasks_.slot := position
        }
    }

    /**
     * @notice Triggers one due sub-task for a recognised cross-ordered task type.
     * @dev Returns silently for unknown task types, empty queues or sub-tasks that are not due.
     *      Pops the sub-task before dispatch; a failed execution reverts the entire call.
     * @param subTaskType Task type identifying the sub-queue to process.
     * @param currentBlockTimestamp Timestamp used as the due-task threshold.
     */
    function _triggerOneSubTask(bytes32 subTaskType, uint256 currentBlockTimestamp) private {
        ScheduledTasksDataStorage storage subQueue_;
        bytes32 subCallbackType;

        if (subTaskType == SCHEDULED_TASK_TYPE_SNAPSHOT) {
            subQueue_ = scheduledSnapshotStorage();
            subCallbackType = bytes32("snapshot");
        } else if (subTaskType == SCHEDULED_TASK_TYPE_BALANCE_ADJUSTMENT) {
            subQueue_ = scheduledBalanceAdjustmentStorage();
            subCallbackType = bytes32("balance");
        } else if (subTaskType == SCHEDULED_TASK_TYPE_COUPON_LISTING) {
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
        if (subTask.scheduledTimestamp > currentBlockTimestamp) return;

        ScheduledTasksLib.popScheduledTask(subQueue_);

        ScheduledTasksDispatchOps.execute(subCallbackType, subTask);
    }

    /**
     * @notice Returns a page of active (non-disabled) tasks from a queue.
     * @dev O(_pageLength): iterates only the raw queue slots `[start, end)` computed from
     *      `_pageIndex` and `_pageLength`. Disabled tasks within that window are skipped, so
     *      a page may return fewer than `_pageLength` items when disabled tasks fall in range.
     *      The returned array is trimmed to the actual collected count via assembly.
     * @param _store      Storage pointer to the task queue to paginate.
     * @param _pageIndex  Zero-based page index.
     * @param _pageLength Maximum number of tasks per page.
     * @return result_ Active tasks in the requested page, never longer than `_pageLength`.
     */
    function _getActivePage(
        ScheduledTasksDataStorage storage _store,
        uint256 _pageIndex,
        uint256 _pageLength
    ) private view returns (ScheduledTask[] memory result_) {
        uint256 total = ScheduledTasksLib.getScheduledTaskCount(_store);
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(_pageIndex, _pageLength);
        result_ = new ScheduledTask[](Pagination.getSize(start, end, total));
        uint256 collected;

        if (end > total) end = total;

        for (; start < end; ) {
            ScheduledTask memory task = ScheduledTasksLib.getScheduledTasksByIndex(_store, start);
            unchecked {
                ++start;
            }

            if (CorporateActionsStorageWrapper.isCorporateActionDisabled(abi.decode(task.data, (bytes32)))) continue;

            result_[collected] = task;
            unchecked {
                ++collected;
            }
        }

        if (collected < _pageLength) {
            // solhint-disable-next-line no-inline-assembly
            assembly {
                mstore(result_, collected)
            }
        }
    }
}
