# OperatorByPartition

_Asset Tokenization Studio Team_

> OperatorByPartition

Abstract implementation of `IOperatorByPartition`.

_Storage reads and writes delegate to `ERC1410StorageWrapper`. Token-lifecycle operations (operator transfer and redemption) are orchestrated via `TokenCoreOps`. Intended to be inherited solely by `OperatorByPartitionFacet`._

## Methods

### authorizeOperatorByPartition

```solidity
function authorizeOperatorByPartition(bytes32 _partition, address _operator) external nonpayable
```

Authorises an operator to manage a specific partition of `msg.sender`&#39;s tokens.

_The token must not be paused. Both `msg.sender` and `_operator` must pass compliance checks. Reverts when the partition is incompatible with the token&#39;s partition mode (single-partition tokens only accept the default partition). Emits {AuthorizedOperatorByPartition} via `ERC1410StorageWrapper.authorizeOperatorByPartition`._

#### Parameters

| Name        | Type    | Description                                   |
| ----------- | ------- | --------------------------------------------- |
| \_partition | bytes32 | The partition the operator is authorised for. |
| \_operator  | address | The address being authorised as operator.     |

### initializeOperatorByPartition

```solidity
function initializeOperatorByPartition() external nonpayable
```

Initialises the operator-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### isOperatorForPartition

```solidity
function isOperatorForPartition(bytes32 _partition, address _operator, address _tokenHolder) external view returns (bool)
```

Returns whether `_operator` is an authorised operator for a specific partition of `_tokenHolder`.

_Returns `true` if `_operator` has been authorised for all partitions of `_tokenHolder` (via `authorizeOperator`) OR has explicit per-partition approval (via `authorizeOperatorByPartition`). Read-only; no access control applied._

#### Parameters

| Name          | Type    | Description                                        |
| ------------- | ------- | -------------------------------------------------- |
| \_partition   | bytes32 | The partition to query.                            |
| \_operator    | address | The operator address to check.                     |
| \_tokenHolder | address | The token holder whose partition is being queried. |

#### Returns

| Name | Type | Description                                                                  |
| ---- | ---- | ---------------------------------------------------------------------------- |
| \_0  | bool | bool `true` if `_operator` is authorised for `_partition` of `_tokenHolder`. |

### operatorRedeemByPartition

```solidity
function operatorRedeemByPartition(bytes32 _partition, address _tokenHolder, uint256 _value, bytes _data, bytes _operatorData) external nonpayable
```

Decreases the total supply and the partition balance of a token holder on behalf of an authorised operator.

_Emits {RedeemedByPartition} via TokenCoreOps.redeemByPartition._

#### Parameters

| Name           | Type    | Description                                                   |
| -------------- | ------- | ------------------------------------------------------------- |
| \_partition    | bytes32 | The partition from which tokens are redeemed.                 |
| \_tokenHolder  | address | The address whose tokens are redeemed.                        |
| \_value        | uint256 | The number of tokens to redeem.                               |
| \_data         | bytes   | Additional data attached to the redemption (passed to hooks). |
| \_operatorData | bytes   | Additional data attached by the operator.                     |

### operatorTransferByPartition

```solidity
function operatorTransferByPartition(IERC1410Types.OperatorTransferData _operatorTransferData) external nonpayable returns (bytes32)
```

#### Parameters

| Name                   | Type                               | Description |
| ---------------------- | ---------------------------------- | ----------- |
| \_operatorTransferData | IERC1410Types.OperatorTransferData | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | bytes32 | undefined   |

### revokeOperatorByPartition

```solidity
function revokeOperatorByPartition(bytes32 _partition, address _operator) external nonpayable
```

Revokes a previously authorised operator from a specific partition of `msg.sender`&#39;s tokens.

_Emits {RevokedOperatorByPartition} via ERC1410StorageWrapper.revokeOperatorByPartition._

#### Parameters

| Name        | Type    | Description                                             |
| ----------- | ------- | ------------------------------------------------------- |
| \_partition | bytes32 | The partition from which the operator is de-authorised. |
| \_operator  | address | The address being de-authorised.                        |

## Events

### AuthorizedOperator

```solidity
event AuthorizedOperator(address indexed operator, address indexed tokenHolder)
```

#### Parameters

| Name                  | Type    | Description |
| --------------------- | ------- | ----------- |
| operator `indexed`    | address | undefined   |
| tokenHolder `indexed` | address | undefined   |

### AuthorizedOperatorByPartition

```solidity
event AuthorizedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder)
```

#### Parameters

| Name                  | Type    | Description |
| --------------------- | ------- | ----------- |
| partition `indexed`   | bytes32 | undefined   |
| operator `indexed`    | address | undefined   |
| tokenHolder `indexed` | address | undefined   |

### IssuedByPartition

```solidity
event IssuedByPartition(bytes32 indexed partition, address indexed operator, address indexed to, uint256 value, bytes data)
```

#### Parameters

| Name                | Type    | Description |
| ------------------- | ------- | ----------- |
| partition `indexed` | bytes32 | undefined   |
| operator `indexed`  | address | undefined   |
| to `indexed`        | address | undefined   |
| value               | uint256 | undefined   |
| data                | bytes   | undefined   |

### OperatorByPartitionInitialized

```solidity
event OperatorByPartitionInitialized()
```

Emitted once when the operator-by-partition capability is initialised on a token.

_Fires exclusively from `initializeOperatorByPartition`._

### RedeemedByPartition

```solidity
event RedeemedByPartition(bytes32 indexed partition, address indexed operator, address indexed from, uint256 value, bytes data, bytes operatorData)
```

#### Parameters

| Name                | Type    | Description |
| ------------------- | ------- | ----------- |
| partition `indexed` | bytes32 | undefined   |
| operator `indexed`  | address | undefined   |
| from `indexed`      | address | undefined   |
| value               | uint256 | undefined   |
| data                | bytes   | undefined   |
| operatorData        | bytes   | undefined   |

### RevokedOperator

```solidity
event RevokedOperator(address indexed operator, address indexed tokenHolder)
```

#### Parameters

| Name                  | Type    | Description |
| --------------------- | ------- | ----------- |
| operator `indexed`    | address | undefined   |
| tokenHolder `indexed` | address | undefined   |

### RevokedOperatorByPartition

```solidity
event RevokedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder)
```

#### Parameters

| Name                  | Type    | Description |
| --------------------- | ------- | ----------- |
| partition `indexed`   | bytes32 | undefined   |
| operator `indexed`    | address | undefined   |
| tokenHolder `indexed` | address | undefined   |

### TransferByPartition

```solidity
event TransferByPartition(bytes32 indexed _fromPartition, address _operator, address indexed _from, address indexed _to, uint256 _value, bytes _data, bytes _operatorData)
```

#### Parameters

| Name                      | Type    | Description |
| ------------------------- | ------- | ----------- |
| \_fromPartition `indexed` | bytes32 | undefined   |
| \_operator                | address | undefined   |
| \_from `indexed`          | address | undefined   |
| \_to `indexed`            | address | undefined   |
| \_value                   | uint256 | undefined   |
| \_data                    | bytes   | undefined   |
| \_operatorData            | bytes   | undefined   |

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

### InvalidPartition

```solidity
error InvalidPartition(address account, bytes32 partition)
```

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| account   | address | undefined   |
| partition | bytes32 | undefined   |

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).

### NotAllowedInMultiPartitionMode

```solidity
error NotAllowedInMultiPartitionMode()
```

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

### TokenHolderNotFound

```solidity
error TokenHolderNotFound(address tokenHolder)
```

#### Parameters

| Name        | Type    | Description |
| ----------- | ------- | ----------- |
| tokenHolder | address | undefined   |

### Unauthorized

```solidity
error Unauthorized(address operator, address tokenHolder, bytes32 partition)
```

#### Parameters

| Name        | Type    | Description |
| ----------- | ------- | ----------- |
| operator    | address | undefined   |
| tokenHolder | address | undefined   |
| partition   | bytes32 | undefined   |

### ZeroAddressNotAllowed

```solidity
error ZeroAddressNotAllowed()
```

Reverts when the zero address is supplied where it is not permitted.

_Prevents invalid account, contract, or recipient references._

### ZeroPartition

```solidity
error ZeroPartition()
```

### ZeroValue

```solidity
error ZeroValue()
```
