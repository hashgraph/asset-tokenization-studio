# Principal

_Asset Tokenization Studio Team_

> Principal

Abstract implementation of `IPrincipal`, providing principal queries for security tokens.

_Stateless wrapper that delegates the actual computation to {TokenCoreOps}. Intended to be inherited by `PrincipalFacet`._

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

## Errors

### AccessControlRequired

```solidity
error AccessControlRequired(bytes32 role, address sender)
```

_Emitted when a role check fails_

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| role   | bytes32 | undefined   |
| sender | address | undefined   |

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
