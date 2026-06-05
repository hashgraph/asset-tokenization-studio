# DeactivateFacet

_Asset Tokenization Studio Team_

> DeactivateFacet

Diamond facet that exposes the irreversible deactivation operations — `deactivate` and the `isDeactivated` query — as selectable proxy functions.

_Inherits `Deactivate` for the business logic and implements `IStaticFunctionSelectors` for the Diamond resolver pattern. The resolver key `RESOLVER_KEY_DEACTIVATE` identifies this facet within the diamond proxy._

## Methods

### deactivate

```solidity
function deactivate() external nonpayable
```

Sets the token&#39;s deactivation flag, retiring the token irreversibly.

_Composed of three preconditions: `onlyUnpaused` rejects the call when the token is paused (own flag or any external onlyOperational pause source), `onlyRole(ROLE_DEACTIVATE)` enforces caller authorisation, and `onlyActivated` makes the transition idempotent by reverting with `Deactivated` on a token that is already retired._

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

### initializeDeactivate

```solidity
function initializeDeactivate() external nonpayable
```

Initialises the deactivate capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### isDeactivated

```solidity
function isDeactivated() external view returns (bool)
```

Reports whether the token has been deactivated.

#### Returns

| Name | Type | Description                                                        |
| ---- | ---- | ------------------------------------------------------------------ |
| \_0  | bool | True if `deactivate` has previously been invoked, false otherwise. |

## Events

### DeactivateInitialized

```solidity
event DeactivateInitialized()
```

Emitted once when the deactivate capability is initialised on a token.

_Fires exclusively from `initializeDeactivate`._

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

### AssetNotOperational

```solidity
error AssetNotOperational(bytes32 configId, uint256 versionId)
```

Raised by `InitializerStorageWrapper.checkOperational` (and the related `isConfigVersionOperational` helper) when an operation is attempted on a configuration version that has not yet been marked operational.

#### Parameters

| Name      | Type    | Description                                                        |
| --------- | ------- | ------------------------------------------------------------------ |
| configId  | bytes32 | Resolver-proxy configuration whose operational status was checked. |
| versionId | uint256 | Configuration version whose operational status was checked.        |

### Deactivated

```solidity
error Deactivated()
```

Thrown when an operation guarded by `onlyActivated` is attempted on a token whose deactivation flag has already been set.

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

### IsPaused

```solidity
error IsPaused()
```

Thrown when an operation that requires the token to be unpaused is attempted while the token is paused (own flag or any external pause contract).
