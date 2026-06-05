# Pause

_Asset Tokenization Studio Team_

> Pause

Abstract contract implementing pause and unpause logic for a security token.

_Implements `IPause`. Pause state is stored via `PauseStorageWrapper`, which evaluates both the internal flag and any registered external onlyOperational pause contracts. Event emission is handled inside `PauseStorageWrapper.setPause`. Intended to be inherited exclusively by `PauseFacet`._

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
