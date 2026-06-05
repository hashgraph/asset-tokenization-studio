# IOperatorByPartition

_Asset Tokenization Studio Team_

> IOperatorByPartition

Interface for per-partition operator management: authorise, revoke, and query operators scoped to individual token partitions, and execute operator-initiated transfers and redemptions on those partitions.

_All storage reads and writes delegate to `ERC1410StorageWrapper`. Events (`AuthorizedOperatorByPartition`, `RevokedOperatorByPartition`, `TransferByPartition`, `RedeemedByPartition`) are inherited from `IERC1410Types` and emitted by the storage wrapper or `TokenCoreOps` respectively._

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

_The caller must be an authorised operator for `_partition` of `_tokenHolder`. Enforces partition-mode rules, unprotected-partition restrictions, and redemption-eligibility checks. Emits {RedeemedByPartition} via `TokenCoreOps.redeemByPartition`._

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

_The token must not be paused. `msg.sender` and `_operator` must be identified addresses and both must pass compliance checks. Reverts when the partition is incompatible with the token&#39;s partition mode. Emits {RevokedOperatorByPartition} via `ERC1410StorageWrapper.revokeOperatorByPartition`._

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

Emitted when an operator is authorised to manage all partitions of a token holder.

#### Parameters

| Name                  | Type    | Description                                 |
| --------------------- | ------- | ------------------------------------------- |
| operator `indexed`    | address | Newly authorised operator address.          |
| tokenHolder `indexed` | address | Token holder who granted the authorisation. |

### AuthorizedOperatorByPartition

```solidity
event AuthorizedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder)
```

Emitted when an operator is authorised for a specific partition of a token holder.

#### Parameters

| Name                  | Type    | Description                                 |
| --------------------- | ------- | ------------------------------------------- |
| partition `indexed`   | bytes32 | Partition the authorisation applies to.     |
| operator `indexed`    | address | Newly authorised operator address.          |
| tokenHolder `indexed` | address | Token holder who granted the authorisation. |

### IssuedByPartition

```solidity
event IssuedByPartition(bytes32 indexed partition, address indexed operator, address indexed to, uint256 value, bytes data)
```

Emitted when new tokens are issued into a partition.

#### Parameters

| Name                | Type    | Description                                    |
| ------------------- | ------- | ---------------------------------------------- |
| partition `indexed` | bytes32 | Partition the tokens were issued into.         |
| operator `indexed`  | address | Address that performed the issuance.           |
| to `indexed`        | address | Recipient of the issued tokens.                |
| value               | uint256 | Token quantity issued.                         |
| data                | bytes   | Caller-supplied data attached to the issuance. |

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

Emitted when tokens are redeemed from a partition.

#### Parameters

| Name                | Type    | Description                                        |
| ------------------- | ------- | -------------------------------------------------- |
| partition `indexed` | bytes32 | Partition the tokens were redeemed from.           |
| operator `indexed`  | address | Address that performed the redemption.             |
| from `indexed`      | address | Token holder whose tokens were redeemed.           |
| value               | uint256 | Token quantity redeemed.                           |
| data                | bytes   | Caller-supplied data attached to the redemption.   |
| operatorData        | bytes   | Operator-supplied data attached to the redemption. |

### RevokedOperator

```solidity
event RevokedOperator(address indexed operator, address indexed tokenHolder)
```

Emitted when an operator&#39;s authorisation over all partitions of a token holder is revoked.

#### Parameters

| Name                  | Type    | Description                                 |
| --------------------- | ------- | ------------------------------------------- |
| operator `indexed`    | address | Operator whose authorisation was revoked.   |
| tokenHolder `indexed` | address | Token holder who revoked the authorisation. |

### RevokedOperatorByPartition

```solidity
event RevokedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder)
```

Emitted when an operator&#39;s authorisation for a specific partition of a token holder is revoked.

#### Parameters

| Name                  | Type    | Description                                 |
| --------------------- | ------- | ------------------------------------------- |
| partition `indexed`   | bytes32 | Partition the revocation applies to.        |
| operator `indexed`    | address | Operator whose authorisation was revoked.   |
| tokenHolder `indexed` | address | Token holder who revoked the authorisation. |

### TransferByPartition

```solidity
event TransferByPartition(bytes32 indexed _fromPartition, address _operator, address indexed _from, address indexed _to, uint256 _value, bytes _data, bytes _operatorData)
```

Emitted when tokens are transferred from one partition to another or within the same partition.

#### Parameters

| Name                      | Type    | Description                           |
| ------------------------- | ------- | ------------------------------------- |
| \_fromPartition `indexed` | bytes32 | Source partition.                     |
| \_operator                | address | Address that initiated the transfer.  |
| \_from `indexed`          | address | Token holder whose balance decreased. |
| \_to `indexed`            | address | Recipient whose balance increased.    |
| \_value                   | uint256 | Token quantity transferred.           |
| \_data                    | bytes   | Caller-supplied data.                 |
| \_operatorData            | bytes   | Operator-supplied data.               |

## Errors

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

### NotAllowedInMultiPartitionMode

```solidity
error NotAllowedInMultiPartitionMode()
```

Thrown when a single-partition operation is attempted on a multi-partition token.

### PartitionNotAllowedInSinglePartitionMode

```solidity
error PartitionNotAllowedInSinglePartitionMode(bytes32 partition)
```

Thrown when a multi-partition operation specifies a partition not permitted in single-partition mode.

#### Parameters

| Name      | Type    | Description                                      |
| --------- | ------- | ------------------------------------------------ |
| partition | bytes32 | The disallowed partition supplied by the caller. |

### TokenHolderNotFound

```solidity
error TokenHolderNotFound(address tokenHolder)
```

Thrown when an operation targets a token holder address that has no registered balance.

#### Parameters

| Name        | Type    | Description                     |
| ----------- | ------- | ------------------------------- |
| tokenHolder | address | The address that was not found. |

### Unauthorized

```solidity
error Unauthorized(address operator, address tokenHolder, bytes32 partition)
```

Thrown when the caller is not an authorised operator for the token holder on the given partition.

#### Parameters

| Name        | Type    | Description                                   |
| ----------- | ------- | --------------------------------------------- |
| operator    | address | Address that attempted the operation.         |
| tokenHolder | address | Token holder whose tokens were targeted.      |
| partition   | bytes32 | Partition on which authorisation was checked. |

### ZeroPartition

```solidity
error ZeroPartition()
```

Thrown when the zero bytes32 value is supplied as a partition identifier.

### ZeroValue

```solidity
error ZeroValue()
```

Thrown when a zero token amount is supplied to an operation that requires a positive value.
