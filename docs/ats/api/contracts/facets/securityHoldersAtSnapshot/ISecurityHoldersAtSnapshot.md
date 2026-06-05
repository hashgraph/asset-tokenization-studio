# ISecurityHoldersAtSnapshot

_Asset Tokenization Studio Team_

> ISecurityHoldersAtSnapshot

Interface for querying the set of token holders captured at a specific snapshot.

_Both functions delegate reads to `SnapshotsStorageWrapper`. Lazy resolution applies: if no snapshot entry exists for a holder at the requested identifier, the wrapper falls back to the live ERC-1410 holder registry. Reverts with `SnapshotIdNull` when `_snapshotID == 0` and with `SnapshotIdDoesNotExists` for unknown identifiers._

## Methods

### getTokenHoldersAtSnapshot

```solidity
function getTokenHoldersAtSnapshot(uint256 _snapshotID, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] holders_)
```

Returns a paginated list of token holders recorded at the time of a given snapshot.

_Pagination is zero-indexed. An empty page (when `_pageIndex` is beyond the total holder count) returns an empty array without reverting. Reverts with `SnapshotIdNull` when `_snapshotID == 0`. Reverts with `SnapshotIdDoesNotExists` when `_snapshotID` has never been taken._

#### Parameters

| Name         | Type    | Description                                                      |
| ------------ | ------- | ---------------------------------------------------------------- |
| \_snapshotID | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |
| \_pageIndex  | uint256 | Zero-based page number.                                          |
| \_pageLength | uint256 | Maximum number of addresses to return per page.                  |

#### Returns

| Name      | Type      | Description                                                                  |
| --------- | --------- | ---------------------------------------------------------------------------- |
| holders\_ | address[] | Addresses of token holders recorded at `_snapshotID` for the requested page. |

### getTotalTokenHoldersAtSnapshot

```solidity
function getTotalTokenHoldersAtSnapshot(uint256 _snapshotID) external view returns (uint256)
```

Returns the total number of token holders recorded at the time of a given snapshot.

_Reverts with `SnapshotIdNull` when `_snapshotID == 0`. Reverts with `SnapshotIdDoesNotExists` when `_snapshotID` has never been taken._

#### Parameters

| Name         | Type    | Description                                                      |
| ------------ | ------- | ---------------------------------------------------------------- |
| \_snapshotID | uint256 | The snapshot identifier returned by a prior `takeSnapshot` call. |

#### Returns

| Name | Type    | Description                                              |
| ---- | ------- | -------------------------------------------------------- |
| \_0  | uint256 | Total number of distinct token holders at `_snapshotID`. |

### initializeSecurityHoldersAtSnapshot

```solidity
function initializeSecurityHoldersAtSnapshot() external nonpayable
```

Initialises the security-holders-at-snapshot capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### SecurityHoldersAtSnapshotInitialized

```solidity
event SecurityHoldersAtSnapshotInitialized()
```

Emitted once when the security-holders-at-snapshot capability is initialised on a token.

_Fires exclusively from `initializeSecurityHoldersAtSnapshot`._
