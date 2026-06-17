# FreezeAtSnapshot

_Asset Tokenization Studio Team_

> FreezeAtSnapshot

Abstract implementation of `IFreezeAtSnapshot`, providing snapshot-aware frozen balance queries.

_Stateless wrapper that delegates the actual lookup to {SnapshotsStorageWrapper}. Intended to be inherited by `FreezeAtSnapshotFacet`._

## Methods

### frozenBalanceOfAtSnapshot

```solidity
function frozenBalanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the frozen balance of an account at the time of a given snapshot.

#### Parameters

| Name          | Type    | Description                                        |
| ------------- | ------- | -------------------------------------------------- |
| \_snapshotID  | uint256 | The identifier of the snapshot to query.           |
| \_tokenHolder | address | The address whose frozen balance is being queried. |

#### Returns

| Name      | Type    | Description                                                     |
| --------- | ------- | --------------------------------------------------------------- |
| balance\_ | uint256 | The frozen balance of `_tokenHolder` at snapshot `_snapshotID`. |

### initializeFreezeAtSnapshot

```solidity
function initializeFreezeAtSnapshot() external nonpayable
```

Initialises the freeze-at-snapshot capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### FreezeAtSnapshotInitialized

```solidity
event FreezeAtSnapshotInitialized()
```

Emitted once when the freeze-at-snapshot capability is initialised on a token.

_Fires exclusively from `initializeFreezeAtSnapshot`._

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
