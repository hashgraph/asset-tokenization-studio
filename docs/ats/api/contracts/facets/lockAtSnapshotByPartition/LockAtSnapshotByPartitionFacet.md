# LockAtSnapshotByPartitionFacet

_Asset Tokenization Studio Team_

> LockAtSnapshotByPartitionFacet

Diamond facet that exposes the partition-scoped locked-balance-at-snapshot query via `ILockAtSnapshotByPartition`, registered under `RESOLVER_KEY_LOCK_AT_SNAPSHOT_BY_PARTITION`.

_Exposes one selector: `lockedBalanceOfAtSnapshotByPartition`. Inherits read logic from `LockAtSnapshotByPartition` and satisfies `IStaticFunctionSelectors` for Diamond proxy selector registration._

## Methods

### getStaticFunctionSelectors

```solidity
function getStaticFunctionSelectors() external pure returns (bytes4[])
```

Gets all function selectors of a facet

#### Returns

| Name | Type     | Description              |
| ---- | -------- | ------------------------ |
| \_0  | bytes4[] | Face functions selectors |

### getStaticInterfaceIds

```solidity
function getStaticInterfaceIds() external pure returns (bytes4[])
```

Gets all interfaces ids of a facet.

#### Returns

| Name | Type     | Description        |
| ---- | -------- | ------------------ |
| \_0  | bytes4[] | Face interface ids |

### getStaticResolverKey

```solidity
function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_)
```

Gets the static resolver key

#### Returns

| Name                | Type    | Description         |
| ------------------- | ------- | ------------------- |
| staticResolverKey\_ | bytes32 | Static resolver key |

### initializeLockAtSnapshotByPartition

```solidity
function initializeLockAtSnapshotByPartition() external nonpayable
```

Initialises the lock-at-snapshot-by-partition capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### lockedBalanceOfAtSnapshotByPartition

```solidity
function lockedBalanceOfAtSnapshotByPartition(bytes32 _partition, uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the locked balance of a token holder for a given partition at the time of a given snapshot.

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_partition   | bytes32 | The partition identifier.                                        |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                                                     |
| --------- | ------- | ------------------------------------------------------------------------------- |
| balance\_ | uint256 | The locked balance of `_tokenHolder` in `_partition` recorded at `_snapshotID`. |

## Events

### LockAtSnapshotByPartitionInitialized

```solidity
event LockAtSnapshotByPartitionInitialized()
```

Emitted once when the lock-at-snapshot-by-partition capability is initialised on a token.

_Fires exclusively from `initializeLockAtSnapshotByPartition`._

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
