# Amortization

_Asset Tokenization Studio Team_

> Amortization

Writer abstract for the amortization facet — registers, holds, releases, and cancels amortization corporate actions against a token&#39;s holder set.

_Each entry forwards to {AmortizationStorageWrapper}, which performs the state mutations and emits the canonical events declared on {IAmortization}._

## Methods

### cancelAmortization

```solidity
function cancelAmortization(uint256 _amortizationID) external nonpayable
```

Cancels an existing amortization.

_Requires no active amortization holds for the specified corporate action._

#### Parameters

| Name             | Type    | Description                           |
| ---------------- | ------- | ------------------------------------- |
| \_amortizationID | uint256 | The ID of the amortization to cancel. |

### forceCancelAmortization

```solidity
function forceCancelAmortization(uint256 _amortizationID) external nonpayable
```

Force-cancels an amortization regardless of its execution date.

_Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL`; gated by `onlyUnpaused`, `onlyWithoutMultiPartition`, and `onlyMatchingActionType(CORPORATE_ACTION_TYPE_AMORTIZATION, _amortizationID - 1)`._

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

_Registers the amortization facet as ready and can only be executed once by an admin._

### releaseAmortizationHold

```solidity
function releaseAmortizationHold(uint256 _amortizationID, address _tokenHolder) external nonpayable
```

Releases the active hold for a specific token holder in an amortization.

_Releases a holder-specific amortization hold for a valid amortization action._

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

_Creates or updates a positive holder-specific hold for a valid amortization action._

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

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 value)
```

Emitted whenever tokens move between accounts, are minted, or are burned.

#### Parameters

| Name           | Type    | Description                                 |
| -------------- | ------- | ------------------------------------------- |
| from `indexed` | address | Source account (zero address on mint).      |
| to `indexed`   | address | Destination account (zero address on burn). |
| value          | uint256 | Amount of tokens transferred.               |

### TransferByPartition

```solidity
event TransferByPartition(bytes32 indexed fromPartition, address operator, address indexed from, address indexed to, uint256 value, bytes data, bytes operatorData)
```

Emitted when tokens are transferred from one partition to another or within the same partition.

#### Parameters

| Name                    | Type    | Description                           |
| ----------------------- | ------- | ------------------------------------- |
| fromPartition `indexed` | bytes32 | Source partition.                     |
| operator                | address | Address that initiated the transfer.  |
| from `indexed`          | address | Token holder whose balance decreased. |
| to `indexed`            | address | Recipient whose balance increased.    |
| value                   | uint256 | Token quantity transferred.           |
| data                    | bytes   | Caller-supplied data.                 |
| operatorData            | bytes   | Operator-supplied data.               |

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

### InsufficientBalance

```solidity
error InsufficientBalance(address account, uint256 balance, uint256 value, bytes32 partition)
```

Thrown when a transfer or redemption is attempted with insufficient partition balance.

#### Parameters

| Name      | Type    | Description                            |
| --------- | ------- | -------------------------------------- |
| account   | address | The account whose balance was checked. |
| balance   | uint256 | The actual balance available.          |
| value     | uint256 | The amount that was requested.         |
| partition | bytes32 | The partition that was checked.        |

### InvalidAmortizationHoldAmount

```solidity
error InvalidAmortizationHoldAmount(uint256 amortizationID)
```

Thrown when attempting to set a hold with a zero token amount.

#### Parameters

| Name           | Type    | Description          |
| -------------- | ------- | -------------------- |
| amortizationID | uint256 | The amortization ID. |

### InvalidHoldAmount

```solidity
error InvalidHoldAmount()
```

Reverts when a hold is created with a zero or otherwise invalid amount.

### InvalidPartition

```solidity
error InvalidPartition(address account, bytes32 partition)
```

Thrown when an account does not hold or is not associated with the specified partition.

#### Parameters

| Name      | Type    | Description                                   |
| --------- | ------- | --------------------------------------------- |
| account   | address | Address that was checked.                     |
| partition | bytes32 | Partition that was not found for the account. |

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

### NotAllowedInMultiPartitionMode

```solidity
error NotAllowedInMultiPartitionMode()
```

Thrown when a single-partition operation is attempted on a multi-partition token.

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
