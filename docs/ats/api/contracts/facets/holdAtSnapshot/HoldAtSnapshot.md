# HoldAtSnapshot

_Asset Tokenization Studio Team_

> HoldAtSnapshot

Abstract implementation of `IHoldAtSnapshot`.

_Delegates all storage reads to `SnapshotsStorageWrapper`. Intended to be inherited solely by `HoldAtSnapshotFacet`._

## Methods

### heldBalanceOfAtSnapshot

```solidity
function heldBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the held balance of a token holder at the time of a given snapshot.

_Sums all hold escrow amounts active at `_snapshotID`, adjusted for any balance-adjustment factor recorded at that snapshot timestamp._

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                                   |
| --------- | ------- | ------------------------------------------------------------- |
| balance\_ | uint256 | The held balance of `_tokenHolder` recorded at `_snapshotID`. |

### initializeHoldAtSnapshot

```solidity
function initializeHoldAtSnapshot() external nonpayable
```

Initialises the hold-at-snapshot capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### HoldAtSnapshotInitialized

```solidity
event HoldAtSnapshotInitialized()
```

Emitted once when the hold-at-snapshot capability is initialised on a token.

_Fires exclusively from `initializeHoldAtSnapshot`._

## Errors

### AccessControlRequired

```solidity
error AccessControlRequired(bytes32 role, address sender)
```

_Emitted when a role check fails_

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| role   | bytes32 | undefined   |
| sender | address | undefined   |

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
