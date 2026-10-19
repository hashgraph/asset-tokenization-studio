# IClearingAtSnapshot

_Asset Tokenization Studio Team_

> IClearingAtSnapshot

Interface for querying the snapshotted aggregate cleared balance of a token holder across all partitions.

_Reads are delegated to `SnapshotsStorageWrapper` and operate on the snapshot index recorded by `takeSnapshot`. Reverts with `SnapshotIdNull` for `_snapshotID == 0` and with `SnapshotIdDoesNotExists` for unknown identifiers._

## Methods

### clearedBalanceOfAtSnapshot

```solidity
function clearedBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the aggregate cleared balance of a token holder at the time of a given snapshot, summed across every partition.

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                                            |
| --------- | ------- | ---------------------------------------------------------------------- |
| balance\_ | uint256 | The total cleared balance of `_tokenHolder` recorded at `_snapshotID`. |

### initializeClearingAtSnapshot

```solidity
function initializeClearingAtSnapshot() external nonpayable
```

Initialises the clearing-at-snapshot capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### ClearingAtSnapshotInitialized

```solidity
event ClearingAtSnapshotInitialized()
```

Emitted once when the clearing-at-snapshot capability is initialised on a token.

_Fires exclusively from `initializeClearingAtSnapshot`._
