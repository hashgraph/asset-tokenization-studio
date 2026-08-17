// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { ScheduledTask } from "../scheduledTasksCommon/IScheduledTasksCommon.sol";
import { ScheduledTasksDataStorage } from "../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { SCHEDULED_TASK_POP_EMPTY } from "../../constants/values.sol";
import { SCHEDULED_TASK_TYPE_BALANCE_ADJUSTMENT } from "../../constants/dispatchTypes.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

/// @title ScheduledTasksLib
/// @author Asset Tokenization Studio Team
/// @notice Storage helper library maintaining a timestamp-ordered queue of scheduled tasks.
/// @dev Operates against any `ScheduledTasksDataStorage` namespace; the queue invariant is
///      that entries are sorted by `scheduledTimestamp` ascending, so the oldest due task
///      sits at index 0 and the newest tail entry lives at `scheduledTaskCount - 1`.
library ScheduledTasksLib {
    /// @notice Inserts a new task into the queue preserving the ascending-timestamp order.
    /// @dev Walks the queue from tail to head, sliding entries with a strictly older
    ///      timestamp one slot forward until the correct insertion point is found, then
    ///      writes the new task. When the queue is empty or every existing entry is newer,
    ///      the task is inserted at position 0.
    /// @param _scheduledTasks         The storage struct owning the queue.
    /// @param _newScheduledTimestamp  The execution timestamp of the new task.
    /// @param _newData                The opaque payload associated with the task.
    function addScheduledTask(
        ScheduledTasksDataStorage storage _scheduledTasks,
        uint256 _newScheduledTimestamp,
        bytes memory _newData
    ) internal {
        ScheduledTask memory newScheduledTask = ScheduledTask(_newScheduledTimestamp, _newData);

        uint256 length = getScheduledTaskCount(_scheduledTasks);

        uint256 newScheduledTaskId = length;

        bool added = false;

        if (length > 0) {
            for (uint256 index; index < length; ) {
                uint256 scheduledTaskPosition = length - 1 - index;

                if (_scheduledTasks.scheduledTasks[scheduledTaskPosition].scheduledTimestamp < _newScheduledTimestamp) {
                    _slideScheduledTasks(_scheduledTasks, scheduledTaskPosition);
                    unchecked {
                        ++index;
                    }
                } else {
                    newScheduledTaskId = scheduledTaskPosition + 1;
                    _insertScheduledTask(_scheduledTasks, newScheduledTaskId, newScheduledTask);
                    added = true;
                    break;
                }
            }
        }
        if (!added) {
            _insertScheduledTask(_scheduledTasks, 0, newScheduledTask);
        }
    }

    /**
     * @notice Inserts a new task into the shared cross-ordered queue, breaking same-timestamp
     *         ties by task-type priority instead of insertion order.
     * @dev Identical walk-and-insert logic to `addScheduledTask`, except that when the new
     *      task's timestamp exactly matches an existing entry's timestamp, the tie is broken by
     *      comparing `_crossOrderedTaskPriority` of both task types (decoded from `data`, which
     *      for this queue is always `abi.encode(taskType)` — see
     *      `ScheduledTasksStorageWrapper::addScheduledCrossOrderedTask`) instead of always
     *      placing the new entry so it executes before the existing one (FIND-015: this used to
     *      let a same-timestamp balance adjustment execute before a governance snapshot).
     * @param _scheduledTasks Cross-ordered queue storage.
     * @param _newScheduledTimestamp Timestamp at which the new task may be triggered.
     * @param _newTaskType Task type being scheduled; only ever a `SCHEDULED_TASK_TYPE_*` constant.
     */
    function addScheduledCrossOrderedTaskWithPriority(
        ScheduledTasksDataStorage storage _scheduledTasks,
        uint256 _newScheduledTimestamp,
        bytes32 _newTaskType
    ) internal {
        uint256 newPriority = _crossOrderedTaskPriority(_newTaskType);

        for (uint256 pos = getScheduledTaskCount(_scheduledTasks); pos > 0; ) {
            unchecked {
                --pos;
            }

            ScheduledTask storage existingTask = _scheduledTasks.scheduledTasks[pos];
            uint256 existingTimestamp = existingTask.scheduledTimestamp;

            if (
                existingTimestamp > _newScheduledTimestamp ||
                (existingTimestamp == _newScheduledTimestamp &&
                    _crossOrderedTaskPriority(abi.decode(existingTask.data, (bytes32))) >= newPriority)
            ) {
                _insertScheduledTask(
                    _scheduledTasks,
                    pos + 1,
                    ScheduledTask(_newScheduledTimestamp, abi.encode(_newTaskType))
                );
                return;
            }

            _slideScheduledTasks(_scheduledTasks, pos);
        }

        _insertScheduledTask(_scheduledTasks, 0, ScheduledTask(_newScheduledTimestamp, abi.encode(_newTaskType)));
    }

    function popScheduledTask(ScheduledTasksDataStorage storage _scheduledTasks) internal {
        uint256 scheduledTasksLength = getScheduledTaskCount(_scheduledTasks);
        _checkUnexpectedError(scheduledTasksLength == 0, SCHEDULED_TASK_POP_EMPTY);
        delete (_scheduledTasks.scheduledTasks[scheduledTasksLength - 1]);
        unchecked {
            --_scheduledTasks.scheduledTaskCount;
        }
    }

    /// @notice Returns the number of tasks currently queued.
    /// @param _scheduledTasks The storage struct backing the queue.
    /// @return The count of scheduled tasks.
    function getScheduledTaskCount(ScheduledTasksDataStorage storage _scheduledTasks) internal view returns (uint256) {
        return _scheduledTasks.scheduledTaskCount;
    }

    /// @notice Reads a single task by its zero-based queue position.
    /// @dev Performs no bounds check; callers must compare against `getScheduledTaskCount`
    ///      to avoid reading uninitialised storage.
    /// @param _scheduledTasks The storage struct backing the queue.
    /// @param _index          The position of the task to read.
    /// @return task_ The task stored at `_index`.
    function getScheduledTasksByIndex(
        ScheduledTasksDataStorage storage _scheduledTasks,
        uint256 _index
    ) internal view returns (ScheduledTask memory task_) {
        return _scheduledTasks.scheduledTasks[_index];
    }

    /// @notice Returns a paginated slice of the queue starting at `_pageIndex * _pageLength`.
    /// @dev Uses `Pagination.getStartAndEnd` / `getSize` to clamp the requested window to
    ///      the current queue length, so an out-of-range page yields an empty array rather
    ///      than reverting.
    /// @param _scheduledTasks The storage struct backing the queue.
    /// @param _pageIndex      Zero-based page index.
    /// @param _pageLength     Number of tasks per page.
    /// @return scheduledTask_ The slice of tasks for the requested page.
    function getScheduledTasks(
        ScheduledTasksDataStorage storage _scheduledTasks,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory scheduledTask_) {
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(_pageIndex, _pageLength);

        scheduledTask_ = new ScheduledTask[](Pagination.getSize(start, end, getScheduledTaskCount(_scheduledTasks)));

        uint256 length = scheduledTask_.length;
        for (uint256 i; i < length; ) {
            scheduledTask_[i] = getScheduledTasksByIndex(_scheduledTasks, start + i);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Copies the task at `_pos` one slot forward to make room for an insertion.
    /// @dev Internal helper for `addScheduledTask`; assumes slot `_pos + 1` is either empty
    ///      or already due to be overwritten by the surrounding insertion routine.
    /// @param _scheduledTasks The storage struct backing the queue.
    /// @param _pos            Source slot whose contents are mirrored into `_pos + 1`.
    function _slideScheduledTasks(ScheduledTasksDataStorage storage _scheduledTasks, uint256 _pos) private {
        _scheduledTasks.scheduledTasks[_pos + 1].scheduledTimestamp = _scheduledTasks
            .scheduledTasks[_pos]
            .scheduledTimestamp;
        _scheduledTasks.scheduledTasks[_pos + 1].data = _scheduledTasks.scheduledTasks[_pos].data;
    }

    /// @notice Writes `scheduledTaskToInsert` into slot `_pos` and increments the count.
    /// @dev Internal helper for `addScheduledTask`; pairs with `_slideScheduledTasks` to
    ///      preserve the ascending-timestamp invariant.
    /// @param _scheduledTasks         The storage struct backing the queue.
    /// @param _pos                    Slot to populate with the new task.
    /// @param scheduledTaskToInsert   The task payload to persist.
    function _insertScheduledTask(
        ScheduledTasksDataStorage storage _scheduledTasks,
        uint256 _pos,
        ScheduledTask memory scheduledTaskToInsert
    ) private {
        _scheduledTasks.scheduledTasks[_pos].scheduledTimestamp = scheduledTaskToInsert.scheduledTimestamp;
        _scheduledTasks.scheduledTasks[_pos].data = scheduledTaskToInsert.data;
        unchecked {
            ++_scheduledTasks.scheduledTaskCount;
        }
    }

    /**
     * @notice Priority used to break same-timestamp ties in the cross-ordered queue: lower
     *         executes first. Balance adjustments must never execute before a same-timestamp
     *         governance snapshot or coupon listing, since the latter would otherwise capture
     *         post-adjustment balances instead of the balances at the intended record date.
     * @param _taskType Task type to look up.
     * @return priority_ Ordering priority; strictly lower values execute first on a tie.
     */
    function _crossOrderedTaskPriority(bytes32 _taskType) private pure returns (uint256 priority_) {
        priority_ = _taskType == SCHEDULED_TASK_TYPE_BALANCE_ADJUSTMENT ? 1 : 0;
    }
}
