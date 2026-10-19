# IScheduledBalanceAdjustment

_Asset Tokenization Studio Team_

> IScheduledBalanceAdjustment

Interface for scheduled balance adjustment corporate actions on tokenised assets.

_Scheduled balance adjustments enqueue operations to multiply every token holder&#39;s balance by `factor / 10^decimals` at a future date. Tasks are managed through `ScheduledTasksStorageWrapper` and corporate-action records through `BalanceAdjustmentOps`._

## Methods

### cancelScheduledBalanceAdjustment

```solidity
function cancelScheduledBalanceAdjustment(uint256 _balanceAdjustmentID) external nonpayable returns (bool success_)
```

Cancels a previously scheduled balance adjustment.

_Caller must hold `ROLE_CORPORATE_ACTION`. The token must not be paused. Emits `ScheduledBalanceAdjustmentCancelled` on success._

#### Parameters

| Name                  | Type    | Description                                       |
| --------------------- | ------- | ------------------------------------------------- |
| \_balanceAdjustmentID | uint256 | Identifier of the scheduled adjustment to cancel. |

#### Returns

| Name      | Type | Description                         |
| --------- | ---- | ----------------------------------- |
| success\_ | bool | True if the cancellation succeeded. |

### forceCancelScheduledBalanceAdjustment

```solidity
function forceCancelScheduledBalanceAdjustment(uint256 _balanceAdjustmentID) external nonpayable returns (bool success_)
```

Force-cancels a balance adjustment regardless of its execution date.

_Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL` and gated by the unpaused state and `notZeroValue`. Marks the corporate action disabled unconditionally — bypasses `BalanceAdjustmentAlreadyExecuted` — and emits `ScheduledBalanceAdjustmentForceCancelled`._

#### Parameters

| Name                  | Type    | Description                                             |
| --------------------- | ------- | ------------------------------------------------------- |
| \_balanceAdjustmentID | uint256 | Identifier of the scheduled adjustment to force-cancel. |

#### Returns

| Name      | Type | Description                               |
| --------- | ---- | ----------------------------------------- |
| success\_ | bool | True if the force-cancellation succeeded. |

### getBalanceAdjustmentCount

```solidity
function getBalanceAdjustmentCount() external view returns (uint256 balanceAdjustmentCount_)
```

Returns the total number of balance adjustments ever scheduled, including cancelled ones.

#### Returns

| Name                     | Type    | Description                                                 |
| ------------------------ | ------- | ----------------------------------------------------------- |
| balanceAdjustmentCount\_ | uint256 | Total count of corporate-action balance adjustment records. |

### getPendingBalanceAdjustmentCount

```solidity
function getPendingBalanceAdjustmentCount(bool _includeDisabled) external view returns (uint256)
```

Returns the number of pending scheduled balance adjustments in the task queue.

_Reads directly from `ScheduledTasksStorageWrapper`; excludes already-executed tasks._

#### Parameters

| Name              | Type | Description                                                                                                       |
| ----------------- | ---- | ----------------------------------------------------------------------------------------------------------------- |
| \_includeDisabled | bool | When true, tasks belonging to cancelled corporate actions are counted; when false, only active tasks are counted. |

#### Returns

| Name | Type    | Description                                |
| ---- | ------- | ------------------------------------------ |
| \_0  | uint256 | Count of pending balance adjustment tasks. |

### getScheduledBalanceAdjustment

```solidity
function getScheduledBalanceAdjustment(uint256 _balanceAdjustmentID) external view returns (struct IScheduledBalanceAdjustment.ScheduledBalanceAdjustment balanceAdjustment_, bool isDisabled_)
```

Returns the parameters and disabled state of a previously scheduled balance adjustment.

_Reverts if the corporate action type stored at index `_balanceAdjustmentID - 1` does not match `CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT`._

#### Parameters

| Name                  | Type    | Description                                      |
| --------------------- | ------- | ------------------------------------------------ |
| \_balanceAdjustmentID | uint256 | Identifier of the scheduled adjustment to query. |

#### Returns

| Name                | Type                                                   | Description                                                    |
| ------------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| balanceAdjustment\_ | IScheduledBalanceAdjustment.ScheduledBalanceAdjustment | Struct containing executionDate, factor, and decimals.         |
| isDisabled\_        | bool                                                   | True if the adjustment has been cancelled or already executed. |

### getScheduledBalanceAdjustments

```solidity
function getScheduledBalanceAdjustments(uint256 _pageIndex, uint256 _pageLength, bool _includeDisabled) external view returns (struct ScheduledTask[] scheduledBalanceAdjustment_)
```

Returns a paginated slice of pending scheduled balance adjustment tasks.

_Reads from `ScheduledTasksStorageWrapper`. Tasks are ordered by insertion index._

#### Parameters

| Name              | Type    | Description                                                                                                         |
| ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| \_pageIndex       | uint256 | Zero-based page number.                                                                                             |
| \_pageLength      | uint256 | Maximum number of tasks to return per page.                                                                         |
| \_includeDisabled | bool    | When true, tasks belonging to cancelled corporate actions are included; when false, only active tasks are returned. |

#### Returns

| Name                         | Type            | Description                                              |
| ---------------------------- | --------------- | -------------------------------------------------------- |
| scheduledBalanceAdjustment\_ | ScheduledTask[] | Array of `ScheduledTask` structs for the requested page. |

### initializeScheduledBalanceAdjustment

```solidity
function initializeScheduledBalanceAdjustment() external nonpayable
```

Initialises the scheduled balance adjustment capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### setScheduledBalanceAdjustment

```solidity
function setScheduledBalanceAdjustment(IScheduledBalanceAdjustment.ScheduledBalanceAdjustment _newBalanceAdjustment) external nonpayable returns (uint256 balanceAdjustmentID_)
```

#### Parameters

| Name                   | Type                                                   | Description |
| ---------------------- | ------------------------------------------------------ | ----------- |
| \_newBalanceAdjustment | IScheduledBalanceAdjustment.ScheduledBalanceAdjustment | undefined   |

#### Returns

| Name                  | Type    | Description |
| --------------------- | ------- | ----------- |
| balanceAdjustmentID\_ | uint256 | undefined   |

## Events

### ScheduledBalanceAdjustmentCancelled

```solidity
event ScheduledBalanceAdjustmentCancelled(uint256 balanceAdjustmentId, address indexed operator)
```

Emitted when a previously scheduled balance adjustment is cancelled.

#### Parameters

| Name                | Type    | Description                                        |
| ------------------- | ------- | -------------------------------------------------- |
| balanceAdjustmentId | uint256 | Sequential identifier of the cancelled adjustment. |
| operator `indexed`  | address | Address that performed the cancellation.           |

### ScheduledBalanceAdjustmentForceCancelled

```solidity
event ScheduledBalanceAdjustmentForceCancelled(uint256 balanceAdjustmentId, address indexed operator)
```

Emitted when an admin force-cancels a balance adjustment, bypassing date guards.

#### Parameters

| Name                | Type    | Description                                              |
| ------------------- | ------- | -------------------------------------------------------- |
| balanceAdjustmentId | uint256 | Sequential identifier of the force-cancelled adjustment. |
| operator `indexed`  | address | Address that performed the force-cancellation.           |

### ScheduledBalanceAdjustmentInitialized

```solidity
event ScheduledBalanceAdjustmentInitialized()
```

Emitted once when the scheduled balance adjustment capability is initialised on a token.

_Fires exclusively from `initializeScheduledBalanceAdjustment`._

### ScheduledBalanceAdjustmentSet

```solidity
event ScheduledBalanceAdjustmentSet(bytes32 corporateActionId, uint256 balanceAdjustmentId, address indexed operator, uint256 indexed executionDate, uint256 factor, uint256 decimals)
```

Emitted when a balance adjustment is successfully scheduled.

#### Parameters

| Name                    | Type    | Description                                                    |
| ----------------------- | ------- | -------------------------------------------------------------- |
| corporateActionId       | bytes32 | On-chain identifier of the associated corporate action record. |
| balanceAdjustmentId     | uint256 | Sequential identifier of the scheduled adjustment.             |
| operator `indexed`      | address | Address that scheduled the adjustment.                         |
| executionDate `indexed` | uint256 | Unix timestamp at which the adjustment will be executed.       |
| factor                  | uint256 | Numerator of the adjustment ratio.                             |
| decimals                | uint256 | Denominator exponent; effective ratio = factor / 10^decimals.  |

## Errors

### BalanceAdjustmentAlreadyExecuted

```solidity
error BalanceAdjustmentAlreadyExecuted(bytes32 corporateActionId, uint256 balanceAdjustmentId)
```

Reverts when attempting to cancel or re-execute an adjustment that has already run.

#### Parameters

| Name                | Type    | Description                                                     |
| ------------------- | ------- | --------------------------------------------------------------- |
| corporateActionId   | bytes32 | Identifier of the corporate action that was already executed.   |
| balanceAdjustmentId | uint256 | Identifier of the balance adjustment that was already executed. |

### BalanceAdjustmentCreationFailed

```solidity
error BalanceAdjustmentCreationFailed()
```

Reverts when the underlying storage layer fails to create a corporate action record.
