# IPrincipal

_Asset Tokenization Studio Team_

> IPrincipal

Interface exposing principal queries for security tokens, providing the numerator and denominator required to compute a token holder&#39;s principal value.

_Read-only interface whose single function delegates to `TokenCoreOps`._

## Methods

### getPrincipalFor

```solidity
function getPrincipalFor(address _account) external view returns (struct IPrincipal.PrincipalFor principalFor_)
```

Returns the principal numerator and denominator for a given account.

#### Parameters

| Name      | Type    | Description                      |
| --------- | ------- | -------------------------------- |
| \_account | address | The address of the token holder. |

#### Returns

| Name           | Type                    | Description                                                       |
| -------------- | ----------------------- | ----------------------------------------------------------------- |
| principalFor\_ | IPrincipal.PrincipalFor | Struct containing the numerator and denominator of the principal. |

### initializePrincipal

```solidity
function initializePrincipal() external nonpayable
```

Initialises the principal capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

## Events

### PrincipalInitialized

```solidity
event PrincipalInitialized()
```

Emitted once when the principal capability is initialised on a token.

_Fires exclusively from `initializePrincipal`._
