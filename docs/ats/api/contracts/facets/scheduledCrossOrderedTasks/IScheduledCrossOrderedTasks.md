# IScheduledCrossOrderedTasks

_Asset Tokenization Studio Team_

> Scheduled Cross-Ordered Tasks Interface

Defines the external API for querying and triggering cross-ordered scheduled tasks.

_Cross-ordered tasks coordinate execution ordering across scheduled task queues. Trigger functions may mutate queue state and execute due downstream tasks through the implementation._

## Methods

### getScheduledCrossOrderedTasks

```solidity
function getScheduledCrossOrderedTasks(uint256 _pageIndex, uint256 _pageLength) external view returns (struct ScheduledTask[] scheduledTask_)
```

Returns a paginated list of queued cross-ordered scheduled tasks.

_Pagination bounds and ordering are defined by the implementation&#39;s scheduled task store._

#### Parameters

| Name         | Type    | Description                                  |
| ------------ | ------- | -------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based page index to query.              |
| \_pageLength | uint256 | Maximum number of scheduled tasks to return. |

#### Returns

| Name            | Type            | Description                                                    |
| --------------- | --------------- | -------------------------------------------------------------- |
| scheduledTask\_ | ScheduledTask[] | Cross-ordered scheduled tasks contained in the requested page. |

### initializeScheduledCrossOrderedTasks

```solidity
function initializeScheduledCrossOrderedTasks() external nonpayable
```

Initialises the scheduled-cross-ordered-tasks capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### scheduledCrossOrderedTaskCount

```solidity
function scheduledCrossOrderedTaskCount() external view returns (uint256)
```

Returns the number of queued cross-ordered scheduled tasks.

_Reads only the cross-ordered task queue and does not filter by due timestamp._

#### Returns

| Name | Type    | Description                                               |
| ---- | ------- | --------------------------------------------------------- |
| \_0  | uint256 | Number of scheduled cross-ordered tasks currently queued. |

### triggerPendingScheduledCrossOrderedTasks

```solidity
function triggerPendingScheduledCrossOrderedTasks() external nonpayable returns (uint256)
```

Triggers all currently due cross-ordered scheduled tasks.

_Mutates scheduled task queues and may trigger one due downstream task per cross-ordered task. A failing task reverts the entire call._

#### Returns

| Name | Type    | Description                                             |
| ---- | ------- | ------------------------------------------------------- |
| \_0  | uint256 | Number of cross-ordered tasks processed from the queue. |

### triggerScheduledCrossOrderedTasks

```solidity
function triggerScheduledCrossOrderedTasks(uint256 _max) external nonpayable returns (uint256)
```

Triggers due cross-ordered scheduled tasks up to a requested maximum.

_Mutates scheduled task queues and may trigger one due downstream task per cross-ordered task. Passing zero may be treated by implementations as no explicit limit._

#### Parameters

| Name  | Type    | Description                                           |
| ----- | ------- | ----------------------------------------------------- |
| \_max | uint256 | Maximum number of due cross-ordered tasks to process. |

#### Returns

| Name | Type    | Description                                             |
| ---- | ------- | ------------------------------------------------------- |
| \_0  | uint256 | Number of cross-ordered tasks processed from the queue. |

## Events

### ScheduledCrossOrderedTasksInitialized

```solidity
event ScheduledCrossOrderedTasksInitialized()
```

Emitted once when the scheduled-cross-ordered-tasks capability is initialised on a token.

_Fires exclusively from `initializeScheduledCrossOrderedTasks`._

### TaskExecutionFailed

```solidity
event TaskExecutionFailed(bytes32 indexed actionId, bytes32 indexed taskType, uint256 scheduledTimestamp)
```

Emitted when execution of a scheduled task fails.

#### Parameters

| Name               | Type    | Description                                                               |
| ------------------ | ------- | ------------------------------------------------------------------------- |
| actionId `indexed` | bytes32 | Corporate action identifier or task type associated with the failed task. |
| taskType `indexed` | bytes32 | Scheduled task category or dispatch type that failed.                     |
| scheduledTimestamp | uint256 | Timestamp at which the failed task was scheduled to become due.           |
