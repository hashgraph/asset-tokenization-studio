# IControllerHoldByPartition

> IControllerHoldByPartition

Interface for the controller-initiated hold creation operation on a specific partition.

_Exposes a single write method that allows an authorised controller to place a hold on any token holder&#39;s balance. The `ControllerHeldByPartition` event is inherited from `IHoldTypes`._

## Methods

### controllerCreateHoldByPartition

```solidity
function controllerCreateHoldByPartition(bytes32 _partition, address _from, IHoldTypes.Hold _hold, bytes _operatorData) external nonpayable returns (bool success_, uint256 holdId_)
```

#### Parameters

| Name           | Type            | Description |
| -------------- | --------------- | ----------- |
| \_partition    | bytes32         | undefined   |
| \_from         | address         | undefined   |
| \_hold         | IHoldTypes.Hold | undefined   |
| \_operatorData | bytes           | undefined   |

#### Returns

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| success\_ | bool    | undefined   |
| holdId\_  | uint256 | undefined   |

### initializeControllerHoldByPartition

```solidity
function initializeControllerHoldByPartition() external nonpayable
```

Initialises the controller hold by partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### ControllerHeldByPartition

```solidity
event ControllerHeldByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 holdId, IHoldTypes.Hold hold, bytes operatorData)
```

Emitted when a controller creates a hold on a holder&#39;s behalf.

#### Parameters

| Name                  | Type            | Description                              |
| --------------------- | --------------- | ---------------------------------------- |
| operator `indexed`    | address         | The controller initiating the hold.      |
| tokenHolder `indexed` | address         | The holder whose balance is being held.  |
| partition             | bytes32         | Partition over which the hold is placed. |
| holdId                | uint256         | Sequence id assigned to the hold.        |
| hold                  | IHoldTypes.Hold | The hold definition.                     |
| operatorData          | bytes           | Operator-supplied metadata.              |

### ControllerHoldByPartitionInitialized

```solidity
event ControllerHoldByPartitionInitialized()
```

Emitted once when the controller hold by partition capability is initialised on a token.

_Fires exclusively from `initializeControllerHoldByPartition`._

### HeldByPartition

```solidity
event HeldByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 holdId, IHoldTypes.Hold hold, bytes operatorData)
```

Emitted when a holder creates a hold over its own partitioned balance.

#### Parameters

| Name                  | Type            | Description                                                        |
| --------------------- | --------------- | ------------------------------------------------------------------ |
| operator `indexed`    | address         | The address that initiated the hold (the holder itself).           |
| tokenHolder `indexed` | address         | The holder whose balance is being held.                            |
| partition             | bytes32         | Partition over which the hold is placed.                           |
| holdId                | uint256         | Sequence id assigned to the hold.                                  |
| hold                  | IHoldTypes.Hold | The hold definition (escrow, recipient, expiration, amount, data). |
| operatorData          | bytes           | Operator-supplied metadata.                                        |

### HeldFromByPartition

```solidity
event HeldFromByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 holdId, IHoldTypes.Hold hold, bytes operatorData)
```

Emitted when an authorised third party creates a hold on a holder&#39;s behalf.

#### Parameters

| Name                  | Type            | Description                                                        |
| --------------------- | --------------- | ------------------------------------------------------------------ |
| operator `indexed`    | address         | The third-party caller initiating the hold.                        |
| tokenHolder `indexed` | address         | The holder whose balance is being held.                            |
| partition             | bytes32         | Partition over which the hold is placed.                           |
| holdId                | uint256         | Sequence id assigned to the hold.                                  |
| hold                  | IHoldTypes.Hold | The hold definition (escrow, recipient, expiration, amount, data). |
| operatorData          | bytes           | Operator-supplied metadata.                                        |

### HoldByPartitionExecuted

```solidity
event HoldByPartitionExecuted(address indexed tokenHolder, bytes32 indexed partition, uint256 holdId, uint256 amount, address to)
```

Emitted when an existing hold is executed and balance transferred to a recipient.

#### Parameters

| Name                  | Type    | Description                          |
| --------------------- | ------- | ------------------------------------ |
| tokenHolder `indexed` | address | The holder whose hold was executed.  |
| partition `indexed`   | bytes32 | Partition over which the hold lived. |
| holdId                | uint256 | Sequence id of the executed hold.    |
| amount                | uint256 | Amount released to the recipient.    |
| to                    | address | Recipient of the executed balance.   |

### HoldByPartitionReclaimed

```solidity
event HoldByPartitionReclaimed(address indexed operator, address indexed tokenHolder, bytes32 indexed partition, uint256 holdId, uint256 amount)
```

Emitted when an expired hold is reclaimed by the holder.

#### Parameters

| Name                  | Type    | Description                                            |
| --------------------- | ------- | ------------------------------------------------------ |
| operator `indexed`    | address | The address that triggered the reclaim.                |
| tokenHolder `indexed` | address | The holder receiving the reclaimed balance.            |
| partition `indexed`   | bytes32 | Partition over which the hold lived.                   |
| holdId                | uint256 | Sequence id of the reclaimed hold.                     |
| amount                | uint256 | Amount returned to the holder&#39;s available balance. |

### HoldByPartitionReleased

```solidity
event HoldByPartitionReleased(address indexed tokenHolder, bytes32 indexed partition, uint256 holdId, uint256 amount)
```

Emitted when a hold is partially or fully released back to the holder.

#### Parameters

| Name                  | Type    | Description                                            |
| --------------------- | ------- | ------------------------------------------------------ |
| tokenHolder `indexed` | address | The holder receiving the released balance.             |
| partition `indexed`   | bytes32 | Partition over which the hold lived.                   |
| holdId                | uint256 | Sequence id of the released hold.                      |
| amount                | uint256 | Amount returned to the holder&#39;s available balance. |

### OperatorHeldByPartition

```solidity
event OperatorHeldByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 holdId, IHoldTypes.Hold hold, bytes operatorData)
```

Emitted when an ERC-1410 operator creates a hold on a holder&#39;s behalf.

#### Parameters

| Name                  | Type            | Description                                  |
| --------------------- | --------------- | -------------------------------------------- |
| operator `indexed`    | address         | The authorised operator initiating the hold. |
| tokenHolder `indexed` | address         | The holder whose balance is being held.      |
| partition             | bytes32         | Partition over which the hold is placed.     |
| holdId                | uint256         | Sequence id assigned to the hold.            |
| hold                  | IHoldTypes.Hold | The hold definition.                         |
| operatorData          | bytes           | Operator-supplied metadata.                  |

### ProtectedHeldByPartition

```solidity
event ProtectedHeldByPartition(address indexed operator, address indexed tokenHolder, bytes32 partition, uint256 holdId, IHoldTypes.Hold hold, bytes operatorData)
```

Emitted when a protected hold authorised by an EIP-712 signature is created.

#### Parameters

| Name                  | Type            | Description                                                    |
| --------------------- | --------------- | -------------------------------------------------------------- |
| operator `indexed`    | address         | The address submitting the protected hold (signature relayer). |
| tokenHolder `indexed` | address         | The holder whose balance is being held; must match the signer. |
| partition             | bytes32         | Partition over which the hold is placed.                       |
| holdId                | uint256         | Sequence id assigned to the hold.                              |
| hold                  | IHoldTypes.Hold | The hold definition.                                           |
| operatorData          | bytes           | Operator-supplied metadata.                                    |

## Errors

### HoldExpirationNotReached

```solidity
error HoldExpirationNotReached()
```

Reverts when a reclaim is attempted before the hold&#39;s expiration timestamp.

### HoldExpirationReached

```solidity
error HoldExpirationReached()
```

Reverts when an operation requires an unexpired hold but the hold has expired.

### InsufficientHoldBalance

```solidity
error InsufficientHoldBalance(uint256 holdAmount, uint256 amount)
```

Reverts when the requested release amount exceeds the hold&#39;s remaining balance.

#### Parameters

| Name       | Type    | Description            |
| ---------- | ------- | ---------------------- |
| holdAmount | uint256 | The amount still held. |
| amount     | uint256 | The amount requested.  |

### InvalidDestinationAddress

```solidity
error InvalidDestinationAddress(address holdDestination, address to)
```

Reverts when the recipient supplied to {executeHoldByPartition} mismatches the hold.

#### Parameters

| Name            | Type    | Description                                 |
| --------------- | ------- | ------------------------------------------- |
| holdDestination | address | The recipient stored on the hold.           |
| to              | address | The recipient supplied to the execute call. |

### InvalidHoldAmount

```solidity
error InvalidHoldAmount()
```

Reverts when a hold is created with a zero or otherwise invalid amount.

### IsNotEscrow

```solidity
error IsNotEscrow()
```

Reverts when a caller that is not the recorded escrow attempts to execute the hold.

### WrongHoldId

```solidity
error WrongHoldId()
```

Reverts when the supplied hold id does not exist for the (partition, holder) pair.
