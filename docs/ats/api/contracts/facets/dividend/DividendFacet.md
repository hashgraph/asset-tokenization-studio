# DividendFacet

_Asset Tokenization Studio Team_

> DividendFacet

Diamond facet exposing the dividend writer surface (`setDividend`, `cancelDividend`) alongside the per-record reads (`getDividend`, `getDividendFor`, `getDividendAmountFor`, `getDividendsCount`) under `RESOLVER_KEY_DIVIDEND`.

_Inherits the implementation from `Dividend` and satisfies `IStaticFunctionSelectors` so the Diamond resolver can register the six selectors. Carries no initialiser — dividend state is owned by `DividendStorageWrapper` and bootstrapped through the corporate-action writer path. The read-only sibling facet `DividendSecurityHoldersFacet` registers under its own resolver key and operates on the same underlying storage._

## Methods

### cancelDividend

```solidity
function cancelDividend(uint256 dividendId) external nonpayable returns (bool success_)
```

Cancels a previously scheduled dividend before its execution date is reached.

_Restricted to `ROLE_CORPORATE_ACTION`; gated by `onlyUnpaused` and `onlyMatchingActionType(CORPORATE_ACTION_TYPE_DIVIDEND, dividendId - 1)`._

#### Parameters

| Name       | Type    | Description |
| ---------- | ------- | ----------- |
| dividendId | uint256 | undefined   |

#### Returns

| Name      | Type | Description                            |
| --------- | ---- | -------------------------------------- |
| success\_ | bool | True if the cancellation was recorded. |

### forceCancelDividend

```solidity
function forceCancelDividend(uint256 dividendId) external nonpayable returns (bool success_)
```

Force-cancels a dividend regardless of its execution date.

_Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL`; gated by `onlyUnpaused` and `onlyMatchingActionType(CORPORATE_ACTION_TYPE_DIVIDEND, dividendId - 1)`._

#### Parameters

| Name       | Type    | Description |
| ---------- | ------- | ----------- |
| dividendId | uint256 | undefined   |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | True if the force-cancellation was recorded. |

### getDividend

```solidity
function getDividend(uint256 dividendId) external view returns (struct IDividendTypes.RegisteredDividend registeredDividend_, bool isDisabled_)
```

Returns the persisted dividend record together with its cancelled flag.

_Reverts via `onlyMatchingActionType` if `dividendId` does not match the dividend corporate-action type at index `dividendId - 1`._

#### Parameters

| Name       | Type    | Description |
| ---------- | ------- | ----------- |
| dividendId | uint256 | undefined   |

#### Returns

| Name                 | Type                              | Description                                            |
| -------------------- | --------------------------------- | ------------------------------------------------------ |
| registeredDividend\_ | IDividendTypes.RegisteredDividend | Stored dividend parameters bound to their snapshot id. |
| isDisabled\_         | bool                              | True if the dividend has been cancelled.               |

### getDividendAmountFor

```solidity
function getDividendAmountFor(uint256 dividendId, address account) external view returns (struct IDividendTypes.DividendAmountFor dividendAmountFor_)
```

Returns the fractional dividend amount payable to a specific holder.

_Reverts via `onlyMatchingActionType` if `dividendId` does not match the dividend corporate-action type at index `dividendId - 1`._

#### Parameters

| Name       | Type    | Description |
| ---------- | ------- | ----------- |
| dividendId | uint256 | undefined   |
| account    | address | undefined   |

#### Returns

| Name                | Type                             | Description                               |
| ------------------- | -------------------------------- | ----------------------------------------- |
| dividendAmountFor\_ | IDividendTypes.DividendAmountFor | Fractional payable amount for the holder. |

### getDividendFor

```solidity
function getDividendFor(uint256 dividendId, address account) external view returns (struct IDividendTypes.DividendFor dividendFor_)
```

Returns the per-account view of a dividend, including the holder&#39;s balance at the record date and the metadata required to compute the payable amount.

_Reverts via `onlyMatchingActionType` if `dividendId` does not match the dividend corporate-action type at index `dividendId - 1`._

#### Parameters

| Name       | Type    | Description |
| ---------- | ------- | ----------- |
| dividendId | uint256 | undefined   |
| account    | address | undefined   |

#### Returns

| Name          | Type                       | Description                  |
| ------------- | -------------------------- | ---------------------------- |
| dividendFor\_ | IDividendTypes.DividendFor | Holder-scoped dividend view. |

### getDividendsCount

```solidity
function getDividendsCount() external view returns (uint256 dividendCount_)
```

Returns the total number of dividends scheduled under the dividend corporate-action type — cancelled dividends remain in the count.

#### Returns

| Name            | Type    | Description             |
| --------------- | ------- | ----------------------- |
| dividendCount\_ | uint256 | Current dividend count. |

### getStaticFunctionSelectors

```solidity
function getStaticFunctionSelectors() external pure returns (bytes4[])
```

Gets all function selectors of a facet

#### Returns

| Name | Type     | Description              |
| ---- | -------- | ------------------------ |
| \_0  | bytes4[] | Face functions selectors |

### getStaticInterfaceIds

```solidity
function getStaticInterfaceIds() external pure returns (bytes4[])
```

Gets all interfaces ids of a facet.

#### Returns

| Name | Type     | Description        |
| ---- | -------- | ------------------ |
| \_0  | bytes4[] | Face interface ids |

### getStaticResolverKey

```solidity
function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_)
```

Gets the static resolver key

#### Returns

| Name                | Type    | Description         |
| ------------------- | ------- | ------------------- |
| staticResolverKey\_ | bytes32 | Static resolver key |

### initializeDividend

```solidity
function initializeDividend() external nonpayable
```

Initialises the dividend capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### setDividend

```solidity
function setDividend(IDividendTypes.Dividend newDividend) external nonpayable returns (uint256 dividendId_)
```

#### Parameters

| Name        | Type                    | Description |
| ----------- | ----------------------- | ----------- |
| newDividend | IDividendTypes.Dividend | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| dividendId\_ | uint256 | undefined   |

## Events

### DividendCancelled

```solidity
event DividendCancelled(uint256 dividendId, address indexed operator)
```

Emitted when an operator cancels a previously scheduled dividend.

_Cancellation is rejected once the execution date has passed; see `DividendAlreadyExecuted`._

#### Parameters

| Name               | Type    | Description                                       |
| ------------------ | ------- | ------------------------------------------------- |
| dividendId         | uint256 | One-indexed identifier of the cancelled dividend. |
| operator `indexed` | address | Address that performed the cancellation.          |

### DividendForceCancelled

```solidity
event DividendForceCancelled(uint256 dividendId, address indexed operator)
```

Emitted when an admin force-cancels a dividend, bypassing date guards.

#### Parameters

| Name               | Type    | Description                                             |
| ------------------ | ------- | ------------------------------------------------------- |
| dividendId         | uint256 | One-indexed identifier of the force-cancelled dividend. |
| operator `indexed` | address | Address that performed the force-cancellation.          |

### DividendInitialized

```solidity
event DividendInitialized()
```

Emitted once when the dividend capability is initialised on a token.

_Fires exclusively from `initializeDividend`._

### DividendSet

```solidity
event DividendSet(bytes32 corporateActionId, uint256 dividendId, address indexed operator, uint256 indexed recordDate, uint256 indexed executionDate, uint256 amount, uint8 amountDecimals)
```

Emitted when an operator schedules a new dividend corporate action.

#### Parameters

| Name                    | Type    | Description                                                                   |
| ----------------------- | ------- | ----------------------------------------------------------------------------- |
| corporateActionId       | bytes32 | Identifier of the underlying corporate action.                                |
| dividendId              | uint256 | One-indexed dividend identifier within the dividend corporate action type.    |
| operator `indexed`      | address | Address that scheduled the dividend.                                          |
| recordDate `indexed`    | uint256 | Unix timestamp of the snapshot taken to determine eligible holders.           |
| executionDate `indexed` | uint256 | Unix timestamp on which the dividend becomes payable.                         |
| amount                  | uint256 | Total amount distributed across eligible holders, scaled by `amountDecimals`. |
| amountDecimals          | uint8   | Decimal precision applied to `amount`.                                        |

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

### Deactivated

```solidity
error Deactivated()
```

Thrown when an operation guarded by `onlyActivated` is attempted on a token whose deactivation flag has already been set.

### DividendAlreadyExecuted

```solidity
error DividendAlreadyExecuted(bytes32 corporateActionId, uint256 dividendId)
```

Reverts when an operator attempts to cancel a dividend whose execution date has already passed.

#### Parameters

| Name              | Type    | Description                                                      |
| ----------------- | ------- | ---------------------------------------------------------------- |
| corporateActionId | bytes32 | Identifier of the underlying corporate action.                   |
| dividendId        | uint256 | One-indexed identifier of the dividend that cannot be cancelled. |

### DividendCreationFailed

```solidity
error DividendCreationFailed()
```

Reverts when the underlying corporate-action creation step returns the zero id, indicating the dividend could not be persisted.

### ExponentOverflow

```solidity
error ExponentOverflow(uint256 exponent)
```

Reverts when an exponent would cause `10 ** exponent` to overflow `uint256`.

_Thrown by `DecimalsLib.checkExponentOverflow` when `exponent &gt;= 78`._

#### Parameters

| Name     | Type    | Description                                  |
| -------- | ------- | -------------------------------------------- |
| exponent | uint256 | The exponent that would produce an overflow. |

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

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### SnapshotIdDoesNotExists

```solidity
error SnapshotIdDoesNotExists(uint256 snapshotId)
```

Thrown when the requested snapshot identifier has never been taken on this token.

#### Parameters

| Name       | Type    | Description                                             |
| ---------- | ------- | ------------------------------------------------------- |
| snapshotId | uint256 | The unrecognised snapshot identifier that was supplied. |

### SnapshotIdNull

```solidity
error SnapshotIdNull()
```

Thrown when a snapshot identifier of zero is supplied; zero is reserved and never assigned to a valid snapshot.

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

### WrongDates

```solidity
error WrongDates(uint256 firstDate, uint256 secondDate)
```

Reverts when two date values fail their required ordering constraint.

_The expected relationship between both dates is defined by the caller&#39;s validation context._

#### Parameters

| Name       | Type    | Description                                         |
| ---------- | ------- | --------------------------------------------------- |
| firstDate  | uint256 | First date participating in the failed comparison.  |
| secondDate | uint256 | Second date participating in the failed comparison. |

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

### WrongTimestamp

```solidity
error WrongTimestamp(uint256 timeStamp)
```

Reverts when a scheduled timestamp is not strictly in the future.

_Used for shared scheduling validation where the current block time is read through `TimeTravelStorageWrapper`._

#### Parameters

| Name      | Type    | Description                        |
| --------- | ------- | ---------------------------------- |
| timeStamp | uint256 | Timestamp rejected for scheduling. |
