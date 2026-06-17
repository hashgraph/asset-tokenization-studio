# ClearingFacet

_Asset Tokenization Studio Team_

> ClearingFacet

Diamond facet exposing the clearing module global state and account-level reads.

_Registers six selectors under `RESOLVER_KEY_CLEARING`: `initializeClearing`, `activateClearing`, `deactivateClearing`, `isClearingActivated`, `getClearedAmountFor`, and `getClearingThirdParty`. Inherits the implementation from `Clearing`. Requires `ClearingReadOps` library linking at deployment._

## Methods

### activateClearing

```solidity
function activateClearing() external nonpayable returns (bool success_)
```

Activates the clearing functionality

#### Returns

| Name      | Type | Description                                     |
| --------- | ---- | ----------------------------------------------- |
| success\_ | bool | True when the activation completes successfully |

### deactivateClearing

```solidity
function deactivateClearing() external nonpayable returns (bool success_)
```

Deactivates the clearing functionality

#### Returns

| Name      | Type | Description                                       |
| --------- | ---- | ------------------------------------------------- |
| success\_ | bool | True when the deactivation completes successfully |

### getClearedAmountFor

```solidity
function getClearedAmountFor(address _tokenHolder) external view returns (uint256 amount_)
```

Gets the total cleared amount for a token holder across all partitions

#### Parameters

| Name          | Type    | Description                     |
| ------------- | ------- | ------------------------------- |
| \_tokenHolder | address | The address of the token holder |

#### Returns

| Name     | Type    | Description                                          |
| -------- | ------- | ---------------------------------------------------- |
| amount\_ | uint256 | Total cleared amount currently locked for the holder |

### getClearingThirdParty

```solidity
function getClearingThirdParty(bytes32 _partition, address _tokenHolder, enum IClearingTypes.ClearingOperationType _clearingOperationType, uint256 _clearingId) external view returns (address thirdParty_)
```

Gets the address of the party that initiated the clearing operation

#### Parameters

| Name                    | Type                                      | Description                                                    |
| ----------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| \_partition             | bytes32                                   | The partition of the token                                     |
| \_tokenHolder           | address                                   | The address of the token holder                                |
| \_clearingOperationType | enum IClearingTypes.ClearingOperationType | Type of clearing operation (Transfer, Redeem, or HoldCreation) |
| \_clearingId            | uint256                                   | Identifier of the clearing operation                           |

#### Returns

| Name         | Type    | Description                                   |
| ------------ | ------- | --------------------------------------------- |
| thirdParty\_ | address | Address that initiated the clearing operation |

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

### initializeClearing

```solidity
function initializeClearing(bool _activateClearing) external nonpayable
```

Initializes the clearing module with the given activation state

_Can only be called once per token; subsequent calls revert with `FacetAlreadyRegistered`_

#### Parameters

| Name               | Type | Description                                            |
| ------------------ | ---- | ------------------------------------------------------ |
| \_activateClearing | bool | Whether clearing should be activated on initialization |

### isClearingActivated

```solidity
function isClearingActivated() external view returns (bool)
```

Returns whether the clearing functionality is activated or not

#### Returns

| Name | Type | Description                        |
| ---- | ---- | ---------------------------------- |
| \_0  | bool | True if activated, false otherwise |

## Events

### ClearedHoldByPartition

```solidity
event ClearedHoldByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 clearingId, IHoldTypes.Hold hold, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when a token holder registers a clearing-guarded hold creation on a partition.

#### Parameters

| Name                  | Type            | Description                                                         |
| --------------------- | --------------- | ------------------------------------------------------------------- |
| operator `indexed`    | address         | Address that submitted the clearing operation.                      |
| tokenHolder `indexed` | address         | Address of the holder whose tokens are to be placed under hold.     |
| partition             | bytes32         | ERC-1400 partition the tokens belong to.                            |
| clearingId            | uint256         | Sequential identifier for the registered operation.                 |
| hold                  | IHoldTypes.Hold | Hold parameters that will be used on approval.                      |
| expirationDate        | uint256         | Unix timestamp after which the clearing operation may be reclaimed. |
| data                  | bytes           | Caller-supplied data attached to the operation.                     |
| operatorData          | bytes           | Data provided by the operator.                                      |

### ClearedHoldFromByPartition

```solidity
event ClearedHoldFromByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 clearingId, IHoldTypes.Hold hold, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when a clearing-guarded hold creation is registered on behalf of a token holder via `holdFromByPartition`.

#### Parameters

| Name                  | Type            | Description                                                            |
| --------------------- | --------------- | ---------------------------------------------------------------------- |
| operator `indexed`    | address         | Address that submitted the clearing operation on behalf of the holder. |
| tokenHolder `indexed` | address         | Address of the holder whose tokens are to be placed under hold.        |
| partition             | bytes32         | ERC-1400 partition the tokens belong to.                               |
| clearingId            | uint256         | Sequential identifier for the registered operation.                    |
| hold                  | IHoldTypes.Hold | Hold parameters that will be used on approval.                         |
| expirationDate        | uint256         | Unix timestamp after which the clearing operation may be reclaimed.    |
| data                  | bytes           | Caller-supplied data attached to the operation.                        |
| operatorData          | bytes           | Data provided by the operator.                                         |

### ClearedOperatorRedeemByPartition

```solidity
event ClearedOperatorRedeemByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 clearingId, uint256 amount, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when an operator registers a clearing-guarded redemption using operator-level permissions.

#### Parameters

| Name                  | Type    | Description                                                |
| --------------------- | ------- | ---------------------------------------------------------- |
| operator `indexed`    | address | Authorised operator that submitted the clearing operation. |
| tokenHolder `indexed` | address | Address of the holder whose tokens are pending redemption. |
| partition             | bytes32 | ERC-1400 partition the tokens belong to.                   |
| clearingId            | uint256 | Sequential identifier for the registered operation.        |
| amount                | uint256 | Token quantity pending redemption.                         |
| expirationDate        | uint256 | Unix timestamp after which the operation may be reclaimed. |
| data                  | bytes   | Caller-supplied data attached to the operation.            |
| operatorData          | bytes   | Data provided by the operator.                             |

### ClearedOperatorTransferByPartition

```solidity
event ClearedOperatorTransferByPartition(address indexed operator, address indexed tokenHolder, address indexed to, bytes32 partition, uint256 clearingId, uint256 amount, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when an operator registers a clearing-guarded transfer using operator-level permissions.

#### Parameters

| Name                  | Type    | Description                                                |
| --------------------- | ------- | ---------------------------------------------------------- |
| operator `indexed`    | address | Authorised operator that submitted the clearing operation. |
| tokenHolder `indexed` | address | Address of the holder whose tokens are pending transfer.   |
| to `indexed`          | address | Intended recipient of the tokens upon approval.            |
| partition             | bytes32 | ERC-1400 partition the tokens belong to.                   |
| clearingId            | uint256 | Sequential identifier for the registered operation.        |
| amount                | uint256 | Token quantity pending transfer.                           |
| expirationDate        | uint256 | Unix timestamp after which the operation may be reclaimed. |
| data                  | bytes   | Caller-supplied data attached to the operation.            |
| operatorData          | bytes   | Data provided by the operator.                             |

### ClearedRedeemByPartition

```solidity
event ClearedRedeemByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 clearingId, uint256 amount, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when a token holder registers a clearing-guarded redemption on a partition.

#### Parameters

| Name                  | Type    | Description                                                |
| --------------------- | ------- | ---------------------------------------------------------- |
| operator `indexed`    | address | Address that submitted the clearing operation.             |
| tokenHolder `indexed` | address | Address of the holder whose tokens are pending redemption. |
| partition             | bytes32 | ERC-1400 partition the tokens belong to.                   |
| clearingId            | uint256 | Sequential identifier for the registered operation.        |
| amount                | uint256 | Token quantity pending redemption.                         |
| expirationDate        | uint256 | Unix timestamp after which the operation may be reclaimed. |
| data                  | bytes   | Caller-supplied data attached to the operation.            |
| operatorData          | bytes   | Data provided by the operator.                             |

### ClearedRedeemFromByPartition

```solidity
event ClearedRedeemFromByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 clearingId, uint256 amount, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when a clearing-guarded redemption is registered on behalf of a token holder via `redeemFromByPartition`.

#### Parameters

| Name                  | Type    | Description                                                            |
| --------------------- | ------- | ---------------------------------------------------------------------- |
| operator `indexed`    | address | Address that submitted the clearing operation on behalf of the holder. |
| tokenHolder `indexed` | address | Address of the holder whose tokens are pending redemption.             |
| partition             | bytes32 | ERC-1400 partition the tokens belong to.                               |
| clearingId            | uint256 | Sequential identifier for the registered operation.                    |
| amount                | uint256 | Token quantity pending redemption.                                     |
| expirationDate        | uint256 | Unix timestamp after which the operation may be reclaimed.             |
| data                  | bytes   | Caller-supplied data attached to the operation.                        |
| operatorData          | bytes   | Data provided by the operator.                                         |

### ClearedTransferByPartition

```solidity
event ClearedTransferByPartition(address indexed operator, address indexed tokenHolder, address indexed to, bytes32 partition, uint256 clearingId, uint256 amount, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when a token holder registers a clearing-guarded transfer on a partition.

#### Parameters

| Name                  | Type    | Description                                                |
| --------------------- | ------- | ---------------------------------------------------------- |
| operator `indexed`    | address | Address that submitted the clearing operation.             |
| tokenHolder `indexed` | address | Address of the holder whose tokens are pending transfer.   |
| to `indexed`          | address | Intended recipient of the tokens upon approval.            |
| partition             | bytes32 | ERC-1400 partition the tokens belong to.                   |
| clearingId            | uint256 | Sequential identifier for the registered operation.        |
| amount                | uint256 | Token quantity pending transfer.                           |
| expirationDate        | uint256 | Unix timestamp after which the operation may be reclaimed. |
| data                  | bytes   | Caller-supplied data attached to the operation.            |
| operatorData          | bytes   | Data provided by the operator.                             |

### ClearedTransferFromByPartition

```solidity
event ClearedTransferFromByPartition(address indexed operator, address indexed tokenHolder, address indexed to, bytes32 partition, uint256 clearingId, uint256 amount, uint256 expirationDate, bytes data, bytes operatorData)
```

Emitted when a clearing-guarded transfer is registered on behalf of a token holder via `transferFromByPartition`.

#### Parameters

| Name                  | Type    | Description                                                            |
| --------------------- | ------- | ---------------------------------------------------------------------- |
| operator `indexed`    | address | Address that submitted the clearing operation on behalf of the holder. |
| tokenHolder `indexed` | address | Address of the holder whose tokens are pending transfer.               |
| to `indexed`          | address | Intended recipient of the tokens upon approval.                        |
| partition             | bytes32 | ERC-1400 partition the tokens belong to.                               |
| clearingId            | uint256 | Sequential identifier for the registered operation.                    |
| amount                | uint256 | Token quantity pending transfer.                                       |
| expirationDate        | uint256 | Unix timestamp after which the operation may be reclaimed.             |
| data                  | bytes   | Caller-supplied data attached to the operation.                        |
| operatorData          | bytes   | Data provided by the operator.                                         |

### ClearingActivated

```solidity
event ClearingActivated(address indexed operator)
```

Emitted when the clearing feature is enabled for the token.

#### Parameters

| Name               | Type    | Description                                           |
| ------------------ | ------- | ----------------------------------------------------- |
| operator `indexed` | address | Address of the administrator that activated clearing. |

### ClearingDeactivated

```solidity
event ClearingDeactivated(address indexed operator)
```

Emitted when the clearing feature is disabled for the token.

#### Parameters

| Name               | Type    | Description                                             |
| ------------------ | ------- | ------------------------------------------------------- |
| operator `indexed` | address | Address of the administrator that deactivated clearing. |

### ClearingInitialized

```solidity
event ClearingInitialized(bool clearingActive)
```

Emitted once when the clearing module is initialised on a token.

_Fires exclusively from `initializeClearing` after the storage write succeeds._

#### Parameters

| Name           | Type | Description |
| -------------- | ---- | ----------- |
| clearingActive | bool | undefined   |

### ClearingOperationApproved

```solidity
event ClearingOperationApproved(address indexed operator, address indexed tokenHolder, bytes32 indexed partition, uint256 clearingId, enum IClearingTypes.ClearingOperationType clearingOperationType, bytes operationData)
```

Emitted when a pending clearing operation is approved and the underlying token operation is executed.

#### Parameters

| Name                  | Type                                      | Description                                             |
| --------------------- | ----------------------------------------- | ------------------------------------------------------- |
| operator `indexed`    | address                                   | Address that approved the operation.                    |
| tokenHolder `indexed` | address                                   | Address of the holder whose tokens were pending.        |
| partition `indexed`   | bytes32                                   | ERC-1400 partition the tokens belong to.                |
| clearingId            | uint256                                   | Sequential identifier of the approved operation.        |
| clearingOperationType | enum IClearingTypes.ClearingOperationType | Discriminant indicating the kind of operation approved. |
| operationData         | bytes                                     | Encoded data forwarded to the underlying token call.    |

### ClearingOperationCanceled

```solidity
event ClearingOperationCanceled(address indexed operator, address indexed tokenHolder, bytes32 indexed partition, uint256 clearingId, enum IClearingTypes.ClearingOperationType clearingOperationType)
```

Emitted when a pending clearing operation is cancelled before it expires.

#### Parameters

| Name                  | Type                                      | Description                                              |
| --------------------- | ----------------------------------------- | -------------------------------------------------------- |
| operator `indexed`    | address                                   | Address that cancelled the operation.                    |
| tokenHolder `indexed` | address                                   | Address of the holder whose tokens were pending.         |
| partition `indexed`   | bytes32                                   | ERC-1400 partition the tokens belong to.                 |
| clearingId            | uint256                                   | Sequential identifier of the cancelled operation.        |
| clearingOperationType | enum IClearingTypes.ClearingOperationType | Discriminant indicating the kind of operation cancelled. |

### ClearingOperationReclaimed

```solidity
event ClearingOperationReclaimed(address indexed operator, address indexed tokenHolder, bytes32 indexed partition, uint256 clearingId, enum IClearingTypes.ClearingOperationType clearingOperationType)
```

Emitted when an expired clearing operation is reclaimed, releasing the locked tokens back to the holder.

#### Parameters

| Name                  | Type                                      | Description                                              |
| --------------------- | ----------------------------------------- | -------------------------------------------------------- |
| operator `indexed`    | address                                   | Address that reclaimed the operation.                    |
| tokenHolder `indexed` | address                                   | Address of the holder whose tokens were pending.         |
| partition `indexed`   | bytes32                                   | ERC-1400 partition the tokens belong to.                 |
| clearingId            | uint256                                   | Sequential identifier of the reclaimed operation.        |
| clearingOperationType | enum IClearingTypes.ClearingOperationType | Discriminant indicating the kind of operation reclaimed. |

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

### ClearingIsActivated

```solidity
error ClearingIsActivated()
```

Thrown when an administration action requires clearing to be inactive but it is currently enabled.

### ClearingIsDisabled

```solidity
error ClearingIsDisabled()
```

Thrown when a clearing-dependent operation is attempted while the clearing feature is disabled on the token.

### Deactivated

```solidity
error Deactivated()
```

Thrown when an operation guarded by `onlyActivated` is attempted on a token whose deactivation flag has already been set.

### ExpirationDateNotReached

```solidity
error ExpirationDateNotReached()
```

Thrown when an action requires the clearing operation to have expired (e.g., a reclaim attempt) but the expiration timestamp has not yet passed.

### ExpirationDateReached

```solidity
error ExpirationDateReached()
```

Thrown when an action requires the clearing operation to still be within its validity window but its expiration timestamp has already passed.

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

### InvalidClearingAmount

```solidity
error InvalidClearingAmount()
```

Thrown when the token amount supplied for a clearing operation is invalid (e.g., zero or exceeding the holder&#39;s available balance).

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.

### WrongClearingId

```solidity
error WrongClearingId()
```

Thrown when the supplied `clearingId` does not correspond to an existing or active clearing operation for the given holder and partition.
