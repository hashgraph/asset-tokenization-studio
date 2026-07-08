# ITransferAndLockByPartition

_Asset Tokenization Studio Team_

> ITransferAndLockByPartition

Interface for the partition-aware combined transfer-and-lock operation.

_Exposes `transferAndLockByPartition`, which atomically transfers tokens from the caller&#39;s balance on a specified partition to a recipient and records a timed lock on the recipient&#39;s resulting balance. Inherits `PartitionTransferredAndLocked` from `ITransferAndLockTypes`._

## Methods

### initializeTransferAndLockByPartition

```solidity
function initializeTransferAndLockByPartition() external nonpayable
```

Initialises the transfer-and-lock-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### transferAndLockByPartition

```solidity
function transferAndLockByPartition(bytes32 _partition, address _to, uint256 _amount, bytes _data, uint256 _expirationTimestamp) external nonpayable returns (uint256 lockId_)
```

Transfers `_amount` tokens from the caller&#39;s `_partition` balance to `_to` and locks them until `_expirationTimestamp`.

_Callers must hold `ROLE_LOCKER`. The token must be unpaused and `_expirationTimestamp` must be in the future. In single-partition mode only the default partition is permitted; protected partitions require the wildcard role. Emits `PartitionTransferredAndLocked`, `TransferByPartition` (via `ERC1410StorageWrapper`), and `Transfer` (via `ERC1410StorageWrapper`)._

#### Parameters

| Name                  | Type    | Description                                                   |
| --------------------- | ------- | ------------------------------------------------------------- |
| \_partition           | bytes32 | The partition from which tokens are transferred and locked.   |
| \_to                  | address | The recipient of the transferred and locked tokens.           |
| \_amount              | uint256 | The amount of tokens to transfer and lock.                    |
| \_data                | bytes   | Additional data forwarded to the recipient.                   |
| \_expirationTimestamp | uint256 | Unix timestamp until which the transferred tokens are locked. |

#### Returns

| Name     | Type    | Description                                                        |
| -------- | ------- | ------------------------------------------------------------------ |
| lockId\_ | uint256 | Identifier assigned to the resulting lock for `(_partition, _to)`. |

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

### TransferAndLockByPartitionInitialized

```solidity
event TransferAndLockByPartitionInitialized()
```

Emitted once when the transfer-and-lock-by-partition capability is initialised on a token.

_Fires exclusively from `initializeTransferAndLockByPartition`._
