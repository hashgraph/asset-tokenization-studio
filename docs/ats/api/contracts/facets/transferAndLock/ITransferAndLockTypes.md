# ITransferAndLockTypes

_Asset Tokenization Studio Team_

> ITransferAndLockTypes

Shared event for the TransferAndLock facet family.

_Both `ITransferAndLock` and `ITransferAndLockByPartition` inherit this interface so that `PartitionTransferredAndLocked` is available to all implementations without duplication. Mirrors the `ILockTypes` pattern._

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
