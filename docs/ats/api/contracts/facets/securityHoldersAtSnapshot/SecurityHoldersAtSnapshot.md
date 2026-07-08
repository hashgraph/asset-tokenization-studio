# SecurityHoldersAtSnapshot

_Asset Tokenization Studio Team_

> SecurityHoldersAtSnapshot

Abstract implementation of `ISecurityHoldersAtSnapshot`.

_Delegates all storage reads to `SnapshotsStorageWrapper`. Intended to be inherited solely by `SecurityHoldersAtSnapshotFacet`._

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
