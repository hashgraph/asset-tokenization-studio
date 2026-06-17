# IClearingAtSnapshotByPartition

_Asset Tokenization Studio Team_

> IClearingAtSnapshotByPartition

Interface for querying the snapshotted partition-scoped cleared balance of a token holder.

_Reads are delegated to `SnapshotsStorageWrapper` and operate on the snapshot index recorded by `takeSnapshot`. Reverts with `SnapshotIdNull` for `_snapshotID == 0` and with `SnapshotIdDoesNotExists` for unknown identifiers._

## Methods

### clearedBalanceOfAtSnapshotByPartition

```solidity
function clearedBalanceOfAtSnapshotByPartition(bytes32 _partition, uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the cleared balance of a token holder for a given partition at the time of a given snapshot.

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_partition   | bytes32 | The partition identifier.                                        |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                                                      |
| --------- | ------- | -------------------------------------------------------------------------------- |
| balance\_ | uint256 | The cleared balance of `_tokenHolder` in `_partition` recorded at `_snapshotID`. |

### initializeClearingAtSnapshotByPartition

```solidity
function initializeClearingAtSnapshotByPartition() external nonpayable
```

Initialises the clearing-at-snapshot-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### ClearingAtSnapshotByPartitionInitialized

```solidity
event ClearingAtSnapshotByPartitionInitialized()
```

Emitted once when the clearing-at-snapshot-by-partition capability is initialised on a token.

_Fires exclusively from `initializeClearingAtSnapshotByPartition`._
