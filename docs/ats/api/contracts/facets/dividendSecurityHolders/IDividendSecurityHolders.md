# IDividendSecurityHolders

_Asset Tokenization Studio Team_

> IDividendSecurityHolders

Read-only interface exposing paginated lookups over the holders eligible for a given dividend corporate action.

_Inherits nothing — both methods return primitive types only, so no shared dividend types are referenced and the EIP-165 interfaceId stays narrow. Aggregated into the off-chain `IAsset` umbrella alongside the writer interface `IDividend`. The implementation delegates to `DividendStorageWrapper`, which sources holders from the snapshot bound to the dividend (or, when no snapshot exists yet, from the current ERC-1410 token holder registry)._

## Methods

### getDividendHolders

```solidity
function getDividendHolders(uint256 _dividendId, uint256 _pageIndex, uint256 _pageLength) external view returns (address[] holders_)
```

Returns the page of holder addresses eligible for a given dividend.

_Reverts via the `onlyMatchingActionType` modifier when `dividendId` does not resolve to a dividend corporate action. Pages past the holder count return an empty array. Before the record date is reached, the underlying storage layer returns an empty page._

#### Parameters

| Name         | Type    | Description                                                                |
| ------------ | ------- | -------------------------------------------------------------------------- |
| \_dividendId | uint256 | One-indexed dividend identifier within the dividend corporate action type. |
| \_pageIndex  | uint256 | Zero-based index of the page to retrieve.                                  |
| \_pageLength | uint256 | Maximum number of holders returned in the page.                            |

#### Returns

| Name      | Type      | Description                                               |
| --------- | --------- | --------------------------------------------------------- |
| holders\_ | address[] | Holder addresses on the requested page, in storage order. |

### getTotalDividendHolders

```solidity
function getTotalDividendHolders(uint256 _dividendId) external view returns (uint256)
```

Returns the total number of holders eligible for a given dividend.

_Reverts via the `onlyMatchingActionType` modifier when `dividendId` does not resolve to a dividend corporate action. Returns zero before the record date is reached._

#### Parameters

| Name         | Type    | Description                                                                |
| ------------ | ------- | -------------------------------------------------------------------------- |
| \_dividendId | uint256 | One-indexed dividend identifier within the dividend corporate action type. |

#### Returns

| Name | Type    | Description                       |
| ---- | ------- | --------------------------------- |
| \_0  | uint256 | Total number of eligible holders. |

### initializeDividendSecurityHolders

```solidity
function initializeDividendSecurityHolders() external nonpayable
```

Initialises the dividend security holders capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### DividendSecurityHoldersInitialized

```solidity
event DividendSecurityHoldersInitialized()
```

Emitted once when the dividend security holders capability is initialised on a token.

_Fires exclusively from `initializeDividendSecurityHolders`._
