# HoldAtSnapshotByPartition

_Asset Tokenization Studio Team_

> HoldAtSnapshotByPartition

Abstract implementation of `IHoldAtSnapshotByPartition` providing the snapshotted partition-scoped held-balance query indexed by a snapshot identifier.

_Delegates storage reads to `SnapshotsStorageWrapper`. Intended to be inherited by `HoldAtSnapshotByPartitionFacet`._

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
