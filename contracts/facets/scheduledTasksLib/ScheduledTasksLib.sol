// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { ScheduledTask } from "../scheduledTasksCommon/IScheduledTasksCommon.sol";
import { ScheduledTasksDataStorage } from "../../domain/asset/ScheduledTasksStorageWrapper.sol";

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

    /// @notice Removes the tail entry from the queue.
    /// @dev No-op when the queue is empty; otherwise clears the last slot and decrements
    ///      `scheduledTaskCount`. Callers must pop in order (typically after executing
    ///      the head entry and rotating it to the tail upstream).
    /// @param _scheduledTasks The storage struct whose tail entry is discarded.
    function popScheduledTask(ScheduledTasksDataStorage storage _scheduledTasks) internal {
        uint256 scheduledTasksLength = getScheduledTaskCount(_scheduledTasks);
        if (scheduledTasksLength == 0) {
            return;
        }
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
}
