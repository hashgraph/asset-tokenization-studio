# IProtectedPartitions

## Methods

### arePartitionsProtected

```solidity
function arePartitionsProtected() external view returns (bool)
```

Returns whether the protected partitions mode is active

_If true, transfers are restricted to accounts having the required role for the partition_

#### Returns

| Name | Type | Description                                                           |
| ---- | ---- | --------------------------------------------------------------------- |
| \_0  | bool | bool true if the protected partitions mode is active, false otherwise |

### calculateRoleForPartition

```solidity
function calculateRoleForPartition(bytes32 _partition) external pure returns (bytes32 roleForPartition_)
```

Calculates the role required to transfer tokens from a given partition

#### Parameters

| Name        | Type    | Description                             |
| ----------- | ------- | --------------------------------------- |
| \_partition | bytes32 | The partition to calculate the role for |

#### Returns

| Name               | Type    | Description                                                   |
| ------------------ | ------- | ------------------------------------------------------------- |
| roleForPartition\_ | bytes32 | The role required to transfer tokens from the given partition |

### initializeProtectedPartitions

```solidity
function initializeProtectedPartitions(bool _arePartitionsProtected) external nonpayable returns (bool success_)
```

Initialises the protected-partitions capability with the given starting state.

_Called once during token deployment; reverts if the facet has already been registered._

#### Parameters

| Name                     | Type | Description                                                      |
| ------------------------ | ---- | ---------------------------------------------------------------- |
| \_arePartitionsProtected | bool | Initial protection state; `true` enables protection immediately. |

#### Returns

| Name      | Type | Description                                  |
| --------- | ---- | -------------------------------------------- |
| success\_ | bool | Always `true` when the call does not revert. |

### protectPartitions

```solidity
function protectPartitions() external nonpayable returns (bool success_)
```

Activates the protected partitions mode

_Disables the ability to freely transfer tokens unless the sender has the requited role for the partition_

#### Returns

| Name      | Type | Description |
| --------- | ---- | ----------- |
| success\_ | bool | undefined   |

### unprotectPartitions

```solidity
function unprotectPartitions() external nonpayable returns (bool success_)
```

Deactivates the protected partitions mode

_Enables the ability to freely transfer tokens_

#### Returns

| Name      | Type | Description |
| --------- | ---- | ----------- |
| success\_ | bool | undefined   |

## Events

### PartitionsProtected

```solidity
event PartitionsProtected(address indexed operator)
```

Emitted when the protected-partition mode is activated.

#### Parameters

| Name               | Type    | Description                                  |
| ------------------ | ------- | -------------------------------------------- |
| operator `indexed` | address | The address that called `protectPartitions`. |

### PartitionsUnProtected

```solidity
event PartitionsUnProtected(address indexed operator)
```

Emitted when the protected-partition mode is deactivated.

#### Parameters

| Name               | Type    | Description                                    |
| ------------------ | ------- | ---------------------------------------------- |
| operator `indexed` | address | The address that called `unprotectPartitions`. |

### ProtectedPartitionsInitialized

```solidity
event ProtectedPartitionsInitialized(bool arePartitionsProtected)
```

Emitted once when the protected partitions capability is initialised on a token.

_Fires exclusively from `initializeProtectedPartitions` after the storage write succeeds._

#### Parameters

| Name                   | Type | Description                                      |
| ---------------------- | ---- | ------------------------------------------------ |
| arePartitionsProtected | bool | Initial protection state set at deployment time. |

### ProtectedRedeemFrom

```solidity
event ProtectedRedeemFrom(bytes32 indexed partition, address indexed operator, address indexed from, uint256 value, uint256 deadline, uint256 nonce, bytes signature)
```

Emitted when a signature-authorised redemption executes under protected-partition mode.

#### Parameters

| Name                | Type    | Description                                                     |
| ------------------- | ------- | --------------------------------------------------------------- |
| partition `indexed` | bytes32 | Partition from which the tokens are redeemed.                   |
| operator `indexed`  | address | The address that submitted the protected redemption.            |
| from `indexed`      | address | The holder whose tokens are being redeemed; must be the signer. |
| value               | uint256 | Number of tokens redeemed.                                      |
| deadline            | uint256 | Signature validity deadline supplied with the operation.        |
| nonce               | uint256 | Holder nonce consumed by this operation.                        |
| signature           | bytes   | EIP-712 signature provided by the holder.                       |

### ProtectedTransferFrom

```solidity
event ProtectedTransferFrom(bytes32 indexed partition, address indexed operator, address indexed from, address to, uint256 value, uint256 deadline, uint256 nonce, bytes signature)
```

Emitted when a signature-authorised transfer executes under protected-partition mode.

#### Parameters

| Name                | Type    | Description                                                        |
| ------------------- | ------- | ------------------------------------------------------------------ |
| partition `indexed` | bytes32 | Partition from which the tokens are transferred.                   |
| operator `indexed`  | address | The address that submitted the protected transfer.                 |
| from `indexed`      | address | The holder whose tokens are being transferred; must be the signer. |
| to                  | address | Recipient of the transferred tokens.                               |
| value               | uint256 | Number of tokens transferred.                                      |
| deadline            | uint256 | Signature validity deadline supplied with the operation.           |
| nonce               | uint256 | Holder nonce consumed by this operation.                           |
| signature           | bytes   | EIP-712 signature provided by the holder.                          |

## Errors

### PartitionsAreProtected

```solidity
error PartitionsAreProtected()
```

Reverts when an operation that requires unprotected mode is attempted while partitions are protected.

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

### PartitionsAreUnProtected

```solidity
error PartitionsAreUnProtected()
```

Reverts when a protected-mode operation is attempted but partitions are not currently protected.
