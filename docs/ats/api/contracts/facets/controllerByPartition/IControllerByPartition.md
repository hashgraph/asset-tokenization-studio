# IControllerByPartition

> IControllerByPartition

Interface for controller-initiated forced transfers and redemptions on a specific partition.

_Exposes two write methods that allow an authorised controller or agent to forcibly transfer or redeem tokens from any token holder&#39;s balance on a given partition. Both operations require the token to be controllable and not paused, and are restricted to single-partition mode with the default partition._

## Methods

### controllerRedeemByPartition

```solidity
function controllerRedeemByPartition(bytes32 _partition, address _tokenHolder, uint256 _value, bytes _data, bytes _operatorData) external nonpayable
```

Forces a redemption in a partition from a token holder.

_Can only be called by a user with the controller or agent role. The contract must be controllable and not paused. Only valid in single-partition mode with the default partition._

#### Parameters

| Name           | Type    | Description                                                 |
| -------------- | ------- | ----------------------------------------------------------- |
| \_partition    | bytes32 | The partition from which tokens are redeemed.               |
| \_tokenHolder  | address | The address whose tokens are redeemed.                      |
| \_value        | uint256 | The amount of tokens to redeem.                             |
| \_data         | bytes   | Additional data attached to the redemption.                 |
| \_operatorData | bytes   | Additional data attached to the redemption by the operator. |

### controllerTransferByPartition

```solidity
function controllerTransferByPartition(bytes32 _partition, address _from, address _to, uint256 _value, bytes _data, bytes _operatorData) external nonpayable returns (bytes32)
```

Forces a transfer in a partition from a token holder to a destination address.

_Can only be called by a user with the controller or agent role. The contract must be controllable and not paused. Only valid in single-partition mode with the default partition._

#### Parameters

| Name           | Type    | Description                                               |
| -------------- | ------- | --------------------------------------------------------- |
| \_partition    | bytes32 | The partition from which tokens are transferred.          |
| \_from         | address | The address from which tokens are transferred.            |
| \_to           | address | The address to which tokens are transferred.              |
| \_value        | uint256 | The amount of tokens to transfer.                         |
| \_data         | bytes   | Additional data attached to the transfer.                 |
| \_operatorData | bytes   | Additional data attached to the transfer by the operator. |

#### Returns

| Name | Type    | Description                                           |
| ---- | ------- | ----------------------------------------------------- |
| \_0  | bytes32 | The partition from which the tokens were transferred. |

### initializeControllerByPartition

```solidity
function initializeControllerByPartition() external nonpayable
```

Initialises the controller by partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

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

### ControllerByPartitionInitialized

```solidity
event ControllerByPartitionInitialized()
```

Emitted once when the controller by partition capability is initialised on a token.

_Fires exclusively from `initializeControllerByPartition`._

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

### InvalidPartition

```solidity
error InvalidPartition(address account, bytes32 partition)
```

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| account   | address | undefined   |
| partition | bytes32 | undefined   |

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

### ZeroPartition

```solidity
error ZeroPartition()
```

### ZeroValue

```solidity
error ZeroValue()
```
