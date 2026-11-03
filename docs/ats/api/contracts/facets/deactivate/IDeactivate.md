# IDeactivate

_Asset Tokenization Studio Team_

> IDeactivate

Interface for the irreversible deactivation flag of a security token. Once a token is deactivated, every operation guarded by the `onlyActivated` modifier reverts with `Deactivated`, effectively retiring the token from active use.

_Part of the Diamond facet system. Deactivation state is stored via `DeactivateStorageWrapper` under a dedicated storage slot. The transition `active →      deactivated` is one-way: there is no companion `reactivate` selector. `ROLE_DEACTIVATE` is required to flip the flag._

## Methods

### deactivate

```solidity
function deactivate() external nonpayable
```

Sets the token&#39;s deactivation flag, retiring the token irreversibly.

_Requires `ROLE_DEACTIVATE`, the token to be currently unpaused, and the token to be currently activated. Reverts with `AccountHasNoRole`, `IsPaused`, or `Deactivated` respectively when those preconditions fail. The state change is one-way and cannot be undone._

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

### Deactivated

```solidity
error Deactivated()
```

Thrown when an operation guarded by `onlyActivated` is attempted on a token whose deactivation flag has already been set.
