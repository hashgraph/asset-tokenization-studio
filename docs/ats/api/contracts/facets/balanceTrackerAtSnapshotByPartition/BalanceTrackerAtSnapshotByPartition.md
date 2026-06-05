# BalanceTrackerAtSnapshotByPartition

_Asset Tokenization Studio Team_

> BalanceTrackerAtSnapshotByPartition

Abstract implementation of `IBalanceTrackerAtSnapshotByPartition` providing snapshotted partition-scoped balance and total-supply queries indexed by a snapshot identifier.

_Delegates storage reads to `SnapshotsStorageWrapper`. Intended to be inherited by `BalanceTrackerAtSnapshotByPartitionFacet`._

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
