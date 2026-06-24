# CoreAdjustedFacet

_Asset Tokenization Studio Team_

> CoreAdjustedFacet

Diamond facet for the CoreAdjusted domain. Registers the single selector that exposes time-adjusted ERC-20 decimal reads (`decimalsAt`) to the Diamond proxy.

_Implements `IStaticFunctionSelectors` so the BusinessLogicResolver can register the facet without an off-chain deployment step. The resolver key is `RESOLVER_KEY_CORE_ADJUSTED`,_

## Methods

### decimalsAt

```solidity
function decimalsAt(uint256 _timestamp) external view returns (uint8)
```

Returns the effective token decimals at the given timestamp, simulating pending scheduled balance adjustments (ABAFs) up to and including that timestamp.

_Forwards to `ERC20StorageWrapper.decimalsAdjustedAt`. No state is mutated._

#### Parameters

| Name        | Type    | Description                                                 |
| ----------- | ------- | ----------------------------------------------------------- |
| \_timestamp | uint256 | The Unix timestamp up to which pending ABAFs are simulated. |

#### Returns

| Name | Type  | Description                                                              |
| ---- | ----- | ------------------------------------------------------------------------ |
| \_0  | uint8 | The effective decimal precision of the token at the specified timestamp. |

### getStaticFunctionSelectors

```solidity
function getStaticFunctionSelectors() external pure returns (bytes4[])
```

Returns the list of function selectors provided by this facet.

#### Returns

| Name | Type     | Description                                                           |
| ---- | -------- | --------------------------------------------------------------------- |
| \_0  | bytes4[] | staticFunctionSelectors\_ Array containing the `decimalsAt` selector. |

### getStaticInterfaceIds

```solidity
function getStaticInterfaceIds() external pure returns (bytes4[])
```

Returns the list of interface identifiers supported by this facet.

#### Returns

| Name | Type     | Description                                                             |
| ---- | -------- | ----------------------------------------------------------------------- |
| \_0  | bytes4[] | staticInterfaceIds\_ Array containing the `ICoreAdjusted` interface ID. |

### getStaticResolverKey

```solidity
function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_)
```

Returns the resolver key that identifies this facet within the BusinessLogicResolver.

#### Returns

| Name                | Type    | Description                                                 |
| ------------------- | ------- | ----------------------------------------------------------- |
| staticResolverKey\_ | bytes32 | The keccak256 hash of the CoreAdjusted resolver key string. |

### initializeCoreAdjusted

```solidity
function initializeCoreAdjusted() external nonpayable
```

Initialises the core adjusted capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### CoreAdjustedInitialized

```solidity
event CoreAdjustedInitialized()
```

Emitted once when the core adjusted capability is initialised on a token.

_Fires exclusively from `initializeCoreAdjusted`._

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
