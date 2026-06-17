# BalanceTrackerAtSnapshot

_Asset Tokenization Studio Team_

> BalanceTrackerAtSnapshot

Abstract implementation of `IBalanceTrackerAtSnapshot` providing snapshotted balance and total-supply queries indexed by a snapshot identifier.

_Delegates storage reads to `SnapshotsStorageWrapper`. Intended to be inherited by `BalanceTrackerAtSnapshotFacet`._

## Methods

### balanceOfAtSnapshot

```solidity
function balanceOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (uint256 balance_)
```

Returns the balance of a token holder at the time of a given snapshot.

#### Parameters

| Name          | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| \_snapshotID  | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_tokenHolder | address | The address of the token holder.                                 |

#### Returns

| Name      | Type    | Description                                              |
| --------- | ------- | -------------------------------------------------------- |
| balance\_ | uint256 | The balance of `_tokenHolder` recorded at `_snapshotID`. |

### balancesOfAtSnapshot

```solidity
function balancesOfAtSnapshot(uint256 _snapshotID, uint256 _pageIndex, uint256 _pageLength) external view returns (struct HolderBalance[] balances_)
```

Returns a paginated `HolderBalance` array with account and balance at the time of a given snapshot.

#### Parameters

| Name         | Type    | Description                                                      |
| ------------ | ------- | ---------------------------------------------------------------- |
| \_snapshotID | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_pageIndex  | uint256 | Zero-based page index used to slice the holder set.              |
| \_pageLength | uint256 | Maximum number of entries returned in the page.                  |

#### Returns

| Name       | Type            | Description                                                      |
| ---------- | --------------- | ---------------------------------------------------------------- |
| balances\_ | HolderBalance[] | The page of `(holder, balance)` pairs recorded at `_snapshotID`. |

### initializeBalanceTrackerAtSnapshot

```solidity
function initializeBalanceTrackerAtSnapshot() external nonpayable
```

Initialises the snapshot balance tracker capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### totalSupplyAtSnapshot

```solidity
function totalSupplyAtSnapshot(uint256 _snapshotID) external view returns (uint256 totalSupply_)
```

Returns the total supply at the time of a given snapshot.

#### Parameters

| Name         | Type    | Description                                                      |
| ------------ | ------- | ---------------------------------------------------------------- |
| \_snapshotID | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |

#### Returns

| Name          | Type    | Description                                 |
| ------------- | ------- | ------------------------------------------- |
| totalSupply\_ | uint256 | The total supply recorded at `_snapshotID`. |

## Events

### BalanceTrackerAtSnapshotInitialized

```solidity
event BalanceTrackerAtSnapshotInitialized()
```

Emitted once when the snapshot balance tracker capability is initialised on a token.

_Fires exclusively from `initializeBalanceTrackerAtSnapshot` after the storage write succeeds._

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
