# SecurityHoldersFacet

_Asset Tokenization Studio Team_

> SecurityHoldersFacet

Diamond facet that exposes security-holder operations through the `ISecurityHolders` interface, registered under `RESOLVER_KEY_SECURITYHOLDERS`.

## Methods

### getSecurityHolders

```solidity
function getSecurityHolders(uint256 _pageIndex, uint256 _pageLength) external view returns (address[] holders)
```

Gets the security holders (paginated)

#### Parameters

| Name         | Type    | Description                   |
| ------------ | ------- | ----------------------------- |
| \_pageIndex  | uint256 | The page index for pagination |
| \_pageLength | uint256 | The number of items per page  |

#### Returns

| Name    | Type      | Description                        |
| ------- | --------- | ---------------------------------- |
| holders | address[] | Array of security holder addresses |

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

### getTotalSecurityHolders

```solidity
function getTotalSecurityHolders() external view returns (uint256 count)
```

Gets the total number of security holders

#### Returns

| Name  | Type    | Description                      |
| ----- | ------- | -------------------------------- |
| count | uint256 | Total number of security holders |

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

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.
