# INonces

_Asset Tokenization Studio Team_

> INonces

Interface for querying per-account nonces used in off-chain signature schemes such as EIP-2612 permit.

_Derived from OpenZeppelin&#39;s `Nonces` interface. Each nonce is a monotonically increasing counter; it is incremented internally after a valid signed operation (e.g. permit) to invalidate replay of the same signature._

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
