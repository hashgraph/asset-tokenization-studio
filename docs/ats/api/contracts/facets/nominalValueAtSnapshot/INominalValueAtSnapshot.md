# INominalValueAtSnapshot

_Asset Tokenization Studio Team_

> INominalValueAtSnapshot

Interface for querying the token&#39;s nominal value and its decimals at the time of a previously taken snapshot.

_Reads are delegated to `SnapshotsStorageWrapper`, which resolves the snapshot index recorded by `takeSnapshot`. When no snapshot value is stored for the requested id, the current nominal value from `NominalValueStorageWrapper` is returned. Reverts with `SnapshotIdNull` when `_snapshotID == 0` and with `SnapshotIdDoesNotExists` for unknown identifiers._

## Methods

### initializeNominalValueAtSnapshot

```solidity
function initializeNominalValueAtSnapshot() external nonpayable
```

Initialises the nominal-value-at-snapshot capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### nominalValueAtSnapshot

```solidity
function nominalValueAtSnapshot(uint256 _snapshotID) external view returns (uint256 nominalValue_)
```

Returns the nominal value of the token at the time of a given snapshot.

_Resolved against the `nominalValueSnapshots` series; falls back to the live nominal value when the snapshot id predates any recorded change._

#### Parameters

| Name         | Type    | Description                                                      |
| ------------ | ------- | ---------------------------------------------------------------- |
| \_snapshotID | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |

#### Returns

| Name           | Type    | Description                                  |
| -------------- | ------- | -------------------------------------------- |
| nominalValue\_ | uint256 | The nominal value recorded at `_snapshotID`. |

### nominalValueDecimalsAtSnapshot

```solidity
function nominalValueDecimalsAtSnapshot(uint256 _snapshotID) external view returns (uint8 nominalValueDecimals_)
```

Returns the decimals applied to the nominal value at the time of a given snapshot.

_Resolved against the `nominalValueDecimalsSnapshots` series; falls back to the live decimals value when the snapshot id predates any recorded change._

#### Parameters

| Name         | Type    | Description                                                      |
| ------------ | ------- | ---------------------------------------------------------------- |
| \_snapshotID | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |

#### Returns

| Name                   | Type  | Description                                           |
| ---------------------- | ----- | ----------------------------------------------------- |
| nominalValueDecimals\_ | uint8 | The nominal value decimals recorded at `_snapshotID`. |

## Events

### NominalValueAtSnapshotInitialized

```solidity
event NominalValueAtSnapshotInitialized()
```

Emitted once when the nominal-value-at-snapshot capability is initialised on a token.

_Fires exclusively from `initializeNominalValueAtSnapshot`._
