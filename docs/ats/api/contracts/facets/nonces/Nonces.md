# Nonces

_Asset Tokenization Studio Team_

> Nonces

Abstract contract implementing per-account nonce reads for off-chain signature schemes such as EIP-2612 permit.

_Implements `INonces`. Nonce state is stored in diamond storage via `NonceStorageWrapper`. Nonces are incremented by other facets (e.g. ERC-20 permit) after consuming a valid signature; this contract exposes only the read path. Intended to be inherited exclusively by `NoncesFacet`._

## Methods

### initializeNonces

```solidity
function initializeNonces() external nonpayable
```

Initialises the nonces capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### nonces

```solidity
function nonces(address owner) external view returns (uint256)
```

Returns the current nonce for `owner`.

#### Parameters

| Name  | Type    | Description                     |
| ----- | ------- | ------------------------------- |
| owner | address | Address whose nonce is queried. |

#### Returns

| Name | Type    | Description                      |
| ---- | ------- | -------------------------------- |
| \_0  | uint256 | Current nonce value for `owner`. |

## Events

### NoncesInitialized

```solidity
event NoncesInitialized()
```

Emitted once when the nonces capability is initialised on a token.

_Fires exclusively from `initializeNonces`._

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
