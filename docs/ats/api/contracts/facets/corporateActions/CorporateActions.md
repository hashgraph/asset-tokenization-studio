# CorporateActions

_Asset Tokenization Studio Team_

> CorporateActions

Abstract contract implementing read-only corporate action query logic for a security token. Exposes retrieval of individual actions, paginated lists, type-scoped views, and content-hash deduplication checks.

_Implements `ICorporateActions`. All data is stored at `STORAGE_LOCATION_CORPORATE_ACTION` via `CorporateActionsStorageWrapper`. Write operations (add, cancel, update) are provided by domain-specific abstract contracts that extend this one. Intended to be inherited exclusively by `CorporateActionsFacet`._

## Methods

### actionContentHashExists

```solidity
function actionContentHashExists(bytes32 _contentHash) external view returns (bool)
```

Checks whether a content hash derived from an action type and payload already exists.

_The content hash is `keccak256(abi.encode(actionType, data))`. Callers can use this to detect duplicate corporate actions before submitting a registration._

#### Parameters

| Name          | Type    | Description                               |
| ------------- | ------- | ----------------------------------------- |
| \_contentHash | bytes32 | The pre-computed content hash to look up. |

#### Returns

| Name | Type | Description                                                                                     |
| ---- | ---- | ----------------------------------------------------------------------------------------------- |
| \_0  | bool | True if a corporate action with this content hash has already been registered, false otherwise. |

### getCorporateAction

```solidity
function getCorporateAction(bytes32 _corporateActionId) external view returns (bytes32 actionType_, uint256 actionIdByType_, bytes data_, bool isDisabled_)
```

Returns the stored details for a single corporate action.

#### Parameters

| Name                | Type    | Description                                                      |
| ------------------- | ------- | ---------------------------------------------------------------- |
| \_corporateActionId | bytes32 | Unique `bytes32` identifier of the corporate action to retrieve. |

#### Returns

| Name             | Type    | Description                                             |
| ---------------- | ------- | ------------------------------------------------------- |
| actionType\_     | bytes32 | Classification key for the action.                      |
| actionIdByType\_ | uint256 | Sequential index of this action within its action type. |
| data\_           | bytes   | ABI-encoded payload containing the action details.      |
| isDisabled\_     | bool    | True if the action has been cancelled, false otherwise. |

### getCorporateActionCount

```solidity
function getCorporateActionCount() external view returns (uint256 corporateActionCount_)
```

Returns the total number of corporate actions registered on the token.

#### Returns

| Name                   | Type    | Description                                      |
| ---------------------- | ------- | ------------------------------------------------ |
| corporateActionCount\_ | uint256 | The total count of registered corporate actions. |

### getCorporateActionCountByType

```solidity
function getCorporateActionCountByType(bytes32 _actionType) external view returns (uint256 corporateActionCount_)
```

Returns the number of corporate actions registered under a specific action type.

#### Parameters

| Name         | Type    | Description               |
| ------------ | ------- | ------------------------- |
| \_actionType | bytes32 | The action type to count. |

#### Returns

| Name                   | Type    | Description                                         |
| ---------------------- | ------- | --------------------------------------------------- |
| corporateActionCount\_ | uint256 | The number of actions registered for `_actionType`. |

### getCorporateActionIds

```solidity
function getCorporateActionIds(uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] corporateActionIds_)
```

Returns a paginated slice of corporate action identifiers.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the total action count.\*

#### Parameters

| Name         | Type    | Description                                       |
| ------------ | ------- | ------------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.                            |
| \_pageLength | uint256 | Maximum number of identifiers to return per page. |

#### Returns

| Name                 | Type      | Description                                                   |
| -------------------- | --------- | ------------------------------------------------------------- |
| corporateActionIds\_ | bytes32[] | Array of corporate action identifiers for the requested page. |

### getCorporateActionIdsByType

```solidity
function getCorporateActionIdsByType(bytes32 _actionType, uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] corporateActionIds_)
```

Returns a paginated slice of corporate action identifiers for a specific action type.

_The list offset is computed as `\_pageIndex _ \_pageLength`. Returns an empty array when the offset meets or exceeds the count for that type.\*

#### Parameters

| Name         | Type    | Description                                       |
| ------------ | ------- | ------------------------------------------------- |
| \_actionType | bytes32 | The action type to filter by.                     |
| \_pageIndex  | uint256 | Zero-based page index.                            |
| \_pageLength | uint256 | Maximum number of identifiers to return per page. |

#### Returns

| Name                 | Type      | Description                                                   |
| -------------------- | --------- | ------------------------------------------------------------- |
| corporateActionIds\_ | bytes32[] | Array of corporate action identifiers for the requested page. |

### getCorporateActions

```solidity
function getCorporateActions(uint256 _pageIndex, uint256 _pageLength) external view returns (bytes32[] actionTypes_, uint256[] actionIdByType_, bytes[] datas_, bool[] isDisabled_)
```

Returns a paginated slice of full corporate action records.

_Internally resolves each paginated ID to its full `ActionData`. The list offset is computed as `\_pageIndex _ \_pageLength`.\*

#### Parameters

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| \_pageIndex  | uint256 | Zero-based page index.                        |
| \_pageLength | uint256 | Maximum number of records to return per page. |

#### Returns

| Name             | Type      | Description                                                          |
| ---------------- | --------- | -------------------------------------------------------------------- |
| actionTypes\_    | bytes32[] | Array of action classification keys.                                 |
| actionIdByType\_ | uint256[] | Array of per-type sequential indices.                                |
| datas\_          | bytes[]   | Array of ABI-encoded action payloads.                                |
| isDisabled\_     | bool[]    | Array of disabled flags; `true` means the action has been cancelled. |

### getCorporateActionsByType

```solidity
function getCorporateActionsByType(bytes32 actionType, uint256 pageIndex, uint256 pageLength) external view returns (bytes32[] actionTypes_, uint256[] actionTypeIds_, bytes[] datas_, bool[] isDisabled_)
```

Returns a paginated slice of full corporate action records for a specific action type.

_Internally resolves each paginated type-scoped ID to its full `ActionData`. The list offset is computed as `\_pageIndex _ \_pageLength`.\*

#### Parameters

| Name       | Type    | Description |
| ---------- | ------- | ----------- |
| actionType | bytes32 | undefined   |
| pageIndex  | uint256 | undefined   |
| pageLength | uint256 | undefined   |

#### Returns

| Name            | Type      | Description                                                          |
| --------------- | --------- | -------------------------------------------------------------------- |
| actionTypes\_   | bytes32[] | Array of action classification keys.                                 |
| actionTypeIds\_ | uint256[] | Array of per-type sequential indices.                                |
| datas\_         | bytes[]   | Array of ABI-encoded action payloads.                                |
| isDisabled\_    | bool[]    | Array of disabled flags; `true` means the action has been cancelled. |

### initializeCorporateActions

```solidity
function initializeCorporateActions() external nonpayable
```

Initialises the corporate actions capability on the token.

_Callable once; subsequent calls revert with FacetAlreadyRegistered. Requires DEFAULT_ADMIN_ROLE. Called by the factory during deployment._

## Events

### CorporateActionAdded

```solidity
event CorporateActionAdded(address indexed operator, bytes32 indexed actionType, bytes32 indexed corporateActionId, uint256 corporateActionIdByType, bytes data)
```

Emitted when a new corporate action is registered on the token.

#### Parameters

| Name                        | Type    | Description                                                                         |
| --------------------------- | ------- | ----------------------------------------------------------------------------------- |
| operator `indexed`          | address | Address of the caller who added the corporate action.                               |
| actionType `indexed`        | bytes32 | Classification key for the corporate action (e.g. dividend, vote).                  |
| corporateActionId `indexed` | bytes32 | Unique sequential identifier for the corporate action (1-based, cast to `bytes32`). |
| corporateActionIdByType     | uint256 | Sequential index of this action within its action type.                             |
| data                        | bytes   | ABI-encoded payload defining the corporate action details.                          |

### CorporateActionCancelled

```solidity
event CorporateActionCancelled(bytes32 indexed corporateActionId)
```

Emitted when a corporate action is cancelled (disabled).

#### Parameters

| Name                        | Type    | Description                                                   |
| --------------------------- | ------- | ------------------------------------------------------------- |
| corporateActionId `indexed` | bytes32 | Unique identifier of the corporate action that was cancelled. |

### CorporateActionsInitialized

```solidity
event CorporateActionsInitialized()
```

Emitted once when the corporate actions capability is initialised on a token.

_Fires exclusively from `initializeCorporateActions`._

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

### AccountIsBlocked

```solidity
error AccountIsBlocked(address account)
```

Reverts when an operation targets or is requested by a blocked account.

_The blocking policy is enforced by the domain that performs the check._

#### Parameters

| Name    | Type    | Description                                  |
| ------- | ------- | -------------------------------------------- |
| account | address | Account rejected by the blocking validation. |

### AlreadyInitialized

```solidity
error AlreadyInitialized()
```

Reverts when an initialisation routine is invoked more than once.

_Used by contracts or facets that must be initialised exactly once._

### ContradictoryValuesInArray

```solidity
error ContradictoryValuesInArray(uint256 lowerIndex, uint256 upperIndex)
```

Reverts when ordered array values contradict expected ordering.

_Indicates that two indexed values cannot both satisfy the required monotonic or range invariant._

#### Parameters

| Name       | Type    | Description                                      |
| ---------- | ------- | ------------------------------------------------ |
| lowerIndex | uint256 | Lower array index involved in the contradiction. |
| upperIndex | uint256 | Upper array index involved in the contradiction. |

### CorporateActionAlreadyDisabled

```solidity
error CorporateActionAlreadyDisabled(bytes32 corporateActionId)
```

Thrown when attempting to cancel a corporate action that is already disabled.

#### Parameters

| Name              | Type    | Description                                              |
| ----------------- | ------- | -------------------------------------------------------- |
| corporateActionId | bytes32 | The identifier of the already-disabled corporate action. |

### CorporateActionNotFound

```solidity
error CorporateActionNotFound(bytes32 corporateActionId)
```

Thrown when a lookup by `corporateActionId` returns no matching record.

#### Parameters

| Name              | Type    | Description                        |
| ----------------- | ------- | ---------------------------------- |
| corporateActionId | bytes32 | The identifier that was not found. |

### DecimalsTooLarge

```solidity
error DecimalsTooLarge(uint8 currentDecimals, uint8 newDecimals)
```

Reverts when the difference between current decimals and new decimals exceeds the maximum value.

_Protects decimals amount difference between current and new not te be greater than maximum._

#### Parameters

| Name            | Type  | Description                  |
| --------------- | ----- | ---------------------------- |
| currentDecimals | uint8 | the current decimals amount. |
| newDecimals     | uint8 | the new decimals amount.     |

### DuplicatedCorporateAction

```solidity
error DuplicatedCorporateAction(bytes32 actionType, bytes data)
```

Thrown when attempting to add a corporate action whose content hash already exists.

_De-duplication is enforced via `keccak256(abi.encode(actionType, data))`._

#### Parameters

| Name       | Type    | Description                                                |
| ---------- | ------- | ---------------------------------------------------------- |
| actionType | bytes32 | The action type of the duplicate corporate action.         |
| data       | bytes   | The ABI-encoded payload of the duplicate corporate action. |

### ExpiredDeadline

```solidity
error ExpiredDeadline(uint256 deadline)
```

Reverts when a signed payload is submitted after its deadline.

_The caller must provide and validate deadlines before accepting the signed operation._

#### Parameters

| Name     | Type    | Description                                     |
| -------- | ------- | ----------------------------------------------- |
| deadline | uint256 | Expired deadline carried by the signed payload. |

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

### GreaterThanMaxUint256

```solidity
error GreaterThanMaxUint256(uint256 amount, uint8 decimals)
```

Reverts when multiplying `amount` by `10 ** decimals` would exceed `uint256` max.

_Thrown by `DecimalsLib.calculateDecimalsAdjustment` when `amount &gt; MAX_UINT256 / 10 ** decimals`._

#### Parameters

| Name     | Type    | Description                                |
| -------- | ------- | ------------------------------------------ |
| amount   | uint256 | The token amount that cannot be scaled up. |
| decimals | uint8   | The exponent that causes the overflow.     |

### InvalidDates

```solidity
error InvalidDates()
```

Reverts when a date set is invalid.

_Used when the failing date constraint does not require exposing values._

### InvalidTimestamp

```solidity
error InvalidTimestamp()
```

Reverts when a timestamp value is invalid.

_Used for shared timestamp validation that is not tied to expiration._

### MaxExternalListSizeReached

```solidity
error MaxExternalListSizeReached(uint256 max)
```

Reverts when adding an entry would grow an external list beyond its maximum size.

_Enforced by `ExternalListManagementStorageWrapper.addExternalList` for the external pause, control and KYC lists. The bound exists because each list is iterated in full on the hot path of token operations, so an unbounded list could exceed the gas limit and brick the token._

#### Parameters

| Name | Type    | Description                                               |
| ---- | ------- | --------------------------------------------------------- |
| max  | uint256 | Maximum number of entries permitted in the external list. |

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

### WrongExpirationTimestamp

```solidity
error WrongExpirationTimestamp()
```

Reverts when an expiration timestamp is invalid.

_Used for expired, past, or otherwise unacceptable expiration values._

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

### WrongNonce

```solidity
error WrongNonce(uint256 nonce, address account)
```

Reverts when a nonce does not match the expected value for an account.

_Protects signed operations against replay and out-of-order execution._

#### Parameters

| Name    | Type    | Description                                     |
| ------- | ------- | ----------------------------------------------- |
| nonce   | uint256 | Nonce supplied by the caller or signed payload. |
| account | address | Account for which the nonce validation failed.  |

### WrongSignature

```solidity
error WrongSignature()
```

Reverts when a signature fails verification.

_Applies to shared signature validation flows, including EIP-712 payloads and partition-based signatures._

### WrongSignatureLength

```solidity
error WrongSignatureLength()
```

Reverts when a signature payload has an invalid byte length.

_Used before signature recovery or verification to reject malformed input._

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._

### ZeroValueNotAllowed

```solidity
error ZeroValueNotAllowed()
```

Reverts when zero is supplied where a positive value is required.

_Used for shared validation of amounts, limits, factors, or identifiers._
