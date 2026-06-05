# VotingSecurityHoldersFacet

_Asset Tokenization Studio Team_

> VotingSecurityHoldersFacet

Diamond facet that exposes voting security-holder queries via `IVotingSecurityHolders`, registered under `RESOLVER_KEY_VOTING_SECURITY_HOLDERS`.

_Consolidates holder-enumeration methods previously part of `VotingFacet`: `getVotingHolders`, `getTotalVotingHolders`. Must be registered alongside `VotingFacet` in all token configurations that include voting functionality. Exposes 2 selectors and declares `IVotingSecurityHolders` as its interface ID._

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

### getTotalVotingHolders

```solidity
function getTotalVotingHolders(uint256 _voteID) external view returns (uint256 totalHolders_)
```

Returns the total number of token holders eligible for a voting.

_Count is taken from the snapshot at the voting record date when one exists; falls back to the live total if no snapshot has been taken. Returns zero if the record date has not yet been reached._

#### Parameters

| Name     | Type    | Description                                      |
| -------- | ------- | ------------------------------------------------ |
| \_voteID | uint256 | Identifier of the target voting (1-based index). |

#### Returns

| Name           | Type    | Description                       |
| -------------- | ------- | --------------------------------- |
| totalHolders\_ | uint256 | Total number of eligible holders. |

### getVotingHolders

```solidity
function getVotingHolders(uint256 _voteID, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] holders_)
```

Returns a paginated list of token holders eligible for a voting.

_Resolved from the snapshot at the voting record date when one exists; falls back to the live holder list if no snapshot has been taken. Returns an empty array if the record date has not yet been reached._

#### Parameters

| Name         | Type    | Description                                      |
| ------------ | ------- | ------------------------------------------------ |
| \_voteID     | uint256 | Identifier of the target voting (1-based index). |
| \_pageIndex  | uint256 | Zero-based page number for pagination.           |
| \_pageLength | uint256 | Maximum number of addresses to return per page.  |

#### Returns

| Name      | Type      | Description                                               |
| --------- | --------- | --------------------------------------------------------- |
| holders\_ | address[] | Ordered array of holder addresses for the requested page. |

### initializeVotingSecurityHolders

```solidity
function initializeVotingSecurityHolders() external nonpayable
```

Initialises the voting-security-holders capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### VotingSecurityHoldersInitialized

```solidity
event VotingSecurityHoldersInitialized()
```

Emitted once when the voting-security-holders capability is initialised on a token.

_Fires exclusively from `initializeVotingSecurityHolders`._

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
