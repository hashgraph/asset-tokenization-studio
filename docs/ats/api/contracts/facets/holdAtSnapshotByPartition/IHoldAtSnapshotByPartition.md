# IHoldAtSnapshotByPartition

_Asset Tokenization Studio Team_

> IHoldAtSnapshotByPartition

Interface for querying the snapshotted partition-scoped held balance of a token holder.

_Reads are delegated to `SnapshotsStorageWrapper` and operate on the snapshot index recorded by `takeSnapshot`. Reverts with `SnapshotIdNull` for `_snapshotID == 0` and with `SnapshotIdDoesNotExists` for unknown identifiers._

## Methods

### heldBalanceOfAtSnapshotByPartition

```solidity
function heldBalanceOfAtSnapshotByPartition(bytes32 _partition, uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the held balance of a token holder for a given partition at the time of a given snapshot.

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_partition   | bytes32 | The partition identifier.                                        |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                                                   |
| --------- | ------- | ----------------------------------------------------------------------------- |
| balance\_ | uint256 | The held balance of `_tokenHolder` in `_partition` recorded at `_snapshotID`. |

### initializeHoldAtSnapshotByPartition

```solidity
function initializeHoldAtSnapshotByPartition() external nonpayable
```

Initialises the hold-at-snapshot-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### HoldAtSnapshotByPartitionInitialized

```solidity
event HoldAtSnapshotByPartitionInitialized()
```

Emitted once when the hold-at-snapshot-by-partition capability is initialised on a token.

_Fires exclusively from `initializeHoldAtSnapshotByPartition`._
