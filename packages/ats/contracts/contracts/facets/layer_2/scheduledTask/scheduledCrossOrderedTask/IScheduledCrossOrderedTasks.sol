// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledTask } from "../scheduledTasksCommon/IScheduledTasksCommon.sol";

/// @custom:hash resolverKey ScheduledTasks
bytes32 constant RESOLVER_KEY_SCHEDULED_TASKS = 0x53ea769a267213f8e35c975a0dba3d7d8d73163d53f804c2ac6ea37d6c47c082;

/// @custom:hash resolverKey ScheduledCrossOrderedTasksKpiLinkedRate
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_SCHEDULED_CROSS_ORDERED_TASKS_KPI_LINKED_RATE = 0x93bfe3f155b9757d312214a75d3bcd8c8c84967e4a8cbaafdbdc40ea1ce2fd4c;

/**
 * @title Scheduled Cross-Ordered Tasks Interface
 * @notice Defines the external API for querying and triggering cross-ordered scheduled tasks.
 * @dev Cross-ordered tasks coordinate execution ordering across scheduled task queues. Trigger
 *      functions may mutate queue state and execute due downstream tasks through the implementation.
 * @author Asset Tokenization Studio Team
 */
interface IScheduledCrossOrderedTasks {
    /**
     * @notice Emitted when execution of a scheduled task fails.
     * @param actionId Corporate action identifier or task type associated with the failed task.
     * @param taskType Scheduled task category or dispatch type that failed.
     * @param scheduledTimestamp Timestamp at which the failed task was scheduled to become due.
     */
    event TaskExecutionFailed(bytes32 indexed actionId, bytes32 indexed taskType, uint256 scheduledTimestamp);

    /**
     * @notice Emitted once when the scheduled-cross-ordered-tasks capability is initialised on a token.
     * @dev Fires exclusively from `initializeScheduledCrossOrderedTasks`.
     */
    event ScheduledCrossOrderedTasksInitialized();

    /**
     * @notice Initialises the scheduled-cross-ordered-tasks capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeScheduledCrossOrderedTasks() external;

    /**
     * @notice Triggers all currently due cross-ordered scheduled tasks.
     * @dev Mutates scheduled task queues and may trigger one due downstream task per
     *      cross-ordered task. A failing task reverts the entire call.
     * @return Number of cross-ordered tasks processed from the queue.
     */
    function triggerPendingScheduledCrossOrderedTasks() external returns (uint256);

    /**
     * @notice Triggers due cross-ordered scheduled tasks up to a requested maximum.
     * @dev Mutates scheduled task queues and may trigger one due downstream task per
     *      cross-ordered task. Passing zero may be treated by implementations as no explicit limit.
     * @param _max Maximum number of due cross-ordered tasks to process.
     * @return Number of cross-ordered tasks processed from the queue.
     */
    function triggerScheduledCrossOrderedTasks(uint256 _max) external returns (uint256);

    /**
     * @notice Returns the number of queued cross-ordered scheduled tasks.
     * @dev Reads only the cross-ordered task queue and does not filter by due timestamp.
     * @return Number of scheduled cross-ordered tasks currently queued.
     */
    function scheduledCrossOrderedTaskCount() external view returns (uint256);

    /**
     * @notice Returns a paginated list of queued cross-ordered scheduled tasks.
     * @dev Pagination bounds and ordering are defined by the implementation's scheduled task store.
     * @param _pageIndex Zero-based page index to query.
     * @param _pageLength Maximum number of scheduled tasks to return.
     * @return scheduledTask_ Cross-ordered scheduled tasks contained in the requested page.
     */
    function getScheduledCrossOrderedTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (ScheduledTask[] memory scheduledTask_);
}
