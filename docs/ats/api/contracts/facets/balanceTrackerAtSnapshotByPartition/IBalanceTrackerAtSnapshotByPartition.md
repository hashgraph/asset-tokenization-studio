# IBalanceTrackerAtSnapshotByPartition

_Asset Tokenization Studio Team_

> IBalanceTrackerAtSnapshotByPartition

Interface for querying snapshotted partition-scoped token balances and total supply, resolved against a previously taken snapshot identifier.

_Reads are delegated to `SnapshotsStorageWrapper` and operate on the snapshot index recorded by `takeSnapshot`. Reverts with `SnapshotIdNull` for `_snapshotID == 0` and with `SnapshotIdDoesNotExists` for unknown identifiers._

## Methods

### balanceOfAtSnapshotByPartition

```solidity
function balanceOfAtSnapshotByPartition(bytes32 _partition, uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the balance of an account for a given partition at the time of a given snapshot.

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_partition   | bytes32 | The partition identifier.                                        |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                                              |
| --------- | ------- | ------------------------------------------------------------------------ |
| balance\_ | uint256 | The balance of `_tokenHolder` in `_partition` recorded at `_snapshotID`. |

### initializeBalanceTrackerAtSnapshotByPartition

```solidity
function initializeBalanceTrackerAtSnapshotByPartition() external nonpayable
```

Initialises the partition snapshot balance tracker capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### totalSupplyAtSnapshotByPartition

```solidity
function totalSupplyAtSnapshotByPartition(bytes32 _partition, uint256 _snapshotID) external view returns (uint256 totalSupply_)
```

Returns the total supply for a given partition at the time of a given snapshot.

#### Parameters

| Name         | Type    | Description                                                      |
| ------------ | ------- | ---------------------------------------------------------------- |
| \_partition  | bytes32 | The partition identifier.                                        |
| \_snapshotID | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |

#### Returns

| Name          | Type    | Description                                                  |
| ------------- | ------- | ------------------------------------------------------------ |
| totalSupply\_ | uint256 | The total supply for `_partition` recorded at `_snapshotID`. |

## Events

### BalanceTrackerAtSnapshotByPartitionInitialized

```solidity
event BalanceTrackerAtSnapshotByPartitionInitialized()
```

Emitted once when the partition snapshot balance tracker capability is initialised on a token.

_Fires exclusively from `initializeBalanceTrackerAtSnapshotByPartition` after the storage write succeeds._
