# IVotingSecurityHolders

_Asset Tokenization Studio Team_

> IVotingSecurityHolders

Interface for querying the set of security holders associated with a voting.

_Holder data is sourced from the snapshot taken at the voting record date when available; otherwise the current token-holder enumeration is used. Returns empty/zero when the record date has not yet been reached._

## Methods

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
