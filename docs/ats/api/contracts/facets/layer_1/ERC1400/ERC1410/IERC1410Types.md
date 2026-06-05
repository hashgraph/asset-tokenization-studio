# IERC1410Types

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
