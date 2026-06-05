# ClearingByPartitionFacet

_Asset Tokenization Studio Team_

> ClearingByPartitionFacet

Diamond facet that exposes the partition-scoped clearing operations: approve, cancel, reclaim, clearing redeem/transfer creation and their associated read queries.

_Registers 12 selectors under RESOLVER_KEY_CLEARING_BY_PARTITION. All mutation functions require clearing to be activated and the token to be unpaused._

## Methods

### approveClearingOperationByPartition

```solidity
function approveClearingOperationByPartition(IClearingTypes.ClearingOperationIdentifier _clearingOperationIdentifier) external nonpayable returns (bool success_, bytes32 partition_)
```

#### Parameters

| Name                          | Type                                       | Description |
| ----------------------------- | ------------------------------------------ | ----------- |
| \_clearingOperationIdentifier | IClearingTypes.ClearingOperationIdentifier | undefined   |

#### Returns

| Name        | Type    | Description |
| ----------- | ------- | ----------- |
| success\_   | bool    | undefined   |
| partition\_ | bytes32 | undefined   |

### cancelClearingOperationByPartition

```solidity
function cancelClearingOperationByPartition(IClearingTypes.ClearingOperationIdentifier _clearingOperationIdentifier) external nonpayable returns (bool success_)
```

#### Parameters

| Name                          | Type                                       | Description |
| ----------------------------- | ------------------------------------------ | ----------- |
| \_clearingOperationIdentifier | IClearingTypes.ClearingOperationIdentifier | undefined   |

#### Returns

| Name      | Type | Description |
| --------- | ---- | ----------- |
| success\_ | bool | undefined   |

### clearingRedeemByPartition

```solidity
function clearingRedeemByPartition(IClearingTypes.ClearingOperation _clearingOperation, uint256 _amount) external nonpayable returns (bool success_, uint256 clearingId_)
```

#### Parameters

| Name                | Type                             | Description |
| ------------------- | -------------------------------- | ----------- |
| \_clearingOperation | IClearingTypes.ClearingOperation | undefined   |
| \_amount            | uint256                          | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| success\_    | bool    | undefined   |
| clearingId\_ | uint256 | undefined   |

### clearingRedeemFromByPartition

```solidity
function clearingRedeemFromByPartition(IClearingTypes.ClearingOperationFrom _clearingOperationFrom, uint256 _amount) external nonpayable returns (bool success_, uint256 clearingId_)
```

#### Parameters

| Name                    | Type                                 | Description |
| ----------------------- | ------------------------------------ | ----------- |
| \_clearingOperationFrom | IClearingTypes.ClearingOperationFrom | undefined   |
| \_amount                | uint256                              | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| success\_    | bool    | undefined   |
| clearingId\_ | uint256 | undefined   |

### clearingTransferByPartition

```solidity
function clearingTransferByPartition(IClearingTypes.ClearingOperation _clearingOperation, uint256 _amount, address _to) external nonpayable returns (bool success_, uint256 clearingId_)
```

#### Parameters

| Name                | Type                             | Description |
| ------------------- | -------------------------------- | ----------- |
| \_clearingOperation | IClearingTypes.ClearingOperation | undefined   |
| \_amount            | uint256                          | undefined   |
| \_to                | address                          | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| success\_    | bool    | undefined   |
| clearingId\_ | uint256 | undefined   |

### clearingTransferFromByPartition

```solidity
function clearingTransferFromByPartition(IClearingTypes.ClearingOperationFrom _clearingOperationFrom, uint256 _amount, address _to) external nonpayable returns (bool success_, uint256 clearingId_)
```

#### Parameters

| Name                    | Type                                 | Description |
| ----------------------- | ------------------------------------ | ----------- |
| \_clearingOperationFrom | IClearingTypes.ClearingOperationFrom | undefined   |
| \_amount                | uint256                              | undefined   |
| \_to                    | address                              | undefined   |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| success\_    | bool    | undefined   |
| clearingId\_ | uint256 | undefined   |

### getClearedAmountForByPartition

```solidity
function getClearedAmountForByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256 amount_)
```

Gets the total cleared amount for a token holder by partition

#### Parameters

| Name          | Type    | Description                     |
| ------------- | ------- | ------------------------------- |
| \_partition   | bytes32 | The partition of the token      |
| \_tokenHolder | address | The address of the token holder |

#### Returns

| Name     | Type    | Description                                                        |
| -------- | ------- | ------------------------------------------------------------------ |
| amount\_ | uint256 | Total amount of tokens currently locked in clearing for the holder |

### getClearingCountForByPartition

```solidity
function getClearingCountForByPartition(bytes32 _partition, address _tokenHolder, enum IClearingTypes.ClearingOperationType _clearingOperationType) external view returns (uint256 clearingCount_)
```

Gets the total clearing count for a token holder by partition and clearing operation type

#### Parameters

| Name                    | Type                                      | Description                                                    |
| ----------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| \_partition             | bytes32                                   | The partition of the token                                     |
| \_tokenHolder           | address                                   | The address of the token holder                                |
| \_clearingOperationType | enum IClearingTypes.ClearingOperationType | Type of clearing operation (Transfer, Redeem, or HoldCreation) |

#### Returns

| Name            | Type    | Description                                            |
| --------------- | ------- | ------------------------------------------------------ |
| clearingCount\_ | uint256 | Number of active clearing operations of the given type |

### getClearingRedeemForByPartition

```solidity
function getClearingRedeemForByPartition(bytes32 _partition, address _tokenHolder, uint256 _clearingId) external view returns (struct IClearingTypes.ClearingRedeemData clearingRedeemData_)
```

Gets the clearing redeem data for a given partition, token holder and clearing ID

#### Parameters

| Name          | Type    | Description                      |
| ------------- | ------- | -------------------------------- |
| \_partition   | bytes32 | The partition of the token       |
| \_tokenHolder | address | The address of the token holder  |
| \_clearingId  | uint256 | The ID of the clearing operation |

#### Returns

| Name                 | Type                              | Description              |
| -------------------- | --------------------------------- | ------------------------ |
| clearingRedeemData\_ | IClearingTypes.ClearingRedeemData | The clearing redeem data |

### getClearingTransferForByPartition

```solidity
function getClearingTransferForByPartition(bytes32 _partition, address _tokenHolder, uint256 _clearingId) external view returns (struct IClearingTypes.ClearingTransferData clearingTransferData_)
```

Gets the clearing transfer data for a given partition, token holder and clearing ID

#### Parameters

| Name          | Type    | Description                      |
| ------------- | ------- | -------------------------------- |
| \_partition   | bytes32 | The partition of the token       |
| \_tokenHolder | address | The address of the token holder  |
| \_clearingId  | uint256 | The ID of the clearing operation |

#### Returns

| Name                   | Type                                | Description                |
| ---------------------- | ----------------------------------- | -------------------------- |
| clearingTransferData\_ | IClearingTypes.ClearingTransferData | The clearing transfer data |

### getClearingsIdForByPartition

```solidity
function getClearingsIdForByPartition(bytes32 _partition, address _tokenHolder, enum IClearingTypes.ClearingOperationType _clearingOperationType, uint256 _pageIndex, uint256 _pageLength) external view returns (uint256[] clearingsId_)
```

Gets the ids of the clearings for a token holder by partition and clearing operation type

#### Parameters

| Name                    | Type                                      | Description                                                    |
| ----------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| \_partition             | bytes32                                   | The partition of the token                                     |
| \_tokenHolder           | address                                   | The address of the token holder                                |
| \_clearingOperationType | enum IClearingTypes.ClearingOperationType | Type of clearing operation (Transfer, Redeem, or HoldCreation) |
| \_pageIndex             | uint256                                   | Zero-based page index for pagination                           |
| \_pageLength            | uint256                                   | Maximum number of IDs to return per page                       |

#### Returns

| Name          | Type      | Description                                        |
| ------------- | --------- | -------------------------------------------------- |
| clearingsId\_ | uint256[] | Array of clearing operation IDs for the given page |

### getStaticFunctionSelectors

```solidity
function getStaticFunctionSelectors() external pure returns (bytes4[] staticFunctionSelectors_)
```

Gets all function selectors of a facet

#### Returns

| Name                      | Type     | Description              |
| ------------------------- | -------- | ------------------------ |
| staticFunctionSelectors\_ | bytes4[] | Face functions selectors |

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

### initializeClearingByPartition

```solidity
function initializeClearingByPartition() external nonpayable
```

Initialises the clearing-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### reclaimClearingOperationByPartition

```solidity
function reclaimClearingOperationByPartition(IClearingTypes.ClearingOperationIdentifier _clearingOperationIdentifier) external nonpayable returns (bool success_)
```

#### Parameters

| Name                          | Type                                       | Description |
| ----------------------------- | ------------------------------------------ | ----------- |
| \_clearingOperationIdentifier | IClearingTypes.ClearingOperationIdentifier | undefined   |

#### Returns

| Name      | Type | Description |
| --------- | ---- | ----------- |
| success\_ | bool | undefined   |

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

### ClearingByPartitionInitialized

```solidity
event ClearingByPartitionInitialized()
```

Emitted once when the clearing-by-partition capability is initialised on a token.

_Fires exclusively from `initializeClearingByPartition`._

### ClearingDeactivated

```solidity
event ClearingDeactivated(address indexed operator)
```

Emitted when the clearing feature is disabled for the token.

#### Parameters

| Name               | Type    | Description                                             |
| ------------------ | ------- | ------------------------------------------------------- |
| operator `indexed` | address | Address of the administrator that deactivated clearing. |

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

### AccessControlRequired

```solidity
error AccessControlRequired(bytes32 role, address sender)
```

_Emitted when a role check fails_

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| role   | bytes32 | undefined   |
| sender | address | undefined   |

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

### PartitionNotAllowedInSinglePartitionMode

```solidity
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition)
```

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| partition | bytes32 | undefined   |

### PartitionsAreProtectedAndNoRole

```solidity
error PartitionsAreProtectedAndNoRole(address account, bytes32 role)
```

Reverts when a transfer is attempted while partitions are protected and the caller does not hold the required partition role.

#### Parameters

| Name    | Type    | Description                                      |
| ------- | ------- | ------------------------------------------------ |
| account | address | The caller lacking the required role.            |
| role    | bytes32 | The role that would have been needed to proceed. |

### WalletRecovered

```solidity
error WalletRecovered()
```

### WrongClearingId

```solidity
error WrongClearingId()
```

Thrown when the supplied `clearingId` does not correspond to an existing or active clearing operation for the given holder and partition.

### WrongExpirationTimestamp

```solidity
error WrongExpirationTimestamp()
```

Reverts when an expiration timestamp is invalid.

_Used for expired, past, or otherwise unacceptable expiration values._

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._
