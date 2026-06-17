# NominalValueAtSnapshot

_Asset Tokenization Studio Team_

> NominalValueAtSnapshot

Abstract implementation of `INominalValueAtSnapshot`.

_Delegates all storage reads to `SnapshotsStorageWrapper` and `NominalValueStorageWrapper`. Intended to be inherited solely by `NominalValueAtSnapshotFacet`._

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

## Errors

### AccountHasNoRole

```solidity
error AccountHasNoRole(address account, bytes32 role)
```

Thrown when an account does not hold a required role.

#### Parameters

| Name    | Type    | Description                      |
| ------- | ------- | -------------------------------- |
| account | address | The account that lacks the role. |
| role    | bytes32 | The role that is not held.       |

### FacetAlreadyRegistered

```solidity
error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion)
```

Raised when an initialiser tries to register a facet that already has a non-zero last registered version (i.e. the facet is being re-initialised on a fresh install).

#### Parameters

| Name        | Type    | Description                                                    |
| ----------- | ------- | -------------------------------------------------------------- |
| facetId     | bytes32 | Identifier of the offending facet.                             |
| lastVersion | uint256 | Last version recorded for that facet at the time of the check. |

### SnapshotIdDoesNotExists

```solidity
error SnapshotIdDoesNotExists(uint256 snapshotId)
```

Thrown when the requested snapshot identifier has never been taken on this token.

#### Parameters

| Name       | Type    | Description                                             |
| ---------- | ------- | ------------------------------------------------------- |
| snapshotId | uint256 | The unrecognised snapshot identifier that was supplied. |

### SnapshotIdNull

```solidity
error SnapshotIdNull()
```

Thrown when a snapshot identifier of zero is supplied; zero is reserved and never assigned to a valid snapshot.

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.
