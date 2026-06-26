# IDividend

_Asset Tokenization Studio Team_

> IDividend

Writer-side interface for the Dividend domain — exposes the corporate-action lifecycle (`setDividend`, `cancelDividend`) plus the per-record reads that consumers need before executing or auditing a dividend.

_Inherits `IDividendTypes` for the shared struct tier (`Dividend`, `RegisteredDividend`, `DividendFor`, `DividendAmountFor`). Domain events and errors live on this writer interface (not on the shared types tier) so that read-only sibling facets such as `IDividendSecurityHolders` do not pick up symbols they never emit or revert with — a narrow EIP-165 interfaceId is the goal. Aggregated into the off-chain `IAsset` umbrella alongside the read-only sibling facets._

## Methods

### cancelDividend

```solidity
function cancelDividend(uint256 _dividendId) external nonpayable returns (bool success_)
```

Cancels a previously scheduled dividend before its execution date is reached.

_Restricted to `ROLE_CORPORATE_ACTION` and gated by the unpaused state. Reverts with `DividendAlreadyExecuted` if the execution date has passed; otherwise marks the corporate action disabled and emits `DividendCancelled`._

#### Parameters

| Name         | Type    | Description                                       |
| ------------ | ------- | ------------------------------------------------- |
| \_dividendId | uint256 | One-indexed identifier of the dividend to cancel. |

#### Returns

| Name      | Type | Description                            |
| --------- | ---- | -------------------------------------- |
| success\_ | bool | True if the cancellation was recorded. |

### forceCancelDividend

```solidity
function forceCancelDividend(uint256 _dividendId) external nonpayable returns (bool success_)
```

Force-cancels a dividend regardless of its execution date.

_Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL` and gated by the unpaused state and `onlyMatchingActionType`. Marks the corporate action disabled unconditionally — bypasses `DividendAlreadyExecuted` — and emits `DividendForceCancelled`._

#### Parameters

| Name         | Type    | Description                                             |
| ------------ | ------- | ------------------------------------------------------- |
| \_dividendId | uint256 | One-indexed identifier of the dividend to force-cancel. |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | True if the force-cancellation was recorded. |

### getDividend

```solidity
function getDividend(uint256 _dividendId) external view returns (struct IDividendTypes.RegisteredDividend registeredDividend_, bool isDisabled_)
```

Returns the persisted dividend record together with its cancelled flag.

_Reverts via `onlyMatchingActionType` if `dividendId` does not resolve to a dividend corporate action._

#### Parameters

| Name         | Type    | Description                      |
| ------------ | ------- | -------------------------------- |
| \_dividendId | uint256 | One-indexed dividend identifier. |

#### Returns

| Name                 | Type                              | Description                                            |
| -------------------- | --------------------------------- | ------------------------------------------------------ |
| registeredDividend\_ | IDividendTypes.RegisteredDividend | Stored dividend parameters bound to their snapshot id. |
| isDisabled\_         | bool                              | True if the dividend has been cancelled.               |

### getDividendAmountFor

```solidity
function getDividendAmountFor(uint256 _dividendId, address _account) external view returns (struct IDividendTypes.DividendAmountFor dividendAmountFor_)
```

Returns the fractional dividend amount payable to a specific holder.

_Reverts via `onlyMatchingActionType` if `dividendId` does not resolve to a dividend corporate action. Numerator and denominator are only meaningful once `recordDateReached` is set on the returned struct._

#### Parameters

| Name         | Type    | Description                      |
| ------------ | ------- | -------------------------------- |
| \_dividendId | uint256 | One-indexed dividend identifier. |
| \_account    | address | Holder address to query.         |

#### Returns

| Name                | Type                             | Description                               |
| ------------------- | -------------------------------- | ----------------------------------------- |
| dividendAmountFor\_ | IDividendTypes.DividendAmountFor | Fractional payable amount for the holder. |

### getDividendFor

```solidity
function getDividendFor(uint256 _dividendId, address _account) external view returns (struct IDividendTypes.DividendFor dividendFor_)
```

Returns the per-account view of a dividend, including the holder&#39;s balance at the record date and the metadata required to compute the payable amount.

_Reverts via `onlyMatchingActionType` if `dividendId` does not resolve to a dividend corporate action. Balance and decimals fields are only meaningful once `recordDateReached` is set on the returned struct._

#### Parameters

| Name         | Type    | Description                      |
| ------------ | ------- | -------------------------------- |
| \_dividendId | uint256 | One-indexed dividend identifier. |
| \_account    | address | Holder address to query.         |

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

### initializeDividend

```solidity
function initializeDividend() external nonpayable
```

Initialises the dividend capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### setDividend

```solidity
function setDividend(IDividendTypes.Dividend _newDividend) external nonpayable returns (uint256 dividendId_)
```

#### Parameters

| Name          | Type                    | Description |
| ------------- | ----------------------- | ----------- |
| \_newDividend | IDividendTypes.Dividend | undefined   |

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
