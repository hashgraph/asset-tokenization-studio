# ISecurityHolders

_Asset Tokenization Studio Team_

> ISecurityHolders

Interface for security holder operations in the ERC1410 standard

## Methods

### getSecurityHolders

```solidity
function getSecurityHolders(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] holders_)
```

Gets the security holders (paginated)

#### Parameters

| Name         | Type    | Description                   |
| ------------ | ------- | ----------------------------- |
| \_pageIndex  | uint256 | The page index for pagination |
| \_pageLength | uint256 | The number of items per page  |

#### Returns

| Name      | Type      | Description                        |
| --------- | --------- | ---------------------------------- |
| holders\_ | address[] | Array of security holder addresses |

### getTotalSecurityHolders

```solidity
function getTotalSecurityHolders() external view returns (uint256 count_)
```

Gets the total number of security holders

#### Returns

| Name    | Type    | Description                      |
| ------- | ------- | -------------------------------- |
| count\_ | uint256 | Total number of security holders |

### initializeSecurityHolders

```solidity
function initializeSecurityHolders() external nonpayable
```

Initialises the security-holders capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### SecurityHoldersInitialized

```solidity
event SecurityHoldersInitialized()
```

Emitted once when the security-holders capability is initialised on a token.

_Fires exclusively from `initializeSecurityHolders`._
