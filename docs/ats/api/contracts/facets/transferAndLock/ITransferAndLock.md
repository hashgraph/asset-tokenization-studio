# ITransferAndLock

_Asset Tokenization Studio Team_

> ITransferAndLock

Interface for transferring tokens to a recipient and immediately locking them until a specified expiration timestamp using the default partition.

## Methods

### initializeTransferAndLock

```solidity
function initializeTransferAndLock() external nonpayable
```

Initialises the transfer-and-lock capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### transferAndLock

```solidity
function transferAndLock(address _to, uint256 _amount, bytes _data, uint256 _expirationTimestamp) external nonpayable returns (uint256 lockId_)
```

Transfers tokens to a specified address and locks them until the expiration timestamp using the default partition.

#### Parameters

| Name                  | Type    | Description                                                          |
| --------------------- | ------- | -------------------------------------------------------------------- |
| \_to                  | address | The address to which tokens will be transferred and locked.          |
| \_amount              | uint256 | The amount of tokens to be transferred and locked.                   |
| \_data                | bytes   | Additional data with no specified format, sent in the call to `_to`. |
| \_expirationTimestamp | uint256 | The timestamp until which the tokens will be locked.                 |

#### Returns

| Name     | Type    | Description                                                            |
| -------- | ------- | ---------------------------------------------------------------------- |
| lockId\_ | uint256 | The identifier assigned to the new hold created for the locked tokens. |

## Events

### PartitionTransferredAndLocked

```solidity
event PartitionTransferredAndLocked(bytes32 indexed partition, address indexed from, address to, uint256 value, bytes data, uint256 expirationTimestamp, uint256 lockId)
```

Emitted when tokens are transferred to a recipient on a partition and locked until a future timestamp.

#### Parameters

| Name                | Type    | Description                                              |
| ------------------- | ------- | -------------------------------------------------------- |
| partition `indexed` | bytes32 | The partition on which the transfer and lock occurred.   |
| from `indexed`      | address | The address from which tokens were transferred.          |
| to                  | address | The address to which tokens were transferred and locked. |
| value               | uint256 | The amount of tokens transferred and locked.             |
| data                | bytes   | Additional data provided by the caller.                  |
| expirationTimestamp | uint256 | Unix timestamp at which the lock expires.                |
| lockId              | uint256 | Identifier assigned to the resulting lock.               |

### TransferAndLockInitialized

```solidity
event TransferAndLockInitialized()
```

Emitted once when the transfer-and-lock capability is initialised on a token.

_Fires exclusively from `initializeTransferAndLock`._
