# IFreezeAtSnapshotByPartition

_Asset Tokenization Studio Team_

> IFreezeAtSnapshotByPartition

Interface exposing partition-aware historical frozen-balance queries against captured snapshots.

_Read-only counterpart of `IFreezeAtSnapshot` for multi-partition mode. Returns the frozen amount on a specific partition as it was at the time the snapshot was taken, including time-based adjustments scheduled before that block._

## Methods

### frozenBalanceOfAtSnapshotByPartition

```solidity
function frozenBalanceOfAtSnapshotByPartition(bytes32 _partition, uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the frozen balance of an account for a given partition at the time of a given snapshot.

#### Parameters

| Name          | Type    | Description                                        |
| ------------- | ------- | -------------------------------------------------- |
| \_partition   | bytes32 | The partition the frozen balance is queried in.    |
| \_snapshotID  | uint256 | The identifier of the snapshot to query.           |
| \_tokenHolder | address | The address whose frozen balance is being queried. |

#### Returns

| Name      | Type    | Description                                                                     |
| --------- | ------- | ------------------------------------------------------------------------------- |
| balance\_ | uint256 | The frozen balance of `_tokenHolder` on `_partition` at snapshot `_snapshotID`. |

### initializeFreezeAtSnapshotByPartition

```solidity
function initializeFreezeAtSnapshotByPartition() external nonpayable
```

Initialises the freeze-at-snapshot-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### FreezeAtSnapshotByPartitionInitialized

```solidity
event FreezeAtSnapshotByPartitionInitialized()
```

Emitted once when the freeze-at-snapshot-by-partition capability is initialised on a token.

_Fires exclusively from `initializeFreezeAtSnapshotByPartition`._
