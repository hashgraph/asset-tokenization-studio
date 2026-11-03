# BalanceTrackerFacet

_Asset Tokenization Studio Team_

> BalanceTrackerFacet

Diamond facet that exposes token balance and total supply queries through the `IBalanceTracker` interface, registered under `RESOLVER_KEY_BALANCE_TRACKER`.

_Inherits balance logic from `BalanceTracker` and satisfies the `IStaticFunctionSelectors` contract required by the Diamond proxy for selector registration. Exposes four selectors: `initializeBalanceTracker`, `balanceOf`, `totalSupply`, and `getTotalBalanceFor`._

## Methods

### balanceOf

```solidity
function balanceOf(address _tokenHolder) external view returns (uint256)
```

Returns the total token balance of a token holder across all partitions, simulating non-triggered balance adjustments up to the current timestamp.

_Delegates to `ERC1410StorageWrapper.balanceOfAdjustedAt`. No state is mutated._

#### Parameters

| Name          | Type    | Description                      |
| ------------- | ------- | -------------------------------- |
| \_tokenHolder | address | The address of the token holder. |

#### Returns

| Name | Type    | Description                                                              |
| ---- | ------- | ------------------------------------------------------------------------ |
| \_0  | uint256 | The adjusted total balance of the token holder at the current timestamp. |

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

### getTotalBalanceFor

```solidity
function getTotalBalanceFor(address _account) external view returns (uint256)
```

Returns the total balance held by an account across all partitions, including locked tokens, held tokens, and clearing amounts, simulating non-triggered adjustments up to the current timestamp.

_Delegates to `TokenCoreOps.getTotalBalanceForAdjustedAt`. No state is mutated._

#### Parameters

| Name      | Type    | Description                 |
| --------- | ------- | --------------------------- |
| \_account | address | The address of the account. |

#### Returns

| Name | Type    | Description                                                          |
| ---- | ------- | -------------------------------------------------------------------- |
| \_0  | uint256 | The adjusted total balance for the account at the current timestamp. |

### initializeBalanceTracker

```solidity
function initializeBalanceTracker() external nonpayable
```

Initialises the balance tracker capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

Returns the total token supply across all partitions, simulating non-triggered supply adjustments up to the current timestamp.

_Delegates to `ERC1410StorageWrapper.totalSupplyAdjustedAt`. No state is mutated._

#### Returns

| Name | Type    | Description                                         |
| ---- | ------- | --------------------------------------------------- |
| \_0  | uint256 | The adjusted total supply at the current timestamp. |

## Events

### BalanceTrackerInitialized

```solidity
event BalanceTrackerInitialized()
```

Emitted once when the balance tracker capability is initialised on a token.

_Fires exclusively from `initializeBalanceTracker` after the storage write succeeds._

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
