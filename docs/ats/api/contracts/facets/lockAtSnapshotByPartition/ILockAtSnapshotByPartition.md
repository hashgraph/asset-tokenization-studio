# ILockAtSnapshotByPartition

_Asset Tokenization Studio Team_

> ILockAtSnapshotByPartition

Interface for querying a token holder&#39;s locked balance for a specific partition at the time of a previously taken snapshot.

_Reads are delegated to `SnapshotsStorageWrapper` and depend on the snapshot index recorded by `takeSnapshot`. Reverts with `SnapshotIdNull` when `_snapshotID == 0` and with `SnapshotIdDoesNotExists` for unknown identifiers._

## Methods

### initializeLockAtSnapshotByPartition

```solidity
function initializeLockAtSnapshotByPartition() external nonpayable
```

Initialises the lock-at-snapshot-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### lockedBalanceOfAtSnapshotByPartition

```solidity
function lockedBalanceOfAtSnapshotByPartition(bytes32 _partition, uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the locked balance of a token holder for a given partition at the time of a given snapshot.

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_partition   | bytes32 | The partition identifier.                                        |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                                                     |
| --------- | ------- | ------------------------------------------------------------------------------- |
| balance\_ | uint256 | The locked balance of `_tokenHolder` in `_partition` recorded at `_snapshotID`. |

## Events

### LockAtSnapshotByPartitionInitialized

```solidity
event LockAtSnapshotByPartitionInitialized()
```

Emitted once when the lock-at-snapshot-by-partition capability is initialised on a token.

_Fires exclusively from `initializeLockAtSnapshotByPartition`._
