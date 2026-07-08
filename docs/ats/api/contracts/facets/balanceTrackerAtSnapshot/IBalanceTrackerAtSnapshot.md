# IBalanceTrackerAtSnapshot

_Asset Tokenization Studio Team_

> IBalanceTrackerAtSnapshot

Interface for querying snapshotted token balances and total supply across all partitions, resolved against a previously taken snapshot identifier.

_Reads are delegated to `SnapshotsStorageWrapper` and operate on the snapshot index recorded by `takeSnapshot`. Reverts with `SnapshotIdNull` for `_snapshotID == 0` and with `SnapshotIdDoesNotExists` for unknown identifiers._

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
