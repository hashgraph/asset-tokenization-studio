# ScheduledBalanceAdjustment

_Asset Tokenization Studio Team_

> ScheduledBalanceAdjustment

Abstract implementation of `IScheduledBalanceAdjustment` providing scheduled balance adjustment corporate actions for tokenised assets.

_Inherits access-control guards from `Modifiers`. Scheduled adjustments are managed through `ScheduledBalanceAdjustmentBase` and `ScheduledTasksStorageWrapper`. Intended to be inherited by `ScheduledBalanceAdjustmentFacet`._

## Methods

### cancelScheduledBalanceAdjustment

```solidity
function cancelScheduledBalanceAdjustment(uint256 _balanceAdjustmentId) external nonpayable returns (bool success_)
```

Cancels a previously scheduled balance adjustment.

_Caller must hold `ROLE_CORPORATE_ACTION`. The token must not be paused. Emits `ScheduledBalanceAdjustmentCancelled` on success._

#### Parameters

| Name                  | Type    | Description |
| --------------------- | ------- | ----------- |
| \_balanceAdjustmentId | uint256 | undefined   |

#### Returns

| Name      | Type | Description                         |
| --------- | ---- | ----------------------------------- |
| success\_ | bool | True if the cancellation succeeded. |

### forceCancelScheduledBalanceAdjustment

```solidity
function forceCancelScheduledBalanceAdjustment(uint256 _balanceAdjustmentId) external nonpayable returns (bool success_)
```

Force-cancels a balance adjustment regardless of its execution date.

_Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL`; gated by `onlyUnpaused` and `onlyMatchingActionType(CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT, _balanceAdjustmentId - 1)`._

#### Parameters

| Name                  | Type    | Description |
| --------------------- | ------- | ----------- |
| \_balanceAdjustmentId | uint256 | undefined   |

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

### AccountHasNoRole

```solidity
error AccountHasNoRole(address account, bytes32 role)
```

Thrown when an account does not hold a required role.

#### Parameters

| Name    | Type    | Description                      |
| ------- | ------- | -------------------------------- |
| account | address | The account that lacks the role. |
| role    | bytes32 | The role that is not held.       |

### AssetNotOperational

```solidity
error AssetNotOperational(bytes32 configId, uint256 versionId)
```

Raised by `InitializerStorageWrapper.checkOperational` (and the related `isConfigVersionOperational` helper) when an operation is attempted on a configuration version that has not yet been marked operational.

#### Parameters

| Name      | Type    | Description                                                        |
| --------- | ------- | ------------------------------------------------------------------ |
| configId  | bytes32 | Resolver-proxy configuration whose operational status was checked. |
| versionId | uint256 | Configuration version whose operational status was checked.        |

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

### Deactivated

```solidity
error Deactivated()
```

Thrown when an operation guarded by `onlyActivated` is attempted on a token whose deactivation flag has already been set.

### DecimalsOverflow

```solidity
error DecimalsOverflow()
```

Reverts when the cumulative decimals shift would overflow `uint8`.

### FacetAlreadyRegistered

```solidity
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion)
```

Raised when an initialiser tries to register a facet that already has a non-zero last registered version (i.e. the facet is being re-initialised on a fresh install).

#### Parameters

| Name        | Type    | Description                                                    |
| ----------- | ------- | -------------------------------------------------------------- |
| facetId     | bytes32 | Identifier of the offending facet.                             |
| lastVersion | uint256 | Last version recorded for that facet at the time of the check. |

### FactorIsZero

```solidity
error FactorIsZero()
```

Reverts when `factor` is zero, which would zero-out all holder balances.

### FactorOverflow

```solidity
error FactorOverflow()
```

Reverts when the proposed factor would overflow the cumulative ABAF.

### InvalidTimestamp

```solidity
error InvalidTimestamp()
```

Reverts when a timestamp value is invalid.

_Used for shared timestamp validation that is not tied to expiration._

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### TotalSupplyOverflow

```solidity
error TotalSupplyOverflow()
```

Reverts when the proposed factor would overflow the projected total supply.

### UnexpectedError

```solidity
error UnexpectedError(bytes4 _errorId)
```

Reverts when an unreachable validation state is detected.

_Replaces assertions for defensive handling of logically impossible states._

#### Parameters

| Name      | Type   | Description                                        |
| --------- | ------ | -------------------------------------------------- |
| \_errorId | bytes4 | Identifier of the unexpected validation condition. |

### UnrecognizedResolverProxyVersion

```solidity
error UnrecognizedResolverProxyVersion(bytes8 _resolverProxyVersion)
```

Thrown when the provided proxy version does not match any BLR compatible standard.

#### Parameters

| Name                   | Type   | Description                                        |
| ---------------------- | ------ | -------------------------------------------------- |
| \_resolverProxyVersion | bytes8 | proxy version that is not compatible with the BLR. |

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.

### WrongIndexForAction

```solidity
error WrongIndexForAction(uint256 index, bytes32 actionType)
```

Thrown when a type-scoped index does not correspond to an existing action.

#### Parameters

| Name       | Type    | Description                                            |
| ---------- | ------- | ------------------------------------------------------ |
| index      | uint256 | The out-of-range index that was provided.              |
| actionType | bytes32 | The action type against which the index was validated. |

### ZeroValueNotAllowed

```solidity
error ZeroValueNotAllowed()
```

Reverts when zero is supplied where a positive value is required.

_Used for shared validation of amounts, limits, factors, or identifiers._
