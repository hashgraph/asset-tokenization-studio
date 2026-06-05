# ICoreAtSnapshot

> ICoreAtSnapshot

Interface for querying core token properties resolved against a previously taken snapshot identifier.

_Reads are delegated to `SnapshotsStorageWrapper`. Reverts with `SnapshotIdNull` for `_snapshotID == 0` and with `SnapshotIdDoesNotExists` for unknown identifiers._

## Methods

### decimalsAtSnapshot

```solidity
function decimalsAtSnapshot(uint256 _snapshotID) external view returns (uint8 decimals_)
```

Returns the token decimals at the time of a given snapshot.

#### Parameters

| Name         | Type    | Description                                                      |
| ------------ | ------- | ---------------------------------------------------------------- |
| \_snapshotID | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |

#### Returns

| Name       | Type  | Description                                   |
| ---------- | ----- | --------------------------------------------- |
| decimals\_ | uint8 | The decimals value recorded at `_snapshotID`. |

### initializeCoreAtSnapshot

```solidity
function initializeCoreAtSnapshot() external nonpayable
```

Initialises the core at snapshot capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### CoreAtSnapshotInitialized

```solidity
event CoreAtSnapshotInitialized()
```

Emitted once when the core at snapshot capability is initialised on a token.

_Fires exclusively from `initializeCoreAtSnapshot`._
