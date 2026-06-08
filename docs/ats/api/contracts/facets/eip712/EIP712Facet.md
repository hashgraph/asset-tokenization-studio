# EIP712Facet

_Asset Tokenization Studio Team_

> EIP712Facet

Diamond facet that exposes the EIP-712 domain separator via `IEIP712`, registered under `RESOLVER_KEY_EIP712`.

_Exposes one selector: `DOMAIN_SEPARATOR`._

## Methods

### DOMAIN_SEPARATOR

```solidity
function DOMAIN_SEPARATOR() external view returns (bytes32 domainSeparator_)
```

Returns the EIP-712 domain separator for this contract.

_Computed from the token name, resolver-proxy version, chain ID, and the diamond address. The value changes when any of those inputs change (e.g. after a chain fork or a proxy version upgrade)._

#### Returns

| Name              | Type    | Description                        |
| ----------------- | ------- | ---------------------------------- |
| domainSeparator\_ | bytes32 | The EIP-712 domain separator hash. |

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

### initializeEIP712

```solidity
function initializeEIP712() external nonpayable
```

Initialises the EIP-712 capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### EIP712Initialized

```solidity
event EIP712Initialized()
```

Emitted once when the EIP-712 capability is initialised on a token.

_Fires exclusively from `initializeEIP712`._

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
