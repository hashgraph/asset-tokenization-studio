# IEIP712

_Asset Tokenization Studio Team_

> IEIP712

Exposes the EIP-712 typed-data domain separator for this contract.

_The domain separator encodes the token name, resolver-proxy version, chain ID, and diamond address. It is consumed by off-chain signers and by permit-style operations to produce typed-data hashes that are bound to this deployment._

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
