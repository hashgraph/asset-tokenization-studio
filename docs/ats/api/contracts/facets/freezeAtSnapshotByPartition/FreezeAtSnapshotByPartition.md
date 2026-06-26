# FreezeAtSnapshotByPartition

_Asset Tokenization Studio Team_

> FreezeAtSnapshotByPartition

Abstract implementation of `IFreezeAtSnapshotByPartition`, providing partition-aware snapshot frozen balance queries.

_Stateless wrapper that delegates the actual lookup to {SnapshotsStorageWrapper}. Intended to be inherited by `FreezeAtSnapshotByPartitionFacet`._

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

### UnrecognizedResolverProxyVersion

```solidity
error UnrecognizedResolverProxyVersion(bytes8 _resolverProxyVersion)
```

Thrown when the provided proxy version does not match any BLR compatible standard.

#### Parameters

| Name                   | Type   | Description                                        |
| ---------------------- | ------ | -------------------------------------------------- |
| \_resolverProxyVersion | bytes8 | proxy version that is not compatible with the BLR. |

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.
