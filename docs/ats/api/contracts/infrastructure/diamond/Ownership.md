# Ownership

_Asset Tokenization Studio Team_

> Ownership

Diamond facet implementing two-step ownership transfers per configuration.

_Composes {OwnershipWrapper} storage helpers with the pause gate from {Pause} so that ownership handovers are blocked while the diamond is paused. Each `configId` carries its own owner and pending owner, enabling multi-tenant configurations on a single diamond. State changes are emitted via {IOwnership} events; access is enforced by the `onlyConfigurationOwner` / `onlyConfigurationPendingOwner` modifiers inherited from {OwnershipWrapper}._

## Methods

### acceptOwnership

```solidity
function acceptOwnership(bytes32 _configId) external nonpayable
```

Finalises an ownership handover initiated by the current owner.

_Gated by {onlyUnpaused} and {onlyConfigurationPendingOwner}: only the nominated pending owner can finalise the handover, and only while the diamond is unpaused. Snapshots the outgoing owner via {\_getOwner} before overwriting it, promotes the caller to owner via {\_setOwner}, and clears the pending slot via {\_removePendingOwner}. Emits {OwnershipAccepted} with the captured previous owner and the caller as the new owner._

#### Parameters

| Name       | Type    | Description                                             |
| ---------- | ------- | ------------------------------------------------------- |
| \_configId | bytes32 | Configuration whose pending handover is being accepted. |

### getOwner

```solidity
function getOwner(bytes32 _configId) external view returns (address owner_)
```

Returns the current owner of a configuration.

#### Parameters

| Name       | Type    | Description             |
| ---------- | ------- | ----------------------- |
| \_configId | bytes32 | Configuration to query. |

#### Returns

| Name    | Type    | Description                                                                                  |
| ------- | ------- | -------------------------------------------------------------------------------------------- |
| owner\_ | address | Address that currently owns `configId`, or the zero address when no owner has been recorded. |

### getPendingOwner

```solidity
function getPendingOwner(bytes32 _configId) external view returns (address pendingOwner_)
```

Returns the pending owner of a configuration, if any.

#### Parameters

| Name       | Type    | Description             |
| ---------- | ------- | ----------------------- |
| \_configId | bytes32 | Configuration to query. |

#### Returns

| Name           | Type    | Description                                                                                         |
| -------------- | ------- | --------------------------------------------------------------------------------------------------- |
| pendingOwner\_ | address | Address currently nominated to accept ownership, or the zero address when no transfer is in flight. |

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

### transferOwnership

```solidity
function transferOwnership(bytes32 _configId, address _newOwner) external nonpayable
```

Nominates `_newOwner` as the pending owner of `_configId`.

_Gated by {onlyUnpaused}, {onlyConfigurationOwner} and {onlyCreateConfigurationRole}: only the existing owner can nominate a successor who was previously granted the ROLE_CREATE_CONFIGURATION, and only while the diamond is unpaused. Stores `_newOwner` as the pending owner without touching the current owner; finalisation happens in {acceptOwnership}. Emits {OwnershipTransfered} with the caller as the outgoing owner._

#### Parameters

| Name       | Type    | Description                                         |
| ---------- | ------- | --------------------------------------------------- |
| \_configId | bytes32 | Configuration whose ownership is being handed over. |
| \_newOwner | address | Address to record as pending owner.                 |

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

### OwnershipAccepted

```solidity
event OwnershipAccepted(bytes32 indexed configId, address previousOwner, address newOwner)
```

Emitted when the pending owner finalises the ownership handover.

_Fired by {acceptOwnership} after the configuration owner has been updated and the pending owner slot cleared._

#### Parameters

| Name               | Type    | Description                                                     |
| ------------------ | ------- | --------------------------------------------------------------- |
| configId `indexed` | bytes32 | Configuration whose ownership has changed.                      |
| previousOwner      | address | Address that previously owned the configuration.                |
| newOwner           | address | Caller that accepted ownership and now holds the configuration. |

### OwnershipTransfered

```solidity
event OwnershipTransfered(bytes32 indexed configId, address owner, address pendingOwner)
```

Emitted when the current owner nominates a new owner for a configuration.

_Fired by {transferOwnership} before the handover is accepted; the existing owner remains in control until {acceptOwnership} is invoked by `newOwner`._

#### Parameters

| Name               | Type    | Description                                         |
| ------------------ | ------- | --------------------------------------------------- |
| configId `indexed` | bytes32 | Configuration whose ownership is being transferred. |
| owner              | address | Current owner that initiated the transfer.          |
| pendingOwner       | address | Address nominated as the pending owner.             |

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

### NotOwner

```solidity
error NotOwner(bytes32 configId, address sender, address owner)
```

Raised when the caller is not the current owner of the configuration.

#### Parameters

| Name     | Type    | Description                                        |
| -------- | ------- | -------------------------------------------------- |
| configId | bytes32 | Configuration that was accessed.                   |
| sender   | address | Caller that attempted the owner-only action.       |
| owner    | address | Address currently holding ownership of `configId`. |

### NotPendingOwner

```solidity
error NotPendingOwner(bytes32 configId, address sender, address pendingOwner)
```

Raised when the caller is not the pending owner of the configuration.

#### Parameters

| Name         | Type    | Description                                                 |
| ------------ | ------- | ----------------------------------------------------------- |
| configId     | bytes32 | Configuration whose pending handover was targeted.          |
| sender       | address | Caller that attempted to accept ownership.                  |
| pendingOwner | address | Address currently nominated as pending owner of `configId`. |

### WalletRecovered

```solidity
error WalletRecovered()
```

Thrown when attempting to recover a wallet that has already been recovered.
