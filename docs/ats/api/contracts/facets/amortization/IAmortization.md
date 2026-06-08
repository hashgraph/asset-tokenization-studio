# IAmortization

_Asset Tokenization Studio Team_

> IAmortization

Writer interface for the amortization facet — corporate-action driven token redemption.

_Defines the events, errors, structs, and functions used to register, fund, hold, and cancel amortization corporate actions across the token holder set._

## Methods

### cancelAmortization

```solidity
function cancelAmortization(uint256 _amortizationID) external nonpayable
```

Cancels an existing amortization.

_Reverts if any token holder still has an active hold for this amortization. All holds must be released via `releaseAmortizationHold` before cancellation is allowed._

#### Parameters

| Name             | Type    | Description                           |
| ---------------- | ------- | ------------------------------------- |
| \_amortizationID | uint256 | The ID of the amortization to cancel. |

### forceCancelAmortization

```solidity
function forceCancelAmortization(uint256 _amortizationID) external nonpayable
```

Force-cancels an amortization regardless of its execution date.

_Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL` and gated by the unpaused state, `onlyWithoutMultiPartition`, and `onlyMatchingActionType`. Marks the corporate action disabled unconditionally — bypasses `AmortizationAlreadyExecuted` and `AmortizationNotActive` — and emits `AmortizationForceCancelled`._

#### Parameters

| Name             | Type    | Description                                 |
| ---------------- | ------- | ------------------------------------------- |
| \_amortizationID | uint256 | The ID of the amortization to force-cancel. |

### getActiveAmortizationIds

```solidity
function getActiveAmortizationIds(uint256 _pageIndex, uint256 _pageLength) external view returns (uint256[] activeIds_)
```

Retrieves a paginated list of non-cancelled amortization IDs.

_Cancelled amortizations (isDisabled=true) are excluded from the result._

#### Parameters

| Name         | Type    | Description                     |
| ------------ | ------- | ------------------------------- |
| \_pageIndex  | uint256 | The page index for pagination.  |
| \_pageLength | uint256 | The number of records per page. |

#### Returns

| Name        | Type      | Description                                             |
| ----------- | --------- | ------------------------------------------------------- |
| activeIds\_ | uint256[] | Array of amortization IDs that have not been cancelled. |

### getAmortization

```solidity
function getAmortization(uint256 _amortizationID) external view returns (struct IAmortization.RegisteredAmortization registeredAmortization_, bool isDisabled_)
```

Retrieves a registered amortization by its ID.

#### Parameters

| Name             | Type    | Description                             |
| ---------------- | ------- | --------------------------------------- |
| \_amortizationID | uint256 | The ID of the amortization to retrieve. |

#### Returns

| Name                     | Type                                 | Description                           |
| ------------------------ | ------------------------------------ | ------------------------------------- |
| registeredAmortization\_ | IAmortization.RegisteredAmortization | The registered amortization data.     |
| isDisabled\_             | bool                                 | Whether the amortization is disabled. |

### getAmortizationActiveHolders

```solidity
function getAmortizationActiveHolders(uint256 _amortizationID, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] holders_)
```

Retrieves a paginated list of token holders that still have an active hold for a given amortization.

_Use this to identify which holders must have their hold released before `cancelAmortization` can succeed._

#### Parameters

| Name             | Type    | Description                     |
| ---------------- | ------- | ------------------------------- |
| \_amortizationID | uint256 | The ID of the amortization.     |
| \_pageIndex      | uint256 | The page index for pagination.  |
| \_pageLength     | uint256 | The number of holders per page. |

#### Returns

| Name      | Type      | Description                                                   |
| --------- | --------- | ------------------------------------------------------------- |
| holders\_ | address[] | Array of addresses with an active hold for this amortization. |

### getAmortizationFor

```solidity
function getAmortizationFor(uint256 _amortizationID, address _account) external view returns (struct IAmortization.AmortizationFor amortizationFor_)
```

Retrieves amortization payment information for a specific account.

#### Parameters

| Name             | Type    | Description                 |
| ---------------- | ------- | --------------------------- |
| \_amortizationID | uint256 | The ID of the amortization. |
| \_account        | address | The account address.        |

#### Returns

| Name              | Type                          | Description                                                 |
| ----------------- | ----------------------------- | ----------------------------------------------------------- |
| amortizationFor\_ | IAmortization.AmortizationFor | Amortization payment information for the specified account. |

### getAmortizationHolders

```solidity
function getAmortizationHolders(uint256 _amortizationID, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] holders_)
```

Retrieves a paginated list of amortization holders for a specific amortization ID.

#### Parameters

| Name             | Type    | Description                     |
| ---------------- | ------- | ------------------------------- |
| \_amortizationID | uint256 | The ID of the amortization.     |
| \_pageIndex      | uint256 | The page index for pagination.  |
| \_pageLength     | uint256 | The number of holders per page. |

#### Returns

| Name      | Type      | Description                |
| --------- | --------- | -------------------------- |
| holders\_ | address[] | Array of holder addresses. |

### getAmortizationsCount

```solidity
function getAmortizationsCount() external view returns (uint256 amortizationCount_)
```

Retrieves the total number of amortizations set for the security.

_Cancelled amortizations are included in the count._

#### Returns

| Name                | Type    | Description                                  |
| ------------------- | ------- | -------------------------------------------- |
| amortizationCount\_ | uint256 | The total count of registered amortizations. |

### getAmortizationsFor

```solidity
function getAmortizationsFor(uint256 _amortizationID, uint256 _pageIndex, uint256 _pageLength) external view returns (struct IAmortization.AmortizationFor[] amortizationsFor_, address[] holders_)
```

Retrieves amortization payment information for multiple holders (paginated).

#### Parameters

| Name             | Type    | Description                     |
| ---------------- | ------- | ------------------------------- |
| \_amortizationID | uint256 | The ID of the amortization.     |
| \_pageIndex      | uint256 | The page index for pagination.  |
| \_pageLength     | uint256 | The number of records per page. |

#### Returns

| Name               | Type                            | Description                                                     |
| ------------------ | ------------------------------- | --------------------------------------------------------------- |
| amortizationsFor\_ | IAmortization.AmortizationFor[] | List of amortization payment information per holder.            |
| holders\_          | address[]                       | The holder addresses aligned by index with `amortizationsFor_`. |

### getTotalActiveAmortizationIds

```solidity
function getTotalActiveAmortizationIds() external view returns (uint256)
```

Retrieves the total number of non-cancelled amortizations.

#### Returns

| Name | Type    | Description                                                 |
| ---- | ------- | ----------------------------------------------------------- |
| \_0  | uint256 | The total count of active (non-cancelled) amortization IDs. |

### getTotalAmortizationActiveHolders

```solidity
function getTotalAmortizationActiveHolders(uint256 _amortizationID) external view returns (uint256)
```

Retrieves the total number of token holders that still have an active hold for a given amortization.

#### Parameters

| Name             | Type    | Description                 |
| ---------------- | ------- | --------------------------- |
| \_amortizationID | uint256 | The ID of the amortization. |

#### Returns

| Name | Type    | Description                                     |
| ---- | ------- | ----------------------------------------------- |
| \_0  | uint256 | The total count of holders with an active hold. |

### getTotalAmortizationHolders

```solidity
function getTotalAmortizationHolders(uint256 _amortizationID) external view returns (uint256)
```

Retrieves the total number of amortization holders for a specific amortization ID.

_It is the list of token holders at the snapshot taken at the record date._

#### Parameters

| Name             | Type    | Description                 |
| ---------------- | ------- | --------------------------- |
| \_amortizationID | uint256 | The ID of the amortization. |

#### Returns

| Name | Type    | Description                               |
| ---- | ------- | ----------------------------------------- |
| \_0  | uint256 | The total number of amortization holders. |

### getTotalHoldByAmortizationId

```solidity
function getTotalHoldByAmortizationId(uint256 _amortizationID) external view returns (uint256)
```

Retrieves the total amount of tokens locked in holds for a given amortization.

#### Parameters

| Name             | Type    | Description                 |
| ---------------- | ------- | --------------------------- |
| \_amortizationID | uint256 | The ID of the amortization. |

#### Returns

| Name | Type    | Description                                                                |
| ---- | ------- | -------------------------------------------------------------------------- |
| \_0  | uint256 | The total token amount held across all active holds for this amortization. |

### initializeAmortization

```solidity
function initializeAmortization() external nonpayable
```

Initialises the amortization capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### releaseAmortizationHold

```solidity
function releaseAmortizationHold(uint256 _amortizationID, address _tokenHolder) external nonpayable
```

Releases the active hold for a specific token holder in an amortization.

_Must be called for every holder with an active hold before `cancelAmortization` can succeed. Reverts if the holder has no active hold for this amortization._

#### Parameters

| Name             | Type    | Description                                                  |
| ---------------- | ------- | ------------------------------------------------------------ |
| \_amortizationID | uint256 | The ID of the amortization.                                  |
| \_tokenHolder    | address | The address of the token holder whose hold will be released. |

### setAmortization

```solidity
function setAmortization(IAmortization.Amortization _amortization) external nonpayable returns (bool success_, uint256 amortizationID_)
```

#### Parameters

| Name           | Type                       | Description |
| -------------- | -------------------------- | ----------- |
| \_amortization | IAmortization.Amortization | undefined   |

#### Returns

| Name             | Type    | Description |
| ---------------- | ------- | ----------- |
| success\_        | bool    | undefined   |
| amortizationID\_ | uint256 | undefined   |

### setAmortizationHold

```solidity
function setAmortizationHold(uint256 _amortizationID, address _tokenHolder, uint256 _tokenAmount) external nonpayable returns (uint256 holdId_)
```

Creates or replaces the hold for a specific token holder in an amortization.

_If the holder already has a pending hold, it is released first._

#### Parameters

| Name             | Type    | Description                               |
| ---------------- | ------- | ----------------------------------------- |
| \_amortizationID | uint256 | The ID of the amortization.               |
| \_tokenHolder    | address | The address of the token holder.          |
| \_tokenAmount    | uint256 | The number of tokens to lock in the hold. |

#### Returns

| Name     | Type    | Description                       |
| -------- | ------- | --------------------------------- |
| holdId\_ | uint256 | The ID of the newly created hold. |

## Events

### AmortizationCancelled

```solidity
event AmortizationCancelled(uint256 amortizationId, address indexed operator)
```

Emitted when an amortization is cancelled.

#### Parameters

| Name               | Type    | Description                               |
| ------------------ | ------- | ----------------------------------------- |
| amortizationId     | uint256 | Identifier of the cancelled amortization. |
| operator `indexed` | address | Address that performed the cancellation.  |

### AmortizationForceCancelled

```solidity
event AmortizationForceCancelled(uint256 amortizationId, address indexed operator)
```

Emitted when an admin force-cancels an amortization, bypassing date guards.

#### Parameters

| Name               | Type    | Description                                     |
| ------------------ | ------- | ----------------------------------------------- |
| amortizationId     | uint256 | Identifier of the force-cancelled amortization. |
| operator `indexed` | address | Address that performed the force-cancellation.  |

### AmortizationHoldReleased

```solidity
event AmortizationHoldReleased(bytes32 indexed corporateActionId, uint256 indexed amortizationID, address indexed tokenHolder, uint256 holdId)
```

Emitted when a hold is released for a token holder in an amortization.

#### Parameters

| Name                        | Type    | Description                                           |
| --------------------------- | ------- | ----------------------------------------------------- |
| corporateActionId `indexed` | bytes32 | Unique identifier grouping related corporate actions. |
| amortizationID `indexed`    | uint256 | Identifier of the amortization.                       |
| tokenHolder `indexed`       | address | Address of the token holder whose hold was released.  |
| holdId                      | uint256 | ID of the released hold.                              |

### AmortizationHoldSet

```solidity
event AmortizationHoldSet(bytes32 indexed corporateActionId, uint256 indexed amortizationID, address indexed tokenHolder, uint256 holdId, uint256 tokenAmount)
```

Emitted when a hold is created or replaced for a token holder in an amortization.

#### Parameters

| Name                        | Type    | Description                                           |
| --------------------------- | ------- | ----------------------------------------------------- |
| corporateActionId `indexed` | bytes32 | Unique identifier grouping related corporate actions. |
| amortizationID `indexed`    | uint256 | Identifier of the amortization.                       |
| tokenHolder `indexed`       | address | Address of the token holder.                          |
| holdId                      | uint256 | ID of the newly created hold.                         |
| tokenAmount                 | uint256 | Amount of tokens locked in the hold.                  |

### AmortizationInitialized

```solidity
event AmortizationInitialized()
```

Emitted once when the amortization capability is initialised on a token.

_Fires exclusively from `initializeAmortization`._

### AmortizationSet

```solidity
event AmortizationSet(bytes32 corporateActionId, uint256 amortizationId, address indexed operator, uint256 recordDate, uint256 executionDate)
```

Emitted when an amortization is created or updated for a security.

#### Parameters

| Name               | Type    | Description                                           |
| ------------------ | ------- | ----------------------------------------------------- |
| corporateActionId  | bytes32 | Unique identifier grouping related corporate actions. |
| amortizationId     | uint256 | Identifier of the created or updated amortization.    |
| operator `indexed` | address | Address that performed the operation.                 |
| recordDate         | uint256 | Date at which token holder balances are snapshotted.  |
| executionDate      | uint256 | Date at which the amortization payment is executed.   |

## Errors

### AmortizationAlreadyExecuted

```solidity
error AmortizationAlreadyExecuted(bytes32 corporateActionId, uint256 amortizationId)
```

Amortization execution failed because the amortization has already been executed.

#### Parameters

| Name              | Type    | Description                                                   |
| ----------------- | ------- | ------------------------------------------------------------- |
| corporateActionId | bytes32 | The corporate action ID of the already-executed amortization. |
| amortizationId    | uint256 | The amortization ID that was already executed.                |

### AmortizationCreationFailed

```solidity
error AmortizationCreationFailed()
```

Amortization creation failed due to an internal failure.

### AmortizationHasActiveHolds

```solidity
error AmortizationHasActiveHolds(bytes32 corporateActionId, uint256 amortizationID)
```

Thrown when attempting to cancel an amortization that still has active holds.

#### Parameters

| Name              | Type    | Description                                       |
| ----------------- | ------- | ------------------------------------------------- |
| corporateActionId | bytes32 | The corporate action ID of the amortization.      |
| amortizationID    | uint256 | The amortization ID that still has pending holds. |

### AmortizationHoldFailed

```solidity
error AmortizationHoldFailed(bytes32 corporateActionId, uint256 amortizationID)
```

Thrown when creating a hold for an amortization fails.

#### Parameters

| Name              | Type    | Description                                         |
| ----------------- | ------- | --------------------------------------------------- |
| corporateActionId | bytes32 | The corporate action ID of the amortization.        |
| amortizationID    | uint256 | The amortization ID for which hold creation failed. |

### AmortizationHoldNotActive

```solidity
error AmortizationHoldNotActive(bytes32 corporateActionId, uint256 amortizationID, address tokenHolder)
```

Thrown when attempting to release a hold that is not active for the given holder.

#### Parameters

| Name              | Type    | Description                                          |
| ----------------- | ------- | ---------------------------------------------------- |
| corporateActionId | bytes32 | The corporate action ID of the amortization.         |
| amortizationID    | uint256 | The amortization ID.                                 |
| tokenHolder       | address | The address of the token holder with no active hold. |

### AmortizationNotActive

```solidity
error AmortizationNotActive(bytes32 corporateActionId, uint256 amortizationID)
```

Thrown when attempting to operate on a cancelled amortization.

#### Parameters

| Name              | Type    | Description                                  |
| ----------------- | ------- | -------------------------------------------- |
| corporateActionId | bytes32 | The corporate action ID of the amortization. |
| amortizationID    | uint256 | The amortization ID.                         |

### InvalidAmortizationHoldAmount

```solidity
error InvalidAmortizationHoldAmount(uint256 amortizationID)
```

Thrown when attempting to set a hold with a zero token amount.

#### Parameters

| Name           | Type    | Description          |
| -------------- | ------- | -------------------- |
| amortizationID | uint256 | The amortization ID. |
