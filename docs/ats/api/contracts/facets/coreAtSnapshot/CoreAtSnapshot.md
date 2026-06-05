# CoreAtSnapshot

_Asset Tokenization Studio Team_

> CoreAtSnapshot

Abstract implementation of `ICoreAtSnapshot` providing snapshotted core token property queries indexed by a snapshot identifier.

_Delegates storage reads to `SnapshotsStorageWrapper`. Intended to be inherited by `CoreAtSnapshotFacet`._

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
