# PauseOperational

_Asset Tokenization Studio Team_

> PauseOperational

Variant of Pause for proxy facets only. Identical to Pause except pause() and unpause() also require onlyOperational and onlyActivated, since token proxies (unlike direct-inheritance consumers such as DiamondCutManager) can be non-operational or deactivated. Use Pause (without these two checks) for direct-inheritance consumers that do not operate through the ResolverProxy pattern.

_Implements `IPause`. Intended to be inherited exclusively by `PauseFacet`._

## Methods

### initializePause

```solidity
function initializePause() external nonpayable
```

Initialises the pause capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### pause

```solidity
function pause() external nonpayable returns (bool success_)
```

Sets the token&#39;s internal pause flag, blocking all guarded operations.

_Requires `ROLE_PAUSER` and the token to be currently unpaused. Reverts with `IsPaused` if the token is already paused. Emits `Paused`._

#### Returns

| Name      | Type | Description                                |
| --------- | ---- | ------------------------------------------ |
| success\_ | bool | True if the token was successfully paused. |

### paused

```solidity
function paused() external view returns (bool)
```

Checks whether the token is currently paused.

_Returns `true` if the token&#39;s own pause flag is set, or if any registered external pause contract returns `true` from its `isPaused()` call (OR semantics). created to be compatible with ERC3643_

#### Returns

| Name | Type | Description                                                 |
| ---- | ---- | ----------------------------------------------------------- |
| \_0  | bool | True if the token is paused by any source, false otherwise. |

### unpause

```solidity
function unpause() external nonpayable returns (bool success_)
```

Clears the token&#39;s internal pause flag, restoring guarded operations.

_Requires `ROLE_PAUSER` and the token&#39;s internal flag to be set. Reverts with `IsUnpaused` if the internal flag is already cleared. Emits `Unpaused`. Note: if any external pause contract remains paused, `isPaused` will still return `true` after this call._

#### Returns

| Name      | Type | Description                                               |
| --------- | ---- | --------------------------------------------------------- |
| success\_ | bool | True if the internal pause flag was successfully cleared. |

## Events

### PauseInitialized

```solidity
event PauseInitialized()
```

Emitted once when the pause capability is initialised on a token.

_Fires exclusively from `initializePause`._

### Paused

```solidity
event Paused(address indexed operator)
```

Emitted when the token&#39;s internal pause flag is set to `true`.

#### Parameters

| Name               | Type    | Description                                    |
| ------------------ | ------- | ---------------------------------------------- |
| operator `indexed` | address | Address of the caller who triggered the pause. |

### Unpaused

```solidity
event Unpaused(address indexed operator)
```

Emitted when the token&#39;s internal pause flag is cleared to `false`.

#### Parameters

| Name               | Type    | Description                                      |
| ------------------ | ------- | ------------------------------------------------ |
| operator `indexed` | address | Address of the caller who triggered the unpause. |

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

### IsUnpaused

```solidity
error IsUnpaused()
```

Thrown when `unpause` is called while the token&#39;s internal pause flag is already cleared.

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
